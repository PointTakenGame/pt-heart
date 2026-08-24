interface Props {
  title: string;
  teaches: string;
  beatName: string;
  itemsDone: number;
  itemsTotal: number;
  onExit: () => void;
}

export function Header({ title, teaches, beatName, itemsDone, itemsTotal, onExit }: Props) {
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
      <div className="pips" aria-label={`${itemsDone} of ${itemsTotal} done`}>
        {Array.from({ length: itemsTotal }, (_, i) => (
          <span key={i} className={`pip${i < itemsDone ? ' pip-on' : ''}`} />
        ))}
      </div>
    </header>
  );
}
