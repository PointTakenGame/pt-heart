// The beat runner. Walks a level's steps, emits messages into one thread, and
// opens the composer when a step needs the player.
//
// Pacing: a message dwells for 22ms per character, floored at 600ms and capped at
// 2500ms, then the next one lands 400ms later. A tap anywhere skips the current
// dwell, so a fast reader never waits and a slow one never gets buried.
//
// Every item is answered exactly once. There are no retries anywhere (Q6, Q12):
// a wrong call costs a token and the level moves on, and the offended party's
// ruling on a foul is final because it is theirs. What is still gated is a
// non-answer — an empty box, one character, or a prefill handed straight back
// is not an attempt at all, so the same step reopens and nothing is charged.
//
// Both purses run from level 1, seven tokens a side, same as the printed game.
// A good call takes one off the opponent; a bad whistle hands one over.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComposerState, FoulType, Message, Revision, Step } from './types.ts';
import type { LevelDef } from './types.ts';
import { judgeEdit, restate } from './coach.ts';
import { markCleared, recordItem } from './storage.ts';
import { BEAT_GAP, dwellMs } from './pacing.ts';
import { CARDS } from './content/cards.ts';
import { START_TOKENS } from './content/showdown.ts';
import { crowdRow } from './avatars.ts';

function isItem(step: Step): boolean {
  return (
    step.kind === 'call_or_pass' ||
    step.kind === 'sort' ||
    step.kind === 'edit' ||
    step.kind === 'free' ||
    step.kind === 'confirm' ||
    step.kind === 'template'
  );
}

/** Too thin to be an answer. Kills the one-letter and empty-box exploits. */
export function tooThin(value: string): boolean {
  const v = value.trim();
  return v.length < 10 || v.split(/\s+/).filter(Boolean).length < 3;
}

/** How long the foul card sits on the table alone before the coach speaks and
 *  the token flies. Long enough to read the card's name, short enough that it
 *  does not feel like the game stalled. */
const CARD_BEFORE_PAY_MS = 950;

/** The confirm dialogue answers on one string, because that is what submit()
 *  takes: the verdict, then the offendee's own words if they wrote any. Enter
 *  sends in every composer, so a newline cannot be typed and is safe as the
 *  separator. */
export function confirmValue(verdict: 'yes' | 'no', note: string): string {
  const n = note.trim();
  return n ? `${verdict}\n${n}` : verdict;
}

export function parseConfirm(value: string): { verdict: 'yes' | 'no'; note: string } {
  const nl = value.indexOf('\n');
  const head = (nl === -1 ? value : value.slice(0, nl)).trim();
  return {
    verdict: head === 'no' ? 'no' : 'yes',
    note: nl === -1 ? '' : value.slice(nl + 1).trim(),
  };
}

export const THIN_REPLY =
  'That is not an answer yet. Give me a real sentence, in your own words, and I will read it properly.';

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
  playerTokens: number;
  opponentTokens: number;
  /** the boss is about to walk out; the entrance screen owns the display */
  bossPending: boolean;
  beginBoss: () => void;
  skip: () => void;
  /** button value, card pressed, or the text the player sent */
  submit: (value: string, revisions?: Revision[]) => void;
}

