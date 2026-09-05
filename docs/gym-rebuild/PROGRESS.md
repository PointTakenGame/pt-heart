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
| 7 | The passes | not started |
| 8 | Doc reconciliation and the PR | not started |

## Carried state

**Step 6 (just done) renumbered the Showdown to level 5 and reconciled the six
rulings into `src/content/showdown.ts` and `src/showdown.ts`.** No new type, no new
step kind. Step 7 is "The passes" — it has the full toolbox.

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
