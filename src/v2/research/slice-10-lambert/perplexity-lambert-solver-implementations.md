# Perplexity research — Lambert solver implementations

**Source:** Perplexity, 2026-05-22
**Prompt context:** Roadmap doc, Perplexity Prompt 1 (Lambert solver implementations, Slice 10)
**Capture method:** Conversational thread, captured as text (no source file)

---

## Initial query response

Completed 4 steps.

The strongest open-source Lambert solvers I found are pykep for the original Izzo-style implementation, poliastro for a clean MIT-licensed Python implementation of Izzo's algorithm, and lamberthub as the best study-oriented collection of multiple Lambert algorithms in one place. For JavaScript/TypeScript and WebAssembly, I found a notable JavaScript Lambert solver repo, but I did not find a mature, well-known WASM-native Lambert solver project in the time available; the practical route is usually compiling a C++ solver such as pykep's core or another C++ implementation to WASM.

### Best codebases

| Project | Repo / docs | License | Algorithm | Multi-rev | Notes |
|---|---|---|---|---|---|
| pykep | GitHub | GPL-2.0-or-later from source header | Izzo-based solver with Battin/Lancaster/Lagrange time-of-flight expressions and Householder iteration | Yes | This is the closest thing to a reference implementation for Izzo's 2014 paper, and the code is compact enough to study directly. |
| poliastro | GitHub | MIT | Izzo | Yes | Archived/read-only as of Oct 14, 2023, but still very readable and useful for study and integration examples. |
| lamberthub | GitHub | GPL-3.0 per repo snippet | Multiple algorithms, including Izzo and Gooding-class solvers | Yes | Best "solver zoo" for comparing implementations and edge cases; also includes a thesis-style review. |
| Basilisk LambertSolver | Docs | Not confirmed here | Gooding or Izzo | Yes | Good engineering-oriented implementation if you want a flight-dynamics context. |
| lambert-orbit | GitHub | Not confirmed here | JavaScript Lambert solver | Unknown from snippet | Most relevant JS repo I found; worth checking for browser usage or direct porting patterns. |

### pykep / ESA

pykep's lambert_problem.cpp is the most directly relevant open-source implementation if your goal is to study Izzo's approach in depth. The file clearly shows multi-revolution handling, Householder iterations, and the mixed time-of-flight expressions using Battin, Lagrange, and Lancaster formulations depending on the regime. The license in the source header is GPL-2.0-or-later, so it is not permissive, but it is excellent for algorithm study.

Known limitations / caveats:
- It is C++-centric and embedded in ESA's broader PyKEP toolkit, so it is not the lightest dependency if you just want a standalone solver.
- The implementation is numerically sophisticated, but still sensitive to degeneracies near singular geometries like transfer angles near 0 or 180 degrees, which is common to Lambert solvers in general.
- The code computes up to a chosen maximum number of revolutions and returns multiple branches, which is ideal for mission design but means you must select the physically relevant branch yourself.

### poliastro / MIT

poliastro is the nicest open-source Python implementation to study if you want readable code under a permissive license. The repository is archived and read-only now, but the Lambert examples and documentation remain available, including a dedicated multi-revolution example based on Izzo's algorithm.

Known limitations / caveats:
- The project is archived, so it is not the best choice if you need active maintenance.
- It depends on the broader astropy/numpy stack, which is fine for research code but heavier than a tiny standalone solver.
- Since the project is frozen, bug fixes and solver refinements will need to come from forks or downstream copies.

### lamberthub

lamberthub is the best single repository if you want to compare multiple Lambert algorithms side by side. Its description says it includes multiple named algorithms for different Lambert variants, including multi-revolution and direct-transfer cases, and the associated thesis/review material is especially useful for understanding strengths and weaknesses.

Known limitations / caveats:
- Its GPL-3.0 licensing is less permissive than MIT/BSD for embedding into proprietary software.
- Because it is a solver collection, code quality and numerical behavior vary by algorithm and author; it is ideal for comparison, not automatic "one solver fits all" adoption.
- Some algorithms in such collections may differ in robustness for near-parabolic or near-collinear cases, so benchmarking is still necessary for your use case.

### JavaScript and WASM

The most relevant JavaScript repository I found is influenceth/lambert-orbit, which is explicitly described as a Lambert problem solver implemented in JavaScript. I did not find a mature, dedicated TypeScript port or a widely recognized WebAssembly-native Lambert solver repo in this search pass.

For WebAssembly, the most practical path is usually to compile a vetted C++ implementation such as pykep or a similar solver library to WASM rather than starting from scratch. I did not find a specific WASM Lambert solver project worth recommending over that approach.

### Izzo 2014 paper status

The original paper is still the canonical citation for this family of solvers: arXiv lists "Revisiting Lambert's Problem" as 2014, and it remains the paper explicitly referenced by modern implementations like poliastro and pykep-derived code. I did not find evidence that it has been superseded by a single newer paper; instead, it appears to be still current and foundational, with later work extending, benchmarking, or comparing solver families rather than replacing Izzo's formulation outright.

