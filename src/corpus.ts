// Sends each answered item to the Heart corpus table.
//
// Why this exists: HEART-T260901-03. The team plays the deployed site, and
// before this every ruling they made lived in their own browser and nowhere
// else, so a five-person playtest produced five save files on five laptops and
// no corpus. Roadmap section 5 calls the collected human rulings the repo's most
// valuable asset; they are worth an outbox.
//
// Three rules this module holds itself to, in order of importance:
//
//   1. It never breaks play. Every path swallows its own failure. A dead key, a
//      captive-portal wifi, a browser with storage switched off: the match goes
//      on and the row waits or is dropped, silently, and nothing reaches a
//      player's screen. Capture is worth a lot; it is worth less than the round
//      somebody is in the middle of.
//   2. It only ever writes. The key below ships inside the client bundle, which
//      is what "publishable" means, so the table's row-level security grants
//      insert and nothing else. That key cannot read a single row back, its own
//      included. Reading the corpus is a service-role job done from a laptop.
//   3. It is best effort, not at-most-once. A retried POST can duplicate, so the
//      table carries a unique index on player, item, and answer time, and a 409
//      is treated here as success, because a 409 means the row is already home.
//
// The outbox is the difference between capturing the corpus and mostly capturing
// it. Phones lose connections mid-round, and a player who answers twelve items
// on a train should not donate zero of them.

import type { ItemRecord } from './types.ts';

const URL_BASE = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

/** The build that produced these answers. Roadmap section 5: a stored ruling is
 *  only interpretable next to the prompts that generated it, and the prompts
 *  move. Set from the commit sha at build time; 'dev' on a laptop. */
const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? 'dev';

const OUTBOX_KEY = 'humility-showdown.outbox';

/** Deliberately not the save file's key. A corpus row that failed to send is
 *  bookkeeping, not progress, and a player clearing their progress should not
 *  have to also destroy the rows already waiting to be donated. */
interface Row {
  player_id: string;
  item_id: string;
  level_slug: string;
  rule: string;
  answer: string;
  correct: boolean | null;
  revisions: unknown;
  answered_at: string;
  app_version: string;
}

/** Used only when localStorage itself throws, which is private mode and browsers
 *  with site data switched off. The outbox then lives for one page view, which
 *  is worth more than nothing and less than a real one. */
let memory: Row[] = [];
let storageBroken = false;

function readOutbox(): Row[] {
  if (storageBroken) return memory;
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as Row[]) : [];
  } catch {
    storageBroken = true;
    return memory;
  }
}

function writeOutbox(rows: Row[]): void {
  if (storageBroken) {
    memory = rows;
    return;
  }
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(rows));
  } catch {
    // Quota, or storage switched off mid-session. Fall back rather than throw:
    // the rows we are holding are still worth trying to send this page view.
    storageBroken = true;
    memory = rows;
  }
}

const configured = Boolean(URL_BASE && KEY);

let flushing = false;

/**
 * Try to send everything waiting.
 *
 * Sends the whole outbox as one array, which PostgREST accepts, so a player who
 * comes back online donates a stranded round in a single request. A partial
 * failure leaves the whole batch queued and it is retried intact next time; the
 * unique index is what makes that safe.
 */
async function flush(): Promise<void> {
  if (!configured || flushing) return;
  const pending = readOutbox();
  if (pending.length === 0) return;

  flushing = true;
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/rulings`, {
      method: 'POST',
      headers: {
        apikey: KEY as string,
        Authorization: `Bearer ${KEY as string}`,
        'Content-Type': 'application/json',
        // Nothing here wants the inserted rows back, and asking for them would
        // fail anyway: there is no select policy on the table.
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(pending),
    });

    // 409 is the unique index doing its job on a retry. The rows are already
    // stored, so clearing them is correct rather than merely convenient.
    if (res.ok || res.status === 409) {
      const now = readOutbox();
      writeOutbox(now.slice(pending.length));
    }
  } catch {
    // Offline, blocked, or the project is asleep. The outbox keeps the rows and
    // the next answered item will try again.
  } finally {
    flushing = false;
  }
}

/**
 * Queue one answered item and try to send.
 *
 * Called from recordItem, which is the one place every runner already writes
 * through, so all five of them are covered without five call sites to keep in
 * step. Returns nothing and awaits nothing: the caller is a game loop.
 */
export function donate(record: ItemRecord, playerId: string): void {
  if (!configured) return;
  try {
    const row: Row = {
      player_id: playerId,
      item_id: record.itemId,
      level_slug: record.levelSlug,
      rule: record.rule,
      answer: record.answer,
      correct: record.correct,
      revisions: record.revisions ?? [],
      answered_at: record.answeredAt,
      app_version: APP_VERSION,
    };
    writeOutbox([...readOutbox(), row]);
    void flush();
  } catch {
    // Never let capture reach the player.
  }
}

// Anything stranded by a closed tab, a dead connection, or a crash goes out on
// the next page load, before the player has done anything.
if (configured) void flush();
