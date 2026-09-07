# The Gym Level System — Playtest Report

Five learners, four built levels, and the seven-level plan
2026-09-03 · no code changed

---

## 0. Method, and one honest caveat

I read the documentation set (`soul.md`, `rules.md`, `roadmap.md`, `README.md`, parts of `ui-components.md`) and the shipped source (`App.tsx`, `types.ts`, `engine.ts`, `showdown.ts`, `Thread.tsx`, `Drill.tsx`, `Prefight.tsx`, `BossIntro.tsx`, the three level files, `cards.ts`). Then I wrote a faithful player's-eye transcript of the entire shipped gym — every screen, every coach line, every button, verbatim — and dispatched five Fable subagents against it, each with a different persona and a different brief.

**The caveat:** the five agents could not all drive the single shared browser pane at once, so they played the transcript, not the build. That means their reports are trustworthy on content, sequence, wording, rules, and difficulty, and *untrustworthy on feel* — animation, timing, weight of a token sliding across the screen, how the walk-out actually reads at 620ms a tick. Where a finding depends on motion I've marked it. Everything else stands.

The personas:

| # | Persona | Brief |
|---|---|---|
| 1 | Competitive debater | Wants to win. Will game the system. Where can I cheat? |
| 2 | Conflict-averse | Goes quiet in arguments. Where does this make me feel policed? |
| 3 | Teen gamer | Judges it as a game. Is the boss fight a boss fight? |
| 4 | Facilitator | Runs real conversations. Does this transfer? |
| 5 | Literal ESL newcomer | Reads every word. Keep a confusion ledger. |

They agreed far more than I expected. Where four or five converged independently, I've said so — that's the strongest signal in this document.

---

## 1. Headline

**The teaching is good. The game around it is not finished, and it gets less finished as it goes.**

The coach's voice is the best thing in the product and is doing essentially all the real instructional work. Three separate learners named the same sentence as the best line in the gym: *"Same guy, better argument. That's the whole trade."* The corner panels, the "on the table" strip, the full-width *"I might not agree, but it's not a foul"* row, and the level titles as a cheat sheet were all praised by four or five out of five.

Against that: the difficulty curve **inverts**. Boss depth runs 3 exchanges → 2 → 1 button → 12 turns. Learner 3 put it as *"3 → 2 → 1 → 4. That's not a curve, it's a dip."* The hardest and most load-bearing card — Fake Listening — gets the thinnest boss in the gym, a single multiple-choice question with the source text still on screen. All five flagged Level 3's boss. Four of five made it the subject of their single recommended change. Learner 4, the facilitator, wrote *"Would have quit here."*

And the thesis of the whole game — soul.md §6, *did the other person feel fouled?* — **is never enacted anywhere in the shipped gym.** The player is taught to say *"Did I miss anything?"*, says it four times across four levels, and is never once answered. When Sofia summarizes the player in Level 4, there is no button for the player to answer her check. Learner 4 called this *"the single most important missing button in the product."* Learner 5, reading literally, arrived at the same place from the opposite direction: he was charged half a token for a Fake Listening he, the summarized person, was never asked to rule on.

That one gap explains most of the others below.

---

## 2. What is working — keep these

These are consensus items. Do not let a rebuild eat them.

1. **The coach's voice.** Dry, specific, never scolding. Cited repeatedly across all five: *"a headcount, not a reason"*; *"It's shorter by exactly the part you would have argued for"*; *"He just sentenced a few million people in one line"*; *"Nothing she just said was a foul, which is the hard part"*; *"A real because is something somebody could go and check"*; *"The rule isn't about what you believe, it's about pretending your belief is the weather."* Learner 5 (ESL) named the last of these as the exact moment Opinions as Facts clicked. Whatever else changes, the voice is the asset.

2. **The level titles.** `The word "You"` / `In my head, because` / `Did I miss anything?`. All five called the list a cheat sheet and meant it as praise — the titles are the mnemonic. (Caveat in §5: title 1 teaches a tell that the level itself then breaks.)

3. **The "on the table" strip** (`Drill.tsx:110-116`). Four of five named it unprompted. It is the reason the drill never loses the player. **The thread has no equivalent**, which is exactly why Level 4 confuses people about when a line has gone "past" and the half-token miss lands.

