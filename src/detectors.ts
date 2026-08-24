// Pure phrase-rule detectors, carried over from app-v1 unchanged. They are the
// cheap first pass: a local hint the composer can use before anything is sent.
// In the MVP nothing behind them is automatic; the coach's authored feedback and,
// on Level 3 only, one model call are what the player actually reads.
//
// Known and deliberate: an ownership prefix does not clear a line, because
// "the story I'm telling myself is that it's obviously true" stacks an assertion
// marker behind the prefix. That case is Level 2 beat 3A item 3. Log new variants
// as attack patterns rather than patching the lists.

import type { FoulType } from './types.ts';

// Opinions-as-Facts: bare assertion markers that present opinion as settled fact.
export const ASSERTION_MARKERS = [
  'obviously',
  'clearly',
  "it's a fact",
  'it is a fact',
  'the fact is',
  'everyone knows',
  'everybody knows',
  'no one can deny',
  'undeniably',
  'the truth is',
  'plain and simple',
  'end of story',
  'without a doubt',
  'any reasonable person',
];

// Ownership prefixes that mark a claim as opinion (make it compliant on the
// phrase-rule). Note the backstop: these can be gamed by stacking an assertion
// marker after them, so a prefix does not automatically clear a message.
export const OWNERSHIP_PREFIXES = [
  'the story i',
  'the story im telling myself',
  'the story i am telling myself',
  'in my head',
  'in my experience',
  'i feel like',
  'i feel that',
  'my sense is',
  'it seems to me',
  'i think',
  'i believe',
  'to me,',
  'from where i sit',
];

// Judging: "you" plus a character or motive word (an attack on the person, not
// the argument). Cheap nomination only; the listener confirms whether it stung.
export const TRAIT_WORDS = [
  'lazy',
  'stupid',
  'ignorant',
  'selfish',
  'arrogant',
  'clueless',
  'dishonest',
  'childish',
  'ridiculous',
  'closed-minded',
  'closed minded',
  'naive',
  'stubborn',
  'immature',
  'irrational',
  'always',
  'never',
  'just want',
  'just trying to',
  'dont even care',
  "don't even care",
  'dont care',
  'only care',
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
}

export interface PhraseHit {
  foulType: FoulType;
  matched: string;
  reason: string;
}

// Returns the assertion marker(s) present, if any.
function findAssertionMarker(norm: string): string | null {
  for (const m of ASSERTION_MARKERS) {
    if (norm.includes(m.replace(/[’']/g, "'"))) return m;
  }
  return null;
}

function hasOwnershipPrefix(norm: string): boolean {
  return OWNERSHIP_PREFIXES.some((p) => norm.includes(p));
}

function hasBecause(norm: string): boolean {
  return /\bbecause\b|\bsince\b|\bso that\b/.test(norm);
}

// Opinions-as-Facts phrase check.
// Nothing here fires without an assertion marker. A bare declarative claim with
// no marker ("nuclear power is too dangerous") is let through, which is the
// larger half of this foul as the card defines it and is deliberately not
// caught: no phrase rule can tell a bare claim from a bare fact, so catching it
// needs the model. Whether to approximate it offline is HEART-T260823-47.
// The gamed case is caught: an ownership prefix stacked with an assertion
// marker (the backstop watch item from HEART-T260711-06).
export function detectOpinionAsFact(text: string): PhraseHit | null {
  const norm = normalize(text);
  const marker = findAssertionMarker(norm);
  const owned = hasOwnershipPrefix(norm);
  const because = hasBecause(norm);

  // Gamed prefix: owns it in words but still stacks a fact-assertion marker.
  if (owned && marker) {
    return {
      foulType: 'opinion_as_fact',
      matched: marker,
      reason: `Owns it but still asserts "${marker}" as fact; the prefix does not license a fact-claim.`,
    };
  }

  if (marker) {
    if (owned) return null; // handled above; belt and suspenders
    if (because) {
      // Asserted as fact but gave a reason: still missing ownership.
      return {
        foulType: 'opinion_as_fact',
        matched: marker,
        reason: `States "${marker}" as fact; gave a reason but did not own it as your view.`,
      };
    }
    return {
      foulType: 'opinion_as_fact',
      matched: marker,
      reason: `Stated as fact ("${marker}") with no ownership and no reason.`,
    };
  }

  return null;
}

// Judging phrase check: a "you" aimed at a trait or motive.
export function detectJudging(text: string): PhraseHit | null {
  const norm = normalize(text);
  if (!/\byou('?re| are|r)?\b|\byour\b/.test(norm)) return null;
  for (const trait of TRAIT_WORDS) {
    if (norm.includes(trait)) {
      return {
        foulType: 'judging',
        matched: trait,
        reason: `"you" aimed at a trait or motive ("${trait}") rather than the argument.`,
      };
    }
  }
  return null;
}

// Runs the phrase rules for the fouls that are live at the current level.
export function runPhraseDetectors(
  text: string,
  activeFouls: FoulType[]
): PhraseHit | null {
  if (activeFouls.includes('judging')) {
    const j = detectJudging(text);
    if (j) return j;
  }
  if (activeFouls.includes('opinion_as_fact')) {
    const o = detectOpinionAsFact(text);
    if (o) return o;
  }
  return null;
}
