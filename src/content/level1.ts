// Level 1: The word "You" (Judging).
// Source: docs/design/2026-08-23_full-game-scripts.md §1, authored 2026-08-23.
//
// Grammar, four items: one foul, its clean twin on the same topic, one trap that
// sounds nasty and is clean, and one edit_prefilled where the player strips a
// verdict out of a line drafted for them.
//
// Political balance ledger, which is non-negotiable and must stay accurate if the
// lines are touched: item 1 attacks a pro-forgiveness position. Item 4 attacks an
// anti-forgiveness position, and it is the one put in the player's own mouth.
// Items 2 and 3 are policy-neutral.

import type { LevelDef } from '../types.ts';

export const level1: LevelDef = {
  slug: 'the-word-you',
  title: 'The word "You"',
  teaches: 'Judging',
  rule: 'judging',
  boss: 'Verdict Vikram',
  beats: [
    {
      // Not the level title again. The header prints the title and the beat
      // name side by side, so reusing the title there is one label doing
      // nothing twice. The sibling levels name this beat with a verb.
      name: 'Spot it',
      steps: [
        // Cold open. The boss is named and on screen before the drill starts, so
        // the level reads as training for a fight you can already see coming.
        {
          kind: 'say',
          lane: 'coach',
          text: 'That is Verdict Vikram. You are in with him in two minutes.',
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
          text: 'Vikram will use blunt as cover. Do not swing at it.',
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
      name: 'Verdict Vikram',
      steps: [
        { kind: 'say', lane: 'coach', text: 'Here he comes. You know his move.' },
        {
          kind: 'call_or_pass',
          id: 'l1-boss',
          rule: 'judging',
          lane: 'opponent',
          speaker: 'Verdict Vikram',
          line: 'You are against the write-off because you resent people who went to better schools than you.',
          expected: 'foul',
          onCall: 'Called it.',
          onPass: 'That was the move, start to finish. Call it.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Verdict Vikram',
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
