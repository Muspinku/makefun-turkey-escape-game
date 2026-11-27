// Gobble Run — the world: stages, spawning, obstacles, pickups and hits.
// One clear job: everything that scrolls toward the turkey and everything
// that decides whether the turkey clears it, grabs it or trips over it.

import {
  CORN_SCORE,
  ESCAPE_DISTANCE,
  FARMER_CATCH_GAP,
  FARMER_CLEAN_PUSHBACK,
  FARMER_START_GAP,
  FARMER_STUMBLE_CATCHUP,
  FEATHER_SCORE,
  GROUND_Y,
  PIE_SCORE,
  STAGES,
  TURKEY_X,
} from './config.js';
import { chance, pick, range } from './random.js';

// An obstacle or pickup rolling in from the right. `kind` decides its shape
// and its hit box; `x` is its left edge in world pixels.
export function makeEntity(kind, x, rng) {
  const base = { kind, x, passed: false, bobPhase: rng() * Math.PI * 2 };
  switch (kind) {
    case 'fence':
      return { ...base, w: 56, h: 74, y: GROUND_Y - 74, jumpOver: true };
    case 'branch':
      // A low-hanging branch with leaves dangling to head height: jumping
      // into it hurts, but a duck slides right under it. The band spans
      // 280..380: the standing box (374..452) clips it, the ducking box
      // (418..452) clears it, and even a full jump (body 228..306 at the
      // top) still clips it on the way through.
      return { ...base, w: 70, h: 100, y: GROUND_Y - 172, jumpOver: false, duckUnder: true };
    case 'haybale':
      return { ...base, w: 64, h: 58, y: GROUND_Y - 58, jumpOver: true };
    case 'oven':
      // The dreaded oven: wide, hot, and tall enough that only a good jump clears it.
      return { ...base, w: 120, h: 110, y: GROUND_Y - 110, jumpOver: true, hot: true };
    case 'knife':
      // A carving knife hangs from the ceiling and swings down when the
      // turkey runs under it. Its hit box is only live while it drops.
      return { ...base, w: 16, h: 120, y: -140, jumpOver: false, swing: 0, dropped: false };
    case 'corn':
      return { ...base, w: 30, h: 40, y: GROUND_Y - 118, pickup: true, score: CORN_SCORE };
    case 'pie':
      return { ...base, w: 34, h: 26, y: GROUND_Y - 112, pickup: true, score: PIE_SCORE };
    case 'feather':
      return { ...base, w: 26, h: 40, y: GROUND_Y - 150, pickup: true, score: FEATHER_SCORE };
    default:
      return { ...base, w: 30, h: 30, y: GROUND_Y - 30 };
  }
}

export function stageFor(distance) {
  for (const stage of STAGES) {
    if (distance >= stage.from && distance < stage.to) return stage;
  }
  return STAGES[STAGES.length - 1];
}

export class World {
  constructor(seed) {
    this.rng = seed;
    this.entities = [];
    this.spawnTimer = 0.9;
    this.distance = 0;
    this.score = 0;
    this.farmerGap = FARMER_START_GAP; // px between farmer and turkey
    this.flash = 0; // red edge flash after a stumble, seconds left
  }

  get stage() {
    return stageFor(this.distance);
  }

  get escaped() {
    return this.distance >= ESCAPE_DISTANCE;
  }

  get caught() {
    return this.farmerGap <= FARMER_CATCH_GAP;
  }

  reset(seed) {
    this.rng = seed;
    this.entities = [];
    this.spawnTimer = 0.9;
    this.distance = 0;
    this.score = 0;
    this.farmerGap = FARMER_START_GAP;
    this.flash = 0;
  }

  spawn() {
    const stage = this.stage;
    const roll = this.rng();
    if (roll < 0.62) {
      const kind = pick(this.rng, stage.dangers);
      this.entities.push(makeEntity(kind, 1000, this.rng));
      // A knife always hangs over a gap the turkey must cross, never alone.
      if (kind === 'knife' && chance(this.rng, 0.5)) {
        this.entities.push(makeEntity('corn', 1060, this.rng));
      }
    } else {
      // A little arc of corn (or a pie, or a golden feather) to chase.
      const kind = pick(this.rng, stage.pickups);
      const count = kind === 'corn' ? 3 : 1;
      for (let i = 0; i < count; i++) {
        this.entities.push(makeEntity(kind, 1000 + i * 52, this.rng));
      }
    }
    const [min, max] = stage.spawnEvery;
    this.spawnTimer = range(this.rng, min, max);
  }

  // Move the world, drop knives, and resolve hits. Returns a list of events
  // the game loop turns into sound, score and feedback: 'jumped', 'pickup',
  // 'stumble', 'spotted'.
  update(dt, turkey) {
    const events = [];
    const speed = this.stage.speed;
    this.distance += (speed * dt) / 50; // 50 px of scroll is one metre
    this.score += Math.round(speed * dt * 0.2);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) this.spawn();

    for (const e of this.entities) {
      e.x -= speed * dt;
      if (e.kind === 'knife') {
        // The knife drops once the turkey is almost under it, then swings back up.
        if (!e.dropped && e.x < TURKEY_X + 90) {
          e.dropped = true;
          events.push('spotted');
        }
        if (e.dropped) {
          e.swing = Math.min(1, e.swing + dt * 6);
          // The blade drops until its tip is near the ground: its top edge
          // stops at y 346, just below the top of a full jump (feet y 276),
          // so a well-timed jump clears it and ducking does not.
          e.y = -140 + e.swing * 480;
        }
      }
      if (e.pickup) {
        e.y += Math.sin(performance.now() / 300 + e.bobPhase) * 0.15;
      }
    }
    this.entities = this.entities.filter((e) => e.x + e.w > -80);

    // The turkey's hit box shrinks while it ducks, so a low swing can pass over.
    const box = turkey.hitBox();
    for (const e of this.entities) {
      if (e.passed) continue;
      if (e.x + e.w < TURKEY_X) {
        e.passed = true;
        if (!e.pickup && turkey.onGround) {
          // Cleared it cleanly on the ground: the farmer falls a little behind.
          this.farmerGap = Math.min(FARMER_START_GAP, this.farmerGap + FARMER_CLEAN_PUSHBACK);
          events.push('jumped');
        }
        continue;
      }
      const overlap =
        box.x < e.x + e.w && box.x + box.w > e.x && box.y < e.y + e.h && box.y + box.h > e.y;
      if (!overlap) continue;
      if (e.pickup) {
        e.passed = true;
        this.score += e.score;
        events.push(e.kind === 'feather' ? 'feather' : 'pickup');
      } else if (!turkey.invulnerable) {
        e.passed = true;
        this.farmerGap = Math.max(0, this.farmerGap - FARMER_STUMBLE_CATCHUP);
        this.flash = 0.5;
        events.push('stumble');
      }
    }

    if (this.flash > 0) this.flash -= dt;
    return events;
  }
}
