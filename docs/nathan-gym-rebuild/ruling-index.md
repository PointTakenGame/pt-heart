# Ruling index — the condensed answers to all 32 questions

Working index. **Full text and reasoning: `rulings.md` in this folder.** Where this
file and `rulings.md` disagree, `rulings.md` wins.

Read this when you need to know *what was decided*. You do not need it in context
to execute a build step — each step brief in `steps/` quotes the rulings that bind it.


Full text in `docs/gym-rebuild/rulings.md`. This is the working index.

**A. Shape**
- **Q1/Q2** Player-first, seven levels, ref-then-player for both showdown pairs. (Table above.)
- **Q3** No free play in this build. No "Play a round", no "Referee a round", no live play. **The level system and nothing else.**
- **Q4** The Level-0 conduct agreement is **cut** — it moves to signup. ⚠️ **The `Agreement()` component in `App.tsx` is *both* the conduct gate and the app's front page. Cutting the gate must not delete the front page.**
- **Q5** Separate main-menu page: live play OR the level system. Live play gated behind L5; live-play-with-Final-Showdown behind L7. Not built here — a locked placeholder row only. Clearing L5 must still feel different from clearing L4.

**B. Core mechanic**
- **Q6** The opponent answers "did I miss anything?", **authored per beat, no model needed**. **No redo, ever.** One check; the offended party briefly explains what the summary missed; the summarizer gets no second attempt.
- **Q7** In the gym the boss's ruling is a scripted answer key. **Write the one-line carve-out into `soul.md`.**
- **Q8** The referee **does** call Fake Listening. The offended player then votes yes or no — whether the ref is AI or human.
- **Q9** **Delete every half-token amount.** No `MISS_COST = 0.5`, no `6½`, no `formatTokens`. A level may cost zero tokens; if it costs tokens, it costs the normal amount.
- **Q10** **Unify Judging at 2 everywhere.** The card is the source of truth.
- **Q11** **No instant loss at zero** (Nathan overrules Steve). Players keep playing and can climb back. **Players cannot go negative.** Fix `rules.md` to match.
- **Q12** No retries. See Q6.

**C. Teaching content**
- **Q13** Retitle L1 to **"About the argument, not the person"** and add a beat covering mind-reading / verdicts-on-character. The word "you" becomes one tell of two.
- **Q14** Rewrite the L2 diner beat. When the good version is shown, **someone must say out loud that it is a personal experience, not a fact** — the coach, or the line itself. It stays a positive example.
- **Q15** The player **does** get summarized. A beat in the Fake Listening level where the boss summarizes the player badly and the player rules on it.
- **Q16** Drill the personal-experience move inside an existing level, **carefully**: a story is a tool, and it must always be framed as an opinion, never as a fact that settles the question for everyone. **The framing is the lesson.**
- **Q17** Every level ends with **one unscaffolded sentence** the player writes themselves — checked loosely, never rejected outright.
- **Q18** Standard boss shape: every boss gets **at least one clean line** (so the player must decline to call at least once) and **a scripted concession** when their habit is retired.
- **Q19** Level 3 rebuilt as a full round, open book. **The Fake Listening card IS played against the player when their summary misses something** — cards work in both directions. **No token penalty. Never forced when the summary was clean.**

**D/E. UI/UX**
- **Q20** Level rows get a **replay** option. **No stats** — no tokens, no foul counts. If the title doesn't already say it, add a line naming the rule learned, identical for everyone who finished.
- **Q21** One end-of-level review screen: the card, its `trains` line, what you did. No score, no confetti, no modal.
- **Q22** The card-tap gesture is taught **in Level 1**: one gesture plus one coach line (the agreement screen that used to do this is gone).
- **Q23** **The gym is open book.** The conversation scrolls; the player can read back. Reason: better to keep the reps at summarizing than to risk failure on memory. *Nathan flagged this as the one item he wants Steve to rule on later.* **Apply uniformly.**
  - KNOCK-ON: the docs' claim that the thread's forgetfulness is load-bearing for Fake Listening is now **wrong** and must be corrected in the same PR.
  - KNOCK-ON: `Thread.tsx` fades old lines by position — that has to go or become purely cosmetic.
  - KNOCK-ON: `engine.beginBoss()` wipes the thread; reconcile with open book.
- **Q24** No change to the composer.
- **Q25** **Remove all clock mentions from the online edition.** Permanent for the level system. A timer may return later for live play, which is out of scope. (Known sites listed in §7.)
- **Q26** Vocabulary: **"foul" for the act, "card" for the object. Nothing else.** "Habit" survives only in a boss's mouth about themselves.
- **Card placement** Cards on the bottom. **Ref avatar and ref rulings at the top.** Steve's 2026-08-25 placement stands; no conflict.
- **UI extra 1** The current build does not fit a laptop screen at 100% zoom — Nathan runs it at 75%. Likely cause `--dlg-h: 34rem` (544px) stacked with header + rail + composer. **Vertical budget must fit ~700px of viewport.**
- **UI extra 2** Live play's style will be a message conversation between two people with the ref at the top, able to play cards. **The level system UI should move closer to this.**

**F. Scope and process**
- **Q27** Restructure, don't rewrite. Keep `cards.ts`, the coach's voice, the drill stepper, the thread, the rail. **Scale the coach's voice back** to remove confusing lingo and invented terms the player has to learn.
- **Q28** New slugs for rebuilt levels; bump storage to `humility-showdown.v2`.
- **Q29** Keep the political-balance ledger accurate; Nathan reviews in the PR.
- **Q30** Docs update in the **same PR**. Nathan's directions override `rules.md` and the other docs freely. **Be careful with `soul.md`** — change it only where a ruling requires it (currently: Q7's carve-out only).
- **Q31** Branch name includes "Nathan". Current branch: `NathanGymLadderRebuild`.
- **Q32** Build order as proposed (see §6).

**Late rulings (Nathan's final go-ahead message)**
- Levels **1–5 only**; 6–7 after.
- `rules.md:219` is stale — correct it in the PR.
- **The token counter stays visible in L1–L3**, and the levels must **explain that a mistake would normally cost a token**, so the no-penalty period reads as a learning allowance and the real cost is not a surprise at L4/L5.
- Apply open book uniformly.

---