4. **The full-width *"I might not agree, but it's not a foul"* row.** Learner 5: *"the clearest control in the game — it names the hard choice."* Letting the honest one through is the actual skill, and this control is the only place the gym gives it equal visual weight.

5. **Teach by delta.** Every drill shows the bad line with its repair. It holds in all four levels' drills and it works. (It **breaks in three of four bosses** — Learner 4's finding.)

6. **Reform the boss.** Victor's concession — *"I have got nothing left but the argument"* — landed for everyone, including the ESL reader, who said it was where he understood what winning looks like. **Olivia does not concede and Noemi is never argued with**, so the lesson is taught once and then withdrawn.

7. **The rhythm.** Corner → walk-out → drill → boss, identical every level. Even the learner most annoyed by the boxing idiom said the regularity helped: by Level 2 he knew what came next.

8. **The corner panels.** The setup work — *"Both of those are real arguments. Neither one is a foul"* — is the clearest framing in the product and is doing more than the cards themselves.

---

## 3. Your five questions

### Q1 — Seriousness vs fun: is the intro conducive to learning?

**The split is real, it is not fatal, and the fix is not to pick a side.**

The agreement screen reads like a consent form for a study (*science-backed*, *you can leave anytime*, *not to win*). Then FIGHT 1 starts, with a VS bolt and a crowd. Two learners read that as two products fighting. Learner 2 (conflict-averse) said the walk-out was *"the closest I came to closing the app… it's embarrassing"*, and Learner 4 said it *"primes adrenaline in the person I'd least want primed."* Learners 1 and 3 said the opposite — Learner 1: *"the moment I stopped resenting the product."*

So the vibe is persona-split, not wrong. But three concrete things are wrong regardless of taste:

- **The screens contradict each other on the literal text.** Screen 0 says *"take the fight out of a disagreement"* and *"not to win"*; Level 1 is labelled FIGHT 1 and Level 4 ends *"You took it."* Learner 5 logged both as contradictions before he'd played a single item.
- **The fight costume drags in a second vocabulary the player has to decode on top of the rules** — corner, walk-out, whistle, swing at it, in with him, on the clock, the trade, a bad whistle. That is a second syllabus, and it is the one the accessibility learner failed.
- **It promises a clock that does not exist.** *"You're in with him in two minutes"*, *"both of you on the clock"*, *"wasting your own clock."* There are no timers anywhere in the shipped code, despite the print deck's 30s/45s badges. The ESL reader waited for a countdown twice.

The load-bearing observation, from Learner 5: **the best one-line definitions of the three fouls are the boss epithets on the walk-out screen** — *"Never says 'I think.' Everything she believes is simply a fact"* is clearer than anything the coach says about that card — and they are printed on a screen designed to be passed in three seconds. The arcade dressing isn't the problem. Hiding the definitions inside it is.

**Recommendation:** keep the arcade frame, and make it carry the teaching instead of decorating it. Put each boss's epithet where it can be re-read (the card, the rail on tap, the level list row). Cut the idioms that carry information — a *"bad whistle"* costs you one token, so say that. Cut every reference to a clock until a clock exists. And let the walk-out be skippable and let it *change* between levels; identical four times with zero teaching content was the one thing all five agreed on about it.

### Q2 — Is the level system cohesive?

**The costume is cohesive. The game underneath it is four different games.**

- L1 is a rail with a "not a foul" row.
- L2 changes shape mid-level into three labelled buttons (*Said as a fact / No real because / Good*), and the rail disappears.
- L3 is free text, then a three-button quiz.
- L4 is fill-in-the-blank frames.

Learner 1 caught the specific broken promise: the coach says the card *"stays on the wall all night"*, then the composer changes shape four times and the rail vanishes twice. Learner 5 caught the same thing from the rules side — *"No real because"* is an undocumented fourth category, on no card, never priced, never scored in L4, and never seen again.

Three more cohesion breaks, all independently found:

