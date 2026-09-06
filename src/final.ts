// The Final Showdown runner. Level 7, one human against Stonewall Sung-min.
//
// Same shape as showdown.ts, and a third instance of the same argument for it: a
// match is a linear script whose branches are about tokens moving between two
// ledgers, and it reads as the rules of the game when it is written as one async
// function that awaits the player.
//
// What is new here, and it is the only genuinely new mechanic in the game: a turn
// can pay the player. The three steps of the Final Showdown are scored on the
// printed card's three-column table, and the bonus column moves a token toward
// whoever earned it. Fourteen are still on the table at the start and fourteen at
// the end; a bonus is a transfer like everything else.
//
// Who decides: not this file. Sung-min rules on all three steps, in character, on
// his own behalf, because he is the person being summarized, learned from, and
// described. That is roadmap section 6 and soul.md section 6, applied in the
// direction nobody expected it to run: the party who stands to lose a token is
// the one who says whether the player earned it.
//
// Design of record: game/docs/roadmap.md section 6.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComposerState, FoulType, Message, Revision, TemplateSegment } from './types.ts';
import { BEAT_GAP, dwellMs } from './pacing.ts';
import { crowdRow } from './avatars.ts';
import { affirmStep, judgeTurn, opponentLine } from './coach.ts';
import { THIN_REPLY, tooThin } from './engine.ts';
import { markCleared, recordItem } from './storage.ts';
import { offlineRuling } from './showdown.ts';
import { RULE_LABEL, START_TOKENS, foulCost } from './content/showdown.ts';
import {
  ARGUMENT,
  BONUS,
  FINAL_COACH,
  FINAL_OPENING,
  FINAL_SLUG,
  NAUGHTY,
  STEPS,
  SUNGMIN,
  SUNGMIN_HEARD,
  SUNGMIN_MANNER,
  SUNGMIN_NOT_HEARD,
  SUNGMIN_THIN,
} from './content/final.ts';

const SPEAK_FRAME: TemplateSegment[] = [
  { text: 'The way I see it,' },
  { input: { placeholder: 'your take' } },
  { text: 'because' },
  { input: { placeholder: 'your reason' } },
  { text: '.' },
];

const SUMMARY_FRAME: TemplateSegment[] = [
  { text: 'What I heard was' },
  { input: { placeholder: 'his point, in your words' } },
  { text: ', because' },
  { input: { placeholder: 'his reason' } },
  { text: '. Did I miss anything?' },
];

export type Outcome = 'win' | 'loss' | 'draw';

export interface FinalMatch {
  messages: Message[];
  composer: ComposerState;
  phase: string;
  playerTokens: number;
  bossTokens: number;
  /** bonuses earned, over the three steps ruled so far */
  bonuses: number;
  finished: boolean;
  outcome: Outcome | null;
  waiting: boolean;
  skip: () => void;
  submit: (value: string, revisions?: Revision[]) => void;
}

