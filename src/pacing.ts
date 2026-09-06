// Shared pacing. The gym ladder and the live showdown are different runners, and
// they have to feel like the same room, so the two numbers that set the rhythm
// live here rather than in either one.
//
// A message dwells for 22ms per character, floored at 600ms and capped at 2500ms,
// and the next one lands BEAT_GAP later. A tap anywhere skips the rest of the
// beat, so a fast reader never waits and a slow one never gets buried.
//
// The gap belongs inside the skippable wait, not after it. Kept outside, it was
// 400ms per line during which the runner reported that it was not waiting, so
// the thread ignored clicks and the drill's Next button did nothing while telling
// the player to go on. Every runner now passes dwellMs(text) + BEAT_GAP to one
// dwell call. If you add a sixth runner, do the same.

export const BEAT_GAP = 400;

export function dwellMs(text: string): number {
  return Math.min(2500, Math.max(600, 22 * text.length));
}