- **The token rules are charged from Level 1 item 1 and explained in Level 4.** The level list header even says Levels 1–3 are *not* "for tokens", then Level 1 charges immediately. And **the price is inconsistent**: one token crosses for Judging in L1–L3 (`engine.ts` uses flat transfers), while L4's corner says Judging costs two (`foulCost()` in `showdown.ts` is Showdown-only). Learner 5 logged that as a straight contradiction.
- **The bosses are asymmetric and get thinner.** Victor: three exchanges, escalation, concession. Olivia: two lines, both fouls, no clean line to let through, no concession — so the player cannot practise the thing L1 said was the job. Noemi: never faced.
- **The header says "Three levels" over four rows,** and the Showdown row is a hand-written `<li>` outside the map carrying the literal string `'4'` (`App.tsx`), with `fightNumber={4}` hardcoded. That is why it doesn't behave like the others.

**Recommendation:** one composer grammar for the whole gym, one price table stated once and applied in the same words every time a token moves, and every boss built to the same shape — at least one clean line, at least one call, one concession.

### Q3 — Is the order of learning correct?

**Judging first is right — unanimous, five out of five.** It is the foul you feel in your body when it lands on you, and its tell is nearly mechanical. Everyone agreed. After that they diverge usefully:

- **Learner 3:** don't reorder anything, fix Level 3. The problem is depth, not sequence. Also move the half-token miss rule to Level 1 so silence has a price from the start.
- **Learner 1:** insert a missing rung between 3 and 4 — a *"which card?"* drill, all three cards live at once — and move the Level 4 frames earlier, because L4 introduces a new interaction model in the same breath as it starts scoring you.
- **Learner 2:** teach *"say it back"* first — a thing you can say, not a button you press — then the fouls in the current order. Also split "own it" from "back it": they are two rules wearing one card.
- **Learner 4:** teach the **round** before any card. A Level 0: one clean exchange, no whistle, nothing to detect. Then Judging → **Fake Listening** → Opinions as Facts, on the grounds that the summary is what you need to play at all, and OaF's rule is the shakiest of the three.
- **Learner 5 (ESL):** the current order is right in principle, but *"the round shape is never run before Level 4 asks me to do it under pressure."*

**The convergence is the finding, not the disagreement.** Three of five independently asked for the same missing thing: **the round is never taught.** The player is never walked through speak → summarize → *"did I miss anything?"* → the summarized person answers, before Level 4 requires it under scoring. Level 3 shows a diff of three bullet points; Level 4 assumes you know the dance.

There's a second convergence: **the deep-canvassing move — recalling a personal experience that produced the same emotion — is never drilled.** The coach models it twice and never asks it of the player. Learner 4 noted it is absent from all four built levels *and* from the planned Level 7: *"six levels of policing, then one of humility, unbuilt. That is backwards."* Given soul.md's lineage, that's the sharpest thing anyone said this session.

**Recommendation:** add a Level 0 (the round, clean, unscored) and a "which card?" rung before the full showdown. Keep Judging first. Whether Fake Listening moves to second is a real question — it has an argument behind it — but the round-before-cards change is the one I'd make regardless.

### Q4 — Referee, player, or both?

**All five said both. All five, independently, said two adjacent referee levels between 4 and 7 is the wrong shape.** This cuts against your plan, so I'm laying out their reasoning rather than a verdict.

The case for the referee seat is strong and the docs already make it — rules.md §7: *"The Referee's seat is why this game has an obvious place for software: it is a job description written before anyone went looking for one."* The learners added four things the docs don't say:

- **Learner 2's structural insight, which I think is the best single observation of the session: the "Spot it" drills already ARE referee mode.** The gym opens in the referee's chair, doesn't tell you so, and charges you a token per miss — *"which is the one thing a real referee never pays."* If that's true, the referee seat isn't a new mode to build; it's a mode you're already in, mislabelled and mispriced.
- **Learner 4:** the referee seat teaches what no player seat can — seeing the fouled person, watching both directions at once, and the routing move (*"did that land on you?"*), which a player cannot practise on themselves. L4 already smuggles a referee moment in (*"She goes first. Watch the shape"*).
- **Learner 5 (ESL):** recognition is far cheaper than production for a second-language reader, so refereeing would have taught him two of the three fouls faster. **But he also found the blocker:** if only the summarized person can rule on Fake Listening, what is a referee judging when AI B summarizes AI A? Either the referee levels teach two cards and hand the third to the summarized AI, or the ruling isn't what soul.md says. A literal player will ask this on the first screen of Level 5.
- **Learner 2:** the referee seat is the one she already occupies at dinner, and it's zero-stakes. She'd want it offered from the start.

Now the objection to the placement, which is unanimous:

