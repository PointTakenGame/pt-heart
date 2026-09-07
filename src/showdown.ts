// The live match runner. Level 4, one human against Slippery Sofia.
//
// This is a separate runner from the ladder's useGym, and deliberately so. The
// ladder walks a fixed list of authored steps; a match is a linear script whose
// content depends on what the player just typed, and whose branches are about
// money moving between two ledgers. Written as steps it becomes a state machine
// nobody can read. Written as one async function that awaits the player, it reads
// top to bottom like the rules of the game, which is what it is.
//
// Rules implemented here, from the printed deck:
//   Seven tokens each, fourteen on the table, and a foul never burns one. It moves
//   one. Judging moves two, the other two cards move one. Empty ends the match
//   immediately, whatever the round says. After three rounds, most tokens wins and
//   equal is a draw.
//   The player whistles Sofia. The coach whistles the player, because a player
//   cannot call a foul on themselves.
//
// Design of record: docs/design/2026-08-23_showdown-full-match-sofia.md (HEART-T260823-30).

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ComposerState,
  FoulType,
  Message,
  Revision,
  TemplateSegment,
} from './types.ts';
import { BEAT_GAP, dwellMs, SKIP_LATCH_MS } from './pacing.ts';
import { crowdRow } from './avatars.ts';
import { judgeTurn, opponentLine } from './coach.ts';
import { runPhraseDetectors } from './detectors.ts';
import { THIN_REPLY, tooThin } from './engine.ts';
import { markCleared, recordItem } from './storage.ts';
import {
  COACH,
  FALSE_CALL_COST,
  OPENING,
  RULE_LABEL,
  SHOWDOWN_SLUG,
  SHOWDOWN_ID,
  SOFIA_HEARD,
  SOFIA_NOT_HEARD,
  SOFIA_THIN,
  START_TOKENS,
  TURNS,
  foulCost,
  formatTokens,
  topicLabel,
  type TopicId,
  type Turn,
} from './content/showdown.ts';

const SOFIA = 'Slippery Sofia';

/** Her manner, which is all that is authored about her. Her position is not:
 *  she argues whatever the player did not. Kept to what the prompt used to
 *  carry implicitly in her name, so nothing about Level 4 changes. */
const SOFIA_MANNER = 'Pleasant, quick, and never loud. You do not insult anyone.';

/**
 * The player's turns are sentence frames, not a blank box with hints above it.
 * Steve's ruling of 2026-08-24: a hint sitting outside the box is advice, and a
 * player under pressure types past advice. Inside the box it is the turn.
 *
 * A consequence worth knowing about: because "because" is now part of the frame,
 * offlineRuling's hasWhy test can no longer fail on a summarize turn. That is
 * fine, and not a hole. The frame enforces the structure the test was policing,
 * which is a better guarantee than a regex over free text. The test stays for
 * the turns that arrive by other routes, and hasCheck still earns its keep.
 */
const SPEAK_FRAME: TemplateSegment[] = [
  { text: 'The way I see it,' },
  { input: { placeholder: 'your take' } },
  { text: 'because' },
  { input: { placeholder: 'your reason' } },
  { text: '.' },
];

const SUMMARY_FRAME: TemplateSegment[] = [
  { text: 'What I heard was' },
  { input: { placeholder: 'her point, in your words' } },
  { text: ', because' },
  { input: { placeholder: 'her reason' } },
  { text: '. Did I miss anything?' },
];

export type Outcome = 'win' | 'loss' | 'draw';

export interface Match {
  messages: Message[];
  composer: ComposerState;
  round: number;
  /** shown in the header, in place of the ladder's beat name */
  phase: string;
  playerTokens: number;
  sofiaTokens: number;
  finished: boolean;
  outcome: Outcome | null;
  waiting: boolean;
  skip: () => void;
  submit: (value: string, revisions?: Revision[]) => void;
}

/**
 * The offline ruling on the player, used when the model is unreachable.
 *
 * Speaking turns go to the phrase detectors, which cover Judging and Opinions as
 * Facts. Summarizing turns get the structural check straight off the card: a
 * summary with no because and no check is Fake Listening. There is no phrase
 * detector for that card and there should not be, because the tell is what the
 * sentence is missing, not what it contains.
 *
 * Both are deliberately reluctant. A coach with no model should under-call.
 */
