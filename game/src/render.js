// Gobble Run — every pixel the player sees, drawn on one canvas.
// One clear job: turn a game state into a picture. No game logic lives
// here; it only reads positions, lives, score and stage and draws them.

import { GROUND_Y, PALETTE, TURKEY_X, VIEW } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function outlinedText(ctx, str, x, y, size, color, align = 'left') {
  ctx.font = `bold ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(3, size / 8);
  ctx.strokeStyle = 'rgba(58, 36, 16, 0.85)';
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

export function drawSky(ctx, stageIndex, time) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  const tops = [PALETTE.skyTop, '#f2a35e', '#e8833a'];
  const lows = [PALETTE.skyLow, '#e08a4e', '#b85c28'];
  grad.addColorStop(0, tops[stageIndex]);
  grad.addColorStop(0.62, PALETTE.skyMid);
  grad.addColorStop(1, lows[stageIndex]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);

  // Low autumn sun, slowly breathing.
  const pulse = 1 + Math.sin(time * 1.4) * 0.02;
  ctx.fillStyle = PALETTE.sun;
  ellipse(ctx, 800, 92, 46 * pulse, 46 * pulse);
  ctx.fillStyle = 'rgba(255, 223, 107, 0.35)';
  ellipse(ctx, 800, 92, 66 * pulse, 66 * pulse);

  // Drifting clouds.
  ctx.fillStyle = 'rgba(255, 247, 232, 0.85)';
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 340 + time * 12) % 1100) - 80;
    const cy = 56 + i * 34;
    ellipse(ctx, cx, cy, 42, 16);
    ellipse(ctx, cx + 30, cy + 6, 34, 13);
    ellipse(ctx, cx - 32, cy + 7, 28, 11);
  }
}

export function drawHills(ctx, stageIndex, scroll) {
  // Two parallax hill ridges; the kitchen stage swaps them for rooftops.
  ctx.fillStyle = PALETTE.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW.width; x += 40) {
    const h = 60 + Math.sin((x + scroll * 0.3) / 130) * 26;
    ctx.lineTo(x, GROUND_Y - h);
  }
  ctx.lineTo(VIEW.width, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  if (stageIndex < 2) {
    ctx.fillStyle = PALETTE.hillNear;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = 0; x <= VIEW.width; x += 40) {
      const h = 26 + Math.sin((x + scroll * 0.6 + 200) / 90) * 14;
      ctx.lineTo(x, GROUND_Y - h);
    }
    ctx.lineTo(VIEW.width, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  } else {
    // The kitchen: a warm plaster wall with a window on the yard, copper
    // pots on a rail and a shelf of plates — unmistakably indoors.
    ctx.fillStyle = '#e6b877';
    ctx.fillRect(0, 0, VIEW.width, GROUND_Y);
    ctx.fillStyle = '#c98f4e';
    ctx.fillRect(0, GROUND_Y - 86, VIEW.width, 86); // wainscot
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, GROUND_Y - 92, VIEW.width, 6);
    // Window on the autumn yard.
    ctx.fillStyle = '#7a4a2a';
    roundRect(ctx, 330, 74, 300, 220, 8);
    ctx.fill();
    const win = ctx.createLinearGradient(0, 86, 0, 282);
    win.addColorStop(0, '#f7b733');
    win.addColorStop(1, '#f8a24e');
    ctx.fillStyle = win;
    ctx.fillRect(342, 86, 276, 196);
    ctx.fillStyle = '#ffdf6b';
    ellipse(ctx, 560, 130, 24, 24);
    ctx.fillStyle = '#a86f3c';
    ctx.beginPath();
    ctx.moveTo(342, 282);
    ctx.quadraticCurveTo(480, 210, 618, 282);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a4a2a';
    ctx.fillRect(474, 86, 12, 196);
    ctx.fillRect(342, 178, 276, 12);
    // Copper pots hanging on a rail.
    ctx.fillStyle = '#5d3a1e';
    ctx.fillRect(40, 60, 220, 8);
    for (let i = 0; i < 3; i++) {
      const px = 70 + i * 70;
      ctx.fillStyle = '#b87333';
      ellipse(ctx, px, 108, 24, 26);
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(px - 3, 76, 6, 12);
    }
    // Shelf of plates on the right.
    ctx.fillStyle = '#7a4a2a';
    ctx.fillRect(700, 120, 200, 10);
    ctx.fillStyle = '#fff7e8';
    for (let i = 0; i < 4; i++) ellipse(ctx, 730 + i * 40, 108, 14, 14);
    ctx.fillStyle = '#c0392b';
    ellipse(ctx, 850, 108, 14, 14);
  }
}

export function drawGround(ctx, scroll, stageIndex) {
  ctx.fillStyle = PALETTE.ground;
  ctx.fillRect(0, GROUND_Y, VIEW.width, VIEW.height - GROUND_Y);
  ctx.fillStyle = PALETTE.groundTop;
  ctx.fillRect(0, GROUND_Y, VIEW.width, 10);
  // Scrolling tufts and stones so the ground reads as moving.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 0; i < 14; i++) {
    const gx = ((i * 97 - scroll) % 1040 + 1040) % 1040 - 40;
    ctx.fillRect(gx, GROUND_Y + 26 + (i % 3) * 18, 22, 4);
  }
  if (stageIndex === 2) {
    // Kitchen tiles peeking through the dirt near the house.
    ctx.fillStyle = 'rgba(255, 247, 232, 0.25)';
    for (let x = 0; x < VIEW.width; x += 64) {
      ctx.fillRect(x, GROUND_Y + 52, 30, 26);
    }
  }
}

// The hero: a plump brown turkey, mid-waddle, tail fanned behind it.
export function drawTurkey(ctx, x, y, ducking, runPhase, invulnerable, time) {
  ctx.save();
  if (invulnerable && Math.floor(time * 14) % 2 === 0) ctx.globalAlpha = 0.45;
  ctx.translate(x, y);

  if (ducking) {
    // Tucked low, beak down, tail up — sliding under the swing.
    ctx.fillStyle = PALETTE.turkeyBody;
    ellipse(ctx, 0, -16, 34, 16);
    ctx.fillStyle = PALETTE.featherRed;
    ellipse(ctx, -30, -26, 16, 8);
    ctx.fillStyle = PALETTE.turkeyDark;
    ellipse(ctx, 26, -24, 12, 10); // head tucked
    ctx.fillStyle = PALETTE.beak;
    ctx.beginPath();
    ctx.moveTo(34, -26);
    ctx.lineTo(46, -21);
    ctx.lineTo(34, -18);
    ctx.closePath();
    ctx.fill();
  } else {
    const bob = Math.sin(runPhase) * 3;
    const legSwing = Math.sin(runPhase) * 8;
    // Tail fan.
    for (let i = -2; i <= 2; i++) {
      ctx.fillStyle = [PALETTE.featherRed, PALETTE.featherOrange, PALETTE.featherGold][
        Math.abs(i) % 3
      ];
      ctx.save();
      ctx.translate(-26, -34);
      ctx.rotate(i * 0.34);
      ellipse(ctx, 0, -20, 9, 24);
      ctx.restore();
    }
    // Legs, pumping.
    ctx.strokeStyle = PALETTE.beak;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(-6 + legSwing, 0);
    ctx.moveTo(8, -14);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();
    // Body.
    ctx.fillStyle = PALETTE.turkeyBody;
    ellipse(ctx, 0, -30 + bob * 0.4, 34, 26);
    ctx.fillStyle = PALETTE.turkeyWing;
    ellipse(ctx, -4, -28 + bob * 0.4, 18, 12);
    // Neck and head.
    ctx.fillStyle = PALETTE.turkeyDark;
    ellipse(ctx, 24, -52 + bob * 0.4, 11, 18);
    ellipse(ctx, 28, -66 + bob * 0.4, 12, 11);
    // Beak, wattle, eye.
    ctx.fillStyle = PALETTE.beak;
    ctx.beginPath();
    ctx.moveTo(38, -68 + bob * 0.4);
    ctx.lineTo(52, -63 + bob * 0.4);
    ctx.lineTo(38, -59 + bob * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.wattle;
    ellipse(ctx, 34, -56 + bob * 0.4, 4, 8);
    ctx.fillStyle = '#1c1210';
    ellipse(ctx, 31, -69 + bob * 0.4, 2.6, 2.6);
    ctx.fillStyle = '#fff';
    ellipse(ctx, 32, -70 + bob * 0.4, 1, 1);
  }
  ctx.restore();
}

// The farmer: flat cap, green shirt, apron, rolling pin in hand, always gaining.
export function drawFarmer(ctx, x, y, runPhase, time) {
  ctx.save();
  ctx.translate(x, y);
  const legSwing = Math.sin(runPhase * 1.15) * 9;
  const bob = Math.abs(Math.sin(runPhase * 1.15)) * -3;
  // Legs.
  ctx.strokeStyle = '#3a2c1c';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -52 + bob);
  ctx.lineTo(-4 + legSwing, 0);
  ctx.moveTo(6, -52 + bob);
  ctx.lineTo(6 - legSwing, 0);
  ctx.stroke();
  // Apron and shirt.
  ctx.fillStyle = PALETTE.farmerShirt;
  roundRect(ctx, -16, -104 + bob, 34, 54, 8);
  ctx.fill();
  ctx.fillStyle = '#efe3c8';
  roundRect(ctx, -13, -88 + bob, 28, 38, 6);
  ctx.fill();
  // Arms reaching forward, rolling pin in hand.
  ctx.strokeStyle = PALETTE.farmerShirt;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(10, -96 + bob);
  ctx.lineTo(34, -82 + bob);
  ctx.stroke();
  ctx.fillStyle = '#c8a06a';
  roundRect(ctx, 30, -90 + bob, 34, 9, 4);
  ctx.fill();
  // Head, moustache, flat cap.
  ctx.fillStyle = PALETTE.farmerSkin;
  ellipse(ctx, 2, -116 + bob, 13, 14);
  ctx.fillStyle = '#5d3a1e';
  ctx.fillRect(-8, -112 + bob, 20, 5); // moustache
  ctx.fillStyle = PALETTE.farmerHat;
  ellipse(ctx, 2, -128 + bob, 15, 6);
  ctx.fillRect(-13, -134 + bob, 30, 7);
  // Angry eye, fixed on the turkey.
  ctx.fillStyle = '#1c1210';
  ellipse(ctx, 9, -118 + bob, 2.4, 2.4);
  ctx.restore();
}

function drawFence(ctx, e) {
  ctx.fillStyle = PALETTE.fence;
  for (const px of [0, e.w / 2 - 3, e.w - 6]) {
    ctx.fillRect(e.x + px, e.y + 8, 6, e.h - 8);
  }
  ctx.fillRect(e.x - 4, e.y + 14, e.w + 8, 8);
  ctx.fillRect(e.x - 4, e.y + 40, e.w + 8, 8);
  ctx.fillStyle = '#8a5f30';
  ctx.fillRect(e.x - 4, e.y, e.w + 8, 8);
}

// A low branch with leaves dangling to head height: duck under it.
function drawBranch(ctx, e, time) {
  ctx.fillStyle = '#6e4520';
  ctx.fillRect(e.x - 8, e.y, e.w + 16, 14); // the limb
  ctx.fillStyle = '#5d8a3c';
  for (let i = 0; i < 3; i++) {
    const lx = e.x + 8 + i * 24;
    const sway = Math.sin(time * 2 + i * 1.7) * 3;
    ellipse(ctx, lx + sway, e.y + 52, 15, 30);
    ellipse(ctx, lx + 10 + sway, e.y + 78, 12, 20);
  }
  ctx.fillStyle = '#e67e22';
  ellipse(ctx, e.x + 20, e.y + 66, 5, 5);
  ellipse(ctx, e.x + 52, e.y + 58, 5, 5);
}

function drawHaybale(ctx, e, time) {
  ctx.fillStyle = PALETTE.hay;
  ellipse(ctx, e.x + e.w / 2, e.y + e.h / 2, e.w / 2, e.h / 2);
  ctx.strokeStyle = PALETTE.hayDark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w / 2 - 6, e.h / 2 - 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w / 4, e.h / 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  // A few loose straws waving.
  ctx.strokeStyle = PALETTE.hayDark;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const sx = e.x + 12 + i * 18;
    ctx.beginPath();
    ctx.moveTo(sx, e.y + 4);
    ctx.quadraticCurveTo(sx + 4, e.y - 8, sx + 8 + Math.sin(time * 3 + i) * 3, e.y - 12);
    ctx.stroke();
  }
}

function drawOven(ctx, e, time) {
  // A big black oven with a glowing door and a fire licking out of it.
  ctx.fillStyle = PALETTE.oven;
  roundRect(ctx, e.x, e.y, e.w, e.h, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.ovenDoor;
  roundRect(ctx, e.x + 12, e.y + 34, e.w - 24, e.h - 46, 5);
  ctx.fill();
  // Flames licking out of the door: three tongues, brightest at the core.
  const flames = [
    { x: 0.3, h: 0.62, c: '#ff7b24' },
    { x: 0.5, h: 0.85, c: '#ffa726' },
    { x: 0.7, h: 0.6, c: '#ff7b24' },
  ];
  for (const f of flames) {
    const fx = e.x + e.w * f.x;
    const fh = (e.h - 46) * f.h * (0.9 + Math.sin(time * 11 + f.x * 9) * 0.1);
    const top = e.y + e.h - 12 - fh;
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.moveTo(fx - 13, e.y + e.h - 12);
    ctx.quadraticCurveTo(fx - 15, top + fh * 0.5, fx, top);
    ctx.quadraticCurveTo(fx + 15, top + fh * 0.5, fx + 13, e.y + e.h - 12);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#ffdf6b';
  ellipse(ctx, e.x + e.w * 0.5, e.y + e.h - 20, 10, 8);
  ctx.fillStyle = '#888';
  ctx.fillRect(e.x + 8, e.y + 8, e.w - 16, 10);
  ctx.fillStyle = '#ff5b3a';
  ellipse(ctx, e.x + e.w - 18, e.y + 13, 4, 4);
  text(ctx, 'HOT!', e.x + e.w / 2, e.y - 12, 15, '#fff', 'center');
}

function drawKnife(ctx, e, time) {
  // A carving knife on a string, swinging down from the top of the frame.
  const topY = e.y;
  ctx.strokeStyle = '#7a6a55';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(e.x + e.w / 2, 0);
  ctx.lineTo(e.x + e.w / 2, topY + 6);
  ctx.stroke();
  const sway = e.dropped ? Math.sin(time * 4) * 4 : 0;
  ctx.save();
  ctx.translate(e.x + e.w / 2 + sway, topY + 6);
  ctx.rotate(e.dropped ? 0.12 : 0);
  ctx.fillStyle = PALETTE.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.lineTo(7, 0);
  ctx.lineTo(3, 84);
  ctx.lineTo(0, 104);
  ctx.lineTo(-3, 84);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.knifeHandle;
  roundRect(ctx, -7, -34, 14, 36, 5);
  ctx.fill();
  ctx.restore();
  if (!e.dropped) {
    // A shadow on the ground warns where it will fall.
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ellipse(ctx, e.x + e.w / 2, GROUND_Y + 6, 26, 6);
    text(ctx, '!', e.x + e.w / 2, GROUND_Y - 66, 26, '#c0392b', 'center');
  }
}

function drawPickup(ctx, e, time) {
  const bob = Math.sin(time * 4 + e.bobPhase) * 5;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2 + bob);
  if (e.kind === 'corn') {
    ctx.fillStyle = PALETTE.cornHusk;
    ctx.beginPath();
    ctx.moveTo(-12, 8);
    ctx.lineTo(-18, 22);
    ctx.lineTo(-6, 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, 8);
    ctx.lineTo(18, 22);
    ctx.lineTo(6, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.corn;
    ellipse(ctx, 0, 0, 11, 17);
    ctx.fillStyle = '#d9a92c';
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) ctx.fillRect(c * 6 - 1, r * 9 - 1, 2, 2);
    }
  } else if (e.kind === 'pie') {
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.moveTo(-16, 8);
    ctx.lineTo(16, 8);
    ctx.lineTo(10, -8);
    ctx.lineTo(-10, -8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.pie;
    ctx.beginPath();
    ctx.moveTo(-14, 8);
    ctx.lineTo(14, 8);
    ctx.lineTo(9, -6);
    ctx.lineTo(-9, -6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ellipse(ctx, 0, -8, 6, 4);
  } else {
    // Golden feather: the rare one.
    ctx.fillStyle = PALETTE.featherGold;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 18, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff7c0';
    ctx.beginPath();
    ctx.ellipse(-2, -4, 3, 12, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawEntity(ctx, e, time) {
  switch (e.kind) {
    case 'fence':
      drawFence(ctx, e);
      break;
    case 'haybale':
      drawHaybale(ctx, e, time);
      break;
    case 'branch':
      drawBranch(ctx, e, time);
      break;
    case 'oven':
      drawOven(ctx, e, time);
      break;
    case 'knife':
      drawKnife(ctx, e, time);
      break;
    default:
      drawPickup(ctx, e, time);
      break;
  }
}

export function drawHUD(ctx, state) {
  // Score, distance, lives and the farmer's closing gap, top of the screen.
  ctx.fillStyle = PALETTE.hudBack;
  roundRect(ctx, 12, 10, 300, 64, 10);
  ctx.fill();
  text(ctx, `SCORE ${state.score}`, 26, 30, 20, PALETTE.textLight);
  text(ctx, `${Math.floor(state.distance)} m  ·  ${state.stageName}`, 26, 56, 16, '#ffd98a');
  // Hearts.
  for (let i = 0; i < 3; i++) {
    const hx = 340 + i * 34;
    const hy = 34;
    ctx.fillStyle = i < state.lives ? '#e74c3c' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(hx, hy + 8);
    ctx.bezierCurveTo(hx - 12, hy - 4, hx - 6, hy - 12, hx, hy - 4);
    ctx.bezierCurveTo(hx + 6, hy - 12, hx + 12, hy - 4, hx, hy + 8);
    ctx.fill();
  }
  // The farmer meter: how close the farmer is behind the turkey.
  ctx.fillStyle = PALETTE.hudBack;
  roundRect(ctx, VIEW.width - 262, 10, 250, 64, 10);
  ctx.fill();
  text(ctx, 'FARMER', VIEW.width - 248, 28, 13, '#ffb3a0');
  const closeness = 1 - state.farmerGap / 120;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, VIEW.width - 248, 40, 222, 14, 7);
  ctx.fill();
  ctx.fillStyle = closeness > 0.7 ? '#e74c3c' : closeness > 0.4 ? '#e67e22' : '#5d8a3c';
  roundRect(ctx, VIEW.width - 248, 40, 222 * closeness, 14, 7);
  ctx.fill();
  text(ctx, closeness > 0.7 ? 'RUN!' : closeness > 0.4 ? 'CLOSING IN…' : 'FAR BEHIND', VIEW.width - 26, 28, 13, PALETTE.textLight, 'right');
}

export function drawTitle(ctx, time, best) {
  ctx.fillStyle = 'rgba(58, 36, 16, 0.38)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  outlinedText(ctx, 'GOBBLE RUN', VIEW.width / 2, 108, 72, '#ffdf6b', 'center');
  outlinedText(ctx, 'A TURKEY ESCAPE', VIEW.width / 2, 168, 30, PALETTE.textLight, 'center');
  text(
    ctx,
    'Thanksgiving is coming. The farmer is coming faster. Run, turkey, run!',
    VIEW.width / 2,
    208,
    19,
    PALETTE.textLight,
    'center',
  );
  // The turkey, big and proud, on the title screen — kept clear of the tagline above it.
  ctx.save();
  ctx.translate(VIEW.width / 2, 345);
  ctx.scale(1.6, 1.6);
  drawTurkey(ctx, 0, 0, false, time * 6, false, time);
  ctx.restore();
  // Start button.
  const pulse = 1 + Math.sin(time * 4) * 0.04;
  ctx.save();
  ctx.translate(VIEW.width / 2, 452);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#5d8a3c';
  roundRect(ctx, -150, -28, 300, 56, 28);
  ctx.fill();
  ctx.strokeStyle = '#fff7e8';
  ctx.lineWidth = 3;
  roundRect(ctx, -150, -28, 300, 56, 28);
  ctx.stroke();
  text(ctx, '▶  START THE ESCAPE', 0, 2, 22, '#fff', 'center');
  ctx.restore();
  text(
    ctx,
    'SPACE / CLICK to jump  ·  ↓ / S to duck under branches  ·  P pause  ·  M mute',
    VIEW.width / 2,
    508,
    15,
    '#ffe9c4',
    'center',
  );
  if (best > 0) text(ctx, `Best escape: ${Math.floor(best)} m`, VIEW.width / 2, 56, 16, '#ffd98a', 'center');
}

export function drawEnd(ctx, won, score, distance, time, best) {
  // Nearly opaque, so the world behind never fights the message.
  ctx.fillStyle = won ? 'rgba(46, 90, 40, 0.88)' : 'rgba(90, 30, 20, 0.88)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  if (won) {
    outlinedText(ctx, 'ESCAPED!', VIEW.width / 2, 120, 76, '#ffdf6b', 'center');
    text(
      ctx,
      'You made it to the forest gate. No Thanksgiving dinner for you!',
      VIEW.width / 2,
      184,
      20,
      PALETTE.textLight,
      'center',
    );
    ctx.save();
    ctx.translate(VIEW.width / 2, 330);
    ctx.scale(1.4, 1.4);
    drawTurkey(ctx, 0, 0, false, time * 6, false, time);
    ctx.restore();
  } else {
    outlinedText(ctx, 'CAUGHT!', VIEW.width / 2, 120, 76, '#ff8a7a', 'center');
    text(
      ctx,
      'The farmer got you… but every great escape deserves a second try.',
      VIEW.width / 2,
      184,
      20,
      PALETTE.textLight,
      'center',
    );
    ctx.save();
    ctx.translate(VIEW.width / 2, 300);
    drawFarmer(ctx, 0, 0, time * 6, time);
    ctx.restore();
    text(ctx, 'Better luck next Thanksgiving, turkey.', VIEW.width / 2, 352, 17, '#ffd9c4', 'center');
  }
  text(ctx, `SCORE ${score}   ·   DISTANCE ${Math.floor(distance)} m`, VIEW.width / 2, 404, 22, PALETTE.textLight, 'center');
  if (best > 0) text(ctx, `Best escape: ${Math.floor(best)} m`, VIEW.width / 2, 434, 16, '#ffd98a', 'center');
  const pulse = 1 + Math.sin(time * 4) * 0.04;
  ctx.save();
  ctx.translate(VIEW.width / 2, 484);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#5d8a3c';
  roundRect(ctx, -130, -24, 260, 48, 24);
  ctx.fill();
  ctx.strokeStyle = '#fff7e8';
  ctx.lineWidth = 3;
  roundRect(ctx, -130, -24, 260, 48, 24);
  ctx.stroke();
  text(ctx, '↻  RUN AGAIN  (R)', 0, 2, 20, '#fff', 'center');
  ctx.restore();
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(58, 36, 16, 0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  outlinedText(ctx, 'PAUSED', VIEW.width / 2, VIEW.height / 2 - 10, 54, PALETTE.textLight, 'center');
  text(ctx, 'Press P or click to keep running', VIEW.width / 2, VIEW.height / 2 + 40, 18, '#ffe9c4', 'center');
}

export function drawFlash(ctx, alpha) {
  if (alpha <= 0) return;
  ctx.fillStyle = `rgba(192, 57, 43, ${alpha * 0.45})`;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}
