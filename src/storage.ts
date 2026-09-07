// Browser storage. Steve's ruling B2, 2026-08-23: no accounts, no auth anywhere
// in the MVP, and PT Brain owns auth when it arrives. That half still holds; the
// playerId below is a random local id and never an identity.
//
// What changed on 2026-09-01: answered items are now also donated to Heart's own
// Supabase project, because the team plays a deployed site and a corpus that
// only exists on their laptops is not a corpus (HEART-T260901-03). The donation
// is a copy, not a move. This file remains the source of truth for a player's
// own progress, and it still works whole with the network unreachable.
//
// Everything lives under one key so a player can clear it in one action.

import type { ItemRecord } from './types.ts';
import { LEGACY_SLUG_IDS, type LevelId } from './content/ids.ts';
import { PLAYER_AVATARS } from './avatars.ts';
import { donate } from './corpus.ts';

const KEY = 'humility-showdown.v1';

export interface SaveFile {
  version: 1;
  /** local-only id. Not an account, not sent anywhere in this build. */
  playerId: string;
  /** permanent level id -> ISO timestamp of the first clear. The key is an id
   *  written as a string, because JSON object keys are strings. It used to be
   *  the level's slug, and every rename wiped it; see content/ids.ts. */
  cleared: Record<string, string>;
  /** every answered item, in order, including the revision trace */
  items: ItemRecord[];
  /** the emoji the player picked as their face. Absent until they pick one. */
  avatar?: string;
  /** true once the coach has introduced himself. He does it once, not before
   *  every level (Steve, 2026-08-25). */
  metCoach?: boolean;
}

function blank(): SaveFile {
  return {
    version: 1,
    playerId: crypto.randomUUID(),
    cleared: {},
    items: [],
  };
}

let cache: SaveFile | null = null;

export function load(): SaveFile {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SaveFile;
      if (parsed.version === 1) {
        // Shape, not just parseability. A blob written by an older build (or by
        // a developer seeding localStorage by hand) can carry version 1 and the
        // wrong type in a field, and the first write against it throws in the
        // middle of a level. Repairing the containers costs nothing and keeps
        // the promise the catch below is making.
        if (!Array.isArray(parsed.items)) parsed.items = [];
        if (!parsed.cleared || typeof parsed.cleared !== 'object') parsed.cleared = {};
        if (typeof parsed.playerId !== 'string') parsed.playerId = crypto.randomUUID();
        cache = parsed;
        // Write it back, or the rename is undone on every load: the migration
        // only mutates the object in memory, and nothing else on a level-select
        // screen calls save().
        if (migrateCleared(parsed)) save(parsed);
        return cache;
      }
    }
  } catch {
    // A corrupt or unreadable save must never block play. Start clean.
  }
  cache = blank();
  return cache;
}

/**
 * Carry clears written under a slug onto the permanent id.
 *
 * Every save on disk before 2026-09-07 keys `cleared` by slug, and all three gym
 * rungs have already been renamed once, so a playtester who cleared
 * `the-word-you` in August is holding a key that matches nothing today. Runs on
 * every load and is a no-op after the first: an id key is a run of digits and
 * never appears in LEGACY_SLUG_IDS.
 *
 * A slug we no longer recognise is left alone rather than dropped. It costs a
 * few bytes and it is the only copy of the fact that somebody cleared something.
 */
function migrateCleared(file: SaveFile): boolean {
  let changed = false;
  for (const [key, when] of Object.entries(file.cleared)) {
    const id = LEGACY_SLUG_IDS[key];
    if (id === undefined) continue;
    const target = String(id);
    // Keep the earlier of the two timestamps: a rung cleared under an old slug
    // was cleared then, not on the day its rename shipped.
    if (!file.cleared[target] || when < file.cleared[target]) file.cleared[target] = when;
    delete file.cleared[key];
    changed = true;
  }
  return changed;
}

function save(file: SaveFile): void {
  cache = file;
  try {
    localStorage.setItem(KEY, JSON.stringify(file));
  } catch {
    // Quota or private-mode failure. The session still plays; progress is lost
    // on reload, which is better than a crash mid-level.
  }
}

export function recordItem(record: ItemRecord): void {
  const file = load();
  file.items.push(record);
  save(file);
  // The local write comes first and is what play depends on. The donation is a
  // side effect that cannot throw and cannot block; see corpus.ts.
  donate(record, file.playerId);
}

export function markCleared(id: LevelId): void {
  const file = load();
  const key = String(id);
  if (!file.cleared[key]) {
    file.cleared[key] = new Date().toISOString();
    save(file);
  }
}

export function isCleared(id: LevelId): boolean {
  return Boolean(load().cleared[String(id)]);
}

export function getAvatar(): string | null {
  const saved = load().avatar ?? null;
  // A face that was retired out of the picker (the roster was trimmed from
  // twelve tiles to nine on 2026-08-25) would otherwise come back for returning
  // players and sit on a picker where no tile is marked as theirs. Falling back
  // to the default is the honest read: whatever they chose is not on offer any
  // more, so they have not chosen.
  return saved && PLAYER_AVATARS.includes(saved) ? saved : null;
}

export function setAvatar(emoji: string): void {
  const file = load();
  file.avatar = emoji;
  save(file);
}

export function hasMetCoach(): boolean {
  return Boolean(load().metCoach);
}

export function markMetCoach(): void {
  const file = load();
  if (!file.metCoach) {
    file.metCoach = true;
    save(file);
  }
}

export function reset(): void {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing useful to do */
  }
}

/** The whole save file as text, for eyeballing the corpus during playtests.
 *  Wired up in main.tsx: Ctrl/Cmd+Shift+E on a desktop, window.__export() from
 *  an inspector attached to a phone. */
export function exportJson(): string {
  return JSON.stringify(load(), null, 2);
}
