---
id: point-taken-heart-30ce8adc
name: game
agent: point-taken-heart
thread: heart-webapp
kind: source
status: live
what_it_is: "The pt-heart repo: the web build of Point Taken: Humility Showdown, plus its canonical specs and print production materials."
regen_command: none
verified: 2026-08-26
notes: "Its own git repo, not part of the Claude workspace monorepo above it (remote github.com/PointTakenGame/pt-heart, branch main). Deployed as a playtest prototype at pt-heart.vercel.app, open with no password (the HTTP Basic Auth gate in middleware.ts was removed 2026-09-21). Holds two registered sub-resources of its own: docs/ (canonical specs) and, once populated, pdf-game/ (print production)."
---

# Humility Showdown

A card game about disagreeing without wrecking the relationship, playable in a
browser. Three training levels teach one foul each, a fourth puts you in the
referee's chair, and the fifth is a full match against Slippery Sofia, the boss,
with all three cards live. Above those five sit the three Humility Showdown
levels: two more referee seats, then the Final Showdown against Sung-min. They
were unfrozen on 2026-09-07 (commit 2db54ac) and the whole ladder is playable.

This is the web build. The printed deck is the original, and Steve's Keynote
master is the source of truth for card content; it lives outside this repo.

**Read `docs/` first.** That folder is the canonical specification set: what the
game is, what ships in what order, the rules, the strings players read, the
architecture, the component inventory, and the printed deck. It is normative and
written in the present tense. `docs/README.md` explains the status markers that
tell you how much authority any given value has, and the house rules for editing
anything in there. Anything under `docs/` reaches `main` through a pull request.

## Branches

**`main` is the only living line.** Everything ships from it and everything
starts from it.

Two older branches were archived on 2026-09-07 as the annotated tags
`archive/nathan-gym-ladder-rebuild` and `archive/nathan-working-branch-heart`,
and then deleted. Read the tags if you want the history. **Do not branch off them
and do not merge them.** `main` already took their content forward on a different
engine, and two specific ways a port out of either tag goes wrong were confirmed
by hand in a scratch clone:

- **Taking `src/content/index.ts` whole makes the game unwinnable.** That tree
  puts the Showdown inside the `LEVELS` array. `main` computes "everything
  cleared" by mapping over `LEVELS` and gates the Showdown button on the result,
  so the Showdown ends up locked behind having already cleared the Showdown, and
  rungs 4 through 7 and both live-play doors die with it for the life of the
  save. It fails `tsc` with two errors, and `npm run dev` is bare vite with the
  types stripped, so a dev-mode playtest ships it in silence.
- **Taking `src/storage.ts` whole stops the research corpus with no error.**
  `main`'s `recordItem` calls `donate(...)` to post every answered item to
  Supabase. That tree forked before `corpus.ts` existed and simply does not, so
  the loss is an omission rather than an edit: zero type errors, passing build,
  and nothing is captured ever again. It also bumps the storage key from `v1` to
  `v2` with no migration, which wipes every playtester's save.

Take hunks, never whole files, and run `npm run build` before believing anything.

The one thing worth having off those branches is already here.
`docs/nathan-gym-rebuild/` holds Nathan's 19 working papers, copied verbatim, and
they are what every "Nathan ruling N" comment in `src/` is citing. That folder is
history and not specification; its own README says which two files are still
worth reading and which are spent build logs.

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
  corpus.ts        donates each answered item to the Supabase corpus table
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
Every price is a whole token. Half tokens existed until 2026-09-07 for exactly
one reason, `MISS_COST`, the half a token that letting one of Sofia's fouls go
past used to cost you. Steve retired that price on Nathan's argument: you are
charged for what you say, not for what you fail to notice. A miss now moves
nothing, so a player who calls nothing watches a still scoreboard, and that
stillness is the feedback. `TOKEN_STEP` in `src/content/showdown.ts` is the
one place a fractional price could ever come back.
`transfer` in `src/showdown.ts` clamps a move to what the losing purse actually
holds, because judging costs two and a purse can be holding one. Without the
clamp the ledger paints a negative number for a full beat and then the bust line
says "you are empty" over it.

