// The beat runner. Walks a level's steps, emits messages into one thread, and
// opens the composer when a step needs the player.
//
// Pacing: a message dwells for 22ms per character, floored at 600ms and capped at
// 2500ms, then the next one lands 400ms later. A tap anywhere skips the current
// dwell, so a fast reader never waits and a slow one never gets buried.
//
// There is no accuracy gate. Every answer advances. Completing the authored steps
// clears the level whether the player got everything right or everything wrong.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComposerState, Message, Revision, Step } from './types.ts';
import type { LevelDef } from './types.ts';
import { judgeEdit, restate } from './coach.ts';
import { markCleared, recordItem } from './storage.ts';

const BEAT_GAP = 400;

function dwellMs(text: string): number {
  return Math.min(2500, Math.max(600, 22 * text.length));
}

function isItem(step: Step): boolean {
  return (
    step.kind === 'call_or_pass' ||
    step.kind === 'sort' ||
    step.kind === 'edit' ||
    step.kind === 'free'
  );
}

export interface Gym {
  messages: Message[];
  composer: ComposerState;
  beatName: string;
  beatIndex: number;
  beatCount: number;
  itemsDone: number;
  itemsTotal: number;
  finished: boolean;
  /** true while a message is dwelling, so the thread can offer tap-to-skip */
  waiting: boolean;
  skip: () => void;
  /** button value, or the text the player sent */
  submit: (value: string, revisions?: Revision[]) => void;
}

