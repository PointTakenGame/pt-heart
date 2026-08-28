---
slot: cards.md
game: heart
purpose: Physical and content spec for the Humility Showdown card deck, for a print vendor and for the web edition's card renderer.
written: 2026-08-28 by biz
status: draft, unreviewed by Steve
sources:
  - docs/reference/print/v7/deck-content-v7.md
  - docs/reference/print/v7/card-anatomy.md
  - docs/design/scenario-cards.md
  - docs/design/buzzer-tap-card-v2.md
  - docs/reference/design-system/visual-design-spec.md
  - game/src/content/cards.ts
  - game/src/content/showdown.ts
  - game/src/content/index.ts
  - game/src/ui/RuleCards.tsx
  - game/src/ui/BossIntro.tsx
  - game/src/types.ts
---

# Cards: Humility Showdown

This is the physical and content spec for Heart's card deck: what cards
exist, what is printed on each, the deck's full text, and where the print
masters live. Heart is a 3-player print/card game; this document does not
apply to Brain, which has no cards.

Status markers used throughout: `[ruled]` (Steve or a registry decision
established it), `[unratified]` (present in deck files or code but never
formally ruled, cited to `path/file:LINE`), `[vibecoded]` (invented in this
document, always labeled inline), and `GAP: <question>` (a value this
document refuses to invent).

## 1. Deck inventory

**Three cards** `[ruled]`, one per foul: Fake Listening, Judging, Opinions
as Facts. There is no fourth card. The physical deck is a 3-page export
(`PointTaken-HumilityShowdown_2026-08-19.pdf`, `.pptx`): page 1 is the
"how to play" rules sheet, page 2 is the Final Showdown Round sheet, page 3
holds the three foul cards plus a token-cutout panel. Only page 3's three
boxes are cards in the cut-and-handle sense; pages 1 and 2 are full-sheet
reference pages, not cards, though page 1 repeats compact summaries of the
same three fouls as small pill badges, not full cards
(`docs/reference/print/v7/card-anatomy.md:26`, corrected below).

Card order on page 3, left to right, top to bottom: Fake Listening
(top-left), Opinions as Facts (top-right), Judging (bottom-left), token
cutouts (bottom-right) `[ruled, deck-content-v7.md:479-481]`. Page 1's
summary row uses a different order: Fake Listening, Judging, Opinions as
Facts `[ruled, deck-content-v7.md:75-77]`. Neither order matches the web
edition's `CARD_ORDER` (section 11).

## 2. Card anatomy: zones

Each foul card is one slot-and-fill template, confirmed against
`card-anatomy.md` sections A, B, and E:

- **Header bar** (0-0.53in of card height, about 10.7%): emoji icon,
  eyebrow ("SUMMARIZATION FOUL" or "TONE FOUL"), title, penalty glyph
  (pray-hands repeated per token cost, an arrow, the two player tokens),
  and the penalty word (PENALTY or DOUBLE PENALTY).
- **Intro** (about 0.65-1.15in): one or two italic sentences stating the
  foul in plain language.
- **Optional secondary band**: present on Fake Listening and Opinions as
  Facts, absent on Judging. States the two-step procedure required to
  avoid or correct the foul.
- **Two-column block** (about 1.4-3.0in): left column always "SMOKE ALARM
  TERMS" (phrases that signal the foul is happening); right column is
  "BEFORE YOUR TURN" (Fake Listening), "REPHRASE AS" (Opinions as Facts),
  or "INSTEAD" (Judging).
- **Incorrect/correct example row** (about 3.2-4.4in): a wrong phrasing
  paired with a corrected one.
- **Trains footer band** (about 4.58-4.77in): one takeaway sentence under
  the eyebrow "Trains".

Card dimensions: 3.985 x 4.948in, aspect ratio 0.805:1 `[ruled,
card-anatomy.md section E]`. Corner radius is 0 (confirmed via `prstGeom
= rect`, not `roundRect`) `[ruled, card-anatomy.md section E]`. Border
0.01in, `#DDD8D0`. Header bar height 0.53in. Left/right content margin
approximately 3.4-3.6% of card width. Two-column split: 1.807in each
column (about 45.4% of card width) with an approximately 0.07in gutter.
Icon box approximately 0.44 x 0.51in at 28pt.

