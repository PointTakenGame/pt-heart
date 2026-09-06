---
tid: HEART-T260831-17
type: spec
status: active
thread: web-app
authored: 2026-08-31
governs: game/src/room.ts
---

# Live play: the room

Drafted overnight 2026-08-31 from Steve's brief, the roadmap, and the shipped
runners. Gaps are marked, not guessed.

**Build status, corrected 2026-09-01.** This doc was written a few hours ahead
of the code and said "nothing here is built yet". That stopped being true the
same night. Both shapes a single browser can hold now ship, in `src/room.ts`,
`src/content/room.ts`, and the `door` and `live` screens in `App.tsx`: the human
as a disputant against one AI stranger, and the human as referee over two AI
strangers. Human against human is still unbuilt and still needs the transport
section 2 says this repo does not have. Section 6's four open questions are all
still open, and each has its own registry row.

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
deliberately does not have. Nothing in this spec adds auth, websockets, or
pairing. It adds no database either, though as of 2026-09-01 the repo already has
one: `src/corpus.ts` inserts answered items into a Supabase table over PostgREST,
insert-only under RLS, with no identity attached. That is a write-only outbox for
research rulings, not session state, and nothing in this spec may read from it. What that room would need is written out in §7, as a spec and not
as a plan: the point of writing it down now is that several of its requirements
are constraints on code that already ships.

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

Number 10 is the addition. As built: `ROOM_PEOPLE` in `src/avatars.ts` names the
nine picker tiles by reference and adds the tenth as its own literal, so
`PLAYER_AVATARS` and the 3x3 grid are untouched. The grid lays itself out against
gender and tone and would need a second look if `TILES` itself grew, which is
the reason the tenth face lives beside that list rather than inside it.

They are named. Live play has no boss, and `figureLine` writes a turn for a
persona; "the opponent" is not one, so an unnamed slot argues like a paragraph.
The names carry no position: which side a stranger takes is assigned at the door,
and in player mode it is always the opposite of whatever the human picked.

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

## 7. The room with two real humans in it

Roadmap §7 item 11, written up 2026-09-01. **Nothing in this section is built and
nothing in it may be built into this repo yet.** Auth is blocked on
`HEART-T260825-12` and `HEART-T260825-34`, and the standing instruction is that
no auth and no realtime transport enters this repo before those close. That
instruction used to read "no Supabase client" as well; since 2026-09-01 the repo
posts corpus rows to Supabase over PostgREST with plain `fetch` (no client
library, no auth, insert-only), so the line to hold now is auth and transport,
not the vendor. This is here so the shape is on paper, and because four of its
requirements are constraints on code that already ships.

### 7.1 The four seat arrangements

The room always seats three, per Steve's brief. Two real humans fill two of the
three, so the third is always AI, and which one is the seat choice:

| Arrangement | Human 1 | Human 2 | AI fills |
|---|---|---|---|
| Both argue | disputant | disputant | the whistle, nominating only |
| Split | disputant | referee | the other disputant |

The second row is the same code as §2's two shapes with one AI swapped for a
person, which is worth saying out loud: the split arrangement is a smaller build
than the both-argue one, and it is a reasonable first human-vs-human milestone.

GAP: whether a two-human room offers both arrangements or only one, and who
picks when the two people want different seats. Owner: Steve.

### 7.2 The four things that change in code that already ships

These are the reason this section is written before the build rather than during
it. Each one is a constraint on shipped code, not new code.

1. **The purse cannot live in a React ref.** All five runners hold the ledger in
   `purse.current` and reconcile it to state. Two browsers cannot both hold the
   authoritative fourteen. Token arithmetic moves server-side, and the client
   renders a number it is told rather than a number it computed. This is the
   single largest change and it touches every runner.
2. **The gate stops being a `localStorage` read.** `isCleared` is a client-side
   claim. It is honest enough while the only person it could mislead is the
   person making it; it is worthless the moment a second human is on the other
   side of the room. Roadmap §7 already says fix it before item 11, and this is
   the reason. The clear-record moves to the server with the user id.
3. **A model call becomes one call for two viewers.** `/api/coach` is called from
   the client today, so two clients asking the same question would get two
   different answers and the room would disagree with itself about what the coach
   said. Coach nominations and AI disputant lines get made once, keyed by room and
   turn, and delivered to both.
4. **`recordItem` needs a container that is not a level.** Already filed as
   `HEART-T260831-23`; a two-human match makes it unavoidable rather than untidy,
   because the record now belongs to two user ids and a room, not to a browser.

### 7.3 Identity

Design against **"a stable opaque user id arrives from a third project."** That
phrasing is Brain's and it is deliberate. Steve ruled on 2026-08-25 that basic
auth lives in a **third Supabase project** separate from both games' data, and
Brain's own recommendation is to use Supabase's `auth.users` with no custom
identities table.

