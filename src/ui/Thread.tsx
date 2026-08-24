import { useEffect, useImperativeHandle, useRef } from 'react';
import type { Message } from '../types.ts';

export interface ThreadHandle {
  /** Land on the bottom, unless the player has scrolled up to reread. */
  land: () => void;
}

interface Props {
  messages: Message[];
  waiting: boolean;
  onSkip: () => void;
  ref?: React.Ref<ThreadHandle>;
}

export function Thread({ messages, waiting, onSkip, ref }: Props) {
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
      {messages.map((m) => (
        <div key={m.id} className={`msg msg-${m.lane}${m.isSpecimen ? ' msg-specimen' : ''}`}>
          {m.speaker && <div className="msg-speaker">{m.speaker}</div>}
          <div className="msg-body">{m.text}</div>
        </div>
      ))}
    </div>
  );
}
