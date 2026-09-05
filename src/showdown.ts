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
import { judgeTurn, sofiaLine } from './coach.ts';
import { runPhraseDetectors } from './detectors.ts';
import { THIN_REPLY, tooThin } from './engine.ts';
import { markCleared, recordItem } from './storage.ts';
import {
  COACH,
  OPENING,
  RULE_LABEL,
  SHOWDOWN_SLUG,
  SOFIA_HEARD,
  SOFIA_NOT_HEARD,
  SOFIA_THIN,
  START_TOKENS,
  TURNS,
  foulCost,
  topicLabel,
  type TopicId,
  type Turn,
} from './content/showdown.ts';

const SOFIA = 'Slippery Sofia';

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
function offlineRuling(kind: 'speak' | 'summarize', text: string): FoulType | null {
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
  // Same latch as the gym's engine, for the same reason: `finish()` clears the
  // skipper before it resolves, so a tap landing between two turns' lines used
  // to hit nothing and the fight looked frozen for the rest of the line
  // (Nathan, 2026-09-05, playtest finding 11 — reported against L3, but the
  // Showdown runs the same Thread with the same dead tick).
  const pendingSkip = useRef(0);
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
    // Only mid-autoplay: latching a tap made while a composer is open would eat
    // the first line after the player answers.
    if (composerKind.current === 'locked') pendingSkip.current = Date.now();
  }, []);

  // `skip` is called from an event handler and must not re-subscribe on every
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
      // One dwell with the gap folded in. The gap used to be a second, bare
      // timer, and for its 400ms `waiting` was false and `skipper.current` was
      // null, so a tap in that window did nothing (playtest finding 8; the same
      // shape was in engine.ts and is fixed there too).
      await dwell(dwellMs(m.text) + BEAT_GAP);
      // Then Next. Ruling 1 (Nathan, 2026-09-05): "Put in a next button, which
      // should go after each text blurb... This ensures the player actually
      // reads and digests each part." The Showdown is one long thread with no
      // stepper in it, so a run of coach and Sofia lines used to play at the
      // player on a timer; now every line waits to be dismissed. The dwell
      // stays in front of it, so the line still lands with a beat and a tap on
      // the thread still cuts that beat short — Next appears when the dwell is
      // done, which is the same shape the gym's drill has always had.
      //
      // Turns that end in a composer are not double-gated: the composer is the
      // gate, and it is opened by `ask`, not by `say`.
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
     * Move `n` tokens from one purse to the other and report how many actually
     * moved. Fourteen tokens are on the table at the start and fourteen are on
     * the table at the end; nothing here creates or destroys one.
     */
    const transfer = (from: 'player' | 'sofia', n: number): { moved: number } => {
      const to = from === 'player' ? 'sofia' : 'player';
      // A purse stops at empty and never goes negative (Q11). A two-token foul
      // against a one-token purse moves one, because a foul moves tokens and
      // never burns them: fourteen are on the table at the start and fourteen at
      // the end. Emptying a purse ends nothing — the player keeps playing from
      // zero and can win tokens back.
      const moved = Math.min(n, purse.current[from]);
      purse.current[from] -= moved;
      purse.current[to] += moved;
      setPlayerTokens(purse.current.player);
      setSofiaTokens(purse.current.sofia);
      return { moved };
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
    /** Which of the player's three summaries of her this is. Walks
     *  SOFIA_HEARD / SOFIA_NOT_HEARD in order, same reason. */
    let summaryCount = 0;

    const end = async (result: Outcome, why: string) => {
      await coach(why);
      await coach(
        result === 'win' ? COACH.win : result === 'loss' ? COACH.loss : COACH.draw,
      );
      recordItem({
        itemId: 'l5-result',
        levelSlug: SHOWDOWN_SLUG,
        rule: 'mixed',
        answer: `${result} ${purse.current.player}-${purse.current.sofia}`,
        correct: result === 'win' ? true : result === 'draw' ? null : false,
        revisions: [],
        answeredAt: new Date().toISOString(),
      });
      // The match clears the level whether it was won or lost. Turning up and
      // finishing is the bar; there is no accuracy gate anywhere in this game.
      markCleared(SHOWDOWN_SLUG);
      setOutcome(result);
      setFinished(true);
      setComposer({ kind: 'locked' });
    };

    void (async () => {
      // The room, before anybody speaks. Steve, 2026-08-24: the boss levels
      // "should feel liek mortal kombat", and a fight happens in front of people.
      // COACH.intro used to be dumped here. It runs as the pre-room stepper now
      // (src/ui/Prefight.tsx), so the room opens on the crowd and the first ask.
      push({ lane: 'crowd', text: crowdRow(0) });

      // The opening. Three topics, pick one — not a text box (Nathan, 2026-09-05).
      // A closed list is what makes per-topic authoring possible, and the loop that
      // used to guard a typed answer for length and stray keystrokes is gone with
      // it: a button cannot be empty or a typo.
      //
      // Balance still does not depend on anybody's authored position. She argues
      // about who pays and what becomes precedent, never about which answer is
      // right, so whichever side the player takes she is across the table from it.
      await coach(OPENING.ask);
      const opening = await ask({ kind: 'buttons', options: OPENING.options });
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

        if (turn.intro)
          await coach(
            typeof turn.intro === 'function'
              ? turn.intro(purse.current.player, purse.current.sofia)
              : turn.intro,
          );

        if (turn.actor === 'sofia') {
          // A fallback may be a plain string or a function of the player's last
          // sentence and the topic; resolve it before the call, so the model path
          // and the offline path are handed the same finished line.
          const fb =
            typeof turn.fallback === 'function'
              ? turn.fallback(lastPlayer, topicId)
              : (turn.fallback ?? '');
          const out = await sofiaLine(topic, lastPlayer, turn.kind, turn.foul, fb);
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
            const { moved } = transfer('sofia', foulCost(turn.foul));
            await coach(COACH.onHit(turn.foul, moved));
          } else if (turn.foul && called !== 'stand') {
            // Right instinct, wrong card. Nothing moves: you saw it, which is the
            // hard half. Naming it is what the next three rounds are for.
            missedCount += 1;
            await coach(COACH.onWrongCard(called as FoulType, turn.foul));
          } else if (turn.foul) {
            // A miss moves nothing (Q9): she simply keeps the token your whistle
            // would have taken. Letting everything stand costs you the wins you
            // never claimed, not tokens off a still purse.
            missedCount += 1;
            await coach(COACH.onMissed(turn.foul));
          } else if (called !== 'stand') {
            // A bad whistle is the only way a clean round of hers costs you
            // anything, and it is what makes round 2 expensive.
            transfer('player', 1);
            await coach(COACH.onFalseCall);
          }
        } else {
          // A summarizing turn that carries one of the other two fouls gets ruled
          // on that card, at that card's price, and then the round moves on. The
          // summary was never delivered, and that is what it cost: one pass, no
          // redo, ever (Q6, Q12).
          //
          // Still a loop, because a non-answer is not an attempt. Thin text is
          // refused and the same frame comes straight back; a real answer runs
          // the body once and leaves.
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

            // One row in the corpus, because there is only ever one answer.
            record(
              turn,
              '',
              turn.kind === 'summarize' ? 'fake_listening' : 'mixed',
              text,
              foul === null,
              answer.revisions,
            );

            // The summary frame ends "Did I miss anything?" and until now nobody
            // answered it — the coach said "Clean." and she said nothing, which is
            // a gate with no gatekeeper. rules.md §5: the person summarized answers,
            // and that answer is the ground truth for Fake Listening. She goes
            // first and the coach prices it after, both off the same `foul`, so the
            // two can never contradict and software is never seen overruling the
            // person who was in the room (soul.md §6).
            if (turn.kind === 'summarize') {
              const bank = foul ? SOFIA_NOT_HEARD : SOFIA_HEARD;
              await say({
                lane: 'opponent',
                speaker: SOFIA,
                text: bank[summaryCount % bank.length],
              });
              summaryCount += 1;
            }

            if (foul) {
              const { moved } = transfer('player', foulCost(foul));
              await coach(ruled?.text ?? COACH.onPlayerFoul(foul, moved));
              if (ruled) await coach(COACH.onPlayerFoul(foul, moved));
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
        `Three rounds. You ${p}, her ${s}.`,
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
