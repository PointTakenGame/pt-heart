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
//
// 2026-08-25, later: the plain medium-dark man was reading as the coach with the
// white hair turned off, so he is bald now. Same demographic, different face
// (Steve: "replace redudant darker-skinned dark skin mustache guy with someone
// else of similar demographic").

/** The corner man. He has a name because you meet him before the first room
 *  (Steve, 2026-08-25); a bullhorn was standing in for a person. */
export const COACH_NAME = 'Coach Ray';
export const COACH_EMOJI = '\u{1F468}\u{1F3FE}\u{200D}\u{1F9B3}'; // man, medium dark, white hair
/** One line, said once, the first time you walk into the gym. */
export const COACH_LINE =
  'Ray. Thirty years in this corner. I do not care who wins tonight, I care that you can still talk to them tomorrow.';

/** Each tile carries what it reads as, because the picker has to lay the grid
 *  out against those two traits and not against the order they are written in.
 *  `tone` is the band the skin-tone modifier falls in, not the modifier itself:
 *  medium-light and medium are one band because nobody scanning a 3x3 grid at
 *  tile size tells them apart. */
const TILES: { emoji: string; gender: 'm' | 'w' | 'n'; tone: 'light' | 'mid' | 'dark' }[] = [
  { emoji: '\u{1F468}\u{1F3FB}', gender: 'm', tone: 'light' }, // man, light
  { emoji: '\u{1F469}\u{1F3FB}', gender: 'w', tone: 'light' }, // woman, light
  { emoji: '\u{1F471}\u{1F3FB}\u{200D}\u{2642}\u{FE0F}', gender: 'm', tone: 'light' }, // blond man, light
  { emoji: '\u{1F469}\u{1F3FB}\u{200D}\u{1F9B0}', gender: 'w', tone: 'light' }, // redheaded woman, light
  { emoji: '\u{1F469}\u{1F3FD}', gender: 'w', tone: 'mid' }, // woman, medium
  { emoji: '\u{1F468}\u{1F3FD}', gender: 'm', tone: 'mid' }, // man, medium
  { emoji: '\u{1F9D1}\u{1F3FC}', gender: 'n', tone: 'mid' }, // person, medium light
  { emoji: '\u{1F468}\u{1F3FE}\u{200D}\u{1F9B2}', gender: 'm', tone: 'dark' }, // bald man, medium dark
  { emoji: '\u{1F469}\u{1F3FE}\u{200D}\u{1F9B1}', gender: 'w', tone: 'dark' }, // woman, medium dark, curly
];

export const PLAYER_AVATARS = TILES.map((t) => t.emoji);

// The neutral person tile, which moved to slot 7 when Steve swapped five and
// seven on 2026-08-25. Pinned by index so the pre-pick fallback face did not
// change along with the list order.
export const DEFAULT_AVATAR = PLAYER_AVATARS[6];

/** The ten strangers a live room can seat, and the one place in this build where
 *  a face carries a name.
 *
 *  Steve's brief of 2026-08-31: "we pick one random emoji from a set of ten that
 *  you curate." These are the nine picker tiles plus a tenth, which puts the
 *  darkest tone back in circulation after the 2026-08-25 trim took it out of the
 *  picker, and lands the set on four light, three mid, three dark and four men,
 *  four women, two neither.
 *
 *  They are named because live play has no boss. `figureLine` writes a turn for a
 *  persona, and "the opponent" is not a persona; a stranger with a first name
 *  argues like a person and an unnamed slot argues like a paragraph. The names
 *  carry no position: which side a stranger takes is assigned at the door, and in
 *  player mode it is always the opposite of whatever the human picked. */
export const ROOM_PEOPLE: { name: string; emoji: string }[] = [
  { name: 'Peter', emoji: TILES[0].emoji },
  { name: 'Hannah', emoji: TILES[1].emoji },
  { name: 'Kyle', emoji: TILES[2].emoji },
  { name: 'Bridget', emoji: TILES[3].emoji },
  { name: 'Rosa', emoji: TILES[4].emoji },
  { name: 'Andre', emoji: TILES[5].emoji },
  { name: 'Robin', emoji: TILES[6].emoji },
  { name: 'Terrence', emoji: TILES[7].emoji },
  { name: 'Nia', emoji: TILES[8].emoji },
  { name: 'Sam', emoji: '\u{1F9D1}\u{1F3FF}' }, // person, dark
];

/** Draw `n` distinct strangers, skipping any face already in the room. Two seats
 *  wearing one face is the failure this exists to prevent. */
export function drawPeople(n: number, taken: string[]): { name: string; emoji: string }[] {
  const pool = ROOM_PEOPLE.filter((p) => !taken.includes(p.emoji));
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/** The picker deals the tiles in a different order every time it opens.
 *
 *  Steve, 2026-08-25: "randomize the fighter emojis choice locations." A fixed
 *  grid teaches a position rather than a face, and the top-left tile collects
 *  picks for being first rather than for being anybody's fighter. Shuffling the
 *  order makes the player actually look at the nine of them.
 *
 *  This is the one place randomness is allowed. It touches presentation only:
 *  the avatar the player lands on is stored as its own emoji, never as an index,
 *  so nothing about a match replays differently. Everything else in the build
 *  stays deterministic (see crowdRow below). */
export function shuffledAvatars(): string[] {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const out = TILES.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (scattered(out)) return out.map((t) => t.emoji);
  }
  // Unreachable in practice: a clean deal turns up in a handful of tries, and
  // 200 of them failing would mean the tile list changed shape. Falling through
  // to an unconstrained order beats looping forever or throwing at the picker.
  return PLAYER_AVATARS.slice();
}

/** No line of three, across or down, is all one gender or all one tone.
 *
 *  Steve, 2026-08-25: "purposely don't allow any one row or column to be any
 *  single gender or race. we don't want to look like we are organizing it in any
 *  way. It should just be a three by three grid that looks random without strong
 *  regularities."
 *
 *  Worth being precise about what this does, because it is the opposite of what
 *  it looks like: a genuinely uniform shuffle produces an all-women row often
 *  enough that a player will meet one, and a grid with a line like that reads as
 *  deliberate sorting. Rejecting those deals is not organising the grid, it is
 *  removing the arrangements that look organised. The cost is that the deal is
 *  no longer uniform over all 9! orders, which nothing here depends on. */
function scattered(g: typeof TILES): boolean {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
  ];
  return lines.every(([a, b, c]) => {
    const sameGender = g[a].gender === g[b].gender && g[b].gender === g[c].gender;
    const sameTone = g[a].tone === g[b].tone && g[b].tone === g[c].tone;
    return !sameGender && !sameTone;
  });
}

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
