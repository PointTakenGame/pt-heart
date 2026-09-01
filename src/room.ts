// The live-play runner. One human, three seats, no server.
//
// Design of record: game/docs/live-play.md (HEART-T260831-17).
//
// Two shapes, one loop, because they differ only in who is holding what:
//
//   seat 'player'   the human argues, a stranger argues the other side, and the
//                   coach holds the whistle on the human's turns while the human
//                   holds it on the stranger's.
//   seat 'referee'  two strangers argue and the human does nothing but call
//                   fouls, which is Steve's "two AI players play and they can
//                   play the referee."
//
// Neither shape needs pairing, transport, or session state, which is the whole
// reason they are the two that got built. Human against human is roadmap item 11
// and nothing here anticipates it.
//
// The one rule this file exists to respect, from soul.md section 6: no path lets
// software decide a foul happened and move a token on its own. That reads
// differently in each seat, and both readings are in here:
//
//   * The human calling a foul on a stranger IS the ruling, not a nomination.
//     They are the party who was spoken to, and the person who got hit decides.
//     There is no answer key in live play and no false-call penalty, because
//     there is nothing to be false against.
//   * The coach calling a foul on the human is only a nomination. The stranger
//     who was spoken to rules on it, in character, and declines as often as not.
//
// That asymmetry is not an oversight. It is the same rule twice, seen from the
// two seats.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComposerState, FoulType, Message, Revision, TemplateSegment } from './types.ts';
import { BEAT_GAP, dwellMs } from './pacing.ts';
import { crowdRow } from './avatars.ts';
import { affirmCall, figureLine, judgeTurn, opponentLine } from './coach.ts';
import { recordItem } from './storage.ts';
import { THIN_REPLY, tooThin } from './engine.ts';
import { offlineRuling } from './showdown.ts';
import { RULE_LABEL, START_TOKENS, foulCost, formatTokens } from './content/showdown.ts';
import {
  FALLBACK,
  ROOM_COACH,
  ROOM_SLUG,
  ROOM_THIN,
  ROUNDS,
  buildMatch,
  mirrorStance,
  stances,
  type Seat,
} from './content/room.ts';

const SPEAK_FRAME: TemplateSegment[] = [
  { text: 'The way I see it,' },
  { input: { placeholder: 'your take' } },
  { text: 'because' },
  { input: { placeholder: 'your reason' } },
  { text: '.' },
];

const SUMMARY_FRAME: TemplateSegment[] = [
  { text: 'What I heard was' },
  { input: { placeholder: 'their point, in your words' } },
  { text: ', because' },
  { input: { placeholder: 'their reason' } },
  { text: '. Did I miss anything?' },
];

export interface Person {
  name: string;
  emoji: string;
}

export interface RoomConfig {
  seat: Seat;
  topic: string;
  /** the human's own face, for the whistle bubble in referee mode */
  avatar: string;
  a: Person;
  /** referee mode only; null when the human is arguing */
  b: Person | null;
}

export type Outcome = 'win' | 'loss' | 'draw';

export interface RoomRun {
  messages: Message[];
  composer: ComposerState;
  phase: string;
  /** The near lane, the one the 'player' message lane paints into: the human in
   *  player mode, stranger A in referee mode. Not a screen position; the header
   *  paints the far purse first. */
  nearTokens: number;
  /** The far lane: the stranger in player mode, stranger B in referee mode. */
  farTokens: number;
  /** whistles blown, and how many the party who got hit agreed with */
  calls: number;
  upheld: number;
  finished: boolean;
  /** null in referee mode: the referee holds no purse and wins nothing */
  outcome: Outcome | null;
  waiting: boolean;
  skip: () => void;
  submit: (value: string, revisions?: Revision[]) => void;
}

