// Five screens: the front page, level select, the gym thread, the showdown, and
// the referee levels. Everything that carries game state lives in the three
// thread screens.

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { LEVELS } from './content/index.ts';
import type { FoulType, LevelDef } from './types.ts';
import { useGym, type ReviewTurn } from './engine.ts';
import { Composer } from './ui/Composer.tsx';
import { Thread, type ThreadHandle } from './ui/Thread.tsx';
import { Drill } from './ui/Drill.tsx';
import { Header } from './ui/Header.tsx';
import { RuleCards, RuleCardFull, RuleCardMini } from './ui/RuleCards.tsx';
import { OnTable, tableLine } from './ui/OnTable.tsx';
import { BossIntro } from './ui/BossIntro.tsx';
import { Prefight } from './ui/Prefight.tsx';
import { Mast } from './ui/Mast.tsx';
import { Onboarding } from './ui/Onboarding.tsx';
import { PitchCopy } from './ui/Pitch.tsx';
import { useShowdown } from './showdown.ts';
import { useReferee } from './referee.ts';
import { useFinal } from './final.ts';
import { useRoom, type Person } from './room.ts';
import { LIVE_TOPICS, TOPIC_FOOTER, type Seat } from './content/room.ts';
import { drawPeople } from './avatars.ts';
import {
  REFEREE_LEVELS,
  REF_SEAT_LEVEL,
  leftSeat,
  type RefereeLevel,
} from './content/referee.ts';
import { SHOWDOWN_ID, SHOWDOWN_PREFIGHT, SOFIA_EMOJI } from './content/showdown.ts';
import {
  FINAL_ID,
  FINAL_PREFIGHT,
  SUNGMIN,
  SUNGMIN_EMOJI,
  SUNGMIN_EPITHET,
} from './content/final.ts';
import { CARDS, CARD_ORDER } from './content/cards.ts';
import { LEVEL_ID } from './content/ids.ts';
import { COACH_EMOJI, DEFAULT_AVATAR, shuffledAvatars } from './avatars.ts';
import { getAvatar, isCleared, setAvatar } from './storage.ts';

// The ladder's rung numbers, read off the ladder rather than typed in. They
// were hardcoded in eight places and two of them were already wrong once. The
// seven-rung ladder (docs/design/ladder-spec.md) renumbers these again, and
// when it does the only edits should be to the arrays these count.
const REF_SEAT_NUMBER = LEVELS.length + 1;
const SOFIA_NUMBER = REF_SEAT_NUMBER + 1;
const REFEREE_NUMBER_BASE = SOFIA_NUMBER + 1;
const FINAL_NUMBER = REFEREE_NUMBER_BASE + REFEREE_LEVELS.length;

// Steve's ruling of 2026-09-07, second pass, which replaces the first one. The
// first read of his ruling froze the Sofia match along with everything above it.
// That was wrong, and he said so: "so are you saying that there's level one, two,
// three where you are just being trained, level four where you play the referee,
// and then level five is when you actually play as a player. If that is what
// Nathan's saying, I like that idea." It is. So rungs 1 to 5 are the core game
// and all five are playable: three to learn the cards, the referee's chair, then
// the match against the boss.
//
// Rungs 6 to 8 were frozen behind FROZEN_ABOVE_SOFIA while the Humility Showdown
// phase was being restructured. The freeze came off on 2026-09-07, in the build
// of items 5 to 7 of Steve's seven-item list, and it came off in one piece rather
// than a rung at a time, because the three rungs are one lesson split three ways
// and none of them stands alone.
//
// The Final Showdown asks the player to do three things in a row: summarize
// Sung-min better than he summarized them, say what they learned, and say why he
// might think differently. Rung 6 is a referee's seat on the second of those and
// rung 7 is a referee's seat on the third, and both exist because those two moves
// have a foul hiding inside them that looks exactly like the bonus. "I learned
// that you don't understand this" opens like a learning sentence and is a verdict
// at two tokens. "You think that because you value fairness" earns a token and
// "you think that because you don't care" costs two, and they are the same
// sentence pointed the other way. Shipping rung 8 without 6 and 7 would ask the
// player to perform, cold, the two moves the game has never let them watch. So
// the whole phase is open or none of it is.
//
// This is my call, not a ruling of Steve's: HEART-T260907-37 is his row to
// overrule it. All three rungs were fully authored and wired the whole time they
// were frozen; nothing here was written tonight except the gating.
//
// The reason the numbering kept drifting was a name, not a number. Rung 5 used to
// be called "The Showdown", which collides with Humility Showdown, the name of the
// phase that starts at rung 6. Steve: "we shouldn't call it Sofia Showdown because
// that is what confused me, because the Humility Showdown is the second phase of
// the game." Rung 5 is now just the boss's name.

