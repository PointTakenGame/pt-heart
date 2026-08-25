// The masthead off page 1 of the printed deck, lifted out of the front screen so
// every screen can wear it.
//
// Smash Bros ideation pass, B1 (docs/design/2026-08-25_smash-bros-ring-ideation.md):
// "the single cheapest thing that makes the web build look like the deck, and it
// is the frame that lets the coach screen and the bout screen read as two rooms
// in one building." Steve, 2026-08-25: "smash bros: ship the 3, looks great."
//
// Two sizes, because the front page and the play screen are not asking for the
// same thing. Full is the printed masthead: the letterspaced eyebrow strip, the
// wordmark at poster size, the social pill. Slim drops the eyebrow and the pill
// and shrinks the wordmark to a single navy rule across the top of a screen that
// needs its vertical space for the fight; `right` is where the play screen hangs
// its Leave link, so the bar is doing two jobs and costing the height of one.
export function Mast({ slim = false, right }: { slim?: boolean; right?: React.ReactNode }) {
  return (
    <header className={`mast${slim ? ' mast-slim' : ''}`}>
      {!slim && <div className="mast-eyebrow">Point Taken:</div>}
      <div className="mast-bar">
        <div className="mast-word">
          <span className="mast-humility">Humility</span>{' '}
          <span className="mast-showdown">Showdown</span>
        </div>
        {slim ? (
          right && <div className="mast-right">{right}</div>
        ) : (
          <div className="mast-pill">PointTaken.social</div>
        )}
      </div>
    </header>
  );
}
