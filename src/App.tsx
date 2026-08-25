// Four screens: the agreement (Beat 0), level select, the gym thread, and the
// showdown. Everything that carries game state lives in the two thread screens.

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { LEVELS } from './content/index.ts';
import type { FoulType, LevelDef } from './types.ts';
import { useGym } from './engine.ts';
import { Composer } from './ui/Composer.tsx';
import { Thread, type ThreadHandle } from './ui/Thread.tsx';
import { Header } from './ui/Header.tsx';
import { RuleCards } from './ui/RuleCards.tsx';
import { BossIntro } from './ui/BossIntro.tsx';
import { Prefight } from './ui/Prefight.tsx';
import { useShowdown } from './showdown.ts';
import { SHOWDOWN_PREFIGHT, SHOWDOWN_SLUG, SOFIA_EMOJI } from './content/showdown.ts';
import { CARD_ORDER } from './content/cards.ts';
import { COACH_EMOJI, DEFAULT_AVATAR, PLAYER_AVATARS } from './avatars.ts';
import { getAvatar, isCleared, load, setAvatar } from './storage.ts';

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
  const [avatar, setAvatarState] = useState<string>(() => getAvatar() ?? DEFAULT_AVATAR);

  const pickAvatar = (emoji: string) => {
    setAvatar(emoji);
    setAvatarState(emoji);
  };

  if (screen.name === 'agreement') return <Agreement onIn={() => setScreen({ name: 'select' })} />;
  if (screen.name === 'select') {
    return (
      <Select
        avatar={avatar}
        onAvatar={pickAvatar}
        onPick={(level) => setScreen({ name: 'level', level })}
        onShowdown={() => setScreen({ name: 'showdown' })}
      />
    );
  }
  if (screen.name === 'showdown') {
    return <Showdown avatar={avatar} onExit={() => setScreen({ name: 'select' })} />;
  }
  return (
    <Level
      key={screen.level.slug}
      level={screen.level}
      avatar={avatar}
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
  avatar,
  onAvatar,
  onPick,
  onShowdown,
}: {
  avatar: string;
  onAvatar: (emoji: string) => void;
  onPick: (l: LevelDef) => void;
  onShowdown: () => void;
}) {
  // Two screens, not one. Steve, 2026-08-25: "Let them choose their fighter. And
  // then hit done and then show the levels. Don't show them both at once." So
  // picking is a full screen of its own, and Change goes back to it.
  const [picking, setPicking] = useState(getAvatar() === null);

  if (picking) {
    return (
      <div className="page page-narrow page-picker">
        <h1>Choose your fighter</h1>
        <p className="muted">This is the face you wear in the room. You can change it later.</p>
        <div className="picker-grid" role="group" aria-label="Pick your fighter">
          {PLAYER_AVATARS.map((e) => (
            <button
              key={e}
              className={`picker-opt${e === avatar ? ' is-on' : ''}`}
              aria-label={`fighter ${e}`}
              aria-pressed={e === avatar}
              onClick={() => onAvatar(e)}
            >
              {e}
            </button>
          ))}
        </div>
        <button className="btn btn-wide" onClick={() => setPicking(false)}>
          Done
        </button>
      </div>
    );
  }

  // The ladder is a ladder. Steve's ruling of 2026-08-24: level 2 cannot be
  // opened before level 1 is cleared, because each level assumes the card the
  // one before it taught, and the showdown assumes all three.
  const cleared = LEVELS.map((l) => isCleared(l.slug));
  const allCleared = cleared.every(Boolean);

  return (
    <div className="page page-narrow">
      <h1>The gym</h1>
      <p className="muted">
        Three levels, each one habit and one opponent. Then all three at once, for tokens.
      </p>

      <div className="picker picker-done">
        <span className="picker-you" aria-hidden="true">{avatar}</span>
        <span className="picker-label">Your fighter</span>
        <button className="link" onClick={() => setPicking(true)}>
          change
        </button>
      </div>

      <ul className="levels">
        {LEVELS.map((l, i) => {
          const locked = i > 0 && !cleared[i - 1];
          return (
            <li key={l.slug}>
              <button
                className={`level-card${locked ? ' is-locked' : ''}`}
                disabled={locked}
                onClick={() => onPick(l)}
              >
                <span className="level-n">{locked ? '\u{1F512}' : i + 1}</span>
                <span className="level-mid">
                  <span className="level-title">{l.title}</span>
                  <span className="level-sub">
                    {locked ? `clear level ${i} first` : `${l.teaches} \u00b7 ${l.boss}`}
                  </span>
                </span>
                {cleared[i] && <span className="level-done">cleared</span>}
              </button>
            </li>
          );
        })}
        <li>
          <button
            className={`level-card level-card-boss${allCleared ? '' : ' is-locked'}`}
            disabled={!allCleared}
            onClick={onShowdown}
          >
            <span className="level-n">{allCleared ? '4' : '\u{1F512}'}</span>
            <span className="level-mid">
              <span className="level-title">The Showdown</span>
              <span className="level-sub">
                {allCleared ? 'All three cards \u00b7 Slippery Sofia' : 'clear all three levels first'}
              </span>
            </span>
            {isCleared(SHOWDOWN_SLUG) && <span className="level-done">played</span>}
          </button>
        </li>
      </ul>
    </div>
  );
}

/** The cards a call is open on right now, or null when no call is open. */
function liveCards(kind: string, callable?: FoulType[]): FoulType[] | null {
  return kind === 'call' ? (callable ?? []) : null;
}

