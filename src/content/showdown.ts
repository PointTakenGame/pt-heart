// Level 4: the full showdown against Slippery Sofia.
// Design of record: docs/design/2026-08-23_showdown-live-play.md (HEART-T260823-30).
//
// Everything Sofia does is authored here. Her foul schedule is fixed and identical
// every match, because a generated opponent that fouls at random cannot teach a
// specific card, and because a match nobody can reproduce is a match nobody can
// debug. The model writes her wording, never her behaviour.
//
// Political balance is structural rather than editorial in this level. Sofia has no
// position of her own: she argues the opposite of whatever the player argued, so
// whichever side the player picks, the opposition is equally vivid. The authored
// fallback lines below carry the same property, which is why they are written
// topic-agnostic and read a little bare. That is the cost of the guarantee.

import type { FoulType } from '../types.ts';

export const SHOWDOWN_SLUG = 'full-showdown';

/** Sofia's face, on every line she speaks and on the walk-out screen. */
export const SOFIA_EMOJI = '\u{1F471}\u{1F3FB}\u{200D}\u{2640}\u{FE0F}';

export const START_TOKENS = 7;

/** Printed rule: Judging costs two, the other two cost one. */
/**
 * Tokens print as halves, because a missed foul costs half of one (ruling of
 * 2026-08-24: a player who lets everything stand has to see the ledger move).
 * Halves are exact in binary floating point, so the purses never drift and the
 * two sides still add to fourteen after any number of transfers.
 */
export function formatTokens(n: number): string {
  const whole = Math.floor(n);
  if (n - whole < 0.5) return String(whole);
  return whole === 0 ? '\u00bd' : `${whole}\u00bd`;
}

export function foulCost(foul: FoulType): number {
  return foul === 'judging' ? 2 : 1;
}

export const RULE_LABEL: Record<FoulType, string> = {
  judging: 'Judging',
  opinion_as_fact: 'Opinions as Facts',
  fake_listening: 'Fake Listening',
};

export const RULE_GLOSS: Record<FoulType, string> = {
  judging: 'a verdict on the person instead of the argument',
  opinion_as_fact: 'a contested opinion delivered as settled fact',
  fake_listening: 'a summary with no because and no check',
};

/** Milder end of real public policy. Not immigration, not abortion. */
export const TOPICS = [
  'student loan forgiveness',
  'return to office mandates',
  'nuclear power',
];

export type Actor = 'player' | 'sofia';
export type TurnKind = 'speak' | 'summarize';

export interface Turn {
  /** stable item id, saved against the level slug */
  id: string;
  round: number;
  actor: Actor;
  kind: TurnKind;
  /** Sofia only. null means she plays this turn clean. */
  foul: FoulType | null;
  /** Sofia only. Used verbatim when the model is unreachable. */
  fallback?: string;
  /** the coach speaks before this turn */
  intro?: string;
}

// Round order. Round 1 opens on Sofia, on Steve's ruling of 2026-08-24: a player
// who has never seen the shape of a turn cannot be asked to produce one cold, and
// her opening take is the model. Rounds 2 and 3 open on the player, who by then
// has seen it done twice.
//
// Four turns a round, two each. Whoever speaks first that round also gets
// summarized first, so the pair always reads as take, playback, take, playback.
//
// Foul schedule, and the one documented deviation: §4 of the governing design says
// she never fouls twice in a row. With six turns and a fully clean round 2, the most
// non-adjacent fouls available is two, which cannot cover three cards. Round 3
// breaks adjacency on purpose, in character, with a coach line in front of it.
// Steve's call to keep or cut: see §8 of the spec.
export const TURNS: Turn[] = [
  // Round 1. She goes first, clean, so the shape is on the table before the
  // player is asked for one.
  {
    id: 'l4-r1-sofia-open',
    round: 1,
    actor: 'sofia',
    kind: 'speak',
    foul: null,
    intro:
      'She goes first. Watch the shape: a take, then a because. Yours is going to look like that.',
    fallback:
      'Here is where I land. I think the cost of this ends up on people who had no say in it, because the bill always finds the people with the least room to argue. That is my read, and I could be wrong about how big it is.',
  },
  {
    id: 'l4-r1-summary',
    round: 1,
    actor: 'player',
    kind: 'summarize',
    foul: null,
    intro: 'Play her back. Her reason has to survive the trip, and then check that you got it.',
  },
  {
    id: 'l4-r1-speak',
    round: 1,
    actor: 'player',
    kind: 'speak',
    foul: null,
    intro: 'Now your side of it. Say what you actually think. I am watching your turns too.',
  },
  {
    id: 'l4-r1-sofia-speak',
    round: 1,
    actor: 'sofia',
    kind: 'speak',
    foul: 'opinion_as_fact',
    fallback:
      'Here is the thing though. That approach obviously does not work. Everyone knows what happens when you try it, and we have been through this before.',
  },

  // Round 2. The player opens, and she plays the whole round completely straight.
  {
    id: 'l4-r2-speak',
    round: 2,
    actor: 'player',
    kind: 'speak',
    foul: null,
    intro: 'New round. You are up first this time.',
  },
  {
    id: 'l4-r2-sofia-summary',
    round: 2,
    actor: 'sofia',
    kind: 'summarize',
    foul: null,
    fallback:
      'Let me play that back to you. It bugs you that the burden sits where it does, because you think the people carrying it did not create it. Have I got that right?',
  },
  {
    id: 'l4-r2-sofia-speak',
    round: 2,
    actor: 'sofia',
    kind: 'speak',
    foul: null,
    fallback:
      'Let me put my actual reasoning on the table. I think the cost falls on people who had no say in creating it, and I would rather fix the thing that keeps generating the cost than keep moving it around after the fact. That is where I land, and I could be wrong about the size of it.',
  },
  {
    id: 'l4-r2-summary',
    round: 2,
    actor: 'player',
    kind: 'summarize',
    foul: null,
    intro: 'Play her back. Nothing she just said was a foul, which is the hard part.',
  },

  // Round 3. She is behind, and she gets sloppy twice.
  {
    id: 'l4-r3-speak',
    round: 3,
    actor: 'player',
    kind: 'speak',
    foul: null,
    intro: 'Last round. She is behind. Watch her get sloppy, and do not get sloppy with her.',
  },
  {
    id: 'l4-r3-sofia-summary',
    round: 3,
    actor: 'sofia',
    kind: 'summarize',
    foul: 'fake_listening',
    fallback: 'Right, right. I hear you, you are frustrated about the whole thing. Anyway.',
  },
  {
    id: 'l4-r3-sofia-speak',
    round: 3,
    actor: 'sofia',
    kind: 'speak',
    foul: 'judging',
    fallback:
      'Look, you are only arguing this because it happens to work out well for you. People in your position always land exactly here.',
  },
  {
    id: 'l4-r3-summary',
    round: 3,
    actor: 'player',
    kind: 'summarize',
    foul: null,
    intro: 'Play her back one last time. She just fouled at you; that does not buy you one.',
  },
];

