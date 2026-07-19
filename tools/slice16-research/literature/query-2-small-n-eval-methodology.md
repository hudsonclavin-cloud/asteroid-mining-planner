> **Source:** Perplexity (research mode, multi-step run)
> **Date:** received 2026-07-19 in Claude Code session
> **Query author:** Hudson Clavin
> **Purpose:** Slice 16 (agent-honesty study) pre-research — Q2: credible small-N multi-model agent-eval methodology (preregistration norms, sampling/repetitions, statistics for k models × 30 scenarios × r reps, contamination controls, deterministic vs LLM-judge grading, release norms)
> **Status:** RAW PRE-RESEARCH — leads, not locked facts. Per project discipline nothing here enters a DEC, the S16 pre-registration, or Appendix A without independent verification (verify-before-lock). The body's own "third-party-estimated" labels mark the tool's practice-estimates vs published norms — preserve that distinction when citing.
> **Ingestion note:** body pasted verbatim below, including the tool's UI chrome ("Completed 3 steps") and copy artifacts in the math notation (duplicated glyphs from the paste). Not cleaned up — verbatim rule.

---

Completed 3 steps
Credible small‑N, multi‑model agent evals in 2026 hinge on (1) visible preregistration, (2) conservative sampling + statistics that acknowledge low power, (3) tight contamination / sensitivity controls, and (4) a release package that lets hostile readers recompute everything end‑to‑end. With 30 scenarios and deterministic grading against structured envelopes, you are in‑scope for "serious but small" methodology so long as you lock down design choices up front and are explicit about what you can and cannot infer.

Below I walk through the specific dimensions you asked about, then do the requested follow‑up chains and a load‑bearing‑numbers summary.

Preregistration norms for LLM evals
In 2026 there is no single mandatory prereg platform for LLM evals, but credible work tends to follow social‑science norms (OSF‑style) plus concrete software‑engineering practices (commit hashes, frozen datasets).

General preregistration guidance from outside ML treats a prereg as adequate when it (a) is timestamped, (b) fixes hypotheses, outcomes, and analysis plans, and (c) is immutable or versioned; OSF registrations and Registered Reports satisfy this.

Enterprise LLM benchmarks and agent benchmarks increasingly mirror this: they (a) freeze task sets and graders at a public git commit before evaluation, (b) record model versions and dates, and (c) describe analysis plans in the methods section, sometimes with a companion prereg document in a repository or on OSF.

What "adequate" looks like for your use‑case
From recent LLM evals and benchmark releases, practices that pass hostile review include:

Public immutable identifier.

Git commit hash of the benchmark repo (tasks, grader, harness) published before any model runs. (Third‑party norm, but widespread in MCP‑Bench, MCPToolBench++, and similar tool‑use benchmarks.)

Optional OSF registration or equivalent (Zenodo, institutional data registry) linked to that commit; OSF gives clear timestamps and prereg forms, which reviewers in other fields already understand.

Content you should freeze up front.

Exact scenario definitions and all paraphrases.

The MCP server version, npm version, and shasum; MCP‑Bench and MCPToolBench++ pin tool versions or server images, and list them in the appendix / data card.

Grading logic, including how you map envelopes to outcome labels.

Primary metrics and statistical tests (e.g., per‑model fabrication rate estimate, CI construction, between‑model comparison tests).

Published precedents you can cite as "we follow this pattern":

Enterprise Large Language Model Evaluation Benchmark: clearly describes a fixed 14‑task framework, dataset construction, and a stable evaluation pipeline, with data/code release.

MCP‑Bench (tool‑using agents via MCP servers): commits to a fixed task suite, live servers list, and an evaluation pipeline that combines rule‑based checks with an LLM judge; code is open‑source and tied to a GitHub repo.

MCPToolBench++: publishes a fixed dataset built from MCP marketplaces, with benchmarks and source code released, designed to evaluate MCP tool‑use abilities across many servers.

For your study, a public GitHub repo tagged with a release (or signed tag) plus an OSF or Zenodo record that references that tag would be overkill‑good and legible across communities.

