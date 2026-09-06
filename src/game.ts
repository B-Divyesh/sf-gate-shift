export const RING_COUNT = 6;
export const LINKED_GATE = [1, 3, 5, 0, 2, 4] as const;
export const FIXED_TIMESTEP_SECONDS = 1 / 60;

export type Direction = 'clockwise' | 'counterclockwise';
export type Move = { ring: number; direction: Direction };
export type BoardLayout = 'arc' | 'ladder' | 'cluster';

export type PuzzleState = {
  angles: number[];
  gates: number[];
};

export type Level = {
  id: string;
  number: number;
  name: string;
  layout: BoardLayout;
  start: PuzzleState;
  budget: number;
  free: boolean;
  daily?: boolean;
};

const goalState = (): PuzzleState => ({
  angles: Array<number>(RING_COUNT).fill(0),
  gates: Array<number>(RING_COUNT).fill(0),
});

const asAngle = (angle: number): number => ((angle % 4) + 4) % 4;

export const cloneState = (state: PuzzleState): PuzzleState => ({
  angles: [...state.angles],
  gates: [...state.gates],
});

export const stateKey = (state: PuzzleState): string => `${state.angles.join('')}:${state.gates.join('')}`;

export const isComplete = (state: PuzzleState): boolean =>
  state.angles.every((angle) => angle === 0) && state.gates.every((gate) => gate === 0);

export const clearedGates = (state: PuzzleState): number =>
  state.angles.reduce((total, angle, index) => total + (angle === 0 && state.gates[index] === 0 ? 1 : 0), 0);

/**
 * Clockwise is the short route. It turns one ring by a quarter and reverses
 * the linked gate. Counterclockwise is a longer route and leaves gates alone.
 */
export const applyMove = (state: PuzzleState, move: Move): PuzzleState => {
  if (!Number.isInteger(move.ring) || move.ring < 0 || move.ring >= RING_COUNT) {
    throw new Error('Choose one of the six rings.');
  }
  const next = cloneState(state);
  if (move.direction === 'clockwise') {
    next.angles[move.ring] = asAngle(next.angles[move.ring] + 1);
    next.gates[LINKED_GATE[move.ring]] = next.gates[LINKED_GATE[move.ring]] === 0 ? 1 : 0;
  } else {
    next.angles[move.ring] = asAngle(next.angles[move.ring] - 1);
  }
  return next;
};

export const applyMoves = (state: PuzzleState, moves: Move[]): PuzzleState =>
  moves.reduce((current, move) => applyMove(current, move), cloneState(state));

const move = (ring: number, direction: Direction): Move => ({ ring, direction });

const SCRAMBLES: Move[][] = [
  [move(0, 'clockwise'), move(1, 'counterclockwise'), move(2, 'clockwise'), move(4, 'counterclockwise')],
  [move(5, 'clockwise'), move(3, 'clockwise'), move(0, 'counterclockwise'), move(2, 'clockwise'), move(1, 'counterclockwise')],
  [move(4, 'clockwise'), move(1, 'clockwise'), move(5, 'counterclockwise'), move(2, 'clockwise'), move(0, 'clockwise'), move(3, 'counterclockwise')],
  [move(2, 'clockwise'), move(0, 'clockwise'), move(4, 'clockwise'), move(1, 'counterclockwise'), move(5, 'clockwise'), move(3, 'counterclockwise'), move(0, 'clockwise')],
  [move(3, 'clockwise'), move(5, 'clockwise'), move(2, 'counterclockwise'), move(4, 'clockwise'), move(1, 'clockwise'), move(0, 'counterclockwise'), move(2, 'clockwise'), move(5, 'counterclockwise')],
];

const LEVEL_NAMES = [
  'First signal', 'Two-way gate', 'Linked turns', 'Crossed route', 'Gate pairs',
  'Offset loop', 'Return path', 'Six signals', 'Double reversal', 'Narrow budget',
  'Switchback', 'Round trip', 'Split gate', 'Full circuit', 'Afterimage',
  'Counter turn', 'Cross current', 'Tight relay', 'Final junction', 'Clear all gates',
];

export const authoredLevels: Level[] = LEVEL_NAMES.map((name, index) => {
  const rounds = 1 + Math.floor(index / SCRAMBLES.length);
  const source = SCRAMBLES[index % SCRAMBLES.length];
  const altered = source.map((entry, position) => {
    if (rounds === 1 || position % rounds !== 0) return entry;
    return move((entry.ring + rounds + index) % RING_COUNT, entry.direction);
  });
  const repeated = Array.from({ length: rounds }, (_, round) =>
    altered.map((entry, position) =>
      position === altered.length - 1 && round % 2 === 1
        ? move((entry.ring + round) % RING_COUNT, entry.direction)
        : entry,
    ),
  ).flat();
  return {
    id: `board-${index + 1}`,
    number: index + 1,
    name,
    layout: (['arc', 'ladder', 'cluster'] as const)[index % 3],
    start: applyMoves(goalState(), repeated),
    budget: Math.min(26, 10 + Math.ceil(repeated.length * 1.45)),
    free: index < 3,
  };
});

