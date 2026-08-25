// Two purses and a title. Steve's ruling of 2026-08-24: the token economy runs
// from level 1, not just in the showdown, and it shows as the printed game shows
// it, icons a side, opponent on the left and player on the right.
//
// Icons rather than a number, because the printed game is icons and because the
// thing worth feeling is the pile getting shorter. Halves are real (a missed call
// costs half), so a half token renders as a clipped icon rather than rounding
// away the only feedback a passive player gets.
//
// Reworked 2026-08-25 on Steve's notes, three of them:
//   "verdict and player, they're emoji cards. Verdict's are higher for some
//    reason, put them on the same vertical point."  -> one row, not two, so the
//    two faces cannot drift apart however many tokens each side is holding.
//   "You don't need to show the grayed out ones on the person who's lost. You
//    just need to show the running total."          -> only owned tokens render,
//    with the count printed beside them. The fourteen tokens in play never leave
//    the table, so one purse growing is the other shrinking and the loss is still
//    legible without ghosts.
//   "When a gratitude token exchanges hands, there should be some quick animation
//    where it moves from one person's stack to the other."  -> flight, below.

import { useLayoutEffect, useRef } from 'react';
import { formatTokens } from '../content/showdown.ts';

const TOKEN = '\u{1F64F}';
const FLIGHT_MS = 520;

interface Purses {
  player: number;
  opponent: number;
  /** whoever is across the table right now */
  opponentLabel: string;
  opponentEmoji: string;
  playerEmoji: string;
}

interface Props {
  title: string;
  teaches: string;
  beatName: string;
  purses: Purses;
}

function Purse({
  value,
  label,
  face,
  side,
  stack,
}: {
  value: number;
  label: string;
  face: string;
  side: 'them' | 'you';
  stack: React.Ref<HTMLSpanElement>;
}) {
  // Only what they still hold. A half token is the last one, clipped.
  const whole = Math.floor(value);
  const half = value - whole >= 0.5;
  return (
    <div className={`purse purse-${side}`} aria-label={`${label} ${formatTokens(value)}`}>
      <span className="purse-face" aria-hidden="true">
        {face}
      </span>
      {/* The count rides next to its owner's face, not next to the middle, so the
          two running totals cannot end up side by side reading as one number. */}
      <span className="purse-count" aria-hidden="true">
        {formatTokens(value)}
      </span>
      <span className="purse-icons" ref={stack} aria-hidden="true">
        {Array.from({ length: whole }, (_, i) => (
          <span key={i} className="tok tok-full">
            {TOKEN}
          </span>
        ))}
        {half && <span className="tok tok-half">{TOKEN}</span>}
      </span>
    </div>
  );
}

/** One token, flying. Fixed to the viewport so no ancestor can clip it, and
 *  removed the moment it lands. Purely decorative: the purses have already
 *  re-rendered with the new counts underneath it. */
function fly(from: HTMLElement | null, to: HTMLElement | null) {
  if (!from || !to || typeof document === 'undefined') return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  if (!a.width || !b.width) return;
  const el = document.createElement('span');
  el.textContent = TOKEN;
  el.setAttribute('aria-hidden', 'true');
  el.className = 'tok-flight';
  el.style.left = `${a.right - 20}px`;
  el.style.top = `${a.top}px`;
  document.body.appendChild(el);
  const dx = b.right - a.right;
  const dy = b.top - a.top;
  const anim = el.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx / 2}px, ${dy - 34}px) scale(1.5)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 0.9 },
    ],
    { duration: FLIGHT_MS, easing: 'cubic-bezier(.34,.9,.4,1)' },
  );
  anim.onfinish = () => el.remove();
  anim.oncancel = () => el.remove();
}

export function Header({ title, teaches, beatName, purses }: Props) {
  const them = useRef<HTMLSpanElement>(null);
  const you = useRef<HTMLSpanElement>(null);
  const was = useRef<{ player: number; opponent: number } | null>(null);

  // Layout effect, not an effect: the rectangles have to be measured after the
  // new counts are in the DOM but before the browser paints, or the token takes
  // off from where the stack used to end.
  useLayoutEffect(() => {
    const prev = was.current;
    was.current = { player: purses.player, opponent: purses.opponent };
    if (!prev) return;
    if (purses.player > prev.player) fly(them.current, you.current);
    else if (purses.opponent > prev.opponent) fly(you.current, them.current);
  }, [purses.player, purses.opponent]);

  return (
    <header className="header">
      <div className="header-mid">
        <div className="header-title">{title}</div>
        <div className="header-sub">
          {teaches} &middot; {beatName}
        </div>
      </div>
      <div className="purses">
        <Purse
          value={purses.opponent}
          label={purses.opponentLabel}
          face={purses.opponentEmoji}
          side="them"
          stack={them}
        />
        <Purse value={purses.player} label="you" face={purses.playerEmoji} side="you" stack={you} />
      </div>
    </header>
  );
}
