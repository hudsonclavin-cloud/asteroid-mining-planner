# V2 Mission

`mission/` owns planning math, screening heuristics, and mission-facing outputs.

Rules:

- read from `core/`
- never write presentation hacks back into `core/`
- no readable-mode assumptions in mission calculations

Mission stays frozen until the first honest-mode slice is validated.
