import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The only server-side surface in the MVP is /api/coach, a Vercel function.
// In local dev there is no Vercel runtime, so the client falls back to canned
// coach lines when the fetch fails (see src/coach.ts). That keeps the gym
// playable with no key and no server at all.
export default defineConfig({
  plugins: [react()],
  server: { port: 5273 },
});
