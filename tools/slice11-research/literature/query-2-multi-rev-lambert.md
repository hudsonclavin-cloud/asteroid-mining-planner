> **Source:** Perplexity Pro / GPT deep research
> **Date:** 2026-06-02
> **Query author:** Hudson Clavin
> **Purpose:** Slice 11 pre-research literature input
> **Original PDF:** ~/Downloads/1. Multi‐Revolution Use Cases (M≥1)_.pdf

---

# 1. Multi‐Revolution Use Cases (M≥1):

Multi‐revolution Lambert transfers (M≥1) exist when a spacecraft completes one or more full orbits en route, effectively “waiting” for the target. In principle, adding revolutions can reduce required ΔV/C<sub>3</ sub> at the cost of much longer TOF. For example, Earth–Mars transfers often have an M=2 solution nearly optimal, whereas no M=3 solution existed in that case. In practice for Near‐Earth Asteroids (NEAs) with C<sub>3</sub> ≲ 25 km²/s² and TOF 0.5–5 yr , multi‐rev gains are usually small. We found no documented NEA rendezvous missions that explicitly used a multi‐rev Lambert solution. Typical NEA missions (e.g. OSIRIS‐REx, Hayabusa) rely on single‐rev or gravity‐assist paths. Thus multi‐rev branches seldom open significantly better launch windows under those budgets. (In fact, adding an extra revolution often yields diminishing returns and rarely introduces new optimal opportunities beyond M=1–2.)
## 2. Solution Branches (Left vs. Right):

For each fixed M≥1, Lambert’s problem yields two distinct solutions (often called “left” and “right” branches or “high‐path/low‐path” solutions). Geometrically, these correspond to two different ellipses connecting the same endpoints in the given TOF. One branch is a short‐period/higher‐energy orbit (smaller semi‐major axis) and the other is a long‐period/lower‐energy orbit (larger semi‐major axis). Equivalently, one path approaches the target “from the inside” and the other “from the outside”. (In poliastro’s terminology, these are the “low” vs “high” second-focus paths.) In screening tools, practice varies. Some tools plot both branches so the designer can compare costs; others by default report only the lower‐energy (typically “right‐branch”) solution. Izzo’s implementation, for example, defaults to returning the “right‐branch” solution (short‐period) unless a negative revolution count is given, in which case it returns the “left‐branch” solution. In a user interface, one might either overlay both branches or let users request “high” vs “low” solutions explicitly.
## 3. Branch Transitions (TOF Increase at Fixed

Departure): As TOF grows, the optimal branch can switch. For short TOF only M=0 (single‐rev) solutions exist; beyond a certain TOF threshold, the M=1 branch appears. At that transition the required C<sub>3</sub> curve typically has a discontinuity or cusp – the single‐rev solution ceases and a two‐arc (M=1) solution takes over . Izzo (2015) noted that solver errors spike near these minimum‐TOF boundaries, indicating sensitivity there. In a porkchop plot, this shows up as a sudden jump or gap in contours at the M=0→M=1 boundary. In practice, one would see an extra “ridge” of high‐C<sub>3</sub> separating the M=0 and M=1 regions. Designers should be aware: the solver may temporarily fail to converge exactly at the cusp (T≃T<sub>min</ sub>), but valid solutions exist immediately beyond.
## 1

## 2

## 1 2

## 3 4

## 5 6

## 7

## 8 7

## 4

## 9

## 1

## 4. TOF Thresholds for M≥1:

There is a minimum flight time for each M>0. Below this time no elliptical solution exists. Mathematically, Lambert’s problem has no solution if TOF is less than a critical value T<sub>min</sub> determined by the geometry . Once TOF ≥T<sub>min</sub>, two (and eventually four) solutions become available. This threshold depends on the position vectors (r₁, r₂) and transfer angle – for instance, it roughly corresponds to an orbit taking exactly M full revolutions plus the required transfer arc. There is no universal constant; the Tmin must be computed for each (r₁,r₂) pair . Russell (2019) specifically flags “flight time too close to Tmin” as a pathological case. In summary: below some TOF no M=1 solution exists, and similarly for higher M the required TOF grows roughly by ~2π√(a³/μ) per extra revolution.
## 5. Multi‐Rev in Common Tools:

