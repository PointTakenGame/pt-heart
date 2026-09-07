// The whole gym is one thread of messages plus a list of steps that produce them.
// Levels 1 to 3. Both sides carry a seven-token purse from level 1 on, the coach
// is still the only referee, and every answering step is gated: a wrong or empty
// answer loops back to the same step instead of advancing the level.

import type { LevelId } from './content/ids.ts';

export type FoulType = 'judging' | 'opinion_as_fact' | 'fake_listening';

/** 'crowd' is a centered bare-emoji row, no bubble and no speaker. */
export type Lane = 'coach' | 'opponent' | 'player' | 'crowd';

export interface Message {
  id: string;
  lane: Lane;
  speaker?: string;
  text: string;
  /** the line under test, not ordinary speech */
  isSpecimen?: boolean;
  /** somebody's actual position, highlighted so it stays findable in the scroll */
  isTake?: boolean;
  /** renders the full printed rule card in the thread instead of the text */
  card?: FoulType;
  /** the player blowing the whistle, which reads as a call and not as speech */
  isCall?: boolean;
  /**
   * Overrides the face the lane would otherwise supply. Only the referee format
   * needs it, and it needs it because that thread has four faces for three lanes:
   * the coach is down in the ring on the right, the figure is on the left, and the
   * middle carries both the coach narrating and the human blowing the whistle.
   * Every other screen leaves this alone and the lane decides.
   */
  face?: string;
}

/** One fixed-text run, or one blank the player types into. */
export type TemplateSegment = { text: string } | { input: { placeholder: string } };

export type ComposerState =
  | { kind: 'locked' }
  | {
      kind: 'buttons';
      options: { value: string; label: string }[];
      help?: { label: string; lines: string[] };
    }
  /** A foul call. The cards themselves are the buttons (they live in the rail
   *  above the thread), so the composer carries only the decline. */
  | {
      kind: 'call';
      hint: string;
      pass: { value: string; label: string };
      callable: FoulType[];
      nonce?: number;
    }
  | { kind: 'prefilled'; prefill: string; chips: string[]; nonce?: number }
  | { kind: 'free'; placeholder: string; chips: string[]; nonce?: number }
  /** A sentence frame the player fills in, rather than a blank box plus hints. */
  | { kind: 'template'; segments: TemplateSegment[]; nonce?: number }
  /** The person a foul may have landed on, ruling on it. Two buttons carry the
   *  answer and the box under them is always open, because they may want to say
   *  something instead of, or as well as, pressing one (Steve, 2026-08-26). */
  | {
      kind: 'confirm';
      yes: string;
      no: string;
      placeholder: string;
      nonce?: number;
    }
  | { kind: 'continue'; label: string };

export interface Revision {
  t: number;
  text: string;
  reason: 'pause' | 'blur' | 'chip' | 'send';
}

export interface ItemRecord {
  itemId: string;
  /** the rung's permanent id. Survives a rename; see content/ids.ts. */
  levelId: LevelId;
  /** the rung's current label. A renameable string, kept because the corpus
   *  column `level_slug` has held it since 2026-09-01 and old rows have to stay
   *  readable. Never key anything on it. */
  levelSlug: string;
  rule: FoulType | 'mixed';
  answer: string;
  correct: boolean | null;
  revisions: Revision[];
  answeredAt: string;
}

interface SayStep {
  kind: 'say';
  lane: 'coach' | 'opponent';
  speaker?: string;
  text: string;
  isSpecimen?: boolean;
  isTake?: boolean;
}

/** Drops the printed rule card into the thread before the drilling starts. */
interface CardStep {
  kind: 'card';
  rule: FoulType;
}

interface CallOrPassStep {
  kind: 'call_or_pass';
  id: string;
  rule: FoulType;
  lane: 'coach' | 'opponent';
  speaker?: string;
  line: string;
  expected: 'foul' | 'clean';
  /** Which foul cards the tray lights up for this call. Defaults to `[rule]`,
   *  which is a single-card non-choice and is right for a level that is
   *  drilling one card in isolation. Every rung from the referee seat up needs
   *  all three live, because a real round has no note at the top of it saying
   *  which foul is about to be committed. */
  callable?: FoulType[];
  onCall: string;
  onPass: string;
  /** shown when the player gets it wrong and has to answer again */
  onWrong?: string;
}

