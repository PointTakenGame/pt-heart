// The ladder, in play order.
//
// Seven levels are ruled (CLAUDE.md, "The ladder"). Five are in scope for this
// rebuild; 6 and 7 are the Final Showdown pair and are deferred, because the
// game is complete without them.
//
// Saved progress names levels by slug, never by index (Steve's ruling B3,
// 2026-08-23), so reordering or inserting a level here does not orphan anyone's
// save. The slugs were all replaced for the rebuild (Q28) and storage moved to
// `humility-showdown.v2`, so a pre-rebuild save cannot claim a rebuilt level.

import type { LevelDef } from '../types.ts';
import { level1 } from './level1.ts';
import { level2 } from './level2.ts';
import { level3 } from './level3.ts';
import { level4 } from './level4.ts';
import { SHOWDOWN_SLUG } from './showdown.ts';

/** One row of the gym ladder.
 *
 *  Every row is data. Nothing on the select screen is hand-written any more:
 *  the Showdown used to be a second, hardcoded row sitting outside the map,
 *  which is how it drifted out of step with the four above it. It is level 5 of
 *  the same ladder and renders from the same loop; all that differs is which
 *  screen it opens, because the Showdown runs its own match rather than the
 *  prefight-and-room flow. Step 6 reconciles the two. */
export type LadderRow = {
  slug: string;
  title: string;
  /** the rule this row teaches, and — once cleared — the line it reports back */
  teaches: string;
  boss: string;
} & ({ screen: 'level'; level: LevelDef } | { screen: 'showdown' });

function row(level: LevelDef): LadderRow {
  return {
    screen: 'level',
    slug: level.slug,
    title: level.title,
    teaches: level.teaches,
    boss: level.boss,
    level,
  };
}

export const LEVELS: LadderRow[] = [
  row(level1),
  row(level2),
  row(level3),
  row(level4),
  {
    screen: 'showdown',
    slug: SHOWDOWN_SLUG,
    title: 'The Showdown',
    teaches: 'All three cards',
    boss: 'Slippery Sofia',
  },
];

export function levelBySlug(slug: string): LevelDef | undefined {
  const found = LEVELS.find((l) => l.slug === slug);
  return found && found.screen === 'level' ? found.level : undefined;
}
