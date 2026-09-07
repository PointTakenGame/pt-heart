# Rebuilding the gym ladder — decisions I need from you

Nathan, 2026-09-03. Nothing has been built. No project file has been touched.
Every item below is written to be ruled on in one pass: **Question / Why it matters /
Evidence / Options / My recommendation**. Answer with the option letter, or overrule
with your own.

Blocking items are marked **[B]** — I cannot start without them. The rest have a
default I will take if you skip them.

---

## 0. Four corrections to the report I sent you

I verified the report's code claims afterward. Four of them were wrong, and three of
those were load-bearing. Rule on the questions below using these facts, not the report.

1. **"Nothing marks a level cleared" — false.** `App.tsx:244` renders a `cleared`
   badge on every finished level row and `:263` renders `played` on the Showdown row.
   The five learners never saw them because they were each playing forward for the
   first time. **The level list already has completion state.** The real gap is that
   the badge is the *only* thing that ever changes; nothing records how you did.

2. **"The card doesn't carry the definition or the price" — false, and badly so.**
   `src/content/cards.ts` gives every card a `cost`, a plain-language `what`, a
   `blurb`, a `tell`, three bad/fix `deltas`, a `fix`, and a complete printed face
   (eyebrow, penalty band, intro, smoke, instead-list, incorrect/correct pair,
   "trains"). Judging already carries `DOUBLE PENALTY`. And `RuleCards.tsx:39-49`
   confirms that with no call open, **tapping a rail card opens the full printed
   face**, and `:88` gives every taught card a hover tooltip of the same face. The
   reference material is all there, in every level, for every taught card. The
   problem is that nobody discovers the gesture — not that the content is missing.
   That changes the fix from *write the cards* to *teach the tap once*.

3. **Learner 1's Round-3 dispute — resolved against him.** He argued the line
   "Right, right. You are frustrated about the whole thing. Anyway." isn't really
   Fake Listening. It is `CARDS.fake_listening.deltas[1].bad`, verbatim — it is on
   the printed card. The genuine finding underneath his complaint survives: the
   card's stated `tell` lists only hinge words ("I hear you, but", "Sure, but my
   point is", "Respectfully", "First of all"), and *none of them appear in that
   line*. The card teaches one tell and then tests a different one. That is a
   teaching gap in the level, not an error in the card.

