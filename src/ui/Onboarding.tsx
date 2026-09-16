// The onboarding overlay, between "I'm in" on the front page and the entry
// screen's three-way choice. One idea per screen: the pitch, the three fouls
// (their real printed cards), two quick quizzes built off the same delta lines
// the cards already teach, and a miniature look at what calling a foul feels
// like in a real round.
//
// Built on the corner's shape (Prefight.tsx): a fixed frame, one panel at a
// time, a dot progress trail, Next parked in the same spot every screen. The
// CSS is its own classnames (.ob-*) rather than the literal .pf-* selectors,
// the way Drill.tsx's .drill-stage already mirrors .pf-stage without sharing
// it; see styles.css's "onboarding" section.
//
// Skip sits in the same spot every screen (the masthead's right slot, where
// every other room puts its Leave/Back link) and goes to exactly where
// finishing the last panel goes: neither one is a way to lose progress,
// because there is no progress to lose here.

import { useEffect, useMemo, useState } from 'react';
import type { FoulType } from '../types.ts';
import { CARDS, CARD_ORDER, type Delta } from '../content/cards.ts';
import { RuleCardFull, RuleCards } from './RuleCards.tsx';
import { Dialogue } from './Dialogue.tsx';
import { Mast } from './Mast.tsx';
import { PitchCopy } from './Pitch.tsx';

interface Props {
  onDone: () => void;
}

type Panel =
  | { kind: 'idea' }
  | { kind: 'foul'; rule: FoulType; n: number }
  | { kind: 'quiz'; mode: 'right' | 'wrong' }
  | { kind: 'preview' };

const PANELS: Panel[] = [
  { kind: 'idea' },
  { kind: 'foul', rule: 'judging', n: 1 },
  { kind: 'foul', rule: 'opinion_as_fact', n: 2 },
  { kind: 'foul', rule: 'fake_listening', n: 3 },
  { kind: 'quiz', mode: 'right' },
  { kind: 'quiz', mode: 'wrong' },
  { kind: 'preview' },
];

/** Every delta line across all three cards, so a quiz can draw from the whole
 *  lesson rather than repeating whichever card the player saw two screens ago. */
const DELTA_POOL: Delta[] = CARD_ORDER.flatMap((rule) => CARDS[rule].deltas);

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

/** Three options built off three distinct deltas, so no two ever repeat the
 *  same example line. `target` is which half of each delta is the one the
 *  player should be able to name: 'fix' for "spot the right one", 'bad' for
 *  "spot the wrong one". */
function buildQuiz(target: 'fix' | 'bad'): QuizOption[] {
  const picks = shuffled(DELTA_POOL).slice(0, 3);
  const other = target === 'fix' ? 'bad' : 'fix';
  const options = picks.map((d, i) => ({
    text: i === 0 ? d[target] : d[other],
    answer: i === 0,
  }));
  return shuffled(options);
}

export function Onboarding({ onDone }: Props) {
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(false);
  useEffect(() => setAnswered(false), [i]);

  // Shuffled once per mount, not per panel visit: the two quizzes should not
  // reshuffle if the step counter is ever made steppable backward later.
  const rightQuiz = useMemo(() => buildQuiz('fix'), []);
  const wrongQuiz = useMemo(() => buildQuiz('bad'), []);

  const panel = PANELS[i];
  const last = i === PANELS.length - 1;
  const isQuiz = panel.kind === 'quiz';

  const next = () => {
    if (last) {
      onDone();
      return;
    }
    setI(i + 1);
  };

  return (
    <div className="page page-onboarding">
      <Mast
        slim
        right={
          <button className="link" onClick={onDone}>
            Skip
          </button>
        }
      />

      <div className="ob-stage">
        {panel.kind === 'idea' && <IdeaPanel />}
        {panel.kind === 'foul' && <FoulPanel rule={panel.rule} n={panel.n} />}
        {panel.kind === 'quiz' && (
          <QuizPanel
            key={panel.mode}
            mode={panel.mode}
            options={panel.mode === 'right' ? rightQuiz : wrongQuiz}
            onAnswered={() => setAnswered(true)}
          />
        )}
        {panel.kind === 'preview' && <PreviewPanel />}
      </div>

      <div className="ob-foot">
        <div className="ob-dots" aria-hidden="true">
          {PANELS.map((_, n) => (
            <span key={n} className={`ob-dot${n === i ? ' is-on' : ''}${n < i ? ' is-done' : ''}`} />
          ))}
        </div>
        <button className="btn btn-wide" disabled={isQuiz && !answered} onClick={next}>
          {last ? "Let's go" : 'Next'}
        </button>
        <p className="ob-count muted">
          {i + 1} of {PANELS.length}
        </p>
      </div>
    </div>
  );
}

function IdeaPanel() {
  return (
    <div className="ob-idea">
      <p className="ob-step-label">The idea</p>
      <PitchCopy />
    </div>
  );
}

function FoulPanel({ rule, n }: { rule: FoulType; n: number }) {
  const card = CARDS[rule];
  return (
    <div className="ob-foul">
      <p className="ob-step-label">Foul {n} of 3</p>
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
  mode,
  options,
  onAnswered,
}: {
  mode: 'right' | 'wrong';
  options: QuizOption[];
  onAnswered: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  const pick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    onAnswered();
  };

  return (
    <div className="ob-quiz">
      <p className="ob-step-label">{mode === 'right' ? 'Quiz · round 1' : 'Quiz · round 2'}</p>
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

/** A short, guided look at calling a foul: the real specimen strip, the real
 *  rule-card rail with one card live, and the real fixed line once it is
 *  called. The bad/fix pair is drawn from the cards, same as the quizzes. */
function PreviewPanel() {
  const [called, setCalled] = useState(false);
  const [demo] = useState<{ rule: FoulType } & Delta>(() => {
    const rule = CARD_ORDER[Math.floor(Math.random() * CARD_ORDER.length)];
    return { rule, ...CARDS[rule].deltas[0] };
  });

  return (
    <div className="ob-preview">
      <p className="ob-step-label">How a round actually looks</p>
      <p className="ob-intro">This is what calling a foul feels like in a real round.</p>

      <div className="drill-table">
        <span className="drill-table-tag">on the table</span>
        <span className="drill-table-text">{demo.bad}</span>
      </div>

      {called ? (
        <Dialogue face={null} text={demo.fix} tone="coach" compact />
      ) : (
        <RuleCards enabled={CARD_ORDER} live={[demo.rule]} onCall={() => setCalled(true)} />
      )}
    </div>
  );
}
