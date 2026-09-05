# PROGRESS — gym level-system rebuild

Branch `NathanGymLadderRebuild`. Levels **1–5 only**; 6 and 7 come after.

**One build step, one fresh chat.** Update this file at the end of each step, in the
same commit. Keep it short — it is read at the start of every session.

## Step status

| Step | Brief | Status |
|---|---|---|
| 0 | *(restructure — this scaffolding)* | **done** 2026-09-04 |
| 1 | Ladder scaffold | **done** 2026-09-05 |
| 2 | Q6/Q7 mechanic — `confirm` + `template` step kinds | **done** 2026-09-05 |
| 3 | Level 3 rebuilt as a full round | **done** 2026-09-05 |
| 4 | Levels 1 and 2 retitled and repaired | **done** 2026-09-05 |
| 5 | The referee level at 4 | **done** 2026-09-05 |
| 6 | Showdown renumbered to 5 and reconciled | **done** 2026-09-05 |
| 7 | The passes | **done** 2026-09-05 |
| 8 | Doc reconciliation and the PR | **done** 2026-09-05 |

## The build is done

**All eight steps are complete. Levels 1–5 are built and the eight briefs are spent.**
The remaining work is not a step: it is the PR, the playtest, and — later — the deferred
Final Showdown (levels 6 and 7). **On what is true today, the code still outranks every
doc.**

## Playtest round — Nathan's 18 findings (2026-09-05)

Nathan played the five levels and filed eighteen items. His instruction: **replicate the
error, fix the root cause, then sweep the rest of the level system for the same
mistake.** Grouped by the fix they need, not by level.

| # | Level | Finding | Status |
|---|---|---|---|
| 1 | global | Zoom broken; he must sit at ~80% to fit the screen | open (G) |
| 2 | L1 | "I only care about one rule…" then the rule goes unaddressed for pages | **done** |
| 3 | all | "counter up top" is confusing — name the two token stacks | **done** |
| 4 | L1 | "when you catch his card" should be "his foul" (act vs object) | **done** |
| 5 | L1–L3 | drill chat must **not** carry into the boss fight | **done** |
| 6 | L2 | "that's *his* attack" about Olivia | already fixed in code by `a5e79a3`; docs corrected here |
| 7 | L2 | duplicated Ray lines at the start of the drills | **done** |
| 8 | L2 | Next during drills sometimes does not advance | **done** |
| 9 | global | automated lines arrive too fast, especially 3+ in a row | **done** (card step swept) |
| 10 | L3 | "I don't buy full remote" reads as buying a remote control | **done** |
| 11 | L3 | boss fight races past the first interaction, then freezes | **done** (freeze; races-past by ruling 1) |
| 12 | L4 | start button read "In with Olivia" in a two-opponent level | **done** |
| 13 | L4 | first boss line hands the *player* an opinion and makes Ray ref | **done** |
| 14 | L4 | large revamp: Victor vs Olivia, player refs, player holds **no tokens** | **done** |
| 15 | L5 | "That's the attack…" wrong for three already-earned cards | **done** |
| 16 | L5 | boss summaries do not read what the player wrote | **done** |
| 17 | L5 | boss writes the same point three times | **done** |
| 18 | L5 | round 3 "She's behind" asserted at 7-7 | **done** |

Groups still open: **G** zoom/fit (1). Group **E** (the L4 ref revamp, 13 and 14) is
**closed** — see below. Group **F** (L5 boss quality, 16 and 17) is **closed**. Group
**C** is closed except for the one content ruling below.

### Round two of fixes: 2, 5, 7, 8, 9

- **Finding 8 — two dead windows.** `say()` in both `engine.ts` and `showdown.ts` ran the
  inter-beat gap as a second bare `setTimeout`. For those milliseconds `waiting` was
  false and `skipper.current` was null, so a tap or a Next click landing in the window
  hit nothing and a live-looking button did not respond. The gap is now folded into the
  one dwell, so every wait a player can see is skippable. `Drill.tsx`'s `next()` also
  calls `onSkip()` when it is already caught up, because guarding on `waiting` clamped
  the cursor straight back.
