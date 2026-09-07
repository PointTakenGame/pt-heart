// The composer states, plus the revision trace.
//
// Revision capture is boundary snapshots, not keypresses (Steve's ruling B1,
// 2026-08-23). A keypress log is mostly noise; what is worth knowing later is
// "they typed the judgment first, then deleted it", and four triggers catch that:
// 900ms after typing stops, on blur, on chip insert, and always on send.
// Consecutive identical snapshots are dropped, so an idle field records nothing.
// Expect three to six snapshots on a pre-filled item.
//
// Two states carry no text box of their own. 'call' is a foul call: the rule
// cards above the thread are the buttons, so all that is left down here is the
// decline. 'template' is a sentence frame with the blanks inside the box
// (ruling of 2026-08-24), which replaces the loose chips on the turns where the
// shape of the answer is the thing being taught.
//
// 'confirm' is the one that carries both. Somebody has suggested a foul and the
// person it may have landed on is ruling on it, so two buttons make the fast
// path fast, and the text box under them is always open because they may want to
// say something instead of, or as well as, pressing one (Steve, 2026-08-26). The
// note is never required. The buttons are the answer.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { confirmValue } from '../engine.ts';
import type { ComposerState, Revision, TemplateSegment } from '../types.ts';

const PAUSE_MS = 900;

