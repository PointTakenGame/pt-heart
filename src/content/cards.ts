// The three printed cards, in the words the printed game uses.
//
// Source: docs/reference/print/v6/humility-showdown-rules-summary.md, which is the
// distilled export of Steve's Keynote master. Copy is adapted only where the print
// layout does not survive a phone screen (and to drop the em dash the print copy
// uses in the Opinions-as-Facts fix). Do not invent new bad examples here: every
// line below is either printed on the card or a direct restatement of one, because
// the card in the app has to be the card on the table.
//
// Each card teaches by delta. A bad line on its own is a warning; a bad line with
// the fixed version underneath it is a lesson (Steve, 2026-08-24: "need the direct
// deltas").

import type { FoulType } from '../types.ts';

export interface Delta {
  bad: string;
  fix: string;
}

export interface RuleCard {
  rule: FoulType;
  emoji: string;
  name: string;
  /** tokens it costs the person who commits it */
  cost: number;
  /** one line: what the foul actually is */
  what: string;
  /** the shortcut for spotting it */
  tell: string;
  deltas: Delta[];
  /** the shape of the repair, as the card prints it */
  fix: string;
}

export const CARDS: Record<FoulType, RuleCard> = {
  judging: {
    rule: 'judging',
    emoji: '\u{1F612}',
    name: 'Judging',
    cost: 2,
    what: 'A verdict on who the person is, or a claim about what they secretly want, instead of an answer to what they said.',
    tell: '"You" statements are the smoke alarm. If the sentence is about them rather than about the argument, it is this card.',
    deltas: [
      {
        bad: 'You are only saying that because it works out well for you.',
        fix: 'That argument works out well for you, which is worth naming, and I still want to answer it on the merits.',
      },
      {
        bad: 'You do not actually care about the people this hits.',
        fix: 'I do not see who covers the cost in your version. Who does?',
      },
      {
        bad: 'You got yours and now you want to pull the ladder up behind you.',
        fix: 'The part I disagree with is the cutoff date, because it lands on people who were one year late.',
      },
    ],
    fix: 'Attack the argument, not the person.',
  },

  opinion_as_fact: {
    rule: 'opinion_as_fact',
    emoji: '\u{1F9D0}',
    name: 'Opinions as Facts',
    cost: 1,
    what: 'A contested opinion delivered as settled truth, with nobody named as the one who holds it.',
    // The fair-game half of the rule, added 2026-08-24 (HEART-T260824-21): players
    // kept calling this card on owned opinions, which is exactly backwards.
    tell: 'Openers like "Obviously", "Of course", "Everyone knows", "It is a fact that", and "Look," are the tells. Anything with an owner on the front of it, "in my head", "my read is", "I think", is fair game and cannot be called as a fact-claim.',
    deltas: [
      {
        bad: 'Obviously nuclear power is too dangerous to expand.',
        fix: 'In my head, nuclear power is too dangerous to expand, because the cleanup bill lands on people who never voted for the plant.',
      },
      {
        bad: 'Everyone knows a higher minimum wage kills small businesses.',
        fix: 'My read is that a higher minimum wage squeezes small businesses, because two shops on my street cut hours the month it went up.',
      },
      {
        bad: 'Look, crypto is a scam.',
        fix: 'The story I am telling myself is that crypto is mostly a scam, because I have watched three exchanges fail with customer money inside them.',
      },
    ],
    fix: 'Two parts, both of them: "In my head, [opinion], because [something checkable]."',
  },

  fake_listening: {
    rule: 'fake_listening',
    emoji: '\u{1F643}',
    name: 'Fake Listening',
    cost: 1,
    what: 'Reloading your rebuttal while they talk, then playing back a version of it that leaves out the part you cannot answer.',
    tell: 'The hinge words: "I hear you, but", "Sure, but my point is", "Respectfully", "First of all". Anything after the comma is the rebuttal you already had loaded.',
    deltas: [
      {
        bad: 'I hear you, but that is not how any of this works.',
        fix: 'What I heard was that the commute costs you two hours a day. Did I miss anything?',
      },
      {
        bad: 'Right, right. You are frustrated about the whole thing. Anyway.',
        fix: 'What I heard was that childcare is the piece that does not move, because the hours are fixed. Did I miss anything?',
      },
      {
        bad: 'Sure, but my point is the numbers do not add up.',
        fix: 'So your reason is the numbers, not the principle. Did I get that right?',
      },
    ],
    fix: 'Say their view back, including their reason, then ask: "Did I miss anything?"',
  },
};

/** Rail order, left to right, the same order the cards sit on the table. */
export const CARD_ORDER: FoulType[] = ['judging', 'opinion_as_fact', 'fake_listening'];

/** Theme colour per card, so a card looks the same everywhere it appears. */
export const CARD_COLOR: Record<FoulType, string> = {
  judging: 'var(--orange)',
  opinion_as_fact: 'var(--purple)',
  fake_listening: 'var(--teal)',
};