- **Learner 3:** two adjacent referee levels before the finale is *"a pacing dead zone"* — a two-level cooldown before the climax, in a ladder that already dips at 3. *"Punch-Out doesn't put two exhibition matches between Bald Bull and Tyson."* One referee level, or two that are never adjacent.
- **Learner 1:** *"refereeing is a demotion and it sits after the climax like an epilogue."* Move one referee level *before* 4 — no typing required, natural step up from L3, and the right place to drill card discrimination. Make the second one personal: the AIs foul the way *you* fouled in Level 4.
- **Learner 4:** one before 4, one after, with Sofia-grade subtlety on both sides.
- **Learner 2:** one referee level at 5; spend 6 on a player level where **you are the summarized person** and you answer *"did I miss anything?"* — the seat the gym never puts you in.

And one warning worth quoting, from Learner 1: *"The one thing a referee level must not do is score me for pressing the right card. If 5 and 6 reward me for ruling, they train the wrong referee."* The referee's job is routing the call to the person who was fouled, not being right.

**What I'd put to you:** the referee seat is well-supported; the two-adjacent placement is the contested part. The shapes that keep coming up are (a) one referee level before the Sofia showdown and one after, or (b) one referee level at 5 and a "you get summarized" player level at 6. Your call — I'm not making it.

### Q5 — What should the gym/level UI be?

**Today the level list is a table of contents. It should be a progress screen.** Nobody could tell, from any screen: how long a level takes (told "two minutes" twice, both false), how many levels remain (header says three, rows say four), what they got wrong (no end-of-level review; the Level 4 loss message says *"drill the card she kept getting past you"* and does not name the card), what a token is or what zero does in L1–3, how many attempts they have, or whether a cleared level can be replayed. Nothing marks a level cleared. Nothing shows a result.

Concretely, from the five:

- **The list rows need state:** cleared mark, result, duration, the boss's mugshot and epithet, a replay affordance, and a tap to re-read the card. The titles already work as a cheat sheet — let the row carry the definition too.
- **A cost table visible whenever the purses are.** One line, four items, stated in the same words every time. Learner 5 made this his single recommended change: *"State the rule once in words and then apply the same words every time a token moves."* That one fix kills the "word You" trap, the one-token-vs-two mystery, and the "for tokens" lie on the level list simultaneously.
- **An end-of-level review:** each line, my call, the ruling. This does not exist anywhere and every learner wanted it.
- **The "on the table" strip belongs in the thread too.** Its absence in L4 is why players can't tell when a line has gone past and the half-token miss lands.
- **The scrolling thread is a wall for slow and second-language readers.** Worth knowing: the scroll-fade is documented as load-bearing for Fake Listening, but **it is never actually in play**, because L3's boss prints the three reasons on the panel above the question. The one place the mechanic was supposed to matter is the one place it's defeated.
- **The walk-out** needs a skip, a faster tick (620ms was called too slow), and something that differs between levels. Sound is off by default, so the fanfare is missed on first play — the one moment the arcade frame pays off is the one nobody hears.
- **Nothing bridges the gym to a real conversation.** The L1 chips and the L4 frames vanish with their levels. No debrief, no take-home, no card you keep. For a product whose whole point is what happens at the dinner table, that's the biggest omission in the UX.

---

## 4. The two findings that cut against your plan

I'm surfacing these rather than resolving them, per the docs' own rule about not silently choosing a reading.

### 4.1 — Seven levels vs six

You said seven. The ruled docs say six, in two places, and one of them says it outright:

- roadmap §6 and rules.md §9.2 both rule **six**, marked `[ruled, Nathan; Steve's confirmation outstanding]`. rules.md: *"the numbering is settled there, so build against six."*
- A superseded 2026-08-15 ruling said five. A superseded build table used eight.
- A false friend to watch for: roadmap §4 records that "seven levels" was already rejected — but that was seven *teaching* levels, one per beat. Different scheme, not this one.

**Your seven maps onto the ruled six almost exactly.** Ruled L5 (Final Showdown) and L6 (referee seat) become your L7 and L5–L6. You are moving the referee seat *before* the Final Showdown and giving it two levels instead of one. That's a re-order plus a split, not a new ladder — which is worth knowing, because it means the ruling doesn't have to be overturned so much as amended.

Two mechanical collisions if you renumber:

- roadmap §6 says *"Nothing renumbers: the Full Showdown stays at 4 and the hardcoded `'4'` stands."* Confirmed in code — `App.tsx` has the Showdown as a hand-written `<li>` with the literal `'4'`, and passes `fightNumber={4}`.
- Ruling B3 (2026-08-23, save by slug) protects saves from renumbering. It does not protect those two strings.

### 4.2 — "Live play at the bottom of the list"

Visually that reads as *after Level 7*. roadmap §7 rules that live play unlocks after the **first four** gym levels, and that Levels 5 and 6 are explicitly **not** part of the gate. So the row can sit at the bottom, but if it unlocks only after 7 that's a policy change, not a layout choice.

### 4.3 — "Play a round" is closer than it looks; the blocker is architecture, not policy

rules.md §2 and §9.10 already rule the mechanism: the player types a one-sentence disagreement, and *"she argues the opposite of whatever the player argued."* Nothing needs deciding. What blocks it is that a hand-authored boss cannot argue a topic invented thirty seconds ago, and a live model will not dependably commit exactly one specified foul in character.

Learner 3 hit the symptom without knowing the cause: you type a topic, and Sofia's opening line is authored and fixed, so it doesn't mention your topic. His words: *"the game didn't hear me."* Learner 5, who typed "nuclear power", couldn't even tell which side she was on.

---

## 5. Ranked problems

**P0 — Level 3's boss is not a boss.** Consensus, five of five. Learner 3: *"a cutscene with a QTE."* Learner 1: *"reading comprehension with the passage still on screen. Twenty seconds, level over. This is where I said 'that's it?' out loud."* Learner 2: *"the one foul I actually needed was the one I got to skip."* The Fake Listening card dealt in the corner is never pressed in the level that teaches it. Four of five made rebuilding it their single recommended change, and their versions converge: **you make the argument, you get summarized, the summary drops the hard part, and you say so from memory.**

**P0 — *"Did I miss anything?"* is never answered.** The player asks it into a void in L3 and twice in L4. When Sofia summarizes the player, there is no button to answer her check. This is soul.md §6 — the ruling that never moves — going unenacted in the shipped product. It is also, per Learner 4, one button.

**P1 — The half-token miss rule contradicts soul.md §6.** `MISS_COST = 0.5` charges the player for failing to notice a foul the *software* decided had occurred. soul.md says software never decides a foul happened; it flags a candidate and routes the call to the possibly-wronged human. Learner 4 named this directly. Learner 2 named it as the thing that would stop her coming back. Learner 5 hit it in the exact worst case: he was the summarized person, the game ruled Fake Listening on his behalf without asking him, and charged him.

**P1 — The Level 2 beat-2 diner item.** All four of the learners who reached it got it wrong and objected. Learner 4: that sentence *"is the deep-canvassing move, the one the brief says the whole game rests on — and the gym whistles it for lacking the words 'in my head.' This is the exact moment the gym rewards the wrong behaviour."* Learner 2: *"the moment I felt policed rather than taught… I would be the person at the table policing form over substance. That's a worse outcome than going quiet."* This single item is doing real damage.

**P1 — "You" is learned as the tell for Judging, and it's under-inclusive.** The L1 drill contrasts one "you" line against two no-"you" lines; no drill ever shows a clean "you" line. The boss's third line breaks the tell — *"People who want these loans wiped are all the same"*, no "you" in it — but only corrects the error *after* it costs you a token. Learner 5: *"This was the moment I stopped trusting the level titles."*

**P1 — Round 3's Fake Listening line is mis-taught.** *"Right, right. I hear you, you're frustrated… Anyway."* Three learners called Judging or hesitated. It's a **dismissal**, not the summary-short-by-one-bullet shape that L3 taught, and by L1's own definition of Victor's move (*"He tells you what you're thinking"*) Judging is defensible. Learner 1: *"I still think my answer is defensible."* He's right.

**P2 — The gym is detection-training, not production-training.** Learner 4 counted roughly **22 detection decisions against 11 production acts** — and of those 11, four are edits of pre-typed lines and six are fill-in-the-blank frames. From-scratch speech: 1. From-scratch summaries: 0. His diagnosis: *"A referee-training course with a small production annex. The tell is the rail: pressing a card IS the primary verb."* Note how neatly this dovetails with Learner 2's independent finding that the drills already are referee mode.

