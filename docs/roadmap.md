---
slot: roadmap.md
game: heart
purpose: Build order and scope for Humility Showdown, separating what is already in the repo from what is next, deferred, or provisional.
written: 2026-08-28 by biz
status: draft, unreviewed by Steve
sources:
  - point-taken-heart/docs/design/online-edition-roadmap.md
  - point-taken-heart/docs/design/2026-08-23_mvp-build-plan.md
  - point-taken-heart/docs/design/2026-08-26_roadmap-to-live-play.md
  - point-taken-heart/docs/design/2026-08-09_heart-level-build-table.md
  - point-taken-heart/docs/design/2026-08-15_ordinal-teaching-sequence.md
  - point-taken-heart/docs/design/2026-08-23_infrastructure-plan.md
  - point-taken-heart/game/src/ (the repo you are holding)
---

# Humility Showdown: roadmap

## 0. Read this first

**This is Heart, not Brain.** Point Taken ships two separate games. Brain is the web debate game about logic and
argument mapping. Heart is Humility Showdown, about emotional hygiene and relational safety, shipping as a printed
card deck and as this web app. Different games sharing a brand, an account, and a launcher, not two media of one
game. Brain material found in this repo is misfiled.

**Provenance markers.** `[ruled]` means Steve, Nathan, or a registry decision established it; anything that is not
Steve's is attributed inline, and `[ruled, Nathan; Steve's confirmation outstanding]` marks a ruling that is
answered and in force but still wants his sign-off. `[unratified]` means it lives in the code and nobody ruled it,
cited to a file. `[vibecoded]` means invented for this document; there are none. `GAP:` means refused to invent,
with the exact question written out; a `GAP:` prefixed with a name is that person's to answer.

**No dates here, and do not add any.** Order and dependency are stated, calendar commitments are not, at any
confidence. A date attached to a source is that source's date, never a ship date. The sources live above the repo
root and are never pushed, so their substance is carried in here.

## 1. The game, in one screen

Three players. Two disagree; the third is moderator and referee for the whole game `[ruled]`. Three foul cards on
the table: **Judging**, **Opinions as Facts**, **Fake Listening** `[ruled]`. Each disputant holds seven 🙏 tokens,
fourteen in play `[ruled]`. A foul **moves** a token to the other side, never destroys one `[ruled]`. Judging costs
two, the others one each `[ruled]`. Zero tokens is an instant loss exactly as printed, and the proposed softening
was withdrawn `[ruled]`. Most tokens wins `[ruled]`.

The shape of play, identical for the printed deck and for two live humans `[ruled]`:

1. **Three rounds of listen-and-summarize.** Inside each round the speakers flip roles: one takes a turn, the other
   plays it back, then they swap. The summary is mandatory and gates your rebuttal.
2. **One Final Showdown round**, flipping once. **Not** a fourth iteration of the listen-summarize loop: a different
   kind of round, with its own three steps (§6).
3. Roles swap between games, so the moderator seat rotates `[ruled]`.

Print and live-human timers: **30 seconds to speak, 45 seconds to summarize** `[ruled]`. The gym (§2) deliberately
has no clock at all, and that is settled, not an omission `[ruled]`.

**The rule that vetoes mechanics.** The software never decides a foul happened. It nominates candidates cheaply and
routes the call to the party who might have been wronged. Flag, then ask `[ruled]`. The corollary is load-bearing:
**do not improve the detector's precision.** False positives are expected, tolerated, and collected as training
data, because a high-precision truth-adjudicating classifier replaces the lesson with an authority `[ruled]`. That
rules out an entire class of work you will otherwise reach for first.

## 2. Two editions, two statuses

**Print edition.** A physical deck exists and is in internal playtest, footer "Internal playtest. Do not post or
distribute." The app's first screen is rebuilt against page 1 of it `[unratified]` (`src/App.tsx`, `Agreement`).
Hard constraint: **the deck contains zero level, phase, boss, tier, stage, or chapter vocabulary** `[ruled]`. It is
a rules sheet and a card set, not a ladder, and no level count may be sourced from it. Three page-1 elements were
left on paper deliberately: the vertical SET UP / PLAY tabs, the teal flow diagram (the app runs the procedure), and
the referee panel. Two of the agreement's four clauses were cut and must not be reintroduced `[ruled]`.

**Online edition.** Two modes, and the split is a direct ruling `[ruled]`:

- **Gym.** Entirely solo, one human against AI content: coached drills and scripted bosses alike. All shipped code
  lives here.
- **Live play.** Two real humans in a chat room refereed by an AI coach. **None of it is built.** No transport, no
  matchmaking, no session state.

Clearing gym is the onboarding gate into live play, not a separate finish line `[ruled]`. Gym includes bosses, and a
boss fight simulates live play without being it. An earlier version of the design conflated the two and had to be
corrected; do not re-conflate them.

## 3. What is built, verified against `src/`

26 files, 5,627 lines `[unratified]`. **Assume more is built than any design doc implies:** several docs describe as
unbuilt things you can run today.

Stack is chosen, do not re-litigate `[ruled]`: Vite 7, React 19.2, TypeScript 5.7 strict, one serverless function
`api/coach.ts` pinning `claude-haiku-4-5`, dev port 5273. No Next.js, no Supabase, no Express, no sqlite. **No React
StrictMode** `[unratified]` (`src/main.tsx`), and that is not an oversight: the beat runner is timed side effects,
so a double invoke emits every line twice.

- `types.ts` (182): `FoulType`, `Lane`, `Message`, seven `ComposerState` variants, `ItemRecord` with keystroke-level
  `Revision` history, an eight-member `Step` union, `Beat`, `PrefightStep`, `LevelDef`.
- `engine.ts` (530) `useGym`, the drill runner walking authored steps. `showdown.ts` (549) `useShowdown`, one async
  function that awaits the player, Level 4's runner.
- `detectors.ts` (234) phrase rules: Judging and Opinions as Facts are callable with no model call at all, Fake
  Listening needs one call per summary. `coach.ts` (129) client side of the model calls. `storage.ts` (135)
  `localStorage` under `humility-showdown.v1` `[unratified]`, browser only, no account and no server persistence.
- `content/`: `cards.ts` (266), `level1.ts` (218), `level2.ts` (271), `level3.ts` (180), `showdown.ts` (288),
  `index.ts` (14). `ui/` ten components. `App.tsx` (525) screens and room.

**Four screens exist, not the ten one doc inventories** `[unratified]`: `agreement`, `select`, `level`, `showdown`.
`select` is two steps, choose-your-fighter then the ladder, never both at once `[ruled]`.

**The shipped ladder is three gym levels plus one match** `[unratified]` (`content/index.ts`: `LEVELS = [level1,
level2, level3]`). The Showdown is not in that array: it is a separate screen whose ladder number is the literal
string `'4'`, with `fightNumber={4}` passed to its intro.

**Progress saves by level slug, never by index** `[ruled]`. Reordering or inserting a level must not orphan a save.
Key nothing off array position.

**Levels gate strictly.** Level 2 cannot open before Level 1 clears, because each level assumes the card taught
before it, and the Showdown assumes all three `[ruled]`.

**Clearing requires turning up, not being right.** `markCleared` fires on a Showdown loss as well as a win
`[unratified]`. There is no accuracy gate anywhere in the game.

**Both token purses run from Level 1**, seven a side `[unratified]` (`types.ts`, `engine.ts`). Two docs say tokens
are off in the gym. The code wins on what is true today; §11.

## 4. Levels 1 to 3: already written, read them, do not invent them

Each is one habit and one opponent, in three parts every time: a prefight where the coach names the argument and
both sides of it and deals the card, then authored practice with the coach, then one exchange against that level's
boss in a texting room.

**Practice room and boss room are different rooms** `[ruled]`. Practice is a one-at-a-time stepper whose header and
avatars show the coach, not the boss, with `opponent={null}` passed to `Drill` so a training line that names the
boss does not deal his card in a room he is not in `[unratified]`. The chat room is only for actual bosses.

| Level | Slug | Card taught | Boss |
|---|---|---|---|
| 1 | `the-word-you` | Judging | Verdict Victor |
| 2 | `in-my-head-because` | Opinions as Facts | Obvious Olivia |
| 3 | `did-i-miss-anything` | Fake Listening | Nodding Noemi |
| 4 | `full-showdown` | all three, for tokens | Slippery Sofia |

**The cast was americanized** `[ruled]`. Older docs say Verdict Vikram, Obvious Ottoline, Nodding Nils, Slippery
Sofía; those names are dead. The intended cast is white male, Black female, Latina, white female, in that order, and
**nothing in the build carries that beyond the names. There are no portraits.**

**Level 1, "The word You", Judging.** Four items: one foul, its clean twin on the same topic, one trap that sounds
nasty and is clean, and one `edit_prefilled` where the player strips a verdict out of a line drafted for them.
Argument is student loan forgiveness. Its header comment carries a **political balance ledger that self-reports a
failure**: 4:0 against forgiveness in the judging column, 3:1 in the argument column, after Steve dictated a
replacement line and a second boss foul landed on the same side `[unratified]`. Built as dictated and flagged rather
than quietly rebalanced. **Do not silently rebalance it.** Every level file carries this ledger; yours must too.

**Level 2, "In my head, because", Opinions as Facts.** Three beats: "Own it" (4 items), "Own it and back it" (5
items), then the boss. Bundling three teaching beats into one level is a ruling `[ruled]`; the one-level-per-beat
alternative, seven levels, was rejected.

**Level 3, "Did I miss anything?", Fake Listening.** Beat "Say it back", then the boss. First place a model call is
structurally required. The template is exact: perfect is "So what I'm hearing is: it bugs you that [X], because [Y].
Did I get that right?" and the deliberately flawed version drops the why: "So it bugs you that [X]." **The flawed
version must be flawed in that one named way, not merely worse.** A source calls this the hardest model requirement
in the build.

**Levels 1 to 3 are not model-free.** Two docs say they are. The code settles it: a `ModelStep`, a `model` case
calling `restate()`, `edit` steps calling `judgeEdit()` `[unratified]`. When the model is unreachable `judgeEdit`
returns `pass === null` and play moves on rather than blocking. Keep that: it is why the game runs with no API key.

**Level 4, the Full Showdown against Slippery Sofia, is built.** Twelve turns, three rounds, four turns a round, two
each `[unratified]` (`content/showdown.ts`). Round 1 opens on Sofia, clean, so the shape of a turn is on the table
before the player is asked for one; rounds 2 and 3 open on the player `[ruled]`. Her foul schedule is fixed and
identical every match: **the model writes her wording, never her behaviour.** She has no position of her own, she
argues the opposite of whatever the player argued, which makes political balance structural rather than editorial.
Seed topics: student loan forgiveness, return to office mandates, nuclear power, the mild end of real public policy,
not immigration, not abortion.

Three Level 4 constants that look like bugs and are not:

- `MISS_COST = 0.5`, tokens printing as halves `[ruled]`. A player who lets everything stand has to watch the ledger
  move. Halves are exact in binary floating point, so purses never drift and both sides still sum to fourteen.
- `COACH.bankruptHer` is unreachable by design and kept anyway. Sofia's authored fouls total four against a
  seven-token purse, so her floor is three and she cannot be knocked out. **Do not "fix" this by giving her a fourth
  foul** `[ruled]`.
- She fouls twice in a row in round 3, deviating from the governing spec's no-adjacent-fouls rule. **Keep them**
  `[ruled, Nathan]`. Adjacent fouls are allowed on a boss-fight level, because covering all three cards inside six
  turns is the higher priority and the no-adjacent-fouls rule loses to it. Three cards cannot be covered by two
  non-adjacent fouls in six turns, so the rule and the coverage goal cannot both hold here. The shipped schedule in
  `content/showdown.ts` already does this; the ruling ratifies the code rather than changing it, and the coach line
  in front of the round stays.

## 5. Structural facts you will otherwise break

- **Texting thread, not a chat log.** Old messages scroll off and cannot be re-read `[ruled]`. Load-bearing for Fake
  Listening: an infinite-scroll window lets the player summarize by scrolling up, which deletes the mechanic. One
  call is left to you: during the summary phase, does the message being summarized stay readable? Decide that
  deliberately, not by a scroll container's default.
- **A round is one pair of turns, not one turn.** One turn per round silently thirds the match. **A rephrase does
  not create a new turn.** **Tokens move only when a call resolves,** never while a flag is open.
- **Reform the boss, do not deplete the boss.** A foul called correctly retires that habit for the rest of the
  match, so no boss is beaten by attrition `[ruled]`. Both adversarial reviews of the design named this its best
  idea.
- **No modals, no toasts, no score popups, no confetti, anywhere in the gym** `[ruled]`. Feedback is the coach's
  words changing and nothing else.
- **The player should never type more than a sentence or two across an entire level** `[ruled]`, which is why the
  free-text `player_commits` mode is retired. Typed and spoken input are interchangeable.
- **The coach is the moderator. No fourth party, no separate referee character** `[ruled]`. Code or docs implying
  otherwise predate that ruling and are wrong. **This bullet governs live play, and there it stands unqualified**
  `[ruled, Nathan]`. The judge figure of §7 item 12 is solo play only: a player alone needs the machine to fill the
  second and third seats a table would otherwise have people in, one to argue and one to judge. Live play already
  has the people, so it has no judge, and this bullet is not narrowed by anything. Inside the gym the coach holds
  the judge seat itself, which is a seat and not a fourth character. The two rulings do not collide and Steve is
  not needed here.
- **Every stored flag records the prompt version that generated it.** The collected human rulings are the repo's
  most valuable asset and are worth far less if a prompt revision silently changes what the labels mean.
  Ground-truth precedence: wronged human's ruling, then speaker's tag, then spectator's.
- **A hook after an early return is a crash.** `App.tsx` documents it: declaring `drillBehind` below the boss-intro
  early return threw "rendered fewer hooks than expected". Hooks sit at the top of `Room`.
- **Screen skin is fixed** `[ruled]`: light striped ground, teal, orange, gold, Baloo 2 plus Nunito. **Background
  stays light, always. No dark mode.**

## 6. The next build: the Final Showdown's three steps

The only place in the game where humility is scored **positively** rather than penalized. Three steps `[ruled]`:

1. **Super-Summary.** The player makes a novel point *for* the other side, one that side had not made. Whether it
   landed is ruled by the party being summarized.
2. **What I Learned.** The player admits a change of mind. Judging-checked, so it cannot be delivered as a
   backhanded verdict.
3. **Why We Might Still Disagree.** The player frames the other position as a value rather than a flaw. The bonus is
   awarded by the person being described.

Boss: **Stonewall Sung-min**, who commits no fouls at all, forcing the player to score by being generous rather than
by catching anyone `[ruled]`. That name survived the cast pass. Nothing of this exists in `src/`: no content files,
no runner, no screen.

**Who awards the bonuses.** In solo play the party who rules on the Super-Summary and awards the
Why-We-Might-Still-Disagree bonus is the AI boss, which asks the machine to cast an experience-based ruling on
whether it felt fairly described.

**A model in an explicit judge role awards the points and bonuses in solo play** `[ruled, Nathan]`. Inside the gym,
across the first four training levels, **the coach holds the judge seat** `[ruled, Nathan]`. The judge is one of the
three AI figures the player meets, and it presents as its own figure and not as the boss: see §7, item 12.

**The judge exists in solo practice play and nowhere else** `[ruled, Nathan]`. It is there to fill a seat a live
table fills with a person, so it adds no party a real game would not have had. Live play has no judge; the coach
moderates and the wronged human rules, exactly as §5 says. Level 6 is the same principle pointed the other way:
the human takes the referee seat and two AI agents play in front of them.

How this sits with the soul doc, which is the only document that can veto a mechanic. The soul doc forbids software
deciding that a foul happened and applying a penalty **without the wronged party's assent**. Two independent things
keep the judge clear of it. The Final Showdown's three steps score generosity positively, so nobody is penalized
over an objection they were never asked for. And the judge only ever sits at a solo table, where the party being
summarized is the machine, so there is no human assent to route around; the moment a real person could be the
wronged party there is no judge in the room. **Do not extend this ruling to fouls, to penalties, or to any seat
where a human is the party who was possibly wronged.** That constraint is what holds the two documents apart, and
it is a boundary rather than a preference.

**The ladder is six levels** `[ruled, Nathan; Steve's confirmation outstanding]`. Level 5 is the Final Showdown and
follows the built Level 4 Full Showdown. **Level 5 teaches how to be generous.** Level 6 follows Level 5, and in it
the player is the referee for two AI agents playing each other; it is not fully designed. Nothing renumbers: the
Full Showdown stays at 4 and the hardcoded `'4'` stands. A later brief describing the Final Showdown's steps as
"levels 4 to 6ish" now reads as an early sighting of this six-level ladder rather than an off-by-one.

GAP: (Steve) confirm the six-level ladder. The ruling above is in force and is what to build against; only his
sign-off is outstanding. Note that `rules.md` still carries a five-level ladder and a "the numbering itself is
contested, do not build against it" warning, and its filed ruling request is answered by the above. That document
has not been swept yet and will disagree with this one until it is.

## 7. Order of work

Sequence and dependency only. No dates, at any confidence.

**Before the Final Showdown can be built:**

1. Nothing here waits on §6 any longer. In solo play the judge seat goes to a model in an explicit judge role, with
   the coach holding it inside the gym, and the ladder is six levels with the Final Showdown at 5. Build the
   ladder UI to six.
2. Author the three steps' content, matching the shape of `content/level3.ts` including the political balance ledger
   in the header.
3. Build the positive-scoring path. Everything in `showdown.ts` moves tokens as penalties; nothing awards a bonus.
   New arithmetic, not a new caller.
4. Add the level to `content/index.ts` and to the ladder, by slug.

**Independent of the Final Showdown, worth doing early:**

5. **Tests. There are none.** The turn phases and the token arithmetic first: both are pure functions of turn
   history and both silently produce wrong numbers instead of crashing.
6. Formalize the turn phases explicitly rather than leaving them implied by call ordering. The phases the design
   names: speaking, refereeing, awaiting ruling, awaiting contest, awaiting repair, awaiting summary, checking
   coverage, resolving. Leave a seat for contest even if it does not ship.
7. Decide whether a summary can itself carry a Judging foul and be refereed. The code answers the narrow case: a
   Judging or Opinions-as-Facts foul inside a summarizing turn is ruled and paid for, and the summary still has to
   be done `[unratified]`. The general case is written down nowhere, so an agent will implement neither behaviour.
8. Reject garbage at the summary gate before spending a model call: minimum length plus a content-word overlap
   floor. The code has `tooThin` at under 10 characters or fewer than 3 words `[unratified]`. Engineering constants
   to default and expose, not rulings to wait on.
9. Grow the authored opponent script library. Live-model opponents are known unreliable: a model will not dependably
   commit exactly one specified foul while staying in character, which is why the authored schedule is the default.
   Keep it the default until a constrained prompt beats it.

**Live play, in order, none built and none spec'd beyond the sequence itself** `[ruled]`:

10. Enforce the graduation bar that unlocks live play. The bar itself is ruled below; what is missing is somewhere
    to enforce it other than `localStorage`.
11. Session infrastructure: pairing, transport, session state.
12. **The AI figures, and how many the player meets. Three** `[ruled, Nathan]`: the **coach**, who teaches the
    cards; the **bosses**, who play against the player; and the **judge**, who referees and awards. All three can
    run on the same code and hold the same knowledge of the game, but **they must present differently to the
    player**. One engine, three faces, never one voice visibly wearing three hats. **The judge is solo play only**
    (§6): it fills a seat a live table fills with a person, and inside the gym's four training levels the coach
    holds that seat rather than a third face appearing at all. Live play meets the coach and the other human and
    nothing else, which is why §5's no-separate-referee-character ruling is untouched. The coach's own role still
    flips: in the gym it teaches and, in bosses, argues; in live play it stops arguing entirely and only nominates.
    How much gym coach code survives is open.
13. Spectator mode, after the two-human loop works, since there is nothing to spectate before then. The classroom is
    the strongest case.
14. Voice, audio, video. The product target, not a nice-to-have, and last.

Level gating is `localStorage`-trust only today. Fine for solo play, a real hole the moment human-vs-human matches
exist. Fix it before step 11, not during.

**Live play unlocks when the player has cleared the first four gym levels** `[ruled, Nathan]`: Levels 1 to 3 plus
the Full Showdown. Levels 5 and 6 are not part of the gate. What "clear" means for Levels 1 to 3 is ruled in §9.

**Six levels in total**, ruled in §6 and not restated here. What that means for the work in this section: four of
the six ship or are gated for solo play, Level 6 is a slot on the ladder rather than buildable work until it is
designed, and the proposed further level in the newest brief is that Level 6 rather than a seventh. The printed deck
cannot corroborate any of this, having no level vocabulary at all.

**A clock runs in live play, and never in the gym** `[ruled, Nathan]`. The gym having no clock is confirmed rather
than merely settled-for-now, and live play definitely uses one.

GAP: the clock has not been designed for the digital edition at all. Whether the printed 30 second speak / 45 second
summarize figures carry across to typed play unchanged, what starts each clock, and what happens when one expires
are all unanswered. The ruling above says a clock exists in live play. It does not say what the clock is.

**Tokens transfer. They do not spend** `[ruled, Nathan]`. The code already agrees: `engine.ts`'s `transfer` moves a
clamped amount from one purse into the other and destroys none, and the two sides still sum to fourteen after any
number of moves. The source claiming the codebase spends them is wrong about this codebase, and there is no fix to
make. Any new arithmetic moves tokens between purses; none of it removes them from the table.

**No cap on retries** `[ruled, Nathan]`. The player retries until the summary passes the coverage check, and the
game does not move on before it does. **Deductions do not stack:** the miss is paid for once, on the first failure,
and further attempts at the same item cost nothing.

The non-stacking half already holds in the code: a wrong first try hands one token over once per item, however many
attempts it then takes to get it right (`engine.ts`). **The no-cap half does not hold.** `showdown.ts` runs its redo
loop as `while (attempt <= 3)` and breaks out at `attempt === 3`, and the gym's edit steps keep the same
three-attempt ceiling, with a header comment in `engine.ts` calling it "the same ceiling live play uses"
`[unratified]`. Under this ruling that ceiling and that comment are both wrong. Neither has been changed: this
document records the ruling, not a completed edit.

A second mismatch, smaller, worth not tripping over. The three-attempt loop in `showdown.ts` is not a coverage
check; it re-runs a summarizing turn that carried a Judging or Opinions-as-Facts foul. **A summary coverage check of
the kind this ruling governs does not exist in the shipped code yet**, so the ruling is a constraint on the thing
that gets built, not only a correction to the thing that is there.

## 8. Deferred, and cut

**Deferred, designed, not being built:**

- **The Family Pack**, where real standing disagreements enter, plus its two repair tools, a repair sequence and an
  emotion check `[ruled]`. Moving the emotion check up to Level 1 was rejected: teaching a break to a player who has
  never been flooded teaches nothing.
- **Post-match transcript review.** Live refereeing and post-match review are both in, not one or the other
  `[ruled]`: live trains reflex, post-game trains judgment. Both adversarial reviews wanted the live whistle cut
  wholesale and both were overruled.
- **The contest flow**, where an accused player plays a rule card to summon an AI second opinion. It may not ship.
  **After the second opinion, the wronged party makes the final call** `[ruled, Nathan; Steve's confirmation
  outstanding]`, so that the process ends on the voice of the person who felt fouled. This resolves the governing
  paragraph's internal contradiction in favour of "the wronged player casts the deciding vote" and against the
  literal reading that named the accused, and it is the reading the soul doc already requires: the only correct
  answer to "did I foul?" is whether the other person felt fouled.
- **The post-round listener review**, the two questions put to the listener after each round about whether the
  speaker was given a verdict and whether they gave a reason. **Not in the current build** `[ruled, Nathan]`, and it
  may be picked up later. Distinct from the post-match transcript review above: this one runs inside the match, at
  the round boundary. Deferring it does not close the Opinions-as-Facts tension it was meant to instrument, which
  `soul.md` section 12 holds open, and player consent for using the data is deferred with it rather than settled.
- **Audio retention policy.** Standing proposal: transcribe in stream, never persist audio, hold the transcript for
  the match only, discard unless the player opts to keep, disclose before the mic opens. Not decided. Blocks the
  moment Family Pack work starts.
- **Bring-your-own-monitor**, deprioritized: without a free-monitor hook it is a chat room with no unique value.

**Cut outright, not deferred, not folded elsewhere** `[ruled]`:

- **The referee-school level.** The old ladder opened with a "take the whistle" level. It is gone, which is the only
  reason three teaching levels ship rather than four.
- **The Simon Says buzzer drill, the coverage drill, and the listen-or-read preference set.** The buzzer drill is
  fully built in an older prototype and implements a deleted beat. It is a plausible spectator on-ramp, so move it
  aside rather than deleting it in the same change, but that on-ramp needs its own design pass and does not survive
  by default.
- **An adversarial challenge-and-review mechanic.** A challenge you can win implies an objective rule to win it on,
  the opposite of what the game teaches.

**An older prototype may sit in `app/`**: roughly 3,500 lines, zero tests. **Read it, do not extend it** `[ruled]`.

GAP: (Steve) Does `src/voiceSeam.ts` exist anywhere? Confirmed absent from `src/` in this repo, and not in Nathan's
copy either. Two sources say a voice seam already exists in the gym build and should not be built behind further, so
either it was never migrated from the older prototype or those sources are stale. Steve holds the file if anyone
does; until it turns up, treat the seam as unbuilt.

## 9. Provisional: written down but not settled

Treat these as swappable and do not let the code assume them.

- **The win condition.** Most tokens wins is on the test list, not settled. Standing alternatives: a communal points
  pool, and a blind simultaneous "how heard did you feel" rating revealed together. **Make the win condition
  swappable when you structure the code.** Separate rather than communal purses is likewise for now.
- **Clear conditions for Levels 1 to 3. No longer provisional; ruled, and listed here only until this section is
  re-sorted.** **A level clears when the player has been through every one of its
  authored practice items, of both kinds: the ones that ask them to play the card, and the ones that ask them to
  correct a mistake** `[ruled, Nathan]`. The build table's old conditions assumed a full match with tokens live,
  which these levels are not, and they are superseded. This is close to what the gym already does, and closer than
  "clears regardless of accuracy" makes it sound: nothing advances until the item is actually done, and a wrong
  call, a wrong sort, an unedited prefill, or a one-character answer loops back to the same step `[unratified]`
  (`engine.ts`). What clearing does not require is a score, and under this ruling it still does not. **The one hole
  is the edit steps' three-attempt ceiling**, which lets a player who fails three times move on having never
  corrected the mistake. That ceiling is already contradicted by the no-cap ruling in §7, and closing it there
  closes this too.
- **Whether the moderator is a participant in the group thread or an out-of-band UI layer.** The recommendation on
  record is participant, and taking it lowers the stakes of several other items.
- **Whether the teaching drills run in the thread with the coach as a participant or on a separate exercise
  surface.** The recommendation on record is in the thread. All front-end sizing depends on it, and the code splits
  them, stepper for practice and thread for bosses, the opposite of the recommendation.
- **The opener.** Scripted solo play has to open on seed topics its scripts can argue: a hand-authored boss cannot
  argue a disagreement the player invented thirty seconds ago. Free text is the front door for live-model and human
  play. A standing proposal would let the opener name a *real* disagreement the player is rehearsing for, close the
  review with "next time this comes up, what is the one sentence you will try", and promote a one-week-later "did
  you use it out there" self-report to the primary metric. Product direction, not adopted.
- **An orphan rules doc** carries seven implementation-ready rule refinements under a foul taxonomy that does not
  map onto the current three cards. Cited by nothing. Needs a ruling: incorporate, supersede, or out of scope.

## 10. What this trains, stated honestly

Which mechanic to protect when something has to be cut. Faithfully built, the game trains three things: recognizing
foul patterns in someone else's speech, producing a clean rephrase under no emotional load against a cartoon, and
**the summary habit, a required move that gates your turn.** The third is the strongest transfer bet the design owns
and the one grounded in the deep-canvassing literature the game descends from. **Protect it.** It trains nothing
under emotional load, and the design knows this: provocation may not bite from a cartoon persona (locked finding),
the Family Pack is designed and unbuilt, the two repair tools sit in an unbuilt beat. The second adversarial review
put it bluntly, that a faithful build of what exists is closer to a vocabulary course with one embodied habit than a
training ground. The gap is deliberate rather than unnoticed.

## 11. Conflicts between the sources, so you do not resolve them silently

Precedence, stated in the sources themselves: the soul doc governs everything and is the only doc that can veto a
mechanic; then the teaching-sequence doc; then the level build table; then the online-edition roadmap. **Above all
of them, on what is true today, sits the code.**

1. **Level numbering.** The build table uses a superseded eight-level scheme with the Full Showdown at 5 and the
   Final Showdown at 6. Build-table level N is current level N minus 1, for N from 2 to
   6. The clearest casualty is tokens, which that table says go live "from level 5" and which therefore go live at
      current Level 4. The current ladder is **six levels** (§6), which does not change the offset above: the Full
      Showdown is still 4 and the Final Showdown still 5. `rules.md` has not been swept and still says five.
2. **Boss names.** Vikram, Ottoline, Nils, Sofía in three docs; Victor, Olivia, Noemi, Sofia in the code. The code
   is right.
3. **Tokens in the gym.** One doc says tokens are off in Levels 1 to 3, and another says no score, no token count,
   no timer. The code runs both purses from Level 1 and passes them to the header on every gym level.
4. **Half tokens.** Fractional tokens exist only in the code, attributed to a ruling. No doc mentions them and the
   printed deck is whole tokens.
5. **Retries and gating.** One doc says no retry, no red flash, no blocked path, the player still clears. The code
   gates every answering step and loops back on a wrong or empty answer, attributed to a later ruling. Direct
   reversal. Gating wins, and §7 now goes further: **retries are uncapped**, so the code's three-attempt ceilings
   are wrong and not yet fixed.
6. **Model calls in Levels 1 to 3.** One doc says model-free and calls that the strongest argument for the teaching
   order. The code makes model calls.
7. **Screen count.** Ten in one doc, six in another, four in the code.
8. **The voice seam.** Two docs say it exists. It does not.
9. **Clear conditions for Levels 1 to 3.** Formerly an open question answered de facto by the code. Now ruled in
   §9: through every authored practice item of both kinds.
10. **The gym clock.** Docs settle no clock in the gym; print and live-human play carry 30 and 45 second timers.
    Compatible, but only if you keep the editions separate.
11. **The newest doc's own placeholder** describes gym as three levels each with a miniboss, which may reframe the
    Full Showdown as Level 3's miniboss rather than a capstone, and proposes a further level where the player
    moderates two AI players. The miniboss reframing is still unintegrated. The further level is no longer
    speculative: it is **Level 6** (§6), it follows Level 5, and it is not fully designed.

Where a newer source contradicts an older one the newer one probably wins, but **say so rather than silently
choosing.** Every item above is a place where an implementer who quietly picked one reading would have shipped
something plausible and wrong.
