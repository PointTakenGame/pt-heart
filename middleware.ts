// Edge middleware: HTTP Basic Auth in front of the whole site.
//
// Steve's ruling 2026-08-24: the prototype must not sit public and open while
// the team is playing it. "At the very least we need some dumb password that is
// fairly secure that we type in even if we don't have real login auth right
// now." This is that. It is not a login system, it has no users, and it is not
// what ships; it is a door with one key that everybody on the team shares.
//
// The password lives in the SITE_PASSWORD project env var, never in the bundle.
// If that var is unset the site is CLOSED, not open: a missing password is the
// most likely failure and the wrong way to fail is wide open.
//
// Real auth arrives later from the Brain agent. Deleting this file is the whole
// removal step.

export const config = {
  // Everything except Vercel's own internals. The API route is behind the door
  // too; browsers resend Basic credentials on same-origin fetches, so the game's
  // calls to /api/coach keep working once the player is through.
  matcher: '/((?!_vercel).*)',
};

const REALM = 'Humility Showdown, internal playtest';

/** Compare without returning early on the first differing byte. */
function same(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function locked(body: string): Response {
  return new Response(body, {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'content-type': 'text/plain; charset=utf-8',
      // Nothing here should be cached by the CDN or indexed by anyone.
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export default function middleware(req: Request): Response | undefined {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    return locked(
      'This prototype is closed. No SITE_PASSWORD is configured on the deployment.',
    );
  }

  const header = req.headers.get('authorization') ?? '';
  if (!header.toLowerCase().startsWith('basic ')) return locked('Password required.');

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return locked('Password required.');
  }

  // Any username is fine. The password is the whole check.
  const supplied = decoded.slice(decoded.indexOf(':') + 1);
  if (!same(supplied, expected)) return locked('Wrong password.');

  return undefined; // through the door; serve the request normally
}
