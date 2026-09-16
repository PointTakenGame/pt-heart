// The pitch, in the deck's own wording (FrontPage's front-tag/front-quote,
// harvested off page 1 of the printed deck on 2026-08-25). Lifted out to its
// own component so the front page and the first onboarding screen, which are
// required to say the exact same thing, cannot drift apart by one being edited
// and not the other.
export function PitchCopy() {
  return (
    <>
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
    </>
  );
}