- **Finding 9 — pacing.** `pacing.ts` was 22ms/char with a **2500ms cap**, and the cap
  was the real culprit: every line longer than about 110 characters arrived at the same
  speed no matter how long it was, so a run of three long lines read as a flood. Now
  33ms/char, floor 900, cap 5200, `BEAT_GAP` 700.
- **Finding 5 — the boss seam.** `beginBoss()` appended the crowd row to the drill's
  thread; it now **replaces** the message list. The drill's worked examples must not read
  as things the boss said. Open book still holds *within* the fight.
- **Findings 2 and 7 share one root cause, and it is content, not code.** The fiber dump
  of the engine's live `messages` array proved there is no duplicate push anywhere, and
  the step-runner effect is clean. The real defect: the **prefight stepper** (Steve,
  2026-08-25) was bolted on after the drills were written, and **the drill openers were
  never trimmed**, so the drill's first coach panels restate the corner's last ones.
  Trimmed in all four levels plus the Showdown:
  - **L1** — the corner named both of Victor's tells and the drill named them again; the
    drill also recited the card dealt on the previous panel. Two `say` steps merged into
    one. The "I care about one rule" promise moved off panel 3 and onto Victor's panel,
    and the payoff now rides the card panel's `text` override, so promise and rule are
    adjacent (that is finding 2).
  - **L2** — one idea stated three times in three consecutive panels: the `bossEpithet`
    on the mug, then panel 2, then panel 3. `namesOpponent()` puts the mug on any panel
    naming her, so **two of the three were on screen at once**. Panels 2 and 3 are now
    one; L2's prefight is three panels, down from four.
  - **L3** — the corner gave both the move and the rep; the drill's first line gave both
    again. Rewritten to carry only the rep.
  - **L4** — the drill opened by restating "the ref never takes a side, you watch both
    people". Now carries only what is new: no word from you about the highway.
  - **The Showdown** is clean at this seam — `COACH.intro[2]` hands off to a first turn
    that says something else.
- **Sibling of finding 6 swept in the Showdown**: two card captions opened by naming the
  card's original owner and then said "she", which read as Olivia and Noemi rather than
  Sofia. Both now name Sofia.
- The literal markdown `*really*` in `level1.ts`, a long-standing open defect that
  rendered as visible asterisks, went out with the merged line.

**Q29 political balance is closed** — Nathan, 2026-09-05: *"the political balance is
fine, you can leave it."* The per-level ledger comments stay accurate; the debt is not.

Two mechanics landed with these copy fixes:
- `LevelDef.enterLabel?` — the door button defaults to "In with &lt;last word of boss&gt;"
  and a level fielding two opponents overrides it (finding 12).
- `{ kind: 'card', text? }` — a card panel overrides the coach's first-meeting caption,
  because the Showdown deals three cards the player already cleared levels on
  (finding 15). `Turn.intro` in `content/showdown.ts` also widened to
  `string | ((player, sofia) => string)` so the coach reads the live purses
  (finding 18); `scripts/export-script.ts` renders the function form at 7-7.

### Finding 11 — both halves fixed (freeze, then ruling 1's Next gate)

Nathan: *"L3 boss fight is broken - it zooms past the first interaction with no user
input, then occasionally freezes."* Two separate defects wearing one sentence.

**The freeze was real, and it was never actually stopped — it was a dead tap.** Both
runners' `finish()` clears `skipper.current` and drops `waiting` *before* it resolves,
and the effect cleanup clears the skipper again on every cursor change. So between one
step ending and the next one reaching its `dwell()` there is a render tick with no
skipper installed and `waiting` false. `Thread.tsx:104` was `onClick={() => waiting &&
onSkip()}`, so a tap landing in that tick hit nothing at all — and since a boss line can
now dwell 5.9s, the thread sat there looking dead for the rest of it.

