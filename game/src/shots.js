// Gobble Run — posed states for screenshots.
// One clear job: build a fixed, readable game state for each `?shot=`
// name, from the game's own state and drawing code, so every screenshot is
// a real render of the game — the title screen, a run in play, the kitchen
// at its most dangerous, and an escaped ending.
//
// The poses are deterministic: the same seed always builds the same picture.

import { ESCAPE_DISTANCE, GROUND_Y, TURKEY_X } from './config.js';
import { makeEntity } from './world.js';

function placePosedWorld(game, distance, score, lives, farmerGap) {
  const w = game.world;
  w.distance = distance;
  w.score = score;
  w.farmerGap = farmerGap;
  game.lives = lives;
  game.scroll = distance * 50;
  game.runPhase = 2.4;
  game.time = 6.2;
}

export function poseForShot(game, shot) {
  const rng = game.world.rng;
  if (shot === 'start') {
    game.state = 'title';
    game.time = 3.1;
    game.best = 486;
    game.world.farmerGap = 80; // farmer fully in frame, behind the turkey
    return;
  }

  if (shot === 'play') {
    // Mid-run in the barn: fence ahead, corn arc to chase, a knife about
    // to drop, the farmer closing in, two hearts left.
    game.state = 'play';
    placePosedWorld(game, 412, 1280, 2, 62);
    const w = game.world;
    w.entities = [
      makeEntity('fence', 620, rng),
      makeEntity('corn', 700, rng),
      makeEntity('corn', 752, rng),
      makeEntity('corn', 804, rng),
      makeEntity('knife', 880, rng),
      makeEntity('haybale', 880, rng),
    ];
    w.entities[4].dropped = true;
    w.entities[4].swing = 0.55;
    w.entities[4].y = -140 + 0.55 * 480;
    game.turkey.y = GROUND_Y - 96; // caught mid-jump over the fence
    game.turkey.onGround = false;
    return;
  }

  if (shot === 'kitchen') {
    // The kitchen at its worst: the oven roaring, a knife falling, a pie
    // to grab, one heart left and the farmer almost on the turkey.
    game.state = 'play';
    placePosedWorld(game, 788, 3420, 1, 44);
    const w = game.world;
    w.entities = [
      makeEntity('oven', 600, rng),
      makeEntity('pie', 742, rng),
      makeEntity('knife', 830, rng),
      makeEntity('corn', 930, rng),
      makeEntity('corn', 982, rng),
    ];
    w.entities[2].dropped = true;
    w.entities[2].swing = 0.8;
    w.entities[2].y = -140 + 0.8 * 480;
    w.flash = 0.25;
    game.turkey.y = GROUND_Y - 130;
    game.turkey.onGround = false;
    return;
  }

  if (shot === 'end') {
    // Escaped: past the forest gate, score tallied, best distance kept.
    game.state = 'end';
    game.won = true;
    placePosedWorld(game, ESCAPE_DISTANCE, 9860, 2, 120);
    game.best = ESCAPE_DISTANCE;
    game.time = 4.4;
    return;
  }

  if (shot === 'caught') {
    game.state = 'end';
    game.won = false;
    placePosedWorld(game, 523, 2140, 0, 0);
    game.best = 640;
    game.time = 4.4;
    return;
  }

  // An unknown shot name falls back to the title screen.
  game.state = 'title';
}
