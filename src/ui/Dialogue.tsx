// The NPC box. Steve, 2026-08-25: "Emulate what it's like in a role-playing game
// when you're talking to some NPC and you've got their face, but then there's
// like a quote in the middle and then you hit next with like a stepper."
//
// Three rules, and they are the whole design:
//   1. It never moves. The frame is a fixed block with a floor under it, so a
//      one-line ruling and a four-line setup occupy the same rectangle and the
//      Next button is always in the same place under your thumb.
//   2. The face is inside the frame, on the left, at portrait size.
//   3. The text types itself, with the generic blip voice over it (blip.ts).
//      Clicking the box dumps the rest of the line, the way every RPG does.
//
// When the coach is talking about somebody, the opponent's card sits above the
// quote, so "that is Verdict Victor" arrives with Verdict Victor attached
// (Steve, same day: "a little mug shot or baseball card ... so that you know what
// he's talking about").

import { useEffect, useRef, useState } from 'react';
import type { FoulType } from '../types.ts';
import { RuleCardFull } from './RuleCards.tsx';
import { blip, blipMuted, setBlipMuted } from './blip.ts';

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
}

/** Roughly the reading speed the thread's dwell timer assumes (pacing.ts). */
const MS_PER_CHAR = 22;

export function Dialogue({ face, name, text, card, mug, tone = 'coach' }: Props) {
  const [shown, setShown] = useState(0);
  const [muted, setMuted] = useState(blipMuted);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setShown(0);
    if (!text) return;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setShown(n);
      // Every other character, and never on a space, so the voice tracks
      // syllables rather than machine-gunning.
      const c = text.charCodeAt(n - 1);
      if (n % 2 === 0 && c !== 32) blip(c);
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

  return (
    <div className={`dlg dlg-${tone}`} onClick={dump}>
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

      {card && <RuleCardFull rule={card} />}
    </div>
  );
}
