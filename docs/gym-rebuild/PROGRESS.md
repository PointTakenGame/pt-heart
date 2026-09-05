# PROGRESS — gym level-system rebuild

Branch `NathanGymLadderRebuild`. Levels **1–5 only**; 6 and 7 come after.

**One build step, one fresh chat.** Update this file at the end of each step, in the
same commit. Keep it short — it is read at the start of every session.

## Step status

| Step | Brief | Status |
|---|---|---|
| 0 | *(restructure — this scaffolding)* | **done** 2026-09-04 |
| 1 | Ladder scaffold | not started |
| 2 | Q6/Q7 mechanic — `confirm` + `template` step kinds | not started |
| 3 | Level 3 rebuilt as a full round | not started |
| 4 | Levels 1 and 2 retitled and repaired | not started |
| 5 | The referee level at 4 | not started |
| 6 | Showdown renumbered to 5 and reconciled | not started |
| 7 | The passes | not started |
| 8 | Doc reconciliation and the PR | not started |

## Carried state

- **`src/storage.ts` is already bumped to `.v2`** (defect 10 closed) and is
  **uncommitted** in the working tree. Step 1 commits it.
- Nothing else in `src/` has been touched. The rest of the tree is pre-rebuild.

## Step 1's remaining pieces

- `src/content/index.ts` — stale header, and the ladder becomes five entries.
- `src/content/level4.ts` — does not exist yet; a stub is enough for step 1.
- `src/App.tsx` — the ladder rework (defects 9 and 15, Q20 replay, Q5 placeholder).
  ⚠️ `Agreement()` is both the cut conduct gate **and** the front page. Cut the gate,
  keep the page.