4. **"The Judging card is under-inclusive" — false.** The card's `tell` has both
   halves: *"'You' statements are the smoke alarm. If the sentence is about them
   rather than about the argument, it is this card."* The **level title** — `The
   word "You"` — teaches only the first half, so four of five learners left Level 1
   believing Judging is a word filter. The fix belongs in the level, not the card.

One thing the report got right and I want to restate because several rulings hang
off it: **the Judging price is three-way inconsistent.** `cards.ts` says cost 2 /
DOUBLE PENALTY; `engine.ts:80-99` moves a flat 1 token in L1–L3; `foulCost()` is
only ever called at `showdown.ts:403` and `:481`, so 2 is charged in the Showdown
and nowhere else. A player who learns the economy in the gym learns it wrong.

---

## 1. The ladder I would build, if you want to ratify it wholesale

Read this first; most of section A collapses if you take it or reject it outright.

| # | Name | Seat | Teaches | Boss |
|---|---|---|---|---|
| 0 | *(unnumbered)* The Agreement | — | the deal, the three cards, the tap gesture | — |
| 1 | About the argument, not the person | player | Judging | Victor |
| 2 | In my head, because | player | Opinions as Facts | Olivia |
| 3 | Did I miss anything? | player | Fake Listening **as the summarizer** | Noemi |
| 4 | You be the ref | referee | all three, no tokens at risk | two AI arguers |
| 5 | The Showdown | player | all three live, tokens real | Slippery Sofia |
| 6 | The Final Showdown | player | all three + the humility bonuses | Stonewall Sung-min |
| — | Play a round / Referee a round | either | free play on your own topic | AI |
| — | Live play | referee-less | two humans, coach moderates | — |

Six numbered levels, which is what `roadmap.md:251` and `rules.md:219` already rule.
Your seven and the ruled six differ in exactly two ways: you split the referee seat
into two levels, and you put both of them *after* the Sofia showdown and *before*
the Final Showdown. I am recommending against both halves of that, for reasons in
Q1 and Q2 — but it is your call, and if you take your seven I will build your seven.

---

## A. Ladder shape and numbering

### **[B] Q1. Six numbered levels or seven?**
**Why:** determines file layout, save keys, the two hardcoded `4`s in `App.tsx`, and
every "level N" string in the coach's mouth.
**Evidence:** `roadmap.md:251` and `rules.md:219` both rule **six**,
`[ruled, Nathan; Steve's confirmation outstanding]`, and rules.md says in terms
"build against six." Your brief says seven. Note the false friend: roadmap §4's
*rejected* "seven levels" was seven **teaching** levels — a different scheme, not
this one. Your seven is not in conflict with that rejection.
**Options:** (a) six, one referee level, per the standing ruling. (b) seven, two
referee levels, per your brief. (c) seven, but the seventh is *Play a round* promoted
into the ladder rather than a second referee level.
**Recommendation: (a).** One referee level does the teaching; the second is the one
thing all five learners independently flagged as the ladder's dead spot. If you want
seven slots, (c) spends the extra slot on the thing the gym never does — let the
player say a sentence nobody scripted.

### **[B] Q2. Where does the referee seat go?**
**Why:** this is the single biggest structural question, and it is what you asked me
about directly ("whether it is better to learn as the referee, a player, or both").
**Evidence:** all five learners rejected two adjacent referee levels between the two
showdowns. Two independent phrasings: *"a pacing dead zone"* and *"refereeing is a
demotion and it sits after the climax like an epilogue."* Separately: the "Spot it"
drills in L1–L3 **already are referee mode** — you watch two other people talk and
call the foul — they are just not labelled that way, and they charge you half a token
for a miss, which is the one thing a real referee never pays.
**Options:** (a) one referee level at **4**, before the Sofia showdown — it is the
rehearsal, the showdown is the exam. (b) one at 5, between the two showdowns, per
your brief's spirit but halved. (c) two, at 5 and 6, exactly as briefed. (d) one
before Sofia and one after, split around the showdown.
**Recommendation: (a).** Refereeing is the lower-pressure seat — you judge without
also having to produce a sentence — so it belongs *before* the level that asks for
both at once, not after. It also finally gives the L1–L3 drills a name: "you have
been refereeing this whole time; now do it with nothing to interrupt you."
**Answer to your underlying question — player or referee?** Both, but not evenly.
The referee seat teaches *detection*; the player seat teaches *production*. The gym
currently runs ~22 detection decisions against ~11 production acts, and asks the
player to compose a summary from scratch exactly **zero** times. The ladder does not
need more refereeing. It needs more speaking.

### Q3. Does *Play a round* / *Referee a round* ship with this rebuild?
**Why:** scope. Free play needs a live model that will argue an arbitrary topic and
commit exactly one named foul in character — which is a different engineering problem
from anything currently in the codebase, and it must degrade gracefully with no API
key (every model-backed line in the app currently has an authored fallback; free play
cannot have one).
**Evidence:** `rules.md` §2 and §9.10 already rule the *mechanism* — "she argues the
opposite of whatever the player argued." What blocks it is that a hand-authored boss
cannot argue a topic invented thirty seconds ago. Two learners hit the symptom from
the other side and wrote the same complaint: *"the game didn't hear me."*
**Options:** (a) ship as locked rows with a "coming soon" sub-line, visible so the
ladder reads as finite. (b) ship *Referee a round* only — refereeing two AI arguers
is much easier than being argued with, because neither side has to react to the
player. (c) ship both. (d) omit the rows entirely.
**Recommendation: (b).** It is the achievable half, it reuses the referee level's
whole UI, and it gives clearing the gym somewhere to go.
**Default if you skip this: (a).**

### Q4. Is there a Level 0 / agreement screen, and is it numbered?
**Evidence:** `rules.md:219` — "An unnumbered agreement screen sits before L1." It
exists in the ruling; I have not found it in `src/`.
**Recommendation:** yes, unnumbered, and it does three jobs: states the deal, shows
the three cards face-up, and **makes you tap one** — which is where the tap gesture
gets taught (see correction 2 and Q22).

### Q5. Where does live play sit in the list, and what unlocks it?
**Evidence:** clearing the gym is the documented onboarding gate into live play; none
of live play is built.
**Options:** (a) a visibly locked row at the bottom, unlocked by clearing the last
level, greyed until then. (b) hidden until cleared. (c) not in this list at all.
**Recommendation: (a).** A locked row at the bottom is what makes the ladder feel
like it leads somewhere. **Default: (a).**

---

## B. The core mechanic — the thing I most need you to rule on

### **[B] Q6. Who answers "Did I miss anything?", and what does the answer do?**
**Why:** five of five learners called this out, one of them as *"the single most
important missing button in the product."* It is `soul.md` §6 unenacted: the ruling
that never moves is that a foul happened if **the other person felt fouled**, and for
Fake Listening the only person who can rule is the one who was summarized. Right now
the question is asked and then nothing happens — the game moves on regardless.
**Evidence:** `rules.md` §5 makes the answer the ground truth. There is no summary
coverage check anywhere in the code: `SUMMARY_FRAME` enforces the *shape* of the
sentence, and nothing at all checks whether it covered anything.
**Options:**
 (a) **The opponent answers.** After the player's summary, the boss says either "yeah,
     that's it" or "you missed the part about X" — authored per beat, no model needed.
     A miss costs the player the Fake Listening penalty; nothing is charged for a hit.
 (b) The player self-scores against a revealed checklist of the boss's points.
 (c) A detector scores coverage and the coach rules.
 (d) Leave it rhetorical, as today.
**Recommendation: (a).** It is the only option consistent with §6 — the summarized
party rules — and it is fully authorable, so it works with no API key. (c) violates
§6 outright: software would be deciding a foul happened.
**Sub-question I need answered with it:** when the boss says you missed X, do you get
to **redo the summary**? I recommend yes, with no cap on retries, which matches the
`[ruled, Nathan]` no-retry-cap position — and note the code currently disagrees:
`showdown.ts:433` is `while (attempt <= 3)`.

### **[B] Q7. Does an AI ruling on its own summary satisfy soul.md §6?**
**Why:** §6 says software never decides a foul happened; it routes the call to the
possibly-wronged human. In the gym there **is** no other human — the wronged party
*is* the AI. Either §6 has a stated gym exception or the gym cannot teach Fake
Listening at all.
**Options:** (a) yes, explicitly — inside the gym the boss is authored, so its ruling
is a scripted answer key, not a judgment, and §6 gets a one-line carve-out saying so.
(b) no — the gym only ever teaches you to *recognise* Fake Listening, and being ruled
on waits for live play.
**Recommendation: (a),** and I would add the sentence to `soul.md` in the same PR so
the exception is on the record rather than implied by the build.

### **[B] Q8. Does a referee get to call Fake Listening at all?**
**Why:** under §6, only the summarized party can. A referee watching two other people
therefore cannot rule on it — and a literal reader will notice this on the first
screen of the referee level.
**Options:** (a) the referee flags it and **the summarized AI arguer confirms or
denies** — the flag opens the question, the wronged party answers it. (b) the referee
calls it outright inside the gym; the tension is not surfaced. (c) Fake Listening is
greyed out in the referee level.
**Recommendation: (a).** It is the mechanic from Q6 pointed the other way, it costs
one extra authored line per beat, and it makes §6 *visible* instead of contradicted —
the referee learns, in the mechanic itself, that this is not their call to make.

### Q9. `MISS_COST = 0.5` — keep, change, or delete?
**Why:** three learners attacked it, on the grounds that charging the player for
failing to spot a foul is software unilaterally deciding a foul occurred.
**Evidence:** `showdown.ts:56`, charged at `:413`. `formatTokens` already prints `6½`,
so the half-token is a deliberate, built thing, not an accident.
**Options:** (a) keep it in the Showdown levels, drop it in the teaching levels.
(b) delete it everywhere. (c) keep as is.
**Recommendation: (a).** A miss should cost nothing while you are learning to see and
something once you are being tested. **Default: (a).**

### Q10. Unify the Judging price at 2?
**Evidence:** the three-way split in §0. `cards.ts` cost 2 / DOUBLE PENALTY vs
`engine.ts:80-99` flat 1 in the teaching levels vs `foulCost()` = 2 in the Showdown.
**Recommendation:** yes — the card is the source of truth, per the `cards.ts` header
("the card in the app has to be the card on the table"), so the engine changes, not
the card. **Default: unify at 2.**

### Q11. Zero tokens — instant loss, or not out?
**Evidence:** `rules.md` §1 and §8 plus `showdown.ts:250` say instant loss.
`soul.md` §11 says not out. soul.md has precedence over everything.
**Recommendation:** follow soul.md — at zero you keep playing and can climb back —
and fix rules.md in the same PR rather than leaving the two in conflict.

### Q12. Retry cap.
**Evidence:** `showdown.ts:433` caps at three attempts; "no cap on retries" is
`[ruled, Nathan]`.
**Recommendation:** remove the cap, per your own standing ruling. If the cap exists
because an uncapped loop can strand a player who genuinely cannot produce the
sentence, tell me and I will build an escape hatch that is not a silent cap.

---

## C. What the levels actually teach

### **[B] Q13. Retitle Level 1?**
**Why:** correction 4. The level is called `The word "You"`, so four of five learners
left it believing Judging is a word filter — one wrote that they expected the game to
accept any sentence without "you" in it.
**Options:** (a) retitle to "About the argument, not the person" and make the "you"
tell one of two, not the whole rule. (b) keep the title, add a second beat covering
mind-reading and verdicts-on-character. (c) leave it.
**Recommendation: (a) and (b) together.** The card already has both halves written;
the level just has to use the second one.

### **[B] Q14. The Level 2 diner beat.**
**Why:** four of four learners who reached it got it wrong and objected — a learner
called it *"the exact moment the gym rewards the wrong behaviour."* The beat whistles
the deep-canvassing move: the speaker recalls a personal experience, which is exactly
the behaviour the whole game is built to produce, and the level marks it a foul.
**Options:** (a) rewrite the beat so the fouling line is a genuine unowned assertion.
(b) keep it and add a coach line explaining why it is still a foul. (c) delete it.
**Recommendation: (a).** But note the constraint: `cards.ts`'s header forbids
inventing new bad examples, because every line has to be on the printed card. **I
need to know whether that constraint binds level content too, or only card content**
— if it binds both, this beat cannot be rewritten without a card change, and that is
a Steve conversation, not a code change. Please rule on this; it gates several fixes.

### Q15. Does the player ever get summarized?
**Why:** the round in `rules.md` §5 is symmetric — you summarize, then you *are*
summarized and you rule on whether you were heard. The gym only ever runs the first
half. The player never once exercises the judgment that §6 says is the whole game.
**Options:** (a) add a beat in the Fake Listening level where the boss summarizes the
player badly and the player rules. (b) make it a level of its own. (c) leave it to
live play.
**Recommendation: (a).** It is the missing half of the round, it costs one beat, and
it is where "did the other person feel fouled?" stops being a doctrine and becomes a
button you press.

### Q16. Is the deep-canvassing move ever drilled?
**Why:** the research lineage the game is built on says the effective move is
recalling a personal experience that produced the same emotion. It appears in **no**
built level and in no planned one.
**Options:** (a) it becomes the Final Showdown's win condition — you cannot beat
Stonewall by calling fouls, only by getting a story out of him. (b) a drill in an
existing level. (c) out of scope for this rebuild.
**Recommendation: (a),** as the thing that makes the Final Showdown different in kind
from the Showdown rather than just longer. If that is too much scope, **(c)** — I
would rather not do it than do it thinly. Tell me which.

### Q17. Detection-to-production ratio.
**Evidence:** ~22 detection decisions vs ~11 production acts; from-scratch speech: 1;
from-scratch summary: 0. Every "production" moment is currently fill-in-the-blank.
**Options:** (a) every level ends with one unscaffolded sentence the player writes
themselves, checked loosely and never rejected outright. (b) keep it scaffolded.
**Recommendation: (a).** This is the single change most likely to make the gym
transfer to a real conversation. Loosely checked matters — the failure mode to avoid
is a text box that rejects a sincere answer.

### Q18. A standard boss shape?
**Evidence:** Victor concedes and has a clean line; Olivia has no clean line and never
concedes; Noemi is never actually faced. Learners noticed and read it as a bug.
**Recommendation:** yes — every boss gets at least one clean line (so the player has
to *not* call a foul at least once) and a scripted concession when their habit is
retired. This is the "reform the boss, do not deplete the boss" rule made uniform.
**Default: yes.**

---

## D. The Level 3 rebuild

### **[B] Q19. What shape does the Fake Listening level take?**
**Why:** five of five flagged it; four of five made rebuilding it their single change.
Quotes: *"a cutscene with a QTE"*, *"reading comprehension with the passage still on
screen"*, *"would have quit here."* The Fake Listening card is never once pressed in
the level that teaches it. And the difficulty curve inverts across the ladder —
boss depth goes 3 exchanges → 2 → **1 button** → 12 turns. One learner: *"that's not
a curve, it's a dip."*
**Options:**
 (a) **A full round.** Noemi speaks, the player summarizes, Noemi answers "did I miss
     anything?" (Q6), roles switch, Noemi summarizes the player badly, the player
     rules (Q15). Three exchanges, symmetric, the card gets pressed.
 (b) Keep the current shape, add exchanges.
 (c) Fold it into the referee level.
**Recommendation: (a).** It is the level that finally shows the player a whole round
of the actual game before the Showdown asks them to play one.

---

## E. UI/UX — your fifth question

### Q20. What does a level row show?
**Evidence:** `cleared`/`played` badges already exist (`App.tsx:244`, `:263`); the
lock and the `clear level N first` sub-line already exist.
**Options:** (a) keep the binary badge. (b) add a result — tokens finished with, or
fouls called / fouls missed. (c) add replay.
**Recommendation: (b) + (c).** Storing a result per slug is small, and a ladder you
can only ever walk once is a ladder you cannot practise on. Replay must not be able
to *un*-clear a level.

### Q21. Is there an end-of-level review?
**Why:** nothing bridges the gym to a real conversation. No debrief, no take-home. The
last thing a level does is unlock the next one.
**Recommendation:** yes, one screen: the card you just learned, its one-line `trains`
string (already authored on every card), and what you did — no score, no confetti, no
modal, per the standing no-celebration ruling. Feedback stays the coach's words.

### **[B] Q22. How do we teach the card tap?**
**Why:** correction 2 — the full printed face is one tap away in every level and
nobody found it. Learner 5's 61-item confusion ledger is mostly questions the printed
face already answers.
**Options:** (a) the agreement screen (Q4) makes you tap a card before you can
continue. (b) a first-level coach line pointing at the rail. (c) a persistent
affordance on the chip.
**Recommendation: (a).** One gesture, taught once, in the one place that exists to
teach the frame. (b) as a fallback if you drop Q4.

### Q23. Is the "on the table" strip in the boss thread too, or only in drills?
**Evidence:** `Drill.tsx` pins the current specimen so the frame never moves while
you type. `Thread.tsx:116` fades by position, and old lines scroll away and cannot be
re-read — which is documented as *load-bearing* for Fake Listening, since being unable
to scroll back is the whole difficulty.
**Recommendation:** **no** — do not add it to the boss thread. It would delete the
mechanic. Flagging it because two learners asked for it and I want the "no" recorded
deliberately rather than by omission.

### Q24. Composer shape.
**Evidence:** the composer changes shape four times across a level, while the coach
promises the card "stays on the wall all night." `types.ts` has seven `ComposerState`
variants (README says five; README is stale).
**Recommendation:** the *rail* never moves — it already doesn't. Leave the composer
alone; it changes because the task changes, and that is legible. No change requested,
raising it so you can overrule me.

### Q25. Timers, or purge the clock language?
**Evidence:** no timer exists anywhere in the code. The print deck has 30s/45s badges
and the coach says "two minutes," "the clock," "on the clock," "all night" — none of
which is true.
**Options:** (a) purge the clock language from the online edition. (b) build real
timers. (c) leave it.
**Recommendation: (a).** A timer changes the game from "find the right words" to
"find them fast," which is the opposite of the trained behaviour. The print deck keeps
its badges; the online edition stops referring to a clock that isn't there.

### Q26. One word for the thing.
**Evidence:** the app calls it a foul, a habit, a move, an attack, and a card,
sometimes in adjacent lines. Learner 5's ledger opens with this.
**Recommendation:** **foul** for the act, **card** for the object you press, and
nothing else. "Habit" survives only in the boss's mouth about themselves.
**Default: as recommended.**

---

## F. Scope and process

### **[B] Q27. How much of the existing content survives?**
**Options:** (a) **Restructure** — keep `cards.ts`, the coach's voice, the drill
stepper, the thread, the rail; rewrite level *content* and the ladder around them.
(b) **Rewrite** the level content files from scratch, same components. (c) **Rebuild**
including components.
**Recommendation: (a).** The coach's voice was praised by all five learners and is
doing the real feedback work; the components are heavily reasoned and each carries a
Steve ruling in its header. The problems are in structure and level content, not in
the machinery.

### Q28. Save migration.
**Evidence:** saves are keyed by slug, never by index — ruling B3, 2026-08-23 — so
reordering costs nothing. But if a slug's *meaning* changes (Level 3 becomes a full
round), an old save marks it cleared for a level nobody played.
**Recommendation:** new slugs for rebuilt levels, and bump the storage key to
`humility-showdown.v2`. Nobody has a save worth protecting yet.
**Default: as recommended.**