const DAY_MS = 86_400_000;
const dateSeed = (date: Date): number => Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / DAY_MS);

export const dailySeed = (date = new Date()): string => {
  const day = date.toISOString().slice(0, 10);
  return `GS-${day.replaceAll('-', '')}`;
};

const dailyMoves = (date: Date): Move[] => {
  let random = (dateSeed(date) ^ 0x6d2b79f5) >>> 0;
  const next = (): number => {
    random ^= random << 13;
    random ^= random >>> 17;
    random ^= random << 5;
    return random >>> 0;
  };
  return Array.from({ length: 9 }, () => move(next() % RING_COUNT, next() % 3 === 0 ? 'counterclockwise' : 'clockwise'));
};

export const getDailyLevel = (date = new Date()): Level => {
  const seed = dateSeed(date);
  const scramble = dailyMoves(date);
  return {
    id: `daily-${dailySeed(date)}`,
    number: 0,
    name: `Daily ${dailySeed(date)}`,
    layout: (['arc', 'ladder', 'cluster'] as const)[seed % 3],
    start: applyMoves(goalState(), scramble),
    budget: 22,
    free: true,
    daily: true,
  };
};

export type Solution = { moves: Move[]; explored: number } | null;

/** Breadth-first proof that a board can end within the published move budget. */
export const solveWithin = (start: PuzzleState, budget: number): Solution => {
  if (isComplete(start)) return { moves: [], explored: 1 };
  const seen = new Set<string>([stateKey(start)]);
  const queue: { state: PuzzleState; moves: Move[] }[] = [{ state: cloneState(start), moves: [] }];
  let cursor = 0;
  while (cursor < queue.length) {
    const current = queue[cursor++];
    if (current.moves.length >= budget) continue;
    for (let ring = 0; ring < RING_COUNT; ring += 1) {
      for (const direction of ['clockwise', 'counterclockwise'] as const) {
        const next = applyMove(current.state, { ring, direction });
        const key = stateKey(next);
        if (seen.has(key)) continue;
        const moves = [...current.moves, { ring, direction }];
        if (isComplete(next)) return { moves, explored: seen.size + 1 };
        seen.add(key);
        queue.push({ state: next, moves });
      }
    }
  }
  return null;
};

export type RunStatus = 'active' | 'won' | 'lost';

export type GameRun = {
  level: Level;
  state: PuzzleState;
  movesLeft: number;
  history: PuzzleState[];
  status: RunStatus;
  selectedRing: number;
};

export const startRun = (level: Level): GameRun => ({
  level,
  state: cloneState(level.start),
  movesLeft: level.budget,
  history: [],
  status: isComplete(level.start) ? 'won' : 'active',
  selectedRing: 0,
});

export const rotateRun = (run: GameRun, direction: Direction): GameRun => {
  if (run.status !== 'active') return run;
  const state = applyMove(run.state, { ring: run.selectedRing, direction });
  const movesLeft = run.movesLeft - 1;
  const status: RunStatus = isComplete(state) ? 'won' : movesLeft === 0 ? 'lost' : 'active';
  return { ...run, state, movesLeft, history: [...run.history, cloneState(run.state)], status };
};

export const chooseRing = (run: GameRun, ring: number): GameRun => ({
  ...run,
  selectedRing: Math.max(0, Math.min(RING_COUNT - 1, ring)),
});

export const undoRun = (run: GameRun): GameRun => {
  const previous = run.history.at(-1);
  if (!previous) return run;
  return {
    ...run,
    state: cloneState(previous),
    movesLeft: run.movesLeft + 1,
    history: run.history.slice(0, -1),
    status: 'active',
  };
};

export const formatDirection = (direction: Direction): string => direction === 'clockwise' ? 'short route' : 'long route';

export const ringNames = ['North', 'East', 'South', 'West', 'Upper', 'Lower'];
export const tokenSymbols = ['○', '□', '△', '◇', '✦', '⬡'];

/** A clamped fixed-step clock for the game's visual simulation. */
export class FixedStepper {
  private accumulator = 0;

  advance(frameSeconds: number, step: () => void): number {
    this.accumulator += Math.min(Math.max(frameSeconds, 0), 0.25);
    let steps = 0;
    while (this.accumulator >= FIXED_TIMESTEP_SECONDS && steps < 5) {
      step();
      this.accumulator -= FIXED_TIMESTEP_SECONDS;
      steps += 1;
    }
    if (steps === 5) this.accumulator = 0;
    return steps;
  }

  reset(): void {
    this.accumulator = 0;
  }
}