export function useGym(level: LevelDef): Gym {
  const [messages, setMessages] = useState<Message[]>([]);
  const [composer, setComposer] = useState<ComposerState>({ kind: 'locked' });
  const [cursor, setCursor] = useState(0);
  const [itemsDone, setItemsDone] = useState(0);
  const [finished, setFinished] = useState(false);
  const [waiting, setWaiting] = useState(false);

  // flat walk over (beat, step), so a beat boundary is just a step whose beat
  // index differs from the previous one.
  const flat = useRef<{ beat: number; step: Step }[]>([]);
  if (flat.current.length === 0 || flat.current[0]?.step !== level.beats[0]?.steps[0]) {
    flat.current = level.beats.flatMap((b, bi) => b.steps.map((step) => ({ beat: bi, step })));
  }
  const seq = flat.current;

  const itemsTotal = seq.filter((s) => isItem(s.step)).length;
  const beatIndex = seq[Math.min(cursor, seq.length - 1)]?.beat ?? 0;
  const beatName = level.beats[beatIndex]?.name ?? '';

  const captured = useRef<Record<string, string>>({});
  const skipper = useRef<(() => void) | null>(null);
  const uid = useRef(0);

  // Stamp the id here, not inside the updater. React runs updaters later, so a
  // lazily-read uid.current gives two messages pushed in the same tick the same
  // key, and React then silently drops one of them from the thread.
  const push = useCallback((m: Omit<Message, 'id'>) => {
    uid.current += 1;
    const msg: Message = { ...m, id: `m${uid.current}` };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const skip = useCallback(() => {
    skipper.current?.();
  }, []);

  /** dwell for `ms`, or until the player taps. Resolves false if unmounted. */
  const dwell = useCallback((ms: number, alive: () => boolean) => {
    return new Promise<void>((resolve) => {
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
      // guards against a step advancing after the level unmounts
      if (!alive()) finish();
    });
  }, []);

  const say = useCallback(
    async (m: Omit<Message, 'id'>, alive: () => boolean) => {
      push(m);
      await dwell(dwellMs(m.text), alive);
      if (alive()) await new Promise((r) => setTimeout(r, BEAT_GAP));
    },
    [push, dwell],
  );

  // Run the step under the cursor. Scripted steps advance themselves; interactive
  // ones open the composer and wait for submit().
  useEffect(() => {
    let alive = true;
    const aliveFn = () => alive;
    const entry = seq[cursor];

    if (!entry) {
      if (!finished) {
        markCleared(level.slug);
        setFinished(true);
        setComposer({ kind: 'locked' });
      }
      return;
    }

    const step = entry.step;

    (async () => {
      switch (step.kind) {
        case 'say':
          setComposer({ kind: 'locked' });
          await say(
            { lane: step.lane, speaker: step.speaker, text: step.text, isSpecimen: step.isSpecimen },
            aliveFn,
          );
          if (alive) setCursor((c) => c + 1);
          return;

        case 'model': {
          setComposer({ kind: 'locked' });
          await say({ lane: 'coach', text: step.lead }, aliveFn);
          if (!alive) return;
          const src = captured.current[step.from] ?? '';
          const out = await restate(step.task, src, step.fallback);
          if (!alive) return;
          await say({ lane: 'coach', text: out.text, isSpecimen: true }, aliveFn);
          if (alive) setCursor((c) => c + 1);
          return;
        }

        case 'call_or_pass':
          await say(
            { lane: step.lane, speaker: step.speaker, text: step.line, isSpecimen: true },
            aliveFn,
          );
          if (!alive) return;
          setComposer({
            kind: 'buttons',
            options: [
              { value: 'foul', label: 'Foul' },
              { value: 'clean', label: 'Clean' },
            ],
          });
          return;

        case 'sort':
          await say({ lane: 'coach', text: step.line, isSpecimen: true }, aliveFn);
          if (!alive) return;
          setComposer({ kind: 'buttons', options: step.options });
          return;

        case 'edit':
          await say({ lane: 'coach', text: step.ask }, aliveFn);
          if (!alive) return;
          setComposer({ kind: 'prefilled', prefill: step.prefill, chips: step.chips });
          return;

        case 'free':
          if (step.ask) {
            await say({ lane: 'coach', text: step.ask }, aliveFn);
            if (!alive) return;
          }
          setComposer({ kind: 'free', placeholder: step.placeholder, chips: step.chips });
          return;

        case 'continue':
          setComposer({ kind: 'continue', label: step.label });
          return;
      }
    })();

    return () => {
      alive = false;
      skipper.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, level.slug]);

  const submit = useCallback(
    (value: string, revisions: Revision[] = []) => {
      const entry = seq[cursor];
      if (!entry) return;
      const step = entry.step;
      const advance = () => setCursor((c) => c + 1);

      const store = (correct: boolean | null) => {
        if (!isItem(step)) return;
        recordItem({
          itemId: (step as { id: string }).id,
          levelSlug: level.slug,
          rule: (step as { rule: import('./types.ts').FoulType }).rule,
          answer: value,
          correct,
          revisions,
          answeredAt: new Date().toISOString(),
        });
        setItemsDone((n) => n + 1);
      };

      switch (step.kind) {
        case 'continue':
          setComposer({ kind: 'locked' });
          advance();
          return;

        case 'call_or_pass': {
          const correct = value === step.expected;
          store(correct);
          setComposer({ kind: 'locked' });
          push({ lane: 'player', text: value === 'foul' ? 'Foul' : 'Clean' });
          push({ lane: 'coach', text: value === 'foul' ? step.onCall : step.onPass });
          advance();
          return;
        }

        case 'sort': {
          const picked = step.options.find((o) => o.value === value);
          store(value === step.expected);
          setComposer({ kind: 'locked' });
          push({ lane: 'player', text: picked?.label ?? value });
          push({ lane: 'coach', text: step.feedback[value] ?? '' });
          advance();
          return;
        }

        case 'free': {
          captured.current[step.capture] = value;
          store(null);
          setComposer({ kind: 'locked' });
          push({ lane: 'player', text: value });
          advance();
          return;
        }

        case 'edit': {
          setComposer({ kind: 'locked' });
          push({ lane: 'player', text: value });
          void (async () => {
            const out = await judgeEdit(step.target, step.prefill, value, step.fallback);
            store(out.pass);
            push({ lane: 'coach', text: out.text });
            advance();
          })();
          return;
        }

        default:
          return;
      }
    },
    [cursor, seq, level.slug, push],
  );

  return {
    messages,
    composer,
    beatName,
    beatIndex,
    beatCount: level.beats.length,
    itemsDone,
    itemsTotal,
    finished,
    waiting,
    skip,
    submit,
  };
}
