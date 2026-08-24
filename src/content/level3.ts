// Level 3: Did I miss anything (Fake Listening).
// Source: docs/design/2026-08-23_mvp-build-plan.md §4, Beat 4 (the ten-step table),
// plus the cold open and the Nodding Nils exchange in
// 2026-08-23_full-game-scripts.md §3.
//
// This is the only level that needs the model. Steps 4 and 5 restate the player's
// own free text, which no authored script can do, because the script does not know
// what the player said. If the model call fails, the fallbacks below keep the beat
// playable: they teach the shape without the personalisation.
//
// Political balance ledger, keep accurate if you touch the lines:
//   The player picks their own topic, and the three seed chips span both directions
//   (loan forgiveness, return to office, crypto rules). The one position put in the
//   player's mouth is at step 8, where they restate the coach's point, and restating
//   is the opposite of endorsing: that is the entire lesson of the level. The coach's
//   stated point leans pro-regulation, which is counterweighted by Level 1 opening on
//   a pro-forgiveness target and Level 2 opening on a conservative one.

import type { LevelDef } from '../types.ts';

export const level3: LevelDef = {
  slug: 'did-i-miss-anything',
  title: 'Did I miss anything?',
  teaches: 'Fake Listening',
  rule: 'fake_listening',
  boss: 'Nodding Nils',
  beats: [
    {
      name: 'Say it back',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Nodding Nils. He will agree with you. He will nod. He will repeat your point back so smoothly you will feel heard.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'And he will leave out the one part of it that costs him something.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'So we are going to practice saying somebody\'s point back to them until it is a reflex. Then you will notice when his version is short.',
        },

        {
          kind: 'say',
          lane: 'coach',
          text: 'Pick one you actually have a take on. Say your piece. Two sentences is plenty.',
        },
        {
          kind: 'free',
          id: 'l3-i1',
          rule: 'fake_listening',
          capture: 'player_point',
          placeholder: 'What bugs you, and why?',
          chips: [
            'Student loan forgiveness',
            'Return to office',
            'Crypto rules',
          ],
        },

        {
          kind: 'model',
          id: 'l3-m1',
          task: 'restate_perfect',
          from: 'player_point',
          lead: 'Here is your point back, the way it should sound.',
          fallback:
            'So what I\'m hearing is: it bugs you that things are set up the way they are, because of what it costs you. Did I get that right?',
        },
        {
          kind: 'model',
          id: 'l3-m2',
          task: 'restate_flawed',
          from: 'player_point',
          lead: 'Now the same thing, done badly.',
          fallback:
            'So it bugs you that things are set up the way they are.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Notice what went missing: the why. It still sounds like listening. It is shorter by exactly the part you would have argued for.',
        },

        {
          kind: 'say',
          lane: 'coach',
          text: 'My turn to have a take. Crypto exchanges should have to hold customer funds separately, because I had money frozen for nine weeks in a collapse and nobody could tell me where it was.',
        },
        {
          kind: 'edit',
          id: 'l3-i2',
          rule: 'fake_listening',
          ask: 'Your turn. I have started it. Finish it.',
          prefill:
            'So what I\'m hearing is: it bugs you that ___, because ___. Did I get that right?',
          chips: ['customer funds are mixed in', 'you had money frozen', 'nobody could tell you where it was'],
          target:
            'Both blanks must be filled from what the coach actually said. The first blank is the complaint (funds not held separately). The second blank is the reason (their own money was frozen for nine weeks with no answer). Leaving the "because" clause empty, generic, or filled with a restatement of the first blank is the failure this level teaches.',
          fallback:
            'The shape is: "it bugs you that exchanges can mix customer funds in, because yours were frozen for nine weeks and nobody could tell you where they were." The second blank is the one people drop.',
        },
        { kind: 'continue', label: 'Face him' },
      ],
    },

    {
      name: 'Nodding Nils',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'You are arguing for working from home. You gave him three reasons: the commute costs you, you focus better, and you have childcare in the afternoon.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Watch what comes back.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Nodding Nils',
          text: 'So you are saying the commute is expensive and you focus better at home. Did I get that right?',
        },
        {
          kind: 'sort',
          id: 'l3-boss-1',
          rule: 'fake_listening',
          line: 'Which one did he leave out?',
          options: [
            { value: 'commute', label: 'The commute cost' },
            { value: 'focus', label: 'Focusing better' },
            { value: 'childcare', label: 'Childcare' },
          ],
          expected: 'childcare',
          feedback: {
            commute: 'He kept that one. He said it first, in fact.',
            focus: 'He kept that one too. Read his version again and count.',
            childcare:
              'Childcare. The one he cannot answer cheaply, and the only one missing.',
          },
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Nodding Nils',
          text: 'Right. Childcare. I did leave that out.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'He did not mishear you. He dropped the one you cannot answer cheaply. Notice that this is an absence, not a mistake, which is why it is the hardest one to catch.',
        },
        { kind: 'continue', label: 'Finish' },
      ],
    },
  ],
};
