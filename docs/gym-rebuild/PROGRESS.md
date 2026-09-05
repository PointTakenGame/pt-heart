# PROGRESS — gym level-system rebuild

Branch `NathanGymLadderRebuild`. Levels **1–5 only**; 6 and 7 come after.

**One build step, one fresh chat.** Update this file at the end of each step, in the
same commit. Keep it short — it is read at the start of every session.

## Step status

| Step | Brief | Status |
|---|---|---|
| 0 | *(restructure — this scaffolding)* | **done** 2026-09-04 |
| 1 | Ladder scaffold | **done** 2026-09-05 |
| 2 | Q6/Q7 mechanic — `confirm` + `template` step kinds | **done** 2026-09-05 |
| 3 | Level 3 rebuilt as a full round | **done** 2026-09-05 |
| 4 | Levels 1 and 2 retitled and repaired | **done** 2026-09-05 |
| 5 | The referee level at 4 | **done** 2026-09-05 |
| 6 | Showdown renumbered to 5 and reconciled | **done** 2026-09-05 |
| 7 | The passes | **done** 2026-09-05 |
| 8 | Doc reconciliation and the PR | not started |

## Carried state

**Step 7 (just done) ran the six cross-cutting passes over levels 1–5.** Four commits,
one per pass that changed code (2, 3, 5 were already closed and needed nothing new this
round). Step 8 is "Doc reconciliation and the PR" — its job is to make the docs agree
with the code below, then open the PR. **On what is true today, the code still outranks
every doc.**

- **Pass 1 — Review screen (Q21), done.** `Review` in `src/App.tsx` renders when
  `gym.finished`: the taught card(s) via `RuleCardFull` (Trains band printed on the card
  itself), a one-line "what you did" in the coach's register (the `DID` map for player
  levels; a referee-seat sentence for L4), and "Back to the gym". **No score, no counts,
  no confetti, no modal.** The referee level lays out all three cards; a one-card level
  shows its one. **The Showdown (`Match`) has no review screen by design** — it ends on
  its own win/loss/draw result, which is its close, and it teaches all three cards so
  there is no single card to show. The old finish state (composer swapped for a lone
  button) is gone; `Room` early-returns `<Review>`.
- **Pass 2 — Card-tap teaching (Q22), verified, no change.** L1 still teaches the tap in
  one coach line (`level1.ts`, the "Your end of it is one gesture… tap it up in the tray"
  beat). It did not get lost when the conduct screen came off.
- **Pass 3 — Clock (Q25), verified closed.** The done-check grep returns only the two
  Steve-quote comments in `styles.css` and `Drill.tsx` about card persistence. **Leave
  them.**
- **Pass 4 — Vocabulary (Q26/Q27), done.** "Habit" is gone from all player-facing copy
  (was on the select screen and in one L3 coach line → now "card" / "move"). Going
  forward **"habit" is allowed only in a boss's mouth about themselves.** "Whistle",
  "the tray" and "reflexes" were kept on purpose: everyday words for the ref framing, not
  invented terms. **The coach's voice is untouched — scale the lingo, never the voice.**
- **Pass 5 — Open book (Q23), done (committed `5fc32b4`).** `engine.beginBoss()` now
  **appends** a crowd row instead of wiping the thread (defect 5). `Thread.tsx`'s
  positional fade is now purely cosmetic (`opacity: 0.88 / 0.76`, hover restores;
  defect 6); scroll pinning left alone. ⚠️ **The docs still claim the thread's
  forgetfulness is load-bearing for Fake Listening — that is now WRONG. Step 8 must fix
  the docs to match.** Note: the defect-5/-6 grep *locators* still hit (they match the
  crowd-row append and the age computation) but both are behaviorally closed — update
  `defects.md` in step 8 if it tracks them by grep.
- **Pass 6 — UI fit (Pass 6 / ~700px), done (committed `2f6a485`).** The four `--dlg-h*`
  vars dropped to `29 / 29 / 11 / 15rem`; the `.dlg` card shrank (`--u 0.71`, width
  17.5rem) and mug to `16rem`; `.composer-locked` min-height and `.drill-foot` padding
  trimmed. **Confirm the fit visually at 100% zoom in the separate playtest** — the build
  is green but the fit was reasoned, not eyeballed.

---

**Step 6 renumbered the Showdown to level 5 and reconciled the six rulings into
`src/content/showdown.ts` and `src/showdown.ts`.** No new type, no new step kind.

- **The Showdown is level 5.** `SHOWDOWN_SLUG = 'the-showdown'` (unchanged); the 12
  `TURNS` ids are now `l5-*`, and the result item id is `l5-result`. **Save by slug;
  the ids are cosmetic but keep them `l5-*` if you touch them.**