A useful way to think about it is that Izzo 2014 is still the reference point, while later work such as solver reviews and alternative formulations have improved understanding of edge cases, performance, and multi-revolution handling. The "superseded" part is therefore no in the strict sense, though some later papers and libraries provide better comparative context and implementation guidance.

### What I'd study first

- Start with pykep/src/lambert_problem.cpp for the core Izzo implementation and multi-rev branch logic.
- Read poliastro's Lambert examples to see a clean Python API using the same algorithmic family.
- Use lamberthub as your comparison harness for Gooding vs Izzo-style solvers.
- If you need browser deployment, treat influenceth/lambert-orbit as the JavaScript starting point and consider a WASM port from C++ if you need performance.

---

## Follow-up: ranked study list with direct links and code paths

### 1) pykep / ESA

Best for: the closest thing to the original Izzo-style reference implementation, with multi-revolution support and compact code you can read end to end.

- Repo: pykep/src/lambert_problem.cpp
- Algorithm: Izzo-style Lambert solver, with Battin/Lancaster/Lagrange time-of-flight formulations and Householder iteration.
- License: GPL-2.0-or-later from the source tree/header.
- Code path to read first:
  - src/lambert_problem.cpp for the solver itself.
  - Search within that file for lambert_problem, householder, x2tof, and multi-rev branch handling.
- Limitations: GPL licensing, C++ only, and the user must still choose among multiple branches returned for multi-revolution cases.

### 2) poliastro

Best for: a readable Python implementation of Izzo's algorithm under a permissive license.

- Repo: poliastro/poliastro
- Docs example for multi-rev: "Multiple revolutions on Lambert's problem"
- Algorithm: Izzo.
- License: MIT.
- Code path to read first:
  - Lambert example docs for API usage and branch behavior.
  - Repository search for the solver module and examples around Lambert transfer routines.
- Limitations: the project is archived/read-only, so it is best as a study reference and not an actively maintained dependency.

### 3) lamberthub

Best for: comparing multiple Lambert algorithms side by side, especially if you want to benchmark Izzo against Gooding-style alternatives.

- Repo: jorgepiloto/lamberthub
- Supporting review/thesis material: "Lambert's problem algorithms: a critical review"
- Algorithms: multiple solvers; the repo is explicitly a solver set rather than a single-method implementation.
- License: GPL-3.0 per repository snippet.
- Code path to read first:
  - The solver package directory in the repo, then the individual solver files for Izzo and Gooding variants.
  - The thesis/review PDF for algorithm comparisons and edge-case discussion.
- Limitations: solver behavior differs by algorithm; the repo is better for study and comparison than for a single canonical production solver.

### 4) Basilisk Lambert solver

Best for: mission-analysis style engineering code with a documented Lambert solver module.

- Docs: Basilisk lambertSolver
- Algorithm: documented as a Lambert solver module; the docs imply a practical flight-dynamics implementation, commonly associated with Gooding- or Izzo-style approaches in this ecosystem.
- License: not confirmed from the sources gathered here.
- Code path to read first:
  - The module implementation behind fswAlgorithms/orbitControl/lambertSolver.
- Limitations: documentation-first search results are easier to find than source detail, so you will likely need to trace the repo structure manually.

### 5) JavaScript / browser-oriented code

Best for: web deployment experiments or a starting point for a browser solver.

- Repo: influenceth/lambert-orbit
- Algorithm: Lambert problem solver in JavaScript; the exact underlying method was not clear from the snippet.
- License: not confirmed from the gathered results.
- Code path to read first:
  - The main solver source files in the repository, then any browser/demo entry points.
- Limitations: this looks more niche than the Python/C++ references, so I would treat it as a portability example rather than the primary solver to trust.

### 6) WebAssembly route

Best for: performance-preserving browser deployment, but mostly as a porting strategy rather than a turnkey repo.

- Recommended source to compile: pykep/src/lambert_problem.cpp.
- Tooling starting point: WABT for WASM tooling.
- Algorithm: whatever solver you port, but pykep is the best candidate from this search.
- Limitations: I did not find a mature, dedicated WASM Lambert solver repo that I'd rank above the native implementations.

### Izzo paper status

The paper to read is arXiv:1403.2705, "Revisiting Lambert's Problem". It is still the key citation for the solver family and has not been cleanly superseded by a single replacement paper; later work mainly compares, extends, or reviews Lambert solvers rather than replacing Izzo's formulation outright.

### Reading order

1. pykep/src/lambert_problem.cpp for the core implementation.
2. Poliastro's multi-revolution example for clean Python usage.
3. lamberthub plus its review PDF for algorithm comparison and edge cases.
4. Izzo's 2014 paper for the theoretical basis.
5. The JavaScript repo if browser portability matters.
