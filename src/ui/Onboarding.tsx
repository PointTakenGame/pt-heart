// The onboarding popup: a modal over the front page, not a screen of its own.
// It opens once, ever, the first time someone lands on the front page
// (storage.ts's seenOnboarding, the same one-time rule metCoach already
// follows), and Skip or finishing both close it the same way, into the entry
// screen's three-way choice from Part 2. The popup never routes anywhere else.
//
// Eleven steps: the pitch and a roll call of the three fouls, then each foul's
// own three-step mini-sequence (its card, a "pick the right one" quiz, a "pick
// the wrong one" quiz), then one closing demonstration that strings together a
// real foul call and a real listening repair using the actual RuleCards,
// Dialogue and Composer components, not a rebuild of any of them.
//
// All of steps 1-10's copy is `cards.ts`'s own words. Step 11 goes one further
// and imports the actual steps it dramatizes (level1's `l1-i1`, level3's
// `l3-say-2`) rather than retyping their lines, so a future edit to either
// level carries into the demo automatically instead of quietly drifting from
// it.

import { useEffect, useRef, useState } from 'react';
import type { FoulType, Step } from '../types.ts';
import type { LevelDef } from '../types.ts';
import { CARDS, CARD_ORDER, type Delta } from '../content/cards.ts';
import { level1 } from '../content/level1.ts';
import { level3 } from '../content/level3.ts';
import { RuleCardFull, RuleCards } from './RuleCards.tsx';
import { Dialogue } from './Dialogue.tsx';
import { Composer } from './Composer.tsx';
import { PitchCopy } from './Pitch.tsx';

interface Props {
  onClose: () => void;
}

type Panel =
  | { kind: 'overview' }
  | { kind: 'foulCard'; rule: FoulType }
  | { kind: 'quiz'; rule: FoulType; mode: 'right' | 'wrong' }
  | { kind: 'demo' };

// Each foul gets its card, then "pick the right one", then "pick the wrong
// one" — the exact order the brief numbers 2 through 10, three fouls of three
// steps each, bookended by the overview and the closing demo.
const PANELS: Panel[] = [
  { kind: 'overview' },
  ...CARD_ORDER.flatMap((rule): Panel[] => [
    { kind: 'foulCard', rule },
    { kind: 'quiz', rule, mode: 'right' },
    { kind: 'quiz', rule, mode: 'wrong' },
  ]),
  { kind: 'demo' },
];

function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface QuizOption {
  text: string;
  answer: boolean;
}

/** Three options off one card's own three deltas: one delta supplies the
 *  target half (the `fix` for "spot the right one", the `bad` for "spot the
 *  wrong one"), the other two supply their opposite half, so no two options
 *  ever repeat the same example line. Which delta is the target, and where the
 *  three options land, are both reshuffled on every build. */
function buildFoulQuiz(rule: FoulType, target: 'fix' | 'bad'): QuizOption[] {
  const deltas = shuffled(CARDS[rule].deltas);
  const other = target === 'fix' ? 'bad' : 'fix';
  const options = deltas.map((d: Delta, i: number) => ({
    text: i === 0 ? d[target] : d[other],
    answer: i === 0,
  }));
  return shuffled(options);
}

/** Reaches into a level's own beats for one step by id, so the demo panel
 *  quotes the level rather than retyping it. Throws on a miss rather than
 *  falling back to nothing: a broken id here means the demo is quoting a line
 *  that no longer exists, which is a bug worth failing loudly on in dev. */
function findStep(level: LevelDef, id: string): Step {
  for (const beat of level.beats) {
    for (const step of beat.steps) {
      if ('id' in step && step.id === id) return step;
    }
  }
  throw new Error(`onboarding demo: step "${id}" not found in ${level.slug}`);
}

type CallOrPassStep = Extract<Step, { kind: 'call_or_pass' }>;
type TemplateStep = Extract<Step, { kind: 'template' }>;

// l1-i1: Verdict Victor's opening foul, the first thing level 1 ever asks a
// player to call. l3-say-2: the first time level 3 hands the player the
// listening frame themselves, rather than judging somebody else's attempt.
const JUDGING_CALL = findStep(level1, 'l1-i1') as CallOrPassStep;
const LISTEN_TEMPLATE = findStep(level3, 'l3-say-2') as TemplateStep;

// The one line the demo needs that has no id of its own to fetch by: the
// coach's lead-in to l3-say-2 (content/level3.ts, the `say` step immediately
// above it), quoted verbatim rather than reconstructed, since the specimen
// line it hands the player lives inside this sentence's own prose and not in
// a separate field.
const LISTEN_LEAD_IN =
  'Your turn to say one back. Take this: "I\'m not sold on working from home full time. I trained three juniors standing at a whiteboard, and I can\'t picture doing that over video." I\'ll give you the frame. Keep both halves in.';