- **Q9 — no half tokens anywhere, done.** `formatTokens`, `MISS_COST`, and the
  `.tok-half` CSS are deleted; `src/ui/Header.tsx` renders whole integer counts of
  icons; `scripts/export-script.ts` was updated to match (it imported `formatTokens`
  and printed the deleted copy). **A missed foul now moves *nothing*** — the offendee
  simply keeps the token the whistle would have taken (`COACH.onMissed` takes one arg,
  the branch does no `transfer`). Done-check `formatTokens\|MISS_COST\|tok-half\|half
  token` over `src/` is 0.
- **Q11 — no instant loss at zero, done.** `bankruptCheck` and its four call sites,
  `COACH.bankrupt`, `COACH.bankruptHer` are all deleted. `transfer()` in `src/showdown.ts`
  clamps at 0, never negative, always sums to 14; emptying a purse ends nothing and the
  player climbs back. Done-check `bankrupt` over `src/` is 0.
- **Q6/Q12 — no redo, done.** `COACH.redoSummary` (the "Do it again." copy) is deleted.
  `onWrongCard` is **not** a retry and was kept.
- **Q25 — no clock, done.** Removed "both of you on the clock" (`COACH.intro[0]`),
  "wasting your own clock" (`SOFIA_THIN`), and Prefight's "stays on the wall all night"
  (now "the whole match"). **Defect 8 is closed.** The only two `all night` hits left are
  source comments quoting Steve about card persistence (`src/styles.css`, `src/ui/Drill.tsx`)
  — **leave them.** A timer may return for live play, which is out of scope.
- **Sofia's foul schedule is fixed and was not touched:** `r1-sofia-speak` →
  `opinion_as_fact`; `r3-sofia-summary` → `fake_listening`; `r3-sofia-speak` → `judging`.
  Round 3's two adjacent fouls are a documented deviation, kept on purpose. `SOFIA_EMOJI`,
  `START_TOKENS = 7`, `RULE_LABEL`, `RULE_GLOSS`, `TOPICS`, `foulCost` (Judging = 2) all
  kept.
- **Tokens are whole and real, 7/7, sum to 14, clamp at 0, never negative** — the state
  every level now shares.
- **L4 (`in-the-ref-seat`) unchanged this step:** ref-seat level, Victor vs Olivia, all
  three cards live, opens by naming the referee and the sequence (ref first, play L5 next).
  Its item ids are legitimately `l4-*` (level 4, not the old Showdown) — do not renumber.
- **The Q17 `free`-close is in all of L1-L4** — `{ kind: 'free', chips: [] }`, records
  `null`, followed by a plain coach `say`. The Showdown ends on its match result, not a
  free-close.
- **Political balance:** the Showdown is balanced structurally (Sofia takes the opposite
  of whatever the player argues, fallbacks written topic-agnostic), so it carries no
  editorial ledger. L1 4:1, L2 offset, L4 split — all ledgers current. `HEART-T260823-33`
  is still Nathan's call in the PR.
- `src/storage.ts` is on `.v2`, committed in `1f0b8b3`; defect 10 is closed.
- The ladder is data: `LEVELS` in `src/content/index.ts` is a `LadderRow[]`, five rows,
  each carrying `screen: 'level' | 'showdown'`. **Add a level by adding a row.**
- **A locked row prints "Locked", not its title.** Do not undo.
- Live slugs: `about-the-argument` · `my-opinion-not-a-fact` · `the-summary-gate` ·
  `in-the-ref-seat` · `the-showdown`. **Save by slug; never rename a live slug** or it
  orphans saves.
- **`confirm` core component** (Q6/Q7/Q8): `ask` → two buttons + always-present note box
  → `onYes` / `onNo`. `pays: 'player' | 'opponent'` moves `CARDS[rule].cost` on a **yes
  only**; a **no is always free**. `confirmValue()` / `parseConfirm()` exported from
  `src/engine.ts`. Both `confirm` and `template` record `correct: null` (soul.md §6).
- **No retries anywhere** (Q12). A wrong answer costs a token; non-answers (thin text, an
  unchanged prefill) reopen the step free.
- `docs/soul.md` has had **its one permitted edit** (Q7 carve-out, §6). Spent.

## Carried questions

- The live-play row (Q5) is a disabled button that changes appearance when the
  ladder is complete (`allCleared` in `src/App.tsx`). Step 6 did **not** give the
  Showdown a new ending beyond its win/loss/draw result, so that flip is still the
  *only* thing that makes clearing level 5 feel different from clearing level 4.
  Revisit whether the row is carrying too much weight.
