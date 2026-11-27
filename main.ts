// Gobble Run — the hand-in program for the make.fun turkey-run-game-01 bounty.
// Node 22, standard library only. It copies this repository's game/ and
// screenshots/ into the grader's output directory and writes dossier.json,
// the summary the judge reads, with the vendored make.fun library.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice and the two outputs are byte-identical: everything it
// copies is a file in this repository, and the dossier is a pure function
// of those files.
//
// Parent verification pass (2026-11-27): restructured into small helpers with
// the scorer's caps as one named constant; behaviour unchanged — same files
// copied, same dossier inputs, same byte-identical outputs.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps are the scorer's own (reference/gate.json): only text_max_bytes
// shapes the bytes; the others refuse an entry the scorer would refuse
// (more than 4 screenshots or one over 256 KiB; more than 993 files in
// game/ or 48 MiB of game files, in all, or a path under game/ over
// 1000 bytes).
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
} as const;

function resetOutputDir(dir: string): void {
  // Clear only the CONTENTS of the output directory, never the directory
  // itself: the grader mounts /output as a bind mount, and removing the
  // mount point throws EBUSY (verified locally), failing the graded run.
  // The grader hands us an empty /output, so this is belt and braces.
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyIfPresent(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  if (existsSync(src)) cpSync(src, dest, { recursive: true });
}

resetOutputDir(out);
if (!existsSync(join(here, 'game'))) {
  throw new Error('game/ is missing from the repository — cannot hand in an empty game');
}
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
copyIfPresent(join(here, 'screenshots'), join(out, 'screenshots'));

writeFileSync(join(out, 'dossier.json'), buildDossier(out, DOSSIER_CAPS));
