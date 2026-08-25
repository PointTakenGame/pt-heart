// The NPC box. Steve, 2026-08-25: "Emulate what it's like in a role-playing game
// when you're talking to some NPC and you've got their face, but then there's
// like a quote in the middle and then you hit next with like a stepper."
//
// Three rules, and they are the whole design:
//   1. It never moves. The frame is a fixed block with a floor under it, so a
//      one-line ruling and a four-line setup occupy the same rectangle and the
//      Next button is always in the same place under your thumb.
//   2. The face is inside the frame, on the left, in a portrait window.
//   3. The text types itself, with the generic blip voice over it (blip.ts).
//      Clicking the box dumps the rest of the line, the way every RPG does.
//
// When the coach is talking about somebody, the opponent's card is dealt at the
// foot of the frame under the quote, so "that is Verdict Victor" arrives with
// Verdict Victor attached (Steve, same day: "a little mug shot or baseball card
// ... so that you know what he's talking about", and on 2026-08-25: "coach shows
// you his card on bottom of convo box, and make it baseball-card AR/style").
// Below the line rather than above it because the line is what introduces him:
// the card is the reveal, and a reveal does not go first.
//
// Restyled 2026-08-25 as the corner box (Smash Bros ideation B8, shipped on
// Steve's "ship the 3, looks great"): navy ground, a cream double frame, the
// speaker's name on an orange plate notched over the top edge, and the face in
// a lit window rather than floating on the page. Nothing in this file moved for
// it except the wedge below; the box is CSS.

import { useEffect, useRef, useState } from 'react';
import type { FoulType } from '../types.ts';
import { RuleCardFull, RuleCardMini } from './RuleCards.tsx';
import {
  blip,
  blipMuted,
  setBlipMuted,
  blipVoice,
  setBlipVoice,
  BLIP_VOICES,
  type BlipVoice,
} from './blip.ts';

export interface Mug {
  emoji: string;
  name: string;
  epithet?: string;
}

interface Props {
  /** null for a line nobody is saying, e.g. a drill specimen on the table */
  face: string | null;
  name?: string;
  text: string;
  /** the printed rule card, dealt inside the frame */
  card?: FoulType;
  mug?: Mug | null;
  /** speaker tint: whose frame this is */
  tone?: 'coach' | 'opponent' | 'player' | 'table' | 'call';
  /** drill mode: no full card will ever be dealt here, so do not reserve the
   *  height for one. Steve, 2026-08-25: "there's a lot of space in the area
   *  where the text can appear. I don't know why it's so enormous. I think it's
   *  designed to fit the entire card, which made sense in the introduction
   *  phase, but now we're never going to show the entire card in this pane." */
  compact?: boolean;
}

/** Roughly the reading speed the thread's dwell timer assumes (pacing.ts).
 *
 * Steve, 2026-08-25: "coach ray voice beeps, too high pitch, too fast,
 * irritating." 22ms a character put a beep every 44ms, which is faster than
 * speech and reads as a fax machine. 34ms a character with a beep every third
 * one is a beep every 102ms, about half the old rate, and the line still
 * finishes in about a second and a half. */
const MS_PER_CHAR = 34;

/** The seeds a voice preview plays, so every sample is the same five notes. */
const SAMPLE = [72, 101, 108, 108, 111];

export function Dialogue({ face, name, text, card, mug, tone = 'coach', compact = false }: Props) {
  const [shown, setShown] = useState(0);
  const [muted, setMuted] = useState(blipMuted);
  const [voice, setVoice] = useState<BlipVoice>(blipVoice);
  const [picking, setPicking] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setShown(0);
    if (!text) return;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setShown(n);
      // Every third character, and never on a space, so the voice tracks
      // syllables rather than machine-gunning.
      const c = text.charCodeAt(n - 1);
      if (n % 3 === 0 && c !== 32) blip(c);
      if (n >= text.length) window.clearInterval(id);
    }, MS_PER_CHAR);
    timer.current = id;
    return () => window.clearInterval(id);
  }, [text]);

  const done = shown >= text.length;

  const dump = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    setShown(text.length);
  };

  /** Five notes in the voice being auditioned, spaced like the typewriter. */
  const sample = (v: BlipVoice) => {
    SAMPLE.forEach((seed, i) => window.setTimeout(() => blip(seed, v), i * 3 * MS_PER_CHAR));
  };

  return (
    <div
      className={`dlg dlg-${tone}${card ? ' has-card' : ''}${mug ? ' has-mug' : ''}${
        compact ? ' is-compact' : ''
      }`}
      onClick={dump}
    >
      <button
        className="dlg-mute"
        aria-label={muted ? 'turn the voice on' : 'turn the voice off'}
        onClick={(e) => {
          e.stopPropagation();
          setBlipMuted(!muted);
          setMuted(!muted);
        }}
      >
        {muted ? '\u{1F507}' : '\u{1F50A}'}
      </button>

      {/* Steve, 2026-08-25: "coach ray voice beeps, too high pitch, too fast,
          irritating. give me 3-4 other samples to vett?" So the four are here
          to be auditioned in place, against a real line, rather than described.
          Clicking one plays it and keeps it; the choice persists across
          sessions (blip.ts), so whichever one he leaves selected is the one the
          game uses. A preview sounds even when the box is muted, because muting
          the coach and wanting to hear the candidates are different wishes. */}
      <button
        className="dlg-voice-btn"
        aria-label="pick the coach's voice"
        aria-expanded={picking}
        onClick={(e) => {
          e.stopPropagation();
          setPicking(!picking);
        }}
      >
        {'\u{1F39B}\uFE0F'}
      </button>

      {picking && (
        <div className="dlg-voices" onClick={(e) => e.stopPropagation()}>
          <div className="dlg-voices-head">Coach voice</div>
          {BLIP_VOICES.map((v) => (
            <button
              key={v.id}
              className={`dlg-voice${v.id === voice ? ' is-on' : ''}`}
              aria-pressed={v.id === voice}
              onClick={() => {
                setBlipVoice(v.id);
                setVoice(v.id);
                sample(v.id);
                // Steve, 2026-08-25: "When the new voice is clicked, then close
                // the pop-up menu." The sample still plays; the menu closing is
                // what says the choice took.
                setPicking(false);
              }}
            >
              <span className="dlg-voice-name">{v.label}</span>
              <span className="dlg-voice-blurb">{v.blurb}</span>
            </button>
          ))}
        </div>
      )}

      <div className="dlg-row">
        {face && (
          <span className="dlg-face" aria-hidden="true">
            {face}
          </span>
        )}
        <div className="dlg-said">
          {name && <div className="dlg-name">{name}</div>}
          <p className="dlg-text">
            <span aria-hidden="true">{text.slice(0, shown)}</span>
            <span className="sr-only">{text}</span>
            {!done && <span className="dlg-caret" aria-hidden="true" />}
          </p>
        </div>
      </div>

      {card && (compact ? <RuleCardMini rule={card} /> : <RuleCardFull rule={card} />)}

      {/* The RPG "line's over" wedge. It says the typing has stopped, which is
          the one thing the stepper's Next button cannot say: Next is always
          there, so it cannot mean "now". */}
      {done && (
        <span className="dlg-more" aria-hidden="true">
          {'\u25BC'}
        </span>
      )}

      {mug && (
        <div className="dlg-mug">
          <span className="dlg-mug-face" aria-hidden="true">
            {mug.emoji}
          </span>
          <div className="dlg-mug-said">
            <div className="dlg-mug-name">{mug.name}</div>
            {mug.epithet && <div className="dlg-mug-epithet">{mug.epithet}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
