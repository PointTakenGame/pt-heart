// Shared pacing. The gym ladder and the live showdown are different runners, and
// they have to feel like the same room, so the two numbers that set the rhythm
// live here rather than in either one.
//
// A message dwells for 22ms per character, floored at 600ms and capped at 2500ms,
// then the next one lands 400ms later. A tap anywhere skips the current dwell, so
// a fast reader never waits and a slow one never gets buried.

export const BEAT_GAP = 400;

export function dwellMs(text: string): number {
  return Math.min(2500, Math.max(600, 22 * text.length));
}
