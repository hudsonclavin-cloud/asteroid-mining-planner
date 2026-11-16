#!/usr/bin/env node
// NHATS_STORE=<dir outside the repo> node tools/slice20-research/nhats/lib/build.mjs
import { build, buildDir } from './aster.mjs';
const s = build();
console.log(JSON.stringify({ buildDir, node: s.node, tscStatus: s.tscStatus, tscOutput: s.tscOutput }));
if (s.tscStatus !== 0) process.exit(1);
