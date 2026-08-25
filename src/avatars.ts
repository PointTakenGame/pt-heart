// Faces. Steve's note of 2026-08-24: the bosses and the coach get big emoji, the
// player picks their own, "should feel liek mortal kombat".
//
// The picker list is deliberately spread across skin tones and presentations, and
// deliberately short: twelve is enough that most people find one they will accept
// and few enough to fit a phone screen without a scroll.

export const COACH_EMOJI = '\u{1F4E3}';

export const PLAYER_AVATARS = [
  '\u{1F468}\u{1F3FB}', // man, light
  '\u{1F469}\u{1F3FB}', // woman, light
  '\u{1F9D1}\u{1F3FC}', // person, medium light
  '\u{1F468}\u{1F3FD}', // man, medium
  '\u{1F469}\u{1F3FD}', // woman, medium
  '\u{1F9D4}\u{1F3FD}', // bearded person, medium
  '\u{1F468}\u{1F3FE}', // man, medium dark
  '\u{1F469}\u{1F3FE}\u{200D}\u{1F9B1}', // woman, medium dark, curly
  '\u{1F9D1}\u{1F3FE}', // person, medium dark
  '\u{1F468}\u{1F3FF}', // man, dark
  '\u{1F469}\u{1F3FF}', // woman, dark
  '\u{1F9D1}\u{1F3FF}', // person, dark
];

export const DEFAULT_AVATAR = PLAYER_AVATARS[3];

/** The ring, between rounds and when somebody lands one. */
export const CROWD_ROWS = [
  '\u{1F44F}\u{1F3FD} \u{1F64C}\u{1F3FF} \u{1F44F}\u{1F3FB} \u{1F929} \u{1F44F}\u{1F3FE}',
  '\u{1F62E} \u{1F440} \u{1F62E}\u{200D}\u{1F4A8} \u{1F440} \u{1F633}',
  '\u{1F525} \u{1F44F}\u{1F3FC} \u{1F525} \u{1F64C}\u{1F3FD} \u{1F525}',
  '\u{1F92B} \u{1F440} \u{1F92B} \u{1F440} \u{1F92B}',
];

/** Deterministic, because a replayed match has to replay the same (no randomness
 *  anywhere in this build: two players comparing notes have to see one game). */
export function crowdRow(n: number): string {
  return CROWD_ROWS[Math.abs(n) % CROWD_ROWS.length];
}
