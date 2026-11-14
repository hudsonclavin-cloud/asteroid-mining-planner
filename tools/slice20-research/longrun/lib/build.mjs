#!/usr/bin/env node
// Compile the production modules the long run needs into <scratch>/build-v2 (outside the repo).
// Run once before any LR script:  node tools/slice20-research/longrun/lib/build.mjs
import { buildV2, buildDir } from './common.mjs';

const stamp = buildV2();
console.log(JSON.stringify({ buildDir, head: stamp.head, node: stamp.node, tscStatus: stamp.tscStatus, tscOutput: stamp.tscOutput }, null, 2));
if (stamp.tscStatus !== 0) {
  console.error('tsc reported errors (listed above). Halting: a script must not need a production-code change.');
  process.exit(1);
}