type Screen =
  | { name: 'front' }
  | { name: 'onboarding' }
  | { name: 'select' }
  | { name: 'level'; level: LevelDef }
  | { name: 'showdown' }
  | { name: 'referee'; level: RefereeLevel }
  | { name: 'final' }
  | { name: 'door'; seat: Seat }
  | { name: 'live'; seat: Seat; topic: string };

export function App() {
  // The front page is where the app opens, every time, for everybody. It used
  // to be a gate: a first-visit-only screen you agreed to before you were let
  // in, which meant a returning player never saw it again. Steve, 2026-09-07:
  // "there used to be a homepage for this entire humility showdown game. It
  // would show something that looks a lot like the first page of the PDF. Where
  // did that go?" It went behind the gate, the first time he cleared a level.
  // The gate is retired (his same message: "We don't need a separate agreement
  // page anymore. You can retire that."); the page stays, and the ladder's
  // masthead has a way back to it.
  const [screen, setScreen] = useState<Screen>({ name: 'front' });
  const [avatar, setAvatarState] = useState<string>(() => getAvatar() ?? DEFAULT_AVATAR);

  const pickAvatar = (emoji: string) => {
    setAvatar(emoji);
    setAvatarState(emoji);
  };

  if (screen.name === 'front') return <FrontPage onIn={() => setScreen({ name: 'onboarding' })} />;
  if (screen.name === 'onboarding') {
    return <Onboarding onDone={() => setScreen({ name: 'select' })} />;
  }
  if (screen.name === 'select') {
    return (
      <Select
        avatar={avatar}
        onAvatar={pickAvatar}
        onHome={() => setScreen({ name: 'front' })}
        onPick={(level) => setScreen({ name: 'level', level })}
        onShowdown={() => setScreen({ name: 'showdown' })}
        onReferee={(level) => setScreen({ name: 'referee', level })}
        onFinal={() => setScreen({ name: 'final' })}
        onLive={(seat) => setScreen({ name: 'door', seat })}
      />
    );
  }
  if (screen.name === 'door') {
    return (
      <Door
        seat={screen.seat}
        onEnter={(topic) => setScreen({ name: 'live', seat: screen.seat, topic })}
        onExit={() => setScreen({ name: 'select' })}
      />
    );
  }
  if (screen.name === 'live') {
    return (
      <LiveRoom
        seat={screen.seat}
        topic={screen.topic}
        avatar={avatar}
        onExit={() => setScreen({ name: 'select' })}
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
// The front page, off page 1 of the printed deck. It is not an agreement and it
// asks for nothing: it says what the game is, shows the three fouls, and opens
// the door. The two conduct clauses stay (Steve cut the other two on
// 2026-08-23); they are this page's own copy, not the gate's.
function FrontPage({ onIn }: { onIn: () => void }) {
  return (
    <div className="page page-front">
      <Mast />

      <div className="front-body">
        <PitchCopy />

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

        {/* The conduct agreement used to sit here, as a second clause: "You can
            leave anytime. End a round at any point, no explanation owed. Nothing
            is tracked against you for leaving."

            It is gone from this page. Nathan's ruling Q4, which Steve adopted on
            2026-09-07 ("do whatever Nathan wants"): the conduct agreement belongs
            to signup, not to the front page. Signup does not exist yet, so the
            text is parked in docs/roadmap.md against the signup work rather than
            left here. Do not put it back on this page; put it in signup.

            The clause above it stays. That one is the pitch, not conduct: it says
            what the game is for. Q4 cut the agreement, not the thesis. */}

        <button className="btn btn-wide btn-in" onClick={onIn}>
          I&rsquo;m in
        </button>
      </div>

      <footer className="front-foot">
        <div className="front-foot-left">Humility Showdown &middot; Copyright 2026 Experception LLC</div>
        <div className="front-foot-right">Internal playtest. Do not post or distribute.</div>
      </footer>

      {/* The clause that used to sit above the button promised nothing was kept
          against you. That clause moved to signup, and signup does not exist,
          but since 2026-09-01 every answered item has been posted to the
          research table. A promise that is gone and a practice that is live is
          the wrong pair, so the disclosure stands on its own here until signup
          carries it. Steve approved it 2026-09-07. Say it plainly and say what
          is NOT kept, because that is the part people want to know. */}
      <p className="front-foot-note">
        What you type here is saved for research. No name, no email, no account:
        just a random id for this browser.
      </p>
    </div>
  );
}

function Select({
  avatar,
  onAvatar,
  onHome,
  onPick,
  onShowdown,
  onReferee,
  onFinal,
  onLive,
}: {
  avatar: string;
  onAvatar: (emoji: string) => void;
  onHome: () => void;
  onPick: (l: LevelDef) => void;
  onShowdown: () => void;
  onReferee: (l: RefereeLevel) => void;
  onFinal: () => void;
  onLive: (seat: Seat) => void;
}) {
  // Two screens, not one. Steve, 2026-08-25: "Let them choose their fighter. And
  // then hit done and then show the levels. Don't show them both at once." So
  // picking is a full screen of its own, and Change goes back to it.
  const [picking, setPicking] = useState(getAvatar() === null);
  // Dealt once, when the screen mounts, so the grid does not reshuffle under the
  // player's finger every time they try a face on.
  const [tiles] = useState(shuffledAvatars);
  // The top of this screen used to be "The gym"'s own heading, with the two
  // live-play doors stranded at the foot below the whole ladder. Training and
  // the two live doors are three different things to walk into, so they are a
  // choice first and a ladder second; the ladder (and the fighter-change strip
  // that sits with it) is one tap behind "The gym".
  const [view, setView] = useState<'choice' | 'ladder'>('choice');

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
        {/* Done commits the face, including the default one nobody tapped.
            Without this, getAvatar() stays null and every Leave reopens the picker. */}
        <button
          className="btn btn-wide"
          onClick={() => {
            onAvatar(avatar);
            setPicking(false);
          }}
        >
          Done
        </button>
      </div>
    );
  }

  if (view === 'choice') {
    return (
      <div className="page page-narrow">
        {/* The way back to the front page. Without it the page is unreachable
            the moment you walk into the gym, which is how it went missing. */}
        <Mast
          slim
          right={
            <button className="link" onClick={onHome}>
              Front page
            </button>
          }
        />
        <div className="choice">
          {/* Training is the on-ramp everyone should take before a live round,
              so it is the one filled, dark, primary card; the two live doors
              below are equal-weight outlines. Tapping it does not skip to a
              level, it opens the ladder below, which is already wired to
              onPick per row. */}
          <button className="choice-primary" onClick={() => setView('ladder')}>
            <span className="choice-title">The gym</span>
            <span className="choice-sub">
              Three levels to learn the cards, one in the referee&rsquo;s chair, then
              everything at once against the boss.
            </span>
          </button>

          <div>
            <h2 className="live-head">Live play</h2>
            <p className="muted">
              A real disagreement, three seats, no lesson. Pick which one you are in.
            </p>
            {/* Live play has no gate. Steve's ruling of 2026-09-05
                (HEART-T260905-02) overturned the roadmap line that unlocked it
                behind the gym: anyone can walk straight into a real match. A
                player who has not fought Sofia is warned on the way in and then
                let through, and the warning lives on the Door screen because
                that is already the step between this button and the room. */}
            <div className="choice-row">
              <button className="choice-outline" onClick={() => onLive('player')}>
                Play a round
              </button>
              <button className="choice-outline" onClick={() => onLive('referee')}>
                Referee a round
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // The ladder is a ladder. Steve's ruling of 2026-08-24: level 2 cannot be
  // opened before level 1 is cleared, because each level assumes the card the
  // one before it taught, and the showdown assumes all three.
  const cleared = LEVELS.map((l) => isCleared(l.id));
  const allCleared = cleared.every(Boolean);

  return (
    <div className="page page-narrow">
      {/* Back to the choice screen, not the front page: that link now lives
          there, one level up from here. */}
      <Mast
        slim
        right={
          <button className="link" onClick={() => setView('choice')}>
            Back
          </button>
        }
      />
      <h1>The gym</h1>
      {/* One line, and it stops at the rung you can currently see the point of.
          The Humility Showdown is the second half of the ladder and the name
          means nothing until you have been through the first half, so it is not
          named here. The rungs themselves say what they are when they open. */}
      <p className="muted">
        Three levels to learn the cards, one in the referee&rsquo;s chair, then
        everything at once against the boss.
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
          const done = cleared[i];
          const card = CARDS[l.rule];
          return (
            <li key={l.slug}>
              <button
                className={`level-card${locked ? ' is-locked' : ''}${done ? ' is-cleared' : ''}`}
                disabled={locked}
                onClick={() => onPick(l)}
              >
                <span className="level-n">{locked ? '\u{1F512}' : i + 1}</span>
                <span className="level-mid">
                  <span className="level-title">{l.title}</span>
                  {/* Nathan ruling Q20: a row that has been cleared should say
                      which card it taught and offer the way back in, and it
                      should not say anything else. No score, no attempt count,
                      no percentage; a rung can be retried until it is right, so
                      any number here is either a foregone conclusion or a
                      punishment for having learned out loud.

                      An uncleared row says what it is about to teach and who is
                      across the table. A locked one says only what to do next,
                      because nothing else about it is actionable yet. */}
                  <span className="level-sub">
                    {locked
                      ? `clear level ${i} first`
                      : done
                        ? `${card.emoji} ${card.name}`
                        : `${l.teaches} \u00b7 ${l.boss}`}
                  </span>
                </span>
                {done && (
                  <span className="level-state">
                    <span className="level-done">cleared</span>
                    <span className="level-replay">Replay</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {/* Rung 4, the twist. The word "referee" is withheld through levels 1 to
            3 and lands here, so this sits below Sofia rather than with the two
            referee levels above her. It opens on the same key her match does,
            the three gym levels. */}
        <li>
          <button
            className={`level-card${allCleared ? '' : ' is-locked'}`}
            disabled={!allCleared}
            onClick={() => onReferee(REF_SEAT_LEVEL)}
          >
            <span className="level-n">{allCleared ? REF_SEAT_NUMBER : '\u{1F512}'}</span>
            <span className="level-mid">
              <span className="level-title">{REF_SEAT_LEVEL.title}</span>
              <span className="level-sub">
                {allCleared
                  ? 'You referee · Victor and Olivia'
                  : 'clear all three levels first'}
              </span>
            </span>
            {isCleared(REF_SEAT_LEVEL.id) && <span className="level-done">cleared</span>}
          </button>
        </li>
        <li>
          <button
            /* A frozen rung is a frozen rung. The boss styling, purple border and
               a darker ground, is what tells you a rung is not another drill, and
               at 45% opacity it was still loud enough that the two boss rungs read
               as a different kind of locked from the referee rungs beside them.
               Steve, 2026-09-07: "can you just reset the flag so they all appear
               the same". So the boss look is earned by being playable. */
            className={`level-card${allCleared ? ' level-card-boss' : ' is-locked'}`}
            disabled={!allCleared}
            onClick={onShowdown}
          >
            <span className="level-n">{allCleared ? SOFIA_NUMBER : '\u{1F512}'}</span>
            <span className="level-mid">
              <span className="level-title">Slippery Sofia</span>
              <span className="level-sub">
                {allCleared
                  ? 'The boss \u00b7 all three cards'
                  : 'clear all three levels first'}
              </span>
            </span>
            {isCleared(SHOWDOWN_ID) && <span className="level-done">played</span>}
          </button>
        </li>
        {/* The referee levels. Ray goes down into the ring and the player takes
            the third seat, so these unlock behind the Sofia match: you get
            handed the whistle after you have been on the wrong end of one. */}
        {REFEREE_LEVELS.map((l, i) => {
          const locked =
            i === 0 ? !isCleared(SHOWDOWN_ID) : !isCleared(REFEREE_LEVELS[i - 1].id);
          return (
            <li key={l.slug}>
              <button
                className={`level-card${locked ? ' is-locked' : ''}`}
                disabled={locked}
                onClick={() => onReferee(l)}
              >
                <span className="level-n">{locked ? '\u{1F512}' : REFEREE_NUMBER_BASE + i}</span>
                <span className="level-mid">
                  <span className="level-title">{l.title}</span>
                  <span className="level-sub">
                    {locked
                      ? i === 0
                        ? 'play Sofia first'
                        : `clear level ${REFEREE_NUMBER_BASE + i - 1} first`
                      : `You referee · ${l.figure}`}
                  </span>
                </span>
                {isCleared(l.id) && <span className="level-done">cleared</span>}
              </button>
            </li>
          );
        })}
        {/* Level 7. Behind level 6, because the Final Showdown asks the player to
            perform two moves they only ever refereed before. */}
        <li>
          {(() => {
            const locked = !isCleared(REFEREE_LEVELS[REFEREE_LEVELS.length - 1].id);
            return (
              <button
                className={`level-card${locked ? ' is-locked' : ' level-card-boss'}`}
                disabled={locked}
                onClick={onFinal}
              >
                <span className="level-n">{locked ? '\u{1F512}' : FINAL_NUMBER}</span>
                <span className="level-mid">
                  <span className="level-title">The Final Showdown</span>
                  <span className="level-sub">
                    {locked
                      ? `clear level ${FINAL_NUMBER - 1} first`
                      : `Be generous · ${SUNGMIN}`}
                  </span>
                </span>
                {isCleared(FINAL_ID) && <span className="level-done">played</span>}
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

  // The rung is over, so the room is over. Nathan ruling Q21 puts a review
  // screen here rather than a button: "One end-of-level review screen: the card,
  // its `trains` line, what you did. No score, no confetti, no modal."
  if (gym.finished) {
    return <Review level={level} review={gym.review} onExit={onExit} />;
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

  const onTable = tableLine(gym.messages);

  // Nathan ruling Q22: nobody found out that a card opens. It is the one control
  // on the screen that does two entirely different things depending on the
  // moment, and the difference was never said out loud anywhere. So level 1, and
  // only level 1, says it, on the tray, pointing at the chips, and stops saying
  // it the first time a card is opened.
  const railHint =
    level.id === LEVEL_ID.gymJudging
      ? call
        ? undefined
        : 'Tap a card to read what it means.'
      : undefined;

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
        costs={level.tokens === 'live'}
      />
      {inBoss ? (
        <>
          {/* The strip the drill has always had, now in the fight too. Sofia
              speaks, two coach lines land on top of her, the composer opens, and
              the sentence you are ruling on is above the fold. It appears only
              while a ruling is open. */}
          {call && onTable && (
            <OnTable text={onTable} hint="Foul, or let it stand? Answer below." />
          )}
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
        hint={railHint}
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

/**
 * What just happened, at the end of a gym rung.
 *
 * Nathan ruling Q21: "One end-of-level review screen: the card, its `trains`
 * line, what you did. No score, no confetti, no modal." His learner report is
 * where the shape of the third clause comes from: five out of five playtesters
 * asked for "each line, my call, the ruling", and none of them could tell, from
 * any screen in the game, what they had got wrong.
 *
 * So: no tokens, no tally, no percentage. A rung can be retried until it is
 * right, which makes any score a foregone conclusion and a tally of retries a
 * punishment for learning out loud. What is on the screen instead is the card
 * the rung was teaching, printed face and all, and then every turn as it
 * happened: the line that was on the table, what the player did about it, and
 * what the coach said back.
 *
 * A full screen and not an overlay, because "no modal" is the ruling and
 * because the review is longer than a phone. It scrolls, deliberately: the gym
 * is open book, and re-reading the card here is the point of putting it here.
 */
function Review({
  level,
  review,
  onExit,
}: {
  level: LevelDef;
  review: ReviewTurn[];
  onExit: () => void;
}) {
  return (
    <div className="page page-review">
      <Mast
        slim
        right={
          <button className="link" onClick={onExit}>
            Leave
          </button>
        }
      />
      <div className="review">
        <p className="review-eyebrow">Round over</p>
        <h1 className="review-title">{level.title}</h1>
        <p className="review-teaches">{level.teaches}</p>

        {level.cards.map((rule) => (
          <div key={rule} className="review-card">
            <RuleCardFull rule={rule} />
          </div>
        ))}

        {review.length > 0 && (
          <>
            <h2 className="review-head">What you did</h2>
            <ol className="review-list">
              {review.map((turn) => (
                <ReviewRow key={turn.id} turn={turn} />
              ))}
            </ol>
          </>
        )}
      </div>
      <div className="composer">
        <button className="btn btn-wide" onClick={onExit}>
          Back to the gym
        </button>
      </div>
    </div>
  );
}

/** One turn. The specimen, then what the player said, then the ruling.
 *
 *  A turn the player got wrong the first time is marked, and marked quietly: a
 *  coloured edge on the row, no icon, no word "wrong". It is the row worth
 *  re-reading and it should be findable while scrolling, and it is also the row
 *  a player is most likely to feel got them, so the design pulls its punch on
 *  purpose. Turns with nothing to grade, the ones where the player wrote a
 *  sentence in their own words, carry no mark at all. */
function ReviewRow({ turn }: { turn: ReviewTurn }) {
  return (
    <li className={`review-turn${turn.clean === false ? ' is-missed' : ''}`}>
      {turn.line && <p className="review-specimen">{turn.line}</p>}
      <p className="review-said">{turn.said}</p>
      {turn.ruling && <p className="review-ruling">{turn.ruling}</p>}
    </li>
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
        fightNumber={SOFIA_NUMBER}
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
        fightNumber={FINAL_NUMBER}
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
  const onTable = tableLine(match.messages);

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
        costs
      />
      {call && onTable && (
        <OnTable text={onTable} hint="Foul, or let it stand? Answer below." />
      )}
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
      {!match.finished && (
        <RuleCards
          enabled={CARD_ORDER}
          live={liveCards(match.composer.kind, call?.callable)}
          onCall={(f) => match.submit(f, [])}
          pass={call ? { label: call.pass.label, onPass: () => match.submit(call.pass.value, []) } : undefined}
        />
      )}
    </div>
  );
}

/** The door to a live room: which seat, and what the argument is about. */
function Door({
  seat,
  onEnter,
  onExit,
}: {
  seat: Seat;
  onEnter: (topic: string) => void;
  onExit: () => void;
}) {
  const [topic, setTopic] = useState('');
  const ready = topic.trim().length >= 3;

  // Steve's ruling of 2026-09-05: warn the unprepared player, then let them
  // through. Prepared means the Showdown has been fought, because that is the
  // level the ruling called level 4 on the day it was made; the Third Chair was
  // inserted below it the next morning and pushed every number above it up one.
  // If the ladder renumbers again, this reads the slug, not the number.
  const prepared = isCleared(SHOWDOWN_ID);

  return (
    <div className="page page-narrow">
      <Mast
        slim
        right={
          <button className="link" onClick={onExit}>
            Back
          </button>
        }
      />
      <h1>{seat === 'player' ? 'Play a round' : 'Referee a round'}</h1>
      <p className="muted">
        {seat === 'player'
          ? 'You argue one side. Somebody takes the other. Ray watches your turns.'
          : 'Two people argue. You call what you see, and the one who got hit decides.'}
      </p>

      {!prepared && (
        <div className="door-warning">
          <p>
            You have not fought Sofia yet, so you have never had to use all three
            cards at once against someone who is trying to win. You can go in anyway. You
            just will not know what you are doing yet, and the person across from you is
            the one who finds that out.
          </p>
          <p className="door-warning-ask">
            Does the person you are playing with already know how the game works?
          </p>
        </div>
      )}

      <label className="door-label" htmlFor="live-topic">
        What is the disagreement?
      </label>
      <input
        id="live-topic"
        className="door-input"
        value={topic}
        placeholder="name the thing you two disagree about"
        onChange={(e) => setTopic(e.target.value)}
      />
      <p className="muted door-footer">{TOPIC_FOOTER}</p>

      <div className="door-chips">
        {LIVE_TOPICS.map((t) => (
          <button key={t} className="chip" onClick={() => setTopic(t)}>
            {t}
          </button>
        ))}
      </div>

      <button className="btn btn-wide" disabled={!ready} onClick={() => onEnter(topic.trim())}>
        {seat === 'player' ? 'Get in the room' : 'Take the whistle'}
      </button>
    </div>
  );
}

function LiveRoom({
  seat,
  topic,
  avatar,
  onExit,
}: {
  seat: Seat;
  topic: string;
  avatar: string;
  onExit: () => void;
}) {
  // Drawn once, before the match script starts, so the header and the thread
  // have faces to render from the first frame. The human's own avatar is passed
  // in as taken, so no seat in the room ever wears the face the player wears.
  const [people] = useState<Person[]>(() => drawPeople(seat === 'referee' ? 2 : 1, [avatar]));
  const a = people[0];
  const b = seat === 'referee' ? people[1] : null;

  const run = useRoom({ seat, topic, avatar, a, b });
  const thread = useRef<ThreadHandle>(null);
  const land = useCallback(() => {
    thread.current?.land();
  }, []);
  useLayoutEffect(land, [run.finished, land]);

  const call = run.composer.kind === 'call' ? run.composer : null;
  const onTable = tableLine(run.messages);
  const left = seat === 'referee' ? a : { name: 'You', emoji: avatar };
  const right = seat === 'referee' ? (b as Person) : a;

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
        title={seat === 'player' ? 'Live round' : 'You have the whistle'}
        teaches={topic.length > 64 ? `${topic.slice(0, 61)}...` : topic}
        beatName={run.phase}
        purses={{
          player: run.nearTokens,
          opponent: run.farTokens,
          opponentLabel: right.name.toLowerCase(),
          opponentEmoji: right.emoji,
          playerEmoji: left.emoji,
          playerLabel: left.name.toLowerCase(),
        }}
        costs
      />
      {call && onTable && (
        <OnTable text={onTable} hint="Foul, or let it stand? Answer below." />
      )}
      <Thread
        ref={thread}
        messages={run.messages}
        avatars={{ coach: COACH_EMOJI, opponent: right.emoji, player: left.emoji }}
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
      {!run.finished && (
        <RuleCards
          enabled={CARD_ORDER}
          live={liveCards(run.composer.kind, call?.callable)}
          onCall={(f) => run.submit(f)}
          pass={call ? { label: call.pass.label, onPass: () => run.submit(call.pass.value) } : undefined}
        />
      )}
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
  const left = leftSeat(level);
  // Rung 4 is a referee level that does not sit in REFEREE_LEVELS, so indexOf
  // would number it 4 and then 4 again for the pair below it.
  const fightNumber =
    level === REF_SEAT_LEVEL
      ? REF_SEAT_NUMBER
      : REFEREE_NUMBER_BASE + REFEREE_LEVELS.indexOf(level);
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
        // tonight neither of them is the player. The near corner is the left
        // seat's face: Ray in levels 5 and 6, Victor in level 4.
        playerEmoji={left.emoji}
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
  const left = leftSeat(level);
  const thread = useRef<ThreadHandle>(null);
  const land = useCallback(() => {
    thread.current?.land();
  }, []);
  useLayoutEffect(land, [run.finished, land]);

  const call = run.composer.kind === 'call' ? run.composer : null;
  const onTable = tableLine(run.messages);

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
          // Last word, not first: these figures are all epithet-then-name, so
          // the first word labelled Edwin's purse "enlightened" and would have
          // labelled Olivia's "obvious".
          opponentLabel: level.figure.split(' ').slice(-1)[0].toLowerCase(),
          opponentEmoji: level.figureEmoji,
          playerEmoji: left.emoji,
          playerLabel: left.name.split(' ').slice(-1)[0].toLowerCase(),
        }}
        costs
      />
      {call && onTable && (
        <OnTable text={onTable} hint="Foul, or let it stand? Answer below." />
      )}
      <Thread
        ref={thread}
        messages={run.messages}
        avatars={{ coach: COACH_EMOJI, opponent: level.figureEmoji, player: left.emoji }}
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
      {!run.finished && (
        <RuleCards
          enabled={CARD_ORDER}
          live={liveCards(run.composer.kind, call?.callable)}
          onCall={(f) => run.submit(f)}
          pass={call ? { label: call.pass.label, onPass: () => run.submit(call.pass.value) } : undefined}
        />
      )}
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
  const onTable = tableLine(match.messages);

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
        title="Slippery Sofia"
        teaches="All three cards"
        beatName={match.phase}
        purses={{
          player: match.playerTokens,
          opponent: match.sofiaTokens,
          opponentLabel: 'sofia',
          opponentEmoji: SOFIA_EMOJI,
          playerEmoji: avatar,
        }}
        costs
      />
      {call && onTable && (
        <OnTable text={onTable} hint="Foul, or let it stand? Answer below." />
      )}
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
      {!match.finished && (
        <RuleCards
          enabled={CARD_ORDER}
          live={liveCards(match.composer.kind, call?.callable)}
          onCall={(f) => match.submit(f, [])}
          pass={call ? { label: call.pass.label, onPass: () => match.submit(call.pass.value, []) } : undefined}
        />
      )}
    </div>
  );
}
