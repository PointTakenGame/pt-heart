// The three rule cards, pinned above the thread and live for the whole level.
//
// Steve's ruling of 2026-08-24: the printed cards are the teaching, so they have
// to be on screen through every stage rather than explained once in a coach line
// that scrolls away. Two jobs in one component:
//
//   1. Reference. Tap any card and it opens to the full printed face: what the
//      foul is, the tell, three bad lines with the fix under each, and the shape
//      of the repair. The deltas are the point (Steve: "need the direct deltas").
//   2. The whistle. Pressing a card IS calling that foul. There is no separate
//      row of call buttons any more, and the card sits in the same place every
//      time, so the gesture is the same in the gym and in the showdown.
//
// Greying is honest rather than decorative. A card the level has not taught yet
// is dim and inert. A card that cannot apply at this instant is dim too: Fake
// Listening is impossible on a turn where nobody was summarizing anything, and
// offering it there teaches a foul that is not on the table.

import { useState } from 'react';
import type { FoulType } from '../types.ts';
import { CARDS, CARD_COLOR, CARD_ORDER, type RuleCard } from '../content/cards.ts';

interface Props {
  /** cards this level has taught; the rest render as locked slots */
  enabled: FoulType[];
  /** cards that can be called right now. null means no call is open. */
  live: FoulType[] | null;
  onCall?: (foul: FoulType) => void;
}

export function RuleCards({ enabled, live, onCall }: Props) {
  const [open, setOpen] = useState<FoulType | null>(null);

  const press = (rule: FoulType) => {
    if (!enabled.includes(rule)) return;
    if (live && onCall) {
      if (!live.includes(rule)) return;
      setOpen(null);
      onCall(rule);
      return;
    }
    setOpen((cur) => (cur === rule ? null : rule));
  };

  return (
    <div className="rail-wrap">
      <div className="rail" role="group" aria-label="Rule cards">
        {CARD_ORDER.map((rule) => {
          const card = CARDS[rule];
          const on = enabled.includes(rule);
          const callable = on && Boolean(live?.includes(rule));
          const dim = !on || (live !== null && !callable);
          return (
            <button
              key={rule}
              className={`rail-card${dim ? ' is-dim' : ''}${callable ? ' is-live' : ''}${open === rule ? ' is-open' : ''}`}
              style={{ '--card': CARD_COLOR[rule] } as React.CSSProperties}
              disabled={dim}
              aria-pressed={open === rule}
              onClick={() => press(rule)}
            >
              <span className="rail-emoji" aria-hidden="true">
                {on ? card.emoji : '\u{1F512}'}
              </span>
              <span className="rail-name">{card.name}</span>
              <span className="rail-cost">{card.cost}</span>
            </button>
          );
        })}
      </div>
      {open && (
        <div className="rail-open">
          <RuleCardFull rule={open} />
        </div>
      )}
    </div>
  );
}

/** The printed face of one card. Also used in the thread, where the coach deals
 *  the card out before the drilling on it starts. */
export function RuleCardFull({ rule }: { rule: FoulType }) {
  const card: RuleCard = CARDS[rule];
  return (
    <div className="card-full" style={{ '--card': CARD_COLOR[rule] } as React.CSSProperties}>
      <div className="card-head">
        <span className="card-emoji" aria-hidden="true">
          {card.emoji}
        </span>
        <span className="card-title">{card.name}</span>
        <span className="card-cost">
          {card.cost} token{card.cost === 1 ? '' : 's'}
        </span>
      </div>
      <p className="card-what">{card.what}</p>
      <p className="card-tell">{card.tell}</p>
      <ul className="card-deltas">
        {card.deltas.map((d) => (
          <li key={d.bad}>
            <span className="delta-bad">{d.bad}</span>
            <span className="delta-fix">{d.fix}</span>
          </li>
        ))}
      </ul>
      <p className="card-fix">{card.fix}</p>
    </div>
  );
}