Removing the guard is not enough on its own. `onSkip()` is a no-op while
`skipper.current` is null, and unlike `Drill.tsx`'s `next()` — which closed the same
window for finding 8 by clamping its own local cursor — the Thread has nothing of its own
to advance. So the tap is **latched**: `skip()` stamps `pendingSkip` when it has nothing
to serve, and the next `dwell()` consumes the stamp and resolves immediately. Two guards
on the latch:

- it only arms while `composer.kind === 'locked'`, so a tap made with an interactive gate
  open cannot eat the first line after the player answers;
- it expires after `SKIP_LATCH_MS` (250ms), because the last autoplay step before a gate
  opens its composer a tick *after* the dwell ends — which is exactly the boundary tick
  this is meant to catch, and no longer than that.

**Swept into `showdown.ts`**, which is the second runner with the identical shape and the
same now-unguarded Thread. Its `dwell` is a local closure inside the match effect rather
than a `useCallback`, so the two refs live at hook scope and the consume-check goes inside
the closure; `SKIP_LATCH_MS` moved to `pacing.ts` so both runners read one number.

Replicated and verified at runtime: tapping the L3 boss thread repeatedly walked it from
3 rows to 10 and onto the `confirm l3-summarized` gate with no tap swallowed.

**Hypotheses disproven along the way, so nobody re-chases them:** a rail-card or composer
click bubbling into `.thread`'s `onClick` and consuming a gate (they are siblings, not
children — `App.tsx:497-529`); and an apparent hard hang at the crowd row, which was
hidden-tab timer throttling of the recording script, not the gym.

**Sibling of finding 9 found here.** The `card` step held a hardcoded 2200ms that never
got the finding-9 treatment. It was set when a line was 22ms/char capped at 2500; after
the slowdown the printed rule card — the one beat that is a new *object* to look at
rather than a sentence to read — had quietly become the fastest thing in the gym. Now
`cardDwellMs(name + ' ' + blurb) + BEAT_GAP` in `pacing.ts`, measured over what
`RuleCardMini` actually prints, with a 3000ms floor because ~50 characters understates a
card.

**The "races past" half — closed by Nathan's ruling 1.** `Thread.tsx` had no Next by
design (Steve, 2026-08-25: the stepper is the corner, the thread is the fight), so L3's
boss beat ran **eight consecutive auto-play steps** — roughly 34 seconds by `pacing.ts`
arithmetic — before its first gate: coach warning, Noemi's take, the specimen setup, the
specimen, Noemi's reply, the card, the card explanation, and the flip to the gas-stove
topic. The sweep put L3 alone in that: **L1 and L2 open with one step before their first
gate, L4 with three.** Nathan ruled on it globally rather than as an L3 content trim:

> *"Put in a next button, which should go after each text blurb or where you see fit.
> This ensures the player actually reads and digests each part."*

**Both runners, narration only.** In `engine.ts` the gate is scoped to `const gated =
!!beat?.boss`, and `case 'say'` / `case 'card'` end on `{ kind: 'continue', label: 'Next'
}` instead of bumping the cursor; `submit()` gained `case 'say': case 'card':` to advance
when it is pressed. In `showdown.ts` — one long thread with no stepper in it — the gate
went inside `say()` itself, so every narration line waits to be dismissed.

Three things the shape depends on:

- **The dwell stays in front of the gate.** The line still lands with a beat, `waiting`
  is still true while it runs, and a tap on the thread still cuts it short; Next appears
  when the dwell resolves. That is exactly the drill's "go on", and it keeps the finding-8
  and finding-11 skip work intact.