interface SortStep {
  kind: 'sort';
  id: string;
  rule: FoulType;
  line: string;
  options: { value: string; label: string }[];
  expected: string;
  feedback: Record<string, string>;
}

interface EditStep {
  kind: 'edit';
  id: string;
  rule: FoulType;
  ask: string;
  prefill: string;
  chips: string[];
  target: string;
  fallback: string;
}

interface FreeStep {
  kind: 'free';
  id: string;
  rule: FoulType;
  ask?: string;
  chips: string[];
  placeholder: string;
  capture: string;
}

interface ModelStep {
  kind: 'model';
  id: string;
  task: 'restate_perfect' | 'restate_flawed';
  from: string;
  lead: string;
  fallback: string;
}

/** A suggested foul, answered by the person it may have landed on: yes, no, or
 *  their own words. Both replies are authored, so this runs with no API key, and
 *  neither answer is wrong. soul.md section 6 gives the call to the human who was
 *  there, so waving one off is free and is said out loud rather than corrected. */
interface ConfirmStep {
  kind: 'confirm';
  id: string;
  rule: FoulType;
  lane: 'coach' | 'opponent';
  speaker?: string;
  /** the suggestion itself, spoken before the buttons open */
  ask: string;
  /** what the suggester says when the call is upheld */
  onYes: string;
  /** what they say when it is waved off */
  onNo: string;
  yesLabel?: string;
  noLabel?: string;
  placeholder?: string;
  /** whose purse pays when the call is upheld. Omit and nothing moves. */
  pays?: 'player' | 'opponent';
}

/** A sentence frame with blanks in it. The player is not staring at an empty
 *  box; the shape of the move is already on screen and they supply the words. */
interface TemplateStep {
  kind: 'template';
  id: string;
  rule: FoulType;
  /** what the coach asks for before the frame opens */
  ask?: string;
  segments: TemplateSegment[];
  /** what the coach says back. One pass, no grading. */
  reply?: string;
}

interface ContinueStep {
  kind: 'continue';
  label: string;
}

export type Step =
  | SayStep
  | CardStep
  | CallOrPassStep
  | SortStep
  | EditStep
  | FreeStep
  | ModelStep
  | ConfirmStep
  | TemplateStep
  | ContinueStep;

export interface Beat {
  name: string;
  steps: Step[];
  /** the boss walks out here: the thread clears and the entrance screen runs */
  boss?: boolean;
}

/** One panel of the pre-room stepper: a coach line, or the printed rule card
 *  dealt out on its own screen. Steve, 2026-08-25: the setup and the card
 *  teaching happen before the room, one thing at a time with a Next button,
 *  "like a stepper instead of a barf of a bunch of vertically stacked cat
 *  lines". By the time the room opens it is the player and the opponent. */
export type PrefightStep =
  | { kind: 'line'; text: string }
  /** `text` overrides the coach's default caption. The default introduces the
   *  card as a defense against the attack just described, which is right the
   *  first time a player meets it and wrong by the Sofia match, where all three
   *  are already cleared levels and the panel is a roll call. */
  | { kind: 'card'; rule: FoulType; text?: string };

export interface LevelDef {
  /** The permanent save key. Ruling HEART-T260906-03; see content/ids.ts. */
  id: LevelId;
  /** A renameable label. Read by humans and written to the corpus, and the key
   *  to nothing. It used to be the save key, and every rename wiped progress. */
  slug: string;
  title: string;
  teaches: string;
  rule: FoulType;
  /** Every card the level puts on the rail. A one-card level lists its own rule;
   *  it is spelled out rather than derived from `rule` because the rungs above
   *  the gym run all three at once, and a rail that quietly tracks `rule` would
   *  have to be found and unpicked on the day one of them ships. */
  cards: FoulType[];
  /** Whether the token economy is switched on. Nathan, 2026-09-05: the cost is
   *  introduced and goes live when the player takes the referee's chair, so the
   *  gym levels are `'off'` and both stacks genuinely do not move, not for a
   *  drill and not for a boss call either. The coach says so out loud in all
   *  three levels. Required, not optional, so a new level makes the choice out
   *  loud instead of inheriting one. */
  tokens: 'off' | 'live';
  boss: string;
  /** the boss's face, big, on every line they speak */
  bossEmoji: string;
  /** one line of trash talk for the entrance screen */
  bossEpithet: string;
  /** everything the coach says before the door opens */
  prefight: PrefightStep[];
  beats: Beat[];
}
