// Browser storage only. Steve's ruling B2, 2026-08-23: no accounts, no Supabase,
// no auth anywhere in the MVP. PT Brain owns auth and hands it over later, at
// which point this module gains a sync path and loses nothing else.
//
// Everything lives under one key so a player can clear it in one action, and so
// the eventual sync has exactly one blob to reason about.

import type { ItemRecord } from './types.ts';
import { PLAYER_AVATARS } from './avatars.ts';

const KEY = 'humility-showdown.v1';

export interface SaveFile {
  version: 1;
  /** local-only id. Not an account, not sent anywhere in this build. */
  playerId: string;
  /** level slug -> ISO timestamp of the first clear */
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
        return cache;
      }
    }
  } catch {
    // A corrupt or unreadable save must never block play. Start clean.
  }
  cache = blank();
  return cache;
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
}

export function markCleared(slug: string): void {
  const file = load();
  if (!file.cleared[slug]) {
    file.cleared[slug] = new Date().toISOString();
    save(file);
  }
}

export function isCleared(slug: string): boolean {
  return Boolean(load().cleared[slug]);
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
