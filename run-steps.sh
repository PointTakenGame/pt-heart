#!/usr/bin/env bash
# Drive the gym-rebuild step briefs, one fresh Claude session per step.
#
#   ./run-steps.sh            # next unfinished step through step 8
#   ./run-steps.sh 3          # step 3 only
#   ./run-steps.sh 3 6        # steps 3 through 6
#
# Each step runs in its own `claude -p` process, so each gets a clean context
# window — the same thing as opening a new chat, minus the typing. The loop
# stops the moment a step fails any of the four gates below, so a broken step
# never becomes the input to the next one.

set -uo pipefail
cd "$(dirname "$0")" || exit 1

STEPS_DIR="docs/gym-rebuild/steps"
PROGRESS="docs/gym-rebuild/PROGRESS.md"
LOG_DIR=".rebuild-runs"
BRANCH="NathanGymLadderRebuild"
BUDGET="${BUDGET_USD:-15}"

mkdir -p "$LOG_DIR"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
fail() { printf '\033[31m** %s\033[0m\n' "$*" >&2; }
ok()   { printf '\033[32mok  %s\033[0m\n' "$*"; }

# --- guard: the spawned CLI can actually talk to Anthropic ---------------------
# The Claude Code desktop app authenticates its own sessions through the host and
# leaves no credential behind for a `claude` you start yourself, so the CLI in
# this terminal may well be logged out even though the app is running. Check up
# front instead of discovering it a step at a time.
if ! claude auth status 2>/dev/null | grep -q '"loggedIn": *true'; then
  fail "the claude CLI is not logged in - run 'claude auth login' in Terminal first"
  echo "    (a browser window opens; the app's own login does not carry over)" >&2
  exit 1
fi

# --- guard: right branch, clean tree ------------------------------------------
here=$(git rev-parse --abbrev-ref HEAD)
if [ "$here" != "$BRANCH" ]; then
  fail "on branch '$here', expected '$BRANCH'"; exit 1
fi
if [ -n "$(git status --porcelain -- src docs api 2>/dev/null)" ]; then
  fail "uncommitted changes in src/ docs/ api/ - commit or stash first"
  git status --short -- src docs api; exit 1
fi

# --- which steps ---------------------------------------------------------------
first="${1:-}"
if [ -z "$first" ]; then
  first=$(awk -F'|' '/^\| *[1-8] *\|/ && /not started/ {gsub(/ /,"",$2); print $2; exit}' "$PROGRESS")
  if [ -z "$first" ]; then ok "every step is already done"; exit 0; fi
fi
last="${2:-8}"

# `seq 6 3` counts down, which would run the briefs in reverse and quietly wreck
# the carried state. Refuse instead of guessing what was meant.
if [ "$last" -lt "$first" ]; then
  fail "last step ($last) is before first step ($first)"; exit 1
fi

bold "Running steps $first..$last on $BRANCH"
echo

for n in $(seq "$first" "$last"); do
  brief="$STEPS_DIR/step-$n.md"
  [ -f "$brief" ] || { fail "no brief at $brief"; exit 1; }

  # The prompt is the blockquote under '## Prompt' in the brief itself, so each
  # brief stays the single source of truth for how its own step is started.
  prompt=$(awk '/^## Prompt/{f=1;next} f&&/^## /{exit} f&&/^>/{sub(/^> ?/,"");print}' "$brief")
  [ -n "$prompt" ] || { fail "step $n has no '## Prompt' blockquote"; exit 1; }

  # Carried state has grown load-bearing, and nothing else in this run will tell
  # the session what the last step decided. Make PROGRESS.md explicit, and make
  # the finish line explicit too - gate 4 below checks for exactly this.
  prompt="$prompt

Read docs/gym-rebuild/PROGRESS.md before the brief; its Carried state section is
binding. Finish by running npm run build, updating PROGRESS.md (flip step $n to
**done**, rewrite Carried state for the next step), and committing everything in
one commit. Do not push.

Nathan, 2026-09-05: this round is committed and pushed but NOT pull-requested.
If your brief tells you to open a PR, skip it and say so in your summary - he
pushes and handles the PR himself. If your brief tells you to spawn playtest
agents, skip that too: the playtest runs separately, against a local dev server,
from the session that started you."

  before=$(git rev-parse HEAD)
  log="$LOG_DIR/step-$n.log"

  bold "-- step $n ---------------------------------------------"
  echo "$prompt" | sed 's/^/    /'
  echo "    log: $log"
  echo

  # Started from the app's own terminal, the child would inherit that session's
  # harness variables and think it is a nested app session. Give it a plain
  # environment so it behaves like the standalone CLI it is.
  env -u CLAUDECODE -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_CODE_ENTRYPOINT \
      -u CLAUDE_CODE_SESSION_ID -u CLAUDE_CODE_HOST_SESSION_ID \
      -u CLAUDE_CODE_MESSAGING_SOCKET -u CLAUDE_CODE_MESSAGING_TOKEN \
      -u CLAUDE_CODE_SDK_HAS_HOST_AUTH_REFRESH -u CLAUDE_CODE_SDK_HAS_OAUTH_REFRESH \
      -u CLAUDE_CODE_OAUTH_SCOPES -u CLAUDE_AGENT_SDK_VERSION \
  claude -p "$prompt" \
    --permission-mode bypassPermissions \
    --max-budget-usd "$BUDGET" \
    --name "gym-rebuild step $n" \
    2>&1 | tee "$log"
  rc=${PIPESTATUS[0]}

  echo
  if [ "$rc" -ne 0 ]; then
    fail "step $n: claude exited $rc - see $log"; exit 1
  fi

  # Gate 1: the build compiles.
  if ! npm run build >"$LOG_DIR/step-$n.build.log" 2>&1; then
    fail "step $n: npm run build failed - see $LOG_DIR/step-$n.build.log"
    tail -25 "$LOG_DIR/step-$n.build.log"; exit 1
  fi

  # Gate 2: something was actually committed.
  if [ "$(git rev-parse HEAD)" = "$before" ]; then
    fail "step $n: no commit landed - the step did not finish"; exit 1
  fi

  # Gate 3: nothing left uncommitted.
  if [ -n "$(git status --porcelain -- src docs api)" ]; then
    fail "step $n: left uncommitted changes behind"
    git status --short -- src docs api; exit 1
  fi

  # Gate 4: the step marked itself done in PROGRESS.md. This is the one that
  # catches a session that stopped early but still committed partial work.
  if ! grep -qE "^\| *$n *\|.*\*\*done\*\*" "$PROGRESS"; then
    fail "step $n: PROGRESS.md still does not show it done"
    grep -E "^\| *$n *\|" "$PROGRESS"; exit 1
  fi

  ok "step $n complete - $(git log --oneline -1)"
  echo
done

bold "Steps $first..$last done. Push when you have read the diff:"
echo "    git push origin $BRANCH"