**Color: no per-foul coding.** All three cards share the identical header
orange `#D4520A`. Color in this deck encodes role, problem side
(`#FDF0E7` fill) versus solution side (`#E8F5F3`/`#EAF5F3` fill, a
near-duplicate pair, likely unintentional), not which foul is shown
`[ruled, card-anatomy.md section C]`. A print vendor or web builder must
not invent per-foul colors; the icon and title are what distinguish fouls.

Typography: card titles in Avenir Heavy, body/footer in Avenir Book,
worked examples in Avenir Book Oblique italic, with Arial used
inconsistently for the Fake Listening title only (the other two use
Avenir Heavy) `[ruled, card-anatomy.md section D]`. This title-font
inconsistency is a real deck quirk, not a spec to reproduce; see section
10.

## 3. Full deck text, card by card

Quoted verbatim, source punctuation preserved exactly (em dashes, en
dashes, curly quotes, trailing spaces, one non-breaking space noted where
it occurs). `[ruled, deck-content-v7.md]` for all text in this section.

### Fake Listening

Header: "SUMMARIZATION FOUL" / "Fake Listening" / "For each missing major
point" / 🙏→🧝‍♀️/🧝 / "PENALTY"

Intro: *"Before you respond: show you actually heard them, instead of
nodding, while loading your mic-drop rebuttal."*

Secondary band: "Two steps are required during the Summarize step: (1)
"What I heard is [...] "   →   (2) "Did I miss anything?""

Smoke alarm terms: "I hear you, but…" / "Sure, but my point is…" /
"Respectfully…" / "First of all…"

Before your turn: "**Both halves required** / 1. Generous summary: "What
I heard is [...] " / 2. "Did I miss anything?" **Thank** them for
corrections"

Incorrect: "I hear you, but [my opinion]"
Correct: "What I heard is [X] — did I miss anything?"

Trains: "Set a high bar for respectful listening."

### Opinions as Facts

Header: "TONE FOUL" / "Opinions as Facts" / 🙏→🧝‍♀️/🧝 / "PENALTY"

Side note: *"→ It doesn't matter if you are right. The point: keep anger
from rising"*

Intro: *"Don't state a contested opinion as fact  / Rule: 'Contested' =
other player* ***disagrees***"

Secondary band: "Two steps to (peacefully) state contested thoughts: (1)
"In my head, [opinion]"  →   (2) "– because [evidence]"" (this instance
uses an en dash; the correct-example instance below uses an em dash, and
both are verbatim, deck-internal inconsistency).

Smoke alarm terms: "Obviously…" / "Of course…" / "Everyone knows…" /
"It's a fact that…" / "X would cause Y…"

Rephrase as: "**Both halves required** / 1. "In my head, [opinion]" / "The
story I tell myself... / "The way I think is..." / "I feel like... " / 2.
"— because [evidence]""

Incorrect: "That policy would fail..." / "Obviously that's deeply
offensive"
Correct: "I feel like that policy would fail – because in the past..." /
"In my head, that felt offensive — because my experience..." (the first
correct line's dash is followed by a non-breaking space, the deck's only
one; the second is an ordinary space, verbatim).

Trains: "Be a role model for comfortable uncertainty."

### Judging

Header: "TONE FOUL" / "Judging" / 🙏🙏→🧝‍♀️/🧝 / "DOUBLE PENALTY"

Intro: *"Don't render a verdict on who they are, and don't tell them
what's in their head. The word '**You**' is a major red flag."*

No secondary band on this card.

Smoke alarm terms: "You're saying that because…" / "You only care
about…" / "You don't really believe that" / "You're an [X]-ist / -phobe"
/ "You're so [adjective]"

Instead: "Stick to reasoning, not personal attacks. Challenge their
argument, not their hidden motives."

Incorrect: "That's typical conservative / liberal thinking" / "You just
don't care about the poor"
Correct: "I noticed you cited [X] but skipped [Y]" / "I worry that policy
would be unfair to the poor"

Trains: "Critique the argument, not the person."

Note the deck's own incorrect-example choice here ("typical conservative
/ liberal thinking") already names both sides in one breath; it is
balanced as written and needs no counterpart.

## 4. Iconography

