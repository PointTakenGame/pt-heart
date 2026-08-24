interface Props {
  title: string;
  teaches: string;
  beatName: string;
  itemsDone: number;
  itemsTotal: number;
  /** live play only: the two purses, shown in place of the pips */
  tokens?: { player: number; sofia: number };
  onExit: () => void;
}

export function Header({
  title,
  teaches,
  beatName,
  itemsDone,
  itemsTotal,
  tokens,
  onExit,
}: Props) {
  return (
    <header className="header">
      <button className="link" onClick={onExit}>
        Leave
      </button>
      <div className="header-mid">
        <div className="header-title">{title}</div>
        <div className="header-sub">
          {teaches} &middot; {beatName}
        </div>
      </div>
      {tokens ? (
        // Two numbers, not fourteen tokens. Fourteen dots at phone width read as
        // decoration; a number that drops by two when you get Judged does not.
        <div
          className="ledger"
          aria-label={`you ${tokens.player}, opponent ${tokens.sofia}`}
        >
          <span className="ledger-side">
            <span className="ledger-n">{tokens.player}</span>
            <span className="ledger-who">you</span>
          </span>
          <span className="ledger-side ledger-them">
            <span className="ledger-n">{tokens.sofia}</span>
            <span className="ledger-who">her</span>
          </span>
        </div>
      ) : (
        <div className="pips" aria-label={`${itemsDone} of ${itemsTotal} done`}>
          {Array.from({ length: itemsTotal }, (_, i) => (
            <span key={i} className={`pip${i < itemsDone ? ' pip-on' : ''}`} />
          ))}
        </div>
      )}
    </header>
  );
}
