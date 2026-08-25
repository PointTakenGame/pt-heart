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

/**
 * The printed card face, slot for slot.
 *
 * Source: docs/reference/print/v7/card-anatomy.md §B.1 and §B.2, taken off the
 * PPTX XML of the printed deck. Steve, 2026-08-25: "use a UI element that
 * reflects the actual structure of the real card in the PDF game. It's been
 * carefully thought out. Including the wording and the layout."
 *
 * So the wording here is the deck's, not ours, with three exceptions, all of
 * them the house no-em-dash rule: the deck writes "fail - because", "offensive
 * - because" and "[X] - did I miss anything?" with an en or em dash, and those
 * three read here with a comma or a full stop instead. Nothing else is
 * paraphrased. If a line looks wrong, it is wrong on the card too, and the fix
 * is on the card first.
 */
export interface IntroSeg {
  t: string;
  /** set in italic heavy on the printed card, one word or phrase per card */
  em?: boolean;
}

export interface PrintedFace {
  /** all-caps eyebrow above the title, inside the orange header bar */
  eyebrow: string;
  /** "PENALTY" or "DOUBLE PENALTY" */
  penalty: string;
  /** Fake Listening only: its penalty is per missing point, not flat */
  penaltyNote?: string;
  intro: IntroSeg[];
  /** Fake Listening only: the mint procedure strip under the intro */
  band?: string[];
  /** left column, peach: the phrases that set the alarm off */
  smoke: string[];
  /** right column eyebrow: INSTEAD, BEFORE YOUR TURN, or REPHRASE AS */
  insteadLabel: string;
  instead: string[];
  incorrect: string[];
  correct: string[];
  /** the teal footer band: the skill the card trains */
  trains: string;
}

export interface RuleCard {
  rule: FoulType;
  emoji: string;
  name: string;
  /** tokens it costs the person who commits it */
  cost: number;
  /** one line: what the foul actually is */
  what: string;
  /** the two-line description the printed front page uses, verbatim (page 1 of
   *  v7). Shorter than `what` on purpose: it is the size that fits a card small
   *  enough to sit three across before a player has clicked anything. */
  blurb: string;
  /** the shortcut for spotting it */
  tell: string;
  deltas: Delta[];
  /** the shape of the repair, as the card prints it */
  fix: string;
  /** the printed face, rendered whenever the card is shown full size */
  printed: PrintedFace;
}

export const CARDS: Record<FoulType, RuleCard> = {
  judging: {
    rule: 'judging',
    emoji: '\u{1F612}',
    name: 'Judging',
    blurb: 'Verdicts on who they are, or their motives',
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
    printed: {
      eyebrow: 'TONE FOUL',
      penalty: 'DOUBLE PENALTY',
      intro: [
        { t: "Don't render a verdict on who they are, and don't tell them what's in their head. The word " },
        { t: "'You'", em: true },
        { t: ' is a major red flag.' },
      ],
      smoke: [
        "\u201cYou're saying that because\u2026\u201d",
        '\u201cYou only care about\u2026\u201d',
        "\u201cYou don't really believe that\u201d",
        "\u201cYou're an [X]-ist / -phobe\u201d",
        "\u201cYou're so [adjective]\u201d",
      ],
      insteadLabel: 'INSTEAD',
      instead: [
        'Stick to reasoning, not personal attacks',
        'Challenge their argument, not their hidden motives.',
      ],
      incorrect: [
        "\u201cThat's typical conservative / liberal thinking\u201d",
        "\u201cYou just don't care about the poor\u201d",
      ],
      correct: [
        '\u201cI noticed you cited [X] but skipped [Y]\u201d',
        '\u201cI worry that policy would be unfair to the poor\u201d',
      ],
      trains: 'Critique the argument, not the person.',
    },
  },

  opinion_as_fact: {
    rule: 'opinion_as_fact',
    emoji: '\u{1F9D0}',
    name: 'Opinions as Facts',
    blurb: 'Framing your opinion as the one truth',
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
    printed: {
      eyebrow: 'TONE FOUL',
      penalty: 'PENALTY',
      intro: [
        { t: "Don't state a contested opinion as fact. Rule: 'Contested' = other player " },
        { t: 'disagrees', em: true },
        { t: '.' },
      ],
      smoke: [
        '\u201cObviously\u2026\u201d',
        '\u201cOf course\u2026\u201d',
        '\u201cEveryone knows\u2026\u201d',
        "\u201cIt's a fact that\u2026\u201d",
        '\u201cX would cause Y\u2026\u201d',
      ],
      insteadLabel: 'REPHRASE AS',
      instead: [
        'Both halves required',
        '1. \u201cIn my head, [opinion]\u201d',
        '\u201cThe story I tell myself...\u201d',
        '\u201cThe way I think is...\u201d',
        '\u201cI feel like\u2026\u201d',
        '2. \u201cbecause [evidence]\u201d',
      ],
      incorrect: [
        '\u201cThat policy would fail...\u201d',
        "\u201cObviously that's deeply offensive\u201d",
      ],
      correct: [
        '\u201cI feel like that policy would fail, because in the past...\u201d',
        '\u201cIn my head, that felt offensive, because my experience...\u201d',
      ],
      trains: 'Be a role model for comfortable uncertainty.',
    },
  },

  fake_listening: {
    rule: 'fake_listening',
    emoji: '\u{1F643}',
    name: 'Fake Listening',
    blurb: 'Pretending to listen, actually reloading',
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
    printed: {
      eyebrow: 'SUMMARIZATION FOUL',
      penalty: 'PENALTY',
      penaltyNote: 'For each missing major point',
      intro: [
        {
          t: 'Before you respond: show you actually heard them, instead of nodding, while loading your mic-drop rebuttal.',
        },
      ],
      band: [
        'Two steps are required during the Summarize step:',
        '(1) \u201cWhat I heard is [\u2026]\u201d  \u2192  (2) \u201cDid I miss anything?\u201d',
      ],
      smoke: [
        '\u201cI hear you, but\u2026\u201d',
        '\u201cSure, but my point is\u2026\u201d',
        '\u201cRespectfully\u2026\u201d',
        '\u201cFirst of all\u2026\u201d',
      ],
      insteadLabel: 'BEFORE YOUR TURN',
      instead: [
        'Both halves required',
        '1. Generous summary:',
        '\u201cWhat I heard is [\u2026]\u201d',
        '2. \u201cDid I miss anything?\u201d',
        'Thank them for corrections',
      ],
      incorrect: ['\u201cI hear you, but [my opinion]\u201d'],
      correct: ['\u201cWhat I heard is [X]. Did I miss anything?\u201d'],
      trains: 'Set a high bar for respectful listening.',
    },
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