**P2 — Tokens are decorative for L1–3, then suddenly lethal at L4.** Learner 3's test: *"Did the numbers ever change a decision I made? Once."* Symmetric penalties for calling wrongly and for not calling at all make a vigilance test, which trains a litigator posture — the opposite of the intent.

**P2 — No summary coverage check exists.** SUMMARY_FRAME enforces *structure* (a "because", a "Did I miss anything?") and nothing checks *coverage*. Learners 2 and 4 both found it from the player side: *"I could write 'What I heard was stuff, because reasons' and it goes through."*

**P3 — Vocabulary sprawl.** foul / habit / move / attack / card are five names for one thing in the first three screens. Forgiveness becomes "write-off" and then "wiped" inside one boss fight. Learner 5's ledger runs to 61 numbered items; it's the most actionable single artifact the five produced and I've kept it intact.

---

## 6. Documentation and code conflicts found in the reading pass

Flagging, not resolving.

- **Zero tokens.** rules.md §1 and §8 rule instant loss, *"Kept unsoftened on purpose"* `[ruled]`, and `showdown.ts:250` implements it. soul.md §11 says *"a player who reaches zero is not out."* soul.md governs. This looks like an unpropagated reversal.
- **Retry cap.** *"No cap on retries"* `[ruled, Nathan]` vs `while (attempt <= 3)` at `engine.ts:486` and `showdown.ts:433`. rules.md §9.5 already labels this wrong and unfixed.
- **Price asymmetry isn't taught where the cards are taught.** `foulCost()` (Judging 2, others 1) is Showdown-only; `engine.ts` uses flat one-token transfers in L1–L3.
- **`ui-components.md` §4.6 is stale on BossIntro** — says showdown-only; `App.tsx` renders it per-level on `gym.bossPending`.
- **README says five composer states; `types.ts` has seven.**
- **Practice surface:** roadmap §9 recommends drills-in-thread and the code does the opposite. This is **not drift** — `Drill.tsx`'s header records Steve overruling that recommendation on 2026-08-25, deliberately. The roadmap should be updated to stop complaining about a decision that was made.
- **Boss names must not be quoted player-facing** (rules.md §9.2). Stonewall Sung-min appears nowhere in `src/`.
- **No timers exist anywhere in the shipped code**, despite the print deck's 30s/45s badges and three in-game references to a clock.

---

## 7. If I were choosing what to build first

Ordered by teaching value per unit of work, not by level number.

1. **Answer "Did I miss anything?"** One button, in L3's boss and in L4. It is the thesis of the game and it is currently absent. Everything else on this list is easier to justify once this exists.
2. **Rebuild L3's boss** so you argue, you get summarized, and you name the omission from memory. This is the level that makes the scroll-fade load-bearing for the first time.
3. **State the price table once, early, in fixed words**, and use those words every time a token moves. Learner 5's change. Cheapest large win in the document.
4. **Fix the L2 diner item.** It currently teaches the opposite of the game's thesis.
5. **Give Olivia a clean line and a concession**, and give every boss the same shape.
6. **Add the round as a Level 0** — one clean exchange, unscored — before any card is taught.
7. **Then** decide the referee levels, with §4's placement question settled first.

---

## Appendix — each learner's single recommended change, verbatim in substance

| # | Persona | Their one change |
|---|---|---|
| 1 | Competitive debater | Rebuild the L3 boss so you actually make the argument and name the missing point from memory. |
| 2 | Conflict-averse | Rebuild the L3 boss so **you** get summarized and answer *"did I miss anything?"* as the summarized person. |
| 3 | Teen gamer | Make L3's boss real: Noemi summarizes the take you actually typed, drops the hard part, you whistle the omission. |
| 4 | Facilitator | Every time anyone says *"Did I miss anything?"*, someone answers — and when the player is summarized, the player's answer moves the token. |
| 5 | Literal ESL newcomer | State each foul and each price once, in fixed words, and use those exact words every time a token moves. (Runner-up: make Sofia answer *"Did I miss anything?"*) |

Four of five point at the same level. Five of five point at the same missing button.

---

*No code, content, or documentation was changed. The player's-eye transcript the learners played, the briefing they were given, and their five full reports are in the session scratchpad and can be handed over on request.*