export function offlineRuling(kind: 'speak' | 'summarize', text: string): FoulType | null {
  if (kind === 'summarize') {
    // The phrase detectors run first, before the structural check. A summary
    // that judges the other person is a Judging foul at two tokens, not a Fake
    // Listening foul at one, and the cheaper card does not get to absorb it
    // just because of where in the turn it happened.
    const inside = runPhraseDetectors(text, ['judging', 'opinion_as_fact']);
    if (inside) return inside.foulType;
    const hasWhy = /\b(because|since|so that|the reason)\b/i.test(text);
    const hasCheck = text.includes('?');
    return hasWhy || hasCheck ? null : 'fake_listening';
  }
  const hit = runPhraseDetectors(text, ['judging', 'opinion_as_fact']);
  return hit ? hit.foulType : null;
}

export function useShowdown(): Match {
  const [messages, setMessages] = useState<Message[]>([]);
  const [composer, setComposer] = useState<ComposerState>({ kind: 'locked' });
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('Warm-up');
  const [playerTokens, setPlayerTokens] = useState(START_TOKENS);
  const [sofiaTokens, setSofiaTokens] = useState(START_TOKENS);
  const [finished, setFinished] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [waiting, setWaiting] = useState(false);

  const uid = useRef(0);
  const skipper = useRef<(() => void) | null>(null);
  // A tap that arrived with nothing to skip, kept for the next dwell to eat.
  // Same window the ladder has (Nathan, 2026-09-05, playtest finding 11): the
  // skipper is cleared before the dwell resolves, so between one line ending and
  // the next one reaching `dwell()` there is a tick where a tap hits nothing and
  // the thread looks frozen for the rest of a long beat.
  const pendingSkip = useRef(0);
  // What the composer is showing, for `skip` to read without re-subscribing.
  const composerKind = useRef<ComposerState['kind']>('locked');
  const pending = useRef<((v: { value: string; revisions: Revision[] }) => void) | null>(null);
  const started = useRef(false);
  /** Bumped on every re-ask, so the composer remounts and clears itself. */
  const nonce = useRef(0);

  // The ledgers live in refs as well as state. State is what the header renders;
  // the refs are what the match script reads mid-turn, because a setState from
  // three lines earlier has not landed yet.
  const purse = useRef({ player: START_TOKENS, sofia: START_TOKENS });

  // Stamp the id here rather than inside the updater, for the same reason the
  // ladder does: React runs updaters later, and two messages pushed in one tick
  // would otherwise share a key and one would silently vanish.
  const push = useCallback((m: Omit<Message, 'id'>) => {
    uid.current += 1;
    const msg: Message = { ...m, id: `s${uid.current}` };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const skip = useCallback(() => {
    if (skipper.current) {
      skipper.current();
      return;
    }
    // Latch it only mid-autoplay. A tap while a composer is open is a misfire,
    // and latching it would eat the first line after the player answers.
    if (composerKind.current === 'locked') pendingSkip.current = Date.now();
  }, []);

  // `skip` runs from an event handler and must not re-subscribe on every
  // composer change, so it reads the kind off a ref.
  useEffect(() => {
    composerKind.current = composer.kind;
  }, [composer]);

  const submit = useCallback((value: string, revisions: Revision[] = []) => {
    const resolve = pending.current;
    if (!resolve) return;
    pending.current = null;
    setComposer({ kind: 'locked' });
    resolve({ value, revisions });
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Cancellation. A three round match is one long async script with a dozen
    // await points in it, and the player can press Leave at any one of them.
    // Without this flag the pending dwell timer still fires and the in-flight
    // model call still lands, both of them writing state into a component that
    // is gone. engine.ts solves the same problem the same way.
    //
    // A cancelled await never resolves, on purpose: the script parks where it
    // stands instead of running the rest of the match against dead state.
    let alive = true;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const after = (ms: number, fn: () => void) => {
      const t = setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
      return t;
    };

    const dwell = (ms: number) =>
      new Promise<void>((resolve) => {
        if (!alive) return;
        if (Date.now() - pendingSkip.current < SKIP_LATCH_MS) {
          pendingSkip.current = 0;
          resolve();
          return;
        }
        pendingSkip.current = 0;
        setWaiting(true);
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          skipper.current = null;
          if (!alive) return;
          setWaiting(false);
          resolve();
        };
        const t = after(ms, finish);
        skipper.current = () => {
          clearTimeout(t);
          timers.delete(t);
          finish();
        };
      });

    const say = async (m: Omit<Message, 'id'>) => {
      if (!alive) return;
      push(m);
      // The gap between two lines is part of the wait, not a dead zone after it.
      // It used to be a second, unskippable timer, and for those 400ms `waiting`
      // was already false: the thread ignored clicks and the drill's Next button
      // sat there captioned "go on" doing nothing. Folded into the dwell, a tap
      // is live for the whole beat and lands on the next line instead of the
      // floor. Timing for a player who never taps is unchanged.
      await dwell(dwellMs(m.text) + BEAT_GAP);
      // Then the line waits to be dismissed. Harvested from Nathan's branch,
      // where it is his ruling 1 of 2026-09-05: "Put in a next button, which
      // should go after each text blurb ... This ensures the player actually
      // reads and digests each part." Every other screen in the game already
      // works this way; the boss match was the last place a run of lines still
      // played at the player on a timer.
      //
      // The dwell stays in front of it, so a line still lands with a beat and a
      // tap on the thread still cuts that beat short. Next appears when the
      // dwell is done. A turn that ends in a real prompt is not double-gated:
      // that composer is opened by `ask`, not by `say`.
      if (!alive) return;
      await ask({ kind: 'continue', label: 'Next' });
    };

    const coach = (text: string) => say({ lane: 'coach', text });

    const ask = (state: ComposerState) =>
      new Promise<{ value: string; revisions: Revision[] }>((resolve) => {
        if (!alive) return;
        pending.current = resolve;
        setComposer(state);
      });

    /**
     * Move `n` tokens from one purse to the other and report whether that emptied
     * anybody. Fourteen tokens are on the table at the start and fourteen are on
     * the table at the end; nothing here creates or destroys one.
     */
    const transfer = (from: 'player' | 'sofia', n: number): { moved: number; bust: boolean } => {
      const to = from === 'player' ? 'sofia' : 'player';
      // A purse stops at empty. A two-token foul against a one-token purse moves
      // one, because a foul moves tokens and never burns them: fourteen are on
      // the table at the start and fourteen at the end. Without this the header
      // paints a negative number for a full beat before the bust line lands, and
      // the bust line says "you are empty" over a ledger reading -1.
      const moved = Math.min(n, purse.current[from]);
      purse.current[from] -= moved;
      purse.current[to] += moved;
      setPlayerTokens(purse.current.player);
      setSofiaTokens(purse.current.sofia);
      return { moved, bust: purse.current[from] <= 0 };
    };

    const record = (
      turn: Turn,
      suffix: string,
      rule: FoulType | 'mixed',
      answer: string,
      correct: boolean | null,
      revisions: Revision[],
    ) => {
      recordItem({
        itemId: `${turn.id}${suffix}`,
        levelId: SHOWDOWN_ID,
        levelSlug: SHOWDOWN_SLUG,
        rule,
        answer,
        correct,
        revisions,
        answeredAt: new Date().toISOString(),
      });
    };

    // How many of her fouls got past the player this round. The rulings
    // themselves land in the moment now, not at the end of the round: these are
    // training rounds, and feedback that arrives three messages after the thing
    // it is about is not attached to anything (Steve's ruling, 2026-08-24). The
    // count survives to the end of the round only so the coach knows whether to
    // say the round was clean.
    let missedCount = 0;
    /** Walks SOFIA_THIN in order, across the whole match. Never random. */
    let thinCount = 0;
    /** Same, for her answers to being summarized. */
    let summaryCount = 0;

    const end = async (result: Outcome, why: string) => {
      await coach(why);
      await coach(
        result === 'win' ? COACH.win : result === 'loss' ? COACH.loss : COACH.draw,
      );
      recordItem({
        itemId: 'l4-result',
        levelId: SHOWDOWN_ID,
        levelSlug: SHOWDOWN_SLUG,
        rule: 'mixed',
        answer: `${result} ${purse.current.player}-${purse.current.sofia}`,
        correct: result === 'win' ? true : result === 'draw' ? null : false,
        revisions: [],
        answeredAt: new Date().toISOString(),
      });
      // The match clears the level whether it was won or lost. Turning up and
      // finishing is the bar; there is no accuracy gate anywhere in this game.
      markCleared(SHOWDOWN_ID);
      setOutcome(result);
      setFinished(true);
      setComposer({ kind: 'locked' });
    };

    /** The empty-purse line is said once per match, not once per foul. */
    let saidBankrupt = false;

    /**
     * Returns true if the match ended here.
     *
     * An empty player purse does NOT end it. Steve, 2026-09-07: "player at zero
     * is out, but that's not true in the gym levels. That's true in the live
     * play." This is a gym rung, so zero costs the player the rest of the
     * ledger and nothing else, and the drill runs to its last round. The line
     * lands once, the first time they hit empty, and then play carries on.
     */
    const bankruptCheck = async (): Promise<boolean> => {
      if (purse.current.player <= 0) {
        if (!saidBankrupt) {
          saidBankrupt = true;
          await coach(COACH.bankrupt);
        }
        return false;
      }
      // Unreachable, deliberately. See the comment on COACH.bankruptHer: her
      // authored fouls cannot empty her, because knocking a boss out mid-training
      // would end the lesson early through no fault of the player.
      if (purse.current.sofia <= 0) {
        await end('win', COACH.bankruptHer);
        return true;
      }
      return false;
    };

    void (async () => {
      // The room, before anybody speaks. Steve, 2026-08-24: the boss levels
      // "should feel liek mortal kombat", and a fight happens in front of people.
      // COACH.intro used to be dumped here. It runs as the pre-room stepper now
      // (src/ui/Prefight.tsx), so the room opens on the crowd and the first ask.
      push({ lane: 'crowd', text: crowdRow(0) });

      // The opening. Sofia takes the other side of whichever topic is picked,
      // which is how this level stays politically balanced without anybody
      // authoring a position.
      //
      // A closed list of three rather than a typed topic (2026-09-06). Her
      // authored fallbacks are what a local playtest actually sees, and a line
      // written to survive any subject at all is about no subject at all. Three
      // known topics is what buys her something to say.
      await coach(OPENING.ask);
      const opening = await ask({
        kind: 'buttons',
        options: OPENING.options,
      });
      const topicId = opening.value as TopicId;
      const topic = topicLabel(topicId);
      push({ lane: 'player', text: topic });
      await coach('Good. She will take the other side of that, whichever side you are on.');

      // `lastPlayer` is what Sofia answers and summarizes. `lastSofia` is what the
      // player answers and summarizes. Round 1 opens on her, so `lastSofia` is
      // filled before anything reads it; `lastPlayer` starts as the topic itself,
      // which is the only thing she has to go on for her opening take.
      let lastPlayer = topic;
      let lastSofia = '';
      let currentRound = 0;

      for (let i = 0; i < TURNS.length; i += 1) {
        const turn = TURNS[i];

        if (turn.round !== currentRound) {
          currentRound = turn.round;
          setRound(currentRound);
          setPhase(`Round ${currentRound} of 3`);
        }

        if (turn.intro) {
          await coach(
            typeof turn.intro === 'function'
              ? turn.intro(purse.current.player, purse.current.sofia)
              : turn.intro,
          );
        }

        if (turn.actor === 'sofia') {
          // Resolved here rather than inside the content file, because a fallback
          // that plays the player back needs the sentence they just typed and the
          // content file has no way to reach it.
          const fallback =
            typeof turn.fallback === 'function'
              ? turn.fallback(lastPlayer, topicId)
              : (turn.fallback ?? '');
          const out = await opponentLine(
            SOFIA,
            SOFIA_MANNER,
            topic,
            lastPlayer,
            turn.kind,
            turn.foul,
            fallback,
          );
          lastSofia = out.text;
          await say({ lane: 'opponent', speaker: SOFIA, text: out.text, isSpecimen: true });

          // Calling a foul is pressing the card itself, not picking its name off
          // a button row (Steve's ruling of 2026-08-24). Cards that cannot apply
          // to this kind of turn grey out: Fake Listening is a summary's foul, so
          // it is not live on a speaking turn.
          const callable: FoulType[] =
            turn.kind === 'summarize'
              ? ['judging', 'opinion_as_fact', 'fake_listening']
              : ['judging', 'opinion_as_fact'];
          nonce.current += 1;
          const call = await ask({
            kind: 'call',
            hint: COACH.callAsk,
            pass: { value: 'stand', label: "I might not agree, but it's not a foul" },
            callable,
            nonce: nonce.current,
          });
          const called = call.value;
          push({
            lane: 'player',
            text: called === 'stand' ? 'Not a foul' : RULE_LABEL[called as FoulType],
            isCall: called !== 'stand',
          });

          const correct = turn.foul ? called === turn.foul : called === 'stand';
          record(turn, '-call', turn.foul ?? 'mixed', called, correct, []);

          if (turn.foul && called === turn.foul) {
            const { moved, bust } = transfer('sofia', foulCost(turn.foul));
            await coach(COACH.onHit(turn.foul, moved));
            if (bust && (await bankruptCheck())) return;
          } else if (turn.foul && called !== 'stand') {
            // Right instinct, wrong card. Nothing moves: you saw it, which is the
            // hard half. Naming it is what the next three rounds are for.
            missedCount += 1;
            await coach(COACH.onWrongCard(called as FoulType, turn.foul));
          } else if (turn.foul) {
            // A miss moves nothing. Steve, 2026-09-07, siding with Nathan
            // against the earlier ruling that charged half a token here: you
            // are charged for what you say, not for what you fail to notice.
            // She keeps the token the call would have taken off her, which is
            // the entire cost of letting it past.
            missedCount += 1;
            await coach(COACH.onMissed(turn.foul));
          } else if (called !== 'stand') {
            // A bad whistle is the only way a clean round of hers costs you
            // anything, and it is what makes round 2 expensive.
            const { bust } = transfer('player', FALSE_CALL_COST);
            await coach(COACH.onFalseCall);
            if (bust && (await bankruptCheck())) return;
          }
        } else {
          // One pass. Steve's ruling of 2026-08-31: a miss costs the point once
          // and play moves on immediately, with no second try offered. The redo
          // was teaching the wrong reflex. At a real table nobody rewinds the
          // conversation so you can deliver the summary you meant to deliver;
          // you paid for the one you actually said, and the next thing out of
          // your mouth is the only thing you get to fix.
          //
          // The loop that remains is not a retry. A non-answer is refused rather
          // than judged (Steve, 2026-08-24: the game does not move on when the
          // player does not engage), so it costs nothing, spends nothing, and
          // comes straight back to the same prompt.
          for (;;) {
            nonce.current += 1;
            const answer = await ask({
              kind: 'template',
              segments: turn.kind === 'summarize' ? SUMMARY_FRAME : SPEAK_FRAME,
              nonce: nonce.current,
            });

            const text = answer.value;

            // Nothing gets judged, no model call goes out, and no token moves.
            // Steve's ruling of 2026-08-24: the game does not move on when the
            // player does not engage. She refuses it as well as the coach, because
            // a coach-only refusal reads as a form error, and somebody across the
            // table declining to answer noise reads as the game.
            if (tooThin(text)) {
              push({ lane: 'player', text });
              await say({
                lane: 'opponent',
                speaker: SOFIA,
                text: SOFIA_THIN[thinCount % SOFIA_THIN.length],
              });
              thinCount += 1;
              await coach(THIN_REPLY);
              continue;
            }

            lastPlayer = text;
            push({ lane: 'player', text });

            // Model first, local phrase rules second. Either way the coach rules on
            // the sentence and never on who is right about the policy.
            const ruled = await judgeTurn(topic, turn.kind, text, lastSofia);
            const foul = ruled ? ruled.foul : offlineRuling(turn.kind, text);

            record(
              turn,
              '',
              turn.kind === 'summarize' ? 'fake_listening' : 'mixed',
              text,
              foul === null,
              answer.revisions,
            );

            // The person who was summarized answers, and she answers before the
            // coach prices it. rules.md §5 makes her the ground truth for Fake
            // Listening, and until now she said nothing at all: the player typed
            // "Did I miss anything?" at somebody who never replied. One verdict in
            // two voices, hers first, so the software is never seen overruling the
            // person who was actually in the room.
            // Which bank turns on Fake Listening alone, not on any foul. Steve,
            // 2026-09-06: the question the frame asks is answered by whether the
            // other person calls a LISTENING foul, so that is the only foul she
            // is answering. A summary that got him right and then judged him is
            // a yes from her and a charge from the coach, which is the honest
            // reading of both. Her no bank talks about a dropped reason, and it
            // would be plainly wrong on a Judging call.
            //
            // The Fake Listening call is a check on the SHAPE of a summary: does
            // it carry a because, does it check. A summary can have both and
            // still hand her back a reason she never gave, and that version used
            // to get a warm "yes, that is mine" out of her. Steve, 2026-09-07:
            // let her say when a summary missed her point. `carried` is the
            // model answering that one question, and it can only move her from
            // yes to no, never the other way: a Fake Listening call is hers to
            // make and the model does not get to overturn it. Null means the
            // model was not reached or did not answer, and null leaves her on
            // the behaviour above rather than putting a doubt in her mouth that
            // nobody actually raised.
            const carried = ruled?.carried ?? null;
            const heard = foul !== 'fake_listening' && carried !== false;
            if (turn.kind === 'summarize') {
              const bank = heard ? SOFIA_HEARD : SOFIA_NOT_HEARD;
              await say({
                lane: 'opponent',
                speaker: SOFIA,
                text: bank[summaryCount % bank.length],
              });
              summaryCount += 1;
            }

            if (foul) {
              const { moved, bust } = transfer('player', foulCost(foul));
              await coach(ruled?.text ?? COACH.onPlayerFoul(foul, moved));
              if (ruled) await coach(COACH.onPlayerFoul(foul, moved));
              if (bust && (await bankruptCheck())) return;
            } else if (turn.kind === 'summarize' && !heard) {
              // She just said it did not land, so the coach does not follow her
              // with "Clean." or with a line of credit for a summary she is
              // still holding at arm's length. Nothing is charged either way;
              // the price list did not move, only what gets said about it.
              await coach(COACH.onPlayerCleanNotCarried);
            } else if (ruled?.text) {
              await coach(ruled.text);
            } else {
              await coach(COACH.onPlayerClean);
            }

            break;
          }
        }

        // End of round housekeeping: report what got past the player, then the
        // ledger, so every round ends on the same two beats.
        //
        // The last round gets no ledger line. The final tally follows it
        // immediately and prints the same two numbers, so the round line only
        // reads as the game saying 7 and 7 twice in a row.
        const next = TURNS[i + 1];
        if (!next || next.round !== turn.round) {
          if (missedCount === 0) await coach(COACH.roundClean);
          missedCount = 0;
          if (next) {
            await coach(COACH.ledger(purse.current.player, purse.current.sofia));
            push({ lane: 'crowd', text: crowdRow(next.round) });
            await ask({ kind: 'continue', label: `Round ${next.round}` });
          }
        }
      }

      const p = purse.current.player;
      const s = purse.current.sofia;
      await end(
        p > s ? 'win' : p < s ? 'loss' : 'draw',
        `Three rounds. You ${formatTokens(p)}, her ${formatTokens(s)}.`,
      );
    })();

    return () => {
      alive = false;
      for (const t of timers) clearTimeout(t);
      timers.clear();
      skipper.current = null;
      pending.current = null;
    };
    // The match script runs once, on mount. There is nothing to re-run it for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    composer,
    round,
    phase: finished ? 'Match over' : phase,
    playerTokens,
    sofiaTokens,
    finished,
    outcome,
    waiting,
    skip,
    submit,
  };
}
