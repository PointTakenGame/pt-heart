---
tid: HEART-T260831-17
type: spec
status: draft
thread: web-app
authored: 2026-08-31
governs: game/src/room/
---

# Live play: the room

Drafted overnight 2026-08-31 from Steve's brief, the roadmap, and the shipped
runners. Nothing here is built yet. Gaps are marked, not guessed.

Steve's brief, verbatim, because the rest of this doc is an attempt to be
faithful to it:

> there is a chat room and you play against someone else. We pick a random emoji
> or one random emoji from a set of ten that you curate and then we have our
> coach and you either play as a player on a topic of your choice or from our
> usual topic list ... or you play as the referee and when you watch two people
> playing, you press the buttons.

And, from the same message:

> there's always three players in every game. There's always a referee, two
> players ... someone can sign on and they can play against another AI player and
> have an AI referee, or they can sign on and two AI players can play and they
> can play the referee.

## 1. The seat question, which has to be settled first

Steve's brief says three seats: referee plus two disputants, with an **AI
referee** available. Roadmap §5 says, ruled on the same day's Steve/Nathan call:

> There is no separate AI judge or moderator character, anywhere. In live play,
> the coach only nominates fouls; the wronged human alone rules.

These read as a conflict and this doc does not resolve it silently (roadmap §11).

**The reading this spec drafts against**, which reconciles them without inventing
a fourth face: the third seat in live play is the **coach**, and "AI referee"
means the coach nominating a foul, exactly as it already does in Level 4. It does
not mean a new character who decides anything. Nobody but the wronged party ever
rules, which is soul.md §6 and has never moved.

UNRESOLVED: whether the coach in the referee seat is presented to the player as a
referee at all, or stays presented as the coach who happens to hold a whistle.
Steve's words say referee; §5 says the coach's role in live play is to nominate
and nothing else. Those can both be true with one face and one label, but which
label goes on the seat is a product call, not an engineering one.
Owner: Steve. Blocked row filed.

## 2. What can be built with no transport, and what cannot

Steve's constraint for tomorrow: *"you can deploy locally if you'd like to avoid
supabase and vercel."* So this spec splits along the line of what needs a second
browser.

**Buildable now, single browser, no server beyond the existing `/api/coach`:**

- **Seat A, the player.** Human argues one side. An AI disputant argues the other.
  The coach holds the whistle on the human's turns and the human holds it on the
  AI's turns. This is `showdown.ts`'s pattern with the gym scaffolding removed and
  a topic picker added.
- **Seat B, the referee.** Human referees. Two AI disputants argue. The human's
  only job is calling fouls, and the AI who was spoken to rules on each call.
  This is `referee.ts`'s pattern with the authored level replaced by a
  topic-and-stance pair chosen at the door.

Both shapes always seat three: coach, opponent, human. Both cover Steve's two
sentences above. Neither needs pairing, transport, or session state.

**Not buildable now, and not attempted:** human versus human. That is roadmap §7
item 11, and it needs pairing, transport, and session state that this repo
deliberately does not have. Nothing in this spec adds Supabase, auth, websockets,
or a database.

## 3. The room, screen by screen

### 3.1 Door

Reached from the level-select screen, below the ladder.

**Gate.** Roadmap §7: live play unlocks when Levels 1 to 3 plus the Full Showdown
are cleared. `isCleared` already answers this from `localStorage`. Roadmap also
says, correctly, that `localStorage`-trust is a real hole the moment human-vs-human
exists, and to fix it before item 11. It is not a hole for the two shapes in §2,
because there is no second human to defraud. Ship the gate as a `localStorage`
read and do not build enforcement infrastructure for a threat that does not exist
yet.

**Two buttons, no more:** *Play a round* and *Referee a round*. Anything else on
this screen is a phase-two problem.

### 3.2 Topic

Steve: *"a topic of your choice or from our usual topic list."*

Both. A free-text field with the printed deck's twelve sample topics offered as
chips beneath it. The printed footer says it better than any UI copy will:
**BETTER: USE THAT REAL DISAGREEMENT YOU'VE BEEN CARRYING.** Put that line under
the field.

The twelve, from `docs/reference/print/v7/deck-content-v7.md` §"Sample Topics
table", are the printed list and are used as printed. They are deliberately
harder than the gym's three (`TOPICS` in `content/showdown.ts`, scoped to "the
milder end of real public policy, not immigration, not abortion"), because the
gym is where a player learns the cards and live play is where they use them on
something that costs.

Political neutrality (CLAUDE.md, non-negotiable) is satisfied structurally here
rather than by pairing examples: every topic is a **proposition the player picks
a side of**, and the AI disputant takes the opposite side of whatever the human
takes. No side is authored. That is the same property that keeps Levels 4 and 7
balanced without anyone writing a position down.

GAP, and it is a real one: in **referee mode** there is no human position to
mirror, so both stances are assigned. `content/referee.ts` handles this today by
authoring `rayStance` and `figureStance` per level. Live play has no author in
the loop. UNRESOLVED: whether the stance pair is assigned by coin flip from the
proposition's two sides (mechanical, defensible, and what this spec would
default to) or whether some topics need a hand-written pair. Owner: Steve.

### 3.3 Faces

Steve: *"we pick a random emoji or one random emoji from a set of ten that you
curate."*

The player keeps the avatar they already chose in the gym. Every **other**
occupied seat draws one emoji at random from the curated ten, minus any already
in the room, so no two faces in a room ever match.

