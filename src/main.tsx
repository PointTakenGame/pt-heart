import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { exportJson } from './storage.ts';
import './styles.css';

// No StrictMode. The beat runner is a sequence of timed side effects, and
// StrictMode's double-invoke in dev emits every scripted line twice.
createRoot(document.getElementById('root')!).render(<App />);

// The save file is the whole research corpus: every answer, and every revision
// trace behind it. Two ways out of the browser, both deliberately invisible to
// a player, because neither belongs on a screen someone is playing on.
//
// Ctrl/Cmd + Shift + E copies it to the clipboard, which is the desktop path.
// It is a dead key combo on a phone, so window.__export() is the other one:
// reachable from a Safari or Chrome inspector attached to the real device,
// which is where playtesting actually happens.
declare global {
  interface Window {
    __export?: () => string;
  }
}

window.__export = exportJson;

window.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey) || !e.shiftKey || e.key.toLowerCase() !== 'e') return;
  e.preventDefault();
  const json = exportJson();
  // Clipboard needs a secure context and can be refused; the log is the floor.
  navigator.clipboard?.writeText(json).catch(() => {});
  console.log(json);
});
