// The walk-out. Steve's note of 2026-08-24: meeting a boss should land like
// Punch-Out, not like the next paragraph of the same conversation. Full bleed,
// the fight number, the two faces, the crowd, and a button the player has to
// press before anything happens.
//
// The countdown is the whole trick. It costs three seconds and it moves the
// player from reading to playing, which is the thing the gym was missing.
//
// Rebuilt 2026-08-25 as the wedge (Smash Bros ideation B3, shipped on Steve's
// "ship the 3, looks great"). Two faces side by side in a row read as a chart of
// the matchup; two faces on their own slanted grounds read as a fight. The
// countdown state machine below is untouched: the change is entirely in what the
// screen looks like while it runs.

import { useEffect, useState } from 'react';
import { crowdRow } from '../avatars.ts';
import { blipMuted, setBlipMuted, fanfare } from './blip.ts';

interface Props {
  fightNumber: number;
  boss: string;
  bossEmoji: string;
  epithet: string;
  playerEmoji: string;
  onStart: () => void;
  /*  Set only in the referee seat. Nathan, 2026-09-05: "making it victor vs
   *  olivia with a spot on the top or bottom noting the user as the ref." The
   *  player is not in this fight, so their avatar cannot stand on one of the
   *  halves: both halves get a fighter, at the same size because neither of
   *  them is the boss, and the avatar moves down into the name plate, which
   *  stops naming an opponent and starts naming the player's seat. `left` and
   *  `right` are the same two the header purses use (LevelDef.fighters). */
  bout?: {
    left: { name: string; emoji: string };
    right: { name: string; emoji: string };
  };
}

const TICK_MS = 620;

export function BossIntro({
  fightNumber,
  boss,
  bossEmoji,
  epithet,
  playerEmoji,
  onStart,
  bout,
}: Props) {
  // null while waiting on the button, then 3, 2, 1, 0 (0 prints FIGHT).
  const [count, setCount] = useState<number | null>(null);
  const [muted, setMuted] = useState(blipMuted);

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
    <div className={bout ? 'vs vs-bout' : 'vs'}>
      {/* The two halves are full-bleed layers cut by a clip-path, so the seam
          between them is a single diagonal and nothing has to be measured. Each
          one slams in from its own side, 90ms apart, which is the whole
          Smash-Bros effect: the screen assembles itself in front of you instead
          of fading up. */}
      <div className="vs-half vs-you" aria-hidden="true">
        <span className="vs-side">
          <span className="vs-face">{bout ? bout.right.emoji : playerEmoji}</span>
          {bout ? <span className="vs-name">{bout.right.name}</span> : null}
        </span>
      </div>
      <div className="vs-half vs-boss" aria-hidden="true">
        <span className="vs-side">
          <span className="vs-face">{bout ? bout.left.emoji : bossEmoji}</span>
          {bout ? <span className="vs-name">{bout.left.name}</span> : null}
        </span>
      </div>
      <div className="vs-flash" aria-hidden="true" />

      {/* The splash carries its own speaker, because sound is off on every load
          (blip.ts) and the corner box that normally holds the toggle is two
          screens back. Without this the fanfare would be unreachable from the
          one screen it plays on. */}
      <button
        className="vs-mute"
        aria-label={muted ? 'turn the sound on' : 'turn the sound off'}
        onClick={() => {
          setBlipMuted(!muted);
          setMuted(!muted);
        }}
      >
        {muted ? '\u{1F507}' : '\u{1F50A}'}
      </button>

      <div className="vs-front">
        {/* Both halves are decorative, so in the ref seat the matchup lives
            only on screen and the plate names the seat, not the fighters. This
            is the one line that says both out loud. It uses the authored `boss`
            string rather than the two `bout` names, which are lowercase keys
            for the purse header and read badly spoken. */}
        {bout ? <p className="sr-only">{boss}. You are the ref.</p> : null}
        <div className="vs-top">
          <div className="vs-crowd" aria-hidden="true">
            {crowdRow(fightNumber)}
          </div>
          <p className="vs-fight">Fight {fightNumber}</p>
        </div>

        <span className="vs-bolt" aria-hidden="true">
          VS
        </span>

        <div className="vs-bottom">
          {/* The plate names whoever the player is about to be. In a fight
              that is the boss; refereeing one, it is the whistle. */}
          <div className="vs-plate">
            <span>
              {bout ? (
                <>
                  <span aria-hidden="true">{playerEmoji}</span> You are the ref
                </>
              ) : (
                boss
              )}
            </span>
          </div>
          <p className="vs-epithet">{epithet}</p>
          {/* Steve, 2026-08-25: "need some fanfare pre-fight midi 8-bit music
              while the fight card is up." It hangs off the Start press because
              that press is the user gesture the autoplay policy wants, and
              because the piece is written to run about as long as the countdown
              it plays under. Silent unless the speaker above is on. */}
          {count === null ? (
            <button
              className="btn btn-wide vs-start"
              onClick={() => {
                fanfare();
                setCount(3);
              }}
            >
              Start
            </button>
          ) : (
            <p className="vs-count" aria-live="assertive">
              {count > 0 ? count : 'FIGHT'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
