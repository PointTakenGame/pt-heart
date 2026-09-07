// Live play: everything the room says, and the schedule it argues on.
//
// Design of record: game/docs/live-play.md (HEART-T260831-17).
//
// The gym authors every line a boss can say, because a gym level is teaching one
// specific card and the lesson survives only if the specimen is exact. A room has
// no author: the topic is whatever the human typed, so nothing here can be
// written in advance except the coach's framing and the shape of the match.
//
// What that costs, and what it does not: the foul schedule stays authored in kind
// even though it cannot be authored in wording. Roadmap section 7 item 9 is blunt
// that a live model will not dependably commit exactly one named foul while
// staying in character, so the room keeps the gym's arrangement, where the level
// decides which turns are dirty and the model only writes the sentence.

import type { FoulType } from '../types.ts';
import { LEVEL_ID } from './ids.ts';

/** Every live match saves against this one slug. The gym saves per level; live
 *  play has no levels, and the rulings a human makes here are worth keeping
 *  whatever topic produced them. */
export const ROOM_SLUG = 'live-room';
export const ROOM_ID = LEVEL_ID.liveRoom;

export type Seat = 'player' | 'referee';

/** The printed deck's twelve, from docs/reference/print/v7/deck-content-v7.md.
 *
 *  Harder than the gym's three on purpose. `TOPICS` in showdown.ts is scoped to
 *  "the milder end of real public policy, not immigration, not abortion" because
 *  the gym is where the cards get learned. The room is where they get used, and
 *  the printed deck has never flinched on this list.
 *
 *  Neutrality is structural here rather than paired: each of these is a
 *  proposition the human picks a side of, and the stranger takes the other side of
 *  whatever they picked. No side is authored anywhere in this file. */
export const LIVE_TOPICS = [
  'Student loan debt for community college degrees should be forgiven',
  'Standardized tests for college should be eliminated due to unfairness or bias',
  'Individuals facing persecution should be allowed temporary asylum in my country',
  'Health insurance should be free for everyone',
  'A researcher who argues women have a genetic disadvantage in math should be allowed to present on a college campus',
  'A non-violent person who entered without documentation 20 years ago should be deported, even if it breaks up a family',
  'Sugary soda should be taxed for health effects, like cigarettes',
  'Athletes should join sports teams based on gender identity, not sex at birth',
  'The death penalty should be allowed for confident conviction of premeditated murder',
  'Cryptocurrency should be legal tender',
  'People should be allowed to own military-grade automatic weapons',
  'The AI industry should be substantially regulated',
];

/** The printed footer under the sample topics, verbatim. It is better advice than
 *  anything we would write to replace it. */
export const TOPIC_FOOTER = 'Better: use that real disagreement you have been carrying.';

export const ROUNDS = 3;

export interface RoomTurn {
  id: string;
  round: number;
  /** In player mode: 'human' or 'a', where 'a' is the stranger. In referee mode:
   *  'a' and 'b', both strangers, and the human never speaks. */
  actor: 'human' | 'a' | 'b';
  kind: 'speak' | 'summarize';
  /** The stranger's instruction, not a prediction. Always null on a human turn. */
  foul: FoulType | null;
}

const FOULS: FoulType[] = ['judging', 'opinion_as_fact', 'fake_listening'];

/**
 * One in three of the strangers' turns carries an instructed foul.
 *
 * UNRESOLVED (HEART-T260831-20): the rate. One in three matches what the gym
 * levels author, which is the only defensible number available tonight; live play
 * may want to run hotter so the referee has more to do, or to scale with the
 * player's whistle accuracy. Steve or Nathan decides. This constant is the whole
 * change when they do.
 */
export const FOUL_RATE = 1 / 3;

/**
 * Build the match. Rounds are symmetric: each side speaks once and summarizes
 * once, so nobody gets the last word by construction and a round is a pair of
 * turns per side rather than one turn (roadmap section 5).
 *
 * Fake Listening is only ever scheduled onto a summarizing turn, because it is a
 * summary's foul. Instructing it onto a speaking turn produces a model that
 * either ignores the instruction or invents a summary nobody asked for.
 */
export function buildMatch(seat: Seat): RoomTurn[] {
  const order: RoomTurn['actor'][] =
    seat === 'player' ? ['a', 'human', 'human', 'a'] : ['a', 'b', 'b', 'a'];
  const kinds: RoomTurn['kind'][] = ['speak', 'summarize', 'speak', 'summarize'];

  const turns: RoomTurn[] = [];
  for (let r = 1; r <= ROUNDS; r += 1) {
    for (let i = 0; i < order.length; i += 1) {
      turns.push({
        id: `live-r${r}-${i}`,
        round: r,
        actor: order[i],
        kind: kinds[i],
        foul: null,
      });
    }
  }

  // Round 1's opening turn stays clean in both modes. It is the first thing
  // anybody sees, and a room that opens on a foul reads as a broken room rather
  // than as a dirty player.
  const eligible = turns
    .map((t, i) => ({ t, i }))
    .filter(({ t, i }) => t.actor !== 'human' && i > 0);

  const wanted = Math.max(1, Math.round(eligible.length * FOUL_RATE));
  for (let i = eligible.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }
  for (const { t } of eligible.slice(0, wanted)) {
    const pool = t.kind === 'summarize' ? FOULS : FOULS.filter((f) => f !== 'fake_listening');
    t.foul = pool[Math.floor(Math.random() * pool.length)];
  }

  return turns;
}