poliastro (Python): Supports multi‐rev via its Izzo Lambert solver . The user calls
## izzo.lambert(..., M=n) for n revolutions. For M>0 it returns two (v<sub>0</sub>,v<sub>1</

sub>) solutions (left/right branch). Users must specify “low/high” path or examine both. In other words, poliastro exposes M explicitly, and one obtains both branches when M=1 (e.g. (v_l, v_r) = izzo.lambert(...)) .
## PyKEP (Izzo’s C++/Python): Also exposes multi‐rev. Its lambert_problem class takes a

multi_revs argument (max M) . Internally it will compute all solutions up to that M. Thus one can set multi_revs=2 to get M=0,1,2 solutions. GMAT: Its Lambert Targeter has a “revolutions” parameter (0 by default). Documentation is sparse, but community sources suggest only fixed M (typically 0) is used. By default it finds a single solution (short‐way) and there is an option to allow negative flight time (long‐way), but multi‐rev is not automated. Users can manually try different revolution numbers. Copernicus (CNES tool): We found no mention of multi‐rev support. It likely assumes direct transfers (M=0) unless user hacks. NASA Trajectory Browser: Precomputes one‐leg transfers for a grid of launch dates/TOFs. It does not explicitly expose M and likely only lists the primary (lowest‐energy) solution, effectively M=0 for most cases. In summary, poliastro and PyKEP allow user‐control over M and return multiple solutions; the others default to single‐rev (M=0) and would require manual workarounds to explore M>0.
## 6. Failure Modes and Pathologies:

Multiple‐rev Lambert solutions are known to be numerically delicate near certain cases. Key issues include:
## Near-minimum TOF (T ≈ T<sub>min</sub>): convergence slows and solutions can become ill-

conditioned . Izzo reports larger errors for M>0 near their T<sub>min</sub> values. Antipodal geometry (transfer angle ≃180°): This yields degenerate or nearly-duplicate solutions. Russell notes “near-antipodal terminal positions” as a difficult case. In such cases four solutions collapse into nearly two (inside vs outside becomes symmetric).
## 10 10

## 11

## •

## 12 8

## 12

## •

## 13 14

## •

## •

## •

## •

## 9 11 9

## •

## 11

## 15

## 2

Near-full revolution (r₁≈r₂): If start and end nearly coincide, multiple full orbits can fit, also causing degeneracy . Branch crossing: Algorithms that iterate in x or τ variables can accidentally jump from one branch to another if initial guess straddles the discontinuity. Careful initialization (as in Izzo’s τ-based scheme ) is needed. Robust Lambert codes handle these by fallbacks: e.g. Oldenhuis’s solver tries Izzo’s fast method first and, if it fails (common for large M), reverts to the more reliable Gooding/Lancaster-Blanchard algorithm. In implementation one should check for non-physical results (e.g. NaNs or negative semi-major) and possibly retry with alternative initial guesses or solvers. In practice, screening tools often skip solutions that fail to converge or that violate constraints.
## 7. Computational Cost vs. M:

Solving Lambert’s problem on a 200×100 grid (20,000 points) is already nontrivial; each additional M value multiplies that cost. Roughly, total solves ≈ N<sub>grid</sub>×(M<sub>max</sub>+1)×(solutions per M). In practice, screening tools restrict to low M because: Linear scaling: including M=1,2 triples the work. For example, poliastro’s author noted that in an Earth–Mars example M=3 gave no new solution. Solver speed: even optimized C++ or compiled code may require milliseconds per solve. Rody Oldenhuis emphasizes compiling the solver for speed (20–50× acceleration) when many solves are needed . Thus, most screening limits M to 0–2 (occasionally 3). Beyond that, CPU time and diminishing returns (few new solutions) make it impractical for a preliminary tool.
## 8. Izzo (2015) – Multi‐Rev Numerical Issues:

