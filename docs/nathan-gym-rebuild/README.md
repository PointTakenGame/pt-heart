# Nathan's gym-ladder rebuild: archived working papers

**Nothing in this folder is normative. Do not implement from it.**

Everything else under `docs/` is a specification: present tense, current, and
binding. This folder is the exception and it is the only one. These 19 files are
Nathan's working papers from the gym-ladder rebuild he ran on the branch
`NathanGymLadderRebuild` between 2026-09-01 and 2026-09-05. They were copied here
verbatim on 2026-09-07, unedited, from the annotated tag
`archive/nathan-gym-ladder-rebuild`, at the moment that branch was deleted.

They describe a build on a different engine that `main` did not merge. `main`
re-implemented the rulings it accepted on its own code. So a passage here that
contradicts the shipped code is not a bug report; it is history. The shipped code
and the rest of `docs/` win, every time, without discussion.

## Why they are here at all

They are cited constantly. Every "Nathan ruling N" in a source comment on `main`
points into `rulings.md`, and every "playtest finding N" points into
`learner-report.md`. Until now those citations pointed at a git tag, which meant
that reading a comment in `showdown.ts` required knowing that a deleted branch
had been tagged. That was a bad trade and this folder is the fix.

## What is worth your time

Two files carry live value:

- **`rulings.md`** and **`ruling-index.md`** are the master ledger of the 32
  questions Nathan put to Steve and the answers. This is the clearest single
  record of *why* several current mechanics exist, including several that no
  longer look the way this file says they do. `ruling-index.md` is the condensed
  version and is the better entry point.

The rest is process residue, kept for archaeology rather than reference:

- `learner-brief.md`, `learner-findings.md`, `learner-report.md` are the
  five-persona playtest from 2026-09-04. `learner-report.md` is the substantial
  one and is still worth reading once; its central finding, that the best
  definitions of the three fouls were buried on a screen designed to be skipped
  in three seconds, has not been fully acted on.
- `defects.md` is a bug list against the abandoned engine. Its open/closed marks
  refer to that branch, not to `main`.
- `walkthrough.md` is explicitly stale: it describes the pre-rebuild four-level
  ladder, the old level titles, and timer badges that do not exist in any build.
- `PROGRESS.md`, `code-map.md` and `steps/` are the build log and the step briefs
  that produced it. `code-map.md` says of itself that it is orientation only and
  that the code is ground truth. It was right when it was written and it is more
  right now.

## Three files that were left behind on the tag

The branch also carried a `CLAUDE.md` (Nathan's own agent instructions, which
would conflict with this repo's), `run-steps.sh` (his build harness, which points
at paths that do not exist here), and `src/content/level4.ts` (content written
against the engine `main` does not run). None of the three would do anything but
mislead a reader here. They are on the tag if you want them:

```bash
git show archive/nathan-gym-ladder-rebuild:run-steps.sh
```

## What has and has not been harvested

A full audit ran on 2026-09-07 comparing every ruling, finding and defect in this
folder against what `main` actually shipped. The short version:

- The rulings that reached Steve were argued and either shipped or explicitly
  rejected, and `main`'s source names Nathan and the date at each site.
- Four things had not been built at audit time. The end-of-level review screen is
  the one a player would notice: Nathan's gym loop ended each level with a recap
  and `main` has no such screen, so a cleared level drops the player straight back
  to the ladder with no closure. It is tracked as `HEART-T260907-22`. The other
  three are the summary-coverage check (nothing verifies that a player's summary
  actually covered the other side), and the referee-seat and Final Showdown specs,
  which are unbuilt because those rungs are deliberately frozen.
- Two ruling conflicts were resolved the same day the audit ran, both in Nathan's
  favour: half tokens are gone with the miss price that created them, and a purse
  at zero no longer ends a gym rung.

The reason the review screen was missed is worth writing down, because it is a
class of miss and not bad luck. The harvest compared `rulings.md` against `main`
ruling by ruling. The review screen is not a ruling; it is a component in his
`App.tsx` that no ruling names. A ruling-by-ruling sweep cannot see it. Anything
harvested from a branch in future needs a component-level pass as well as a
ruling-level one.
