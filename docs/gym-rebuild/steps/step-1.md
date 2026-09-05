# Step 1 — Ladder scaffold

## Prompt

> Read `CLAUDE.md`, then `docs/gym-rebuild/steps/step-1.md`. Do step 1 only. Do not
> read the other step briefs. Open a file only when you are about to edit it.

## Goal

Five ladder rows driven by data, no conduct gate, a replay option, and storage on `.v2`.

## Do

1. **`src/storage.ts` is already on `.v2` but uncommitted.** Verify with defect 10's
   grep, then commit it as part of this step.
2. **`src/content/index.ts`** — fix the stale header (defect 11). The ladder is seven
   levels; 1–5 are in scope. Export the five levels once they exist; a stub is fine now.
3. **`src/App.tsx`** —
   - **Q4: cut the conduct gate, KEEP the front page.** ⚠️ `Agreement()` is *both*.
     It carries `<Mast />`, the italic tagline, `<blockquote className="front-quote">`,
     `CARD_ORDER.map(...)`, two `front-clause` paragraphs, and the "I'm in" button.
     A comment there warns that Steve cut two clauses on 2026-08-23 — **do not
     reintroduce them, and do not delete the remaining two.** What goes is the *gate*
     behaviour (`{ name: 'agreement' }` as a blocking route); what stays is the page.
   - **Q20: replay option on every row. NO STATS** — no tokens, no foul counts. If the
     title doesn't already say it, add one line naming the rule learned, **identical
     for everyone who finished**.
   - Locked and cleared states for five rows.
   - **Q5: a live-play row, locked behind L5, non-functional placeholder.** Clearing L5
     must still feel different from clearing L4.
   - Defect 9: rebuild the hand-written Showdown row as data inside `LEVELS.map`, and
     kill the hardcoded `fightNumber={4}`.
   - Defect 15: replace the "Three levels…" copy at ~`:216`.

## Slugs (Q28 — new, must not collide with old saves)

`about-the-argument` · `my-opinion-not-a-fact` · `the-summary-gate` · `in-the-ref-seat` · `the-showdown`

## Done-check

```bash
grep -rn "humility-showdown.v1\|version === 1\|version: 1" src/          # want 0
grep -n "MVP is ship levels 1 to 3" src/content/index.ts                 # want 0
grep -n "level-card-boss\|fightNumber={4}\|Three levels" src/App.tsx     # want 0
npm run build
```

Then click through: five rows render, locked states correct, replay works, the front
page still looks like the front page.

## Commit

`feat(ladder): five-row data-driven ladder, storage v2, conduct gate cut`