Foul emoji: Fake Listening 🙃, Judging 😒, Opinions as Facts 🧐 on page
1's summary row `[ruled, deck-content-v7.md:79-83]`. Player tokens in the
XML: Player A 🧝‍♀️, Player B 🧝, Referee 🧙. `GAP: the PDF substitutes
different rendered glyphs for these three codepoints (a font-substitution
export effect); the print vendor should be told the intended codepoints
and asked which glyph set the final print run should render, rather than
this document guessing.` Penalty glyph is pray-hands 🙏 repeated per token
cost, followed by an arrow and the recipient tokens, e.g. Judging's
🙏🙏→🧝‍♀️/🧝.

## 5. Token columns and scoring

Each player cuts one column of **one player token plus seven 🙏 tokens**
`[ruled, deck-content-v7.md:679-707, matching page 1's "TAKE x7"]`. This
corrects `card-anatomy.md`'s section A, which undercounts the cutout as
"six" pray-hands per column; seven is the ruled count, drawn independently
from both the token-cutout XML and the page 1 "x7" label.

Penalty economy: Judging costs 🙏🙏 (DOUBLE PENALTY), Opinions as Facts
costs 🙏 (PENALTY), Fake Listening costs 🙏 x1 per missing major point
(PENALTY scaled by count) `[ruled, deck-content-v7.md]`. A player who
hits zero tokens suffers an instant loss (🏳️). Whoever holds the most
tokens at the end wins; this win condition is stated identically for the
ordinary rounds and for the Final Showdown Round, so it is one continuous
scoring pool, not per-round scoring.

Final Showdown Round adds a second, separate rubric, the Referee scoring
table on page 2, three columns: "... follows the rules" (expected, no
🙏's), "... earns a humility bonus!" (🧝‍♀️←🧝, tokens flow to the
speaker), "... is Naughty" (🧝‍♀️→🧝, tokens flow away from the speaker).
This table is built from free-floating shapes rather than a real table in
the source XML, so its row/column assignment is a confident reconstruction
from shape position, not a structural read `[unratified reconstruction,
deck-content-v7.md:944-950]`.

## 6. Final Showdown Round: page 2, three steps

The instructions sit at the **top of page 2**, not page 1. This corrects
`card-anatomy.md` section A, which misattributes them to page 1
`[ruled, deck-content-v7.md:893-897]`.

"3 Steps (Start with Player A)":

1. "Give a Super-Summary": summarize the other player's view across what
   was learned in all 3 rounds. Bonus: add a novel point.
2. "Add what you learned": tell the other player what you learned. Bonus:
   admit where you changed your mind.
3. "Suggest why you two might still disagree": why might the other player
   think differently? Bonus: frame as positive value for the other
   player.

Each step has a worked example in the scoring table, all three built
around a shared student-loan-forgiveness scenario: a follows-the-rules
line, a humility-bonus line, and a naughty line (quoted in section 3's
sibling material and in `deck-content-v7.md` lines 332-389). After Player
A's three steps, roles switch and Player B runs the same three steps
("3 Steps... (Now Player B)"). "Next game: Swap Roles!" appears with no
further elaboration `GAP: what "Swap Roles" changes beyond the 🧝‍♀️↔🧙
icon swap, and how many games make a session, is not stated anywhere in
the deck.`

## 7. Sample topics and neutrality audit

Twelve prompts, in the deck's own row-major order (a real `graphicFrame`
table, structurally ordered) `[ruled, deck-content-v7.md:410-458]`:

1. Student loan debt for community college degrees should be forgiven.
2. Standardized tests for college should be eliminated due to unfairness
   / bias.
3. Individuals facing persecution should be allowed temporary asylum in
   my country.
4. Health insurance should be free for everyone.
5. A researcher who argues women have a genetic disadvantage in math
   should be allowed to present on a college campus.
6. A non-violent person who entered without documentation 20 years ago
   should be deported, even if it breaks up a family.
7. Sugary soda should be taxed for health effects, like cigarettes.
8. Athletes should join sports teams based on gender identity, not sex at
   birth.
9. The death penalty should be allowed for confident conviction of
   premeditated murder.
10. Cryptocurrency should be legal tender.
11. People should be allowed to own military-grade automatic weapons.
12. The AI industry should be substantially regulated.

