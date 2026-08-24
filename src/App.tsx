// Three screens: the agreement (Beat 0), level select, and the thread.
// Everything that carries game state lives in the thread.

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { LEVELS } from './content/index.ts';
import type { LevelDef } from './types.ts';
import { useGym } from './engine.ts';
import { Composer } from './ui/Composer.tsx';
import { Thread, type ThreadHandle } from './ui/Thread.tsx';
import { Header } from './ui/Header.tsx';
import { useShowdown } from './showdown.ts';
import { SHOWDOWN_SLUG } from './content/showdown.ts';
import { isCleared, load } from './storage.ts';

type Screen =
  | { name: 'agreement' }
  | { name: 'select' }
  | { name: 'level'; level: LevelDef }
  | { name: 'showdown' };

export function App() {
  const seen = Object.keys(load().cleared).length > 0;
  const [screen, setScreen] = useState<Screen>(
    seen ? { name: 'select' } : { name: 'agreement' },
  );

  if (screen.name === 'agreement') return <Agreement onIn={() => setScreen({ name: 'select' })} />;
  if (screen.name === 'select') {
    return (
      <Select
        onPick={(level) => setScreen({ name: 'level', level })}
        onShowdown={() => setScreen({ name: 'showdown' })}
      />
    );
  }
  if (screen.name === 'showdown') {
    return <Showdown onExit={() => setScreen({ name: 'select' })} />;
  }
  return (
    <Level
      key={screen.level.slug}
      level={screen.level}
      onExit={() => setScreen({ name: 'select' })}
    />
  );
}

// Two clauses. Steve cut the other two on 2026-08-23. Do not reintroduce them.
// Clause 1 is the front page of the printed deck, close to verbatim, because that
// copy was already worked over carefully.
function Agreement({ onIn }: { onIn: () => void }) {
  return (
    <div className="page page-narrow">
      <h1>Have the disagreement. Skip the fight.</h1>
      <p>
        When we argue to win, we feel like we&rsquo;re being persuasive. In reality, that
        backfires. That sets up a competition, with one winner and one loser. Nobody wants to
        lose. It doesn&rsquo;t matter if you&rsquo;re right. Committing any of three fouls means
        nobody wins.
      </p>
      <p>
        You&rsquo;re here to practice disagreeing better, not to win. What you&rsquo;re learning
        is when your own sentences make the other person angry, because an angry person is a
        person you will never persuade.
      </p>
      <h2>You can leave anytime.</h2>
      <p>
        Either player can end the round at any point, no explanation owed. Nothing is tracked
        against you for leaving.
      </p>
      <button className="btn btn-wide" onClick={onIn}>
        I&rsquo;m in
      </button>
    </div>
  );
}

function Select({
  onPick,
  onShowdown,
}: {
  onPick: (l: LevelDef) => void;
  onShowdown: () => void;
}) {
  return (
    <div className="page page-narrow">
      <h1>The gym</h1>
      <p className="muted">
        Three levels, each one habit and one opponent. Then all three at once, for tokens.
      </p>
      <ul className="levels">
        {LEVELS.map((l, i) => (
          <li key={l.slug}>
            <button className="level-card" onClick={() => onPick(l)}>
              <span className="level-n">{i + 1}</span>
              <span className="level-mid">
                <span className="level-title">{l.title}</span>
                <span className="level-sub">
                  {l.teaches} &middot; {l.boss}
                </span>
              </span>
              {isCleared(l.slug) && <span className="level-done">cleared</span>}
            </button>
          </li>
        ))}
        <li>
          <button className="level-card level-card-boss" onClick={onShowdown}>
            <span className="level-n">4</span>
            <span className="level-mid">
              <span className="level-title">The Showdown</span>
              <span className="level-sub">All three cards &middot; Slippery Sofia</span>
            </span>
            {isCleared(SHOWDOWN_SLUG) && <span className="level-done">played</span>}
          </button>
        </li>
      </ul>
    </div>
  );
}

function Level({ level, onExit }: { level: LevelDef; onExit: () => void }) {
  const gym = useGym(level);
  const thread = useRef<ThreadHandle>(null);
  const land = useCallback(() => {
    thread.current?.land();
  }, []);
  // The end-of-level button replaces the composer outright, which is one more
  // height change with no message behind it.
  useLayoutEffect(land, [gym.finished, land]);

  return (
    <div className="page page-level">
      <Header
        title={level.title}
        teaches={level.teaches}
        beatName={gym.beatName}
        itemsDone={gym.itemsDone}
        itemsTotal={gym.itemsTotal}
        onExit={onExit}
      />
      <Thread ref={thread} messages={gym.messages} waiting={gym.waiting} onSkip={gym.skip} />
      {gym.finished ? (
        <div className="composer">
          <button className="btn btn-wide" onClick={onExit}>
            Back to the gym
          </button>
        </div>
      ) : (
        <Composer state={gym.composer} onSubmit={gym.submit} onResize={land} />
      )}
    </div>
  );
}

function Showdown({ onExit }: { onExit: () => void }) {
  const match = useShowdown();
  const thread = useRef<ThreadHandle>(null);
  const land = useCallback(() => {
    thread.current?.land();
  }, []);
  useLayoutEffect(land, [match.finished, land]);

  return (
    <div className="page page-level">
      <Header
        title="The Showdown"
        teaches="All three cards"
        beatName={match.phase}
        itemsDone={0}
        itemsTotal={0}
        tokens={{ player: match.playerTokens, sofia: match.sofiaTokens }}
        onExit={onExit}
      />
      <Thread ref={thread} messages={match.messages} waiting={match.waiting} onSkip={match.skip} />
      {match.finished ? (
        <div className="composer">
          <button className="btn btn-wide" onClick={onExit}>
            Back to the gym
          </button>
        </div>
      ) : (
        <Composer state={match.composer} onSubmit={match.submit} onResize={land} />
      )}
    </div>
  );
}