- **Steps that already open a composer are not gated.** `call_or_pass`, `confirm`, `free`,
  `sort`, `edit`, `template` are their own gate, and a Next in front of one would cost two
  presses to answer one question — the thing Steve struck down on 2026-08-25 ("too many
  'next'"). In `showdown.ts` the same rule falls out for free: composers are opened by
  `ask`, not by `say`.
- **`gated` must stay scoped to boss beats.** `App.tsx:520` passes
  `composerReady={gym.composer.kind !== 'locked'}`, and a live composer inside a drill
  replaces `Drill.tsx`'s own Next — which holds its own cursor into the message list and
  counts down the backlog. Gating drill narration would fight that stepper.

The boss-beat step census says no other case needs the treatment: boss beats contain only
`say`, `card`, `call_or_pass`, `confirm`, `free` and `continue` — no `model`, `sort`,
`edit` or `template`.

Verified at runtime in both runners. L5: after `Start`, the coach's opening line ended on
a lone Next; pressing it opened the three ruling-6 topic buttons; the coach line and
Sofia's specimen each gated, and the call composer that followed opened with no double
gate. L1: played the drill through to `Face him`, and the boss beat's first line ("Here he
comes. You know his move.") ended on a lone Next where it used to run on; pressing it
opened `composer-call` on Victor's judging line directly — again no double gate. The
drill's own Next was confirmed still intact on L1 and L3.

**Side effect worth recording for ruling 8.** A thread can now never run more than one
dwell ahead of the player, so the tab-backgrounding burst that ruling 8 (pause/resume on
`visibilitychange`) was meant to stop is already capped at a single line. Ruling 8 is
still worth doing, but it is now polish rather than a fix — and it will end the ability to
drive the app in a hidden browser pane, so it is scheduled last.

### Group F — findings 16 and 17, and Nathan's ruling 6 (L5)

**Root cause of both, and it was authoring, not plumbing.** `src/showdown.ts` has always
passed the player's last sentence into `sofiaLine`, and `src/coach.ts` has always
forwarded it as `playerText`. The wiring is correct — do not "fix" it. What is true is
that **`/api/coach` returns 503 under `npm run dev`**, because Vite does not run the
Vercel serverless function. So every Sofia line in a local playtest is the *authored
fallback*, and the fallbacks were the defect.

**Finding 17 ("she writes essentially the same point three times").** `l5-r1-sofia-open`
and `l5-r2-sofia-speak` were both arguing "the cost falls on people who had no say" —
one argument wearing two costumes, with a summary in between that made no argument at
all. They are now two different moves: a **tradeoff** claim (name the bill, refuse to say
who pays it) and a **precedent** claim (object to settling it *this way*, not to either
answer).

**Finding 16 ("are they actually reading what the user writes?").** The worst offender
was `l5-r2-sofia-summary` — the match's one *clean* summary, the beat whose own coach
intro says "Nothing she just said was a foul, which is the hard part." Its fallback
invented a position for the player. In the no-key path the clean turn was arguably a
foul. It now runs `playback()` and quotes the player verbatim, which is topic-agnostic
by construction and is the one thing that answers "is she reading me?" with a yes the
player can see on screen. (`l5-r3-sofia-summary` stays deliberately terrible — that one
*is* the Fake Listening card being dealt. Do not improve it.)

**Ruling 6 — authored variants per topic, and the player picks one of three.** `OPENING`
was a free-text box with the three as chips; a typed topic meant every authored line had
to survive any subject at all, and lines that survive anything are about nothing. That is
how 16 and 17 happened. `TOPICS` is now typed `{ id, label }` pairs with `TopicId`,
`topicLabel()` and a `byTopic()` helper; `Turn.fallback` widened to
`string | ((playerText, topic) => string)`; the opening is a `buttons` composer. The
length/`/[a-z]/i` validation loop is gone with the text box — a button cannot be a typo.

**Balance, and it is load-bearing.** Round 1 opens on Sofia, so she speaks *before* the
player has revealed a side. Authored per-topic lines therefore cannot take a side without
the boss becoming partisan on every run. Every new line is **topic-specific and
side-neutral**: she argues about who pays, what becomes precedent, and how the player is
arguing, never about which answer is right, and both her fouls are aimed at the player's
reasoning rather than at a position. The ledger comment in `src/content/showdown.ts`
says this, and tells the next author to hold the line if they add a topic.

**One new defect, found on the way and not in Nathan's eighteen: nobody answered the
summary gate.** `SUMMARY_FRAME` ends "Did I miss anything?" and the only response was the
coach saying "Clean." — a gate with no gatekeeper. That breaks `rules.md` §5, where the
person summarized answers and *that answer* is the ground truth for Fake Listening, and
it cuts against `soul.md` §6 by making software the arbiter of whether the summary
landed. Sofia now rules first and the coach prices it after, both derived from the same
`foul` value so the two can never contradict. **Swept:** `grep -rn "Did I miss anything"
src/` hits `level3.ts` (drill template, carries a `reply`), `level4.ts` (spoken by
characters with authored responses adjacent), `cards.ts` (card examples) and `types.ts`
(a doc comment). The unanswered gate was unique to L5.

Touched `src/content/showdown.ts`, `src/showdown.ts`, and `scripts/export-script.ts` —
the last because **`npm run build` type-checks `scripts/` too**, so any change to an
exported shape in `src/content/` has to be swept into the exporter. Its fallback column
now renders all three topic variants, or renders once labelled topic-independent for the
playback summary.

### Group E — findings 13 and 14, and Nathan's rulings 2, 3, 5 (L4)

**The whole level was rebuilt.** L4 used to hand the *player* an opinion about the
highway and seat *Ray* as referee — the exact inversion of what the level is for.
Now **Victor argues Olivia**, the **player holds the whistle and nothing else**, and Ray
coaches from outside the argument.

**Ruling 2 — the ref holds no purse.** There is no third purse in the engine and there
did not need to be: the two existing purses are **relabelled**, engine `opponent` =
Victor (left), engine `player` = Olivia (right). `src/engine.ts` gains
`const isRef = level.seat === 'referee'`; `chargeMiss` returns immediately when `isRef`,
and the "a bad whistle costs you one" sentence is gated `tokensLive && !isRef`. The
*payout* still runs: an upheld call moves the fouling player's tokens across the table.
Which purse pays is named per step by the new `CallOrPassStep.charges?: 'player' |
'opponent'` (default `'opponent'`), because in the ref seat both purses belong to other
people. `l4-olivia-oaf` is the one step carrying `charges: 'player'`.

**Ruling 3 — both fighters' purses, no "you" side.** `Header.tsx` takes a
`playerLabel`; `LevelDef` takes `fighters: { left, right }` and `bossFaces`. App passes
the fighters for the **whole level, not just the boss beat**, because beat 1 names the
two stacks out loud. The header now reads `aria-label="victor 7"` /
`aria-label="olivia 7"` with distinct faces and no "you". `bossFaces` also gives Victor
and Olivia separate avatars inside the thread, which the single `bossEmoji` could not.

**Ruling 5 — "suggest it and watch them rule".** `CallOrPassStep.ruling?: { speaker,
upheld, declined }`. A correct card plays the offendee's `upheld` before the card, then
Ray, then the transfer. A **wrong** card plays the offendee's `declined` and stops —
no cost, no retry, and **the fighter's "no" replaces only the generic `CARDS[rule].tell`,
never an authored Ray line**, so a bad whistle on a clean line still gets Ray's written
explanation after the refusal.

**Runtime-verified end to end** (all six paths, purses summing to 14 throughout):
correct Judging call → Olivia's "Yes. Take it." → card → Ray → **two** tokens Victor→
Olivia (`victor 5 | olivia 9`); correct `charges: 'player'` call → Victor's upheld →
`victor 8 | olivia 6`; wrong card on a foul line → Olivia's "no", purses unchanged;
missed call → Ray's miss text with no cost sentence, purses unchanged; bad whistle on a
clean line → Victor's "no" **then Ray's authored explanation**, no cost; correct pass on
a clean line → Ray's `onPass`. Closing `free` step and the Review screen both check out;
Review already says "You sat in the ref's chair…" and shows no tokens.

**Two things Nathan should see in the PR.**
1. **L4 no longer carries a `confirm` step.** Ruling 5 replaced it with the fighters'
   own rulings. CLAUDE.md says a confirm dialogue "is a core component in every level,
   both seats" — that was already untrue in the code (L3 was the only one), and the
   ruling supersedes it here. Flagged in the `level4.ts` header rather than dropped
   quietly. **CLAUDE.md needs a line change, or the claim needs to become true.**
2. **The balance ledger moved 2-2 → Victor 2 / Olivia 1.** The demo beat that was cut in
   the rebuild was Olivia's second catch. Recorded in the file's ledger comment rather
   than re-authored on the fly. Nathan closed the balance question for this pass
   ("the political balance is fine, you can leave it"), so this is a note, not a debt.

**Ruling 8 was withdrawn.** Nathan: *"i agree with you, no need to implement ruling 8 on
visibilitychange."* Pause/resume on `visibilitychange` is **not** implemented and is not
carried as work. The tab-backgrounding burst stays a known, accepted behaviour.

Touched `src/types.ts`, `src/engine.ts`, `src/content/level4.ts`, `src/ui/Thread.tsx`,
`src/ui/Drill.tsx`, `src/ui/Header.tsx`, `src/App.tsx`.

## Carried state

**Step 8 (just done) reconciled the docs with the seven-level, player-first ladder.**
One commit, `docs/` only — no code changed.

- **The ladder is seven levels, ruled and player-first:** L1 Judging, L2 Opinions as
  Facts, L3 Fake Listening (all player seat), L4 the referee seat with the full round,
  L5 the Showdown (player) — **base game complete here**. L6 (referee) and L7 (player)
  are the deferred Final Showdowns; the game is complete without them. Save by slug.
- **`rules.md` §8/§9, `roadmap.md` §1/§5/§6/§7/§8 and its reconciliation note, and
  `script.md`'s closing scripts** now describe: seven levels (not six); **no half
  tokens** (Q9 — a missed whistle moves nothing); **no instant loss at zero** (Q11 — a
  purse can empty and climb back); and **the gym as an open book** (Q23 — the thread's
  old "forgetfulness is load-bearing for Fake Listening" claim is reversed). The
  `game/src/showdown.ts:*` citations at `rules.md:206/:220` were de-lined to
  `src/showdown.ts`.
- **`script.md`'s two "instant loss" moderator lines** were rewritten to the Q11 ruling,
  with an editorial bracket recording the v7 deck's original printed wording. Those
  brackets are why the `instant loss` grep still returns hits — they quote the retired
  text before overruling it. That is intentional; do not "clean up" the brackets.
- **`code-map.md`** carries a new banner at the top: post-rebuild, every anchor in it is
  stale — orientation only, code is ground truth.
- **`defects.md`** — the two doc defects (16, 17) are marked ✅ CLOSED, and the two
  thread defects (5, 6, behaviorally closed in step 7) are marked ✅ CLOSED with a note
  that their grep *locators* still hit. Defect 10 was already closed.
- **`soul.md` was not touched** — its one permitted edit (Q7 carve-out) was spent in
  step 2.

## Not done in this session (handed to Nathan)

- **The PR was NOT opened.** Per Nathan's 2026-09-05 note, this round is committed and
  pushed but he opens the PR and reviews it himself. In that PR he reviews the
  **political-balance ledger (Q29), which is still in debt (`HEART-T260823-33`)** —
  L1 is 4:1, L2 offset, L4 split, the Showdown balanced structurally.
- **The playtest was NOT run from here.** It runs separately, against a local dev server,
  from the session that started this one.

## Carried questions / next work (levels 6–7)

- **Levels 6 and 7 — the Final Showdown — are the deferred add-on.** Not a step in this
  rebuild; a later brief. L6 is the referee seat for the Final Showdown, L7 is the
  player seat. New slugs when they come; never collide with the five live slugs.
- The live-play row (Q5) is a disabled button that flips appearance when the ladder is
  complete (`allCleared` in `src/App.tsx`). Clearing L5 (the Showdown) ends on its own
  win/loss/draw result — no review screen by design — so that flip is still the only
  thing that makes clearing L5 feel different from L4. Revisit whether the row carries
  too much weight when the Final Showdown lands.
