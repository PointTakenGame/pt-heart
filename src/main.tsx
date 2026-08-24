import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles.css';

// No StrictMode. The beat runner is a sequence of timed side effects, and
// StrictMode's double-invoke in dev emits every scripted line twice.
createRoot(document.getElementById('root')!).render(<App />);
