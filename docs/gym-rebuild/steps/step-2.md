# Step 2 — The Q6/Q7 mechanic

## Prompt

> Read `CLAUDE.md`, then `docs/gym-rebuild/steps/step-2.md`. Do step 2 only. Do not
> read the other step briefs. Open a file only when you are about to edit it.

## Goal

"Did I miss anything?" gets an authored answer, and the confirm dialogue becomes a real
step kind. **This is the single most important missing thing in the product** — 5/5
learners flagged it.

## Do

1. **`src/types.ts`** —
   - New step kind **`confirm`**: yes / no / free text. Add the matching
     `ComposerState` variant. Steve: *"Ref OR offendee can suggest, 'offendee' always
     is the final decider. 90% of time the ref suggests (it's faster on the buzzer) and
     the offendee just clicks 'yes/no' click to make it easy, but always a text entry on
     that dialogue in case they want to say something."*
   - New step kind **`template`** — `ComposerState.template` already exists and
     `TemplateComposer` in `Composer.tsx` is complete and working. Only the Step kind
     is missing. Do not rewrite the composer.
   - Add `CallOrPassStep.callable?: FoulType[]` and `LevelDef.cards: FoulType[]` plus a
     `seat` marker for the referee level (step 5 needs these).
   - Delete `CallOrPassStep.onWrong` (defect 7 — no retries).
   - Fix the stale header at `:1-4` ("Levels 1 to 3", the retry loop) and the
     `Beat.boss` doc comment that says "the thread clears" (Q23 reverses it).
2. **`src/engine.ts`** — ⚠️ **register both new kinds in `isItem()` (~`:29`) and in
   `submit()`'s switch. A new interactive kind silently no-ops in the `default:` case
   at ~`:506`.** Also remove the attempt ceiling at ~`:486`.
3. **`soul.md` — add the Q7 carve-out. ONE LINE. This is the only soul.md edit this
   whole rebuild is permitted to make.** Inside the gym, the boss's ruling is a
   scripted answer key, not a judgment.

## Binding rulings

- **Q6** The opponent's answer is **authored per beat, no model needed. No redo, ever.**
  One check; the offended party briefly explains what the summary missed; the
  summarizer gets no second attempt.
- **Q8** The referee **does** call Fake Listening; the offended player then votes yes
  or no — whether the ref is AI or human.
- The AI referee **must be wrong sometimes; denying it must be free and acknowledged.**
- A confirm dialogue is **a core component in every level, both seats**, with an
  authored no-API-key path.
- **soul.md §6 stands otherwise: do not improve the detector's precision.** False
  positives are expected and collected — they are the corpus.

## Done-check

```bash
grep -rn "tryNo < 2\|attempt <= 3\|onWrong?" src/    # want 0 (onWrongCard survives)
npm run build
```

Then: a confirm step renders yes / no / free text, records the answer, and works with
no API key.

## Commit

`feat(engine): confirm and template step kinds, authored miss answers, no retries`
