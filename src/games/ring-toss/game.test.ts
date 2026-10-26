import { describe, expect, it } from 'vitest';
import {
  FLIGHT_TIME,
  HAND,
  NECK_RADIUS,
  RINGS_PER_ROUND,
  SWAY,
  bottleAt,
  createState,
  step,
  swayAt,
  toss,
} from './game';

describe('ring toss', () => {
  it('starts with a full set of rings, no score and a grid of bottles', () => {
    const state = createState();
    expect(state.rings).toBe(RINGS_PER_ROUND);
    expect(state.score).toBe(0);
    expect(state.phase).toBe('playing');
    expect(state.bottles).toHaveLength(15);
    expect(state.bottles.every((b) => b.rings === 0)).toBe(true);
  });

  it('uses one ring per toss', () => {
    const state = createState();
    expect(toss(state, 400, 200)).toBe(true);
    expect(state.rings).toBe(RINGS_PER_ROUND - 1);
    expect(state.ring).not.toBeNull();
  });

  it('throws one ring at a time', () => {
    const state = createState();
    toss(state, 400, 200);
    expect(toss(state, 400, 200)).toBe(false);
    expect(state.rings).toBe(RINGS_PER_ROUND - 1);
  });

  it('cannot toss once the rings run out', () => {
    const state = createState();
    state.rings = 0;
    expect(toss(state, 400, 200)).toBe(false);
    expect(state.ring).toBeNull();
  });

  it('scores a ring that lands on a bottle neck', () => {
    const state = createState();
    const bottle = state.bottles[0];
    toss(state, bottle.x, bottle.y);
    step(state, FLIGHT_TIME);
    expect(state.score).toBe(bottle.points);
    expect(bottle.rings).toBe(1);
    expect(state.ring).toBeNull();
  });

  it('scores nothing for a ring that lands between bottles', () => {
    const state = createState();
    const [a, b] = state.bottles;
    toss(state, (a.x + b.x) / 2, a.y);
    step(state, FLIGHT_TIME);
    expect(state.score).toBe(0);
    expect(state.misses).toHaveLength(1);
  });

  it('lands nothing until the ring has finished its flight', () => {
    const state = createState();
    const bottle = state.bottles[0];
    toss(state, bottle.x, bottle.y);
    step(state, FLIGHT_TIME / 2);
    expect(state.score).toBe(0);
    expect(state.ring).not.toBeNull();
  });

  it('scores bottles further back higher', () => {
    const state = createState();
    const back = state.bottles.reduce((a, b) => (b.y < a.y ? b : a));
    const front = state.bottles.reduce((a, b) => (b.y > a.y ? b : a));
    expect(back.points).toBeGreaterThan(front.points);
  });

  it('only rings a neck within reach of its centre', () => {
    const { bottles } = createState();
    const bottle = bottles[0];
    expect(bottleAt(bottles, bottle.x + NECK_RADIUS, bottle.y)).toBe(bottle);
    expect(bottleAt(bottles, bottle.x + NECK_RADIUS + 1, bottle.y)).toBeUndefined();
  });

  it('never throws backwards, even when aimed below the hand', () => {
    const state = createState();
    toss(state, HAND.x, HAND.y + 100);
    expect(state.ring!.toY).toBeLessThan(HAND.y);
  });

  it('drifts a throw by the sway, never more than SWAY', () => {
    const state = createState();
    state.time = 1.2;
    toss(state, 400, 200);
    expect(state.ring!.toX).toBeCloseTo(400 + swayAt(1.2));
    for (let t = 0; t < 20; t += 0.05) expect(Math.abs(swayAt(t))).toBeLessThanOrEqual(SWAY);
  });

  it('ends the round when the last ring has landed', () => {
    const state = createState();
    state.rings = 1;
    toss(state, 400, 200);
    step(state, FLIGHT_TIME / 2);
    expect(state.phase).toBe('playing');
    step(state, FLIGHT_TIME / 2);
    expect(state.phase).toBe('over');
  });
});
