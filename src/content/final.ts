// Level 7: the Final Showdown, against Stonewall Sung-min.
//
// The only place in the game where humility is scored positively. Everywhere
// else a token moves because somebody fouled; here a token can move toward the
// player because they were generous to the person they are arguing with.
//
// Source: the FINAL SHOWDOWN ROUND card, transcribed in
// docs/reference/print/v7/deck-content-v7.md. Three steps, and a three-column
// scoring table under each of them: follows the rules (nothing moves), earns a
// humility bonus (a token toward the player), is Naughty (a token away). The
// three verdicts in this file are those three columns, and the wording the boss
// checks each step against is lifted from the card's own examples, in
// api/coach.ts.
//
// Why the boss never fouls: roadmap section 6. Sung-min gives the player nothing
// to catch, so the only way to move the ledger is to be generous. A player who
// arrives here with a good whistle and no generosity loses.
//
// POLITICAL BALANCE. Structural, exactly as in Level 4 and for the same reason:
// Sung-min has no position of his own and argues the opposite of whatever the
// player argued, so whichever side the player picks, the opposition is equally
// vivid. Nothing in this file states a political position, and nothing in it
// should ever start to.

import type { PrefightStep, TemplateSegment } from '../types.ts';
import { LEVEL_ID } from './ids.ts';

export const FINAL_SLUG = 'final-showdown';
export const FINAL_ID = LEVEL_ID.final;

export const SUNGMIN = 'Stonewall Sung-min';
export const SUNGMIN_EMOJI = '\u{1F468}\u{1F3FB}';
export const SUNGMIN_EPITHET = 'Gives you nothing to whistle. You will have to be generous instead.';

/**
 * How he argues. His position is never authored; this is manner only, and it is
 * the whole character: immovable, and scrupulously clean while he is immovable.
 */
export const SUNGMIN_MANNER =
  'You are calm, precise, and completely immovable. You concede nothing and you never budge, ' +
  'but you never foul either: no verdicts on the other person, no contested claim delivered as ' +
  'settled fact, and every summary you give keeps their reason and checks that you got it right. ' +
  'You are the hardest kind of opponent, the kind who is doing everything correctly and still ' +
  'will not agree with you.';

/**
 * What a bonus moves, and what a naughty step costs. One token each way, from the
 * printed table: the bonus column and the naughty column each carry a single
 * token arrow, in opposite directions.
 *
 * Worth knowing, because it looks like an inconsistency and is not: a naughty
 * Step 2 or Step 3 is a Judging foul in substance, and Judging costs two
 * everywhere else in the game. It costs one here. The card is explicit that the
 * Final Showdown is a different scoring mode, run once, with its own table, so
 * this file follows the table rather than the foul card.
 */
export const BONUS = 1;
export const NAUGHTY = 1;

export type StepKey = 'super_summary' | 'what_i_learned' | 'why_we_disagree';

export interface FinalStep {
  /** stable item id, saved against the level slug */
  id: string;
  key: StepKey;
  /** the header line while this step is open */
  phase: string;
  /** the coach, before the player types */
  intro: string;
  /** where the bonus is, said plainly, because a bonus nobody knows about is not a bonus */
  bonusHint: string;
  segments: TemplateSegment[];
  /** used when the model is unreachable and nobody can rule */
  fallback: string;
}

/**
 * The player's turns are sentence frames here too, same as the showdown: a hint
 * outside the box is advice, and a player under pressure types past advice
 * (Steve, 2026-08-24). These three frames are the three steps of the printed
 * card, cut down to the two blanks each one actually needs.
 */