**Neutrality audit** (my own reading, not a ruled classification): each
prompt is a proposition either player can be assigned to argue, so the
game itself asserts no position, but the stated "should" clause still
carries a valence. Items 1, 2, 3, 4, 7, 8, and 12 state the position more
commonly associated with the political left (debt forgiveness,
anti-testing, pro-asylum, universal health insurance, sin taxes,
trans-inclusive sports, AI regulation). Items 6, 9, and 11 state the
position more commonly associated with the political right (deportation
enforcement, the death penalty, gun rights). Items 5 and 10 cut across
the spectrum. That is 7 of 12 phrased toward the left against 3 toward
the right and 2 cross-cutting. **This is a real, reportable framing
imbalance**, softened somewhat by two facts: players swap who argues
which side across rounds, and the topic set as a whole spans hot-button
issues from across the spectrum. `docs/design/scenario-cards.md`, an
earlier, non-canonical design (section 10), self-flags comparable framing
difficulty on individual cards, so this tilt was recognized before,
without being resolved. `GAP: whether the sample-topic set's left-leaning
framing tilt was a deliberate choice or an oversight has no recorded
ruling.`

## 8. Print production: dimensions, bleed, color

Page canvas 8.5 x 11in (US Letter portrait), card 3.985 x 4.948in, 0
corner radius, 0.01in border in `#DDD8D0` `[ruled, card-anatomy.md
section E, cited in section 2 above]`. Full color hex table for header,
body, and accent colors: `[ruled, card-anatomy.md section C]`, headline
values `#D4520A` (header bars), `#0D1B2A` (top navy bar on pages 2-3, but
pure black `#000000` on page 1, an inconsistency flagged in
`card-anatomy.md` and not resolved).

`GAP: no bleed value is stated anywhere in the source PDF, PPTX, or
card-anatomy.md. Bleed, trim marks, and safe-area margins for an actual
print run are unverified and must not be invented; a print vendor needs
these specified fresh, not inferred from this document.`

`GAP: card stock, finish (matte/gloss), and print quantities are not
recorded anywhere in the reviewed sources. Any number here would be
invented and would cost real money if wrong; do not guess.`

## 9. Print masters not in this repo

The following files exist only at
`point-taken-heart/docs/reference/print/v7/` on this machine, a path
above the `game/` repo root that is never pushed. A coding agent working
from a clone of `game/` cannot open these; they must be requested from
Steve by name, not linked as if reachable.

- `PointTaken-HumilityShowdown_2026-08-19.pdf` (745,161 bytes): the
  3-page print-ready export, source of all text quoted in section 3.
- `PointTaken-HumilityShowdown_2026-08-19.pptx` (152,511 bytes): the
  editable source deck; its slide XML (`ppt/slides/slide1.xml` through
  `slide3.xml`) is the ground truth this document and `card-anatomy.md`
  were extracted from.
- `extracted/image1.png` through `image4.png` (2-3KB each): small
  rounded speech-bubble outline graphics on page 1's exchange diagram.
- `extracted/image5.png` (101,866 bytes): a larger embedded image, not
  individually described in any reviewed source; request from Steve.
- `extracted/_pptx_unzip/`: the unzipped PPTX package (including
  `theme1.xml`, confirmed unused by any text run, per `card-anatomy.md`
  section D), used for cross-checking XML against the render.

No binary content from any of these files is reproduced here.

## 10. Known art bugs

1. **Third foul card mislabeled singular on page 1's referee band.** The
   page 1 referee/foul-call band titles the third summary card "Opinion
   as Facts" (singular), while every other appearance in the deck,
   including the card's own page 3 title, reads "Opinions as Facts"
   (plural). Plural is correct; singular is a copy-paste slip
   `[ruled art bug, HEART-T260827-04, deck-content-v7.md:246-247]`.
2. **Referee band reuses one emoji where the summary row varies
   correctly.** Page 1's top summary row correctly uses 🙃 (Fake
   Listening) / 😒 (Judging) / 🧐 (Opinions as Facts). The referee
   foul-call band below it titles all three cards with 😒, including the
   Fake Listening and Opinions as Facts cards that should carry their own
   emoji `[ruled art bug, HEART-T260827-04, deck-content-v7.md:214-218,
   243-245]`.
