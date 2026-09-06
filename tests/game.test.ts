import { describe, expect, it } from 'vitest';
import {
  LINKED_GATE,
  FixedStepper,
  applyMove,
  authoredLevels,
  getDailyLevel,
  rotateRun,
  solveWithin,
  startRun,
  undoRun,
} from '../src/game';

describe('Gate Shift engine', () => {
  it('turns a ring and reverses only its linked gate on the short route', () => {
    const start = startRun(authoredLevels[0]).state;
    const next = applyMove(start, { ring: 2, direction: 'clockwise' });
    expect(next.angles[2]).toBe((start.angles[2] + 1) % 4);
    expect(next.gates[LINKED_GATE[2]]).toBe(start.gates[LINKED_GATE[2]] === 0 ? 1 : 0);
  });

  it('leaves gate polarity unchanged on the long route', () => {
    const start = startRun(authoredLevels[0]).state;
    const next = applyMove(start, { ring: 4, direction: 'counterclockwise' });
    expect(next.gates).toEqual(start.gates);
    expect(next.angles[4]).toBe((start.angles[4] + 3) % 4);
  });

  it('restores a turn without charging an extra move', () => {
    const run = startRun(authoredLevels[0]);
    const turned = rotateRun(run, 'clockwise');
    const undone = undoRun(turned);
    expect(undone.state).toEqual(run.state);
    expect(undone.movesLeft).toBe(run.movesLeft);
    expect(undone.history).toHaveLength(0);
  });

  it('@claim:solvable-authored-boards proves all 20 authored boards fit their published budgets', () => {
    expect(authoredLevels).toHaveLength(20);
    for (const level of authoredLevels) {
      const proof = solveWithin(level.start, level.budget);
      expect(proof, `${level.name} should have a solution`).not.toBeNull();
      expect(proof?.moves.length).toBeLessThanOrEqual(level.budget);
    }
  }, 30_000);

  it('@claim:daily-seed is deterministic and has a proven route', () => {
    const date = new Date('2026-09-06T12:00:00.000Z');
    const first = getDailyLevel(date);
    const second = getDailyLevel(date);
    expect(second.start).toEqual(first.start);
    const proof = solveWithin(first.start, first.budget);
    expect(proof?.moves.length).toBeLessThanOrEqual(first.budget);
  }, 15_000);

  it('@claim:reaches-end-screen completes a deterministic scripted run', () => {
    const level = authoredLevels[2];
    const proof = solveWithin(level.start, level.budget);
    expect(proof).not.toBeNull();
    const completed = proof!.moves.reduce((run, next) => {
      const selected = { ...run, selectedRing: next.ring };
      return rotateRun(selected, next.direction);
    }, startRun(level));
    expect(completed.status).toBe('won');
    expect(completed.movesLeft).toBeGreaterThanOrEqual(0);
  }, 15_000);

  it('uses clamped 60 Hz simulation steps after a long frame', () => {
    const clock = new FixedStepper();
    let ticks = 0;
    expect(clock.advance(1, () => { ticks += 1; })).toBe(5);
    expect(ticks).toBe(5);
    expect(clock.advance(1 / 60, () => { ticks += 1; })).toBe(1);
  });
});