**Do not build against the JWT details.** The mechanism is a JWKS trust
relationship written from documentation and never tested, carried by Brain as an
open P0 (`BRAIN-T260825-24`). If Supabase will not accept another Supabase
project as a JWKS issuer it gets redesigned. The opaque-user-id abstraction
survives either outcome; anything below it does not.

Nothing real is waiting to be migrated: 162 `auth.users` as of 2026-08-25, 161
anonymous test sessions and one matching Steve's own test alias.

### 7.4 Pairing

- A queue the player joins from the door, holding seat preference and topic
  preference.
- A match rule. Simplest defensible version: pair the first two compatible
  players, where compatible means their seat choices do not collide and they can
  be given a topic.
- Room creation on a match, with both players' user ids and the assigned seats.
- An invite path, so two people who already know each other skip the queue. This
  is probably the more important of the two for a product whose best case is a
  couple or a classroom, and it is much easier than open matchmaking.

GAP: topic selection with two people. Single-browser play lets the one human pick
from `LIVE_TOPICS` or type their own. Two people have to arrive at one topic, and
neither "first player picks" nor "both must agree" has been chosen. Owner: Steve.

GAP: stance assignment with two people. `stances()` currently flips a coin.
Two humans plausibly want to argue the side they actually hold, which is the
whole premise of "use that real disagreement you have been carrying", and that
requires asking rather than assigning. Owner: Steve. Related to
`HEART-T260831-19`.

### 7.5 Transport and session state

What has to reach the other browser: each turn's text as it is submitted, each
foul call, each ruling, each token movement, the clock, and both players'
presence.

The natural pick is Supabase Realtime, because identity is already ruled to be
Supabase and it costs no additional vendor. It is a pick, not a ruling: a room
this small could be served by polling a match-state row on a short interval, and
polling is meaningfully simpler to reason about than a subscription that has to
be resumed after a reconnect. Decide it when it is being built, with a working
JWKS answer in hand, and not before.

Session state is one authoritative match row: room id, both user ids, seats,
topic, stances, turn index, both purses, the phase, and the clock deadline. The
phases are the ones roadmap §7 item 6 already names and asks to be made explicit
rather than implied by call ordering, which is a second reason to do that item
before this one.

### 7.6 A ruling now has a human on the other end

This is the part with no precedent in the shipped code. `affirmCall` asks the
party who was spoken to whether a call lands, and in every shipped shape that
party is a model, so the answer arrives in a second and always arrives. With two
humans, a foul called on a person routes to that person, and the room stops until
they answer.

That needs, at minimum: a prompt in their client, a deadline, and a default for
what happens when the deadline passes. It also needs an answer to whether a
player can decline every call against them for free, which is
`HEART-T260831-22`'s question arriving from the opposite direction.

GAP: the timeout default. Upholding on no answer punishes a disconnect;
declining on no answer makes stalling the dominant strategy. Neither is obviously
right. Owner: Steve or Nathan.

### 7.7 The clock

Ruled to exist in live play and never in the gym (`[ruled, Nathan]`), and
entirely undesigned (`HEART-T260831-21`). A two-human room is where it stops
being optional, because the thing a clock protects against is the other person
not typing. Whatever it turns out to be, it is server-held: a deadline the server
owns and both clients render, not a `setTimeout` in either browser.

### 7.8 Abandonment, and safety

**Abandonment.** Someone closes the tab mid-match. Needs a presence signal, a
grace period, and a ruling on what the match becomes. Options range from
forfeiting the leaver to converting the empty seat to AI and playing on, and the
second is more interesting than it sounds given the AI disputant already exists
and would slot straight into the vacated seat.

**Safety, and this is the one to not leave until last.** Every shape shipped so
far puts a human across from a model. This one puts two strangers in a private
text room, and `LIVE_TOPICS` is the printed deck's twelve, which include
deportation, gender identity, and the death penalty. That is the correct topic
list for the game and it is also a real exposure the moment the other seat is a
person. At minimum: a report path, a block path, a way to leave a room instantly
without penalty, and a decision about whether an unmoderated open queue with
strangers ships at all before an invite-only version does.

GAP: all of it. Nothing here is designed and it is a product and policy question
before it is an engineering one. Owner: Steve. This is the item most likely to
change the shape of the whole feature, which is why it is written here rather
than discovered later.

### 7.9 Build order

Sequence only, no dates:

1. Make the turn phases explicit (roadmap §7 item 6) and move token arithmetic
   off the client ref. Both are useful on their own and both are prerequisites.
2. Identity, once `BRAIN-T260825-24` closes. Server-side clear-record, which
   fixes the gate.
3. Invite-only split arrangement: one human disputant, one human referee, AI in
   the third seat. Smallest real two-human room.
4. The human ruling path, the clock, and abandonment, which the split
   arrangement is the first thing to need.
5. Both-argue arrangement.
6. Open matchmaking, and not before the safety questions in §7.8 are answered.
