// The three rule cards, pinned under the thread and live for the whole level.
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
//      time, so the gesture is the same in the gym and in the showdown. Letting
//      it stand is the full-width row above the three cards (Steve, 2026-08-25),
//      so every response to an opponent's line is one gesture in one place.
//
// The tray sits at the bottom of the screen, under the thread and the composer,
// "at the bottom where the action is".
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
  /** the let-it-stand row, present only while a call is open */
  pass?: { label: string; onPass: () => void };
  /**
   * One line of teaching, printed on the tray itself, pointing down at the
   * chips. Nathan ruling Q22: players did not discover that a card opens until
   * somebody told them, and the telling has to happen here rather than in a
   * coach line five panels earlier. It withdraws itself the first time a card
   * is opened, because an instruction you have already followed is clutter.
   */
  hint?: string;
}

export function RuleCards({ enabled, live, onCall, pass, hint }: Props) {
  const [open, setOpen] = useState<FoulType | null>(null);
  const [everOpened, setEverOpened] = useState(false);

  const press = (rule: FoulType) => {
    if (!enabled.includes(rule)) return;
    if (live && onCall) {
      if (!live.includes(rule)) return;
      setOpen(null);
      onCall(rule);
      return;
    }
    setEverOpened(true);
    setOpen((cur) => (cur === rule ? null : rule));
  };

  // The instruction arrives in real time and leaves when it is spent. It is
  // suppressed while a call is open, because at that moment the chips mean
  // something else entirely and two instructions on one control is worse than
  // none.
  const showHint = Boolean(hint) && !everOpened && live === null;

  return (
    <div className="rail-wrap">
      {showHint && (
        <p className="rail-hint">
          {hint}
          <span className="rail-hint-arrow" aria-hidden="true">
            {'\u25BE'}
          </span>
        </p>
      )}
      {pass && (
        <button className="rail-pass" onClick={pass.onPass}>
          {pass.label}
        </button>
      )}
      <div className="rail" role="group" aria-label="Rule cards">
        {CARD_ORDER.map((rule) => {
          const card = CARDS[rule];
          const on = enabled.includes(rule);
          const callable = on && Boolean(live?.includes(rule));
          const dim = !on || (live !== null && !callable);
          return (
            // The slot is just the chip's box now. It used to carry a
            // hover preview of the card above the tray; Steve, 2026-09-07:
            // "Tapping the card ... alternates between having the card appear
            // below the button, which I like, that's great, and then also
            // above the button. Get rid of the above the button one." One
            // surface, below, opened and closed by tapping the chip.
            <div key={rule} className="rail-slot">
              <button
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
                {/* The price, on the thing that charges it, at the moment it can
                    be charged. Off the rest of the time: a number that never
                    changes and never applies is the first thing a player learns
                    to stop reading. */}
                {callable && (
                  <span className="rail-cost" aria-label={`costs ${card.cost}`}>
                    {'\u{1F64F}'.repeat(card.cost)}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
      {open && (
        <div className="rail-open">
          <RuleCardFull rule={open} full />
        </div>
      )}
    </div>
  );
}

/**
 * The short card, as page 1 of the printed deck prints it: the orange header bar
 * with the icon and the name, then two lines of description, and nothing else.
 *
 * This is a different object from RuleCardFull, not a smaller copy of it. The
 * front page's job is to say what the three fouls are before anybody has agreed
 * to play; the full face's job is to teach one of them. Three of these sit
 * across a phone screen. One full face does not.
 */
export function RuleCardMini({ rule }: { rule: FoulType }) {
  const card = CARDS[rule];
  return (
    <div className="mini-card">
      <div className="mini-head">
        <span className="mini-emoji" aria-hidden="true">
          {card.emoji}
        </span>
        <span className="mini-name">{card.name}</span>
      </div>
      <div className="mini-body">{card.blurb}</div>
    </div>
  );
}

/**
 * The printed face of one card, slot for slot.
 *
 * Rebuilt 2026-08-25 against docs/reference/print/v7/card-anatomy.md, which was
 * read off the XML of the printed deck. Steve: "It's been carefully thought
 * out. Including the wording and the layout." So the order is the printed
 * order, top to bottom: orange header bar with the icon, the foul-type eyebrow,
 * the title and the penalty badge; the rule sentence with its one italic word;
 * the mint procedure strip on Fake Listening only; the peach/mint pair of
 * smoke-alarm terms and what to say instead; the peach/mint pair of worked
 * incorrect and correct examples; and the teal Trains band at the foot.
 *
 * Note the colour: the header is the same orange on all three cards, because
 * the printed deck has no per-foul colour at all. Colour there encodes problem
 * versus solution, peach against mint, and the icon and the title are what tell
 * the fouls apart. The per-foul tint the app uses survives only on the rail
 * chips, where it is doing a job the paper game never had to do.
 *
 * `full` opens the coach's extra examples underneath. Off in the pre-fight
 * stepper, where the card is being taught one panel at a time, and on in the
 * rail, where the player has deliberately opened it to study.
 */
export function RuleCardFull({ rule, full = false }: { rule: FoulType; full?: boolean }) {
  const card: RuleCard = CARDS[rule];
  const p = card.printed;
  return (
    <div className="card-full">
      <div className="card-head">
        <span className="card-emoji" aria-hidden="true">
          {card.emoji}
        </span>
        <span className="card-head-mid">
          <span className="card-eyebrow">{p.eyebrow}</span>
          <span className="card-title">{card.name}</span>
        </span>
        <span className="card-penalty">
          <span className="card-penalty-glyph" aria-hidden="true">
            {'\u{1F64F}'.repeat(card.cost)}
            {'\u2192'}
          </span>
          <span className="card-penalty-label">{p.penalty}</span>
          {p.penaltyNote && <span className="card-penalty-note">{p.penaltyNote}</span>}
        </span>
      </div>

      <p className="card-intro">
        {p.intro.map((seg, i) => (seg.em ? <em key={i}>{seg.t}</em> : <span key={i}>{seg.t}</span>))}
      </p>

      {p.band && (
        <div className="card-band">
          {p.band.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      )}

      <div className="card-pair">
        <div className="card-col card-col-bad">
          <div className="card-col-eyebrow">SMOKE ALARM TERMS</div>
          {p.smoke.map((line) => (
            <div key={line} className="card-col-line">
              {line}
            </div>
          ))}
        </div>
        <div className="card-col card-col-good">
          <div className="card-col-eyebrow">{p.insteadLabel}</div>
          {p.instead.map((line) => (
            <div key={line} className="card-col-line">
              {line}
            </div>
          ))}
        </div>
      </div>

      <div className="card-pair">
        <div className="card-col card-col-bad">
          <div className="card-col-eyebrow">INCORRECT</div>
          {p.incorrect.map((line) => (
            <div key={line} className="card-col-line card-col-eg">
              {line}
            </div>
          ))}
        </div>
        <div className="card-col card-col-good">
          <div className="card-col-eyebrow">CORRECT</div>
          {p.correct.map((line) => (
            <div key={line} className="card-col-line card-col-eg">
              {line}
            </div>
          ))}
        </div>
      </div>

      <div className="card-trains">
        <span className="card-trains-tag">Trains</span>
        <span className="card-trains-line">{p.trains}</span>
      </div>

      {full && (
        <div className="card-more">
          {/* The foul drawn as a person, in one line. It used to render only on
              the walk-out card and the VS splash, both of which a player sees
              once and cannot get back to, and it is the sharpest definition of
              the foul anywhere in the product. Steve, 2026-09-07: put them on
              the foul cards players can tap mid-match, because that is where
              someone looks when they are stuck. Above the tell on purpose:
              first read the person, then read how to spot them. */}
          <p className="card-epithet">{card.epithet}</p>
          <div className="card-col-eyebrow">MORE, FROM THE COACH</div>
          <p className="card-more-tell">{card.tell}</p>
          <ul className="card-deltas">
            {card.deltas.map((d) => (
              <li key={d.bad}>
                <span className="delta-bad">{d.bad}</span>
                <span className="delta-fix">{d.fix}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
