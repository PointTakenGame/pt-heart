import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

// The only server-side surface in the MVP is /api/coach, a Vercel function.
// Vercel is not running in local dev, so the plugin below stands in for it: it
// loads api/coach.ts through Vite's own transform pipeline and hands it a real
// Request, which means there is exactly one implementation of the coach and
// local play exercises the same code that ships.
//
// The key is read from a file outside this repo, never from anything committed
// here. Order: ANTHROPIC_API_KEY in the environment, else the first
// ANTHROPIC_API_KEY= line of HEART_KEY_FILE, else the shared operator key file.
// If none of those resolve, the handler returns 503 and the client falls back
// to authored coach lines, so the gym stays playable with no key at all.

// The _secrets/anthropic.env copy of this key is dead (401, confirmed
// 2026-08-24). The live operator key sits with the other Point Taken service
// keys. Read only, never printed, never committed.
const DEFAULT_KEY_FILE =
  '/Users/stevefranconeri/Documents/Claude/Projects/point-taken-biz/api-keys/claude-api-key.env';

function loadKey(): string | undefined {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  const path = process.env.HEART_KEY_FILE ?? DEFAULT_KEY_FILE;
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = /^\s*ANTHROPIC_API_KEY\s*=\s*(.+?)\s*$/.exec(line);
      if (m) return m[1].replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // no key file is a normal state, not an error
  }
  return undefined;
}

function coachDevApi(): Plugin {
  return {
    name: 'heart-coach-dev-api',
    configureServer(server: ViteDevServer) {
      const key = loadKey();
      if (key) process.env.ANTHROPIC_API_KEY = key;
      // Report presence only. The value never goes to stdout or to disk.
      server.config.logger.info(
        key
          ? '  coach: live (key loaded, model answers)'
          : '  coach: offline (no key, authored fallbacks)',
      );

      server.middlewares.use('/api/coach', (req, res) => {
        void (async () => {
          try {
            const chunks: Buffer[] = [];
            for await (const c of req) chunks.push(c as Buffer);
            const mod = await server.ssrLoadModule('/api/coach.ts');
            const handler = mod.default as (r: Request) => Promise<Response>;

            const out = await handler(
              new Request('http://local/api/coach', {
                method: req.method ?? 'POST',
                headers: { 'content-type': 'application/json' },
                body: chunks.length ? Buffer.concat(chunks) : undefined,
              }),
            );

            res.statusCode = out.status;
            out.headers.forEach((v, k) => res.setHeader(k, v));
            res.end(Buffer.from(await out.arrayBuffer()));
          } catch (err) {
            server.config.logger.error(`[coach] ${String(err)}`);
            res.statusCode = 500;
            res.end('coach dev proxy failed');
          }
        })();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), coachDevApi()],
  // 5273 by default, but the harness that runs this preview assigns a port when
  // another session already holds that one, and it passes it in PORT.
  server: { port: Number(process.env.PORT) || 5273 },
});
