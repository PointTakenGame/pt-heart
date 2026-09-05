// Level 1: The word "You" (Judging).
// Source: docs/design/2026-08-23_full-game-scripts.md §1, authored 2026-08-23.
//
// Grammar, four items: one foul, its clean twin on the same topic, one trap that
// sounds nasty and is clean, and one edit_prefilled where the player strips a
// verdict out of a line drafted for them.
//
// Political balance ledger, which is non-negotiable and must stay accurate if the
// lines are touched. It moved on 2026-08-25 and the new count is worse; read it
// before writing anything else into this file.
//   Judging lines, by who they are aimed at: item 1, item 4, and both of the
//   boss's two fouls now aim at a pro-forgiveness position. Nothing in this
//   level judges an anti-forgiveness one.
//   Item 4 used to be the counterweight: a judgement aimed the other way, and
//   the only one put in the player's own mouth. Steve dictated its replacement
//   text on 2026-08-25 ("You only think that because you want your own loans
//   forgiven"), which flipped it, and B6 added a second boss foul on the same
//   side. Built as dictated and flagged here rather than quietly re-balanced.
//   Clean arguments modelled: item 2 is anti-forgiveness, item 3 is
//   pro-forgiveness (it argues the cost figure down), and both Victor's cost
//   line and the half of item 4 that survives the player's edit are
//   anti-forgiveness.
// So the level now runs 4:0 against forgiveness in the judging column and 3:1 in
// the argument column. One boss can only argue one side, which explains the boss
// lines but not item 4. The counterweight sits in level 2's ledger, which opens
// on the right. Whether that is enough is Steve's call (HEART-T260823-33), and
// this change makes the question sharper than it was.

import type { LevelDef } from '../types.ts';

export const level1: LevelDef = {
  slug: 'about-the-argument',
  title: 'The word "You"',
  teaches: 'Judging',
  rule: 'judging',
  boss: 'Verdict Victor',
  bossEmoji: '\u{1F468}\u{1F3FB}\u{200D}\u{2696}\u{FE0F}',
  // The newline is deliberate. Steve, 2026-08-25: "put a new line before
  // says so." Both places this string lands, the baseball card in the
  // dialogue box and the VS splash, honour it through white-space: pre-line.
  bossEpithet: 'Has already decided what kind of person you are.\nSays so.',
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
          // Dictated by Steve, 2026-08-25, along with what the right answer
          // is: "they should cut the first half." So the exercise is now a
          // deletion rather than a rewrite. The first sentence tells the man
          // his own motive; the second one is a real argument about fairness
          // and survives untouched.
          prefill:
            'You only think that because you want your own loans forgiven. Forgiving some loans is unfair to people who already paid them off.',
          // Chips are droppable sentence openers, not advice. A chip the player
          // taps has to read correctly inside the line they are writing.
          chips: ['The part I disagree with is', 'What that costs me is', "What I'd rather see is"],
          target:
            'The edit must drop the first sentence, the one that tells the other person why they really believe what they believe. What is left has to keep arguing: the fairness point about people who already paid is the part worth sending. Cutting "you only think that because you want your own loans forgiven" is the move.',
          fallback:
            'Here\'s the whole fix if you want it: cut the first sentence and send the second. "Forgiving some loans is unfair to people who already paid them off." Same disagreement, nobody gets read.',
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
        // Steve, 2026-08-25: "When you actually play Victor, he only ever says
        // one thing and then you call him on a foul. Let him say one more thing
        // and then make sure that the person says that it's fair." So the clean
        // line he used to simply deliver is now judged. Letting an honest
        // argument through is the harder half of the skill, and until now the
        // level never asked for it against the boss.
        {
          kind: 'call_or_pass',
          id: 'l1-boss-clean',
          rule: 'judging',
          lane: 'opponent',
          speaker: 'Verdict Victor',
          line: 'Fine. Then argue the cost. It\'s 400 billion dollars, and most of it goes to people who will end up earning more than the people paying for it.',
          expected: 'clean',
          onCall: 'No. He went at the money that time, not at you. A bad whistle costs you.',
          onPass: 'Look at that. Same guy, better argument. That\'s the whole trade.',
        },
        // Steve, same day: "Then make him say one more thing about the player's
        // entire group. Like people who want to forgive loans are just X, and
        // then you have to call them out on it, and then the coach congratulates
        // you, and then Victor actually literally gives ... says he's beaten."
        //
        // The escalation is the point: beaten on the person, beaten on the
        // argument, he reaches for the whole group. That is the same foul at its
        // widest, which is why the card still reads Judging.
        {
          kind: 'call_or_pass',
          id: 'l1-boss-group',
          rule: 'judging',
          lane: 'opponent',
          speaker: 'Verdict Victor',
          line: 'Though let\'s be honest about who I\'m arguing with. People who want these loans wiped are all the same. They want somebody else to carry what they signed for.',
          expected: 'foul',
          onCall: 'Called it. He just sentenced a few million people in one line.',
          onPass: 'He did it to your entire side at once. That is the card. Call it.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'That is the job, start to finish. Two whistles, and you let the honest one through.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Verdict Victor',
          text: 'All right. I\'m beaten. I came in here to tell you what kind of person you are, and you would not take it. I have got nothing left but the argument.',
        },
        { kind: 'continue', label: 'Finish' },
      ],
    },
  ],
};