3. **Fake Listening's card title breaks the shared font.** Judging and
   Opinions as Facts set their titles in Avenir Heavy; Fake Listening's
   title uses Arial instead `[unratified, card-anatomy.md section D and
   section G]`. This reads as an unintentional inconsistency, not a
   deliberate accent, and `card-anatomy.md` section F already recommends
   a web build not reproduce it.
4. **Page 1's top title bar is pure black, not navy.** Pages 2 and 3 use
   `#0D1B2A` for the top bar; page 1 uses `#000000` `[unratified,
   card-anatomy.md section A and section C]`.
5. **Footer copyright text color is inconsistent page to page.** `#A7A7A7`
   on page 1 versus `#DDDDDD` on page 3 `[unratified, card-anatomy.md
   section C]`.
6. **Two near-duplicate teal/green pairs suggest unintentional color
   drift** rather than a deliberate palette: `#0D9B8A` vs. `#46988A`, and
   `#E8F5F3` vs. `#EAF5F3` `[unratified, card-anatomy.md section C]`.

## 11. Divergence between the printed deck and the web edition

The web edition (`game/src/content/cards.ts`, `RuleCards.tsx`,
`showdown.ts`) reproduces printed card text with high fidelity, but
diverges in several concrete ways:

- **Dash removal.** The house no-em-dash rule strips the deck's own en
  and em dashes from three printed strings ("fail - because", "offensive
  - because", "[X] - did I miss anything?"), replaced with a comma or
  period, documented inline in `cards.ts` as deliberate.
- **Invented per-foul color.** `CARD_COLOR` assigns `judging` orange,
  `opinion_as_fact` purple, `fake_listening` teal, though print has no
  per-foul color (section 2). Self-documented in `RuleCards.tsx`: the
  printed header is "the same orange on all three cards"; the app's tint
  "survives only on the rail chips, where it is doing a job the paper
  game never had to do."
- **Card order.** `CARD_ORDER` is `judging`, `opinion_as_fact`,
  `fake_listening`, matching neither page 1's order (Fake Listening,
  Judging, Opinions as Facts) nor page 3's grid order (Fake Listening,
  Opinions as Facts, Judging).
- **Source citation split.** `cards.ts`'s top comment cites a v6 doc,
  `docs/reference/print/v6/humility-showdown-rules-summary.md`, for its
  interactive teaching fields, one version behind this document's v7
  source and outside this document's source list.
- **Half-token scoring.** `showdown.ts`'s `formatTokens()` implements a
  web-only half-token penalty (a missed foul costs half a token, per a
  2026-08-24 ruling cited in code). Printed tokens are always whole
  pray-hands; there is no half-token concept in print.
- **Reduced, milder topic set.** `showdown.ts`'s `TOPICS` lists three
  topics (student loan forgiveness, return to office mandates, nuclear
  power), commented "milder end of real public policy. Not immigration,
  not abortion," a narrower set than print's twelve Sample Topics
  (section 7), which include asylum, deportation, the death penalty, and
  gun ownership. Balance here is structural instead: Sofia always argues
  opposite whatever the player argued, so this web level's own topic and
  framing choices do not carry the same audit obligation as print's.
- **Web-only game structure absent from print entirely.** "Levels,"
  "boss fights," and "Slippery Sofia" (`index.ts`, `BossIntro.tsx`,
  `showdown.ts`) have no counterpart in print, which contains zero
  level/phase/boss/tier/stage/chapter vocabulary (verified by grep).
  Intentional web scaffolding, not a divergence to fix, but a coding
  agent must not assume print defines any of it.
- **Locked-card glyph.** The web rail shows 🔒 for cards not yet taught,
  a state with no printed equivalent.

Two documents in `docs/design/` (`scenario-cards.md`, a 20-card "CIVILITY
COMBAT" design, and `buzzer-tap-card-v2.md` plus
`docs/reference/design-system/visual-design-spec.md`, a six-foul
F1-F6/BUZZER-TAP system under the name "Humility Throwdown") describe an
earlier or alternate design that does not match the ratified three-foul
deck this document specifies, and `visual-design-spec.md` defines its own
color and font system dated 2026-05-23, before the v7 deck. A grep for
"buzzer" and "tap" in `game/src` turns up only incidental uses of "tap"
as a touch-input term, so nothing shipped implements that alternate
design.
