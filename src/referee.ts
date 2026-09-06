// The referee-format runner. Levels 5 and 6, one human in the third seat.
//
// Same shape as showdown.ts and for the same reason: a level whose branches are
// about money moving between two ledgers reads as one async function that awaits
// the player, and reads as an unmaintainable state machine written any other way.
// What changes here is who is at the table.
//
// The human does not argue. Two AI figures do, on an authored schedule, and the
// human watches and blows the whistle. That has three consequences the code has to
// respect, all of them from soul.md section 6:
//
//   1. The referee holds no purse. Fourteen tokens are on the table and both of
//      them belong to the two people arguing, exactly as in the printed game where
//      the third seat has never had one. A missed call costs accuracy, not money.
//
//   2. A call the referee makes is a nomination, not a verdict. The figure who was
//      spoken to rules on it, on its own behalf and in character. No path here lets
//      software decide a foul happened and move a token on its own.
//
//   3. Because of (2), the authored schedule is not the answer key for whether a
//      call was good. The party who was spoken to is. The schedule is only consulted
//      where nobody was asked: a turn the referee let stand.
//
// Design of record: game/docs/roadmap.md section 6.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComposerState, FoulType, Message } from './types.ts';
import { BEAT_GAP, dwellMs } from './pacing.ts';
import { COACH_EMOJI, crowdRow } from './avatars.ts';
import { affirmCall, figureLine } from './coach.ts';
import { markCleared, recordItem } from './storage.ts';
import { RULE_LABEL, START_TOKENS, foulCost, formatTokens } from './content/showdown.ts';
import { REF_COACH, REF_PASS_MARK, type RefereeLevel } from './content/referee.ts';

export interface RefereeRun {
  messages: Message[];
  composer: ComposerState;
  phase: string;
  rayTokens: number;
  figureTokens: number;
  /** calls and holds the referee got right, over the turns judged so far */
  correct: number;
  judged: number;
  finished: boolean;
  /** null until the level is over */
  passed: boolean | null;
  waiting: boolean;
  skip: () => void;
  submit: (value: string) => void;
}