**A purse at zero does not end a gym rung.** Steve, 2026-09-07: "player at zero
is out, but that's not true in the gym levels. That's true in the live play."
So `bankruptCheck` in `src/showdown.ts` says its line once and lets the match run
to its last round; the player finishes the drill they came for and simply cannot
pay any more. The same function in `src/final.ts` still ends the match, and that
is correct: the Humility Showdown rungs above Sofia are the live-play phase, and
they are frozen anyway.

**Rulings on the player land in the moment, not at the end of the round.** These
are training rounds and feedback that arrives three messages later is not
attached to anything. `missedCount` in `src/showdown.ts` survives to the end of
the round only so the coach knows whether to say the round was clean.

**Judging outranks Fake Listening inside a summary.** A summarizing turn runs the
phrase detectors before the structural because/question check, so a summary that
judges the other person is charged two tokens and not one, and the summary then
has to be done again (up to three attempts). Each attempt is its own corpus row,
suffixed `-redo1`, `-redo2`.

**Training summaries are pre-typed and wrong.** In levels 1 to 3 the player never
types a summary from nothing: the line arrives finished, carrying one planted
mistake, and the work is finding it. Level 3's `l3-i2` is the clearest case, and
its `target` names exactly which half is planted.

**Political balance is non-negotiable, and is currently in debt.**  Steve's
ruling of 2026-08-24 allows the prototype to ship to the internal playtest
imbalanced; it has to be corrected before anything goes out publicly (see
`HEART-T260823-33`). Every politically-perceptible example
needs an equally vivid opposite-side counterpart, or an explicit flag that it is
imbalanced and why. Each level file carries a balance ledger in its header
comment, and that ledger has to stay accurate if you touch the lines. It is
enforced by convention, not by code. Topics stay at the milder end of real
policy: student loans, crypto regulation, nuclear power, return to office,
minimum wage.

## Storage

One `localStorage` key, `humility-showdown.v1`, holding a local `playerId`, a
map of cleared level ids, and every answered item.

**A save is keyed by a level's permanent id, never by its slug.** The ids live in
`src/content/ids.ts` and are plain integers, assigned once and never reused. The
map used to be keyed by slug, and because a slug is a label that gets edited for
good reasons, every rename silently wiped everyone's progress on that rung. It is
not hypothetical: all three gym rungs have been renamed once already. `load()`
carries the old slug keys forward through `LEGACY_SLUG_IDS`, so never delete a
line from that table. Text items carry a
`revisions` array of boundary snapshots (900ms pause, blur, chip insert, send),
which is what records "they typed the judgment first, then deleted it".

No accounts and no auth. PT Brain owns auth and hands it over later, at which
point `storage.ts` gains a sync path and nothing else changes.

Answered items do leave the browser, and have since 2026-09-01. `corpus.ts`
donates every answered item to a Supabase table named `rulings`, over PostgREST,
called from `recordItem` so all five runners are covered at one site. A row is
the local player id, the item id, the level slug, the rule, the answer text, the
correctness flag, the revisions array, the answer timestamp, and the build's
commit sha. There is no name, no email, no account, and no IP kept by us; the
player id is a random local string that identifies one browser and nothing else.

An outbox in `localStorage` under `humility-showdown.outbox` holds anything that
failed to send and retries it on the next answered item or the next page load, so
a round answered on a train is not lost. Capture never blocks play: every path
swallows its own failure.

The publishable key ships inside the client bundle. That is by design and not a
leak. Row-level security on the table grants insert and nothing else, so the key
in the bundle cannot read a single row back, its own included, and cannot update
or delete anything. Reading the corpus is a service-role job run from a laptop
with a key that is never in the bundle. A retried POST can duplicate, so the
table carries a unique index on player, item, and answer time, and a 409 is
treated as success.

Two ways to get the corpus out, both invisible to a player. `Ctrl/Cmd+Shift+E`
copies the whole save file to the clipboard and logs it, which is the desktop
path. That combo is dead on a phone, so `window.__export()` is the other one,
reachable from an inspector attached to the real device. Playtesting happens on
a phone, so in practice the second one is the one you want.

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
