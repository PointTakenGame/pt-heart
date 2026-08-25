import { useEffect, useImperativeHandle, useRef } from 'react';
import type { Message } from '../types.ts';
import { RuleCardMini } from './RuleCards.tsx';

export interface Avatars {
  coach: string;
  opponent: string;
  player: string;
}

export interface ThreadHandle {
  /** Land on the bottom, unless the player has scrolled up to reread. */
  land: () => void;
}

interface Props {
  messages: Message[];
  avatars: Avatars;
  waiting: boolean;
  onSkip: () => void;
  ref?: React.Ref<ThreadHandle>;
}

export function Thread({ messages, avatars, waiting, onSkip, ref }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const byPlayer = useRef(false);

  // Land exactly on the bottom. scrollIntoView on a trailing marker aligns that
  // element, which stops short of the thread's own bottom padding and leaves the
  // last line of the newest message about 25px under the fold at phone width.
  // Setting scrollTop past the maximum lets the browser clamp it, which is exact.
  const toBottom = () => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // The composer changes height constantly: chips appear, a textarea replaces a
  // button row, the textarea grows a line as the player types. Every one of those
  // shortens the thread without adding a message, so the newest line slides under
  // the fold with nothing to trigger a scroll.
  //
  // The composer calls this from a layout effect, which is the point: it runs
  // after the DOM change and before the browser paints, so there is never a frame
  // showing the clipped state. A ResizeObserver would land it a frame or two late
  // and the correction would be visible as a jump.
  useImperativeHandle(ref, () => ({
    land: () => {
      if (pinned.current) toBottom();
    },
  }), []);

  // Auto-scroll on a new message, unless the player has scrolled up to reread
  // something. Yanking them back down mid-sentence is the fastest way to make a
  // thread feel hostile.
  useEffect(() => {
    if (!pinned.current) return;
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' });
    // A composer height change in the same tick cuts the smooth scroll short.
    // Land it properly once the animation has had its moment.
    const t = setTimeout(() => {
      if (pinned.current) toBottom();
    }, 400);
    return () => clearTimeout(t);
  }, [messages.length]);

  // Backstop for height changes nothing tells us about: a web font finishing,
  // the browser chrome resizing, an image-free reflow. Does nothing in a hidden
  // tab, which is fine, because a hidden tab has no player looking at it.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (pinned.current) toBottom();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Unpinning is a decision only the player gets to make. The thread shrinking
  // under a pinned view also moves the view off the bottom, and the scroll event
  // that fires in between two height changes would otherwise read as "they
  // scrolled up to reread" and leave every later line under the fold for the rest
  // of the level. So coming off the bottom only counts when a wheel or a finger
  // did it. Arriving back at the bottom always re-pins.
  const onScroll = () => {
    const el = box.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      pinned.current = true;
      byPlayer.current = false;
    } else if (byPlayer.current) {
      pinned.current = false;
    }
  };

  return (
    <div
      className="thread"
      ref={box}
      onScroll={onScroll}
      onWheel={() => { byPlayer.current = true; }}
      onTouchMove={() => { byPlayer.current = true; }}
      onClick={() => waiting && onSkip()}
    >
      {messages.map((m, i) => {
        // De-contrast what is behind us. Steve, 2026-08-25: "after it's been on
        // the s it's the some new action is required. then the old stuff that's
        // no longer relevant should be decontrasted."
        //
        // Positional, not semantic: distance from the end of the list. The engine
        // does not hand the view an item boundary, and a rule that has to guess
        // one would eventually disagree with the engine and fade a live line. The
        // last three are full strength, the next three are dimmer, the rest are
        // background.
        const back = messages.length - 1 - i;
        const age = back <= 2 ? 'now' : back <= 5 ? 'recent' : 'old';

        // The crowd is not a speaker. No bubble, no face, no name.
        if (m.lane === 'crowd') {
          return (
            <div key={m.id} className="msg-row row-crowd" data-age={age}>
              <div className="crowd" aria-hidden="true">{m.text}</div>
            </div>
          );
        }
        // Big faces, and the player's own on the right. Steve, 2026-08-24: it
        // "should feel liek mortal kombat", which starts with knowing at a glance
        // who is talking. The coach is centered, in neither lane, because he is
        // not in the argument (ruling of the same day).
        const face =
          m.lane === 'coach' ? avatars.coach : m.lane === 'player' ? avatars.player : avatars.opponent;
        const cls = [
          'msg',
          `msg-${m.lane}`,
          m.isSpecimen ? 'msg-specimen' : '',
          m.isTake ? 'msg-take' : '',
          m.card ? 'msg-card' : '',
          m.isCall ? 'msg-call' : '',
        ]
          .filter(Boolean)
          .join(' ');
        // The face sits on the first line of the bubble itself, not on a row
        // above it (Steve, 2026-08-25: "Put the emoji head inside the box instead
        // of the coach being on top. Just put it in in line inside the box").
        // Widths are fixed by lane in the stylesheet: opponent two thirds on the
        // left, player two thirds on the right, coach one third down the middle,
        // so the three speakers land on three predictable columns.
        //
        // A drill specimen in the coach lane wears no face. Nobody is saying it:
        // it is a line on the table to be judged, and putting the coach's face on
        // it makes him the one committing the foul. Sofia's fouls are also
        // specimens, but they are in her lane and she keeps her face.
        const faceless = m.isSpecimen && m.lane === 'coach';
        return (
          <div key={m.id} className={`msg-row row-${m.lane}`} data-age={age}>
            <div className={cls}>
              {/* The small card, not the big one. Steve, 2026-08-25: "When a
                  foul call card is played in the chat, use the small version...
                  Don't use the huge version. Or use one that looks like the
                  button that the player just pressed." The mini card is the same
                  shape as the rail button, so a call now reads as the button
                  landing in the room rather than as a rulebook page dropping in
                  mid-argument. */}
              {m.card ? (
                <RuleCardMini rule={m.card} />
              ) : (
                <div className="msg-body">
                  {!faceless && (
                    <span className="face" aria-hidden="true">{face}</span>
                  )}
                  <span className="msg-said">
                    {m.speaker && <span className="msg-speaker">{m.speaker}</span>}
                    <span className="msg-text">{m.text}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
