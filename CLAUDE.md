# CLAUDE.md — PT Heart / Humility Showdown

**This file is injected into every context window, including every post-compaction
one. Keep it small. Everything else lives in `docs/gym-rebuild/` and is read
just-in-time.**

The current job: **rebuild the gym level system, levels 1 through 5.** Branch
`NathanGymLadderRebuild`.

---

## How to work here

1. **One build step, one fresh chat.** The briefs are in `docs/gym-rebuild/steps/`.
   Read `CLAUDE.md` + your one step brief. **Do not read the other step briefs.**
2. **To find a defect, run the grep pattern in `docs/gym-rebuild/defects.md`.**
   Hits = still open. Empty = closed. That is the done-check.
3. **Open a file only when you are about to edit it.** No survey pass, no verifying
   line anchors up front — that habit burned three context windows.
4. `npm install` first in a fresh clone (`node_modules/` is not in the tree; a
   `tsc: command not found` means "no deps", not "broken code").
   **`npm run build` must pass before every commit.**
5. Commit regularly. Push to **`NathanGymLadderRebuild` — never to main.** Anything
   under `docs/` reaches main through a pull request, not a direct push.
   Commit messages end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
6. Update `docs/gym-rebuild/PROGRESS.md` in the same commit as each step.

## Where things are

| Path | What it is |
|---|---|
| `docs/gym-rebuild/steps/` | The eight build briefs. Your step, and only your step. |
| `docs/gym-rebuild/PROGRESS.md` | What is done, what is carried. Read first. |
| `docs/gym-rebuild/defects.md` | All 17 known defects as runnable grep commands. |
| `docs/gym-rebuild/code-map.md` | Orientation only. **Anchors go stale; the code is ground truth.** |
| `docs/gym-rebuild/ruling-index.md` | Condensed answers to all 32 design questions. |
| `docs/gym-rebuild/rulings.md` | Nathan's full rulings. Binding; wins over the index. |
| `docs/gym-rebuild/learner-findings.md` | The twelve playtest findings, condensed. |
| `docs/gym-rebuild/learner-report.md` | The full playtest report. Large. |
| `docs/soul.md` | Governs everything. Can veto a mechanic. |
| `docs/rules.md`, `roadmap.md`, `cards.md`, `script.md` | The rest of the record. Stale in places — step 8. |

**Precedence:** Nathan's rulings > `soul.md` > the other docs. **On what is true
today, the code outranks all of them.**

---

## The game

**Humility Showdown** (PT Heart in the docs). Print edition: three players — A and B
disagree, C referees and never argues. Online edition splits into **Gym** (solo, one
human against AI — all shipped code is here) and **Live play** (two humans, AI coach —
**none built, out of scope**).

**A round** (`rules.md` §5): A gives their view ("The way I see it is…") → B summarizes
("What I heard is [x]… did I miss anything?") → **A answers, and that answer is the
ground truth for Fake Listening** → roles switch and mirror. The summary is a gate,
not a courtesy.

**Three fouls only** (`FoulType`): `judging`, `opinion_as_fact`, `fake_listening`.

**Tokens:** 14 on the table, `START_TOKENS = 7` a side. A foul **moves** a token, never
burns one; purses always sum to 14. **No half tokens. No instant loss at zero. No
negatives. Judging costs 2.**

### The ruling that never moves — `soul.md` §6

> "Did I foul?" has exactly one correct answer: **did the other person feel fouled?**

Software never decides a foul happened. It flags a candidate cheaply, then routes the
call to the possibly-wronged human. **Do not improve the detector's precision.** False
positives are expected and collected — they are the corpus.

**Steve, on foul calls:** *"Ref OR offendee can suggest, 'offendee' always is the final
decider… always a text entry on that dialogue in case they want to say something."* So a
**confirm dialogue (yes / no / free text) is a core component in every level, both
seats**, with an authored no-API-key path.

---

## The ladder — ruled, seven levels, player-first

| # | Seat | Content | Slug | In scope? |
|---|---|---|---|---|
| 1 | player | Judging | `about-the-argument` | **yes** |
| 2 | player | Opinions as Facts | `my-opinion-not-a-fact` | **yes** |
| 3 | player | Fake Listening | `the-summary-gate` | **yes** |
| 4 | referee | full round, all three cards | `in-the-ref-seat` | **yes** |
| 5 | player | the Showdown — base game complete | `the-showdown` | **yes** |
| 6 | referee | the Final Showdown | — | deferred |
| 7 | player | the Final Showdown | — | deferred |

- **L1–L3 ignore the referee entirely** — the word, the role and the three-player
  structure are all withheld until L4.
- **L4 opens by telling the player they learn as ref first and play it themselves next.**
- The Final Showdown is an **add-on**. The game is complete without it.
- New slugs, because old saves must not collide. **Save by slug, never by number.**

---

## Non-negotiables

- **No modals, no toasts, no score popups, no confetti anywhere in the gym.** Feedback
  is the coach's words changing and nothing else.
- **No React StrictMode.** The beat runner is timed side effects; a double invoke emits
  every scripted line twice.
- **The whole game must be developable and testable with no API key.** Every
  model-backed line has an authored fallback (6s client / 5s server deadline).
- **No randomness anywhere**, except the avatar picker shuffle, which is presentation
  only. Two players comparing notes have to see one game.
- **Screen skin is fixed:** light striped ground, teal, orange, gold, Baloo 2 + Nunito.
  **No dark mode.**
- **`soul.md` gets exactly one edit this whole rebuild** — the Q7 carve-out, in step 2.
  Nothing else.
- **Restructure, don't rewrite.** Keep `cards.ts`, the coach's voice, the drill stepper,
  the thread, the rail.
- **"Foul" for the act, "card" for the object. Nothing else.**
- **Teach by delta** — never ship a bad example without its repair beside it.
- **The gym is open book.** The conversation scrolls; the player can read back.
- **Political balance is non-negotiable and currently in debt** (`HEART-T260823-33`).
  Each level file carries a balance-ledger comment; keep it accurate. Nathan reviews it
  in the PR.

## Stack

Vite 7, React 19.2, TypeScript 5.7 strict. One serverless function `api/coach.ts`
pinning `claude-haiku-4-5`. Dev port **5273**. **There are no tests** — `_driver.js` is a
gitignored local harness: `window.__mk(levelIndex, buttonAnswers, texts)`. Corpus export
via `Ctrl/Cmd+Shift+E` or `window.__export()`. Level gating is localStorage-trust only.
The GitHub MCP server is not authorized in these sessions — use the `gh` CLI for PRs, or
leave the PR to Nathan.

Doc status markers: `[ruled]` · `[unratified]` · `[vibecoded]` · `GAP:` (deliberately
blank — do not guess).
