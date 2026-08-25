// Faces. Steve's note of 2026-08-24: the bosses and the coach get big emoji, the
// player picks their own, "should feel liek mortal kombat".
//
// The picker list was trimmed on 2026-08-25 (Steve): the twelve-tile grid ran a
// long tail of near-identical darker tones, the bearded tile read as one specific
// guy rather than a generic fighter, and there was only one recognisable white
// man. Nine tiles now, which is a clean three by three, and every tile is
// distinguishable from every other at picker size. Note the consequence: the
// darkest tone is no longer offered in the picker. That was the literal shape of
// "first eight in your list" and it is Steve's to reverse.

/** The corner man. He has a name because you meet him before the first room
 *  (Steve, 2026-08-25); a bullhorn was standing in for a person. */
export const COACH_NAME = 'Coach Ray';
export const COACH_EMOJI = '\u{1F468}\u{1F3FE}\u{200D}\u{1F9B3}'; // man, medium dark, white hair
/** One line, said once, the first time you walk into the gym. */
export const COACH_LINE =
  'Ray. Thirty years in this corner. I do not care who wins tonight, I care that you can still talk to them tomorrow.';

export const PLAYER_AVATARS = [
  '\u{1F468}\u{1F3FB}', // man, light
  '\u{1F469}\u{1F3FB}', // woman, light
  '\u{1F471}\u{1F3FB}\u{200D}\u{2642}\u{FE0F}', // blond man, light
  '\u{1F469}\u{1F3FB}\u{200D}\u{1F9B0}', // redheaded woman, light
  '\u{1F9D1}\u{1F3FC}', // person, medium light
  '\u{1F468}\u{1F3FD}', // man, medium
  '\u{1F469}\u{1F3FD}', // woman, medium
  '\u{1F468}\u{1F3FE}', // man, medium dark
  '\u{1F469}\u{1F3FE}\u{200D}\u{1F9B1}', // woman, medium dark, curly
];

export const DEFAULT_AVATAR = PLAYER_AVATARS[4];

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