export const STEPS: FinalStep[] = [
  {
    id: 'l7-super-summary',
    key: 'super_summary',
    phase: 'Step 1 of 3 · Super-Summary',
    intro:
      'Step one. Say his whole side back to him, better than he said it. Not your side, his.',
    bonusHint:
      'The bonus is in the second blank: give him an argument for his own position that he never made. ' +
      'You have to actually think about his side to find one. That is the point.',
    segments: [
      { text: 'You believe' },
      { input: { placeholder: 'his view, in your words' } },
      { text: '. I would add,' },
      { input: { placeholder: 'a point for his side he never made' } },
      { text: '. Did I miss anything?' },
    ],
    fallback: 'That is roughly where I stand, yes.',
  },
  {
    id: 'l7-what-i-learned',
    key: 'what_i_learned',
    phase: 'Step 2 of 3 · What I Learned',
    intro: 'Step two. Tell him what you took from this. Something specific he said, not a compliment.',
    bonusHint:
      'The bonus is admitting you moved. Not all the way, just where you actually moved. ' +
      'And watch yourself here: "I learned that you do not get this" is a verdict, and it costs you one.',
    segments: [
      { text: 'What I learned is' },
      { input: { placeholder: 'the thing of his that moved you' } },
      { text: '.' },
    ],
    fallback: 'Noted.',
  },
  {
    id: 'l7-why-we-disagree',
    key: 'why_we_disagree',
    phase: 'Step 3 of 3 · Why We Might Still Disagree',
    intro:
      'Last one. You two are not going to agree tonight. Say why you think he lands where he lands.',
    bonusHint:
      'The bonus is naming something good in it: the value underneath his position, said so he would ' +
      'be glad to be described that way. Say it as a thing he is missing and you pay one.',
    segments: [
      { text: 'I think we still land in different places because you' },
      { input: { placeholder: 'what he cares about' } },
      { text: '.' },
    ],
    fallback: 'That is fair enough.',
  },
];

/**
 * The argument that comes before the three steps. Short on purpose: the printed
 * card runs the Final Showdown after three full rounds, and three rounds plus
 * three steps is a level nobody finishes. Four turns is enough to give both
 * sides something to be generous about, which is all the steps need.
 *
 * His summarize turn is written as a Super-Summary, with a novel point for the
 * player's side, so the player has seen the step done once before being asked
 * for one. It is the only one of the three steps Levels 5 and 6 never modelled.
 */
export interface ArgumentTurn {
  id: string;
  actor: 'player' | 'sungmin';
  kind: 'speak' | 'summarize';
  intro?: string;
  /** sung-min only, used verbatim when the model is unreachable */
  fallback?: string;
  /** sung-min only: the move for this turn, when it is a specific one */
  frame?: string;
}

export const ARGUMENT: ArgumentTurn[] = [
  {
    id: 'l7-open',
    actor: 'sungmin',
    kind: 'speak',
    intro: 'He opens. Listen properly, because in about four minutes you have to argue his side for him.',
    fallback:
      'Here is where I stand. I think the cost of this lands on people who never agreed to carry it, ' +
      'and I would rather fix what keeps generating the cost than keep moving it around afterwards.',
  },
  {
    id: 'l7-player-summary',
    actor: 'player',
    kind: 'summarize',
    intro: 'Play him back. His reason has to survive the trip, and then check that you got it.',
  },
  {
    id: 'l7-player-speak',
    actor: 'player',
    kind: 'speak',
    intro: 'Now your side. Give him something worth summarizing.',
  },
  {
    id: 'l7-sungmin-summary',
    actor: 'sungmin',
    kind: 'summarize',
    intro: 'Watch this one closely. It is the move you have to make in a minute.',
    frame:
      'Give them a Super-Summary. Restate their whole position back to them better than they put it, ' +
      'keep their reason, and then add one point FOR their side that they did not make themselves. ' +
      'Say plainly that you are adding it, with something like "I would even add". Finish by asking ' +
      'whether you missed anything. Do not rebut any of it.',
    fallback:
      'So your position is that the burden sits in the wrong place, because the people carrying it ' +
      'did not create it. I would even add that the current arrangement is expensive to administer, ' +
      'which is an argument on your side I have not heard you make. Did I miss anything?',
  },
];

