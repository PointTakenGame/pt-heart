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
| 8 | Doc reconciliation and the PR | **done** 2026-09-05 |

## The build is done

**All eight steps are complete. Levels 1–5 are built and the eight briefs are spent.**
The remaining work is not a step: it is the PR, the playtest, and — later — the deferred
Final Showdown (levels 6 and 7). **On what is true today, the code still outranks every
doc.**

## Playtest round — Nathan's 18 findings (2026-09-05)

Nathan played the five levels and filed eighteen items. His instruction: **replicate the
error, fix the root cause, then sweep the rest of the level system for the same
mistake.** Grouped by the fix they need, not by level.

| # | Level | Finding | Status |
|---|---|---|---|
| 1 | global | Zoom broken; he must sit at ~80% to fit the screen | open (G) |
| 2 | L1 | "I only care about one rule…" then the rule goes unaddressed for pages | open (D) |
| 3 | all | "counter up top" is confusing — name the two token stacks | **done** |
| 4 | L1 | "when you catch his card" should be "his foul" (act vs object) | **done** |
| 5 | L1–L3 | drill chat must **not** carry into the boss fight | open (C) |
| 6 | L2 | "that's *his* attack" about Olivia | already fixed in code by `a5e79a3`; docs corrected here |
| 7 | L2 | duplicated Ray lines at the start of the drills | open (C) — no authored cause found |
| 8 | L2 | Next during drills sometimes does not advance | open (C) |
| 9 | global | automated lines arrive too fast, especially 3+ in a row | open (C) |
| 10 | L3 | "I don't buy full remote" reads as buying a remote control | **done** |
| 11 | L3 | boss fight races past the first interaction, then freezes | open (C) |
| 12 | L4 | start button read "In with Olivia" in a two-opponent level | **done** |
| 13 | L4 | first boss line hands the *player* an opinion and makes Ray ref | open (E) |
| 14 | L4 | large revamp: Victor vs Olivia, player refs, player holds **no tokens** | open (E) |
| 15 | L5 | "That's the attack…" wrong for three already-earned cards | **done** |
| 16 | L5 | boss summaries do not read what the player wrote | open (F) |
| 17 | L5 | boss writes the same point three times | open (F) |
| 18 | L5 | round 3 "She's behind" asserted at 7-7 | **done** |

Groups still open: **C** engine/thread (5, 7, 8, 9, 11) · **D** L1 structure (2) ·
**E** the L4 ref revamp (13, 14) · **F** L5 boss quality (16, 17) · **G** zoom/fit (1).

**Q29 political balance is closed** — Nathan, 2026-09-05: *"the political balance is
fine, you can leave it."* The per-level ledger comments stay accurate; the debt is not.

Two mechanics landed with these copy fixes:
- `LevelDef.enterLabel?` — the door button defaults to "In with &lt;last word of boss&gt;"
  and a level fielding two opponents overrides it (finding 12).
- `{ kind: 'card', text? }` — a card panel overrides the coach's first-meeting caption,
  because the Showdown deals three cards the player already cleared levels on
  (finding 15). `Turn.intro` in `content/showdown.ts` also widened to
  `string | ((player, sofia) => string)` so the coach reads the live purses
  (finding 18); `scripts/export-script.ts` renders the function form at 7-7.

## Carried state

**Step 8 (just done) reconciled the docs with the seven-level, player-first ladder.**
One commit, `docs/` only — no code changed.

- **The ladder is seven levels, ruled and player-first:** L1 Judging, L2 Opinions as
  Facts, L3 Fake Listening (all player seat), L4 the referee seat with the full round,
  L5 the Showdown (player) — **base game complete here**. L6 (referee) and L7 (player)
  are the deferred Final Showdowns; the game is complete without them. Save by slug.
- **`rules.md` §8/§9, `roadmap.md` §1/§5/§6/§7/§8 and its reconciliation note, and
  `script.md`'s closing scripts** now describe: seven levels (not six); **no half
  tokens** (Q9 — a missed whistle moves nothing); **no instant loss at zero** (Q11 — a
  purse can empty and climb back); and **the gym as an open book** (Q23 — the thread's
  old "forgetfulness is load-bearing for Fake Listening" claim is reversed). The
  `game/src/showdown.ts:*` citations at `rules.md:206/:220` were de-lined to
  `src/showdown.ts`.
- **`script.md`'s two "instant loss" moderator lines** were rewritten to the Q11 ruling,
  with an editorial bracket recording the v7 deck's original printed wording. Those
  brackets are why the `instant loss` grep still returns hits — they quote the retired
  text before overruling it. That is intentional; do not "clean up" the brackets.
- **`code-map.md`** carries a new banner at the top: post-rebuild, every anchor in it is
  stale — orientation only, code is ground truth.
- **`defects.md`** — the two doc defects (16, 17) are marked ✅ CLOSED, and the two
  thread defects (5, 6, behaviorally closed in step 7) are marked ✅ CLOSED with a note
  that their grep *locators* still hit. Defect 10 was already closed.
- **`soul.md` was not touched** — its one permitted edit (Q7 carve-out) was spent in
  step 2.

## Not done in this session (handed to Nathan)

- **The PR was NOT opened.** Per Nathan's 2026-09-05 note, this round is committed and
  pushed but he opens the PR and reviews it himself. In that PR he reviews the
  **political-balance ledger (Q29), which is still in debt (`HEART-T260823-33`)** —
  L1 is 4:1, L2 offset, L4 split, the Showdown balanced structurally.
- **The playtest was NOT run from here.** It runs separately, against a local dev server,
  from the session that started this one.

## Carried questions / next work (levels 6–7)

- **Levels 6 and 7 — the Final Showdown — are the deferred add-on.** Not a step in this
  rebuild; a later brief. L6 is the referee seat for the Final Showdown, L7 is the
  player seat. New slugs when they come; never collide with the five live slugs.
- The live-play row (Q5) is a disabled button that flips appearance when the ladder is
  complete (`allCleared` in `src/App.tsx`). Clearing L5 (the Showdown) ends on its own
  win/loss/draw result — no review screen by design — so that flip is still the only
  thing that makes clearing L5 feel different from L4. Revisit whether the row carries
  too much weight when the Final Showdown lands.
