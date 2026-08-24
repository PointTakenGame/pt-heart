# Humility Showdown

A card game about disagreeing without wrecking the relationship, playable in a
browser. Three training levels teach one foul each, then a fourth level plays a
full match against an AI opponent using all three.

This is the web build. The printed deck is the original, and Steve's Keynote
master is the source of truth for card content; it lives outside this repo.

## Run it

```bash
npm install && npm run dev
```

Opens on <http://localhost:5273>. `npm run build` runs `tsc --noEmit` and then
builds; both must pass before a commit.

On startup the dev server prints one of two lines:

```
coach: live (key loaded, model answers)
coach: offline (no key, authored fallbacks)
```

Offline is a fully supported state, not a degraded one. See "The coach" below.

## The three fouls

The whole game is these three, named the same way everywhere in the code
(`FoulType` in `src/types.ts`):

| Foul | What it is | Costs |
| --- | --- | --- |
| `judging` | A verdict on the person or their motives instead of their argument | 2 tokens |
| `opinion_as_fact` | An opinion delivered with the grammar of a fact | 1 token |
| `fake_listening` | A summary with no "because" and no check that you got it right | 1 token |

## Layout

```
src/
  App.tsx          three screens: agreement, level select, thread
  engine.ts        the beat runner for levels 1 to 3
  showdown.ts      the level 4 match loop (rounds, tokens, rulings)
  pacing.ts        BEAT_GAP and dwellMs, shared by both runners
  coach.ts         client side of /api/coach, with the fallback path
  detectors.ts     offline foul detection
  storage.ts       localStorage, one key, no accounts
  types.ts         LevelDef, ComposerState, Message, ItemRecord
  content/         the authored scripts, one file per level
  ui/              Thread, Composer, Header
api/coach.ts       the one serverless function
```

Everything the player sees is one thread of messages. Steps push messages into
it; the composer opens when a step needs the player to answer.

### The composer has five states

`locked`, `buttons`, `prefilled`, `free`, and `continue`. Pre-fill is the
governing design constraint: the player should never have to type more than a
clause or two, so most text steps arrive with a sentence already started and
tappable chips to drop in at the caret.

## The coach, and why offline matters

Every model-backed line has an authored fallback sitting behind it. If the API
key is missing, the request fails, or it exceeds the deadline (6s client, 5s
server), the authored line ships instead and play continues without a visible
error. Graceful degradation here is the architecture, not a workaround: the
game has to be playable on a bad train connection.

Consequence worth knowing: the whole game can be developed and tested with no
key at all, and most of it has been. One place where the fallback is known to
read hollow is tracked as `HEART-T260823-34`.

## Things that will bite you

**No `StrictMode`.** The beat runner is a sequence of timed side effects, and
the dev-mode double-invoke emits every scripted line twice. `src/main.tsx` says
so at the render call; do not add it back.

**The thread has to be re-landed on its bottom whenever the composer changes
height.** A chip row appearing, a textarea replacing a button row, the textarea
growing a line: each shortens the scroll container without adding a message, so
the newest line slides under the fold with nothing to trigger a scroll. The
composer calls `onResize` from a layout effect and `Thread` lands it before the
paint. A `ResizeObserver` lands it a frame or two late and you see the jump.

**Never `justify-content: flex-end` on a scroll container.** It clips overflow
at the top instead of scrolling to it. The safe equivalent is `margin-top: auto`
on the first child, which is what `.thread > .msg:first-child` does.

**Tokens move, they never burn.** Fourteen are on the table when a match starts
and fourteen when it ends. A foul hands tokens to the other player; nothing is
created or destroyed, and the two numbers in the header always add to fourteen.
`transfer` in `src/showdown.ts` clamps a move to what the losing purse actually
holds, because judging costs two and a purse can be holding one. Without the
clamp the ledger paints a negative number for a full beat and then the bust line
says "you are empty" over it.

**Political balance is non-negotiable.** Every politically-perceptible example
needs an equally vivid opposite-side counterpart, or an explicit flag that it is
imbalanced and why. Each level file carries a balance ledger in its header
comment, and that ledger has to stay accurate if you touch the lines. It is
enforced by convention, not by code. Topics stay at the milder end of real
policy: student loans, crypto regulation, nuclear power, return to office,
minimum wage.

## Storage

One `localStorage` key, `humility-showdown.v1`, holding a local `playerId`, a
map of cleared level slugs, and every answered item. Text items carry a
`revisions` array of boundary snapshots (900ms pause, blur, chip insert, send),
which is what records "they typed the judgment first, then deleted it".

No accounts, no auth, nothing leaves the browser. PT Brain owns auth and hands
it over later, at which point `storage.ts` gains a sync path and nothing else
changes.

## Keys

The dev server reads the API key from a file outside this repo:
`ANTHROPIC_API_KEY` in the environment, else the first matching line of
`HEART_KEY_FILE`, else the shared operator key file. No key is ever committed
here, and the value is never printed. If nothing resolves, you get the offline
path.

## Testing at phone width

`_driver.js` is a gitignored local harness that plays a level end to end and
records geometry at every step. Load it from the dev server and call
`window.__mk(levelIndex, buttonAnswers, texts)`.

Its one real limitation: an automated browser tab is usually hidden, and a
hidden tab never fires `requestAnimationFrame` or `ResizeObserver`, throttles
`setTimeout` hard, and does not animate smooth scrolling. So the harness can
measure scroll *position* exactly and cannot tell you anything about scroll
*feel*. That gap is tracked as `HEART-T260823-36` and closes only on a real
device.
