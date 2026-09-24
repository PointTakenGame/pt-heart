---
slot: coach.md
game: heart
purpose: What the coach is for, and the standard its judgement is held to, so a prompt change can be argued about with numbers rather than taste.
status: draft, unreviewed by Steve
sources:
  - docs/rules.md (sections 9 and 12), docs/tech-spec.md (section 8), docs/script.md (section 7), docs/live-play.md
  - src/coach.ts, src/detectors.ts, api/coach.ts, src/engine.ts
  - UsableAICodePT-TileGame (the frozen study fork): backend/agent/SUCCESS_CRITERIA_AND_BENCHMARKS.md
---

# The coach

**Marker key is in `docs/README.md`.** This document is about the coach's
**judgement**: when it is right, when it is wrong, and how anyone can tell.

**It owns no mechanics.** What a foul costs, who may whistle whom, and what a
false call costs live in `docs/rules.md`. How the call is made in code lives in
`docs/tech-spec.md` section 8. The words the coach says live in
`docs/script.md` section 7. Nothing here restates them.

## 1. What the coach is for

The teaching voice of the game. It is present on every rung of the ladder and in
both live-play seats, which is the difference between this game and Brain, where
the coach is practice-only `[unratified: src/room.ts]`.

## 2. The open question this document cannot answer

`rules.md` records the shipped arrangement: the human whistles the AI, and the
coach whistles the human, because a player cannot call a foul on themselves.

**The proposal is that the coach stops whistling anyone and sits to the side as
a reviewer** `[ruled, Gerrit; Steve's confirmation outstanding]`. Under it the
coach comments on what it saw and never nominates a foul, and the token
consequence follows only from a human call.

GAP: Steve rules on this. It is not a wording change: with no coach nomination
and no third human, nothing calls a foul on the player in the showdown and in
live play, so either the mode changes or the player's own fouls stop costing
anything. **Do not implement a tightening of the coach's foul-calling until this
is answered**, because the whole behaviour may be leaving.

The rest of this document is about the coach's judgement, and holds either way.

## 3. Two of the three fouls cost nothing to judge

Judging and Opinions as Facts are callable from phrase rules, with no model call
at all. Fake Listening needs one call per summary `[unratified:
src/detectors.ts]`.

**So the coach's accuracy risk is almost entirely one judgement: whether a
summary really listened.** That is where the case set and the bar below go.

## 4. The bar

Heart has no tests and no labelled cases `[unratified]`. Until it does, every
claim about the coach being accurate is untested.

The first case set is **20 summaries, half of them faithful and half of them fake
listening** `[vibecoded]`, each labelled by two people independently, keeping
only the ones they agree on. A case the team cannot agree about is a design
question, not ground truth.

| Measure | Bar | Why |
|---|---|---|
| Accuses a faithful summary | never | A false accusation costs the player a token and the game's credibility at once |
| Agrees with two human raters on the labelled set | at least 85% | The study's own floor, carried over |
| Political pairs scored the same | every pair | Each case that leans one way is paired with an equally vivid one leaning the other |
| Thin answers rejected before any model call | 100% | `tooThin` already refuses under 10 characters or fewer than 3 words `[unratified: src/engine.ts:62]` |

The bar is deliberately lopsided, the same way Brain's is. A missed foul costs
nothing by ruling, since letting a real foul pass moves no tokens. A false
accusation costs a whole token. **The coach should err toward saying nothing.**

## 5. Offline is a supported state, not a degraded one

With no key the game plays a full level on authored replies and shows no error
`[unratified: README.md, src/coach.ts]`. This stays true. Any change to the
coach keeps a playable offline path, and a level that cannot be finished without
a model call is a bug.

## 6. Speed

Detector fouls are instant, because no call is made. A model reply arrives within
3 seconds 95% of the time `[vibecoded]`. Slower than that and the coach stops
feeling like somebody watching the table.

## 7. What is recorded

Every judgement, **including the ones where the coach found nothing**, with the
model name, the prompt version and the schema version `[vibecoded]`. The corpus
write already records one row per answered item `[unratified: src/corpus.ts]`,
which is the natural home.

Without the silent judgements, the first row of the bar in section 4 can be
measured against the case set and never against real play.

## 8. Spending

The deployment is open to anyone with the URL, and every coach reply is billed to
the project's key. The endpoint carries a rate limit and the key carries a hard
spend cap `[vibecoded]`.

GAP: both numbers. Measure one full playthrough first.

## 9. Not specified here

- **The levels 1 to 3 redesign.** Steve ruled the human should referee a
  coach-versus-opponent exchange; the shipped levels predate it. `roadmap.md`
  owns that, and the coach's voice in the new shape follows the decision rather
  than leading it.
- **A score for a whole game.** Brain is considering one. Heart has no such
  measure and no rubric of its own.
- **The four open live-play rows**: the third seat's label, how stances are
  assigned, the foul rate, and the clock. `live-play.md` owns them.
