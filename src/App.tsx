// Four screens: the front page, level select, the gym thread, and the showdown.
// Everything that carries game state lives in the two thread screens.

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { LEVELS } from './content/index.ts';
import type { FoulType, LevelDef } from './types.ts';
import { useGym } from './engine.ts';
import { Composer } from './ui/Composer.tsx';
import { Thread, type ThreadHandle } from './ui/Thread.tsx';
import { Drill } from './ui/Drill.tsx';
import { Header } from './ui/Header.tsx';
import { RuleCards, RuleCardMini, RuleCardFull } from './ui/RuleCards.tsx';
import { BossIntro } from './ui/BossIntro.tsx';
import { Prefight } from './ui/Prefight.tsx';
import { Mast } from './ui/Mast.tsx';
import { useShowdown } from './showdown.ts';
import { SHOWDOWN_PREFIGHT, SHOWDOWN_SLUG, SOFIA_EMOJI } from './content/showdown.ts';
import { CARD_ORDER } from './content/cards.ts';
import { COACH_EMOJI, DEFAULT_AVATAR, shuffledAvatars } from './avatars.ts';
import { getAvatar, isCleared, setAvatar } from './storage.ts';

/** The Showdown's position on the ladder, read off the ladder rather than typed
 *  in. It was hardcoded to 4 and was already wrong (defect 9). */
const SHOWDOWN_NUMBER = LEVELS.findIndex((l) => l.slug === SHOWDOWN_SLUG) + 1;

type Screen =
  | { name: 'front' }
  | { name: 'select' }
  | { name: 'level'; level: LevelDef }
  | { name: 'showdown' };