/**
 * Sung-min's answer to the player's summary of him, in the warm-up rounds.
 *
 * Steve, 2026-09-06: "Did I miss anything?" is not a separate mechanic. It is
 * answered by whether the other person calls a listening foul, and silence means
 * the summary was correct. Against a cooked opponent that silence has to be
 * spoken, because nothing on screen tells "he agreed" apart from "the software
 * did not answer", and the player was asking the question into a room where only
 * the coach ever spoke back.
 *
 * Both banks exist here, unlike the room's, because the boss was silent on both
 * paths: a foul in the warm-up was priced by the coach alone and Sung-min, the
 * person actually summarized, never said whether it was his point or not.
 *
 * He answers before the coach prices it, one verdict in two voices, so software
 * is never seen overruling the person who was in the room (soul.md section 6).
 *
 * Voice: he is the one man in the building who never fouls and never gloats.
 * The no is disappointed rather than triumphant, and it says what was dropped
 * rather than scoring a point off the dropping. Walked in order, not sampled.
 *
 * Side-neutral by construction, and it has to stay that way: the warm-up topic
 * is whichever of the three the player picked, so a line that leaned would lean
 * on a subject nobody chose for it.
 */
export const SUNGMIN_HEARD = [
  'That is my position, and you kept the reason attached to it. Not everyone does.',
  'Yes. You did not shave anything off it to make it easier to argue with.',
  'That is mine, all of it. Thank you for taking the trouble.',
];

export const SUNGMIN_NOT_HEARD = [
  'Not quite. You have my position and you have left my reason out of it, and the reason is the part I care about.',
  'That is close to my words and some way off my point. The why did not survive.',
  'No. What came back is thinner than what I said, and the missing part is the part I would defend.',
];

export const FINAL_OPENING = {
  ask: 'What are you two arguing about tonight? One line.',
  placeholder: 'we disagree about...',
  chips: ['student loan forgiveness', 'return to office mandates', 'nuclear power'],
};

export const FINAL_COACH = {
  /** said once, before the topic */
  open: 'Seven each, same as always. He will not hand you a single foul, so stop hunting for one.',
  callAsk: 'Press a foul card to call it, or say it is not a foul.',
  onFalseCall:
    'Clean. I told you he would be. A bad whistle still costs you 1, and that is how he beats people.',
  onStand: 'Right. Nothing there.',
  /** before the three steps begin */
  turn:
    'That is the argument. Now the part nobody practises. Three steps, and every one of them is you being ' +
    'good to him. Get them right and he hands you tokens. There is no other way to score in this round.',
  bonus: (n: number) => `He gave you that one. ${n} to you.`,
  rules: 'That counts. Nothing moves, and nothing was supposed to.',
  naughty: (n: number) => `That landed on him, and it costs you ${n}.`,
  win: 'You took it off the hardest man in the building, and not one token of it came from catching him out. That is the whole game.',
  loss: 'He kept it. Go back and look at the three steps, because that is where this was lost, not in the argument.',
  draw: 'Even, against a man who never gave you a thing. I will take that.',
  ledger: (p: number, s: number) => `You ${p}, him ${s}.`,
  /** An empty purse ends the match wherever it happens, same as Level 4. */
  bankrupt: 'You are empty. That ends it, whatever round we were in.',
  /** Only reachable through the bonus column, which is the point: the one way to
   *  knock him out is to be good to him three times running. */
  bankruptHim: 'He is out, and every token of it he handed you himself. Nobody in this building has done that.',
};

/** Walked in order, never random, same as Sofia's. */
export const SUNGMIN_THIN = [
  'That is not an answer. I will wait.',
  'Say it properly or do not say it.',
  'You are burning your own clock.',
];

export const FINAL_PREFIGHT: PrefightStep[] = [
  { kind: 'line', text: FINAL_COACH.open },
  {
    kind: 'line',
    text: 'This one is not about the cards. He does not foul. Three rounds of looking for one and you will end up whistling at nothing, and that costs you every time.',
  },
  { kind: 'card', rule: 'judging' },
  {
    kind: 'line',
    text: 'You argue first, four turns, and then the Final Showdown: summarize his side better than he did, say what you learned, and say why you two still land apart. He rules on all three. Be generous and he pays you.',
  },
];
