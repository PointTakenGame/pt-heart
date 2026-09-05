// Exports every authored line of the game, in play order, to a markdown file
// Steve can read as prose without playing it. HEART-T260824-30.
//
// This script imports the real content modules rather than transcribing them,
// so the export can never drift from what the game actually says: if a line
// changes in src/content/, the next run picks it up automatically. Run with
// `npm run export:script` (or `npx tsx scripts/export-script.ts`).
//
// The switch statements below are written to be exhaustive over Step['kind'].
// If a new step kind is ever added to src/types.ts, TypeScript will fail this
// file at the `never` check rather than silently skipping the new content,
// which is the whole point of an export whose promise is "nothing authored
// is dropped".

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Beat, LevelDef, Step } from '../src/types.ts';
import { level1 } from '../src/content/level1.ts';
import { level2 } from '../src/content/level2.ts';
import { level3 } from '../src/content/level3.ts';
import { CARDS, CARD_ORDER } from '../src/content/cards.ts';
import {
  TURNS,
  COACH,
  OPENING,
  TOPICS,
  SOFIA_THIN,
  RULE_LABEL,
  RULE_GLOSS,
  SHOWDOWN_SLUG,
  foulCost,
  START_TOKENS,
} from '../src/content/showdown.ts';
import type { FoulType } from '../src/types.ts';

// Levels 1 to 3, in play order. index.ts's LEVELS array is the same list; it is
// not imported here because the task calls for importing each level module by
// its named export, and there is no level4.ts (the showdown is data-driven, not
// a LevelDef, which is why it gets its own final section below).
const LEVELS: LevelDef[] = [level1, level2, level3];

const lines: string[] = [];

function push(...text: string[]): void {
  lines.push(...text);
}

function blank(): void {
  lines.push('');
}

/** Renders authored text as a blockquote, splitting on internal newlines
 *  because a blockquote only continues line by line if every line carries
 *  its own `>`. No authored line in this game currently contains one, but a
 *  future one might. */
function quote(text: string, prefixLabel?: string): void {
  const body = prefixLabel ? `**${prefixLabel}:** ${text}` : text;
  for (const line of body.split('\n')) {
    push(`> ${line}`);
  }
}

function speakerLabel(lane: 'coach' | 'opponent', speaker?: string): string {
  if (speaker) return speaker;
  return lane === 'coach' ? 'Coach' : 'Opponent';
}

/** Prints the full rule card, since a `card` step is the moment that card's
 *  entire printed text (the what, the tell, every bad/fix delta, the fix
 *  line) lands in front of the player. Reducing it to "which card was dealt"
 *  would drop the most-repeated authored text in the whole game. */
function renderCardStep(rule: FoulType): void {
  const card = CARDS[rule];
  push(`**Card dealt: ${card.emoji} ${card.name}** (costs ${card.cost})`);
  blank();
  push(`- **What it is:** ${card.what}`);
  push(`- **The tell:** ${card.tell}`);
  push(`- **The fix:** ${card.fix}`);
  blank();
  push(`  | Bad | Fix |`);
  push(`  |---|---|`);
  for (const delta of card.deltas) {
    push(`  | ${delta.bad} | ${delta.fix} |`);
  }
}

