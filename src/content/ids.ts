// Permanent level ids.
//
// Ruling HEART-T260906-03: a level's slug is a label and may be renamed; the
// save key is a permanent id and may not. Before this file, `cleared` in
// localStorage was keyed by slug, so renaming a rung silently wiped every
// playtester's progress on it. That is not hypothetical. All three gym rungs
// have already been renamed once: `the-word-you` became `about-the-argument`,
// `in-my-head-because` became `my-opinion-not-a-fact`, and `did-i-miss-anything`
// became `the-summary-gate`. Everyone who had cleared them lost them.
//
// An id is a plain integer, assigned once and never reused. It is deliberately
// not derived from the title, the order, the file name, or the slug: anything
// derived from a human-readable string can be changed by someone editing that
// string for a good reason, which is the whole failure this replaces. Numbers
// here are not ladder positions either. Reordering the ladder changes nothing
// in this file.
//
// Rules for adding one: take the next free integer, never re-point an existing
// one, never delete a line, and add the rung's shipping slug to LEGACY_SLUG_IDS
// below so saves written before the rename still resolve.

export type LevelId = number;

export const LEVEL_ID = {
  /** gym 1, the Judging drill */
  gymJudging: 1,
  /** gym 2, the Opinion as Fact drill */
  gymOpinion: 2,
  /** gym 3, the Fake Listening drill */
  gymSummary: 3,
  /** the full match against the boss */
  showdown: 4,
  /** the referee's chair */
  refereeSeat: 5,
  /** referee, what I learned */
  refereeLearned: 6,
  /** referee, why we disagree */
  refereeDisagree: 7,
  /** the Final Showdown, with the humility bonuses */
  final: 8,
  /** live play, two people at one device */
  liveRoom: 9,
} as const;

/** The next integer to hand out. Bump it when you take one. */
export const NEXT_FREE_LEVEL_ID = 10;

/**
 * Every slug a rung has ever shipped under, pointing at its permanent id.
 *
 * Read once, at load, to carry a save written before ids existed onto the new
 * key. Both the current slugs and the retired ones are here on purpose: a
 * playtester who cleared `the-word-you` in August gets that clear back.
 *
 * **Never delete a line.** A line removed here is a save silently reset.
 */
export const LEGACY_SLUG_IDS: Record<string, LevelId> = {
  // gym 1
  'the-word-you': LEVEL_ID.gymJudging,
  'about-the-argument': LEVEL_ID.gymJudging,
  // gym 2
  'in-my-head-because': LEVEL_ID.gymOpinion,
  'my-opinion-not-a-fact': LEVEL_ID.gymOpinion,
  // gym 3
  'did-i-miss-anything': LEVEL_ID.gymSummary,
  'the-summary-gate': LEVEL_ID.gymSummary,
  // the rest have not been renamed yet
  'full-showdown': LEVEL_ID.showdown,
  'the-third-chair': LEVEL_ID.refereeSeat,
  'referee-what-i-learned': LEVEL_ID.refereeLearned,
  'referee-why-we-disagree': LEVEL_ID.refereeDisagree,
  'final-showdown': LEVEL_ID.final,
  'live-room': LEVEL_ID.liveRoom,
};