Izzo’s 2015 formulation uses a log‐tan “τ” parameter and hypergeometric series for M>0. This is efficient, but a few points merit attention when extending an M=0 solver: Initial Guesses: Izzo provides asymptotic “starters” (ξ₀) for each branch based on τ and M. These must be implemented exactly. Series Convergence: The hypergeometric (_2F1) series for multi‐rev converges well for moderate M, but for large M or extreme λ it may need many terms. In practice M will be small, so this is usually safe. Boundary Cases: The analysis notes special singular cases: λ²=1 (collinear) or x=0,1 (parabolic arcs) require l’Hôpital or analytic limits. Ensure your code handles λ=±1 (transfer angle 0° or 180°) without division by zero. Loss of Precision near T<sub>min</sub>: As Izzo reported, errors grow near the minimum‐time boundary . When coding, watch that the roots for x converge properly there (you may detect slow convergence or switch to a more robust rootfinder in those fringe cases). Branch Selection: In his code a negative “m” signals the left‐branch solution. Consistency in branch ordering is important; mis‐assigning left/right could lead to jumps between branches.
## •

## 16 11

## •

## 17

## 18

## •

## 2

## •

## 18

## • 19

## •

## •

## 4 20

## •

## 9

## • 4

## 3

In short, most pitfalls in multi‐rev solvers mirror those of M=0 but amplified: extreme geometry, very short or very long TOF, and numerical precision. Rigorous testing (e.g. against Gooding’s solver or published cases) is advised. Recommendation: For an NEA screening tool under the given constraints, supporting multi-rev is optional but potentially useful. In most cases M=0 will suffice, but enabling M=1 can reveal a few additional low‐C<sub>3</sub> windows at longer TOFs. We suggest: include M up to 1 (or at most 2) as an advanced option. Graphically, one could overlay M=1 contours (distinct color/style) on the porkchop or allow the user to toggle between M=0 and M=1 solutions. Both branches for M=1 could be shown or collapsed to the lower‐energy branch, perhaps with a marker indicating the alternative solution. Importantly, clearly label each solution by its M value (and branch) so the user can decide which TOF/M combination is acceptable. Given the extra complexity and typically minor gains, defaulting to M=0 and letting users explicitly request M>0 strikes a good balance. In summary: support M=1 with user selection, show both branches (or the min‐energy branch) for completeness, but do not push M beyond 2 for routine screening. This provides flexibility without overwhelming the user with rarely useful solutions. Sources: Izzo (2015) and follow‐on analyses describe the multi‐rev Lambert theory and solver behavior; Battin and others cover the mathematics of multiple solutions. Tool documentation and examples  illustrate how libraries expose M. Notices of solver pathologies and performance (Oldenhuis, Russell, etc.) are drawn from referenced studies. (References are bracketed by line for clarity.) orbital maneuver - Multiple revolution Lambert problem - Space Exploration Stack Exchange https://space.stackexchange.com/questions/31967/multiple-revolution-lambert-problem Robust solver for Lambert's orbital-boundary value problem - File Exchange - MATLAB Central https://www.mathworks.com/matlabcentral/fileexchange/26348-robust-solver-for-lambert-s-orbital-boundary-value-problem?
## s_tid=srchtitle_support_results_8_tag%253A%2522lambert%2522

## FEX-Lambert/lambert.m at master · rodyo/FEX-Lambert · GitHub

https://github.com/rodyo/FEX-Lambert/blob/master/lambert.m
## (PDF) A GPU Accelerated Multiple Revolution Lambert Solver for Fast Mission Design

https://www.researchgate.net/publication/
## 228666391_A_GPU_Accelerated_Multiple_Revolution_Lambert_Solver_for_Fast_Mission_Design

## aas03.dvi

https://dcsl.gatech.edu/papers/aas03.pdf Multiple revolutions on Lambert’s problem — poliastro 0.17.0 documentation https://docs.poliastro.space/en/stable/examples/Multirevolutions%20solution%20in%20Lamberts%20problem.html esa.int
## https://www.esa.int/gsp/ACT/doc/MAD/pub/ACT-RPR-MAD-2014-RevisitingLambertProblem.pdf

An Effective Multi-Revolution Lambert Solver Based on Elementary Calculus
## https://www.mdpi.com/2673-8716/6/1/3

## 9 4

## 6 10

## 12 14

## 18 11

## 1 2 7 12

## 3 18

## 4

## 5

## 6

## 8

## 9 17 19 20

## 10 11 15 16

## 4

pykep/src/lambert_problem.cpp at master · esa/pykep · GitHub https://github.com/esa/pykep/blob/master/src/lambert_problem.cpp
## 13 14

## 5