export function App() {
  // Q4: the Level-0 conduct agreement is cut. It moves to signup, and nothing in
  // the app asks the player to accept anything any more.
  //
  // What is cut is the *gate*, not the screen below it. The gate was this route
  // being conditional on saved progress — a first visit was held here until the
  // player pressed a button, and a returning one never saw the screen again. It
  // is now simply the front page: unconditional, always where the app opens,
  // agreeing to nothing, with a way into the gym.
  const [screen, setScreen] = useState<Screen>({ name: 'front' });
  const [avatar, setAvatarState] = useState<string>(() => getAvatar() ?? DEFAULT_AVATAR);

  const pickAvatar = (emoji: string) => {
    setAvatar(emoji);
    setAvatarState(emoji);
  };

  if (screen.name === 'front') return <FrontPage onIn={() => setScreen({ name: 'select' })} />;
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

// The front page, rebuilt 2026-08-25 against page 1 of the printed deck
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
// Two clauses. Steve cut the other two on 2026-08-23. Do not reintroduce them,
// and do not delete these two: the conduct *gate* came off in the rebuild (Q4),
// the page did not, and these paragraphs are the page's own copy.
function FrontPage({ onIn }: { onIn: () => void }) {
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
  // one before it taught, and the Showdown assumes all three.
  const cleared = LEVELS.map((l) => isCleared(l.slug));
  const allCleared = cleared.every(Boolean);

  return (
    <div className="page page-narrow">
      <Mast slim />
      <h1>The gym</h1>
      <p className="muted">
        Five levels. One card and one opponent at a time, then everything you have learned
        in one match.
      </p>

      <div className="picker picker-done">
        <span className="picker-you" aria-hidden="true">{avatar}</span>
        <span className="picker-label">Your fighter</span>
        <button className="link" onClick={() => setPicking(true)}>
          change
        </button>
      </div>

      {/* Every row is data, including the Showdown. It used to be a second,
          hand-written row sitting outside this map, which is how it drifted out
          of step with the four above it (defect 9). All that differs now is
          which screen a row opens.

          A locked row prints "Locked" instead of its title. That is not
          decoration: level 4 is where the referee is introduced, and CLAUDE.md
          withholds the word, the role and the three-player structure until then
          — a locked row showing "In the ref seat" would leak it on the very
          first screen of the game. Uniform, so no row is a special case. */}
      <ul className="levels">
        {LEVELS.map((row, i) => {
          const locked = i > 0 && !cleared[i - 1];
          const done = cleared[i];
          return (
            <li key={row.slug}>
              <button
                className={`level-card${row.screen === 'showdown' ? ' level-card-showdown' : ''}${
                  locked ? ' is-locked' : ''
                }`}
                disabled={locked}
                onClick={() => (row.screen === 'showdown' ? onShowdown() : onPick(row.level))}
              >
                <span className="level-n">{locked ? '\u{1F512}' : i + 1}</span>
                <span className="level-mid">
                  <span className="level-title">{locked ? 'Locked' : row.title}</span>
                  {/* Q20: a cleared row reports the rule it taught and nothing
                      else. No tokens, no foul counts, no time — the same line
                      for everyone who finished it. */}
                  <span className="level-sub">
                    {locked
                      ? `clear level ${i} first`
                      : done
                        ? `Learned: ${row.teaches}`
                        : `${row.teaches} \u00b7 ${row.boss}`}
                  </span>
                </span>
                {/* The replay affordance is the row itself: a cleared row stays
                    live and reopens the level. The badge just says so. */}
                {done && <span className="level-done">Replay</span>}
              </button>
            </li>
          );
        })}
        {/* Q5: live play sits behind the whole ladder, and it is not built. The
            row is here so that clearing level 5 lands on something — the lock
            comes off and the row changes — rather than on an unchanged screen.
            It never becomes clickable in this build. */}
        <li>
          <button className={`level-card level-card-live${allCleared ? '' : ' is-locked'}`} disabled>
            <span className="level-n">{allCleared ? '\u{1F91D}' : '\u{1F512}'}</span>
            <span className="level-mid">
              <span className="level-title">{allCleared ? 'Live play' : 'Locked'}</span>
              <span className="level-sub">
                {allCleared
                  ? 'Unlocked \u00b7 two humans and a referee \u00b7 not built yet'
                  : 'clear the whole ladder first'}
              </span>
            </span>
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

// Q21: one plain sentence naming the rep the player just finished, in the coach's
// register — no counts, no tokens, no score, the same line for everyone who
// cleared the level. "Foul" for the act, "card" for the object, nothing invented.
const DID: Record<FoulType, string> = {
  judging: 'You caught the jabs at the person and put them back on the argument.',
  opinion_as_fact:
    'You caught opinions wearing the costume of a fact, and marked them as your own view.',
  fake_listening: 'You summarized the other side until they agreed you had it right.',
};

// The end-of-level review (Q21). One quiet screen: the card the level taught,
// its Trains band (printed on the card itself), and the line above. No modal, no
// confetti, no score — the reps are over and this is just the closing card on
// the table. The referee level taught all three, so it lays out all three; a
// one-card level shows the one it drilled.
function Review({ level, onExit }: { level: LevelDef; onExit: () => void }) {
  const referee = level.seat === 'referee';
  const cards = referee ? level.cards : [level.rule];
  const did = referee
    ? "You sat in the ref's chair and called the fouls on both sides — no arguing, just the calls."
    : DID[level.rule];
  return (
    <div className="page page-narrow page-review">
      <Mast slim right={<button className="link" onClick={onExit}>Leave</button>} />
      <div className="review-body">
        <p className="review-eyebrow">Level cleared</p>
        <h1 className="review-title">{level.title}</h1>
        <p className="review-did">{did}</p>
        <div className="review-cards">
          {cards.map((rule) => (
            <RuleCardFull key={rule} rule={rule} />
          ))}
        </div>
        <button className="btn btn-wide" onClick={onExit}>
          Back to the gym
        </button>
      </div>
    </div>
  );
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

  // The reps are done: the whole room gives way to the one review screen (Q21),
  // rather than swapping the composer for a lone "Back to the gym" button under a
  // thread that has nothing left to do.
  if (gym.finished) {
    return <Review level={level} onExit={onExit} />;
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

  const composerNode = <Composer state={gym.composer} onSubmit={gym.submit} onResize={land} />;

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
          composerReady={gym.composer.kind !== 'locked'}
          onBehind={setDrillBehind}
        />
      )}
      <RuleCards
        enabled={level.cards}
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
        fightNumber={SHOWDOWN_NUMBER}
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
