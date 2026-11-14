#!/usr/bin/env node
// Compile the production modules the second long run needs into <LONGRUN2_SCRATCH>/build-v2x.
//   LONGRUN2_SCRATCH=<dir outside the repo> node tools/slice20-research/longrun2/lib/build.mjs
import { build, buildDir } from './common2.mjs';

const stamp = build();
console.log(JSON.stringify({ buildDir, node: stamp.node, tscStatus: stamp.tscStatus, tscOutput: stamp.tscOutput }, null, 2));
if (stamp.tscStatus !== 0) {
  console.error('tsc reported errors. Halting: a script must not need a production-code change.');
  process.exit(1);
}
