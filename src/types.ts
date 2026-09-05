// The whole gym is one thread of messages plus a list of steps that produce them.
// Levels 1 to 5. Both sides carry a seven-token purse from level 1 on, and every
// answering step runs exactly once: the answer is taken, it is paid for or it is
// not, and the level moves on. There are no retries anywhere (Q6, Q12).

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
  /** The offendee ruling on a suggested foul: two buttons for the fast path and
   *  a text box that is always there, because they may want to say something. */
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
  onCall: string;
  onPass: string;
  /** which cards are live on the rail for this one call. Defaults to `[rule]`;
   *  levels 4 and 5 run all three, so the answer is a real choice. */
  callable?: FoulType[];
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

/** The offendee has the last word. A foul has been suggested — by a referee, by
 *  the coach standing in for one, or by the opponent answering "did I miss
 *  anything?" — and the person who might have been fouled rules on it: yes, no,
 *  or their own words. Both replies are authored, so this runs with no API key,
 *  and neither answer is wrong: soul.md §6 gives the call to the human who was
 *  there. Denying a call is free and is said out loud. */
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

interface ModelStep {
  kind: 'model';
  id: string;
  task: 'restate_perfect' | 'restate_flawed';
  from: string;
  lead: string;
  fallback: string;
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
  | ConfirmStep
  | TemplateStep
  | ModelStep
  | ContinueStep;

export interface Beat {
  name: string;
  steps: Step[];
  /** the boss walks out here: the entrance screen runs and the thread starts
   *  over, because the drill's worked examples must not read as things the boss
   *  said (Nathan, 2026-09-05). Open book still holds within the fight. */
  boss?: boolean;
}

/** One panel of the pre-room stepper: a coach line, or the printed rule card
 *  dealt out on its own screen. Steve, 2026-08-25: the setup and the card
 *  teaching happen before the room, one thing at a time with a Next button,
 *  "like a stepper instead of a barf of a bunch of vertically stacked cat
 *  lines". By the time the room opens it is the player and the opponent. */
export type PrefightStep =
  | { kind: 'line'; text: string }
  /** `text` overrides the coach's caption on the card panel. The default reads
   *  as a first meeting ("that's the attack, this is your defense"), which is
   *  wrong the moment a level deals a card the player already cleared a whole
   *  level on (Nathan, 2026-09-05, on the Showdown's three). */
  | { kind: 'card'; rule: FoulType; text?: string };

export interface LevelDef {
  /** Saved progress names levels by this, never by number (ruling B3,
   *  2026-08-23): renumbering the ladder must not orphan saves. */
  slug: string;
  title: string;
  teaches: string;
  rule: FoulType;
  /** every card the level puts on the rail. One-card levels list their own
   *  rule; levels 4 and 5 list all three. */
  cards: FoulType[];
  /** which chair the player is in. Omitted means the player is arguing; the
   *  referee level says so, and the word is withheld until then. */
  seat?: 'player' | 'referee';
  /** whether the token economy is switched on. Nathan, 2026-09-05: the cost is
   *  introduced and goes live when the player takes the ref's chair, so levels
   *  1-3 are `'off'` and the two token stacks genuinely do not move — not for a drill
   *  and not for a boss call either. Required, not optional, so a new level has
   *  to make the choice out loud instead of inheriting one. */
  tokens: 'off' | 'live';
  boss: string;
  /** the button that opens the door. Defaults to "In with <last word of boss>",
   *  which is right for a one-word opponent and wrong the moment a level fields
   *  two of them (Nathan, 2026-09-05: level 4 read "In with Olivia"). */
  enterLabel?: string;
  /** the boss's face, big, on every line they speak */
  bossEmoji: string;
  /** one line of trash talk for the entrance screen */
  bossEpithet: string;
  /** everything the coach says before the door opens */
  prefight: PrefightStep[];
  beats: Beat[];
}
