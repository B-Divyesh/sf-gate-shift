import './styles.css';
import {
  FixedStepper,
  LINKED_GATE,
  applyMove,
  authoredLevels,
  chooseRing,
  clearedGates,
  type Direction,
  formatDirection,
  getDailyLevel,
  type GameRun,
  type Level,
  type RunStatus,
  ringNames,
  rotateRun,
  solveWithin,
  startRun,
  tokenSymbols,
  undoRun,
} from './game';

type Settings = { calmMotion: boolean; symbolsOnly: boolean };
type PersistedRun = Pick<GameRun, 'state' | 'movesLeft' | 'history' | 'status' | 'selectedRing'> & { levelId: string };
type AppState = {
  demo: boolean;
  run: GameRun;
  settings: Settings;
  paused: boolean;
  settingsOpen: boolean;
  preview: Direction | null;
  hint: string;
  announcement: string;
};

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('The game root is missing.');

const isDemoRoute = (): boolean => window.location.pathname === '/demo' || new URLSearchParams(window.location.search).get('demo') === '1';
const routePath = (): string => window.location.pathname.replace(/\/$/, '') || '/';
const namespace = (demo: boolean): string => demo ? 'demo:gate-shift' : 'gate-shift';
const storageKey = (demo: boolean, key: string): string => `${namespace(demo)}:${key}`;