export function useRoom(config: RoomConfig): RoomRun {
  const [messages, setMessages] = useState<Message[]>([]);
  const [composer, setComposer] = useState<ComposerState>({ kind: 'locked' });
  const [phase, setPhase] = useState('Warm-up');
  const [nearTokens, setNearTokens] = useState(START_TOKENS);
  const [farTokens, setFarTokens] = useState(START_TOKENS);
  const [calls, setCalls] = useState(0);
  const [upheld, setUpheld] = useState(0);
  const [finished, setFinished] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [waiting, setWaiting] = useState(false);

  const uid = useRef(0);
  const skipper = useRef<(() => void) | null>(null);
  const pending = useRef<((v: { value: string; revisions: Revision[] }) => void) | null>(null);
  const started = useRef(false);
  const nonce = useRef(0);
  const purse = useRef({ near: START_TOKENS, far: START_TOKENS });

  const push = useCallback((m: Omit<Message, 'id'>) => {
    uid.current += 1;
    // Stamp the id here, not inside the updater. React may run the updater after
    // a later push has already bumped the ref, and two messages that land in one
    // batch then share a key, which React resolves by dropping one of them.
    const msg: Message = { ...m, id: `v${uid.current}` };
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
      await dwell(dwellMs(m.text));
      await new Promise<void>((r) => {
        if (!alive) return;
        after(BEAT_GAP, r);
      });
    };

    const coach = (text: string) => say({ lane: 'coach', text });

    const ask = (state: ComposerState) =>
      new Promise<{ value: string; revisions: Revision[] }>((resolve) => {
        if (!alive) return;
        pending.current = resolve;
        setComposer(state);
      });

    /** Fourteen on the table at the start, fourteen at the end. */
    const transfer = (from: 'near' | 'far', n: number): { moved: number; bust: boolean } => {
      const to = from === 'near' ? 'far' : 'near';
      const moved = Math.min(n, purse.current[from]);
      purse.current[from] -= moved;
      purse.current[to] += moved;
      setNearTokens(purse.current.near);
      setFarTokens(purse.current.far);
      return { moved, bust: purse.current[from] <= 0 };
    };

    const record = (
      id: string,
      rule: FoulType | 'mixed',
      answer: string,
      correct: boolean | null,
      revisions: Revision[],
    ) => {
      recordItem({
        itemId: id,
        levelSlug: ROOM_SLUG,
        rule,
        answer,
        correct,
        revisions,
        answeredAt: new Date().toISOString(),
      });
    };

    const finish = (result: Outcome | null) => {
      setOutcome(result);
      setFinished(true);
      setComposer({ kind: 'locked' });
    };

    const callable = (kind: 'speak' | 'summarize'): FoulType[] =>
      kind === 'summarize'
        ? ['judging', 'opinion_as_fact', 'fake_listening']
        : ['judging', 'opinion_as_fact'];

    void (async () => {
      const { seat, topic, avatar, a, b } = config;
      const match = buildMatch(seat);
      const side = seat === 'referee' ? stances(topic) : null;

      push({ lane: 'crowd', text: crowdRow(0) });
      await coach(seat === 'player' ? ROOM_COACH.playerOpen : ROOM_COACH.refereeOpen);
      // Everyone can see the topic in the header; what the coach adds is who is
      // holding which end of it.
      await coach(
        seat === 'player'
          ? `${a.name} is taking the other side of that, whichever side you are on.`
          : `${a.name} and ${b?.name} have it from opposite ends. You have the whistle.`,
      );

      // What each party said most recently, which is what the next summarizing
      // turn is judged against. Level 7 got this wrong by keeping one variable
      // for two different things; two names here, on purpose.
      let lastHuman = topic;
      let lastA = '';
      let lastB = '';
      let round = 0;
      let made = 0;
      let stuck = 0;
      let thinCount = 0;

      for (let i = 0; i < match.length; i += 1) {
        const turn = match[i];
        if (turn.round !== round) {
          round = turn.round;
          setPhase(`Round ${round} of ${ROUNDS}`);
        }

        if (turn.actor === 'human') {
          // One pass. A miss costs the point once and play moves on (Steve,
          // 2026-08-31). The loop below is the non-engagement gate and not a
          // redo: a turn the human did not attempt is refused rather than
          // judged, so it costs nothing and spends no model call.
          let text = '';
          let revisions: Revision[] = [];
          for (;;) {
            nonce.current += 1;
            const answer = await ask({
              kind: 'template',
              segments: turn.kind === 'summarize' ? SUMMARY_FRAME : SPEAK_FRAME,
              nonce: nonce.current,
            });
            if (!tooThin(answer.value)) {
              text = answer.value;
              revisions = answer.revisions;
              break;
            }
            push({ lane: 'player', text: answer.value });
            await say({
              lane: 'opponent',
              speaker: a.name,
              text: ROOM_THIN[thinCount % ROOM_THIN.length],
            });
            thinCount += 1;
            await coach(THIN_REPLY);
          }

          lastHuman = text;
          push({ lane: 'player', text });

          const ruled = await judgeTurn(topic, turn.kind, text, lastA);
          const nominated = ruled ? ruled.foul : offlineRuling(turn.kind, text);

          if (nominated) {
            // A nomination, not a verdict. The stranger was the one spoken to,
            // so the stranger rules, and `scheduled` is null because live play
            // has no answer key: with no model to ask, the call is declined
            // rather than upheld on the software's own say-so.
            await coach(ROOM_COACH.nominating(RULE_LABEL[nominated]));
            const ruling = await affirmCall(a.name, text, nominated, null);
            await say({ lane: 'opponent', speaker: a.name, text: ruling.text });
            if (ruling.upheld) {
              const { moved, bust } = transfer('near', foulCost(nominated));
              await coach(ROOM_COACH.upheld(a.name, moved));
              record(turn.id, nominated, text, false, revisions);
              if (bust) {
                await coach(ROOM_COACH.bust);
                finish('loss');
                return;
              }
            } else {
              await coach(ROOM_COACH.declined(a.name));
              record(turn.id, nominated, text, null, revisions);
            }
          } else {
            await coach(ruled?.text ?? ROOM_COACH.clean);
            record(turn.id, 'mixed', text, true, revisions);
          }
          continue;
        }

        // A stranger's turn. In player mode there is one and it mirrors the
        // human; in referee mode there are two and their sides were assigned at
        // the door.
        const isA = turn.actor === 'a';
        const speaker = isA ? a : (b as Person);
        const listener = isA ? (b ?? null) : a;
        const heard = seat === 'player' ? lastHuman : isA ? lastB : lastA;
        const fallback = FALLBACK[turn.kind][turn.foul ?? 'clean'];

        const out =
          seat === 'player'
            ? await opponentLine(
                speaker.name,
                mirrorStance(topic),
                topic,
                heard,
                turn.kind,
                turn.foul,
                fallback,
              )
            : await figureLine(
                speaker.name,
                topic,
                isA ? (side as { a: string }).a : (side as { b: string }).b,
                heard,
                turn.kind,
                turn.foul,
                fallback,
              );

        if (isA) lastA = out.text;
        else lastB = out.text;

        // Stranger A sits in the near lane in referee mode, the way Ray does in
        // the gym's referee levels: the human is in the middle tonight and their
        // own face belongs on the whistle, not on a fighter.
        await say(
          seat === 'referee' && isA
            ? { lane: 'player', speaker: speaker.name, text: out.text, isTake: true, face: speaker.emoji }
            : { lane: 'opponent', speaker: speaker.name, text: out.text, isTake: true },
        );

        nonce.current += 1;
        const call = await ask({
          kind: 'call',
          hint: ROOM_COACH.yourCall,
          pass: { value: 'stand', label: "I might not agree, but it's not a foul" },
          callable: callable(turn.kind),
          nonce: nonce.current,
        });
        const called = call.value;

        push({
          lane: seat === 'referee' ? 'coach' : 'player',
          text: called === 'stand' ? ROOM_COACH.letStand : RULE_LABEL[called as FoulType],
          isCall: called !== 'stand',
          face: seat === 'referee' ? avatar : undefined,
        });

        if (called === 'stand') {
          // Nothing is scored here. There is no answer key in live play, and a
          // hold judged against the schedule would be judged against an
          // instruction the model may well have ignored.
          record(turn.id, turn.foul ?? 'mixed', 'stand', null, []);
          continue;
        }

        const foul = called as FoulType;
        made += 1;
        setCalls(made);

        if (seat === 'player') {
          // The human was the one spoken to. Their call is the ruling.
          stuck += 1;
          setUpheld(stuck);
          const { moved, bust } = transfer('far', foulCost(foul));
          await coach(`${ROOM_COACH.stands} ${formatTokens(moved)} from ${speaker.name}.`);
          record(turn.id, foul, called, null, []);
          if (bust) {
            await coach(ROOM_COACH.bustThem);
            finish('win');
            return;
          }
          continue;
        }

        // Referee mode. The human was not spoken to, so the stranger who was
        // rules on the call, and the generated schedule stands in only where
        // there is no model to ask.
        const other = listener as Person;
        const ruling = await affirmCall(other.name, out.text, foul, turn.foul);
        await say(
          isA
            ? { lane: 'opponent', speaker: other.name, text: ruling.text }
            : { lane: 'player', speaker: other.name, text: ruling.text, face: other.emoji },
        );
        record(turn.id, foul, called, ruling.upheld, []);
        if (ruling.upheld) {
          stuck += 1;
          setUpheld(stuck);
          const { moved, bust } = transfer(isA ? 'near' : 'far', foulCost(foul));
          await coach(`${ROOM_COACH.upheld(other.name, moved)}`);
          if (bust) {
            await coach(`${speaker.name} is out. That is the match.`);
            finish(null);
            return;
          }
        } else {
          await coach(ROOM_COACH.declined(other.name));
        }
      }

      await coach(ROOM_COACH.over);
      const l = purse.current.near;
      const r = purse.current.far;
      await coach(`${formatTokens(l)} to ${formatTokens(r)}.`);
      record(
        'live-result',
        'mixed',
        `${config.seat} ${l}-${r} calls ${made}/${stuck}`,
        null,
        [],
      );
      finish(config.seat === 'player' ? (l > r ? 'win' : l < r ? 'loss' : 'draw') : null);
    })();

    return () => {
      alive = false;
      for (const t of timers) clearTimeout(t);
      timers.clear();
      skipper.current = null;
      pending.current = null;
    };
    // Runs once, on mount, like every other runner in this build.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    composer,
    phase: finished ? 'Match over' : phase,
    nearTokens,
    farTokens,
    calls,
    upheld,
    finished,
    outcome,
    waiting,
    skip,
    submit,
  };
}
