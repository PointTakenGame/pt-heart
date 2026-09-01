// Five screens: the agreement (Beat 0), level select, the gym thread, the
// showdown, and the referee levels. Everything that carries game state lives in
// the three thread screens.

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { LEVELS } from './content/index.ts';
import type { FoulType, LevelDef } from './types.ts';
import { useGym } from './engine.ts';
import { Composer } from './ui/Composer.tsx';
import { Thread, type ThreadHandle } from './ui/Thread.tsx';
import { Drill } from './ui/Drill.tsx';
import { Header } from './ui/Header.tsx';
import { RuleCards, RuleCardMini } from './ui/RuleCards.tsx';
import { BossIntro } from './ui/BossIntro.tsx';
import { Prefight } from './ui/Prefight.tsx';
import { Mast } from './ui/Mast.tsx';
import { useShowdown } from './showdown.ts';
import { useReferee } from './referee.ts';
import { useFinal } from './final.ts';
import { REFEREE_LEVELS, type RefereeLevel } from './content/referee.ts';
import { SHOWDOWN_PREFIGHT, SHOWDOWN_SLUG, SOFIA_EMOJI } from './content/showdown.ts';
import {
  FINAL_PREFIGHT,
  FINAL_SLUG,
  SUNGMIN,
  SUNGMIN_EMOJI,
  SUNGMIN_EPITHET,
} from './content/final.ts';
import { CARD_ORDER } from './content/cards.ts';
import { COACH_EMOJI, DEFAULT_AVATAR, shuffledAvatars } from './avatars.ts';
import { getAvatar, isCleared, load, setAvatar } from './storage.ts';

