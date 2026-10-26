import { canvasFont, recordScore, theme, type CarnivalGame } from '../../carnival';

const { width: WIDTH, height: HEIGHT } = theme.canvas;

export const ROUND_SECONDS = 30;
export const POINTS_PER_WHACK = 10;
export const COLUMNS = 3;
export const ROWS = 3;
export const HOLE_RADIUS = 50;
/** Seconds between pop-ups at the start and at the end of the round. */
export const SPAWN_INTERVAL = { start: 1, end: 0.35 } as const;
/** Seconds a mole stays up at the start and at the end of the round. */
export const UP_TIME = { start: 1.4, end: 0.6 } as const;
const HIT_FLASH = 0.25;
const GRID_TOP = 90;
const GRID_BOTTOM = HEIGHT - 60;

export interface Hole {
  x: number;
  y: number;
  /** Seconds the mole has left above ground; 0 when it is down. */
  up: number;
  /** Seconds left on the "bonk" flash after a whack. */
  hit: number;
}

export interface WhackAMoleState {
  holes: Hole[];
  timeLeft: number;
  /** Seconds until the next mole pops up. */
  nextPop: number;
  score: number;
  phase: 'playing' | 'over';
}

export function createState(): WhackAMoleState {
  const columnWidth = WIDTH / COLUMNS;
  const rowHeight = (GRID_BOTTOM - GRID_TOP) / ROWS;
  const holes = Array.from({ length: COLUMNS * ROWS }, (_, i) => ({
    x: columnWidth * (i % COLUMNS) + columnWidth / 2,
    y: GRID_TOP + rowHeight * Math.floor(i / COLUMNS) + rowHeight / 2,
    up: 0,
    hit: 0,
  }));
  return {
    holes,
    timeLeft: ROUND_SECONDS,
    nextPop: SPAWN_INTERVAL.start,
    score: 0,
    phase: 'playing',
  };
}

/** How far through the round we are, from 0 at the start to 1 at the end. */
export function progress(state: WhackAMoleState): number {
  return Math.min(1, Math.max(0, 1 - state.timeLeft / ROUND_SECONDS));
}

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Seconds between pop-ups: shrinks steadily as the round goes on. */
export function spawnInterval(state: WhackAMoleState): number {
  return lerp(SPAWN_INTERVAL.start, SPAWN_INTERVAL.end, progress(state));
}

/** Seconds a new mole stays up: shrinks steadily as the round goes on. */
export function upTime(state: WhackAMoleState): number {
  return lerp(UP_TIME.start, UP_TIME.end, progress(state));
}

/** The hole under the point, or undefined if the point misses every hole. */
export function holeAt(state: WhackAMoleState, x: number, y: number): Hole | undefined {
  return state.holes.find((hole) => Math.hypot(x - hole.x, y - hole.y) <= HOLE_RADIUS);
}

/** Whacks at a point. Returns true if a mole was up there and got whacked. */
export function whack(state: WhackAMoleState, x: number, y: number): boolean {
  if (state.phase !== 'playing') return false;
  const hole = holeAt(state, x, y);
  if (!hole || hole.up <= 0) return false;
  hole.up = 0;
  hole.hit = HIT_FLASH;
  state.score += POINTS_PER_WHACK;
  return true;
}

/**
 * Advances the game by `dt` seconds. `random` returns a number in [0, 1) and
 * picks which empty hole the next mole pops out of.
 */
export function step(state: WhackAMoleState, dt: number, random: () => number = Math.random): void {
  if (state.phase !== 'playing') return;

  state.timeLeft = Math.max(0, state.timeLeft - dt);
  for (const hole of state.holes) {
    hole.up = Math.max(0, hole.up - dt);
    hole.hit = Math.max(0, hole.hit - dt);
  }

  if (state.timeLeft === 0) {
    for (const hole of state.holes) hole.up = 0;
    state.phase = 'over';
    return;
  }

  state.nextPop -= dt;
  while (state.nextPop <= 0) {
    const empty = state.holes.filter((hole) => hole.up === 0 && hole.hit === 0);
    if (empty.length > 0) {
      empty[Math.floor(random() * empty.length)].up = upTime(state);
    }
    state.nextPop += spawnInterval(state);
  }
}

