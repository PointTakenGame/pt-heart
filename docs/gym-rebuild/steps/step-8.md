# Step 8 — Doc reconciliation and the PR

## Prompt

> Read `CLAUDE.md`, then `docs/gym-rebuild/steps/step-8.md`. Do step 8 only. Do not
> read the other step briefs. Open a doc only when you are about to edit it.

## Goal

**Q30: the docs update in the same PR as the code.** Nathan's directions override
`rules.md` and the other docs freely.

⚠️ **`soul.md` gets exactly one change in this whole rebuild — the Q7 carve-out, added
back in step 2. Do not touch it again.**

## Do

### 1 — The ladder is seven levels, not six

```bash
grep -n "six levels\|Six levels\|six-level" docs/rules.md docs/roadmap.md
```

7 sites as of 2026-09-04: `docs/roadmap.md:251,255,257,269,318,446`, `docs/rules.md:219`.
`rules.md:219`'s boss-names line is stale too.

The ruled ladder — player-first, seven levels, levels 6 and 7 deferred:

| # | Seat | Content |
|---|---|---|
| 1 | player | Judging |
| 2 | player | Opinions as Facts |
| 3 | player | Fake Listening |
| 4 | referee | full round, all three cards |
| 5 | player | the Showdown — base game complete |
| 6 | referee | the Final Showdown *(deferred)* |
| 7 | player | the Final Showdown *(deferred)* |

**The Final Showdown is an add-on. The game is complete and playable without it.**

### 2 — Half tokens, instant loss, and the forgetful thread

```bash
grep -rn "half a token\|half token\|instant loss\|forget" docs/rules.md docs/roadmap.md docs/script.md
```

7 sites: `rules.md:201,206,214,220`, `roadmap.md:41`, `script.md:98,285`. Three
corrections live in there — half-token misses (dead under Q9), instant loss at zero
(dead under Q11), and **the claim that the thread's forgetfulness is load-bearing for
Fake Listening (dead under Q23, open book)**.

`rules.md` §9 also still describes half-token misses, instant loss, and attempt ceilings.

⚠️ **`rules.md:206` and `:220` cite `game/src/showdown.ts:56` and
`game/src/showdown.ts:399-422`. The `game/` prefix no longer exists.** De-line these —
cite the file, not the line.

### 3 — Refresh this folder

Update `docs/gym-rebuild/PROGRESS.md` to say the build is done, and add a note at the
top of `code-map.md` saying its anchors are now stale post-rebuild.

## Then

`npm run build`, commit, push to **`NathanGymLadderRebuild`** — **never to main.
Anything under `docs/` reaches main through a pull request, not a direct push.**

Open the PR with `gh` (the GitHub MCP server is not authorized in these sessions), or
leave it to Nathan. PR description ends with:

`🤖 Generated with [Claude Code](https://claude.com/claude-code)`

**In the PR, call out the political-balance ledger explicitly — Nathan reviews it there
(Q29), and it is currently in debt (`HEART-T260823-33`).**

## Then, playtest

Spawn several **Fable** agents to play the levels cold and report bugs and feedback.
**"Fable" is a model, not an agent type** — spawn with `Agent`, `model: "fable"`,
`subagent_type: "general-purpose"`, `run_in_background: true`. Fix bugs immediately;
report the feedback to Nathan.

## Commit

`docs: reconcile rules, roadmap and script with the seven-level ladder`
