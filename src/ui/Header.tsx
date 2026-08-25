// Two purses and a title. Steve's ruling of 2026-08-24: the token economy runs
// from level 1, not just in the showdown, and it shows as the printed game shows
// it, seven icons a side, opponent on the left and player on the right.
//
// Icons rather than a number, because the printed game is icons and because the
// thing worth feeling is the pile getting shorter. Halves are real (a missed call
// costs half), so a half token renders as a clipped icon rather than rounding
// away the only feedback a passive player gets.
//
// Reworked 2026-08-25 on Steve's note: the stacks are one row of seven at roughly
// three times the old size, and each stack carries its owner's face beside it, so
// there is no reading required to tell whose pile just got shorter. The Leave
// button moved out of here to the page top bar, because sitting next to a stack
// of emoji "it looks like you're leaving the emojis".

import { formatTokens, START_TOKENS } from '../content/showdown.ts';

const TOKEN = '\u{1F64F}';

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
}: {
  value: number;
  label: string;
  face: string;
  side: 'them' | 'you';
}) {
  // Never fewer than seven slots, so the empties read as "spent", not as a
  // shorter purse. A purse that somehow runs over seven grows instead.
  const slots = Math.max(START_TOKENS, Math.ceil(value));
  return (
    <div className={`purse purse-${side}`} aria-label={`${label} ${formatTokens(value)}`}>
      <span className="purse-face" aria-hidden="true">
        {face}
      </span>
      <span className="purse-icons" aria-hidden="true">
        {Array.from({ length: slots }, (_, i) => {
          const left = value - i;
          const state = left >= 1 ? 'full' : left >= 0.5 ? 'half' : 'empty';
          return (
            <span key={i} className={`tok tok-${state}`}>
              {TOKEN}
            </span>
          );
        })}
      </span>
    </div>
  );
}

export function Header({ title, teaches, beatName, purses }: Props) {
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
        />
        <Purse value={purses.player} label="you" face={purses.playerEmoji} side="you" />
      </div>
    </header>
  );
}