function draw(ctx: CanvasRenderingContext2D, state: WhackAMoleState) {
  const { colors } = theme;

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Booth awning.
  const stripe = WIDTH / 16;
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? colors.stripeA : colors.stripeB;
    ctx.fillRect(i * stripe, 0, stripe, 40);
  }

  for (const hole of state.holes) {
    // The mole sits behind the hole's front lip, so draw it clipped above the lip.
    ctx.fillStyle = colors.surface;
    ctx.beginPath();
    ctx.ellipse(hole.x, hole.y + 20, HOLE_RADIUS, HOLE_RADIUS * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    if (hole.up > 0 || hole.hit > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(hole.x - HOLE_RADIUS, hole.y - HOLE_RADIUS - 20, HOLE_RADIUS * 2, HOLE_RADIUS + 40);
      ctx.clip();
      ctx.fillStyle = hole.hit > 0 ? colors.danger : colors.wood;
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, HOLE_RADIUS * 0.7, Math.PI, 0);
      ctx.lineTo(hole.x + HOLE_RADIUS * 0.7, hole.y + 20);
      ctx.lineTo(hole.x - HOLE_RADIUS * 0.7, hole.y + 20);
      ctx.fill();
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(hole.x - 12, hole.y - 10, 5, 0, Math.PI * 2);
      ctx.arc(hole.x + 12, hole.y - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.stripeA;
      ctx.beginPath();
      ctx.arc(hole.x, hole.y + 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.strokeStyle = colors.wood;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(hole.x, hole.y + 20, HOLE_RADIUS, HOLE_RADIUS * 0.35, 0, 0, Math.PI);
    ctx.stroke();
  }

  ctx.fillStyle = colors.text;
  ctx.font = canvasFont('body', 'bold');
  ctx.textAlign = 'left';
  ctx.fillText(`Score ${state.score}`, 16, HEIGHT - 20);
  ctx.textAlign = 'right';
  ctx.fillText(`Time ${Math.ceil(state.timeLeft)}s`, WIDTH - 16, HEIGHT - 20);

  if (state.phase === 'over') {
    ctx.fillStyle = colors.background;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.accent;
    ctx.font = canvasFont('title', 'bold');
    ctx.fillText(`Time's up! You scored ${state.score}`, WIDTH / 2, HEIGHT / 2);
    ctx.fillStyle = colors.text;
    ctx.font = canvasFont('body');
    ctx.fillText('Click to play again', WIDTH / 2, HEIGHT / 2 + 40);
  }
}

export const whackAMole: CarnivalGame = {
  id: 'whack-a-mole',
  name: 'Whack-a-Mole',
  description:
    'Whack the moles before they duck back down. They get quicker as the clock runs out.',

  start(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not available');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let state = createState();
    let scoreRecorded = false;

    const onDown = (event: PointerEvent) => {
      if (state.phase === 'over') {
        state = createState();
        scoreRecorded = false;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      whack(
        state,
        ((event.clientX - rect.left) / rect.width) * WIDTH,
        ((event.clientY - rect.top) / rect.height) * HEIGHT,
      );
    };
    canvas.addEventListener('pointerdown', onDown);

    let frame = 0;
    let last = performance.now();
    const loop = (time: number) => {
      // Cap the step so a background tab doesn't skip the round.
      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;
      step(state, dt);
      if (state.phase === 'over' && !scoreRecorded) {
        recordScore(whackAMole.id, state.score);
        scoreRecorded = true;
      }
      draw(ctx, state);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointerdown', onDown);
    };
  },
};

export default whackAMole;