function renderStep(step: Step): void {
  switch (step.kind) {
    case 'say': {
      const label = speakerLabel(step.lane, step.speaker);
      const tags: string[] = [];
      if (step.isSpecimen) tags.push('specimen line');
      if (step.isTake) tags.push('a take, not a foul');
      // Tags fold into the same bold label rather than trailing on their own
      // line: a line starting without a leading ">" right after a blockquote
      // gets swallowed into it as a lazy continuation in CommonMark, which
      // would silently merge the tag into the spoken text instead of marking
      // it as metadata.
      const labelWithTags = tags.length ? `${label} (${tags.join(', ')})` : label;
      quote(step.text, labelWithTags);
      blank();
      break;
    }

    case 'card': {
      renderCardStep(step.rule);
      blank();
      break;
    }

    case 'call_or_pass': {
      const label = speakerLabel(step.lane, step.speaker);
      push(`**Call or pass** _(id: ${step.id}, card: ${RULE_LABEL[step.rule]})_`);
      blank();
      quote(step.line, label);
      blank();
      push(`- **Correct call:** ${step.expected === 'foul' ? 'Foul, call it' : 'Clean, pass'}`);
      push(`- **If the player calls it:** ${step.onCall}`);
      push(`- **If the player passes:** ${step.onPass}`);
      blank();
      break;
    }

    case 'sort': {
      // The engine always speaks a sort step's `line` from the coach lane
      // (src/engine.ts, case 'sort'), even though the interface itself
      // carries no lane field, so the label below is not a guess.
      push(`**Sort** _(id: ${step.id}, card: ${RULE_LABEL[step.rule]})_`);
      blank();
      quote(step.line, 'Coach');
      blank();
      push(`- **Expected answer:** ${step.expected}`);
      push('- **Options and feedback:**');
      for (const option of step.options) {
        const isExpected = option.value === step.expected ? ' (correct)' : '';
        const feedback = step.feedback[option.value] ?? '_(no feedback authored for this option)_';
        push(`  - **${option.label}**${isExpected}: ${feedback}`);
      }
      blank();
      break;
    }

    case 'edit': {
      push(`**Edit** _(id: ${step.id}, card: ${RULE_LABEL[step.rule]})_`);
      blank();
      quote(step.ask, 'Coach');
      blank();
      push(`- **Prefill the player edits:** "${step.prefill}"`);
      push(`- **Chips offered:** ${step.chips.map((c) => `"${c}"`).join(', ')}`);
      push(`- **What counts as fixed:** ${step.target}`);
      push(`- **Fallback shown on failure:** ${step.fallback}`);
      blank();
      break;
    }

    case 'free': {
      push(`**Free response** _(id: ${step.id}, card: ${RULE_LABEL[step.rule]})_`);
      blank();
      if (step.ask) quote(step.ask, 'Coach');
      push(`- **Placeholder:** "${step.placeholder}"`);
      push(`- **Chips offered:** ${step.chips.map((c) => `"${c}"`).join(', ')}`);
      push(`- **Captured as:** \`${step.capture}\` (referenced later by \`model\` steps)`);
      blank();
      break;
    }

    case 'model': {
      push(`**Model call** _(id: ${step.id}, task: ${step.task})_`);
      blank();
      quote(step.lead, 'Coach');
      blank();
      push(`- **Restates the player's free text captured as:** \`${step.from}\``);
      push(`- **Fallback if the model is unreachable:** ${step.fallback}`);
      blank();
      break;
    }

    case 'continue': {
      push(`**[Continue button: "${step.label}"]**`);
      blank();
      break;
    }

    case 'confirm': {
      const label = speakerLabel(step.lane, step.speaker);
      push(`**Confirm** _(id: ${step.id}, card: ${RULE_LABEL[step.rule]})_`);
      blank();
      quote(step.ask, label);
      blank();
      push(`- **Yes button:** "${step.yesLabel ?? 'Yes, that one landed on me'}"`);
      push(`- **No button:** "${step.noLabel ?? 'No, I am fine with it'}"`);
      push(
        `- **Note box placeholder:** "${step.placeholder ?? 'Say it in your own words, if you want to'}" (never required)`,
      );
      push(`- **If they say yes:** ${step.onYes}`);
      push(`- **If they say no:** ${step.onNo}`);
      push(
        `- **Token:** ${
          step.pays
            ? `${step.pays === 'player' ? 'the player' : 'the opponent'} pays ${CARDS[step.rule].cost} on a yes`
            : 'nothing moves either way'
        }. A no is always free.`,
      );
      blank();
      break;
    }

    case 'template': {
      push(`**Template** _(id: ${step.id}, card: ${RULE_LABEL[step.rule]})_`);
      blank();
      if (step.ask) {
        quote(step.ask, 'Coach');
        blank();
      }
      // The frame is the teaching here, so it is printed as the player sees
      // it: authored words as words, and each blank as its placeholder.
      push(
        `- **The frame:** ${step.segments
          .map((seg) => ('text' in seg ? seg.text : `[${seg.input.placeholder}]`))
          .join('')}`,
      );
      if (step.reply) push(`- **What the coach says back:** ${step.reply}`);
      blank();
      break;
    }

    default: {
      // Exhaustiveness guard: if src/types.ts grows a new Step variant, this
      // line fails to compile rather than letting new authored text pass
      // through unrendered.
      const _exhaustive: never = step;
      throw new Error(`Unhandled step kind: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function renderBeat(beat: Beat): void {
  const bossTag = beat.boss ? ' (boss fight)' : '';
  push(`### ${beat.name}${bossTag}`);
  blank();
  for (const step of beat.steps) {
    renderStep(step);
  }
}

function renderLevel(level: LevelDef, index: number): void {
  push(`## Level ${index + 1}: ${level.title}`);
  blank();
  push(`- **Slug:** \`${level.slug}\``);
  push(`- **Teaches:** ${level.teaches}`);
  push(`- **Card:** ${RULE_LABEL[level.rule]}`);
  push(`- **Boss:** ${level.bossEmoji} ${level.boss}`);
  push(`- **Boss epithet:** ${level.bossEpithet}`);
  blank();
  for (const beat of level.beats) {
    renderBeat(beat);
  }
}

function renderShowdown(): void {
  push(`## Level 4: The Showdown (Slippery Sofia)`);
  blank();
  push(`- **Slug:** \`${SHOWDOWN_SLUG}\``);
  push(`- **Starting tokens per side:** ${START_TOKENS}. Tokens are always whole; a missed call moves nothing (the offendee simply keeps the token the whistle would have taken).`);
  blank();

  push('### Card glossary (`RULE_LABEL` / `RULE_GLOSS` / cost)');
  blank();
  push('The one-line gloss the coach reads off when he rules a call, for all three cards:');
  blank();
  push('| Card | Gloss | Cost |');
  push('|---|---|---|');
  for (const rule of CARD_ORDER) {
    push(`| ${RULE_LABEL[rule]} | ${RULE_GLOSS[rule]} | ${foulCost(rule)} |`);
  }
  blank();

  push('### Opening prompt');
  blank();
  quote(OPENING.ask, 'Coach');
  blank();
  push(`- **Placeholder:** "${OPENING.placeholder}"`);
  push(`- **Topic chips:** ${TOPICS.map((t) => `"${t}"`).join(', ')}`);
  blank();

  push("### Coach's intro");
  blank();
  for (const line of COACH.intro) {
    quote(line, 'Coach');
    blank();
  }

  push("### Coach's other lines");
  blank();
  push(
    'Every other authored string on `COACH`, in the order it is defined. The ' +
      'function-valued ones are called here with a representative foul and cost ' +
      'so their wording is visible; in play the actual foul and cost vary by ' +
      'what happened at the table.',
  );
  blank();

  quote(COACH.callAsk, 'Rail hint while a call is open');
  blank();
  quote(COACH.onHit('judging', foulCost('judging')), "Player calls a real foul correctly (sample: Judging)");
  blank();
  quote(COACH.onFalseCall, 'Player calls a clean line (false call)');
  blank();
  quote(COACH.onMissed('opinion_as_fact'), 'Player lets a foul stand (sample: Opinions as Facts)');
  blank();
  quote(
    COACH.onWrongCard('judging', 'fake_listening'),
    'Player calls foul correctly but names the wrong card (sample: called Judging, it was Fake Listening)',
  );
  blank();
  quote(COACH.roundClean, "Round had nothing missed");
  blank();
  quote(COACH.onPlayerFoul('fake_listening', foulCost('fake_listening')), "Coach rules on the player's own foul (sample: Fake Listening)");
  blank();
  quote(COACH.onPlayerClean, "Coach rules the player's turn clean");
  blank();
  quote(COACH.ledger(5, 4), 'End-of-round ledger (sample: player 5, Sofia 4)');
  blank();
  quote(COACH.win, 'Match result: win');
  blank();
  quote(COACH.loss, 'Match result: loss');
  blank();
  quote(COACH.draw, 'Match result: draw');
  blank();

  push('### The turn order (`TURNS`)');
  blank();
  push('| Round | Actor | Kind | Foul | Coach intro | Fallback if the model is unreachable |');
  push('|---|---|---|---|---|---|');
  for (const turn of TURNS) {
    const foul = turn.foul ? RULE_LABEL[turn.foul] : 'none';
    const intro = turn.intro ? turn.intro.replace(/\|/g, '\\|') : '_(none)_';
    const fallback = turn.fallback ? turn.fallback.replace(/\|/g, '\\|') : '_(none, live turn has no fallback)_';
    push(`| ${turn.round} | ${turn.actor} | ${turn.kind} | ${foul} | ${intro} | ${fallback} |`);
  }
  blank();

  push('### `SOFIA_THIN`: what she says to a non-answer');
  blank();
  push('Walked in order, not picked at random (see the comment in showdown.ts on why).');
  blank();
  SOFIA_THIN.forEach((line, i) => {
    quote(line, `Sofia, attempt ${i + 1}`);
    blank();
  });

  push('### Reference: `CARD_ORDER`');
  blank();
  push(
    `Table order the cards sit in, left to right: ${CARD_ORDER.map((r) => RULE_LABEL[r]).join(', ')}. Full card text for each is printed the first time it is dealt, in the level sections above.`,
  );
  blank();
}

function main(): void {
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10);

  push('# Humility Showdown: full script export');
  blank();
  push(
    '_Generated file, do not hand-edit. Produced by `game/scripts/export-script.ts`, ' +
      `run on ${dateStamp}. It imports the live content modules under \`game/src/content/\`, ` +
      'so re-run it after any content change rather than editing this file directly:_',
  );
  blank();
  push('```');
  push('npm run export:script');
  push('```');
  blank();
  push(
    'Every authored line in the game is below, in play order: level 1 through 3 as ' +
      'the player experiences them beat by beat and step by step, then the level 4 ' +
      'showdown against Slippery Sofia.',
  );
  blank();
  push('---');
  blank();

  LEVELS.forEach((level, i) => renderLevel(level, i));
  push('---');
  blank();
  renderShowdown();

  const outPath = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../docs/design/game-script-export.md');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${lines.length} lines to ${outPath}`);
}

main();