function Level({
  level,
  avatar,
  onExit,
}: {
  level: LevelDef;
  avatar: string;
  onExit: () => void;
}) {
  // The corner comes first. Everything the coach used to say in the first six
  // chat lines is a stepper now, and the door opens on the drill.
  const [inRoom, setInRoom] = useState(false);
  if (!inRoom) {
    return (
      <Prefight
        steps={level.prefight}
        enterLabel={`In with ${level.boss.split(' ').slice(-1)[0]}`}
        onEnter={() => setInRoom(true)}
        onExit={onExit}
      />
    );
  }
  return <Room level={level} avatar={avatar} onExit={onExit} />;
}

function Room({
  level,
  avatar,
  onExit,
}: {
  level: LevelDef;
  avatar: string;
  onExit: () => void;
}) {
  const gym = useGym(level);
  const thread = useRef<ThreadHandle>(null);
  const land = useCallback(() => {
    thread.current?.land();
  }, []);
  // The end-of-level button replaces the composer outright, which is one more
  // height change with no message behind it.
  useLayoutEffect(land, [gym.finished, land]);

  const fightNumber = LEVELS.findIndex((l) => l.slug === level.slug) + 1;

  if (gym.bossPending) {
    return (
      <BossIntro
        fightNumber={fightNumber}
        boss={level.boss}
        bossEmoji={level.bossEmoji}
        epithet={level.bossEpithet}
        playerEmoji={avatar}
        onStart={gym.beginBoss}
      />
    );
  }

  const call = gym.composer.kind === 'call' ? gym.composer : null;

  return (
    <div className="page page-level">
      <div className="page-topbar">
        <button className="link" onClick={onExit}>
          Leave
        </button>
      </div>
      <Header
        title={level.title}
        teaches={level.teaches}
        beatName={gym.beatName}
        purses={{
          player: gym.playerTokens,
          opponent: gym.opponentTokens,
          opponentLabel: level.boss.split(' ')[0].toLowerCase(),
          opponentEmoji: level.bossEmoji,
          playerEmoji: avatar,
        }}
      />
      <Thread
        ref={thread}
        messages={gym.messages}
        avatars={{ coach: COACH_EMOJI, opponent: level.bossEmoji, player: avatar }}
        waiting={gym.waiting}
        onSkip={gym.skip}
      />
      {gym.finished ? (
        <div className="composer">
          <button className="btn btn-wide" onClick={onExit}>
            Back to the gym
          </button>
        </div>
      ) : (
        <Composer state={gym.composer} onSubmit={gym.submit} onResize={land} />
      )}
      <RuleCards
        enabled={[level.rule]}
        live={liveCards(gym.composer.kind, call?.callable)}
        onCall={(f) => gym.submit(f, [])}
        pass={call ? { label: call.pass.label, onPass: () => gym.submit(call.pass.value, []) } : undefined}
      />
    </div>
  );
}

function Showdown({ avatar, onExit }: { avatar: string; onExit: () => void }) {
  // Corner, then walk-out, then the match. The match does not start until the
  // walk-out finishes, so the opening line is not already three messages up the
  // thread by the time the player looks.
  const [stage, setStage] = useState<'prefight' | 'intro' | 'match'>('prefight');
  if (stage === 'prefight') {
    return (
      <Prefight
        steps={SHOWDOWN_PREFIGHT}
        enterLabel="In with Sofia"
        onEnter={() => setStage('intro')}
        onExit={onExit}
      />
    );
  }
  if (stage === 'intro') {
    return (
      <BossIntro
        fightNumber={4}
        boss="Slippery Sofia"
        bossEmoji={SOFIA_EMOJI}
        epithet="Never raises her voice. Fouls you twice before you notice once."
        playerEmoji={avatar}
        onStart={() => setStage('match')}
      />
    );
  }
  return <Match avatar={avatar} onExit={onExit} />;
}

function Match({ avatar, onExit }: { avatar: string; onExit: () => void }) {
  const match = useShowdown();
  const thread = useRef<ThreadHandle>(null);
  const land = useCallback(() => {
    thread.current?.land();
  }, []);
  useLayoutEffect(land, [match.finished, land]);

  const call = match.composer.kind === 'call' ? match.composer : null;

  return (
    <div className="page page-level">
      <div className="page-topbar">
        <button className="link" onClick={onExit}>
          Leave
        </button>
      </div>
      <Header
        title="The Showdown"
        teaches="All three cards"
        beatName={match.phase}
        purses={{
          player: match.playerTokens,
          opponent: match.sofiaTokens,
          opponentLabel: 'sofia',
          opponentEmoji: SOFIA_EMOJI,
          playerEmoji: avatar,
        }}
      />
      <Thread
        ref={thread}
        messages={match.messages}
        avatars={{ coach: COACH_EMOJI, opponent: SOFIA_EMOJI, player: avatar }}
        waiting={match.waiting}
        onSkip={match.skip}
      />
      {match.finished ? (
        <div className="composer">
          <button className="btn btn-wide" onClick={onExit}>
            Back to the gym
          </button>
        </div>
      ) : (
        <Composer state={match.composer} onSubmit={match.submit} onResize={land} />
      )}
      <RuleCards
        enabled={CARD_ORDER}
        live={liveCards(match.composer.kind, call?.callable)}
        onCall={(f) => match.submit(f, [])}
        pass={call ? { label: call.pass.label, onPass: () => match.submit(call.pass.value, []) } : undefined}
      />
    </div>
  );
}
