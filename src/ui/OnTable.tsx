// The line being ruled on, pinned where it cannot scroll away.
//
// The drill already had one of these (Drill.tsx, .drill-table): on an edit or a
// free-answer step the specimen is no longer the panel in front of you, and a
// question about a sentence you can no longer see is a memory test rather than a
// question. The boss thread had the same hole and no strip. Sofia says something,
// three coach lines land on top of it, the composer opens, and the thing you are
// being asked to rule on is above the fold.
//
// Two rules of Steve's are doing the work here. Put the instruction next to the
// thing in space: the question ("Foul, or let it stand?") sits on the line it is
// about, not in a coach bubble somewhere up the thread. And do not show the thing
// until the thing is relevant: the strip only exists while a ruling is actually
// open, so it is never furniture.

interface Props {
  /** the line under judgement */
  text: string;
  /** what to do about it, right now, sitting on the line it is about */
  hint?: string;
}

export function OnTable({ text, hint }: Props) {
  return (
    <div className="on-table">
      <span className="on-table-tag">on the table</span>
      <span className="on-table-text">{text}</span>
      {hint && <span className="on-table-hint">{hint}</span>}
    </div>
  );
}

/** The newest line a ruling could be about: the last specimen or take in the
 *  thread. Returns null when there is not one, which is every screen that is not
 *  asking for a call. */
export function tableLine(messages: { text: string; isSpecimen?: boolean; isTake?: boolean }[]): string | null {
  for (let n = messages.length - 1; n >= 0; n -= 1) {
    const m = messages[n];
    if (m.isSpecimen || m.isTake) return m.text;
  }
  return null;
}