/** A blank counts as filled at two words, or eight characters of one word. */
function filled(value: string): boolean {
  const v = value.trim();
  return v.length >= 8 || v.split(/\s+/).filter(Boolean).length >= 2;
}

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

  if (state.kind === 'call') {
    // The pass button used to live here. Steve, 2026-08-25: "let it stand is the
    // top row" of the card tray, so the whole call gesture is now in one place at
    // the bottom of the screen (src/ui/RuleCards.tsx). All that is left here is
    // the question itself.
    return (
      <div className="composer composer-call">
        <p className="composer-hint">{state.hint}</p>
      </div>
    );
  }

  if (state.kind === 'buttons') {
    return <ButtonComposer key={key} state={state} onSubmit={onSubmit} onResize={onResize} />;
  }

  if (state.kind === 'template') {
    return <TemplateComposer key={key} state={state} onSubmit={onSubmit} onResize={onResize} />;
  }

  if (state.kind === 'confirm') {
    return <ConfirmComposer key={key} state={state} onSubmit={onSubmit} onResize={onResize} />;
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

// Two buttons and a box. The buttons are the verdict and the box is a rider on
// it: a player who wants to say what was actually left out can, and one who does
// not can press a button and move. Neither verdict is wrong, so there is nothing
// to disable and nothing to validate. What the note usually carries is the reason
// a call was waved off, and that is the part worth keeping.
function ConfirmComposer({
  state,
  onSubmit,
  onResize,
}: {
  state: Extract<ComposerState, { kind: 'confirm' }>;
  onSubmit: (value: string, revisions: Revision[]) => void;
  onResize?: () => void;
}) {
  const [note, setNote] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const opened = useRef(Date.now());
  const trace = useRef<Revision[]>([{ t: 0, text: '', reason: 'pause' }]);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const snap = (value: string, reason: Revision['reason']) => {
    const last = trace.current[trace.current.length - 1];
    if (last && last.text === value) return;
    trace.current.push({ t: Date.now() - opened.current, text: value, reason });
  };

  useEffect(() => {
    return () => {
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, []);

  // Same grow-to-fit as the free composer: the note is usually one line and
  // occasionally a paragraph, and the thread above is sized by what is left.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const border = el.offsetHeight - el.clientHeight;
    el.style.height = `${el.scrollHeight + border}px`;
    onResize?.();
  }, [note, onResize]);

  const onChange = (value: string) => {
    setNote(value);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => snap(value, 'pause'), PAUSE_MS);
  };

  const send = (verdict: 'yes' | 'no') => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    snap(note.trim(), 'send');
    onSubmit(confirmValue(verdict, note), trace.current);
  };

  return (
    <div className="composer composer-confirm">
      <div className="composer-btn-row">
        <button className="btn" onClick={() => send('yes')}>
          {state.yes}
        </button>
        <button className="btn" onClick={() => send('no')}>
          {state.no}
        </button>
      </div>
      <textarea
        ref={ref}
        value={note}
        rows={1}
        placeholder={state.placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => snap(note.trim(), 'blur')}
        onKeyDown={(e) => {
          // Return does not send here. There is no answer yet: the note is a
          // rider on a verdict, and the verdict is one of the two buttons.
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}

// The key remounts the text states so a new item never inherits the last one's
// draft. nonce is what makes a retry of the same item remount too: the player is
// being sent back to a line they already typed, and the box has to come back
// clean rather than holding the answer that just failed.
function composerKey(state: ComposerState): string {
  if (state.kind === 'prefilled') return `p:${state.prefill}:${state.nonce ?? 0}`;
  if (state.kind === 'free') return `f:${state.placeholder}:${state.nonce ?? 0}`;
  if (state.kind === 'template') return `t:${state.segments.length}:${state.nonce ?? 0}`;
  if (state.kind === 'confirm') return `y:${state.nonce ?? 0}`;
  if (state.kind === 'call') return `c:${state.nonce ?? 0}`;
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

  // A chip that starts with a capital letter is a sentence opener, and an opener
  // goes on the front of the line and nowhere else. That is Steve's level 2 bug:
  // pressing "In my head," dropped the phrase on the END of the line he had been
  // asked to fix. Pressing a second opener swaps it for the first, because the
  // line only has one front.
  //
  // A chip that starts lowercase is a mid-sentence fragment ("because I
  // noticed"), and those drop in at the caret, because a player who moved the
  // cursor meant to put it there. Capitalisation already encodes the difference
  // in the authored chip lists, so nothing in the content files has to change.
  const isOpener = (c: string) => /^[A-Z]/.test(c);

  const insertChip = (chip: string) => {
    if (isOpener(chip)) {
      const head0 = text.replace(/^\s+/, '');
      const existing = state.chips
        .filter(isOpener)
        .find((c) => head0.toLowerCase().startsWith(c.toLowerCase()));
      if (existing === chip) return;
      const rest = existing ? head0.slice(existing.length).replace(/^\s+/, '') : head0;
      const joined = rest.length === 0 ? `${chip} ` : `${chip} ${rest}`;
      setText(joined);
      snap(joined, 'chip');
      const caret = chip.length + 1;
      requestAnimationFrame(() => {
        ref.current?.focus();
        ref.current?.setSelectionRange(caret, caret);
      });
      return;
    }

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
            // Steve, 2026-08-25: "pressing return on a typed answer still
            // needs 'next', too many 'next'". Return sends, the way it does in
            // every chat box. Shift+Return is the escape hatch for the answer
            // that wants a second line, and isComposing keeps an IME candidate
            // from being mistaken for a finished sentence.
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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

/** Fixed words are labels, blanks are inputs, and the assembled line is what the
 *  coach reads. A fixed run that opens with punctuation closes up against the
 *  blank before it, so "... . Did I miss anything?" reads as a sentence. */
function assemble(segments: TemplateSegment[], values: string[]): string {
  let out = '';
  segments.forEach((seg, i) => {
    const piece = 'text' in seg ? seg.text : values[i].trim();
    if (!piece) return;
    if (out.length === 0) {
      out = piece;
      return;
    }
    out += /^[.,;:!?]/.test(piece) ? piece : ` ${piece}`;
  });
  return out;
}

// A sentence frame with the blanks in it. Steve's ruling of 2026-08-24: the shape
// belongs inside the box, not in a row of chips above it that the player has to
// assemble themselves. Send stays disabled until every blank has something real
// in it, which is also what closes the one-letter hole.
function TemplateComposer({
  state,
  onSubmit,
  onResize,
}: {
  state: Extract<ComposerState, { kind: 'template' }>;
  onSubmit: (value: string, revisions: Revision[]) => void;
  onResize?: () => void;
}) {
  const [values, setValues] = useState<string[]>(() => state.segments.map(() => ''));
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const opened = useRef(Date.now());
  const trace = useRef<Revision[]>([{ t: 0, text: '', reason: 'pause' }]);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const line = assemble(state.segments, values);
  const blanks = state.segments
    .map((seg, i) => ('input' in seg ? i : -1))
    .filter((i) => i >= 0);
  const ready = blanks.every((i) => filled(values[i]));

  const snap = (value: string, reason: Revision['reason']) => {
    const last = trace.current[trace.current.length - 1];
    if (last && last.text === value) return;
    trace.current.push({ t: Date.now() - opened.current, text: value, reason });
  };

  useEffect(() => {
    const first = blanks[0];
    if (first !== undefined) refs.current[first]?.focus();
    return () => {
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    for (const i of blanks) {
      const el = refs.current[i];
      if (!el) continue;
      el.style.height = 'auto';
      const border = el.offsetHeight - el.clientHeight;
      el.style.height = `${el.scrollHeight + border}px`;
    }
    onResize?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, onResize]);

  const onChange = (i: number, value: string) => {
    const next = values.slice();
    next[i] = value;
    setValues(next);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    const assembled = assemble(state.segments, next);
    pauseTimer.current = setTimeout(() => snap(assembled, 'pause'), PAUSE_MS);
  };

  const send = () => {
    if (!ready) return;
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    snap(line, 'send');
    onSubmit(line, trace.current);
  };

  return (
    <div className="composer composer-template">
      <div className="frame">
        {state.segments.map((seg, i) =>
          'text' in seg ? (
            <span key={i} className="frame-fixed">
              {seg.text}
            </span>
          ) : (
            <textarea
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="frame-blank"
              value={values[i]}
              rows={1}
              placeholder={seg.input.placeholder}
              onChange={(e) => onChange(i, e.target.value)}
              onBlur={() => snap(line, 'blur')}
              onKeyDown={(e) => {
                // Return sends here too. See the note on the free composer
                // above; a fill-in-the-blank never wants a line break.
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
            />
          ),
        )}
      </div>
      <button className="btn btn-send btn-wide" onClick={send} disabled={!ready}>
        Send
      </button>
    </div>
  );
}
