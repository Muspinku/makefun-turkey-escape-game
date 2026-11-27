// Gobble Run — the game loop and the state machine.
// One clear job: own the turkey's physics, the screens (title, playing,
// paused, caught, escaped) and the frame loop. Drawing lives in render.js,
// the world in world.js.

import {
  ESCAPE_DISTANCE,
  GRAVITY,
  GROUND_Y,
  JUMP_SPEED,
  START_LIVES,
  TURKEY_X,
  VIEW,
} from './config.js';
import { makeRandom } from './random.js';
import { World } from './world.js';
import { Input } from './input.js';
import { SoundFX } from './audio.js';
import {
  drawEnd,
  drawFarmer,
  drawFlash,
  drawGround,
  drawHills,
  drawHUD,
  drawEntity,
  drawPaused,
  drawSky,
  drawTitle,
  drawTurkey,
} from './render.js';
import { poseForShot } from './shots.js';

export const STATES = { TITLE: 'title', PLAY: 'play', PAUSED: 'paused', END: 'end' };

export class GobbleRun {
  constructor(canvas, params) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.params = params;
    this.input = new Input(canvas);
    this.sound = new SoundFX();
    this.state = STATES.TITLE;
    this.time = 0;
    this.scroll = 0;
    this.best = 0;
    this.lives = START_LIVES;
    this.won = false;
    this.runPhase = 0;
    this.turkey = this.freshTurkey();
    this.world = new World(makeRandom(this.seed()));
    this.shot = params.get('shot');
    if (this.shot) poseForShot(this, this.shot);
  }

  seed() {
    const raw = Number(this.params.get('seed') || '7');
    return Number.isFinite(raw) ? raw : 7;
  }

  freshTurkey() {
    return {
      y: GROUND_Y, // feet position
      vy: 0,
      onGround: true,
      ducking: false,
      invulnerable: 0,
      hitBox() {
        if (this.ducking) return { x: TURKEY_X - 34, y: this.y - 34, w: 70, h: 34 };
        return { x: TURKEY_X - 30, y: this.y - 78, w: 62, h: 78 };
      },
    };
  }

  startRun() {
    this.world.reset(makeRandom(this.seed() + Math.floor(Math.random() * 100000)));
    this.turkey = this.freshTurkey();
    this.lives = START_LIVES;
    this.won = false;
    this.state = STATES.PLAY;
    this.sound.unlock();
    this.sound.gobble();
  }

  // One fixed step of play. Kept separate from the frame loop so the
  // screenshot poses can step the game deterministically.
  step(dt) {
    const t = this.turkey;
    const w = this.world;

    // Ducking: only on the ground, and it ends the moment the key lifts.
    t.ducking = this.input.duckHeld && t.onGround;
    if (this.input.jumpPressed && t.onGround && !t.ducking) {
      t.vy = -JUMP_SPEED;
      t.onGround = false;
      this.sound.jump();
    }
    if (!this.input.jumpHeld && t.vy < -300) t.vy = -300; // short hop on early release

    t.vy += GRAVITY * dt;
    t.y += t.vy * dt;
    if (t.y >= GROUND_Y) {
      t.y = GROUND_Y;
      t.vy = 0;
      t.onGround = true;
    }
    if (t.invulnerable > 0) t.invulnerable -= dt;

    const events = w.update(dt, t);
    for (const e of events) {
      if (e === 'pickup') this.sound.corn();
      else if (e === 'feather') this.sound.feather();
      else if (e === 'spotted') this.sound.spotted();
      else if (e === 'stumble') {
        this.lives -= 1;
        t.invulnerable = 1.6;
        this.sound.stumble();
        this.sound.gobble();
      }
    }

    this.scroll += w.stage.speed * dt;
    this.runPhase += dt * (t.onGround ? 11 : 4);

    if (w.escaped) {
      this.won = true;
      this.state = STATES.END;
      this.best = Math.max(this.best, w.distance);
      this.sound.escaped();
    } else if (w.caught || this.lives <= 0) {
      this.won = false;
      this.state = STATES.END;
      this.best = Math.max(this.best, w.distance);
      this.sound.caught();
    }
  }

  frame(now) {
    const dt = Math.min(0.05, (now - (this.lastNow ?? now)) / 1000 || 0.016);
    this.lastNow = now;
    this.time += dt;

    if (this.state === STATES.TITLE) {
      if (this.input.jumpPressed || this.input.clicked) this.startRun();
    } else if (this.state === STATES.PLAY) {
      if (this.input.pressed('KeyP')) {
        this.state = STATES.PAUSED;
        this.input.keys.delete('KeyP');
      } else {
        this.step(dt);
      }
    } else if (this.state === STATES.PAUSED) {
      if (this.input.pressed('KeyP') || this.input.clicked) {
        this.state = STATES.PLAY;
        this.input.keys.delete('KeyP');
      }
    } else if (this.state === STATES.END) {
      if (this.input.pressed('KeyR') || this.input.clicked) {
        this.input.keys.delete('KeyR');
        this.startRun();
      }
    }
    if (this.input.pressed('KeyM')) {
      this.sound.toggleMute();
      this.input.keys.delete('KeyM');
    }

    this.render();
    this.input.endFrame();
    if (!this.frozen) requestAnimationFrame((t) => this.frame(t));
  }

  render() {
    const ctx = this.ctx;
    const w = this.world;
    const stageIndex = w.stage.sky;
    ctx.clearRect(0, 0, VIEW.width, VIEW.height);
    drawSky(ctx, stageIndex, this.time);
    drawHills(ctx, stageIndex, this.scroll);
    drawGround(ctx, this.scroll, stageIndex);

    // The finish: a forest gate with a sunrise behind it, once close.
    const remaining = ESCAPE_DISTANCE - w.distance;
    if (this.state === STATES.PLAY && remaining < 120) {
      const gx = TURKEY_X + remaining * 50;
      ctx.fillStyle = '#5d3a1e';
      ctx.fillRect(gx - 8, GROUND_Y - 150, 16, 150);
      ctx.fillRect(gx + 92, GROUND_Y - 150, 16, 150);
      ctx.fillStyle = '#7a5a2e';
      ctx.fillRect(gx - 20, GROUND_Y - 158, 140, 16);
      ctx.fillStyle = '#ffdf6b';
      ctx.font = 'bold 20px Trebuchet MS, Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FREEDOM', gx + 50, GROUND_Y - 168);
    }

    for (const e of w.entities) drawEntity(ctx, e, this.time);

    // The farmer runs behind the turkey, closer when the turkey stumbles.
    const farmerX = TURKEY_X - 46 - w.farmerGap;
    drawFarmer(ctx, farmerX, GROUND_Y, this.runPhase, this.time);
    drawTurkey(
      ctx,
      TURKEY_X,
      this.turkey.y,
      this.turkey.ducking,
      this.runPhase,
      this.turkey.invulnerable > 0,
      this.time,
    );

    if (this.state === STATES.PLAY || this.state === STATES.PAUSED) {
      drawHUD(ctx, {
        score: w.score,
        distance: w.distance,
        lives: this.lives,
        stageName: w.stage.name,
        farmerGap: w.farmerGap,
      });
    }
    drawFlash(ctx, w.flash);
    if (this.state === STATES.TITLE) drawTitle(ctx, this.time, this.best);
    else if (this.state === STATES.END) {
      drawEnd(ctx, this.won, w.score, w.distance, this.time, this.best);
    } else if (this.state === STATES.PAUSED) drawPaused(ctx);
  }

  // The browser entry point: size the canvas, then run.
  static boot(canvas) {
    canvas.width = VIEW.width;
    canvas.height = VIEW.height;
    const params = new URLSearchParams(window.location.search);
    const game = new GobbleRun(canvas, params);
    if (game.shot) {
      // A posed screenshot: draw one frame and stop. The pose is built from
      // the game's own state, so the picture is a real render of the game.
      game.render();
      game.frozen = true;
      return game;
    }
    requestAnimationFrame((t) => game.frame(t));
    return game;
  }
}