type Screen =
  | { name: 'agreement' }
  | { name: 'select' }
  | { name: 'level'; level: LevelDef }
  | { name: 'showdown' }
  | { name: 'referee'; level: RefereeLevel }
  | { name: 'final' };

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
        onReferee={(level) => setScreen({ name: 'referee', level })}
        onFinal={() => setScreen({ name: 'final' })}
      />
    );
  }
  if (screen.name === 'showdown') {
    return <Showdown avatar={avatar} onExit={() => setScreen({ name: 'select' })} />;
  }
  if (screen.name === 'final') {
    return <Final avatar={avatar} onExit={() => setScreen({ name: 'select' })} />;
  }
  if (screen.name === 'referee') {
    return (
      <Referee
        key={screen.level.slug}
        level={screen.level}
        avatar={avatar}
        onExit={() => setScreen({ name: 'select' })}
      />
    );
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

// The first screen, rebuilt 2026-08-25 against page 1 of the printed deck
// (docs/reference/print/v7/PointTaken-HumilityShowdown_2026-08-19.pdf). Steve:
// "first page loaded from ebsite - can make it look more like the pdf front
// page? suggest elements to harvest."
//
// Five things were harvested, in printed order: the masthead (letterspaced
// POINT TAKEN eyebrow, the two-colour wordmark, the PointTaken.social pill), the
// italic tagline under it, the quote block with the thick orange left rule, the
// row of three short foul cards with its teal-and-orange lede, and the split
// footer bar.
//
// Three things were deliberately left on paper. The vertical SET UP / PLAY tabs
// are the deck's spine and this screen has one section, so they would be
// decoration. The teal flow diagram is the tabletop procedure, which the app
// runs for the player. The referee panel has no counterpart: here you are the
// referee.
//
// One change of substance. The quote block is now the deck's own wording rather
// than the reworded version that was here, because the comment on the old
// version said "close to verbatim" and this is what verbatim actually is. The
// tagline is rewritten, since the printed one says "3-player game" and this is
// one player against the house.
//
// The masthead is navy, not the pure black page 1 prints. Pages 2 and 3 are
// navy, and card-anatomy.md §G reads the black as drift rather than intent.
//
// Two clauses. Steve cut the other two on 2026-08-23. Do not reintroduce them.
function Agreement({ onIn }: { onIn: () => void }) {
  return (
    <div className="page page-front">
      <Mast />

      <div className="front-body">
        <p className="front-tag">
          A training gym that uses simple, science-backed rules to take the fight out of a
          disagreement.
        </p>

        <blockquote className="front-quote">
          You have a disagreement with friends or family, and you want them to understand{' '}
          <strong>your</strong> perspective. But they fail to <strong>listen</strong> to you as
          soon as they feel (even a hint of) <strong>anger</strong>. Humility Showdown teaches
          you how to contain their anger, allowing them to{' '}
          <strong>actually listen to you</strong>.
        </blockquote>

        <div className="front-fouls">
          <p className="front-fouls-lede">
            <span className="lede-humility">Humility</span>{' '}
            <span className="lede-showdown">Showdown</span> will train your reflexes to avoid
            the <span className="lede-showdown">three fouls</span> that raise anger during a
            discussion:
          </p>
          <div className="mini-row">
            {CARD_ORDER.map((rule) => (
              <RuleCardMini key={rule} rule={rule} />
            ))}
          </div>
        </div>

        <p className="front-clause">
          You are here to practice disagreeing better, not to win. What you are learning is
          when your own sentences make the other person angry, because an angry person is a
          person you will never persuade.
        </p>

        <p className="front-clause">
          <strong>You can leave anytime.</strong> End a round at any point, no explanation
          owed. Nothing is tracked against you for leaving.
        </p>

        <button className="btn btn-wide btn-in" onClick={onIn}>
          I&rsquo;m in
        </button>
      </div>

      <footer className="front-foot">
        <div className="front-foot-left">Humility Showdown &middot; &copy; 2026 Experception LLC</div>
        <div className="front-foot-right">Internal playtest. Do not post or distribute.</div>
      </footer>
    </div>
  );
}

function Select({
  avatar,
  onAvatar,
  onPick,
  onShowdown,
  onReferee,
  onFinal,
}: {
  avatar: string;
  onAvatar: (emoji: string) => void;
  onPick: (l: LevelDef) => void;
  onShowdown: () => void;
  onReferee: (l: RefereeLevel) => void;
  onFinal: () => void;
}) {
  // Two screens, not one. Steve, 2026-08-25: "Let them choose their fighter. And
  // then hit done and then show the levels. Don't show them both at once." So
  // picking is a full screen of its own, and Change goes back to it.
  const [picking, setPicking] = useState(getAvatar() === null);
  // Dealt once, when the screen mounts, so the grid does not reshuffle under the
  // player's finger every time they try a face on.
  const [tiles] = useState(shuffledAvatars);

  if (picking) {
    return (
      <div className="page page-narrow page-picker">
        <Mast slim />
        <h1>Choose your fighter</h1>
        <p className="muted">This is the face you wear in the room. You can change it later.</p>
        {/* Smash Bros ideation B2, shipped 2026-08-25: nine buttons with emoji in
            them read as a settings control, so they are nine cards built on the
            print template instead. Same 4:5 face as the printed deck, an orange
            CHALLENGER strip. The roster number at the foot came off on
            2026-08-25 (Steve): the deal is shuffled per visit, so the number
            labelled a position rather than a fighter and read as data. */}
        <div className="roster" role="group" aria-label="Pick your fighter">
          {tiles.map((e) => (
            <button
              key={e}
              className={`fighter${e === avatar ? ' is-on' : ''}`}
              aria-label={`fighter ${e}`}
              aria-pressed={e === avatar}
              onClick={() => onAvatar(e)}
            >
              {e === avatar && <span className="fighter-tag">You</span>}
              <span className="fighter-head">
                <span className="fighter-eyebrow">Challenger</span>
              </span>
              <span className="fighter-face" aria-hidden="true">
                {e}
              </span>
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
      <Mast slim />
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
        {/* The referee levels. Ray goes down into the ring and the player takes
            the third seat, so these unlock behind the Showdown: you get handed
            the whistle after you have been on the wrong end of one. */}
        {REFEREE_LEVELS.map((l, i) => {
          const locked = i === 0 ? !isCleared(SHOWDOWN_SLUG) : !isCleared(REFEREE_LEVELS[i - 1].slug);
          return (
            <li key={l.slug}>
              <button
                className={`level-card${locked ? ' is-locked' : ''}`}
                disabled={locked}
                onClick={() => onReferee(l)}
              >
                <span className="level-n">{locked ? '\u{1F512}' : i + 5}</span>
                <span className="level-mid">
                  <span className="level-title">{l.title}</span>
                  <span className="level-sub">
                    {locked
                      ? i === 0
                        ? 'play the Showdown first'
                        : `clear level ${i + 4} first`
                      : `You referee · ${l.figure}`}
                  </span>
                </span>
                {isCleared(l.slug) && <span className="level-done">cleared</span>}
              </button>
            </li>
          );
        })}
        {/* Level 7. Behind level 6, because the Final Showdown asks the player to
            perform two moves they only ever refereed before. */}
        <li>
          {(() => {
            const locked = !isCleared(REFEREE_LEVELS[REFEREE_LEVELS.length - 1].slug);
            return (
              <button
                className={`level-card level-card-boss${locked ? ' is-locked' : ''}`}
                disabled={locked}
                onClick={onFinal}
              >
                <span className="level-n">{locked ? '\u{1F512}' : '7'}</span>
                <span className="level-mid">
                  <span className="level-title">The Final Showdown</span>
                  <span className="level-sub">
                    {locked ? 'clear level 6 first' : `Be generous · ${SUNGMIN}`}
                  </span>
                </span>
                {isCleared(FINAL_SLUG) && <span className="level-done">played</span>}
              </button>
            );
          })()}
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
        opponent={{ emoji: level.bossEmoji, name: level.boss, epithet: level.bossEpithet }}
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

  // True while the drill's cursor is behind the newest line. The rule card rail
  // sits outside the drill and would otherwise offer a call on a specimen the
  // player has not stepped forward to read (Steve's standing playtest ruling:
  // "don't let the game move on when the player doesn't engage properly").
  //
  // Declared up here with the other hooks, not down beside the one line that
  // reads it: the boss intro below returns early, and a hook that sits after an
  // early return stops being called the moment that branch is taken. React
  // counts hooks, so the first render of the boss intro threw "rendered fewer
  // hooks than expected" and took the whole room down with it.
  const [drillBehind, setDrillBehind] = useState(false);

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

  // Training and a fight are two different rooms now. Steve, 2026-08-25: "The
  // coach was just training me, and that wasn't actually Victor... I think the
  // training can be in the same format, but it needs to be a one-at-a-time
  // stepper. Like the discussion with the coach. It can't be in the chat room.
  // The chat room is only for The actual bosses."
  //
  // The engine does not change. Every level's last beat is its boss beat, and
  // beginBoss already clears the thread on the way in, so the switch is a view
  // choice made off the beat we are standing in.
  const inBoss = level.beats[gym.beatIndex]?.boss === true;

  const railLive = inBoss || !drillBehind;

  const composerNode = gym.finished ? (
    <div className="composer">
      <button className="btn btn-wide" onClick={onExit}>
        Back to the gym
      </button>
    </div>
  ) : (
    <Composer state={gym.composer} onSubmit={gym.submit} onResize={land} />
  );

  return (
    <div className={`page page-level${inBoss ? '' : ' page-drill'}`}>
      <Mast
        slim
        right={
          <button className="link" onClick={onExit}>
            Leave
          </button>
        }
      />
      {/* Whoever is across from you right now, which in the practice room is
          the coach. Steve, 2026-08-25: "it's weird because Victor is there but
          we're not playing him? What's going on? At this point we should be
          playing the coach and the coach should be like sparring with us. So
          the coach is the person on the left side. Don't put Victor up there."
          Victor's face comes back the moment the walk-out screen is over. */}
      <Header
        title={level.title}
        teaches={level.teaches}
        beatName={gym.beatName}
        purses={{
          player: gym.playerTokens,
          opponent: gym.opponentTokens,
          opponentLabel: inBoss ? level.boss.split(' ')[0].toLowerCase() : 'coach',
          opponentEmoji: inBoss ? level.bossEmoji : COACH_EMOJI,
          playerEmoji: avatar,
        }}
      />
      {inBoss ? (
        <>
          <Thread
            ref={thread}
            messages={gym.messages}
            avatars={{ coach: COACH_EMOJI, opponent: level.bossEmoji, player: avatar }}
            waiting={gym.waiting}
            onSkip={gym.skip}
          />
          {composerNode}
        </>
      ) : (
        <Drill
          messages={gym.messages}
          avatars={{ coach: COACH_EMOJI, opponent: COACH_EMOJI, player: avatar }}
          waiting={gym.waiting}
          onSkip={gym.skip}
          // null, so a training line that happens to say "Victor" does not deal
          // his baseball card in a room he is not in. See the Header note above.
          opponent={null}
          composer={composerNode}
          composerReady={gym.finished || gym.composer.kind !== 'locked'}
          onBehind={setDrillBehind}
        />
      )}
      <RuleCards
        enabled={[level.rule]}
        live={railLive ? liveCards(gym.composer.kind, call?.callable) : null}
        onCall={(f) => gym.submit(f, [])}
        pass={
          call && railLive
            ? { label: call.pass.label, onPass: () => gym.submit(call.pass.value, []) }
            : undefined
        }
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
        opponent={{ emoji: SOFIA_EMOJI, name: 'Slippery Sofia', epithet: 'Never raises her voice. Fouls you twice before you notice once.' }}
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

function Final({ avatar, onExit }: { avatar: string; onExit: () => void }) {
  const [stage, setStage] = useState<'prefight' | 'intro' | 'match'>('prefight');
  if (stage === 'prefight') {
    return (
      <Prefight
        steps={FINAL_PREFIGHT}
        enterLabel="In with Sung-min"
        onEnter={() => setStage('intro')}
        onExit={onExit}
        opponent={{ emoji: SUNGMIN_EMOJI, name: SUNGMIN, epithet: SUNGMIN_EPITHET }}
      />
    );
  }
  if (stage === 'intro') {
    return (
      <BossIntro
        fightNumber={7}
        boss={SUNGMIN}
        bossEmoji={SUNGMIN_EMOJI}
        epithet={SUNGMIN_EPITHET}
        playerEmoji={avatar}
        onStart={() => setStage('match')}
      />
    );
  }
  return <FinalRun avatar={avatar} onExit={onExit} />;
}

function FinalRun({ avatar, onExit }: { avatar: string; onExit: () => void }) {
  const match = useFinal();
  const thread = useRef<ThreadHandle>(null);
  const land = useCallback(() => {
    thread.current?.land();
  }, []);
  useLayoutEffect(land, [match.finished, land]);

  const call = match.composer.kind === 'call' ? match.composer : null;

  return (
    <div className="page page-level">
      <Mast
        slim
        right={
          <button className="link" onClick={onExit}>
            Leave
          </button>
        }
      />
      <Header
        title="The Final Showdown"
        teaches={`Bonuses: ${match.bonuses} of 3`}
        beatName={match.phase}
        purses={{
          player: match.playerTokens,
          opponent: match.bossTokens,
          opponentLabel: 'sung-min',
          opponentEmoji: SUNGMIN_EMOJI,
          playerEmoji: avatar,
        }}
      />
      <Thread
        ref={thread}
        messages={match.messages}
        avatars={{ coach: COACH_EMOJI, opponent: SUNGMIN_EMOJI, player: avatar }}
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

function Referee({
  level,
  avatar,
  onExit,
}: {
  level: RefereeLevel;
  avatar: string;
  onExit: () => void;
}) {
  const [stage, setStage] = useState<'prefight' | 'intro' | 'run'>('prefight');
  const fightNumber = REFEREE_LEVELS.indexOf(level) + 5;
  if (stage === 'prefight') {
    return (
      <Prefight
        steps={level.prefight}
        enterLabel="Take the whistle"
        onEnter={() => setStage('intro')}
        onExit={onExit}
        opponent={{ emoji: level.figureEmoji, name: level.figure, epithet: level.figureEpithet }}
      />
    );
  }
  if (stage === 'intro') {
    return (
      <BossIntro
        fightNumber={fightNumber}
        boss={level.figure}
        bossEmoji={level.figureEmoji}
        epithet={level.figureEpithet}
        // The walk-out is between the two people who are about to argue, and
        // tonight neither of them is the player. Ray's face goes in the near
        // corner because Ray is the one getting in the ring.
        playerEmoji={COACH_EMOJI}
        onStart={() => setStage('run')}
      />
    );
  }
  return <RefereeRun level={level} avatar={avatar} onExit={onExit} />;
}

function RefereeRun({
  level,
  avatar,
  onExit,
}: {
  level: RefereeLevel;
  avatar: string;
  onExit: () => void;
}) {
  const run = useReferee(level, avatar);
  const thread = useRef<ThreadHandle>(null);
  const land = useCallback(() => {
    thread.current?.land();
  }, []);
  useLayoutEffect(land, [run.finished, land]);

  const call = run.composer.kind === 'call' ? run.composer : null;

  return (
    <div className="page page-level">
      <Mast
        slim
        right={
          <button className="link" onClick={onExit}>
            Leave
          </button>
        }
      />
      <Header
        title={level.title}
        teaches={`Your calls: ${run.correct} of ${run.judged}`}
        beatName={run.phase}
        purses={{
          player: run.rayTokens,
          opponent: run.figureTokens,
          opponentLabel: level.figure.split(' ')[0].toLowerCase(),
          opponentEmoji: level.figureEmoji,
          playerEmoji: COACH_EMOJI,
          playerLabel: 'ray',
        }}
      />
      <Thread
        ref={thread}
        messages={run.messages}
        avatars={{ coach: COACH_EMOJI, opponent: level.figureEmoji, player: COACH_EMOJI }}
        waiting={run.waiting}
        onSkip={run.skip}
      />
      {run.finished ? (
        <div className="composer">
          <button className="btn btn-wide" onClick={onExit}>
            Back to the gym
          </button>
        </div>
      ) : (
        <Composer state={run.composer} onSubmit={run.submit} onResize={land} />
      )}
      <RuleCards
        enabled={CARD_ORDER}
        live={liveCards(run.composer.kind, call?.callable)}
        onCall={(f) => run.submit(f)}
        pass={call ? { label: call.pass.label, onPass: () => run.submit(call.pass.value) } : undefined}
      />
    </div>
  );
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
      <Mast
        slim
        right={
          <button className="link" onClick={onExit}>
            Leave
          </button>
        }
      />
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
