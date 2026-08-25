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
  // Said in the corner, before the door opens. Steve's ruling of 2026-08-24
  // (name the argument and both sides of it before anything else, because a
  // player who does not know what is being argued cannot tell a hard argument
  // from a foul) now runs as the stepper rather than as seven chat lines.
  prefight: [
    {
      kind: 'line',
      text: 'Tonight\u2019s argument: should the government forgive student loan debt?',
    },
    {
      kind: 'line',
      text: 'One side says young people got buried by a price nobody warned them about. The other side says wiping the debt just hands the bill to people who never went, and does nothing about the price. Both of those are real arguments. Neither one is a foul.',
    },
    {
      kind: 'line',
      text: 'You can take either side in here. I don\'t care which. I care about one rule.',
    },
    // Steve, 2026-08-25: "start with 'your opponent is...' then show the card
    // that is your defense against his attack." So: the man, his move, and
    // only then the card, which now reads as the answer to it rather than as
    // a rule handed down before anybody has a problem.
    {
      kind: 'line',
      text: 'That\'s Verdict Victor. You\'re in with him in two minutes.',
    },
    {
      kind: 'line',
      text: 'He has one move. He tells you what you\'re thinking, and what kind of person that makes you. Says it flat, like he\'s reading it off a chart.',
    },
    // Pinned in the tray from here on.
    { kind: 'card', rule: 'judging' },
  ],
  beats: [
    {
      // Not the level title again. The header prints the title and the beat
      // name side by side, so reusing the title there is one label doing
      // nothing twice. The sibling levels name this beat with a verb.
      name: 'Spot it',
      steps: [
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
            'That\'s about why they want it, not about whether they\'re right. Having a loan doesn\'t make you wrong.',
          onPass:
            'That one crossed. It\'s about why they want it, not about whether they\'re right. Having a loan doesn\'t make you wrong.',
        },
        {
          kind: 'call_or_pass',
          id: 'l1-i2',
          rule: 'judging',
          lane: 'coach',
          line: 'Forgiving the balances does nothing about the tuition prices that made them.',
          expected: 'clean',
          onCall:
            'Good instinct, but nothing in there is about the person. That one goes after the plan.',
          onPass: 'Cold, and completely fair. That one goes after the plan.',
        },
        {
          kind: 'call_or_pass',
          id: 'l1-i3',
          rule: 'judging',
          lane: 'coach',
          line: 'That number is way too high. The real cost is closer to a third of that.',
          expected: 'clean',
          onCall: 'Blunt isn\'t a foul. They went after the number, not after you.',
          onPass: 'Right. They went after the number, not after you.',
        },
        // Callback, so the frame does not go quiet mid-level.
        {
          kind: 'say',
          lane: 'coach',
          text: 'Victor will use blunt as cover. Don\'t swing at it.',
        },

        {
          kind: 'edit',
          id: 'l1-i4',
          rule: 'judging',
          ask: 'Your turn, and I already did the typing. This one goes out with your name on it. Cut the part that judges him, keep the part that argues.',
          prefill: 'You got yours and now you want to pull the ladder up behind you.',
          // Chips are droppable sentence openers, not advice. A chip the player
          // taps has to read correctly inside the line they are writing.
          chips: ['The part I disagree with is', 'What that costs me is', "What I'd rather see is"],
          target:
            'The edit must stop guessing at what the person wants or why they want it. It should go after the idea itself, what it costs, or what the writer would rather see. Cutting "you got yours" and "pull the ladder up behind you" is the move.',
          fallback:
            'Here\'s one off the card if you want it: "You added up what the write-off costs, but not what the tuition costs." Same disagreement, nobody gets judged.',
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
          text: 'Fine. Then argue the cost. It\'s 400 billion dollars, and most of it goes to people who will end up earning more than the people paying for it.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Look at that. Same guy, better argument. That\'s the whole trade.',
        },
        { kind: 'continue', label: 'Finish' },
      ],
    },
  ],
};