export function useFinal(): FinalMatch {
  const [messages, setMessages] = useState<Message[]>([]);
  const [composer, setComposer] = useState<ComposerState>({ kind: 'locked' });
  const [phase, setPhase] = useState('Warm-up');
  const [playerTokens, setPlayerTokens] = useState(START_TOKENS);
  const [bossTokens, setBossTokens] = useState(START_TOKENS);
  const [bonuses, setBonuses] = useState(0);
  const [finished, setFinished] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [waiting, setWaiting] = useState(false);

  const uid = useRef(0);
  const skipper = useRef<(() => void) | null>(null);
  const pending = useRef<((v: { value: string; revisions: Revision[] }) => void) | null>(null);
  const started = useRef(false);
  const nonce = useRef(0);
  const purse = useRef({ player: START_TOKENS, boss: START_TOKENS });

  const push = useCallback((m: Omit<Message, 'id'>) => {
    uid.current += 1;
    const msg: Message = { ...m, id: `f${uid.current}` };
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
    };

    const coach = (text: string) => say({ lane: 'coach', text });

    const ask = (state: ComposerState) =>
      new Promise<{ value: string; revisions: Revision[] }>((resolve) => {
        if (!alive) return;
        pending.current = resolve;
        setComposer(state);
      });

    /** Nothing here creates or destroys a token, in either direction. */
    const transfer = (from: 'player' | 'boss', n: number): { moved: number; bust: boolean } => {
      const to = from === 'player' ? 'boss' : 'player';
      const moved = Math.min(n, purse.current[from]);
      purse.current[from] -= moved;
      purse.current[to] += moved;
      setPlayerTokens(purse.current.player);
      setBossTokens(purse.current.boss);
      return { moved, bust: purse.current[from] <= 0 };
    };

    let thinCount = 0;

    /**
     * One typed turn from the player, with the non-engagement gate in front of
     * it. No redo: a turn the player genuinely attempted gets one ruling and play
     * moves on (Steve, 2026-08-31). The loop is the gate, which costs nothing.
     */
    const askPlayer = async (segments: TemplateSegment[]): Promise<{ text: string; revisions: Revision[] }> => {
      for (;;) {
        nonce.current += 1;
        const answer = await ask({ kind: 'template', segments, nonce: nonce.current });
        if (!tooThin(answer.value)) return { text: answer.value, revisions: answer.revisions };
        push({ lane: 'player', text: answer.value });
        await say({
          lane: 'opponent',
          speaker: SUNGMIN,
          text: SUNGMIN_THIN[thinCount % SUNGMIN_THIN.length],
        });
        thinCount += 1;
        await coach(THIN_REPLY);
      }
    };

    const end = async (result: Outcome, why: string) => {
      await coach(why);
      await coach(
        result === 'win' ? FINAL_COACH.win : result === 'loss' ? FINAL_COACH.loss : FINAL_COACH.draw,
      );
      recordItem({
        itemId: 'l7-result',
        levelSlug: FINAL_SLUG,
        rule: 'mixed',
        answer: `${result} ${purse.current.player}-${purse.current.boss}`,
        correct: result === 'win' ? true : result === 'draw' ? null : false,
        revisions: [],
        answeredAt: new Date().toISOString(),
      });
      markCleared(FINAL_SLUG);
      setOutcome(result);
      setFinished(true);
      setComposer({ kind: 'locked' });
    };

    /**
     * An empty purse ends the match, the same way it does in Level 4. This level
     * shipped without the check and it was reachable: false calls, judged fouls,
     * and three naughty verdicts can take the player past seven, and the match
     * carried on with a 0 to 14 ledger and no bankruptcy line.
     *
     * His side is reachable too, unlike Sofia's, and only one way: the bonus
     * column. He never fouls, so nothing the player catches can drain him. Three
     * bonuses at one token each cannot empty him from seven either, so today it
     * is unreachable in practice. It is here because BONUS is a constant someone
     * will raise, and the day they do, the win has to end the match.
     */
    const bankruptCheck = async (): Promise<boolean> => {
      if (purse.current.player <= 0) {
        await end('loss', FINAL_COACH.bankrupt);
        return true;
      }
      if (purse.current.boss <= 0) {
        await end('win', FINAL_COACH.bankruptHim);
        return true;
      }
      return false;
    };

    void (async () => {
      push({ lane: 'crowd', text: crowdRow(0) });

      await coach(FINAL_OPENING.ask);
      let topic = '';
      for (;;) {
        nonce.current += 1;
        const opening = await ask({
          kind: 'free',
          placeholder: FINAL_OPENING.placeholder,
          chips: FINAL_OPENING.chips,
          nonce: nonce.current,
        });
        topic = opening.value.trim();
        if (topic.length >= 3 && /[a-z]/i.test(topic)) break;
        await coach('That is not a topic yet. Name the thing you two disagree about.');
      }
      push({ lane: 'player', text: topic });
      await coach('Good. He takes the other side of that, whichever side you are on.');

      setPhase('The argument');
      let lastPlayer = topic;
      // Two different things, and conflating them broke Step 1 on the first run:
      // lastBoss is whatever he said most recently, which is what a summarizing
      // turn is judged against, but his last line is a summary of the PLAYER's
      // view. bossPosition is his own side, and it only ever comes off a speaking
      // turn. Given the summary as his position he reads a correct Step 1 as
      // having flipped him, and charges the player for it.
      let lastBoss = '';
      let bossPosition = '';
      /** Walks his answer banks in order, so a short bank does not repeat. */
      let summaryCount = 0;

      for (const turn of ARGUMENT) {
        if (turn.intro) await coach(turn.intro);

        if (turn.actor === 'sungmin') {
          const out = await opponentLine(
            SUNGMIN,
            SUNGMIN_MANNER,
            topic,
            lastPlayer,
            turn.kind,
            // He never fouls. That is the level.
            null,
            turn.fallback ?? '',
            turn.frame,
          );
          lastBoss = out.text;
          if (turn.kind === 'speak') bossPosition = out.text;
          await say({ lane: 'opponent', speaker: SUNGMIN, text: out.text, isSpecimen: true });

          // The whistle stays live on his turns even though he never fouls, and
          // that is the lesson rather than a trap: a player who spent six levels
          // learning to catch people has to learn when not to swing. A bad call
          // costs 1, same as everywhere else.
          const callable: FoulType[] =
            turn.kind === 'summarize'
              ? ['judging', 'opinion_as_fact', 'fake_listening']
              : ['judging', 'opinion_as_fact'];
          nonce.current += 1;
          const call = await ask({
            kind: 'call',
            hint: FINAL_COACH.callAsk,
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

          recordItem({
            itemId: `${turn.id}-call`,
            levelSlug: FINAL_SLUG,
            rule: 'mixed',
            answer: called,
            correct: called === 'stand',
            revisions: [],
            answeredAt: new Date().toISOString(),
          });

          if (called === 'stand') {
            await coach(FINAL_COACH.onStand);
          } else {
            const { bust } = transfer('player', 1);
            await coach(FINAL_COACH.onFalseCall);
            if (bust && (await bankruptCheck())) return;
          }
        } else {
          const answer = await askPlayer(turn.kind === 'summarize' ? SUMMARY_FRAME : SPEAK_FRAME);
          lastPlayer = answer.text;
          push({ lane: 'player', text: answer.text });

          // Model first, phrase rules second, the same order Level 4 and the
          // live room use. Without the fallback a dead key meant the final boss
          // never charged the player for anything they said, which reads as the
          // level being broken rather than as the player being clean.
          const ruled = await judgeTurn(topic, turn.kind, answer.text, lastBoss);
          const foul = ruled ? ruled.foul : offlineRuling(turn.kind, answer.text);
          recordItem({
            itemId: turn.id,
            levelSlug: FINAL_SLUG,
            rule: 'mixed',
            answer: answer.text,
            correct: foul === null,
            revisions: answer.revisions,
            answeredAt: new Date().toISOString(),
          });

          // The summarized person answers, and answers before the coach prices
          // it (rules.md section 5). Steve, 2026-09-06: the summary question is
          // resolved by whether the other person calls a listening foul, and
          // silence means it was correct. Sung-min was silent on both paths
          // here, so the one man who is the ground truth for whether his point
          // survived never said. Only on a summarizing turn: a speaking turn
          // asks him nothing.
          //
          // Fake Listening alone picks the bank, not any foul: that is the foul
          // the frame's question is asking about. A summary that got him right
          // and then judged him is a yes from him and a charge from the coach.
          if (turn.kind === 'summarize') {
            const bank = foul === 'fake_listening' ? SUNGMIN_NOT_HEARD : SUNGMIN_HEARD;
            await say({
              lane: 'opponent',
              speaker: SUNGMIN,
              text: bank[summaryCount % bank.length],
            });
            summaryCount += 1;
          }

          if (foul) {
            const { moved, bust } = transfer('player', foulCost(foul));
            if (ruled?.text) await coach(ruled.text);
            await coach(`That is on you. ${RULE_LABEL[foul]}. ${moved} to him.`);
            if (bust && (await bankruptCheck())) return;
          } else if (ruled?.text) {
            await coach(ruled.text);
          }
        }
      }

      // The Final Showdown proper. Nothing the player types from here is judged
      // for fouls by the coach; Sung-min rules on all three, and his naughty
      // verdict is what covers a step delivered as a verdict on him.
      await coach(FINAL_COACH.turn);
      let earned = 0;

      for (const step of STEPS) {
        setPhase(step.phase);
        await coach(step.intro);
        await coach(step.bonusHint);

        const answer = await askPlayer(step.segments);
        push({ lane: 'player', text: answer.text });

        const ruling = await affirmStep(
          SUNGMIN,
          step.key,
          topic,
          bossPosition,
          answer.text,
          step.fallback,
        );
        await say({ lane: 'opponent', speaker: SUNGMIN, text: ruling.text });

        // The ledger row is written before any bankruptcy exit, so a step that
        // ended the match is still recorded as having happened.
        let busted = false;
        if (ruling.verdict === 'bonus') {
          earned += 1;
          setBonuses(earned);
          const { moved, bust } = transfer('boss', BONUS);
          await coach(FINAL_COACH.bonus(moved));
          busted = bust;
        } else if (ruling.verdict === 'naughty') {
          const { moved, bust } = transfer('player', NAUGHTY);
          await coach(FINAL_COACH.naughty(moved));
          busted = bust;
        } else {
          await coach(FINAL_COACH.rules);
        }

        recordItem({
          itemId: step.id,
          levelSlug: FINAL_SLUG,
          rule: 'mixed',
          answer: `${ruling.verdict}: ${answer.text}`,
          // A bonus is the only outcome worth calling correct. "rules" is the
          // expected result on the printed card, not a failure, so it records as
          // neither: this level is scored on generosity, and the ledger is where
          // that shows up.
          correct: ruling.verdict === 'bonus' ? true : ruling.verdict === 'naughty' ? false : null,
          revisions: answer.revisions,
          answeredAt: new Date().toISOString(),
        });

        if (busted && (await bankruptCheck())) return;
      }

      const p = purse.current.player;
      const s = purse.current.boss;
      await end(
        p > s ? 'win' : p < s ? 'loss' : 'draw',
        `${earned} of 3 bonuses. ${FINAL_COACH.ledger(p, s)}`,
      );
    })();

    return () => {
      alive = false;
      for (const t of timers) clearTimeout(t);
      timers.clear();
      skipper.current = null;
      pending.current = null;
    };
    // Runs once, on mount, like the other two match scripts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    composer,
    phase: finished ? 'Match over' : phase,
    playerTokens,
    bossTokens,
    bonuses,
    finished,
    outcome,
    waiting,
    skip,
    submit,
  };
}
