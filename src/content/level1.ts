// Level 1: The word "You" (Judging).
// Source: docs/design/2026-08-23_full-game-scripts.md §1, authored 2026-08-23.
//
// Grammar, four items: one foul, its clean twin on the same topic, one trap that
// sounds nasty and is clean, and one edit_prefilled where the player strips a
// verdict out of a line drafted for them.
//
// Political balance ledger, which is non-negotiable and must stay accurate if the
// lines are touched.
//   Judging lines, by who they are aimed at: item 1 and the boss line aim at a
//   pro-forgiveness position; item 4 aims at an anti-forgiveness one, and item 4
//   is the one put in the player's own mouth.
//   Clean arguments modelled: item 2 is anti-forgiveness, item 3 is
//   pro-forgiveness (it argues the cost figure down), Victor's closing line is
//   anti-forgiveness.
// So this level runs 2:1 against forgiveness in both columns, because it has one
// boss and a boss only argues one side. Flagged rather than hidden; the
// counterweight sits in level 2's ledger, which opens on the right. Steve's call
// whether that is enough (HEART-T260823-33).

import type { LevelDef } from '../types.ts';

export const level1: LevelDef = {
  slug: 'the-word-you',
  title: 'The word "You"',
  teaches: 'Judging',
  rule: 'judging',
  boss: 'Verdict Victor',
  bossEmoji: '\u{1F468}\u{1F3FB}\u{200D}\u{2696}\u{FE0F}',
  bossEpithet: 'Has already decided what kind of person you are. Says so.',
  beats: [
    {
      // Not the level title again. The header prints the title and the beat
      // name side by side, so reusing the title there is one label doing
      // nothing twice. The sibling levels name this beat with a verb.
      name: 'Spot it',
      steps: [
        // Cold open. Steve's ruling of 2026-08-24: name the argument and both
        // sides of it before anything else, because a player who does not know
        // what is being argued cannot tell a hard argument from a foul, and that
        // distinction is the whole level.
        {
          kind: 'say',
          lane: 'coach',
          text: 'Tonight\u2019s argument: should the government forgive student loan debt?',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'One side says the debt is crushing a generation over a price nobody warned them about. The other side says a write-off sends the bill to people who never went, and does nothing about the prices. Both of those are real arguments. Neither one is a foul.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'You can take either side in here. I do not care which. I care about one rule.',
        },
        // The card itself, before the drill. Pinned in the rail from here on.
        { kind: 'card', rule: 'judging' },
        {
          kind: 'say',
          lane: 'coach',
          text: 'That is Verdict Victor. You are in with him in two minutes.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'He has exactly one move. He tells you what is going on inside your head, and he says it like a doctor reading a chart off a clipboard.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Four lines coming at you. Some of them are his move. Some are just somebody disagreeing with you hard, which is allowed. Learn the difference now and he has nothing.',
        },

        {
          kind: 'call_or_pass',
          id: 'l1-i1',
          rule: 'judging',
          lane: 'coach',
          line: 'You only want the loans forgiven because you happen to have one.',
          expected: 'foul',
          onCall:
            'That is a verdict on why they believe it, not on whether they are right. Their debt does not make the argument wrong.',
          onPass:
            'That one crossed. It is a verdict on why they believe it, not on whether they are right. Their debt does not make the argument wrong.',
        },
        {
          kind: 'call_or_pass',
          id: 'l1-i2',
          rule: 'judging',
          lane: 'coach',
          line: 'Forgiving the balances does nothing about the tuition prices that made them.',
          expected: 'clean',
          onCall:
            'Fair instinct, but nothing there is about the person. That is an argument about the policy.',
          onPass: 'Cold, and completely fair. That is an argument about the policy.',
        },
        {
          kind: 'call_or_pass',
          id: 'l1-i3',
          rule: 'judging',
          lane: 'coach',
          line: 'That number is wrong. CBO put it at about a third of that.',
          expected: 'clean',
          onCall:
            'Blunt is not a foul. They came at the figure, not at you.',
          onPass: 'Right. They came at the figure, not at you.',
        },
        // Callback, so the frame does not go quiet mid-level.
        {
          kind: 'say',
          lane: 'coach',
          text: 'Victor will use blunt as cover. Do not swing at it.',
        },

        {
          kind: 'edit',
          id: 'l1-i4',
          rule: 'judging',
          ask: 'Your turn, and I have done the typing. This is about to go out under your name. Take the verdict out of it and leave the argument in.',
          prefill: 'You got yours and now you want to pull the ladder up behind you.',
          // Chips are droppable sentence openers, not advice. A chip the player
          // taps has to read correctly inside the line they are writing.
          chips: ['The part I disagree with is', 'What that costs me is', "What I'd rather see is"],
          target:
            'The edit must stop rendering a verdict on the person or their motives. It should aim at the argument, the cost, or what they would do instead. Removing "you got yours" and "pull the ladder up" style motive-reading is the move.',
          fallback:
            'Here is the version from the card, if you want a model: "I noticed you costed the write-off but not the tuition side." Same disagreement, no verdict.',
        },

        { kind: 'continue', label: 'Face him' },
      ],
    },
    {
      name: 'Verdict Victor',
      boss: true,
      steps: [
        { kind: 'say', lane: 'coach', text: 'Here he comes. You know his move.' },
        {
          kind: 'call_or_pass',
          id: 'l1-boss',
          rule: 'judging',
          lane: 'opponent',
          speaker: 'Verdict Victor',
          line: 'You want the write-off because you have never once had to think about who pays for it, and you would rather not start now.',
          expected: 'foul',
          onCall: 'Called it.',
          onPass: 'That was the move, start to finish. Call it.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Verdict Victor',
          text: 'Fine. Then argue the cost. It is 400 billion dollars and it goes mostly to people who will out-earn the people paying for it.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Look at that. Same guy, better argument. That is the entire trade.',
        },
        { kind: 'continue', label: 'Finish' },
      ],
    },
  ],
};