export function OnboardingModal({ onClose }: Props) {
  const [i, setI] = useState(0);
  const [stepComplete, setStepComplete] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const panel = PANELS[i];
  const last = i === PANELS.length - 1;
  const gated = panel.kind === 'quiz' || panel.kind === 'demo';

  useEffect(() => {
    setStepComplete(!gated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const close = () => onClose();

  // Escape closes the popup, the same as Skip. Same pattern Dialogue.tsx
  // already uses for its own overlay (the blown-up rule card).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => {
    if (last) {
      close();
      return;
    }
    setI(i + 1);
  };

  return (
    <div className="ob-overlay" role="dialog" aria-modal="true" aria-label="How Humility Showdown works">
      <div className="ob-modal" ref={modalRef} tabIndex={-1}>
        <div className="ob-modal-head">
          <div className="ob-dots" aria-hidden="true">
            {PANELS.map((_, n) => (
              <span key={n} className={`ob-dot${n === i ? ' is-on' : ''}${n < i ? ' is-done' : ''}`} />
            ))}
          </div>
          <button className="link" onClick={close}>
            Skip
          </button>
        </div>

        {/* Keyed on the step index: every branch below sits in the same JSX
            slot, so without a key that changes per step React treats
            "quiz, right" -> "quiz, wrong" as the same QuizPanel instance with
            new props rather than a new one, and a useState initializer only
            ever runs on a genuine mount. Without this, round two silently
            inherits round one's shuffled options and picked answer instead of
            building its own. */}
        <div className="ob-stage" key={i}>
          {panel.kind === 'overview' && <OverviewPanel />}
          {panel.kind === 'foulCard' && <FoulCardPanel rule={panel.rule} />}
          {panel.kind === 'quiz' && (
            <QuizPanel rule={panel.rule} mode={panel.mode} onAnswered={() => setStepComplete(true)} />
          )}
          {panel.kind === 'demo' && <DemoPanel onReady={() => setStepComplete(true)} />}
        </div>

        <div className="ob-modal-foot">
          <button className="btn btn-wide" disabled={!stepComplete} onClick={next}>
            {last ? "Let's go" : 'Next'}
          </button>
          <p className="ob-count muted">
            {i + 1} of {PANELS.length}
          </p>
        </div>
      </div>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="ob-overview">
      <p className="ob-step-label">The idea</p>
      <PitchCopy />
      <ol className="ob-foul-list">
        {CARD_ORDER.map((rule) => (
          <li key={rule}>{CARDS[rule].name}</li>
        ))}
      </ol>
    </div>
  );
}

function FoulCardPanel({ rule }: { rule: FoulType }) {
  const card = CARDS[rule];
  return (
    <div className="ob-foul">
      <div className="ob-foul-head">
        <span className="ob-foul-emoji" aria-hidden="true">
          {card.emoji}
        </span>
        <span className="ob-foul-name">{card.name}</span>
      </div>
      <p className="ob-foul-def">{card.what}</p>
      <RuleCardFull rule={rule} />
    </div>
  );
}

function QuizPanel({
  rule,
  mode,
  onAnswered,
}: {
  rule: FoulType;
  mode: 'right' | 'wrong';
  onAnswered: () => void;
}) {
  const [options] = useState(() => buildFoulQuiz(rule, mode === 'right' ? 'fix' : 'bad'));
  const [picked, setPicked] = useState<number | null>(null);

  const pick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    onAnswered();
  };

  return (
    <div className="ob-quiz">
      <p className="ob-step-label">{CARDS[rule].name}</p>
      <h2 className="ob-quiz-head">{mode === 'right' ? 'Spot the right one' : 'Spot the wrong one'}</h2>
      <div className="ob-quiz-options">
        {options.map((opt, idx) => {
          const done = picked !== null;
          const isPicked = picked === idx;
          let cls = 'btn btn-wide';
          if (done && opt.answer) cls += ` btn-good${isPicked ? ' ob-pop' : ''}`;
          else if (done && isPicked) cls += ' btn-bad ob-shake';
          return (
            <button key={idx} className={cls} disabled={done} onClick={() => pick(idx)}>
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The closing demo: a real foul call and ruling (level1's `l1-i1`), then a
 *  real listening repair typed into the real template composer (level3's
 *  `l3-say-2`). Short on purpose — a demonstration, not a drill. */
function DemoPanel({ onReady }: { onReady: () => void }) {
  const [phase, setPhase] = useState<'call' | 'ruling' | 'listen' | 'done'>('call');

  useEffect(() => {
    if (phase === 'done') onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div className="ob-demo">
      <p className="ob-step-label">How a round actually looks</p>
      <p className="ob-intro">
        A foul gets called the same way every time, and a good listen looks like this.
      </p>

      {(phase === 'call' || phase === 'ruling') && (
        <div className="drill-table">
          <span className="drill-table-tag">on the table</span>
          <span className="drill-table-text">{JUDGING_CALL.line}</span>
        </div>
      )}

      {phase === 'call' && (
        <RuleCards enabled={CARD_ORDER} live={[JUDGING_CALL.rule]} onCall={() => setPhase('ruling')} />
      )}

      {phase === 'ruling' && (
        <>
          <Dialogue face={null} text={JUDGING_CALL.onCall} tone="coach" compact />
          <Composer state={{ kind: 'continue', label: 'Next' }} onSubmit={() => setPhase('listen')} />
        </>
      )}

      {phase === 'listen' && (
        <>
          <Dialogue face={null} text={LISTEN_LEAD_IN} tone="coach" compact />
          <Composer
            state={{ kind: 'template', segments: LISTEN_TEMPLATE.segments }}
            onSubmit={() => setPhase('done')}
          />
        </>
      )}

      {phase === 'done' && <Dialogue face={null} text={LISTEN_TEMPLATE.reply ?? ''} tone="coach" compact />}
    </div>
  );
}
