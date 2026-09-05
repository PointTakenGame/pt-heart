# Step 7 — The passes

## Prompt

> Read `CLAUDE.md`, then `docs/gym-rebuild/steps/step-7.md`. Do step 7 only. Do not
> read the other step briefs. Open a file only when you are about to edit it.

## Goal

Six cross-cutting passes over the finished levels. Commit each pass separately.

## 1 — Review screens (Q21)

**One** end-of-level review screen: the card, its `trains` line, what you did.
**No score, no confetti, no modal.**

## 2 — Card-tap teaching (Q22)

Taught in **Level 1**: one gesture plus one coach line. Verify it did not get lost when
the agreement screen went.

## 3 — Clock purge (Q25)

```bash
grep -rni "two minutes\|the clock\|your clock\|all night" src/
```

Permanent for the level system. A timer may return later for live play, which is out of
scope. **The two comment hits in `styles.css` and `Drill.tsx` are Steve quotes about
card persistence — leave them.**

## 4 — Vocabulary and voice (Q26/Q27)

- **"Foul" for the act, "card" for the object. Nothing else.** "Habit" survives only in
  a boss's mouth about themselves.
- **Restructure, don't rewrite.** Keep `cards.ts`, the coach's voice, the drill stepper,
  the thread, the rail. **Scale the coach's voice back** — remove confusing lingo and
  invented terms the player has to learn. **The coach's voice was universally praised by
  all five learners. Scale back the lingo, not the voice.**
- `cards.ts` is binding: *"Do not invent new bad examples here."* That binds `cards.ts`
  **only** — level files author their own specimens.

## 5 — Open book, applied uniformly (Q23)

**The gym is open book. The conversation scrolls; the player can read back.** Better to
keep the reps at summarizing than to risk failure on memory.

- Defect 5: `engine.beginBoss()` wipes the thread — reconcile.
- Defect 6: `Thread.tsx` fades old lines by position — remove or make purely cosmetic.
  Scroll pinning in that file is already correct; leave it.
- ⚠️ **The docs' claim that the thread's forgetfulness is load-bearing for Fake
  Listening is now wrong.** Step 8 corrects it in the docs; make sure the code agrees.
- *Nathan flagged open-book as the one item he wants Steve to rule on later.* Apply it
  uniformly for now.

## 6 — The UI fit pass

- **The build does not fit a laptop screen at 100% zoom — Nathan runs it at 75%.**
  Likely cause `--dlg-h: 34rem` (544px) stacked with header + rail + composer.
  **The vertical budget must fit ~700px of viewport.** Note there are **four**
  `--dlg-h*` variables, not one. Other ceilings: `max-height: 50vh`, `32vh`, `44vh`,
  `.composer-locked min-height: 3.9rem`.
- **Cards on the bottom. Ref avatar and ref rulings at the top.** `RuleCards.tsx`
  already matches this — no placement change needed there.
- **Live play's style will be a message conversation between two people with the ref at
  the top, able to play cards. The level system UI should move closer to this.**
- **Q24: no change to the composer.**

## Standing constraints for every pass

**No modals, no toasts, no score popups, no confetti anywhere in the gym.** Feedback is
the coach's words changing and nothing else. **Screen skin is fixed:** light striped
ground, teal, orange, gold, Baloo 2 + Nunito. **No dark mode.**

## Done-check

```bash
npm run build
```

Then run the app at 100% zoom on a laptop and confirm it fits.

## Commit

One per pass, e.g. `feat(ui): fit the gym in a 700px viewport`