The ten, extending the nine in `src/avatars.ts` by one so the set balances at
four light / three mid / three dark and four men / four women / two neutral:

| # | emoji | reads as |
|---|---|---|
| 1 | 👨🏻 | man, light |
| 2 | 👩🏻 | woman, light |
| 3 | 👱🏻‍♂️ | blond man, light |
| 4 | 👩🏻‍🦰 | redheaded woman, light |
| 5 | 👩🏽 | woman, medium |
| 6 | 👨🏽 | man, medium |
| 7 | 🧑🏼 | person, medium light |
| 8 | 👨🏾‍🦲 | bald man, medium dark |
| 9 | 👩🏾‍🦱 | woman, medium dark, curly |
| 10 | 🧑🏿 | person, dark |

Number 10 is the addition. Reuse `TILES` in `src/avatars.ts` and add the tenth
there rather than opening a second list; the avatar picker lays out a 3x3 grid
against gender and tone and will need a look if the source list grows, so the
grid's slice stays the first nine.

Coach Ray keeps his own face and is never drawn from this set.

### 3.4 The match

**Structure.** A round is one pair of turns (roadmap §5), each disputant speaks
and each summarizes. Seven tokens a side, fourteen on the table, transfers only,
which is what every shipped runner already does.

**Whistles.** Player mode: the coach nominates on the human's turns, the human
nominates on the AI's. Referee mode: the human nominates on both, and the AI who
was spoken to rules, via `affirmCall`. In both modes a nomination is a
nomination; the wronged party rules.

**Fouls the AI commits.** Roadmap §7 item 9 is explicit that a live model will
not dependably commit exactly one specified foul while staying in character,
which is why every shipped level uses an authored schedule. Live play cannot
author per-topic lines. The proposal is to keep the schedule and generate it:
pick foul slots at random over the match's turns at a fixed rate, pass each as
the existing `foul` instruction to `figureLine` / `opponentLine`, and let the
generic fallback line carry the turn when the model refuses. The schedule stays
authored in kind, just not in wording.

UNRESOLVED: the foul rate. The gym levels author roughly one foul in three turns.
Whether live play matches that, runs hotter to give the referee more to do, or
scales with the player's whistle accuracy is undecided, and picking a number here
would be exactly the fabricated precision the spec flow exists to stop.
Owner: Steve or Nathan.

**No redo** (roadmap §7, shipped `c979244`). A missed point costs the point once
and play moves on. The non-engagement gate survives: a thin or unedited answer is
refused, not judged, and costs nothing.

**Clock.** Roadmap §7: a clock runs in live play and never in the gym, ruled by
Nathan. UNRESOLVED, and the roadmap says so in the same words: whether the
printed 30 second speak / 45 second summarize figures carry to typed play, what
starts each clock, and what expiry does are all undesigned. This spec does not
design them. **The first build ships without a clock and is therefore knowingly
incomplete against a ruling.** Say that out loud rather than shipping a guessed
timer that becomes the de facto design.

**End of match.** A disputant at zero tokens is out; Steve ruled this on
2026-08-31. Otherwise the match ends after the scheduled rounds and the larger
purse wins.

### 3.5 After

Store the same per-item records the gym stores, against a live-play slug rather
than a level slug, so the rulings a human made are kept. Roadmap §5: the
collected human rulings are the repo's most valuable asset, and every stored flag
records the prompt version that generated it.

GAP: the shipped `recordItem` stores against a level slug and this needs a
container that is not a level. Small, but it is a storage-shape change and should
be done deliberately.

## 4. What this reuses, so nobody rebuilds it

| Need | Already exists |
|---|---|
| Turn loop, token transfers, thin-answer gate | `src/showdown.ts` |
| Referee loop, call ruling, whistle accuracy | `src/referee.ts` |
| AI disputant's line | `figureLine` / `opponentLine` in `src/coach.ts` |
| Wronged party's ruling on a call | `affirmCall` in `src/coach.ts` |
| Coach's ruling on a human turn | `judgeTurn` in `src/coach.ts` |
| Thread, composer, mast, rule-card rail | `src/App.tsx` |
| Topics, foul costs, labels | `src/content/showdown.ts` |
| Faces | `src/avatars.ts` |

No new model task is needed for either shape in §2. Every call live play makes
already exists in `api/coach.ts`.

## 5. Acceptance criteria

1. **machine-checkable.** With no API key set, both room shapes play start to
   finish on authored fallbacks and never leave the composer locked.
2. **machine-checkable.** Both purses sum to fourteen after every turn of a
   completed match, in both shapes.
3. **machine-checkable.** The door is unreachable until Levels 1 to 3 and the
   Full Showdown are cleared, and reachable immediately after.
4. **machine-checkable.** No two seats in a room ever hold the same emoji.
5. **judgment-rubric.** Reviewer: Steve. A round played on a topic he picks
   himself should feel like the printed game and not like a gym drill: the coach
   teaches nothing, nominates only, and gets out of the way.
6. **judgment-rubric.** Reviewer: Steve or Nathan. The AI disputant argues a real
   position on the opposite side and does not concede to be agreeable.

## 6. Open, blocked on Steve

1. `HEART-T260831-18` Whether the third seat is labelled referee or coach (§1).
2. `HEART-T260831-19` How stances are assigned in referee mode (§3.2).
3. `HEART-T260831-20` The foul rate for AI disputants (§3.4).
4. `HEART-T260831-21` The clock, entirely (§3.4).

Each is filed as its own row rather than living only here.
