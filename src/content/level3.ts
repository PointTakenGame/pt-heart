// Level 3: Did I miss anything (Fake Listening).
// Source: docs/design/2026-08-23_mvp-build-plan.md §4, Beat 4 (the ten-step table),
// plus the cold open and the Nodding Noemi exchange in
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
  boss: 'Nodding Noemi',
  bossEmoji: '\u{1F469}\u{1F3FD}',
  bossEpithet: 'Agrees with everything. Heard none of it.',
  prefight: [
    {
      kind: 'line',
      text: 'Nodding Noemi. She will agree with you. She will nod. She will repeat your point back so smoothly you will feel heard.',
    },
    {
      kind: 'line',
      text: 'And she will leave out the one part of it that costs her something.',
    },
    {
      kind: 'line',
      text: 'So we are going to practice saying somebody\'s point back to them until it is a reflex. Then you will notice when her version is short.',
    },
    { kind: 'card', rule: 'fake_listening' },
  ],
  beats: [
    {
      name: 'Say it back',
      steps: [

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
          isTake: true,
        },
        {
          kind: 'edit',
          id: 'l3-i2',
          rule: 'fake_listening',
          // Pre-typed and wrong, not a blanks template. Steve's ruling of
          // 2026-08-24: in the training rounds the summary arrives finished and
          // carries a planted mistake, and the player earns it by finding the
          // mistake rather than by filling in scaffolding. The planted mistake is
          // in the second half, because the second half is the one people drop:
          // the first clause is a faithful restatement, and the reason attached
          // to it is invented. That is exactly what Fake Listening sounds like
          // when it is done well, and it is why reading it is the work.
          ask: 'Your turn, and I have done the typing. One part of this is not what I said. Find it and fix it.',
          prefill:
            'So what I\'m hearing is: it bugs you that exchanges can mix customer funds in with their own, because you think crypto is too risky for regular people. Did I get that right?',
          chips: ['your own money was frozen', 'for nine weeks', 'nobody could tell you where it was'],
          target:
            'The first clause is already right and should survive. The "because" clause is the planted mistake: the coach never said crypto is too risky for regular people, he said his own money was frozen for nine weeks in a collapse and nobody could tell him where it was. A correct edit replaces that invented reason with the one he actually gave. Leaving the invented reason in place, or replacing it with a restatement of the first clause, is the failure this level teaches.',
          fallback:
            'Here it is with my reason back in it: "it bugs you that exchanges can mix customer funds in, because yours were frozen for nine weeks and nobody could tell you where they were." The because half is the one people quietly write for you.',
        },
        { kind: 'continue', label: 'Face her' },
      ],
    },

    {
      name: 'Nodding Noemi',
      boss: true,
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'You are arguing for working from home. You gave her three reasons: the commute costs you, you focus better, and you have childcare in the afternoon.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'Watch what comes back.',
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Nodding Noemi',
          text: 'So you are saying the commute is expensive and you focus better at home. Did I get that right?',
        },
        {
          kind: 'sort',
          id: 'l3-boss-1',
          rule: 'fake_listening',
          line: 'Which one did she leave out?',
          options: [
            { value: 'commute', label: 'The commute cost' },
            { value: 'focus', label: 'Focusing better' },
            { value: 'childcare', label: 'Childcare' },
          ],
          expected: 'childcare',
          feedback: {
            commute: 'She kept that one. She said it first, in fact.',
            focus: 'She named that one. Two of your three came back; the third did not.',
            childcare:
              'Childcare. The one she cannot answer cheaply, and the only one missing.',
          },
        },
        {
          kind: 'say',
          lane: 'opponent',
          speaker: 'Nodding Noemi',
          text: 'Right. Childcare. I did leave that out.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'That is the whole move. Nothing she said was false. She agreed with you twice and answered nothing.',
        },
        {
          kind: 'say',
          lane: 'coach',
          text: 'She heard you fine. She just left out the reason that is hardest for her to argue with: childcare. She can tell you a commute is a choice. She can tell you the office has focus rooms. She has no answer for childcare, so she left it on the floor.',
        },
        { kind: 'continue', label: 'Finish' },
      ],
    },
  ],
};
