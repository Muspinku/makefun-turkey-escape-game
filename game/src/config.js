// Gobble Run — tuning, palette and stage table.
// One clear job: every number the game balances on lives here, so tuning
// never means hunting through the update or the drawing code.

export const VIEW = { width: 960, height: 540 };

export const PALETTE = {
  skyTop: '#f7b733',
  skyMid: '#fcb85c',
  skyLow: '#f8a24e',
  sun: '#ffdf6b',
  hillFar: '#c98a4b',
  hillNear: '#a86f3c',
  ground: '#8a5a2b',
  groundTop: '#b5773a',
  fence: '#6e4520',
  hay: '#e8b64c',
  hayDark: '#c9932f',
  turkeyBody: '#8a5a33',
  turkeyDark: '#6b4423',
  turkeyWing: '#5d3a1e',
  featherRed: '#c0392b',
  featherOrange: '#e67e22',
  featherGold: '#f1c40f',
  beak: '#e67e22',
  wattle: '#c0392b',
  farmerShirt: '#4a7c59',
  farmerHat: '#7a5a2e',
  farmerSkin: '#e8b98a',
  oven: '#3d3d3d',
  ovenDoor: '#222222',
  ovenFire: '#ff7b24',
  knifeBlade: '#d7dee8',
  knifeHandle: '#4a2c14',
  corn: '#f7d54a',
  cornHusk: '#5d8a3c',
  pie: '#d98a4b',
  textDark: '#3a2410',
  textLight: '#fff7e8',
  hudBack: 'rgba(58, 36, 16, 0.72)',
};

// The run crosses three places on the way out of the farm. Each stage sets
// the speed, which dangers can appear and how often, and the sky tint.
export const STAGES = [
  {
    name: 'THE FARMYARD',
    from: 0,
    to: 300,
    speed: 250,
    spawnEvery: [1.15, 1.75],
    dangers: ['fence', 'haybale', 'branch'],
    pickups: ['corn', 'corn', 'feather'],
    sky: 0,
  },
  {
    name: 'THE BARN',
    from: 300,
    to: 650,
    speed: 300,
    spawnEvery: [0.95, 1.45],
    dangers: ['fence', 'haybale', 'knife', 'branch'],
    pickups: ['corn', 'feather', 'corn'],
    sky: 1,
  },
  {
    name: 'THE KITCHEN',
    from: 650,
    to: 1000,
    speed: 350,
    spawnEvery: [0.8, 1.25],
    dangers: ['oven', 'knife', 'fence', 'branch'],
    pickups: ['corn', 'pie', 'feather'],
    sky: 2,
  },
];

export const ESCAPE_DISTANCE = 1000; // metres to the forest gate: freedom.
export const START_LIVES = 3;
export const GRAVITY = 2100; // px / s^2
export const JUMP_SPEED = 860; // px / s — a full jump stays up ~0.82 s, long
// enough to clear the widest oven with a little slack for the player's timing
export const GROUND_Y = 452; // y of the ground line
export const TURKEY_X = 170; // the turkey stays here; the world scrolls
export const SCORE_PER_METRE = 10;
export const CORN_SCORE = 50;
export const PIE_SCORE = 100;
export const FEATHER_SCORE = 150;
export const FARMER_START_GAP = 120; // px behind the turkey at the start
export const FARMER_CATCH_GAP = 26; // px: the farmer grabs the turkey
export const FARMER_STUMBLE_CATCHUP = 46; // px the farmer gains per stumble
export const FARMER_CLEAN_PUSHBACK = 6; // px the farmer loses per clean jump
