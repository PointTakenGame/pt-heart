// Level 4: the referee seat. STUB — step 5 of the rebuild writes this level; the
// only thing here is enough of a LevelDef for the ladder to render a fifth row
// and for the screen not to crash if a tester opens it.
//
// Two things step 5 has to settle, recorded here so they are not rediscovered:
//
//   1. `LevelDef.rule` is a single FoulType, and this level is the first that
//      runs all three cards at once. Either the field widens or the level
//      carries its own list. It is set to 'judging' below only because the type
//      demands one value.
//   2. This is where the referee is introduced. CLAUDE.md: levels 1 to 3 ignore
//      the referee entirely — the word, the role and the three-player structure
//      are all withheld until here — and this level opens by telling the player
//      they learn the seat as ref first and play it themselves next. The ladder
//      screen therefore does not print this title while the row is locked.
//
// Political balance ledger: nothing authored yet, so nothing to count. Step 5
// opens the ledger with the first line it writes.

import type { LevelDef } from '../types.ts';

export const level4: LevelDef = {
  slug: 'in-the-ref-seat',
  title: 'In the ref seat',
  teaches: 'All three cards',
  rule: 'judging',
  // All three are live on the rail here, and that is the whole difference
  // between this level and the three before it: the call is a real choice.
  // `rule` is a single FoulType and cannot say that, so it stays the level's
  // headline card and `cards` is what the rail reads. Step 5 writes the level.
  cards: ['judging', 'opinion_as_fact', 'fake_listening'],
  seat: 'referee',
  boss: 'The Coach',
  bossEmoji: '\u{1F9D1}\u{1F3FD}\u{200D}\u{1F3EB}',
  bossEpithet: 'Not built yet.',
  prefight: [
    {
      kind: 'line',
      text: 'This level is not built yet. It arrives in the next pass of the rebuild.',
    },
  ],
  beats: [
    {
      name: 'Not built yet',
      steps: [
        {
          kind: 'say',
          lane: 'coach',
          text: 'Nothing to do here yet. Head back to the gym.',
        },
      ],
    },
  ],
};
