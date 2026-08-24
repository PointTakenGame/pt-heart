// Level 2: In my head, because (Opinions as Facts).
// Source: docs/design/2026-08-23_mvp-build-plan.md §4, beats 3A / 3B / 3C, plus
// the cold open and boss from 2026-08-23_full-game-scripts.md §2.
//
// Political balance ledger, keep accurate if you touch the lines:
//   3A items 1 and 2 voice a fiscally conservative objection to loan forgiveness.
//   3A items 3 and 4 voice a pro-regulation and an anti-nuclear position.
//   3B items 1 and 2 sit on the pro-regulation side, items 3 and 4 on the
//   conservative side. 3C holds a single left-leaning claim constant, which is
//   the mechanic, and is counterweighted by 3A opening on the right.

import type { LevelDef } from '../types.ts';

export const level2: LevelDef = {
  slug: 'in-my-head-because',
  title: 'In my head, because',
  teaches: 'Opinions as Facts',
  rule: 'opinion_as_fact',
  boss: 'Obvious Olivia',
  beats: [
    {
      name: 'Own it',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Obvious Olivia. She is the nicest person you will fight all week.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Her move is that she never says "I think". Everything is just how it is, and everybody knows it, and you are the only one being difficult.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Two minutes. One habit: saying your opinion like it is the weather.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'I am going to say four things. Some are fair. Some are me passing off my opinion as fact. Call the ones that cross the line.',
        },

        {
          kind: 'call_or_pass',
          id: 'l2-3a-i1',
          rule: 'opinion_as_fact',
          lane: 'coach',
          line: 'Student loan forgiveness is a handout to people who made bad choices.',
          expected: 'foul',
          onCall:
            'Right. No "I think", no "my read is". I stated my opinion as if it were settled.',
          onPass:
            'That one crossed. I said it like a fact. Watch for the missing "I think".',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-3a-i2',
          rule: 'opinion_as_fact',
          lane: 'coach',
          line: 'My read on student loan forgiveness is that it rewards people who made bad choices.',
          expected: 'clean',
          onCall:
            'Fair instinct, but I owned it. "My read on this is" is exactly the fix.',
          onPass: 'Same opinion, and now it is mine to hold. That is the whole move.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-3a-i3',
          rule: 'opinion_as_fact',
          lane: 'coach',
          line: "The story I'm telling myself is that crypto is obviously a scam.",
          expected: 'foul',
          onCall:
            'Good catch. I said the magic words and then said "obviously" anyway. The phrase is not a password.',
          onPass:
            'This one is sneaky. I used the ownership phrase and still called it obvious. The phrase is not a password.',
        },
        {
          kind: 'edit',
          id: 'l2-3a-i4',
          rule: 'opinion_as_fact',
          ask: 'Your turn, but I will do the typing. Here is a line. Fix it so it is yours.',
          prefill: 'Nuclear power is too dangerous to expand.',
          chips: ['In my head,', 'My read is that', "The story I'm telling myself is"],
          target:
            'The edit must add an ownership marker (I think, my read is, in my head, the story I am telling myself) without smuggling an assertion marker back in (obviously, clearly, everyone knows, the fact is). Adding the prefix and then saying "obviously" fails.',
          fallback:
            'The shape is: "In my head, nuclear power is too dangerous to expand." Same claim, now it is yours to hold.',
        },
        { kind: 'continue', label: 'Next: the part where you say why' },
      ],
    },

    {
      name: 'Because',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Owning it is the easy half. This is the other one: the reason you give after "because".',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Two of these have a "because" and still fail. A reason that only restates the claim is not a reason.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-3b-i1',
          rule: 'opinion_as_fact',
          lane: 'coach',
          line: 'Crypto needs much tighter rules, because it obviously needs tighter rules.',
          expected: 'foul',
          onCall: 'Circular. The reason just says the claim again in a louder voice.',
          onPass:
            'Look at the two halves. They are the same sentence twice. That is not a reason.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-3b-i2',
          rule: 'opinion_as_fact',
          lane: 'coach',
          line: 'Crypto worries me, because the two exchanges I used both froze withdrawals in the same year.',
          expected: 'clean',
          onCall:
            'Fair instinct, but somebody could go and look. That is what makes it a reason.',
          onPass: 'Checkable. Somebody could go and look. That is the bar.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-3b-i3',
          rule: 'opinion_as_fact',
          lane: 'coach',
          line: 'Student loan forgiveness is unfair, because everyone knows it just moves the bill to people who never went.',
          expected: 'foul',
          onCall: 'Right. "Everyone knows" is a headcount, not evidence.',
          onPass:
            'That one crossed. "Everyone knows" is a headcount, not evidence, and it is doing all the work here.',
        },
        {
          kind: 'edit',
          id: 'l2-3b-i4',
          rule: 'opinion_as_fact',
          ask: 'Same deal, I have typed it. Replace the reason with one somebody could go and check.',
          prefill:
            "Federal workers should be back in the office five days a week, because that's obviously how real work gets done.",
          chips: ['because I noticed', 'because the last time', 'because in my team'],
          target:
            'The edit must replace the circular or consensus reason with something checkable: a specific observation, a number, an event, an experience. "Obviously", "everyone knows", and restating the claim all fail.',
          fallback:
            'Something like: "because the two projects we ran remote last year both slipped a month." Small, specific, and somebody could argue with it.',
        },
        { kind: 'continue', label: 'Next: both halves at once' },
      ],
    },

    {
      name: 'Put them together',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Last four. One claim, four ways of saying it. Tell me which halves are there.',
        },
        {
          kind: 'sort',
          id: 'l2-3c-i1',
          rule: 'opinion_as_fact',
          line: 'The federal minimum wage should be raised. Period.',
          options: [
            { value: 'neither', label: 'Neither' },
            { value: 'owned', label: 'Owned only' },
            { value: 'reason', label: 'Reason only' },
            { value: 'both', label: 'Both' },
          ],
          expected: 'neither',
          feedback: {
            neither: 'Neither half. Bare claim, and "Period" is the tell.',
            owned: 'No owner in there. "Period" is the opposite of owning it.',
            reason: 'No reason in there. Nothing after the claim but volume.',
            both: 'Neither half is present. This is the bare claim.',
          },
        },
        {
          kind: 'sort',
          id: 'l2-3c-i2',
          rule: 'opinion_as_fact',
          line: 'In my head, the federal minimum wage should be raised.',
          options: [
            { value: 'neither', label: 'Neither' },
            { value: 'owned', label: 'Owned only' },
            { value: 'reason', label: 'Reason only' },
            { value: 'both', label: 'Both' },
          ],
          expected: 'owned',
          feedback: {
            neither: '"In my head" is the owner. That half is there.',
            owned: 'Owned, and no reason yet. Halfway.',
            reason: 'That is the owner, not the reason. No "because" anywhere.',
            both: 'Owned, but there is no reason attached yet.',
          },
        },
        {
          kind: 'sort',
          id: 'l2-3c-i3',
          rule: 'opinion_as_fact',
          line: 'The federal minimum wage should be raised, because the diner near me lost three cooks last year to a warehouse paying four dollars more.',
          options: [
            { value: 'neither', label: 'Neither' },
            { value: 'owned', label: 'Owned only' },
            { value: 'reason', label: 'Reason only' },
            { value: 'both', label: 'Both' },
          ],
          expected: 'reason',
          feedback: {
            neither: 'The reason is right there, and it is checkable.',
            owned: 'No owner. It still opens as a flat statement of how things are.',
            reason: 'Good reason, no owner. The other half of the pair.',
            both: 'The reason is solid. Nobody said whose opinion it is.',
          },
        },
        {
          kind: 'sort',
          id: 'l2-3c-i4',
          rule: 'opinion_as_fact',
          line: 'In my head the minimum wage should be raised, because the diner near me lost three cooks last year to a warehouse paying four dollars more.',
          options: [
            { value: 'neither', label: 'Neither' },
            { value: 'owned', label: 'Owned only' },
            { value: 'reason', label: 'Reason only' },
            { value: 'both', label: 'Both' },
          ],
          expected: 'both',
          feedback: {
            neither: 'Both halves are in there. Owner at the front, reason at the back.',
            owned: 'Owner at the front, and a checkable reason at the back. Both.',
            reason: 'The reason, yes, and "in my head" at the front. Both.',
            both: 'Both. Same claim as the first one, and now it is arguable instead of just loud.',
          },
        },
        { kind: 'continue', label: 'Face her' },
      ],
    },

    {
      name: 'Obvious Olivia',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Nothing she says will be rude. That is what makes it hard.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-boss-1',
          rule: 'opinion_as_fact',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          line: 'Obviously the market would sort out the coins on its own. Everybody who works in this knows that.',
          expected: 'foul',
          onCall: 'Two markers in one sentence. She did not notice either.',
          onPass: '"Obviously" and "everybody knows", back to back. That is the move.',
        },
        {
          kind: 'call_or_pass',
          id: 'l2-boss-2',
          rule: 'opinion_as_fact',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          line: 'And of course the states that raised their wage floor lost the jobs. That is just what happens.',
          expected: 'foul',
          onCall: 'Same shape, other side of the aisle. She does it to everyone.',
          onPass:
            '"Of course" and "that is just what happens". A claim she could have owned, and did not.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Obvious Olivia',
          text: 'I am not being difficult. These are simply the facts.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Nothing she said was rude and nothing she said was hers.',
        },
        { kind: 'continue', label: 'Finish' },
      ],
    },
  ],
};