/**
 * The two sides of the proposition, assigned rather than chosen.
 *
 * UNRESOLVED (HEART-T260831-19): in player mode nobody authors a side, because the
 * stranger mirrors whatever the human took. Referee mode has no human position to
 * mirror, so a coin flip decides who argues for and who argues against. That is
 * mechanical and defensible and it is what ships tonight; whether some topics need
 * a hand-written stance pair is Steve's call.
 */
export function stances(topic: string): { a: string; b: string } {
  const forIt = `You are arguing FOR this: ${topic}. Argue it as someone who actually believes it.`;
  const against = `You are arguing AGAINST this: ${topic}. Argue it as someone who actually believes the other side.`;
  return Math.random() < 0.5 ? { a: forIt, b: against } : { a: against, b: forIt };
}

/** The stranger in player mode takes the other side of whatever the human said,
 *  the same way Sofia does in Level 4, which is what keeps the room balanced
 *  without anybody writing a position down. */
export function mirrorStance(topic: string): string {
  return (
    `The topic is: ${topic}. Take the opposite side from whatever the other person ` +
    'just argued. Do not agree with them and do not soften into agreement. You are ' +
    'a real person with a real disagreement, not a debate exercise.'
  );
}

export const ROOM_COACH = {
  /**
   * The coach in live play stops teaching. Roadmap section 7 item 12: in the gym
   * he argues a side or spars with the player; in a room he only nominates. These
   * lines are deliberately thinner than the gym's for that reason.
   */
  playerOpen:
    'This is a real one. I am not arguing tonight and I am not scoring you. I watch your turns, and if I think one of them crossed a line I say so out loud. They decide whether I was right.',
  refereeOpen:
    'You have the whistle and nothing else. These two argue, you call what you see, and the one who got hit decides whether your call lands. Nobody here is scoring you either.',
  yourCall: 'Your call.',
  stands: 'Called. That is yours to say, and it stands.',
  letStand: 'Let it stand.',
  /** The coach's nomination on the human's own turn, before the stranger rules. */
  nominating: (label: string) => `Hold on. I think that one was ${label}.`,
  upheld: (who: string, n: number) => `${who} took it. ${n} to them.`,
  declined: (who: string) => `${who} let it go. Nothing moves.`,
  clean: 'Clean.',
  bust: 'You are out of tokens. That is the match.',
  bustThem: 'They are out. That is the match.',
  over: 'That is three rounds.',
} as const;

export const ROOM_THIN = [
  'That is not an answer. Try again.',
  'You are going to have to give me more than that.',
  'I am still waiting for your actual point.',
];

/**
 * What the summarized stranger says when the human's summary of them was right.
 *
 * Steve, 2026-09-06: "Did I miss anything?" is not a separate mechanic. It is
 * answered by whether the other person calls a listening foul, and silence means
 * the summary was correct. In a room with two humans that silence is legible,
 * because a person who says nothing has visibly chosen to say nothing. Against a
 * cooked opponent it is not: nothing on screen distinguishes "she agreed" from
 * "the software forgot to answer", and it read as the latter.
 *
 * So the stranger says the yes out loud. The no already had a voice: a nominated
 * foul goes to affirmCall and the stranger rules on it in their own words, which
 * is why there is no NOT_HEARD bank here and why adding one would make them
 * answer twice.
 *
 * The stranger speaks before the coach prices it, one verdict in two voices, so
 * the software is never seen overruling the person who was in the room
 * (soul.md section 6).
 *
 * Walked in order rather than sampled, like ROOM_THIN and for the same reason: a
 * bank this short repeats visibly under random draw.
 *
 * These are side-neutral by construction and must stay that way. A room has no
 * fixed topic, so a line that leaned would lean in whichever direction the
 * stranger happened to be assigned, which is worse than leaning on purpose.
 */
export const STRANGER_HEARD = [
  'That is it. You kept my reason, which is the part I expected to lose.',
  'Yes, that is what I said. All of it, not just the easy half.',
  'You got it. I would not have put it better myself.',
];

/**
 * What a stranger says when the model is unreachable.
 *
 * The gym authors a fallback per turn, which it can do because it knows the topic
 * in advance. A room does not, so these have to work on any proposition, which is
 * why they talk about cost and about who had a say and never about the thing
 * itself. They read as thin, and thin is the honest look for a dead key.
 *
 * The dirty ones matter more than the clean ones. A fallback set that is always
 * clean leaves the referee with nothing real to call, so the offline room becomes
 * a room where the whistle does nothing.
 */
export const FALLBACK: Record<'speak' | 'summarize', Record<string, string>> = {
  speak: {
    clean:
      'Here is where I land, and the reason matters to me more than the position does: the people carrying the cost of this had the least say in it. I could be wrong about how big that is.',
    judging:
      'Look, anybody who actually thinks this through does not end up where you ended up. It is not a serious position and I think you know that.',
    opinion_as_fact:
      'The facts here are not in dispute. Everyone knows how this plays out, it has been settled for years, and there is no honest way to read it otherwise.',
    fake_listening:
      'Here is where I land, and the reason matters to me more than the position does: the people carrying the cost of this had the least say in it.',
  },
  summarize: {
    clean:
      'So what I heard is that the cost is your real worry, because you think it lands on people who did not choose it. Did I miss anything?',
    judging:
      'So you think the cost is the problem, which is the sort of thing people say when they have never had to make the hard call themselves. Did I get that right?',
    opinion_as_fact:
      'So your worry is the cost, and that is just wrong, because the numbers on this have been settled for years.',
    fake_listening:
      'Right, so you are against it. Anyway, here is the thing I actually wanted to say.',
  },
};
