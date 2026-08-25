// The walk-out. Steve's note of 2026-08-24: meeting a boss should land like
// Punch-Out, not like the next paragraph of the same conversation. Full bleed,
// the fight number, the two faces, the crowd, and a button the player has to
// press before anything happens.
//
// The countdown is the whole trick. It costs three seconds and it moves the
// player from reading to playing, which is the thing the gym was missing.

import { useEffect, useState } from 'react';
import { crowdRow } from '../avatars.ts';

interface Props {
  fightNumber: number;
  boss: string;
  bossEmoji: string;
  epithet: string;
  playerEmoji: string;
  onStart: () => void;
}

const TICK_MS = 620;

export function BossIntro({
  fightNumber,
  boss,
  bossEmoji,
  epithet,
  playerEmoji,
  onStart,
}: Props) {
  // null while waiting on the button, then 3, 2, 1, 0 (0 prints FIGHT).
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (count === null) return;
    if (count < 0) {
      onStart();
      return;
    }
    const t = setTimeout(() => setCount(count - 1), TICK_MS);
    return () => clearTimeout(t);
  }, [count, onStart]);

  return (
    <div className="intro">
      <div className="intro-crowd" aria-hidden="true">
        {crowdRow(fightNumber)}
      </div>

      <p className="intro-fight">Fight {fightNumber}</p>

      <div className="intro-vs">
        <div className="intro-side">
          <span className="intro-face" aria-hidden="true">
            {playerEmoji}
          </span>
          <span className="intro-label">You</span>
        </div>
        <span className="intro-versus">VS</span>
        <div className="intro-side">
          <span className="intro-face intro-face-boss" aria-hidden="true">
            {bossEmoji}
          </span>
          <span className="intro-label">{boss}</span>
        </div>
      </div>

      <p className="intro-epithet">{epithet}</p>

      <div className="intro-crowd" aria-hidden="true">
        {crowdRow(fightNumber + 1)}
      </div>

      {count === null ? (
        <button className="btn btn-wide intro-start" onClick={() => setCount(3)}>
          Start
        </button>
      ) : (
        <p className="intro-count" aria-live="assertive">
          {count > 0 ? count : 'FIGHT'}
        </p>
      )}
    </div>
  );
}
