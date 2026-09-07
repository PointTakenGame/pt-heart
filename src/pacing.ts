// Shared pacing. The gym ladder and the live showdown are different runners, and
// they have to feel like the same room, so the two numbers that set the rhythm
// live here rather than in either one.
//
// A message dwells for 33ms per character, floored at 900ms and capped at 5200ms,
// then the next one lands 700ms later. A tap anywhere skips the current dwell, so
// a fast reader never waits and a slow one never gets buried.
//
// Slowed on 2026-09-05 (Nathan, playtest finding 9: "the automated messages from
// the coach and boss come too fast, especially when there are 3+ in a row"). It
// was 22ms/char capped at 2500 with a 400ms gap, which gave a 300-character
// coach line 2.9 seconds — about a third of the time it takes to read one, and
// three of those in a row went by as a blur. The cap was doing most of the
// damage: every line long enough to be worth pausing on hit it and got the same
// short beat as a five-word one. Skipping is what protects the fast reader here,
// not a low ceiling, and since finding 8 the gap is inside the skippable dwell,
// so there is no longer any part of a wait a tap cannot cut through.

export const BEAT_GAP = 700;

/** How long a tap that arrived with nothing to skip stays latched.
 *
 *  Both runners clear `skipper.current` and drop `waiting` before the dwell
 *  resolves, so there is a render tick between two autoplay lines where a tap
 *  has nothing to act on. It is latched instead, and the next dwell eats it
 *  (Nathan, 2026-09-05, playtest finding 11: the boss thread "occasionally
 *  freezes"). Wide enough to cover that tick, narrow enough that a stray tap
 *  never reaches a line the player has not seen yet. */
export const SKIP_LATCH_MS = 250;

export function dwellMs(text: string): number {
  return Math.min(5200, Math.max(900, 33 * text.length));
}

/**
 * How long a printed rule card sits before the thread moves on.
 *
 * The card step used to hold a hand-set 2200ms of its own, outside this module.
 * That was chosen when a line was 22ms/char capped at 2500; after finding 9
 * slowed every line down, the card had quietly become the *fastest* beat in the
 * gym — the one moment that is a new object to look at rather than a sentence to
 * read went by quicker than the sentences around it. Same formula as a line, run
 * over the name and blurb the mini card actually prints, with a floor because a
 * card is a thing to look at and 50 characters understates it.
 */
export function cardDwellMs(text: string): number {
  return Math.max(3000, dwellMs(text));
}