const safeRead = <T,>(demo: boolean, key: string): T | null => {
  try {
    const raw = localStorage.getItem(storageKey(demo, key));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const safeWrite = (demo: boolean, key: string, value: unknown): void => {
  try {
    localStorage.setItem(storageKey(demo, key), JSON.stringify(value));
  } catch {
    // The game remains playable if private browsing blocks local storage.
  }
};

const getLevel = (id: string): Level | undefined => {
  if (!id.startsWith('daily-')) return authoredLevels.find((level) => level.id === id);
  const daily = getDailyLevel();
  return daily.id === id ? daily : undefined;
};

const validPuzzleState = (candidate: unknown): candidate is GameRun['state'] => {
  if (!candidate || typeof candidate !== 'object') return false;
  const value = candidate as GameRun['state'];
  return Array.isArray(value.angles)
    && value.angles.length === 6
    && value.angles.every((angle) => Number.isInteger(angle) && angle >= 0 && angle <= 3)
    && Array.isArray(value.gates)
    && value.gates.length === 6
    && value.gates.every((gate) => gate === 0 || gate === 1);
};

const validRun = (candidate: PersistedRun | null, demo: boolean): GameRun | null => {
  if (!candidate || !validPuzzleState(candidate.state)) return null;
  const level = getLevel(candidate.levelId);
  if (!level || (!demo && !level.free && !level.daily)) return null;
  if (!Number.isInteger(candidate.movesLeft) || candidate.movesLeft < 0 || candidate.movesLeft > level.budget) return null;
  if (!['active', 'won', 'lost'].includes(candidate.status as RunStatus)) return null;
  if (!Array.isArray(candidate.history) || !candidate.history.every(validPuzzleState)) return null;
  if (!Number.isInteger(candidate.selectedRing) || candidate.selectedRing < 0 || candidate.selectedRing >= 6) return null;
  return {
    level,
    state: { angles: [...candidate.state.angles], gates: [...candidate.state.gates] },
    movesLeft: candidate.movesLeft,
    history: candidate.history.slice(-30).map((entry) => ({ angles: [...entry.angles], gates: [...entry.gates] })),
    status: candidate.status,
    selectedRing: candidate.selectedRing,
  };
};

const initialState = (demo: boolean): AppState => {
  const persisted = validRun(safeRead<PersistedRun>(demo, 'run'), demo);
  const savedSettings = safeRead<Settings>(demo, 'settings');
  const systemCalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    demo,
    run: persisted ?? startRun(authoredLevels[0]),
    settings: {
      calmMotion: savedSettings?.calmMotion ?? systemCalm,
      symbolsOnly: savedSettings?.symbolsOnly ?? false,
    },
    paused: false,
    settingsOpen: false,
    preview: null,
    hint: '',
    announcement: '',
  };
};

let state = initialState(isDemoRoute());
let swipeStart: { x: number; y: number; ring: number } | null = null;
let didSwipe = false;
const fixedStepper = new FixedStepper();
let visualFrame = 0;
let previousFrameTime = performance.now();
let frameRequest = 0;

const runVisualLoop = (time: number): void => {
  fixedStepper.advance((time - previousFrameTime) / 1000, () => { visualFrame += 1; });
  previousFrameTime = time;
  if (visualFrame % 60 === 0) root.dataset.runtimeSeconds = String(visualFrame / 60);
  frameRequest = requestAnimationFrame(runVisualLoop);
};

const startVisualLoop = (): void => {
  if (!frameRequest && !document.hidden) {
    previousFrameTime = performance.now();
    frameRequest = requestAnimationFrame(runVisualLoop);
  }
};

const stopVisualLoop = (): void => {
  if (frameRequest) cancelAnimationFrame(frameRequest);
  frameRequest = 0;
  fixedStepper.reset();
};

const save = (): void => {
  const { run, demo, settings } = state;
  safeWrite(demo, 'run', {
    levelId: run.level.id,
    state: run.state,
    movesLeft: run.movesLeft,
    history: run.history,
    status: run.status,
    selectedRing: run.selectedRing,
  } satisfies PersistedRun);
  safeWrite(demo, 'settings', settings);
};

const navigate = (path: string): void => {
  const clean = path === '/demo' ? '/demo' : path;
  window.history.pushState({}, '', clean);
  state = initialState(isDemoRoute());
  render('#main h1');
};

const titleFor = (path: string): string => {
  if (path === '/privacy') return 'Privacy — Gate Shift';
  if (path === '/terms') return 'Terms — Gate Shift';
  if (path === '/demo') return 'Demo — Gate Shift';
  if (path !== '/') return 'Page not found — Gate Shift';
  return 'Gate Shift — rotate rings through gates';
};

const statusText = (run: GameRun): string => {
  if (run.status === 'won') return 'Board complete';
  if (run.status === 'lost') return 'Move budget used';
  return `${clearedGates(run.state)} of 6 gates clear`;
};

const routeAnnouncement = (): string => {
  const path = routePath();
  if (path === '/privacy') return 'Privacy page';
  if (path === '/terms') return 'Terms page';
  if (path === '/demo') return 'Demo game';
  if (path !== '/') return 'Page not found';
  return 'Gate Shift game';
};

const nav = (): string => `
  <header class="site-header">
    <a class="wordmark" href="/" data-nav>Gate Shift <span aria-hidden="true">↻</span></a>
    <nav aria-label="Primary navigation">
      <a href="/demo" data-nav>Demo</a>
      <a href="/#how-to-play">How to play</a>
      <a href="/privacy" data-nav>Privacy</a>
    </nav>
  </header>`;

const demoBanner = (): string => state.demo ? `
  <aside class="demo-banner" aria-label="Demo mode">
    <strong>Demo — sample data, nothing is saved.</strong>
    <span>The sample uses separate browser storage.</span>
    <button class="text-button" type="button" data-action="reset-demo">Reset demo</button>
    <button class="text-button" type="button" data-action="start-real">Start for real</button>
  </aside>` : '';

const facts = (): string => `
  <ul class="facts" aria-label="Game facts">
    <li>Three boards are free</li>
    <li>Progress stays in this browser</li>
    <li>Full set: $8 once</li>
  </ul>`;

const boardLevelOptions = (): string => {
  const cards = authoredLevels.map((level) => {
    const selected = level.id === state.run.level.id;
    const locked = !level.free;
    return `<button type="button" class="level-option ${selected ? 'selected' : ''}" data-level="${level.id}" ${locked ? 'disabled aria-disabled="true"' : ''}>
      <span>Board ${level.number}</span><strong>${level.name}</strong><small>${locked ? 'Full set' : `${level.budget} moves`}</small>
    </button>`;
  }).join('');
  const daily = getDailyLevel();
  return `<section class="level-strip" aria-labelledby="boards-heading">
    <div class="strip-heading"><h2 id="boards-heading">Choose a board</h2><p>Three boards are free. The daily board uses one fixed seed.</p></div>
    <div class="level-options">
      ${cards}
      <button type="button" class="level-option daily ${state.run.level.daily ? 'selected' : ''}" data-level="${daily.id}">
        <span>Daily</span><strong>${dailySeedLabel()}</strong><small>${daily.budget} moves</small>
      </button>
    </div>
  </section>`;
};

const dailySeedLabel = (): string => getDailyLevel().name.replace('Daily ', '');

const ringMarkup = (ring: number, board = state.run.state): string => {
  const { selectedRing } = state.run;
  const angle = board.angles[ring];
  const gate = board.gates[ring];
  const clear = angle === 0 && gate === 0;
  const symbol = tokenSymbols[ring];
  const visualSymbol = state.settings.symbolsOnly ? symbol : symbol;
  const direction = gate === 0 ? 'open' : 'reversed';
  const previewChanged = state.preview && (ring === selectedRing || ring === LINKED_GATE[selectedRing]);
  return `<button type="button" class="ring ${selectedRing === ring ? 'selected' : ''} ${clear ? 'clear' : ''} ${previewChanged ? 'preview-changed' : ''}" data-ring="${ring}" data-angle="${angle}" data-gate="${gate}" aria-pressed="${selectedRing === ring}" aria-label="Select ${ringNames[ring]} ring. Token ${symbol}; gate ${direction}; ${clear ? 'clear' : 'not clear'}.">
    <span class="ring-number" aria-hidden="true">${ring + 1}</span>
    <span class="gate-marker ${gate === 0 ? 'open' : 'reversed'}" aria-hidden="true">${gate === 0 ? '⊣' : '⊢'}</span>
    <span class="token token-${ring} angle-${angle}" aria-hidden="true">${visualSymbol}</span>
    <span class="ring-core" aria-hidden="true">${clear ? '✓' : '·'}</span>
  </button>`;
};

const gameBoard = (): string => {
  const run = state.run;
  const selected = ringNames[run.selectedRing];
  const inactive = run.status !== 'active' || state.paused;
  const previewState = state.preview
    ? applyMove(run.state, { ring: run.selectedRing, direction: state.preview })
    : run.state;
  const preview = state.preview ? `<div class="preview-bar" role="status">
    <p><strong>Preview only — no move used.</strong> ${state.preview === 'clockwise'
      ? `${selected} turns clockwise and ${ringNames[LINKED_GATE[run.selectedRing]]} gate reverses.`
      : `${selected} turns counterclockwise. Gates stay as they are.`} ${clearedGates(previewState)} of 6 gates would be clear.</p>
    <button type="button" class="primary-control" data-action="apply-preview">Take ${formatDirection(state.preview)}</button>
    <button type="button" data-action="cancel-preview">Cancel preview</button>
  </div>` : '';
  const hint = state.hint ? `<p class="hint" role="status">${state.hint}</p>` : '';
  return `<section class="game-shell layout-${run.level.layout} ${state.preview ? 'previewing' : ''}" aria-labelledby="board-heading">
    <div class="game-topline">
      <div><p class="eyebrow">${run.level.daily ? 'Daily board' : `Board ${run.level.number}`}</p><h2 id="board-heading">${run.level.name}</h2></div>
      <div class="run-stats" aria-label="Run status"><strong>${run.movesLeft}</strong><span>moves left</span><strong>${clearedGates(run.state)}/6</strong><span>gates clear</span></div>
    </div>
    <p class="board-rule"><span aria-hidden="true">↻</span> Short route turns clockwise and reverses its linked gate. <span aria-hidden="true">↺</span> Long route leaves gates unchanged.</p>
    <div class="board" aria-describedby="board-help">
      ${Array.from({ length: 6 }, (_, ring) => ringMarkup(ring, previewState)).join('')}
    </div>
    <p id="board-help" class="sr-only">Select a ring. Use the left and right arrow keys to rotate it. Use up and down arrows to select another ring.</p>
    <div class="controls" aria-label="Game controls">
      <p class="selected-label">Selected: <strong>${selected} ring</strong></p>
      <button type="button" data-action="preview-counterclockwise" aria-pressed="${state.preview === 'counterclockwise'}" ${inactive ? 'disabled' : ''}><span aria-hidden="true">↺</span> Preview long route</button>
      <button type="button" class="primary-control" data-action="preview-clockwise" aria-pressed="${state.preview === 'clockwise'}" ${inactive ? 'disabled' : ''}><span aria-hidden="true">↻</span> Preview short route</button>
      <button type="button" data-action="undo" ${run.history.length === 0 || state.paused ? 'disabled' : ''}>Undo free move</button>
      <button type="button" data-action="hint" ${inactive ? 'disabled' : ''}>Show next safe move</button>
      <button type="button" data-action="restart">Restart board</button>
      <button type="button" data-action="pause" ${run.status !== 'active' ? 'disabled' : ''}>${state.paused ? 'Resume board' : 'Pause board'}</button>
      <button type="button" data-action="settings" aria-expanded="${state.settingsOpen}" aria-controls="settings-panel">Settings</button>
    </div>
    ${preview}
    ${hint}
    <p class="status-line" role="status">${state.announcement || statusText(run)}</p>
    ${state.settingsOpen ? settingsPanel() : ''}
    ${state.paused ? `<section class="run-panel" aria-labelledby="pause-heading"><p class="eyebrow">Paused</p><h3 id="pause-heading">Your board is safe here</h3><p>Resume when you are ready. Your current board stays in this browser.</p><button type="button" class="primary-control" data-action="pause">Resume board</button></section>` : ''}
    ${run.status === 'won' ? endPanel('won') : run.status === 'lost' ? endPanel('lost') : ''}
  </section>`;
};

const settingsPanel = (): string => `<section id="settings-panel" class="settings-panel" aria-labelledby="settings-heading">
  <div><p class="eyebrow">Settings</p><h3 id="settings-heading">Make the board easier to read</h3></div>
  <label><input type="checkbox" data-setting="calm-motion" ${state.settings.calmMotion ? 'checked' : ''} /> Use calm motion</label>
  <label><input type="checkbox" data-setting="symbols-only" ${state.settings.symbolsOnly ? 'checked' : ''} /> Use high-contrast symbols</label>
  <p>Every token already has a symbol. This setting removes token color as an extra cue.</p>
  <button type="button" data-action="settings">Close settings</button>
</section>`;

const endPanel = (status: 'won' | 'lost'): string => {
  const won = status === 'won';
  const used = state.run.level.budget - state.run.movesLeft;
  return `<section class="run-panel end-panel" aria-labelledby="end-heading" tabindex="-1">
    <p class="eyebrow">${won ? 'Run complete' : 'Run ended'}</p>
    <h3 id="end-heading">${won ? 'All six tokens reached their gates' : 'The move budget is used'}</h3>
    <p>${won ? `You used ${used} of ${state.run.level.budget} moves. Undo never used an extra move.` : 'Restart the same board or undo a move to try a different route.'}</p>
    <div class="panel-actions"><button type="button" class="primary-control" data-action="restart">Play this board again</button>${won ? '<button type="button" data-action="next-free">Play next free board</button>' : '<button type="button" data-action="undo">Undo last move</button>'}</div>
  </section>`;
};

const pricing = (): string => `
  <section class="pricing" aria-labelledby="pricing-heading">
    <div><p class="eyebrow">Full puzzle set</p><h2 id="pricing-heading">20 authored boards for $8 once</h2></div>
    <p>The free sample includes the tutorial and two boards. The full set adds 17 boards. No subscription, ads, or move sales.</p>
    <p class="offer-status"><strong>Billing status:</strong> Purchase is unavailable while registration is pending. Your free boards still work.</p>
  </section>`;

const homePage = (): string => `
  ${nav()}
  ${demoBanner()}
  <main id="main" tabindex="-1">
    <section class="first-screen" aria-labelledby="page-title">
      <div class="intro-copy">
        <p class="eyebrow">A finite browser logic puzzle</p>
        <h1 id="page-title" tabindex="-1">Rotate rings to guide tokens through gates</h1>
        <p class="intro">For logic-puzzle players who want a short finished board, not an endless loop.</p>
        <div class="intro-actions"><button type="button" class="primary-action" data-action="try-demo">Try it with sample data</button><span>Opens a guided practice board.</span></div>
        ${facts()}
      </div>
      <div class="first-game">${gameBoard()}</div>
    </section>
    ${boardLevelOptions()}
    <section class="how-to-play" id="how-to-play" aria-labelledby="how-heading">
      <p class="eyebrow">How to play</p><h2 id="how-heading">Plan a finite route</h2>
      <ol><li><strong>Select a ring.</strong> Tap it, or use Up and Down arrows.</li><li><strong>Preview a route.</strong> Check the next ring and gate state before using a move.</li><li><strong>Clear six gates.</strong> Match each token with its open top gate before moves run out.</li></ol><p class="proof-note">Each board is checked for a route that fits its move budget. The phone test profile measures a 60 fps visual loop.</p>
    </section>
    <section class="plain-section" aria-labelledby="limits-heading"><p class="eyebrow">What stays private</p><h2 id="limits-heading">No account, ranking, or endless mode</h2><p>Progress and settings stay in local browser storage. Gate Shift sends no game data to a server. It is a one-player game.</p></section>
    ${pricing()}
  </main>
  ${footer()}`;

const footer = (): string => `
  <footer class="site-footer"><p>Gate Shift is a one-player puzzle with short, finite boards.</p><nav aria-label="Footer navigation"><a href="/privacy" data-nav>Privacy</a><a href="/terms" data-nav>Terms</a><a href="https://sociobot.in" rel="noopener noreferrer">Built by Param Factory <span class="sr-only">(opens external site)</span></a></nav><small>Build 1.1.0</small></footer>`;

const legalPage = (kind: 'privacy' | 'terms'): string => {
  const privacy = kind === 'privacy';
  return `${nav()}<main id="main" tabindex="-1" class="legal-page"><p class="eyebrow">Gate Shift</p><h1 tabindex="-1">${privacy ? 'Privacy for Gate Shift players' : 'Terms for Gate Shift players'}</h1>${privacy ? `
    <p>Gate Shift runs in your browser. It does not use analytics, accounts, advertising, or tracking cookies.</p>
    <h2>What stays on your device</h2><p>Your current board, settings, and free-board progress are saved in local browser storage when available. Demo runs use a separate storage key and never read or change your regular game data.</p>
    <h2>What leaves your device</h2><p>No game data leaves your browser. Static files load from the Gate Shift site so the game can open.</p>
    <h2>Delete local data</h2><p>Use your browser’s site-data controls for gate-shift.sociobot.in. In demo mode, select Reset demo.</p>` : `
    <p>Gate Shift is a browser game for general audiences. By playing, you agree to use it lawfully and not attempt to disrupt the service.</p>
    <h2>Game access</h2><p>The tutorial and two additional boards are free. The complete set is offered as a one-time $8 purchase when billing registration is available. No subscription is offered.</p>
    <h2>Availability</h2><p>The game is provided as-is. A saved board may be unavailable if you clear browser site data.</p>
    <h2>Contact</h2><p>Questions about this product can be sent through the Param Factory site.</p>`}${footer()}`;
};

const notFoundPage = (): string => `${nav()}<main id="main" tabindex="-1" class="not-found"><p class="eyebrow">404</p><h1 tabindex="-1">This board does not exist</h1><p>The link may be old. Return to the playable board.</p><a class="primary-action link-button" href="/" data-nav>Play Gate Shift</a></main>${footer()}`;

const render = (focusSelector?: string): void => {
  const path = routePath();
  document.title = titleFor(path);
  const publicPath = ['/demo', '/privacy', '/terms'].includes(path) ? path : '/';
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://gate-shift.sociobot.in${publicPath}`);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', `https://gate-shift.sociobot.in${publicPath}`);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', titleFor(path));
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', titleFor(path));
  root.dataset.calm = String(state.settings.calmMotion);
  root.dataset.symbols = String(state.settings.symbolsOnly);
  root.innerHTML = `<p id="route-live" class="sr-only" aria-live="polite"></p>${path === '/' || path === '/demo' ? homePage() : path === '/privacy' || path === '/terms' ? legalPage(path.slice(1) as 'privacy' | 'terms') : notFoundPage()}`;
  bindEvents();
  const routeLive = document.querySelector<HTMLElement>('#route-live');
  if (routeLive) routeLive.textContent = routeAnnouncement();
  if (focusSelector) window.setTimeout(() => root.querySelector<HTMLElement>(focusSelector)?.focus(), 0);
};

const changeRun = (run: GameRun, message: string, focusSelector?: string): void => {
  state = { ...state, run, preview: null, hint: '', announcement: message, paused: false };
  save();
  render(run.status === 'active' ? focusSelector : '.end-panel');
};

const rotate = (direction: Direction, focusSelector?: string): void => {
  const result = rotateRun(state.run, direction);
  if (result === state.run) return;
  const message = result.status === 'won' ? 'Board complete.' : result.status === 'lost' ? 'The move budget is used.' : `${formatDirection(direction)} taken. ${result.movesLeft} moves left.`;
  changeRun(result, message, focusSelector);
};

const showPreview = (direction: Direction): void => {
  state = { ...state, preview: direction, hint: '', announcement: `${formatDirection(direction)} preview shown. No move used.` };
  render(`[data-action="preview-${direction}"]`);
};

const resetDemo = (): void => {
  try {
    localStorage.removeItem(storageKey(true, 'run'));
    localStorage.removeItem(storageKey(true, 'settings'));
  } catch { /* Keep the visible run if storage is blocked. */ }
  state = initialState(true);
  state.announcement = 'Demo reset to the guided practice board.';
  render('[data-action="reset-demo"]');
};

const showHint = (): void => {
  const solution = solveWithin(state.run.state, state.run.movesLeft);
  if (!solution?.moves.length) {
    state = { ...state, preview: null, hint: solution ? 'This board is already clear.' : 'No route fits the remaining budget. Undo a move or restart.' };
  } else {
    const next = solution.moves[0];
    state = { ...state, preview: null, hint: `Safe next move: select ${ringNames[next.ring]} ring, then take the ${formatDirection(next.direction)}.` };
  }
  render('[data-action="hint"]');
};

const selectLevel = (id: string): void => {
  const level = getLevel(id);
  if (!level || (!level.free && !level.daily)) return;
  changeRun(startRun(level), `${level.daily ? 'Daily board' : `Board ${level.number}`} started.`, `[data-level="${level.id}"]`);
};

const bindEvents = (): void => {
  root.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((link) => link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href?.startsWith('/')) return;
    event.preventDefault();
    navigate(href);
    window.scrollTo({ top: 0, behavior: state.settings.calmMotion ? 'auto' : 'smooth' });
    window.setTimeout(() => document.querySelector<HTMLElement>('#main h1')?.focus(), 0);
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-ring]').forEach((ring) => {
    ring.addEventListener('pointerdown', (event) => {
      swipeStart = { x: event.clientX, y: event.clientY, ring: Number(ring.dataset.ring) };
      didSwipe = false;
    });
    ring.addEventListener('pointerup', (event) => {
      if (!swipeStart || state.run.status !== 'active' || state.paused) return;
      const deltaX = event.clientX - swipeStart.x;
      const deltaY = event.clientY - swipeStart.y;
      if (swipeStart.ring === Number(ring.dataset.ring) && Math.abs(deltaX) > 32 && Math.abs(deltaX) > Math.abs(deltaY)) {
        didSwipe = true;
        state = { ...state, run: chooseRing(state.run, swipeStart.ring) };
        rotate(deltaX > 0 ? 'clockwise' : 'counterclockwise', `[data-ring="${swipeStart.ring}"]`);
      }
      swipeStart = null;
    });
    ring.addEventListener('click', () => {
      if (didSwipe) { didSwipe = false; return; }
      state = { ...state, run: chooseRing(state.run, Number(ring.dataset.ring)), preview: null, announcement: `${ringNames[Number(ring.dataset.ring)]} ring selected.` };
      save();
      render(`[data-ring="${ring.dataset.ring}"]`);
    });
  });
  root.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((button) => button.addEventListener('click', () => selectLevel(button.dataset.level ?? '')));
  root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => button.addEventListener('click', () => {
    switch (button.dataset.action) {
      case 'try-demo': navigate('/demo'); break;
      case 'start-real': navigate('/'); break;
      case 'reset-demo': resetDemo(); break;
      case 'preview-clockwise': showPreview('clockwise'); break;
      case 'preview-counterclockwise': showPreview('counterclockwise'); break;
      case 'apply-preview': {
        if (state.preview) rotate(state.preview, `[data-action="preview-${state.preview}"]`);
        break;
      }
      case 'cancel-preview': state = { ...state, preview: null, announcement: 'Preview closed. No move used.' }; render('[data-action="preview-clockwise"]'); break;
      case 'undo': changeRun(undoRun(state.run), 'Last move undone. It did not cost a move.', '[data-action="undo"]'); break;
      case 'restart': changeRun(startRun(state.run.level), 'Board restarted.', '[data-action="restart"]'); break;
      case 'hint': showHint(); break;
      case 'pause': {
        const willPause = !state.paused;
        state = { ...state, paused: willPause, preview: null, announcement: willPause ? 'Board paused.' : 'Board resumed.' };
        save();
        render(willPause ? '.run-panel [data-action="pause"]' : '[data-action="pause"]');
        break;
      }
      case 'settings': {
        const willOpen = !state.settingsOpen;
        state = { ...state, settingsOpen: willOpen, preview: null };
        render(willOpen ? '#settings-panel [data-setting]' : '[data-action="settings"]');
        break;
      }
      case 'next-free': {
        const currentIndex = authoredLevels.findIndex((level) => level.id === state.run.level.id);
        const next = authoredLevels.slice(currentIndex + 1).find((level) => level.free) ?? authoredLevels[0];
        selectLevel(next.id);
        break;
      }
      default: break;
    }
  }));
  root.querySelectorAll<HTMLInputElement>('[data-setting]').forEach((input) => input.addEventListener('change', () => {
    const settings = input.dataset.setting === 'calm-motion'
      ? { ...state.settings, calmMotion: input.checked }
      : { ...state.settings, symbolsOnly: input.checked };
    state = { ...state, settings, announcement: 'Settings saved in this browser.' };
    save();
    render(`[data-setting="${input.dataset.setting}"]`);
  }));
};

