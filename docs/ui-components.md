---
tid: HEART-T260831-26
slot: ui-components.md
game: heart
purpose: Component inventory, real design tokens, and interaction specs for the HEART web trainer, so a coding agent can build a new screen that matches what already ships.
written: 2026-08-28 by biz
status: draft, unreviewed by Steve
sources:
  - game/src/styles.css
  - game/src/App.tsx
  - game/src/avatars.ts
  - game/src/engine.ts
  - game/src/coach.ts
  - game/src/detectors.ts
  - game/src/storage.ts
  - game/src/types.ts
  - game/src/pacing.ts
  - game/src/content/cards.ts
  - game/src/content/showdown.ts
  - game/src/content/index.ts
  - game/src/ui/*.tsx, game/src/ui/blip.ts
  - docs/reference/design-system/visual-design-spec.md
  - docs/reference/design-system/figma-scrape-summary.md
  - docs/reference/design-system/README.md
  - docs/reference/print/v7/card-anatomy.md
---

# UI components: Point Taken HEART (Humility Showdown)

Scope note before anything else. The repo does not ship the printed 3-player game
translated to a screen. It ships a solo trainer: one human plays a scripted AI
opponent named Sofia, with a coach character adjudicating the human's own calls.
`App.tsx:77-79` states this outright in a comment: "The teal flow diagram is the
tabletop procedure, which the app runs for the player. The referee panel has no
counterpart: here you are the referee." `types.ts:3` confirms it from the other
side: "the coach is still the only referee." There is no Player-3/Referee UI
surface anywhere in the code. `[unratified: App.tsx:77-79, types.ts:3]` This
document describes what exists, not what the print rules would imply exists.

## 1. Styling approach and where tokens are defined

Plain CSS, one file: `game/src/styles.css` (1798 lines), imported once at
`game/src/main.tsx:4`. No CSS-in-JS, no Tailwind, no CSS Modules. Custom
properties are declared on `:root` (`styles.css:6-51`) and consumed by name
throughout. `[unratified: styles.css:6-51, main.tsx:4]`

Two token sets coexist deliberately, per an in-file comment (`styles.css:19-29`):
an app-native palette (`--cream`, `--orange`, `--teal`, `--charcoal`, `--purple`,
`--rule`, `--white`) for surfaces the app invented, and a `--print-*` palette for
any surface reproducing the printed deck (card faces, masthead, front page). The
comment is explicit that these must not mix, and separately warns against
pulling in "pt_digital" tokens, which belong to Brain. `[unratified: styles.css:1-4]`

A third source, `docs/reference/design-system/design-tokens.json`, is named in
`styles.css:1` as the palette's origin and in the design-system README as "THE
canonical token source," but I did not open that JSON file for this document; the
live values below come from `styles.css` itself, which is the more direct source
for what actually renders. `GAP: has design-tokens.json been reconciled against
the live styles.css values, or is styles.css now the de facto source of truth?`

## 2. Design tokens as they actually exist

Colors, app palette (`styles.css:7-14`):
- `--cream: #f7f0e8`
- `--orange: #e8845a`
- `--teal: #52c4a0`
- `--charcoal: #2d2d2d`
- `--purple: #9b6bc4`
- `--rule: #d4c4b4`
- `--white: #fff`
`[unratified: styles.css:7-14]`

Colors, print palette, used only on print-faithful surfaces (`styles.css:30-38`):
- `--print-orange: #d4520a` (card header bars, front-page rule)
- `--print-navy: #0d1b2a` (page 2/3 bars)
- five more `--print-*` values exist in this block (mast, pill, peach, mint,
  teal variants, ink, eyebrow-grey) that I did not individually re-verify by
  line for this pass. `[unratified: styles.css:24-45, spot-checked only]`

Spacing: no named spacing scale (no `--space-sm` etc.). Values are hard-coded
per rule, mostly in 0.05rem increments between 0.15rem and 1rem for padding and
gap, per a frequency scan of the file (`padding: 0.5rem` appears 9 times,
`gap: 0.6rem` 6 times, `padding: 0.3rem`/`0.25rem` 4 times each). This matches
`figma-scrape-summary.md:139-143`, which states no Figma spacing-token system
was ever found; Figma spacing is hard-coded inches in the PPTX generator, not a
token set. `[unratified: styles.css spacing frequency scan; figma-scrape-summary.md:139-143]`

Radius: one named token, `--radius: 0.75rem` (`styles.css:17`), reused directly
or via `calc(var(--radius) - 0.25rem)` (`styles.css:1638`). A handful of
one-off radii exist outside the token: `999px` (pills/avatars), `0.3rem`,
`0.4rem`, `0.35rem`, `2px`, `50%`. `[unratified: styles.css:17,155,225,635,1278,1382,1434,1488,1592,1638,1694]`

Shadow: no CSS custom property for shadow; each `box-shadow` is written inline.
Notable ones: `.quote` blockquote uses `0 1px 6px rgba(45,45,45,0.08)` with a
4px `--purple` left border; the dialogue "corner box" uses a stacked
double-ring `box-shadow: 0 0 0 2px var(--print-navy), 0 0 0 4px <tone>` to fake a
picture-frame edge; `.fighter:hover`/`:focus-visible` (the avatar tiles) use a
hard offset `5px 5px 0 var(--charcoal)` with no blur, a comic-panel "pop" rather
than a soft drop shadow. `[unratified: styles.css, box-shadow occurrences catalogued by grep]`
`design-tokens.json` (unread) reportedly names five shadow styles per
`figma-scrape-summary.md:28-33` (`shadow1`, `shadow2`, `shadow1_1`,
`graphic_shadow`, `box_border`); none of those names appear in `styles.css`, so
if that JSON is meant to be the shadow source of truth, it has not been wired
in. `GAP: is design-tokens.json's shadow set meant to replace the ad hoc
box-shadow values in styles.css, or is it print-only and irrelevant to the app?`

Type: the condensed wordmark face is `--font-cond: Impact, Haettenschweiler,
"Arial Narrow Bold", "Arial Narrow", sans-serif` (`styles.css:50`), used on
titles and headers (`styles.css:128,143,1090,1098,...`). Body text is a plain
serif stack, `font: 16px/1.55 ui-serif, Georgia, "Iowan Old Style", serif`
(`styles.css:70`). Neither Anton nor Nunito nor Noto Sans, the three faces named
across the two design-system docs (see section 11), appears anywhere in the
live stylesheet. `[unratified: styles.css:50,70,128]`

Card geometry: `--card-ar: 3.985 / 4.948` (`styles.css:833`), an exact aspect
ratio match to the printed card's stated dimensions in
`docs/reference/print/v7/card-anatomy.md` Section E. This is the one clean
print-to-web fidelity point I can point to with confidence. `[unratified:
styles.css:833; card-anatomy.md §E]`

## 3. Component inventory (`game/src/ui/`)

- `Header.tsx`: title bar plus the two live token purses (opponent left, player
  right), with a flying-token animation between them on transfer. Mounted at
  the top of the active room in `App.tsx`. Takes an optional `costs?: boolean`
  prop (`Header.tsx:58,143`); when true it renders a `.cost-strip` of
  `.cost-item`/`.cost-glyph`/`.cost-name` rows under the purses, listing what
  each foul pays out. Wired in `App.tsx:702` as `costs={level.tokens ===
  'live'}`, so the strip shows only on rungs where tokens actually move;
  levels 1 to 3 run `tokens: 'off'` and get no strip (`Header.tsx:57`).
- `RuleCards.tsx`: the persistent bottom rail of the three foul cards. Doubles
  as reference (tap to open the full printed face) and as the whistle itself
  (tap to call that foul). Mounted under the thread/drill in every playing
  screen once at least one card is taught. Two teaching affordances ride on the
  rail (`RuleCards.tsx:60-115`): a per-chip price badge, `.rail-cost`,
  showing that card's cost in 🙏 glyphs, rendered only while the chip is
  actually callable (`callable && ...`); and an optional `hint` prop rendered
  as `.rail-hint` with a `.rail-hint-arrow` pointing down at the tray, shown
  only in level 1, only before a call opens, and withdrawn for good the first
  time a card is opened (`everOpened` state). Both a live chip (`.rail-card.is-
  live`) and the let-it-stand row (`.rail-pass`) carry the shared `cta-pulse`
  attention animation while callable (see the interaction specs below).
- `Dialogue.tsx`: the fixed-frame NPC dialogue box. Typewriter text reveal,
  synthesized blip per character, mute toggle, voice picker, optional embedded
  rule-card or opponent "mug" panel. Used by `Prefight.tsx` and `BossIntro.tsx`,
  and as the coach/opponent line renderer inside `Drill.tsx`.
- `Drill.tsx`: one-line-at-a-time stepper used only for training beats (never
  boss encounters). Gates advancement on the player reaching each line before
  a foul can be called on it.
- `Thread.tsx`: scrolling chat view used only for boss encounters (Sofia).
  Lane-based layout (coach centered, opponent left, player right, crowd
  centered), with a three-tier age fade by `data-age` attribute: `now` for the
  last 3 messages, `recent` up to 6 back, `old` beyond (`Thread.tsx:117`).
  Bottom-anchored via `margin-top: auto` on `.thread > :first-child`
  (`styles.css:466`), deliberately not `justify-content: flex-end`, which
  would clip the overflowing top of the scroll container and make the
  earliest lines unreachable (`styles.css:460-465`). The thread has to be
  re-landed on its bottom whenever the composer changes height; `Composer.tsx`
  calls its `onResize` prop from a layout effect on every state change
  (`Composer.tsx:44-47`) for exactly this reason.
- `Composer.tsx`: the message-input region. `ComposerState` (`types.ts:39-69`)
  has eight kinds: `locked` (no box), `continue` (one wide button), `call` (no
  box, a hint line only, since the rule cards themselves are the call buttons),
  `buttons`, `template` (sentence frame with blanks in the box), `confirm` (two
  verdict buttons plus an always-open note box, for a bystander ruling on
  whether a suggested foul actually landed), `prefilled`, and `free` (the last
  two both render through the same `TextComposer` fallback). Pre-fill is the
  governing design constraint on the free-text states. Owns a "revision trace"
  capture (pause, blur, chip insert, send snapshots; four triggers, 900ms after
  typing stops, per `Composer.tsx:1-8`).
- `OnTable.tsx`: pins the line currently
  being ruled on between the header and the thread/drill, so the specimen
  cannot scroll out of view while three coach lines and the composer stack up
  on top of it. Exports `OnTable` (props `text`, optional `hint`; classes
  `.on-table`, `.on-table-tag`, `.on-table-text`, `.on-table-hint`) and a
  `tableLine()` helper that finds the newest specimen/take line in a message
  list. Rendered only while a ruling is open (`OnTable.tsx:1-14`), wired into
  the boss branch of `Room` and into `Match`, `FinalRun`, `RefereeRun`, and
  `LiveRoom` in `App.tsx`.
- `Prefight.tsx`: the pre-room "corner" stepper. Introduces the coach once ever,
  then steps through setup lines and card reveals before a level or the
  showdown begins.
- `BossIntro.tsx`: full-bleed diagonal two-face walk-out splash before a boss
  match, with a `3, 2, 1, FIGHT` countdown and a fanfare sting.
- `Mast.tsx`: slim header/masthead strip with a "Leave" link, used above
  `Prefight.tsx`'s stage.
- `blip.ts`: not a visual component but the sound layer behind `Dialogue.tsx`;
  synthesizes short character-driven blips and one arpeggio fanfare via the Web
  Audio API. No sampled audio files.

`[unratified: whole section, from reading each file's top-level export and its
call sites in App.tsx]`

## 4. Screen-by-screen: one match, setup to scoring

1. **Agreement** (consent screen): first screen on load, gates everything else.
   `GAP: exact copy and component name not confirmed; App.tsx references it but
   I did not trace its full render tree for this pass.`
2. **Avatar picker**: a 9-tile grid (`avatars.ts` `TILES`), re-shuffled on every
   open (`shuffledAvatars()`), constrained so no row or column is uniform in
   gender or skin tone. Default selection is index 6 (`DEFAULT_AVATAR`).
3. **Level select**: three levels (`content/index.ts` `LEVELS`), each teaching
   one foul card, gated so a level unlocks after the previous clears
   (`storage.ts` `cleared` map, keyed by level slug, never by index, so
   reordering levels does not orphan a save). A cleared row gets
   `.level-card.is-cleared` (border only, `styles.css:2192`) plus a
   `.level-state` block on the right holding `.level-done` (which card it
   taught) and a `.level-replay` pill back in. Deliberately minimal: no score,
   attempt count, or percentage is shown, since a rung can be retried until
   correct and any number would either be a foregone conclusion or a
   punishment for learning out loud (`styles.css:2170-2186`, Nathan ruling
   Q20).
4. **Prefight** (per level or before the showdown): `Prefight.tsx`, one coach
   panel at a time, "meet the coach" shown once ever (`storage.ts` `metCoach`
   flag), then setup lines and card reveals, advanced by a Next button and a
   dot-progress indicator.
5. **Room**: `Drill.tsx` for the three training levels, `Thread.tsx` for the
   showdown. `RuleCards.tsx` pinned at the bottom throughout. `Header.tsx`
   pinned at the top once tokens are live (from level 1 on, per
   `engine.ts:15`, not only in the showdown). **This `Drill.tsx` stepper is
   what's shipped today, not necessarily what ships next**: `game/docs/roadmap.md`
   §7 rules a referee-format redesign for Levels 1-3 (human referees a
   coach-vs-AI-opponent exchange rather than answering authored items
   directly), scoped as an open GAP, not yet built or mapped onto this
   component.
6. **BossIntro**: shown once, before the showdown only, not before the three
   training levels.
7. **Showdown match**: `Thread.tsx` running the fixed 12-turn script in
   `content/showdown.ts` `TURNS`, three rounds, coach ruling every call.
8. **Scoring / end state**: a `COACH` line (`win`/`loss`/`draw`/`bankrupt`) per
   `content/showdown.ts:247-258`. `GAP: is there a dedicated end-of-match
   screen/component distinct from the coach's closing line rendered in-thread,
   or does the match simply stop advancing after the final coach line? I did
   not find a separate "results" component.`

## 5. Print-to-web correspondence

- **Foul cards** (physical cut-out cards) correspond to `RuleCards.tsx`'s rail
  entries, which open to a full-face view (`CARDS` in `content/cards.ts`) on
  tap. The rail is also the input mechanism for calling a foul, which has no
  physical analogue: on paper, calling a foul is a spoken/gestured act, not a
  card being pressed.
- **Gratitude tokens** (physical 🙏 cutouts, per `card-anatomy.md:161-162`)
  correspond to `Header.tsx`'s purse icons. The web purse is dynamic and
  running (icons rendered = tokens currently held, not a static printed sheet)
  and starts each side at seven, per `content/showdown.ts:22` (`START_TOKENS =
  7`). The print deck disagrees with itself on this count; see `rules.md:46`
  (`card-anatomy.md` section B.3 says six per column, that is a known error,
  `HEART-T260827-03`, and the ruled/correct count is seven).
- **The Referee role** (physical Player 3) has no web component.
  Per `App.tsx:78-79`, this is a deliberate omission, not a gap to fill.
- **The turn-sequence flow diagram** (printed teal SPEAK -> GATE -> RESPOND
  loop) has no rendered on-screen diagram; the app runs the procedure for the
  player as `engine.ts`'s step sequence instead of depicting it.
  `[unratified: App.tsx:78, engine.ts step machine]`
- **Card colour**: the print deck uses no per-foul colour coding at all, per
  `figma-scrape-summary.md` and `card-anatomy.md`'s own findings. The web rail
  invents one: `CARD_COLOR` in `content/cards.ts:262-266` maps judging to
  `var(--orange)`, opinion_as_fact to `var(--purple)`, fake_listening to
  `var(--teal)`. This is a `[vibecoded]`-adjacent app-only choice, but it is
  explained in-code as intentional rather than accidental, so I mark it
  `[unratified: content/cards.ts:262-266]` rather than `[vibecoded]` since the
  team made the call, they just didn't leave a design-doc citation for it.

## 6. Avatars (`avatars.ts`)

- `COACH_NAME = 'Coach Ray'`, `COACH_EMOJI` (man, medium-dark skin tone, white
  hair), shown once via a fixed greeting line, `COACH_LINE`.
- `TILES`: 9 entries, each `{emoji, gender, tone}`. Trimmed down from 12 in a
  2026-08-25 change that dropped the darkest skin tone from the picker; the
  in-code comment flags this as "Steve's to reverse" if it was not intended.
  `GAP: was the loss of the darkest skin tone from the 9-tile trim reviewed and
  accepted, or does it need to be restored?`
- `shuffledAvatars()`: Fisher-Yates shuffle, retried up to 200 times against a
  `scattered()` constraint that rejects any 3x3 grid row or column that is
  uniform in gender or tone. Explicit design intent per an in-code quote: "we
  don't want to look like we are organizing it in any way."
- `CROWD_ROWS`: 4 fixed emoji strings, chosen deterministically by
  `crowdRow(n)` (`n % 4`), used on `BossIntro.tsx`'s crowd row.

## 7. Interaction specs

**The timer.** No countdown corresponding to the printed 30-second
speaker/45-second summarize limits exists anywhere in the code; I grepped the
full source tree for timer, buzzer, and both duration strings and found
nothing. `GAP: should a 30s/45s visible timer be built, or has this rule been
deliberately dropped from the web trainer along with the referee?` The only
countdown that exists is `BossIntro.tsx`'s cosmetic `3, 2, 1, FIGHT` walk-out,
`TICK_MS = 620` per tick, gated behind a Start button press so it complies with
autoplay policy, paired with a fanfare sting from `blip.ts`. This is not a
gameplay timer; it never blocks or scores anything.

**The foul call (no physical buzzer).** Calling a foul is done by pressing the
corresponding card in `RuleCards.tsx`'s rail; there is no separate call button.
When a call is open, non-live cards are visually dimmed and disabled
(`is-dim`), and the live/callable ones get a ring highlight (`is-live`,
`styles.css` `.rail-card.is-live`). A full-width "let it stand" row appears
above the rail while a call is open (`pass.label`, wired in
`content/showdown.ts:215`: "Press a foul card to call it, or say it is not a
foul."). The showdown match runner judges the call in `src/showdown.ts:479-495`:
correct card on a fouled line pays out per `foulCost()` (`src/content/showdown.ts:75-77`,
a Showdown-only function; the level 1 to 3 drill engine in `engine.ts` uses flat
one-token transfers for a wrong drill answer, see `chargeMiss()` at
`engine.ts:483-489`); a call on a clean line is a false call and costs the caller
`FALSE_CALL_COST` = 1 token (`src/showdown.ts:502`, constant defined at
`src/content/showdown.ts:83`). Missing a foul entirely (letting the line pass)
costs nothing: a miss moves no tokens, because "you are charged for what you
say, not for what you fail to notice" (`src/showdown.ts:483-489`,
`src/content/showdown.ts:62-69` `[ruled: HEART-T260907-23]`). There are no
fractional tokens anywhere: `TOKEN_STEP = 1` (`src/content/showdown.ts:88-96`)
and `formatTokens()` rounds to a whole number, so nothing renders a half
glyph.
Cheap phrase-rule detectors in `detectors.ts` (assertion markers, ownership
prefixes, trait words) provide a local pre-check the composer can use before
anything is sent to the model; per `detectors.ts:1-7` these are not
authoritative, "the coach's authored feedback... [is] what the player
actually reads."

**Attention pulse (`cta-pulse`).** A shared `@keyframes cta-pulse` in
`styles.css:2033-2036` animates a box-shadow ring (colour set per element via
the `--cta-ring` custom property) over 2.4s ease-in-out, alternating, forever
while the element stays in that state; it never changes size or position, only
the ring, so it cannot retrigger the composer/thread resize loop
(`styles.css:2020-2029`). Two live uses: `.rail-card.is-live`, ring colour is
that card's own `--card` colour, so the pulse also names which foul it is
(`styles.css:2038-2041`); and `.rail-pass` (the let-it-stand row), same
animation offset by `animation-delay: -1.2s` (half a period) so the tray reads
as breathing rather than strobing as one block (`styles.css:2043-2052`). Both
stop the instant the state that earns them ends (a call is no longer open).
`prefers-reduced-motion: reduce` drops the animation but keeps the ring at
full strength rather than removing the cue outright (`styles.css:2054-2060`).
This is the code's implementation of Steve's standing rule to draw attention
with de-contrasting plus a gentle flicker, or a call-to-action colour unique
on the screen.

**Token award (the flight animation).** `Header.tsx`'s `fly()` function moves a
single 🙏 glyph between the two purse elements using the Web Animations API
over `FLIGHT_MS = 1500`ms, from the near edge of the sending stack to the near
edge of the receiving one (shortest hop, not edge-to-edge across the full
purse width, per an explicit 2026-08-25 correction quoted in-code). The purses
underneath have already re-rendered with the new counts before the animation
starts; the flight is decorative only, layered via a `position: fixed` element
appended to `document.body` so no ancestor can clip it.

**Role flip.** I found no code, string, or component named "role flip" or
similar anywhere in the tree. `GAP: what does "role flip" refer to in the
printed game (which player becomes the summarizer vs. the speaker each turn?
a physical token or card that changes hands?), and does the web trainer have
an equivalent? Turn order in the showdown script (`content/showdown.ts` TURNS)
does alternate speak/summarize and alternates who opens each round, which may
be the mechanic this refers to, but I could not confirm the mapping without
a definition of the term.`

## 8. Accessibility

Present: `RuleCards.tsx`'s rail has `role="group"` with an `aria-label`; the
purses have `aria-label` reporting the full token count in words
(`Header.tsx`); decorative icons are consistently `aria-hidden="true"`; three
separate `@media (prefers-reduced-motion: reduce)` blocks exist in
`styles.css` (lines 402, 1164, 1521, 1746 by grep, one more than three, four
total). `[unratified: styles.css @media grep, Header.tsx, RuleCards.tsx]`

Missing or unconfirmed: no keyboard-navigation trace was done for the
Composer's chip-insertion or the avatar grid; no colour-contrast audit exists
in the repo that I found; the typewriter/blip combination in `Dialogue.tsx`
has no explicit skip-to-end control beyond "click anywhere on the box," which
is not labelled for assistive tech. `GAP: has a full accessibility pass been
done against WCAG for Dialogue.tsx's typewriter effect and Composer.tsx's chip
interactions, or is the current aria coverage the extent of it?`

## 9. Responsive behavior

Three width-based breakpoints exist in `styles.css`: `max-width: 30rem`
(`:274`), `max-width: 34rem` (`:406`), `max-width: 40rem` (`:574`). I did not
individually verify what each breakpoint changes for this pass.
`[unratified: styles.css:274,406,574; content of each block not audited]`
`GAP: is there a documented minimum supported viewport width, and has the app
been tested on an actual phone width rather than just these three CSS
breakpoints?`

## 10. Design assets not in this repo (request from Steve by name)

- **Figma file "Rebrand version (design guide)"** (`2GqlP9hw14XlKR8NGhijMH`),
  full seat, `steve@becise.com`. Holds the design-guide token source Figma
  scraping was based on. A cloner cannot open this; it must be requested from
  Steve by name.
- **Figma file "Pointtaken_fall"** (`OKdy4FHAhSg746KjqgHWwC`). Referenced as
  the source of the game-board and rule-card overlay screenshots in
  `figma-scrape-summary.md`; this is Brain's cross-cutting product Figma file,
  named here only because HT's own scrape drew reference screenshots from it.
- **`docs/reference/design-system/design-tokens.json`** and
  **`component-geometry.json`**: physically present in this repo tree per the
  design-system README, but I did not read either for this document (see
  section 1's GAP on reconciliation with `styles.css`). Not an external asset,
  but flagged here since a coding agent should know they exist before treating
  `styles.css` as the only token source.
- **`fonts/Anton-Regular.ttf`, `NotoSans-Bold.ttf`, `NotoSans-Regular.ttf`**:
  physically present under `docs/reference/design-system/fonts/`, per the
  design-system README, but not wired into the game's build; the live app uses
  neither face (see section 11).
- **Original PT Instructions.pdf** (`docs/mechanics/Instructions.pdf`, per
  `visual-design-spec.md:4`): the print rulebook the original design spec was
  built from. I did not locate or open this file for this document; treat it
  as unconfirmed to exist at that path in the current repo layout.
  `GAP: confirm current location of the source Instructions.pdf, if it still
  exists in this repo.`

## 11. Known gaps between Figma, the print deck, and the code

- `visual-design-spec.md` (dated 2026-05-23) documents an entirely different,
  older mechanic scheme: a BUZZER/TAP naming pair with six numbered fouls
  (F1-F6: Motive-Reading, Character Collapse, Motive Interrogation, Emotional
  Attribution, Epistemic Monopoly, Bulldoze). None of this matches the
  shipped three-foul scheme (Judging, Opinions as Facts, Fake Listening). This
  spec describes an earlier iteration of the game and should not be treated as
  current without confirming with Steve which mechanic scheme is live.
- The same spec prescribes Twemoji-CDN SVG icons for every glyph
  (`visual-design-spec.md:70-77`). The shipped app renders native platform
  emoji directly, no CDN, no Twemoji. `figma-scrape-summary.md:220` separately
  confirms "Apple Color Emoji, native emoji rendering" was the actual Figma
  finding, contradicting the older spec's own Twemoji recommendation.
- Font stack disagreement across three sources: `visual-design-spec.md`
  prescribes Anton + Nunito; `figma-scrape-summary.md:23-26` corrects body text
  to Noto Sans, calling Nunito an "earlier" and now-wrong value; the shipped
  `styles.css` uses neither, an Impact/Haettenschweiler condensed stack for
  headings and a plain serif stack for body (section 2 above). Three
  documented answers, three different fonts, one of which is what actually
  renders.
- `card-anatomy.md:58-59` and `:161-162` state the printed sheet shows two
  columns of **six** pray-hands token cutouts. The game's actual token economy
  starts each side at **seven** (`content/showdown.ts:22`). This print-side
  undercount is a known, already-tracked error (HEART-T260827-04 per the task
  brief that commissioned this document); it is noted here only to confirm the
  web code does not repeat it: the web purse starts at seven, correctly.
- Per-foul colour coding on the rail (`content/cards.ts:262-266`) has no basis
  in either design-system doc or the print deck, both of which describe an
  uncoloured, single-tier card set. This is an app-only addition; see section
  5 for the caveat on why it's not marked `[vibecoded]` outright.
- The design-system README (`README.md:56`) records `export/generate-pptx.js`
  as still carrying a TODO to wire its color constants to
  `design-tokens.json`, unresolved as of the README's last verification. This
  is a print-pipeline gap, not a web-app gap, but it means the JSON token file
  is not yet authoritative for print either.