### Q29. Political balance sign-off.
**Evidence:** balance is documented as non-negotiable and currently in debt
(`HEART-T260823-33`). Every level file carries a balance-ledger comment that must
stay accurate. Any new authored line adds to that ledger.
**Question:** do you want to sign off on the new lines before I commit, or should I
keep the ledger and you review it in the PR?
**Recommendation:** I keep the ledger accurate and you review it in the PR. Say the
word if you want it earlier.

### Q30. Do the docs get updated in the same PR?
**Why:** several rulings above put code in conflict with `rules.md` (Q11 zero tokens,
Q12 retry cap, Q1 level count) or add to `soul.md` (Q7). Docs reach `main` through a
PR, not a direct push.
**Options:** (a) same PR, docs and code together. (b) code first, docs follow.
**Recommendation: (a).** The conflicts are the kind that get forgotten.

### Q31. Branch name.
**Recommendation:** `gym-ladder-rebuild`, branched off `main`, so Steve can test it
without it touching anything that exists. Say if you want a different name or a
different base.

### Q32. Build order.
Assuming the recommendations above, I would build in this order so you can test
something real early:
 1. The ladder scaffold — six rows, agreement screen, gating, badges, result storage.
 2. Q6/Q7 — "did I miss anything?" answered, with the redo. Everything else leans on it.
 3. Level 3 rebuilt as a full round (Q19), which is the first place Q6 is visible.
 4. Levels 1 and 2 retitled and repaired (Q13, Q14).
 5. The referee level at 4 (Q2, Q8).
 6. Showdown and Final Showdown renumbered and reconciled (Q9–Q12, Q16, Q18).
 7. Review screens, tap-teaching, clock-language purge, vocabulary pass (Q20–Q26).
 8. Doc reconciliation (Q30).
**Tell me if you would rather see them in a different order** — steps 1–3 are the ones
worth testing before I go further.

---

## The short version, if you want to rule fast

The eight that actually change what gets built: **Q1** (six or seven), **Q2** (where
the referee seat goes), **Q6** (who answers "did I miss anything?"), **Q7** (does the
AI's ruling count), **Q13** (Level 1's title), **Q14** (the diner beat, and whether
the no-new-bad-examples rule binds level content), **Q19** (Level 3's new shape),
**Q27** (restructure vs rewrite).

Rule on those eight and I can start; I will take my recommendation on everything else
unless you say otherwise.
