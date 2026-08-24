// The ladder, in play order. MVP is ship levels 1 to 3.
// Saved progress names levels by slug, never by index (Steve's ruling B3, 2026-08-23),
// so reordering or inserting a level here does not orphan anyone's save.

import type { LevelDef } from '../types.ts';
import { level1 } from './level1.ts';
import { level2 } from './level2.ts';
import { level3 } from './level3.ts';

export const LEVELS: LevelDef[] = [level1, level2, level3];

export function levelBySlug(slug: string): LevelDef | undefined {
  return LEVELS.find((l) => l.slug === slug);
}