export function useReferee(level: RefereeLevel, avatar: string): RefereeRun {
  const [messages, setMessages] = useState<Message[]>([]);
  const [composer, setComposer] = useState<ComposerState>({ kind: 'locked' });
  const [phase, setPhase] = useState('Warm-up');
  const [rayTokens, setRayTokens] = useState(START_TOKENS);
  const [figureTokens, setFigureTokens] = useState(START_TOKENS);
  const [correct, setCorrect] = useState(0);
  const [judged, setJudged] = useState(0);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [waiting, setWaiting] = useState(false);

  const uid = useRef(0);
  const skipper = useRef<(() => void) | null>(null);
  const pending = useRef<((v: string) => void) | null>(null);
  const started = useRef(false);
  const nonce = useRef(0);

  // Same reason showdown.ts keeps the ledgers in a ref as well as in state: the
  // script reads them mid-turn, and a setState from three lines earlier has not
  // landed yet.
  const purse = useRef({ ray: START_TOKENS, figure: START_TOKENS });

  const push = useCallback((m: Omit<Message, 'id'>) => {
    uid.current += 1;
    const msg: Message = { ...m, id: `r${uid.current}` };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const skip = useCallback(() => skipper.current?.(), []);

  const submit = useCallback((value: string) => {
    const resolve = pending.current;
    if (!resolve) return;
    pending.current = null;
    setComposer({ kind: 'locked' });
    resolve(value);
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

    /** Ray out of the ring, in the middle, where he is not in the argument. */
    const coach = (text: string) => say({ lane: 'coach', text });

    const ask = (state: ComposerState) =>
      new Promise<string>((resolve) => {
        if (!alive) return;
        pending.current = resolve;
        setComposer(state);
      });

    /** Fourteen on the table at the start, fourteen at the end. A purse stops at
     *  empty, so a two-token foul against a one-token purse moves one. */
    const transfer = (from: 'ray' | 'figure', n: number): number => {
      const to = from === 'ray' ? 'figure' : 'ray';
      const moved = Math.min(n, purse.current[from]);
      purse.current[from] -= moved;
      purse.current[to] += moved;
      setRayTokens(purse.current.ray);
      setFigureTokens(purse.current.figure);
      return moved;
    };

    void (async () => {
      push({ lane: 'crowd', text: crowdRow(0) });
      // The topic, not the level name: the header already carries the name, and
      // the useful second line is what these two are arguing about.
      setPhase(level.topic);

      // Both sides of the argument are authored here, unlike the showdown where
      // Sofia mirrors whatever the human picked. content/referee.ts carries the
      // balancing that makes that safe.
      let lastRay = '';
      let lastFigure = '';
      let hits = 0;
      let seen = 0;

      for (let i = 0; i < level.turns.length; i += 1) {
        const turn = level.turns[i];
        if (turn.intro) await coach(turn.intro);

        const isRay = turn.actor === 'ray';
        const speaker = isRay ? REF_COACH.rayName : level.figure;
        const listener = isRay ? level.figure : REF_COACH.rayName;

        const out = await figureLine(
          speaker,
          level.topic,
          isRay ? level.rayStance : level.figureStance,
          isRay ? lastFigure : lastRay,
          turn.kind,
          turn.foul,
          turn.fallback,
          turn.frame,
        );
        if (isRay) lastRay = out.text;
        else lastFigure = out.text;

        // Ray is down in the ring on the right, in the lane the human would hold
        // if they were fighting. They are not: they are in the middle tonight.
        await say(
          isRay
            ? { lane: 'player', speaker, text: out.text, isTake: true, face: COACH_EMOJI }
            : { lane: 'opponent', speaker, text: out.text, isTake: true },
        );

        // Fake Listening is a summary's foul, so the card is dead on a speaking
        // turn. Same greying rule as the showdown.
        const callable: FoulType[] =
          turn.kind === 'summarize'
            ? ['judging', 'opinion_as_fact', 'fake_listening']
            : ['judging', 'opinion_as_fact'];
        nonce.current += 1;
        const called = await ask({
          kind: 'call',
          hint: REF_COACH.callPrompt,
          pass: { value: 'stand', label: 'Let it stand' },
          callable,
          nonce: nonce.current,
        });

        // The whistle comes from the middle, wearing the human's own face. It is
        // the one thing the referee says all night.
        push({
          lane: 'coach',
          text: called === 'stand' ? 'Let it stand' : RULE_LABEL[called as FoulType],
          isCall: called !== 'stand',
          face: avatar,
        });

        let good: boolean;
        if (called === 'stand') {
          // Nobody was asked, so this is the one place the authored schedule
          // decides. Nothing moves either way: the referee has no purse, and a
          // foul nobody stopped is a foul nobody paid for.
          good = turn.foul === null;
          await coach(good ? REF_COACH.clean : REF_COACH.missed);
        } else {
          const foul = called as FoulType;
          const ruling = await affirmCall(listener, out.text, foul, turn.foul);
          await say(
            isRay
              ? { lane: 'opponent', speaker: listener, text: ruling.text }
              : { lane: 'player', speaker: listener, text: ruling.text, face: COACH_EMOJI },
          );
          good = ruling.upheld;
          if (ruling.upheld) {
            const moved = transfer(isRay ? 'ray' : 'figure', foulCost(foul));
            await coach(
              `${REF_COACH.upheld(listener)} ${formatTokens(moved)} from ${speaker}.`,
            );
          } else {
            await coach(REF_COACH.declined(listener));
          }
        }

        hits += good ? 1 : 0;
        seen += 1;
        setCorrect(hits);
        setJudged(seen);

        recordItem({
          itemId: turn.id,
          levelSlug: level.slug,
          rule: turn.foul ?? level.rule,
          answer: called,
          correct: good,
          revisions: [],
          answeredAt: new Date().toISOString(),
        });
      }

      await coach(level.outro);
      const rate = seen === 0 ? 0 : hits / seen;
      await coach(`${hits} of ${seen} calls. The tokens ended ${formatTokens(purse.current.ray)} to ${formatTokens(purse.current.figure)}.`);

      recordItem({
        itemId: `${level.slug}-result`,
        levelSlug: level.slug,
        rule: 'mixed',
        answer: `${hits}/${seen}`,
        correct: rate >= REF_PASS_MARK,
        revisions: [],
        answeredAt: new Date().toISOString(),
      });
      // Cleared for finishing it, not for scoring well. There is no accuracy gate
      // anywhere in this game and this is not the place to introduce one; the
      // pass mark is something the coach says out loud, not a locked door.
      markCleared(level.slug);
      setPassed(rate >= REF_PASS_MARK);
      setFinished(true);
      setComposer({ kind: 'locked' });
    })();

    return () => {
      alive = false;
      for (const t of timers) clearTimeout(t);
      timers.clear();
      skipper.current = null;
      pending.current = null;
    };
    // Runs once, on mount, like the match script. Nothing re-runs it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    composer,
    phase: finished ? 'Level over' : phase,
    rayTokens,
    figureTokens,
    correct,
    judged,
    finished,
    passed,
    waiting,
    skip,
    submit,
  };
}
