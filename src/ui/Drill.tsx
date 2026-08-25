// Training is a stepper, not a scroll.
//
// Steve, 2026-08-25: "The coach was just training me, and that wasn't actually
// Victor. It's kind of confusing that the coach gives you training and then you
// go up against the boss. It's basically the same thing... I think the training
// can be in the same format, but it needs to be a one-at-a-time stepper. Like the
// discussion with the coach. It can't be in the chat room. The chat room is only
// for The actual bosses."
//
// So the two presentations now mean two different things:
//   corner and drill  -> Dialogue box, one panel, Next
//   boss encounter    -> the scrolling Thread
// and the moment you cross from one to the other is the walk-out screen, which
// already clears the thread (engine.beginBoss).
//
// The engine is untouched. It still pushes messages on its own dwell timer; this
// view just holds a cursor into that list and shows one at a time, so lines queue
// up behind the player instead of scrolling past them. Being behind is normal:
// the Next button counts down the backlog. The composer only appears once the
// player has caught up, which is also what stops them answering a question they
// have not read yet.

import { useEffect, useRef, useState } from 'react';
import type { Message } from '../types.ts';
import type { Avatars } from './Thread.tsx';
import { COACH_NAME } from '../avatars.ts';
import { Dialogue, type Mug } from './Dialogue.tsx';

interface Props {
  messages: Message[];
  avatars: Avatars;
  /** the engine is mid-dwell with more to say */
  waiting: boolean;
  onSkip: () => void;
  /** shown when the current line names them */
  opponent?: Mug | null;
  /** the composer for the step the player is on, or null while locked */
  composer: React.ReactNode;
  composerReady: boolean;
  /** fires while the player still has unread panels ahead of the cursor, so the
   *  rail can refuse a call on a line they have not reached yet */
  onBehind?: (behind: boolean) => void;
}

/** Does this line name the opponent? Cheap, and it keeps the mug shot a content
 *  decision rather than another field every level file has to remember to set. */
function namesOpponent(text: string, mug: Mug | null | undefined): boolean {
  if (!mug) return false;
  if (text.includes(mug.name)) return true;
  const last = mug.name.split(' ').slice(-1)[0];
  return last.length > 2 && text.includes(last);
}

export function Drill({
  messages,
  avatars,
  waiting,
  onSkip,
  opponent,
  composer,
  composerReady,
  onBehind,
}: Props) {
  const [cursor, setCursor] = useState(0);

  const last = messages.length - 1;
  const i = Math.min(cursor, Math.max(0, last));
  const behind = i < last;

  // Tell the room. The rule cards below can go live the moment the engine asks
  // for a call, which in a stepped drill can be several panels ahead of where
  // the player is reading. Calling a foul on a line you have not been shown yet
  // is not a judgement, it is a coin flip.
  //
  // The callback is held in a ref so a parent that re-creates it every render
  // does not turn this into an every-render effect, and unmounting reports
  // false so leaving the drill never leaves the rail locked.
  const tell = useRef(onBehind);
  tell.current = onBehind;
  useEffect(() => {
    tell.current?.(behind);
  }, [behind]);
  useEffect(() => () => tell.current?.(false), []);
  const m: Message | undefined = messages[i];

  // The line under judgement stays on screen while the player types about it.
  // Without this, an edit step shows the coach's instruction and hides the
  // sentence being edited one panel back.
  const tableIdx = (() => {
    for (let n = i; n >= 0; n -= 1) {
      if (messages[n]?.isSpecimen || messages[n]?.isTake) return n;
    }
    return -1;
  })();
  const table = tableIdx >= 0 && tableIdx !== i ? messages[tableIdx] : null;

  const next = () => {
    setCursor(i + 1);
    if (!behind && waiting) onSkip();
  };

  if (!m) {
    return <div className="drill-stage" />;
  }

  // A drill specimen in the coach lane wears no face: nobody is saying it, it is
  // a line on the table. Same rule the thread uses.
  const faceless = m.isSpecimen && m.lane === 'coach';
  const face =
    m.lane === 'coach' ? avatars.coach : m.lane === 'player' ? avatars.player : avatars.opponent;
  // A call is a whistle, not a remark, and it is the loudest thing the player
  // does all night. Steve, 2026-08-25: "When the player calls a foul like
  // judging, then they need to that Text chat line needs to be orange, not
  // black." Same rule the thread uses, so the drill and the fight agree.
  const tone = m.isCall
    ? 'call'
    : faceless || m.lane === 'crowd'
      ? 'table'
      : m.lane;

  // Everyone who has a face gets a name over it, the same way the corner screen
  // labels the coach. The engine only bothers naming the opponent on the lines
  // where the content author wanted it, which left the coach anonymous here
  // while he was labelled two screens earlier. A line on the table is still
  // nobody's, so it stays unlabelled.
  const name = faceless
    ? undefined
    : m.lane === 'coach'
      ? COACH_NAME
      : m.lane === 'player'
        ? 'You'
        : (m.speaker ?? opponent?.name);

  return (
    <>
      <div className="drill-stage">
        {table && (
          <div className="drill-table">
            <span className="drill-table-tag">on the table</span>
            <span className="drill-table-text">{table.text}</span>
          </div>
        )}
        <Dialogue
          key={m.id}
          face={faceless || m.lane === 'crowd' ? null : face}
          name={name}
          text={m.text}
          card={m.card}
          mug={namesOpponent(m.text, opponent) ? opponent : null}
          tone={tone}
        />
      </div>

      <div className="drill-foot">
        {behind || !composerReady ? (
          <>
            <button className="btn btn-wide" onClick={next}>
              Next
            </button>
            <p className="drill-count muted">
              {behind ? `${last - i} more` : waiting ? '…' : 'go on'}
            </p>
          </>
        ) : (
          composer
        )}
      </div>
    </>
  );
}