window.addEventListener('popstate', () => {
  state = initialState(isDemoRoute());
  render();
  window.setTimeout(() => document.querySelector<HTMLElement>('#main h1')?.focus(), 0);
});

window.addEventListener('keydown', (event) => {
  if (routePath() !== '/' && routePath() !== '/demo' || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target as HTMLElement;
  if (target.matches('a, input, select, textarea') || target.matches('button:not([data-ring])')) return;
  const selectedRing = (): string => `[data-ring="${state.run.selectedRing}"]`;
  if (event.key === 'ArrowRight') { event.preventDefault(); rotate('clockwise', selectedRing()); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); rotate('counterclockwise', selectedRing()); }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    state = { ...state, run: chooseRing(state.run, state.run.selectedRing + 1), preview: null, announcement: 'Next ring selected.' };
    save();
    render(`[data-ring="${state.run.selectedRing}"]`);
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    state = { ...state, run: chooseRing(state.run, state.run.selectedRing - 1), preview: null, announcement: 'Previous ring selected.' };
    save();
    render(`[data-ring="${state.run.selectedRing}"]`);
  }
  if (event.key.toLowerCase() === 'u') { event.preventDefault(); changeRun(undoRun(state.run), 'Last move undone. It did not cost a move.', selectedRing()); }
  if (event.key.toLowerCase() === 'r') { event.preventDefault(); changeRun(startRun(state.run.level), 'Board restarted.', selectedRing()); }
});

const pauseForBackground = (): void => {
  stopVisualLoop();
  if (state.run.status === 'active' && !state.paused && (routePath() === '/' || routePath() === '/demo')) {
    state = { ...state, paused: true, preview: null, announcement: 'Board paused while this tab was hidden.' };
    save();
    render();
  }
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseForBackground();
  else startVisualLoop();
});
document.addEventListener('freeze', pauseForBackground);
document.addEventListener('resume', startVisualLoop);

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));

render();
startVisualLoop();