export function useGym(level: LevelDef): Gym {
  const [messages, setMessages] = useState<Message[]>([]);
  const [composer, setComposer] = useState<ComposerState>({ kind: 'locked' });
  const [cursor, setCursor] = useState(0);
  const [itemsDone, setItemsDone] = useState(0);
  const [finished, setFinished] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [playerTokens, setPlayerTokens] = useState(START_TOKENS);
  const [opponentTokens, setOpponentTokens] = useState(START_TOKENS);
  const [bossPending, setBossPending] = useState(false);

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
  const purse = useRef({ player: START_TOKENS, opponent: START_TOKENS });
  const bossShown = useRef(false);
  const live = useRef(true);
  // Per-item state, reset whenever the cursor moves.
  const paidThisItem = useRef(false);
  const nonce = useRef(0);

  // Stamp the id here, not inside the updater. React runs updaters later, so a
  // lazily-read uid.current gives two messages pushed in the same tick the same
  // key, and React then silently drops one of them from the thread.
  const push = useCallback((m: Omit<Message, 'id'>) => {
    uid.current += 1;
    const msg: Message = { ...m, id: `m${uid.current}` };
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Fouls never burn a token, they move one. Clamped, so a purse cannot go
  // negative and the two sides always add to fourteen.
  //
  // The whole economy is switched off in levels 1-3 (`LevelDef.tokens`), and the
  // switch lives here rather than at the four call sites on purpose: the coach
  // promises out loud that the number will not move an inch, and a promise that
  // has to be re-honoured by every future step kind is a promise that will break.
  // One choke point cannot be forgotten.
  const tokensLive = level.tokens === 'live';
  const transfer = useCallback((from: 'player' | 'opponent', n: number) => {
    if (!tokensLive) return;
    const moved = Math.min(n, purse.current[from]);
    if (moved <= 0) return;
    const to = from === 'player' ? 'opponent' : 'player';
    purse.current[from] -= moved;
    purse.current[to] += moved;
    setPlayerTokens(purse.current.player);
    setOpponentTokens(purse.current.opponent);
  }, [tokensLive]);

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

  /** The boss walks out, and the thread carries over.
   *
   *  Re-reversed on 2026-09-05 for Q23: the gym is open book. It briefly cleared
   *  the log at the boss entrance (Steve, 2026-08-25: "when fight chat comes
   *  online, clear the chat log from the practice round"), but open book restores
   *  Steve's earlier call — "just decontrast old/done material, don't delete it,
   *  one big scroll." The practice round stays on the scroll so the player can
   *  read back to it; the de-contrast is cosmetic, in the stylesheet. The crowd
   *  row is appended as the first beat of the fight, not a fresh start. */
  const beginBoss = useCallback(() => {
    bossShown.current = true;
    uid.current += 1;
    const id = `m${uid.current}`;
    setMessages((prev) => [...prev, { id, lane: 'crowd', text: crowdRow(0) }]);
    setBossPending(false);
  }, []);

  useEffect(
    () => () => {
      live.current = false;
    },
    [],
  );

  /** A delayed push out of an event handler, dropped if the level unmounts.
   *  The scripted loop has `alive` for this; submit() does not, and item 13
   *  (the card lands before the tokens move) needs a real pause. */
  const after = useCallback((ms: number, fn: () => void) => {
    window.setTimeout(() => {
      if (live.current) fn();
    }, ms);
  }, []);

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

    // Boss gate. The entrance screen sits between the last drill and the first
    // line of the match, and it only ever runs once per visit to the level.
    const beat = level.beats[entry.beat];
    const firstOfBeat = seq.findIndex((s) => s.beat === entry.beat);
    if (beat?.boss && cursor === firstOfBeat && !bossShown.current) {
      setComposer({ kind: 'locked' });
      setBossPending(true);
      return;
    }

    paidThisItem.current = false;

    const step = entry.step;

    (async () => {
      switch (step.kind) {
        case 'say':
          setComposer({ kind: 'locked' });
          await say(
            {
              lane: step.lane,
              speaker: step.speaker,
              text: step.text,
              isSpecimen: step.isSpecimen,
              isTake: step.isTake,
            },
            aliveFn,
          );
          if (alive) setCursor((c) => c + 1);
          return;

        case 'card':
          setComposer({ kind: 'locked' });
          push({ lane: 'coach', text: CARDS[step.rule].name, card: step.rule });
          await dwell(2200, aliveFn);
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
            kind: 'call',
            hint: 'Press a foul card to call it, or say it is not a foul.',
            pass: { value: 'clean', label: "I might not agree, but it's not a foul" },
            // One-card levels default to their own rule; levels 4 and 5 name the
            // set on the step, so the whole rail is live and the call is a choice.
            callable: step.callable ?? [step.rule],
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

        case 'confirm':
          await say(
            { lane: step.lane, speaker: step.speaker, text: step.ask },
            aliveFn,
          );
          if (!alive) return;
          setComposer({
            kind: 'confirm',
            yes: step.yesLabel ?? 'Yes, that one landed on me',
            no: step.noLabel ?? 'No, I am fine with it',
            placeholder: step.placeholder ?? 'Say it in your own words, if you want to',
          });
          return;

        case 'template':
          if (step.ask) {
            await say({ lane: 'coach', text: step.ask }, aliveFn);
            if (!alive) return;
          }
          setComposer({ kind: 'template', segments: step.segments });
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
  }, [cursor, level.slug, bossPending]);

  const submit = useCallback(
    (value: string, revisions: Revision[] = []) => {
      const entry = seq[cursor];
      if (!entry) return;
      const step = entry.step;
      const advance = () => setCursor((c) => c + 1);

      const record = (correct: boolean | null, suffix = '') => {
        if (!isItem(step)) return;
        recordItem({
          itemId: `${(step as { id: string }).id}${suffix}`,
          levelSlug: level.slug,
          rule: (step as { rule: FoulType }).rule,
          answer: value,
          correct,
          revisions,
          answeredAt: new Date().toISOString(),
        });
      };

      /** Score the item the player just finished, then move on.
       *
       *  No tokens here. Steve, 2026-08-25: "player does not get points for
       *  'let it stand', points are only given as comppensation for fouls."
       *  (The button now reads "I might not agree, but it's not a foul"; the
       *  economics of it did not change.)
       *  A token is compensation for something that was done to you, so the
       *  only thing that pays is a foul the player actually called, and that
       *  payment is made at the call site below, after the card lands. */
      const settle = () => {
        setItemsDone((n) => n + 1);
        advance();
      };

      /** A wrong answer costs `n` tokens, once, however many tries it takes. A
       *  bad whistle is a flat one; the good-call payout below is what scales
       *  with the card (judging is a double penalty). */
      const chargeMiss = (n = 1) => {
        if (paidThisItem.current) return;
        paidThisItem.current = true;
        transfer('player', n);
      };

      switch (step.kind) {
        case 'continue':
          setComposer({ kind: 'locked' });
          advance();
          return;

        case 'call_or_pass': {
          const called = value !== 'clean';
          const correct = step.expected === 'foul' ? value === step.rule : !called;
          setComposer({ kind: 'locked' });
          // A foul call is not speech, it is a whistle, so it renders as one
          // (Steve, 2026-08-25: "that Text chat line needs to be orange, not
          // black"). Letting it stand is a pass, and stays ordinary.
          push({
            lane: 'player',
            text: called ? `Foul: ${CARDS[value as FoulType]?.name ?? value}` : 'Not a foul',
            isCall: called,
          });
          record(correct);

          if (correct) {
            // Letting a clean line stand is right, and it is worth nothing.
            if (!called) {
              push({ lane: 'coach', text: step.onPass });
              settle();
              return;
            }
            // A good call: the card comes down on the table first, then the
            // coach, then the token flies. Steve, 2026-08-25: "thorw the foul
            // card in teh chat BEFORE the points move." Reading it in that
            // order tells you what you were paid for.
            push({ lane: 'coach', text: CARDS[step.rule].name, card: step.rule });
            after(CARD_BEFORE_PAY_MS, () => {
              push({ lane: 'coach', text: step.onCall });
              // The card sets the price. Judging is a double penalty, so a good
              // judging call moves two; the other two move one (defect 3).
              transfer('opponent', CARDS[step.rule].cost);
              settle();
            });
            return;
          }

          // Wrong, and that is the end of it. The coach names what was actually
          // there and the round moves on: one check, no second attempt (Q6, Q12).
          chargeMiss();
          push({
            lane: 'coach',
            text:
              step.expected === 'foul'
                ? `That one was not clean. ${CARDS[step.rule].tell}`
                : tokensLive
                  ? 'That line was clean. A bad whistle costs you one.'
                  : 'That line was clean. Nothing in it to call.',
          });
          settle();
          return;
        }

        case 'sort': {
          const picked = step.options.find((o) => o.value === value);
          const correct = value === step.expected;
          setComposer({ kind: 'locked' });
          push({ lane: 'player', text: picked?.label ?? value });
          push({ lane: 'coach', text: step.feedback[value] ?? '' });
          record(correct);
          if (!correct) chargeMiss();
          settle();
          return;
        }

        case 'free': {
          if (tooThin(value)) {
            push({ lane: 'coach', text: THIN_REPLY });
            nonce.current += 1;
            setComposer({
              kind: 'free',
              placeholder: step.placeholder,
              chips: step.chips,
              nonce: nonce.current,
            });
            return;
          }
          captured.current[step.capture] = value;
          record(null);
          setComposer({ kind: 'locked' });
          push({ lane: 'player', text: value });
          setItemsDone((n) => n + 1);
          advance();
          return;
        }

        case 'edit': {
          // Handing the line straight back is the commonest way to skip an edit
          // step. It is a local fail: no model call, no ruling, no token.
          const unchanged = value.trim() === step.prefill.trim();
          if (unchanged || tooThin(value)) {
            push({
              lane: 'coach',
              text: unchanged
                ? 'That is the same line I gave you. Change it, then send it.'
                : THIN_REPLY,
            });
            nonce.current += 1;
            setComposer({
              kind: 'prefilled',
              prefill: step.prefill,
              chips: step.chips,
              nonce: nonce.current,
            });
            return;
          }

          setComposer({ kind: 'locked' });
          push({ lane: 'player', text: value });
          void (async () => {
            const out = await judgeEdit(step.target, step.prefill, value, step.fallback);
            record(out.pass);
            push({ lane: 'coach', text: out.text });

            // pass === null means the coach could not reach the model, so there
            // is no ruling to hold anybody to, and nothing is charged. A false
            // pass costs a token and the line moves on — there is no retry.
            if (out.pass === false) chargeMiss();
            settle();
          })();
          return;
        }

        case 'confirm': {
          const { verdict, note } = parseConfirm(value);
          const label = verdict === 'yes' ? (step.yesLabel ?? 'Yes.') : (step.noLabel ?? 'No.');
          setComposer({ kind: 'locked' });
          push({ lane: 'player', text: note ? `${label} ${note}` : label });
          // record(null) on purpose. soul.md §6: "did I foul?" is answered by
          // the person who might have been fouled, so neither button can be
          // wrong and there is nothing here to grade. The answer is corpus.
          record(null);

          if (verdict === 'yes') {
            // Same order as a called foul: card first, then the words, then the
            // token moves, so you can read what you were paid for.
            push({ lane: 'coach', text: CARDS[step.rule].name, card: step.rule });
            after(CARD_BEFORE_PAY_MS, () => {
              push({ lane: step.lane, speaker: step.speaker, text: step.onYes });
              if (step.pays) transfer(step.pays, CARDS[step.rule].cost);
              settle();
            });
            return;
          }

          // Waving the call off is free, and it is said out loud. The suggester
          // is allowed to be wrong; that is the whole reason for asking.
          push({ lane: step.lane, speaker: step.speaker, text: step.onNo });
          settle();
          return;
        }

        case 'template': {
          // The blanks are gated in the composer, so whatever arrives here is
          // an answer. Nothing to grade: the frame did the teaching.
          setComposer({ kind: 'locked' });
          push({ lane: 'player', text: value });
          record(null);
          if (step.reply) push({ lane: 'coach', text: step.reply });
          settle();
          return;
        }

        default:
          return;
      }
    },
    [cursor, seq, level.slug, push, transfer, tokensLive],
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
    playerTokens,
    opponentTokens,
    bossPending,
    beginBoss,
    skip,
    submit,
  };
}
