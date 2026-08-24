// The four composer states, plus the revision trace.
//
// Revision capture is boundary snapshots, not keypresses (Steve's ruling B1,
// 2026-08-23). A keypress log is mostly noise; what is worth knowing later is
// "they typed the judgment first, then deleted it", and four triggers catch that:
// 900ms after typing stops, on blur, on chip insert, and always on send.
// Consecutive identical snapshots are dropped, so an idle field records nothing.
// Expect three to six snapshots on a pre-filled item.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ComposerState, Revision } from '../types.ts';

const PAUSE_MS = 900;

interface Props {
  state: ComposerState;
  onSubmit: (value: string, revisions: Revision[]) => void;
  /** Called after any change that alters this component's height, from a layout
   *  effect. The thread above is a scroll container sized by what is left over,
   *  so it has to be re-landed on its bottom in the same frame. */
  onResize?: () => void;
}

export function Composer({ state, onSubmit, onResize }: Props) {
  const key = composerKey(state);

  // Every state change resizes the composer: locked is 3.9rem, a button row is
  // taller, a textarea taller again. Layout effect, not effect, so the correction
  // lands before the paint rather than one frame after it.
  useLayoutEffect(() => {
    onResize?.();
  }, [key, onResize]);

  if (state.kind === 'locked') {
    return <div className="composer composer-locked" aria-hidden="true" />;
  }

  if (state.kind === 'continue') {
    return (
      <div className="composer">
        <button className="btn btn-wide" onClick={() => onSubmit('continue', [])}>
          {state.label}
        </button>
      </div>
    );
  }

  if (state.kind === 'buttons') {
    return <ButtonComposer key={key} state={state} onSubmit={onSubmit} onResize={onResize} />;
  }

  return <TextComposer key={key} state={state} onSubmit={onSubmit} onResize={onResize} />;
}

// The buttons state, plus the optional reference card. The reference is closed by
// default and stays closed until asked for: a player who remembers the three cards
// should never have to look past a row of four buttons to answer.
function ButtonComposer({
  state,
  onSubmit,
  onResize,
}: {
  state: Extract<ComposerState, { kind: 'buttons' }>;
  onSubmit: (value: string, revisions: Revision[]) => void;
  onResize?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const help = state.help;

  // Opening the reference card takes a chunk out of the thread.
  useLayoutEffect(() => {
    onResize?.();
  }, [open, onResize]);

  return (
    <div className="composer composer-buttons">
      {help && (
        <div className="composer-help-row">
          <button
            className="chip"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {help.label}
          </button>
          {open && (
            <ul className="help">
              {help.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="composer-btn-row">
        {state.options.map((o) => (
          <button key={o.value} className="btn" onClick={() => onSubmit(o.value, [])}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function composerKey(state: ComposerState): string {
  if (state.kind === 'prefilled') return `p:${state.prefill}`;
  if (state.kind === 'free') return `f:${state.placeholder}`;
  return state.kind;
}

function TextComposer({
  state,
  onSubmit,
  onResize,
}: {
  state: Extract<ComposerState, { kind: 'prefilled' | 'free' }>;
  onSubmit: (value: string, revisions: Revision[]) => void;
  onResize?: () => void;
}) {
  const initial = state.kind === 'prefilled' ? state.prefill : '';
  const [text, setText] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);
  const opened = useRef(Date.now());
  const trace = useRef<Revision[]>([{ t: 0, text: initial, reason: 'pause' }]);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const snap = (value: string, reason: Revision['reason']) => {
    const last = trace.current[trace.current.length - 1];
    if (last && last.text === value) return;
    trace.current.push({ t: Date.now() - opened.current, text: value, reason });
  };

  useEffect(() => {
    ref.current?.focus();
    // put the caret at the end so a pre-filled line is ready to edit, not replace
    const el = ref.current;
    if (el) el.setSelectionRange(el.value.length, el.value.length);
    return () => {
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, []);

  // Grow to fit. The whole interaction is composing one careful sentence, so a
  // fixed two-row window that hides the top of it while the player is still
  // working on the end is the wrong shape. CSS caps the growth so the thread
  // above never gets squeezed out; past the cap the textarea scrolls.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    // scrollHeight is content plus padding; the box is border-box, so add the
    // borders back or the field sits two pixels short and grows a scrollbar.
    const border = el.offsetHeight - el.clientHeight;
    el.style.height = `${el.scrollHeight + border}px`;
    // Whatever the field just took, the thread just lost.
    onResize?.();
  }, [text, onResize]);

  const onChange = (value: string) => {
    setText(value);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => snap(value, 'pause'), PAUSE_MS);
  };

  // Chips drop in at the caret, not at the end. A player who has put the cursor
  // mid-sentence meant to put the fragment there.
  const insertChip = (chip: string) => {
    const el = ref.current;
    const at = el ? el.selectionStart : text.length;
    const before = text.slice(0, at).replace(/\s+$/, '');
    const after = text.slice(at).replace(/^\s+/, '');
    const head = before.length === 0 ? chip : `${before} ${chip}`;
    const joined = after.length === 0 ? `${head} ` : `${head} ${after}`;
    setText(joined);
    snap(joined, 'chip');
    const caret = head.length + 1;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  const send = () => {
    const value = text.trim();
    if (!value) return;
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    snap(value, 'send');
    onSubmit(value, trace.current);
  };

  return (
    <div className="composer composer-text">
      {state.chips.length > 0 && (
        <div className="chips">
          {state.chips.map((c) => (
            // preventDefault on mousedown keeps focus (and the caret) in the
            // textarea, so the chip lands where the player put the cursor.
            <button
              key={c}
              className="chip"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertChip(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="composer-row">
        <textarea
          ref={ref}
          value={text}
          rows={2}
          placeholder={state.kind === 'free' ? state.placeholder : undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => snap(text, 'blur')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="btn btn-send" onClick={send} disabled={text.trim().length === 0}>
          Send
        </button>
      </div>
    </div>
  );
}
