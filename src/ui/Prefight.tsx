// The corner, before the door opens.
//
// Steve, 2026-08-25: "The coach needs to have an actual identity and you need to
// meet the coach before you go into the room. There needs to be a splash screen
// for that." And the setup that used to arrive as seven stacked chat lines runs
// here instead, "like a stepper instead of a barf of a bunch of vertically
// stacked cat lines".
//
// One thing on screen at a time, a Next button, and the printed rule card dealt
// out on its own panel rather than buried in the scrollback. The player controls
// the pace, so nothing scrolls away before it is read.
//
// The meet-the-coach panel is prepended once, the first time ever, and never
// again; a corner man who reintroduces himself before every fight is not a
// person, he is a tooltip.

import { useState } from 'react';
import type { PrefightStep } from '../types.ts';
import { COACH_EMOJI, COACH_NAME, COACH_LINE } from '../avatars.ts';
import { hasMetCoach, markMetCoach } from '../storage.ts';
import { RuleCardFull } from './RuleCards.tsx';

interface Props {
  steps: PrefightStep[];
  /** what the last button says, e.g. "Into the room" */
  enterLabel: string;
  onEnter: () => void;
  onExit: () => void;
}

type Panel = PrefightStep | { kind: 'meet' };

export function Prefight({ steps, enterLabel, onEnter, onExit }: Props) {
  // Read once, at mount, so the panel does not vanish out from under the player
  // the moment we mark him met.
  const [panels] = useState<Panel[]>(() =>
    hasMetCoach() ? steps : [{ kind: 'meet' } as Panel, ...steps],
  );
  const [i, setI] = useState(0);

  const panel = panels[i];
  const last = i === panels.length - 1;

  const next = () => {
    if (panel.kind === 'meet') markMetCoach();
    if (last) {
      onEnter();
      return;
    }
    setI(i + 1);
  };

  return (
    <div className="page page-prefight">
      <div className="page-topbar">
        <button className="link" onClick={onExit}>
          Leave
        </button>
      </div>

      <div className="pf-stage">
        {panel.kind === 'meet' ? (
          <div className="pf-meet">
            <span className="pf-face pf-face-big" aria-hidden="true">
              {COACH_EMOJI}
            </span>
            <h1 className="pf-meet-name">{COACH_NAME}</h1>
            <p className="pf-meet-role">your corner</p>
            <div className="pf-bubble pf-bubble-wide">{COACH_LINE}</div>
          </div>
        ) : panel.kind === 'card' ? (
          <div className="pf-card">
            <div className="pf-said">
              <span className="pf-face" aria-hidden="true">
                {COACH_EMOJI}
              </span>
              <div className="pf-bubble">This is the card. It stays on the wall all night.</div>
            </div>
            <RuleCardFull rule={panel.rule} />
          </div>
        ) : (
          <div className="pf-said pf-said-line">
            <span className="pf-face" aria-hidden="true">
              {COACH_EMOJI}
            </span>
            <div className="pf-bubble">{panel.text}</div>
          </div>
        )}
      </div>

      <div className="pf-foot">
        <div className="pf-dots" aria-hidden="true">
          {panels.map((_, n) => (
            <span key={n} className={`pf-dot${n === i ? ' is-on' : ''}${n < i ? ' is-done' : ''}`} />
          ))}
        </div>
        <button className="btn btn-wide" onClick={next}>
          {last ? enterLabel : 'Next'}
        </button>
        <p className="pf-count muted">
          {i + 1} of {panels.length}
        </p>
      </div>
    </div>
  );
}
