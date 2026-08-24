// The whole gym is one thread of messages plus a list of steps that produce them.
// Levels 1 to 3 only. Tokens are off, there is no referee separate from the coach,
// and there is no accuracy gate: completing every authored step clears the level.

export type FoulType = 'judging' | 'opinion_as_fact' | 'fake_listening';

export type Lane = 'coach' | 'opponent' | 'player';

/** A message once it is on screen. */
export interface Message {
  id: string;
  lane: Lane;
  /** Shown next to an opponent bubble. Coach and player carry no name. */
  speaker?: string;
  text: string;
  /** Renders as a quoted line under test rather than as ordinary speech. */
  isSpecimen?: boolean;
}

/** What the composer offers while a step waits on the player. */
export type ComposerState =
  | { kind: 'locked' }
  | { kind: 'buttons'; options: { value: string; label: string }[] }
  | { kind: 'prefilled'; prefill: string; chips: string[] }
  | { kind: 'free'; placeholder: string; chips: string[] }
  | { kind: 'continue'; label: string };

/**
 * One snapshot of the composer while the player was working on an item.
 * Captured on boundaries, not on keypress: 900ms after typing stops, on blur,
 * on chip insert, and always on send. Steve's ruling B1, 2026-08-23.
 */
export interface Revision {
  /** ms since the item's composer opened */
  t: number;
  text: string;
  reason: 'pause' | 'blur' | 'chip' | 'send';
}

/** What gets written to localStorage for one answered item. */
export interface ItemRecord {
  itemId: string;
  levelSlug: string;
  /** 'mixed' where an item is not testing one named card: a live-play turn where
   *  any of the three could land, or a clean line testing restraint across all
   *  three. Never fake a specific card to satisfy the type. */
  rule: FoulType | 'mixed';
  /** the raw answer: a button value, or the text the player sent */
  answer: string;
  /** null where the item has no right answer (free text, model-judged edits) */
  correct: boolean | null;
  revisions: Revision[];
  answeredAt: string;
}

/** A scripted line from the coach or the opponent. No player input. */
interface SayStep {
  kind: 'say';
  lane: 'coach' | 'opponent';
  speaker?: string;
  text: string;
  isSpecimen?: boolean;
}

/** Foul or clean, two buttons, zero typing. */
interface CallOrPassStep {
  kind: 'call_or_pass';
  id: string;
  rule: FoulType;
  /** who says the line under test */
  lane: 'coach' | 'opponent';
  speaker?: string;
  line: string;
  expected: 'foul' | 'clean';
  onCall: string;
  onPass: string;
}

/** Four-way sort. Beat 3C. Zero typing. */
interface SortStep {
  kind: 'sort';
  id: string;
  rule: FoulType;
  line: string;
  options: { value: string; label: string }[];
  expected: string;
  /** feedback keyed by the value the player picked */
  feedback: Record<string, string>;
}

/** The player is handed a line and corrects it. One clause of typing. */
interface EditStep {
  kind: 'edit';
  id: string;
  rule: FoulType;
  ask: string;
  prefill: string;
  chips: string[];
  /** what a passing edit must do, in words. Sent to the coach model. */
  target: string;
  /** shown when the model is unreachable, so the gym runs with no key */
  fallback: string;
}

/** Ordinary empty input. Level 3 step 2 only. */
interface FreeStep {
  kind: 'free';
  id: string;
  rule: FoulType;
  /** omit when a preceding say step already asked the question */
  ask?: string;
  chips: string[];
  placeholder: string;
  /** the player's text is stashed under this key for later model steps */
  capture: string;
}

/** A coach line the model writes from something the player already said. */
interface ModelStep {
  kind: 'model';
  id: string;
  task: 'restate_perfect' | 'restate_flawed';
  /** which captured key feeds the model */
  from: string;
  /** the coach's own framing, shown before the generated line */
  lead: string;
  /** used when the model is unreachable */
  fallback: string;
}

/** End of a beat. The only button between items anywhere in the gym. */
interface ContinueStep {
  kind: 'continue';
  label: string;
}

export type Step =
  | SayStep
  | CallOrPassStep
  | SortStep
  | EditStep
  | FreeStep
  | ModelStep
  | ContinueStep;

export interface Beat {
  name: string;
  steps: Step[];
}

export interface LevelDef {
  /** stable text slug. Saved progress names levels by this, never by number.
   *  Steve's ruling B3, 2026-08-23: renumbering the ladder must not orphan saves. */
  slug: string;
  title: string;
  teaches: string;
  rule: FoulType;
  boss: string;
  beats: Beat[];
}
