# Gobble Run — A Turkey Escape

[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Muspinku/makefun-turkey-escape-game/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Muspinku/makefun-turkey-escape-game/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

Thanksgiving is coming. The farmer is coming faster. **Gobble Run** is a
turkey escape game: you are the turkey, and you are not going to be dinner.

## How to play

Open `game/index.html` in a desktop browser (or run `node serve.ts` and
open http://localhost:8080). No network, no build step, no install.

- **SPACE / ↑ / W / click** — jump
- **↓ / S** — duck and slide under low branches
- **P** — pause · **M** — mute · **R** — run again

Jump the fences and hay bales, duck under low branches, time your jump
over the roaring oven and the swinging carving knife, and grab corn,
pumpkin pie and golden feathers on the way. Every stumble lets the farmer close in — three stumbles and you are
caught. Run 1,000 metres through the farmyard, the barn and the kitchen to
reach the forest gate and escape.

## What is in here

- `game/` — the whole game, plain static files. `game/index.html` opens in
  desktop Chrome and plays with no network request.
  - `game/src/config.js` — tuning, palette, stages
  - `game/src/random.js` — seeded random generator
  - `game/src/audio.js` — WebAudio sound effects, synthesised on the spot
  - `game/src/input.js` — keyboard, mouse and touch input
  - `game/src/world.js` — stages, spawning, obstacles, pickups, hits
  - `game/src/render.js` — every pixel: turkey, farmer, farm, kitchen, HUD
  - `game/src/shots.js` — posed states for the screenshots
  - `game/src/main.js` — game loop and state machine
- `main.ts` — the hand-in program (Node 22, standard library only). It
  copies `game/` and `screenshots/` to `/output` and writes
  `dossier.json`. Run it twice and the outputs are byte-identical.
- `screenshots/` — four real renders of the game: title, a run in play,
  the kitchen at its most dangerous, and the escape.
- `shots.json` — the shot list used to take them.

## Entry

Built for the [make.fun turkey escape game bounty](https://make.fun/bounty/turkey-run-game-01)
(`turkey-run-game-01`). All art, sounds and names are original, drawn and
synthesised for this game.

## License

MIT — see [LICENSE](LICENSE).
