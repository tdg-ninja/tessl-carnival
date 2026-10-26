# Whack-a-Mole

Whack the moles as they pop out of their holes, before they duck back down.

## How to play

- Moles pop up from a grid of nine holes, stay up for a moment, then drop back down.
- Click a mole while it's up to whack it.
- A round lasts 30 seconds. As the clock runs down, moles pop up more often and
  stay up for less time: a new mole every 1 second at the start, down to every
  0.35 seconds at the end, and each one stays up for 1.4 seconds at the start,
  down to 0.6 seconds at the end.
- Click again on the game over screen to play another round.

## Scoring

Each mole you whack scores 10 points. Clicking an empty hole or the grass scores
nothing and costs nothing.

Your final score is saved to the carnival's score board when the clock runs out.

## Files

- `game.ts`: the game logic (`createState`, `step`, `whack`, `holeAt`,
  `spawnInterval`, `upTime`) and the `whackAMole` entry, the default export the
  midway finds.
- `game.test.ts`: tests for the game logic.
