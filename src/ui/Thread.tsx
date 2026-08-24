import { useEffect, useRef } from 'react';
import type { Message } from '../types.ts';

interface Props {
  messages: Message[];
  waiting: boolean;
  onSkip: () => void;
}

export function Thread({ messages, waiting, onSkip }: Props) {
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  // Auto-scroll, unless the player has scrolled up to reread something. Yanking
  // them back down mid-sentence is the fastest way to make a thread feel hostile.
  useEffect(() => {
    if (!pinned.current) return;
    end.current?.scrollIntoView({ behavior: 'smooth' });
    // The composer often changes height in the same tick, which cuts the smooth
    // scroll short and leaves the newest line under the fold. Land it properly
    // once the animation has had its moment.
    const t = setTimeout(() => {
      if (pinned.current) end.current?.scrollIntoView({ block: 'end' });
    }, 400);
    return () => clearTimeout(t);
  }, [messages.length]);

  // The composer changes height between steps (chips appear, a textarea replaces
  // a button row), which shortens the thread without adding a message. Without
  // this the last line or two sit below the fold.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (pinned.current) end.current?.scrollIntoView({ block: 'end' });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = () => {
    const el = box.current;
    if (!el) return;
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  return (
    <div
      className="thread"
      ref={box}
      onScroll={onScroll}
      onClick={() => waiting && onSkip()}
    >
      {messages.map((m) => (
        <div key={m.id} className={`msg msg-${m.lane}${m.isSpecimen ? ' msg-specimen' : ''}`}>
          {m.speaker && <div className="msg-speaker">{m.speaker}</div>}
          <div className="msg-body">{m.text}</div>
        </div>
      ))}
      <div ref={end} />
    </div>
  );
}
