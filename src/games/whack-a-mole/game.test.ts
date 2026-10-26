import { describe, expect, it } from 'vitest';
import {
  COLUMNS,
  POINTS_PER_WHACK,
  ROUND_SECONDS,
  ROWS,
  SPAWN_INTERVAL,
  UP_TIME,
  createState,
  holeAt,
  spawnInterval,
  step,
  upTime,
  whack,
} from './game';

const first = () => 0;

describe('whack-a-mole', () => {
  it('starts with a full clock, no score and every mole down', () => {
    const state = createState();
    expect(state.holes).toHaveLength(COLUMNS * ROWS);
    expect(state.holes.every((hole) => hole.up === 0)).toBe(true);
    expect(state.timeLeft).toBe(ROUND_SECONDS);
    expect(state.score).toBe(0);
    expect(state.phase).toBe('playing');
  });

  it('pops a mole up once the first interval has passed', () => {
    const state = createState();
    step(state, SPAWN_INTERVAL.start - 0.01, first);
    expect(state.holes.some((hole) => hole.up > 0)).toBe(false);
    step(state, 0.02, first);
    expect(state.holes.filter((hole) => hole.up > 0)).toHaveLength(1);
  });

  it('times a mole from when it popped up, not from the end of a long step', () => {
    const once = createState();
    step(once, 1.5, first);
    const twice = createState();
    step(twice, 1, first);
    step(twice, 0.5, first);
    expect(once.holes[0].up).toBeGreaterThan(0);
    expect(once.holes[0].up).toBeCloseTo(twice.holes[0].up, 10);
    expect(once.nextPop).toBeCloseTo(twice.nextPop, 10);
  });

  it('drops a mole back down when its time is up', () => {
    const state = createState();
    state.holes[0].up = 0.5;
    state.nextPop = 10;
    step(state, 0.6, first);
    expect(state.holes[0].up).toBe(0);
  });

  it('scores a whack on a mole that is up and sends it down', () => {
    const state = createState();
    const hole = state.holes[4];
    hole.up = 1;
    expect(whack(state, hole.x + 10, hole.y - 10)).toBe(true);
    expect(state.score).toBe(POINTS_PER_WHACK);
    expect(hole.up).toBe(0);
  });

  it('scores nothing for whacking an empty hole or the grass', () => {
    const state = createState();
    const hole = state.holes[4];
    expect(whack(state, hole.x, hole.y)).toBe(false);
    expect(whack(state, 0, 0)).toBe(false);
    expect(state.score).toBe(0);
  });

  it('cannot score the same mole twice', () => {
    const state = createState();
    const hole = state.holes[0];
    hole.up = 1;
    whack(state, hole.x, hole.y);
    expect(whack(state, hole.x, hole.y)).toBe(false);
    expect(state.score).toBe(POINTS_PER_WHACK);
  });

  it('finds the hole under a point', () => {
    const state = createState();
    expect(holeAt(state, state.holes[2].x, state.holes[2].y)).toBe(state.holes[2]);
    expect(holeAt(state, 0, 0)).toBeUndefined();
  });

  it('pops moles up faster and for less time as the round goes on', () => {
    const state = createState();
    expect(spawnInterval(state)).toBe(SPAWN_INTERVAL.start);
    expect(upTime(state)).toBe(UP_TIME.start);
    state.timeLeft = ROUND_SECONDS / 2;
    expect(spawnInterval(state)).toBeLessThan(SPAWN_INTERVAL.start);
    expect(upTime(state)).toBeLessThan(UP_TIME.start);
    state.timeLeft = 0;
    expect(spawnInterval(state)).toBeCloseTo(SPAWN_INTERVAL.end);
    expect(upTime(state)).toBeCloseTo(UP_TIME.end);
  });

  it('pops more moles in the last ten seconds than in the first ten', () => {
    const count = (from: number) => {
      const state = createState();
      state.timeLeft = from;
      state.nextPop = 0.001;
      let pops = 0;
      for (let t = 0; t < 10; t += 0.05) {
        for (const hole of state.holes) hole.up = 0;
        step(state, 0.05, first);
        pops += state.holes.filter((hole) => hole.up > 0).length;
      }
      return pops;
    };
    expect(count(10.01)).toBeGreaterThan(count(ROUND_SECONDS));
  });

  it('ends the round when the clock runs out and drops every mole', () => {
    const state = createState();
    state.holes[0].up = 5;
    step(state, ROUND_SECONDS, first);
    expect(state.phase).toBe('over');
    expect(state.timeLeft).toBe(0);
    expect(state.holes.every((hole) => hole.up === 0)).toBe(true);
  });

  it('ignores whacks once the round is over', () => {
    const state = createState();
    state.phase = 'over';
    state.holes[0].up = 1;
    expect(whack(state, state.holes[0].x, state.holes[0].y)).toBe(false);
    expect(state.score).toBe(0);
  });
});