export const OPENING = {
  ask: 'What are you two actually disagreeing about? One line is plenty.',
  placeholder: 'we disagree about...',
  chips: TOPICS,
};

export const COACH = {
  intro: [
    'This is the whole thing. Three rounds, both of you on the clock, all three cards live.',
    'Seven tokens each. A foul does not burn a token, it hands one over. Judging costs two. The other two cost one each. Let one of hers go past you and half a token crosses anyway. Empty and you are done, whatever the round says.',
    'She is Slippery Sofia. She does not shout, she does not insult you, and she will foul you twice before you notice once. You whistle her. I whistle you.',
  ],
  /** The hint under the rail while a call is open. The cards are the buttons. */
  callAsk: 'Press the card to call it, or let it stand.',
  /** correct card named on a fouled line */
  onHit: (foul: FoulType, cost: number) =>
    `Called it. ${RULE_LABEL[foul]}: ${RULE_GLOSS[foul]}. That is ${cost} to you.`,
  /** any card named on a clean line */
  onFalseCall:
    'That one was clean. Coming at your position hard is not a foul, and a bad whistle costs you 1.',
  /**
   * Called the moment the line goes past, not at the end of the round. A
   * training round has to answer fast or the answer is not attached to
   * anything (ruling of 2026-08-24). A miss costs half a token, so the player
   * who lets everything stand watches the ledger drain anyway.
   */
  onMissed: (foul: FoulType, cost: number) =>
    `You let one go: ${RULE_LABEL[foul]}, ${RULE_GLOSS[foul]}. She keeps her token and takes ${formatTokens(cost)} of yours for the miss.`,
  onWrongCard: (called: FoulType, actual: FoulType) =>
    `You had the whistle right and the card wrong. That was ${RULE_LABEL[actual]}, not ${RULE_LABEL[called]}. No token moves on a wrong card.`,
  roundClean: 'Nothing missed that round.',
  /** the coach rules on the player, because a player cannot whistle themselves */
  onPlayerFoul: (foul: FoulType, cost: number) =>
    `That is on you. ${RULE_LABEL[foul]}: ${RULE_GLOSS[foul]}. ${cost} to her.`,
  onPlayerClean: 'Clean.',
  /**
   * A Judging or Opinions-as-Facts foul committed inside a summarizing turn.
   * The expensive card gets ruled and paid for, and then the summary still has
   * to be done (ruling of 2026-08-24). Burying a two-token foul in a summary
   * does not convert it into a one-token one.
   */
  redoSummary: (foul: FoulType) =>
    `${RULE_LABEL[foul]} does not get cheaper because it happened inside a summary. That is paid for. The summary still has not been done. Do it again.`,
  ledger: (p: number, s: number) =>
    `End of the round. You ${formatTokens(p)}, her ${formatTokens(s)}.`,
  win: 'You took it. Not because you were right about the policy; I have no idea who was right about the policy. You took it because you stayed on the argument and she did not.',
  loss: 'She took it. Go back and drill the card she kept getting past you.',
  draw: 'Dead even. Which, in this game, is not a bad night.',
  bankrupt: 'You are empty. That ends it, whatever the round said.',
  /**
   * Unreachable by design, and kept anyway. Sofia's authored fouls total four
   * tokens against a seven-token purse, so her floor is three and she cannot be
   * knocked out. Steve's ruling of 2026-08-24: the bosses are training rounds,
   * and ending one early through no fault of the player would cut the training
   * short. Do not "fix" this by giving her a fourth foul.
   */
  bankruptHer: 'She is empty. That ends it right there.',
};

/**
 * What she says to a non-answer. Steve's ruling of 2026-08-24: the game does not
 * move on when the player does not engage, and the refusal cannot come from the
 * coach alone. A coach-only refusal reads as a form validation error. A person
 * across the table declining to answer a stray keystroke reads as the game.
 *
 * Walked in order, not picked at random, for the same reason nothing else in this
 * build is random: two players comparing notes have to have seen one game.
 */
export const SOFIA_THIN = [
  'That is not a sentence. I am not answering it.',
  'Try that again with words in it. I will wait.',
  'You are wasting your own clock, not mine.',
];
