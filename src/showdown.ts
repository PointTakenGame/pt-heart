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
// Design of record: docs/design/2026-08-23_showdown-live-play.md (HEART-T260823-30).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComposerState, FoulType, Message, Revision } from './types.ts';
import { BEAT_GAP, dwellMs } from './pacing.ts';
import { judgeTurn, sofiaLine } from './coach.ts';
import { runPhraseDetectors } from './detectors.ts';
import { markCleared, recordItem } from './storage.ts';
import {
  COACH,
  OPENING,
  RULE_GLOSS,
  RULE_LABEL,
  SHOWDOWN_SLUG,
  START_TOKENS,
  TURNS,
  foulCost,
  type Turn,
} from './content/showdown.ts';

const SOFIA = 'Slippery Sofia';

/** The four buttons after one of her turns. Naming the card is the answer. */
const CALL_OPTIONS = [
  { value: 'judging', label: RULE_LABEL.judging },
  { value: 'opinion_as_fact', label: RULE_LABEL.opinion_as_fact },
  { value: 'fake_listening', label: RULE_LABEL.fake_listening },
  { value: 'stand', label: 'Let it stand' },
];

/**
 * The three cards, on demand, at the moment the player has to name one. Closed
 * until asked for. Levels 1 to 3 teach one card each, but a player can walk
 * straight into the showdown, and losing two tokens because you could not
 * remember which name goes with which tell teaches nothing.
 */
const CALL_HELP = {
  label: 'What are the three cards?',
  lines: (['judging', 'opinion_as_fact', 'fake_listening'] as FoulType[]).map(
    (f) => `${RULE_LABEL[f]}, worth ${foulCost(f)}: ${RULE_GLOSS[f]}.`,
  ),
};

/** Prefill for the player's summarizing turns. They never type the scaffolding. */
const SUMMARY_PREFILL = 'So what I am hearing is: it bugs you that ';
const SUMMARY_CHIPS = ['because', 'Did I get that right?', 'and the part that matters to you is'];
const SPEAK_CHIPS = ['The part I disagree with is', 'What that costs is', "What I'd rather see is"];

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
  const pending = useRef<((v: { value: string; revisions: Revision[] }) => void) | null>(null);
  const started = useRef(false);

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

  const skip = useCallback(() => skipper.current?.(), []);

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

    const dwell = (ms: number) =>
      new Promise<void>((resolve) => {
        setWaiting(true);
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          skipper.current = null;
          setWaiting(false);
          resolve();
        };
        const t = setTimeout(finish, ms);
        skipper.current = () => {
          clearTimeout(t);
          finish();
        };
      });

    const say = async (m: Omit<Message, 'id'>) => {
      push(m);
      await dwell(dwellMs(m.text));
      await new Promise((r) => setTimeout(r, BEAT_GAP));
    };

    const coach = (text: string) => say({ lane: 'coach', text });

    const ask = (state: ComposerState) =>
      new Promise<{ value: string; revisions: Revision[] }>((resolve) => {
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
        levelSlug: SHOWDOWN_SLUG,
        rule,
        answer,
        correct,
        revisions,
        answeredAt: new Date().toISOString(),
      });
    };

    // A ruling the player missed. Named at the end of the round rather than in the
    // moment, so the round keeps its tension: you find out what got past you when
    // it is too late to whistle it, which is the whole lesson.
    let missed: string[] = [];

    const end = async (result: Outcome, why: string) => {
      await coach(why);
      await coach(
        result === 'win' ? COACH.win : result === 'loss' ? COACH.loss : COACH.draw,
      );
      recordItem({
        itemId: 'l4-result',
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

    /** Returns true if the match ended here. */
    const bankruptCheck = async (): Promise<boolean> => {
      if (purse.current.player <= 0) {
        await end('loss', COACH.bankrupt);
        return true;
      }
      if (purse.current.sofia <= 0) {
        await end('win', COACH.bankruptHer);
        return true;
      }
      return false;
    };

    void (async () => {
      for (const line of COACH.intro) await coach(line);

      // The opening. Whatever the player names here is the topic, and Sofia takes
      // the other side of it, which is how this level stays politically balanced
      // without anybody authoring a position.
      await coach(OPENING.ask);
      const opening = await ask({
        kind: 'free',
        placeholder: OPENING.placeholder,
        chips: OPENING.chips,
      });
      const topic = opening.value;
      push({ lane: 'player', text: topic });
      await coach('Good. She will take the other side of that, whichever side you are on.');

      // `lastPlayer` is what Sofia answers and summarizes. `lastSofia` is what the
      // player answers and summarizes. Both start empty and are filled before
      // anything reads them, because round 1 opens on the player.
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

        if (turn.intro) await coach(turn.intro);

        if (turn.actor === 'sofia') {
          const out = await sofiaLine(topic, lastPlayer, turn.kind, turn.foul, turn.fallback ?? '');
          lastSofia = out.text;
          await say({ lane: 'opponent', speaker: SOFIA, text: out.text, isSpecimen: true });

          const call = await ask({ kind: 'buttons', options: CALL_OPTIONS, help: CALL_HELP });
          const called = call.value;
          push({
            lane: 'player',
            text: called === 'stand' ? 'Let it stand' : RULE_LABEL[called as FoulType],
          });

          const correct = turn.foul ? called === turn.foul : called === 'stand';
          record(turn, '-call', turn.foul ?? 'mixed', called, correct, []);

          if (turn.foul && called === turn.foul) {
            const { moved, bust } = transfer('sofia', foulCost(turn.foul));
            await coach(COACH.onHit(turn.foul, moved));
            if (bust && (await bankruptCheck())) return;
          } else if (turn.foul && called !== 'stand') {
            // Right instinct, wrong card. Nothing moves, and she does not get told.
            missed.push(COACH.onWrongCard(called as FoulType, turn.foul));
          } else if (turn.foul) {
            missed.push(COACH.onMissed(turn.foul));
          } else if (called !== 'stand') {
            // A bad whistle is the only way a clean round of hers costs you
            // anything, and it is what makes round 2 expensive.
            const { bust } = transfer('player', 1);
            await coach(COACH.onFalseCall);
            if (bust && (await bankruptCheck())) return;
          }
        } else {
          const answer =
            turn.kind === 'summarize'
              ? await ask({ kind: 'prefilled', prefill: SUMMARY_PREFILL, chips: SUMMARY_CHIPS })
              : await ask({
                  kind: 'free',
                  placeholder: 'say it in your own words...',
                  chips: SPEAK_CHIPS,
                });

          const text = answer.value;
          lastPlayer = text;
          push({ lane: 'player', text });

          // Model first, local phrase rules second. Either way the coach rules on
          // the sentence and never on who is right about the policy.
          const ruled = await judgeTurn(topic, turn.kind, text, lastSofia);
          const foul = ruled ? ruled.foul : offlineRuling(turn.kind, text);

          record(turn, '', turn.kind === 'summarize' ? 'fake_listening' : 'mixed', text, foul === null, answer.revisions);

          if (foul) {
            const { moved, bust } = transfer('player', foulCost(foul));
            await coach(ruled?.text ?? COACH.onPlayerFoul(foul, moved));
            if (ruled) await coach(COACH.onPlayerFoul(foul, moved));
            if (bust && (await bankruptCheck())) return;
          } else if (ruled?.text) {
            await coach(ruled.text);
          } else {
            await coach(COACH.onPlayerClean);
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
          for (const m of missed) await coach(m);
          if (missed.length === 0) await coach(COACH.roundClean);
          missed = [];
          if (next) {
            await coach(COACH.ledger(purse.current.player, purse.current.sofia));
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
