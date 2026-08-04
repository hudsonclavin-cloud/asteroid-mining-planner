---
VERIFICATION PASS RESULT (added 2026-08-04 — not part of the Perplexity answer)
Pass: [V6 — H→diameter conversion constant + albedo-class uncertainty ranges]
Prompt source: [tools/slice17-research/literature/PERPLEXITY_V6_H_TO_DIAMETER_VERIFY.md]
Fired: [2026-08-04] · standard Perplexity · verification form (one-line
  verdicts + primary-source citations; NOT the recursive exploratory form)
Gates: SLICE_17_FOUNDING.md DEC-17-4 size-range column copy.
Status: VERIFIED-WITH-CITATIONS. Distinct from LEADS: every item below
  carries a named primary source. Distinct from LOCKED: the retrieval and
  the assertion came from the same actor (INV-033), so a Hudson-side spot
  check of the two load-bearing items is recommended before UI copy quotes
  them —
    (a) the CNEOS log-form constant 10^3.1236 = 1329.23 on
        https://cneos.jpl.nasa.gov/tools/ast_size_est.html (30-second check);
    (b) the Mainzer et al. 2011 (ApJ 741, 90) albedo medians in Table 1.
  Corroboration already present: K = 1329 arrives from two independent
  routes (Fowler & Chillemi 1992 via CNEOS; Pravec & Harris 2007 derivation
  K ≡ 2 AU × 10^(V_sun/5)), which is the strongest signal in this pass.
Not verified / out of scope: V5 (Benner accessibility proxy) remains
  deferred indefinitely per founding §2; nothing here bears on it.
--- RAW PERPLEXITY ANSWER BELOW ---

1. D(km) = (1329 / √p_V) × 10^(−H/5), equivalently D·√p_V = K × 10^(−H/5) with K = 1329 km; NASA/JPL writes the identical relation in log form as d = 10^[3.1236 − 0.5·log₁₀(p_V) − 0.2H], where 10^3.1236 = 1329.23 — Fowler, J.W. & Chillemi, J.R. (1992), "IRAS asteroid data processing," in Tedesco, Veeder, Fowler & Chillemi (eds.), The IRAS Minor Planet Survey, Phillips Laboratory PL-TR-92-2049, Hanscom AFB, pp. 17–43 (the document that established 1329 in use); log form and constant as published by [NASA/JPL CNEOS, Asteroid Size Estimator](https://cneos.jpl.nasa.gov/tools/ast_size_est.html), citing Bowell et al. (1989, Asteroids II, pp. 524–556) and Harris & Harris (1997, Icarus 126, 450–454).

2. K ≡ 2 AU × 10^(V_sun/5), evaluated with the Johnson-V solar magnitude V_sun = −26.762 ± 0.017, giving K = 1329 ± 10 km (V_sun uncertainty → ~1% systematic in D) — derived in Pravec, P. & Harris, A.W. (2007), "Binary asteroid population 1. Angular momentum content," Icarus 190, 250–259, Appendix A (their footnote: the relation "has not been given in the literature (other than 'grey') for a long time"), taking V_sun from Campins, H., Rieke, G.H. & Lebofsky, M.J. (1985), Astron. J. 90, 896–899. [PDF](https://space.asu.cas.cz/~ppravec/pravecharris07.pdf)

3. C-complex (Tholen, D > 30 km): median p_V = 0.053 ± 0.002, sample SD = 0.024, N = 250 — Mainzer, A. et al. (2011), "NEOWISE Studies of Spectrophotometrically Classified Asteroids: Preliminary Results," ApJ 741, 90 (§4; the paper explicitly states "We suggest that those attempting to use spectral type as a proxy for p_V use these values when converting between H and diameter"). [arXiv:1109.6407](https://arxiv.org/abs/1109.6407)

3b. S-complex (Tholen, D > 30 km): median p_V = 0.166 ± 0.004, sample SD = 0.050, N = 172 (Bus & Binzel S-complex, same size cut: 0.182 ± 0.004, SD = 0.043, N = 106) — Mainzer et al. (2011), ApJ 741, 90. [arXiv:1109.6407](https://arxiv.org/abs/1109.6407)

3c. X-complex: no single value — spans p_V ≈ 0.07 to >0.6 (Tholen X full sample median 0.099, SD = 0.161, N = 77; splitting on albedo per the paper's own rule: P-type p_V < 0.1, median 0.044, SD = 0.014; M-type median 0.125, SD = 0.037; E-type p_V > 0.3, median 0.430, SD = 0.229) — Mainzer et al. (2011), ApJ 741, 90, Table 1 and §"X-Complex." [arXiv:1109.6407](https://arxiv.org/abs/1109.6407)

4. p_V = 0.14 ± 0.02 — the bias-corrected mean albedo of the NEO population, "for which an H magnitude of 17.8 ± 0.1 translates to a diameter of 1 km" — Stuart, J.S. & Binzel, R.P. (2004), "Bias-corrected population, size distribution, and impact hazard for the near-Earth objects," Icarus 170, 295–311, Abstract. [PDF](https://www2.boulder.swri.edu/~cchapman/jssrpb04.pdf)

5. Since D ∝ p_V^(−1/2), the factor between two albedos is √(p_b/p_a): between the verified C- and S-complex medians, √(0.166/0.053) = √3.1321 = 1.770 → diameter uncertain by a factor of ≈1.77 between p_V = 0.053 and p_V = 0.166.

5b. Across the full verified X-complex span, √(0.60/0.07) = √8.5714 = 2.928 → diameter uncertain by a factor of ≈2.93 between p_V = 0.07 and p_V = 0.60 — i.e. H alone constrains D only to within a factor ≈1.8 if the object is known to be C-or-S, and ≈2.9 if the taxonomy is unconstrained across the X-complex range (ranges from item 3; Mainzer et al. 2011, ApJ 741, 90).

6. 0.3 mag — "NEO absolute magnitudes (H) were taken from the MPC's orbital element files, and errors on H were taken to be 0.3 magnitudes"; note this is an adopted 1σ used in their Monte Carlo error propagation, not a measured dispersion, and the nearest measured value is σ = 0.242 mag for MPCORB H over H = 14–20 (mixed MBA/NEA sample, NEA-dominated above H ≈ 16) — Mainzer, A. et al. (2011), "NEOWISE Observations of Near-Earth Objects: Preliminary Results," ApJ 743, 156, §2 ([arXiv:1109.6400](https://arxiv.org/abs/1109.6400)); measured σ from Pravec, P. et al. (2012), Icarus 221, 365–387, §3 (accepted-version preprint, [PDF](http://space.asu.cas.cz/~asteroid/pravecetal2012b_0223_Hdataanalysis_WISEdatarevision.pdf)).
