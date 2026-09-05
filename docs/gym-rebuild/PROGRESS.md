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
| 4 | Levels 1 and 2 retitled and repaired | not started |
| 5 | The referee level at 4 | not started |
| 6 | Showdown renumbered to 5 and reconciled | not started |
| 7 | The passes | not started |
| 8 | Doc reconciliation and the PR | not started |

## Carried state

**Step 3 (just done) touched only `src/content/level3.ts`.** No engine, type, or UI
change. It is now a full round built from the existing step kinds — no new machinery.
Step 4 repairs L1 and L2 and has the same toolbox.

- **The Q17 ending is a `free` step with `chips: []`** (unscaffolded, no chips row —
  the Composer guards `chips.length > 0`). It records `null`, is never rejected past
  the `tooThin` gate, and is followed by a plain coach `say` (the `free` case emits no
  reply of its own). **L1 and L2 need this same closing move** — check whether they
  already end on one; L2 currently ends on an `edit` + `continue`.
- **The token-counter line is a spoken coach `say`, not a mechanic.** L3 says out loud
  that a dropped reason *would* move a token but the drills are free, and that only the
  boss calls count. `call_or_pass` still charges a wrong call via `chargeMiss()`, so the
  boss beat is where the counter actually moves — keep L1/L2's framing consistent so
  the "learning allowance" reads the same across L1-L3 (late ruling).
- **`confirm` models one direction only: the human is always the offendee.** L3 uses it
  for Q15 (Noemi summarizes the player, player rules). The card-played-*against*-the-
  player (Q19) is a scripted `say` + `card` demo with no token move, precisely because
  the offender can never rule on themselves and a clean summary must never be forced to
  eat the card.
- `src/storage.ts` is on `.v2`, committed in `1f0b8b3`; defect 10 is closed.
- The ladder is data: `LEVELS` in `src/content/index.ts` is a `LadderRow[]`, five rows,
  each carrying `screen: 'level' | 'showdown'`. **Add a level by adding a row.**
- `src/content/level4.ts` is a **stub** (step 5 writes it). Its header records the two
  things step 5 must settle: `LevelDef.rule` is one `FoulType` but L4 runs all three,
  and the ledger's first line.
- **A locked row prints "Locked", not its title** — withholds the referee word until
  L4. Applied to every row; no special case. Do not undo.
- Live slugs: `about-the-argument` · `my-opinion-not-a-fact` · `the-summary-gate` ·
  `in-the-ref-seat` · `the-showdown`. **Save by slug; step 4's retitles must not change
  L1/L2 slugs** or they orphan saves.
- **`confirm` core component** (Q6/Q7/Q8): `ask` → two buttons + always-present note box
  → `onYes` / `onNo`. `pays: 'player' | 'opponent'` moves `CARDS[rule].cost` on a **yes
  only**; a **no is always free**.
- **Confirm wire format:** `submit()` value is `'yes'`/`'no'`, optionally `\n` + note (a
  newline is untypeable, so it is a safe separator). `confirmValue()` / `parseConfirm()`
  exported from `src/engine.ts`.
- **Both `confirm` and `template` record `correct: null`** (soul.md §6). Both are in
  `isItem()` **and** `submit()`'s switch.
- **No retries anywhere** (Q12). A wrong answer costs a token (consequence, not a retry);
  non-answers (thin text, an unchanged prefill) reopen the step free.
- `COACH.redoSummary` in `src/content/showdown.ts` is **dead copy** for step 6 to delete.
- **Defect 4 left deliberately open.** `CallOrPassStep.callable?: FoulType[]` exists as a
  *type* only; `engine.ts` passes `[step.rule]` and `App.tsx` has `enabled={[level.rule]}`.
  Step 5 wires it. (L3's boss calls therefore only ever offer the Fake Listening card,
  which is correct for a one-card level.)
- **Defect 3 left deliberately open.** `chargeMiss()` and the good-call transfer keep the
  literal `1`; `CARDS[rule].cost` is used only at the confirm site.
- `docs/soul.md` has had **its one permitted edit** (Q7 carve-out, §6). Spent.

## Carried questions

- The live-play row (Q5) is a disabled button that changes appearance when the
  ladder is complete. That flip is currently the *only* thing that makes clearing
  level 5 feel different from clearing level 4. If step 6 gives the Showdown a
  proper ending, revisit whether the row is still carrying that weight.