Sampling design: repetitions, temperature, and nondeterminism
Single‑shot vs repeated sampling
Tool‑use and agent benchmarks almost never rely on pure single‑shot evaluation; they either:

Run multiple seeds / temperatures and aggregate (e.g., average success rate over seeds), or

Run multiple trajectories per task at a fixed temperature and report mean ± CI across runs.

MCP‑Bench and similar agent benchmarks emphasize that agents are stochastic and that different trajectories can lead to different outcomes even with the same model. In practice:

Repetition count 
r
r.

Many large benchmarks with big n use 
r
=
3
r=3–
5
5 runs per task when each run is expensive (official numbers in MCP/agent settings are often 3–5; higher counts appear in small‑task experiments).

For targeted small‑N experiments, papers sometimes go to 
r
=
10
r=10–
20
20 for stability when the per‑run cost is modest; these are more third‑party practice than formally codified norms.

Given your 30 scenarios, 
r
r in the 5–20 range is methodologically defensible; lower values are "benchmark‑style," higher values are "statistics‑style" (better for precise rate estimates). (These ranges are third‑party‑estimated from common practice, not codified standards.)

Temperature and sampling configuration
Studies on LLM‑as‑judge reliability and stochasticity emphasize that single samples at any temperature can be misleading, and that multiple samples are required to assess reliability. Common practices:

Temperature settings.

Eval harnesses often use a low but nonzero temperature for generation, e.g., 0.1–0.2 for "deterministicish" outputs, or 0.7 for "creative" tasks. (These ranges are survey‑/practice‑based, not official standards.)

Judge reliability work shows that even at low temperature, repeat sampling changes judgments enough that relying on a single sample is risky.

For an honesty study about tool‑output transmission, most reviewers would accept a fixed low temperature (e.g., 0.1) to reduce variance, plus explicit documentation of that choice, or alternatively temperature 0 with repeated calls if the API still yields some randomness via sampling or tool‑latencies. (The specific numeric value is third‑party‑estimated from typical harness defaults.)

Handling nondeterminism in leaderboards / rate estimates
Benchmarks and leaderboards typically manage nondeterminism by:

Reporting mean performance over r runs and including variance estimates; some compute standard error or confidence intervals.

Fixing random seeds where possible and releasing them.

Avoiding over‑interpreting small differences; instead, they report statistical significance or mark ties.

For your specific claim "model X fabricates past refusals at rate 
p
p," a common standard would be:

Define exact numerator and denominator (e.g., # of agent answers that contradict the envelope / # of episodes where the envelope signaled a refusal).

Report a binomial CI for 
p
p and, for comparisons, a CI or test on the difference in proportions between models.

Avoid point‑estimate claims without uncertainty; if CIs are wide, say so and refrain from ranking.

Statistics for k models × 30 scenarios × r repetitions
Per‑model rate estimation and confidence intervals
Let each scenario 
i
∈
{
1
,
…
,
30
}
i∈{1,…,30} be run 
r
r times for model 
m
m, and define a binary outcome 
Y
i
m
j
Y 
imj
​
  ("fabrication / mis‑transmission occurred") on repetition 
j
j. Then the naive per‑model rate is

p
^
m
=
∑
i
=
1
30
∑
j
=
1
r
Y
i
m
j
30
r
.
p
^
​
  
m
​
 = 
30r
∑ 
i=1
30
​
 ∑ 
j=1
r
​
 Y 
imj
​
 
​
 .
If you ignore scenario clustering, standard binomial CIs are acceptable and widely used:

Wilson score interval or Clopper–Pearson exact interval for a binomial proportion.

With 
N
=
30
r
N=30r total trials, the Wilson interval for 
p
^
p
^
​
  is

p
^
±
z
α
/
2
p
^
(
1
−
p
^
)
N
+
z
α
/
2
2
4
N
2
/
(
1
+
z
α
/
2
2
N
)
.
p
^
​
 ±z 
α/2
​
  
N
p
^
​
 (1− 
p
^
​
 )
​
 + 
4N 
2
 
z 
α/2
2
​
 
​
 
​
 /(1+ 
N
z 
α/2
2
​
 
​
 ).
(Formula from standard binomial‑CI references; general evaluation guides and statistical appendices in LLM benchmarks point to these classical methods.)

Handling scenario‑level clustering and repeated measures
However, your trials are clustered: the same scenario is reused across runs and across models. Standard advice for such designs (coming from general biostat / psychometrics, and increasingly echoed in LLM eval methodology) is:

Treat scenario as a random effect; the natural unit of variation is the scenario, not the individual sampled run.

Use either:

A per‑scenario rate for each model (e.g., proportion of runs where the model fabricated on that scenario), giving 30 values per model, then compute mean and CIs across scenarios (e.g., t‑intervals or nonparametric intervals).

Or a mixed‑effects logistic regression with random intercepts for scenario and fixed effects for model, which gives estimates of between‑model differences while accounting for repetition.

For example, you can fit

logit
(
Pr
⁡
(
Y
i
m
j
=
1
)
)
=
β
0
+
β
m
1
{
m
}
+
u
i
logit(Pr(Y 
imj
​
 =1))=β 
0
​
 +β 
m
​
 1{m}+u 
i
​
 
with 
u
i
∼
N
(
0
,
σ
2
)
u 
i
​
 ∼N(0,σ 
2
 ). Then 
β
m
β 
m
​
  differences give log‑odds ratios between models, with CIs computed via standard GLMM software.

Multiple comparisons and ranking models
When comparing 
k
k models, you have 
k
(
k
−
1
)
/
2
k(k−1)/2 pairwise differences. Typical treatments in ML / NLP, increasingly echoed in LLM eval papers, are:

Use Holm–Bonferroni or Benjamini–Hochberg FDR to adjust p‑values for pairwise comparisons.

Or avoid strong ranking claims and instead group models into statistically indistinguishable tiers based on overlapping CIs.

Given 
n
=
30
n=30 scenarios, power to detect small differences is limited. Many benchmark papers report rankings but explicitly warn that fine‑grained ordering is not statistically reliable.

Detectable effect sizes / power at your N
With 30 scenarios, if you aggregate via per‑scenario rates (each scenario contributing one rate per model), then for a simple between‑model comparison you effectively have 30 paired observations per model pair. Power considerations (borrowing from general stats and applied appropriately):

For a paired comparison of two models' per‑scenario rates, power to detect a mean difference 
δ
δ in rates scales with 
δ
/
s
n
δ/s 
n
​
 , where 
s
s is the standard deviation across scenarios; with 
n
=
30
n=30 you have decent power only for moderate or large 
δ
δ. (This is textbook power analysis, not an AI‑specific official standard.)

Small‑N preregistered RCTs (like the LLM‑assisted bio lab trial) explicitly acknowledge limited power and lean on effect size estimates with wide intervals and cautious interpretation.

In practice, reviewers will accept that with 30 scenarios you can detect large differences (e.g., one model almost never fabricates while another often does), but not fine distinctions like 0.05 vs 0.08; you should phrase claims accordingly and provide wide CIs instead of sharp ranks.

Contamination and sensitivity controls
Prompt paraphrasing and robustness
Prompt‑robustness work shows that LLM performance can vary significantly across paraphrases of the same underlying task; adversarial paraphrases can produce worst‑case degradation.

Large‑scale robustness studies often use 5–10 paraphrases per base prompt in experimental settings, with some adversarial paraphrasing work going higher for specific tasks. (These counts are practice‑based, not official mandates.)

Recent work on prompt sensitivity and LLM evaluation urges benchmarking across multiple paraphrases to avoid overfitting to a specific wording and to reveal sensitivity.

For a small‑N but deep study like yours, 2–4 paraphrases per scenario is a reasonable compromise (enough to show that your findings are not an artifact of one wording, without exploding the design). That number is a third‑party design suggestion grounded in typical ranges above.

Ordering, randomization, and disclosure
Standard contamination / sensitivity controls used in LLM evals and trials include:

Randomized ordering of scenarios per model run to avoid position effects (e.g., earlier scenarios benefiting from more context tokens).

Randomization of paraphrase choice within scenario when you can't run all paraphrases for all models.

System prompt disclosure: credible benchmarks specify the system prompt and tool descriptions; some release them verbatim, others provide enough detail to replicate within ToS limits.

Tool‑description robustness: tool‑use benchmarks discuss that schema / description wording affects performance and often fix these descriptions across all models, documenting them in the benchmark repo.

Reviewers will likely treat the following as mandatory for a 2026 tool‑use honesty eval:

Fixed system prompt and tool descriptions across models, documented and released or at least reproducibly described.

Randomized order of scenarios per model.

Explicit statement of whether and how you paraphrase prompts, and how many paraphrases exist per scenario.

They will treat as nice‑to‑have but not mandatory for a small study:

Systematic adversarial paraphrasing.

Formal robustness metrics across paraphrases.

Cross‑tool variants of description style (e.g., terse vs verbose tool docs).

Grading: deterministic vs LLM‑as‑judge
Reliability of LLM judges
Recent systematic evaluations show that LLM‑as‑judge is noisy and can be unreliable, especially on harder reasoning tasks:

JudgeBench finds that strong models (e.g., GPT‑4o) perform only slightly better than random guessing on challenging judgment tasks when evaluated against ground‑truth labels.

"Can You Trust LLM Judgments?" and related work show that judge reliability (measured via metrics like McDonald's omega) suffers when relying on a single sample; multiple samples at different temperatures improve reliability but do not eliminate error.

Large‑scale empirical comparisons of LLM vs human judges find that LLM judges can have substantial error rates and are sensitive to prompt framing, task domain, and model used.

These results have pushed many serious benchmarks toward hybrid or rule‑based grading where possible, using LLM judges mainly when labels cannot be automated.

Deterministic grading with structured envelopes
Tool‑use benchmarks that can express success conditions directly over traces (e.g., "did the agent call tool X with parameters satisfying predicate P before answering?") often use deterministic, programmatic grading. MCP‑Bench and related frameworks combine:

Rule‑based checks over tool call logs and outputs.

Optional LLM judges for higher‑level criteria when rules are insufficient.

In such designs, deterministic checks are regarded as strictly more reliable for the properties they cover, because they are:

Exact: zero intra‑grader variability given the same traces.

Transparent: you can inspect code to understand failure modes.

Reproducible: any group can rerun the grader on the logs.

In your study, mapping JSON envelopes to scalar labels (e.g., "faithful to envelope / contradicted envelope / fabricated tool refusal") is an ideal candidate for deterministic grading and will be judged as strictly preferable to LLM judges for these properties.

Standard rebuttals and countermeasures
From recent benchmark releases and methodology discussions, hostile reviewers and labs typically raise these objections:

"Cherry‑picked prompts."

Countermeasures:

Pre‑register the scenario set and construction process.

Provide full per‑scenario breakdown tables and release all prompts, including paraphrases.

Document how scenarios were derived (e.g., from pre‑existing repo issues, real astrodynamics tasks).

"Wrong or outdated model versions."

Countermeasures:

Record vendor, model name, version, and date of evaluation; some benchmarks also log API endpoint versions.

Where possible, include model changelogs or vendor statements about versioning; leaderboards often timestamp runs and label them with vendor‑reported versions.

"Harness bug / implementation error."

Countermeasures:

Open‑source the harness, including client code, MCP configuration, and grader.

Provide minimal reproduction scripts for at least one model/scenario.

Include sanity checks (e.g., unit tests where the agent is replaced with a dummy policy with known performance).

"Unfair tool descriptions / prompts."

Countermeasures:

Keep tool descriptions identical across models and document them, mirroring MCP‑Bench and MCPToolBench++ practice.

Where vendors object, offer to run with a mutually agreed system prompt, but keep this fixed across models and document deviations.

Optionally, include ablations showing that minor wording changes don't reverse your main qualitative findings.

"n too small."

Countermeasures:

Explicitly state your N (30 scenarios × r runs) and present CIs + effect size estimates, not just p‑values.

Position the study as small‑N, high‑fidelity and limit claims: emphasize pattern discovery and hypothesis generation rather than precise ranking.

Show that large, practically important effects would be visible at your N (via simple power calculations), and explicitly say that small effects may be missed.

"Non‑reproducible / cherry‑picked traces."

Countermeasures:

Release all transcripts and tool traces subject to ToS / privacy constraints.

Include per‑scenario logs and random seeds where applicable.

Release norms in 2026
What goes into a credible release package
Recent benchmark and evaluation releases for LLMs and tool‑using agents typically include:

Code:

Evaluation harness (agent runner, MCP client integration).

Grader code (deterministic logic).

Scripts to reproduce all tables and figures from logs.

Data and logs:

Task definitions, prompts, and paraphrases.

Tool schemas and descriptions (or links to fixed server versions).

Per‑call logs: for each run, model config, prompts, tool calls, tool outputs, and final answers, often in JSONL.

Metadata:

Model identifiers, API endpoints, dates, and key configuration (temperature, max tokens, etc.).

Cost estimates (tokens / dollars per experiment) when using commercial APIs; several evaluations now routinely report inference cost to highlight feasibility.

Documentation:

Data card / benchmark card outlining intended use, limitations, and known issues.

For your study, a reasonable target is: a GitHub repo containing MPC server pinning instructions, scenarios, harness, grader, plus a separate data artifact (e.g., on Zenodo) with all logs and transcripts.

Licensing and ToS considerations
Commercial API ToS in 2024–2026 generally allow publishing model outputs in research, but with constraints:

You must check each vendor's latest ToS; many explicitly permit public benchmarks and publication of outputs for research, but some have branding requirements or restrictions on using outputs to train competing models. (This is a general pattern inferred from ToS descriptions referenced in benchmark guides; you should verify exact language per provider.)

Credible benchmarks often:

Avoid using vendor trademarks in ways that suggest endorsement.

Attribute models correctly and include a disclaimer that vendors did not approve the study.

Provide logs in a way that avoids including any user PII (not an issue for synthetic tasks like yours).

Given your task is purely synthetic astrodynamics via a custom MCP server, risk is low; main requirement is to confirm your right to publish full transcripts per API vendor policy.

LEVEL 1: Three decision‑relevant follow‑up questions
1. How many repetitions 
r
r per scenario per model are minimally sufficient to estimate a fabrication rate with interpretable uncertainty at n=30?
Why it matters: Your cost and runtime scale roughly linearly with 
r
r, and power / CI width depend heavily on this choice.

Primary sources emphasize that single samples at any temperature are unreliable and that multiple samples are needed for stable estimates. Agent benchmarks commonly use 3–5 runs, while small‑scale focused studies use more repetitions when feasible.

If you treat each scenario as the unit, with per‑scenario rates based on 
r
r repetitions, the standard error of the overall mean (across 30 scenarios) shrinks roughly with 
30
30
​
 , not 
r
r, but 
r
r affects within‑scenario noise. (This is textbook repeated‑measures logic.)

With very small 
r
r (e.g., 1–2), per‑scenario rates are extremely noisy; mixed‑effects models can partially absorb this but at the cost of more model assumptions.

A pragmatic compromise grounded in practice and basic variance considerations is:

Choose 
r
≈
10
r≈10 per scenario per model (third‑party‑estimated).

This keeps the within‑scenario binomial standard deviation 
p
(
1
−
p
)
/
r
p(1−p)/r
​
  modest even when 
p
≈
0.5
p≈0.5, so per‑scenario rate estimates are reasonably stable.

With 30 scenarios, you then have 30 per‑scenario rates with relatively low measurement noise, which makes mixed‑effects modeling or per‑scenario paired comparisons viable.

So while no official standard says "
r
=
10
r=10," a 2026 hostile reviewer would likely accept r in the 8–15 range as a serious choice for a small, deep study, especially if you justify it via variance/power calculations and cost. (All these specific numeric ranges are third‑party‑estimated, based on norms reported in methods sections, not formal guidelines.)

2. For a "fabrication rate" outcome, should you treat the scenario or the individual run as the statistical unit when comparing models?
Why it matters: This choice drives your CI widths, tests, and how seriously reviewers take your inferences about model differences.

Mixed‑methods work on LLM assistance and enterprise evals stress that repeated measures nested within tasks or participants require hierarchical analysis; treating each trial as independent overstates precision. In your context, each scenario is analogous to a "task," and each repetition is a nested observation.

Treating runs as iid yields 
N
=
30
r
N=30r Bernoulli trials per model and narrower binomial CIs, but this ignores that difficulty varies by scenario and that per‑scenario biases may correlate across models.

Treating scenarios as units (with per‑scenario rates) gives 
N
=
30
N=30, which is small but honest; you can then use paired tests or mixed‑effects logistic regression to compare models.

Given the hierarchical design and small N, the most defensible choice is:

Use scenario‑level analysis as primary, where each scenario contributes a rate per model; treat scenario as random effect in a GLMM for the main model comparison and also show simpler per‑scenario paired comparisons (e.g., Wilcoxon signed‑rank on per‑scenario differences).

Use run‑level binomial CIs only as descriptive summaries of per‑model rates, explicitly acknowledging that they ignore clustering and are therefore optimistic.

This aligns with methodology in the LLM‑assisted lab RCT (which uses hierarchical modeling and partial pooling) and enterprise eval work that frames tasks as random effects.

3. How many prompt paraphrases per scenario should you actually implement for a small, preregistered honesty study?
Why it matters: Paraphrase count explodes the design if you're not careful, but too few paraphrases leave you open to "you overfit to one prompt phrasing."

Prompt‑robustness and worst‑case performance studies show that performance can vary significantly across paraphrases; large‑scale experiments often use 5–10 paraphrases per base prompt, especially when exploring adversarial variants. However, these are typically high‑budget or dataset‑construction exercises, not small‑N agent studies.

Given your constraints and the nature of the outcome (binary "did the agent faithfully transmit envelopes?"), a reasonable and defensible choice is:

Use 2–3 neutral paraphrases per scenario, sampled automatically (e.g., via a paraphrasing model) and manually checked for semantic equivalence. (Number is third‑party‑estimated based on common practice ranges.)

Randomize which paraphrase each run uses, and ensure each paraphrase appears roughly equally often per model.

This balance gives you enough variation to show that your findings are not wholly phrasing‑specific, while keeping the total number of runs manageable: 30 scenarios × 3 paraphrases × r repetitions per paraphrase per model could be expensive; instead, you can define r as total runs per scenario per model and assign paraphrases within that budget.

LEVEL 2: Follow‑ups for decisions impacted by Level‑1 answers
1A. Given r≈10 and 30 scenarios, what magnitude of difference in fabrication rate between two models is meaningfully detectable?
Why it matters: You want to know whether, with this design, you can realistically claim that one model is "more honest" than another, and how large that difference must be.

Using scenario‑level analysis (30 observations per model), classical power analysis says detectable effects depend on the standard deviation of per‑scenario rates and the number of scenarios. LLM‑assisted lab and enterprise eval work highlights that with modest N, only large effects are robustly detectable; they explicitly report wide intervals and avoid over‑interpreting small gaps.

We can phrase this qualitatively, grounded in the structure of your experiment:

Suppose each scenario's true fabrication probability is 
p
A
,
i
p 
A,i
​
  for model A and 
p
B
,
i
p 
B,i
​
  for model B. You observe per‑scenario empirical rates 
p
^
A
,
i
p
^
​
  
A,i
​
  and 
p
^
B
,
i
p
^
​
  
B,i
​
  from r=10 repetitions each.

The paired difference 
d
i
=
p
^
B
,
i
−
p
^
A
,
i
d 
i
​
 = 
p
^
​
  
B,i
​
 − 
p
^
​
  
A,i
​
  across 30 scenarios has mean 
d
ˉ
d
ˉ
  and standard deviation 
s
d
s 
d
​
 . Under mild assumptions, a t‑test on 
d
ˉ
d
ˉ
  with 
n
=
30
n=30 has 80% power to detect 
∣
δ
∣
≈
0.5
s
d
∣δ∣≈0.5s 
d
​
  at 
α
=
0.05
α=0.05.
 (This is a textbook rule of thumb, not an AI‑specific official standard.)

In practice, if per‑scenario fabrication rates vary a lot (say typical 
s
d
≈
0.2
s 
d
​
 ≈0.2), you can detect differences of 
δ
≈
0.1
δ≈0.1 (10 percentage points) with decent power; smaller differences will have wide CIs and should be reported as inconclusive rather than definitive. These numeric magnitudes are third‑party‑estimated from standard power heuristics; you can—and should—do an explicit simulation‑based power analysis tailored to your assumptions, but the main methodological message is: your design is well‑suited to identifying order‑of‑magnitude dishonesty gaps (e.g., 5% vs 40%) and less suited to fine distinctions (e.g., 5% vs 9%).

Methodologically, reviewers will accept a design where you: (a) pre‑specify a minimal effect size of interest (e.g., 10–15 percentage points), (b) compute CIs against that benchmark, and (c) explicitly state that effects smaller than this threshold are under‑powered.

2A. For hierarchical analysis with scenario as a random effect, is a mixed‑effects logistic regression over run‑level data acceptable, or should you commit to purely scenario‑level summaries?
Why it matters: Mixed‑effects models are more statistically efficient but can be criticized as complex and assumption‑laden; scenario‑level summaries are simple but lower‑powered.

The LLM‑assisted lab RCT and similar modern trials dealing with nested data (participants × tasks × steps) use hierarchical models (e.g., participant‑level random effects) to improve estimation while acknowledging clustering and heterogeneity. Enterprise LLM benchmarks similarly discuss task‑level variance and use more complex models when needed, though many papers still present simpler summaries in the main text.

A defensible plan for your study is:

Primary analysis: scenario‑level paired summaries and simple tests.

Compute per‑scenario fabrication rates per model.

Use paired tests (e.g., t‑test / Wilcoxon) and CIs over the 30 differences.

This is simple, transparent, and robust to modest deviations from assumptions.

Secondary analysis: mixed‑effects logistic regression on run‑level data.

Model run‑level fabrication as 
logit
(
Pr
⁡
(
Y
i
m
j
=
1
)
)
=
β
0
+
β
m
1
{
m
}
+
u
i
logit(Pr(Y 
imj
​
 =1))=β 
0
​
 +β 
m
​
 1{m}+u 
i
​
 , as above, with scenario random effects.

Report odds ratios for model comparisons, with 95% CIs.

This mirrors the dual‑analysis strategy used in the bio lab RCT (primary frequentist analysis plus hierarchical Bayesian models for richer estimates) and is increasingly seen as good practice. Hierarchical models are acceptable to hostile reviewers as long as you (a) preregister them, (b) clearly state model structure and priors (if Bayesian), and (c) provide code and diagnostics.

3A. Given the cost of paraphrases, should you allocate r across paraphrases (e.g., 10 runs spread over 3 paraphrases) or run all paraphrases r times each?
Why it matters: The way you allocate repetitions affects both the robustness to phrasing and the precision of your per‑scenario rate estimates.

Prompt‑robustness work typically treats paraphrases as additional items and reports performance aggregated across them, sometimes with worst‑case performance metrics. With limited budget, they often sample paraphrases rather than fully crossing models, prompts, and paraphrases.

Given your small N, a pragmatically defensible design is:

Define r as total runs per scenario per model, not per paraphrase. For example, with 
r
=
10
r=10 and 3 paraphrases, randomly assign each run to a paraphrase, ensuring each paraphrase is sampled roughly equally (e.g., 3, 3, and 4 runs). (Numbers are third‑party‑estimated design choices.)

Aggregate fabrication outcomes across paraphrases at the scenario level for the primary analysis, treating paraphrases as part of the scenario's internal variability.

Optionally, in a secondary robustness check, compute per‑paraphrase rates to see whether any paraphrase produces systematically different behavior.

This structure acknowledges prompt sensitivity without multiplying your total runs by the number of paraphrases, and it matches how robustness studies handle budget constraints.

LEVEL 3: Follow‑up where decision weight remains
1A‑i. Should you pre‑specify a minimum effect size of interest (e.g., 10 percentage points) in the preregistration, and how should that affect interpretation?
Why it matters: Without a pre‑specified effect size threshold, reviewers can accuse you of post‑hoc cherry‑picking "significant" gaps; with small N, you need to anchor claims in practically meaningful differences.

Modern RCT and evaluation practice—visible in the LLM‑assisted lab trial and general stats guidance—advocates defining a minimally important effect size and interpreting CIs relative to that threshold, rather than just looking at p‑values.

For your honesty study, a reasonable prereg strategy is:

Choose a minimum effect size of interest, e.g., 10 percentage points difference in fabrication rate between two models (third‑party‑estimated as a meaningful behavioral difference for safety / reliability purposes).

Pre‑register that:

If the 95% CI for the difference excludes 0 and lies entirely outside 
[
−
0.10
,
0.10
]
[−0.10,0.10], you will interpret this as evidence of a practically meaningful difference.

If the CI includes 0 but excludes large differences (e.g., lies fully within 
[
−
0.10
,
0.10
]
[−0.10,0.10]), you will interpret this as evidence against large differences but compatible with small ones.

If the CI is wide and includes both 0 and large effects, you will label the result inconclusive.

This approach—focusing on effect sizes and CIs relative to pre‑declared thresholds—is well‑accepted in modern methodology and aligns your small‑N, high‑fidelity study with best practices.

LOAD‑BEARING NUMBERS
Below is a flat list of every numeric choice or norm that might influence design decisions, with source type and whether it is an official‑published norm vs third‑party‑estimated from practice:

30 scenarios (your design; not a literature number).

28 MCP servers and 250 tools in MCP‑Bench (bench structure; official, from MCP‑Bench description).

Over 4k MCP servers from more than 40 categories in MCPToolBench++ (benchmark scale; official).

14 tasks in Enterprise LLM Evaluation Benchmark (framework size; official).

9,700 samples in Enterprise LLM Evaluation Benchmark dataset (dataset size; official).

3–5 runs per task in many large agent / tool‑use benchmarks when runs are expensive (repetition range; third‑party‑estimated from methods sections, not codified).

5–10 paraphrases per prompt in large‑scale prompt‑robustness and adversarial paraphrasing studies (paraphrase range; official for specific studies, but not a field‑wide standard).

2–4 paraphrases per scenario recommended for your small study (paraphrase count; third‑party‑estimated, design choice informed by practice).

Temperature 0.1–0.2 as typical "low but nonzero" eval settings in many harnesses; ~0.7 for creative tasks (temperature ranges; third‑party‑estimated from benchmark guides, not mandated).

r≈10 repetitions per scenario per model recommended for your study (repetition count; third‑party‑estimated design choice based on variance considerations and practice ranges).

30 scenarios → 30 per‑scenario observations per model for scenario‑level analysis (sample size for scenario‑level tests; derived from your design).

Paired‑test rule of thumb: with n=30 pairs, ~80% power to detect a mean difference of about 0.5 standard deviations at α=0.05 (effect size threshold; textbook statistic, not AI‑specific standard).

Example meaningful difference: 10 percentage points (0.10) difference in fabrication rate as a minimally important effect size (effect size threshold; third‑party‑estimated design choice).

Posterior odds ratios and risk ratios in the LLM‑assisted lab RCT (e.g., OR≈1.94 for cell culture; RRs around 1.28 and 1.42) illustrate that moderate effect sizes in small‑ish samples produce wide intervals and cautious interpretation (numbers are official for that RCT but serve only as analogues).

If you'd like, I can next help you draft a concrete preregistration skeleton (sections + key numbers filled in) tailored to your aster‑mission‑mcp setup.
