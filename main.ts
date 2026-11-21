// Leonida Legend, the GTA VI trophy guide in app/, is handed in by this program.
// It stages the guide exactly as the grader expects to find it: the static app and the
// maker's screenshots are copied into the output directory, and a dossier describing
// them (screenshots, first-load files and bytes, source) is written beside them with
// the vendored make.fun library. That library file, vendor/makefun-frontend.ts, is the
// kit's own and stays untouched: the scorer rebuilds the dossier with its copy and the
// two must agree byte for byte.
//
// Run it the way the grader does, or locally with an output directory of your choice:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for /output outside the grader's container.)
// Serve the guide itself with `node serve.ts` and open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The app goes in whole: plain files a browser opens offline at app/index.html.
mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outDir, 'app'), { recursive: true });

// The screenshots ride along (the first by name is the cover the judge sees first).
const shotsDir = join(repoDir, 'screenshots');
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
}

// The dossier, under the scorer's own caps: at most 4 screenshots of 256 KiB each,
// at most 993 files and directories and 48 MiB in app/, and 160 KiB of source text.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
