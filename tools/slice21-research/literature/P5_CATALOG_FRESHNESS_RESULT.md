---
PROVENANCE (added 2026-08-04 — not part of the Perplexity answer)
Query: [P5 — Asteroid catalog freshness on a static site]
Prompt source: [tools/slice21-research/literature/PERPLEXITY_PRERESEARCH_LIVING_SKY.md, P5]
Fired: [2026-08-02] · standard Perplexity
Recovered from Perplexity thread history: 2026-08-04
  (transcript-side copy was lost — environment stored a pointer, not content)
Status: LEADS, not facts. verify-before-lock before any DEC / invariant /
  founding-doc use. Contradictions between follow-up levels are findings — log,
  don't resolve.
--- RAW PERPLEXITY ANSWER BELOW ---

JPL’s SBDB Query API is usable for a static-site regeneration pipeline, but its public docs do **not** document a first-class “delta since X” interface for “objects changed since date X” or “objects discovered since X”; the documented pattern is filtered queries, paging, and full-field pulls, so the safe design assumption is scheduled re-ingestion with your own diffing layer rather than true upstream incremental sync. The strongest primary-source signal on freshness is that JPL says newly discovered objects and their orbits are added **daily** and discovery circumstances are updated on a **roughly monthly** interval, which supports a CI refresh cadence measured in days or weeks rather than real-time streaming.[1][2]

## Primary findings

### SBDB terms, limits, and bulk use The SBDB Query API documentation exposes an unauthenticated GET endpoint, documents paging via `limit` and `limit-from`, and warns that the underlying database can change between paged calls, which matters if you try to assemble a large catalog from multiple requests. The public SBDB Query doc itself does **not** publish a dedicated rate-limit policy or ToS block in the page content returned here, so the only official rate-limit numbers surfaced in the retrieved NASA API portal material are the generic `api.nasa.gov` defaults, and those should be treated cautiously because the JPL SSD APIs are served from `ssd-api.jpl.nasa.gov`, not the `api.nasa.gov` gateway.[3][1] For bulk extraction, the SBDB Query docs explicitly support count queries, field discovery, sorting, and paging, which is enough to do full pulls in chunks, but the doc does not present a separate “bulk dump” endpoint or recommend one over the API in the retrieved content. JPL’s broader SBDB metadata also says the database adds newly discovered objects and updated orbits daily, which implies the authoritative upstream store is continuously refreshed even if you consume it by periodic full regeneration.[2][1]

### Incremental vs full pulls The official SBDB Query docs list filters, fields, sorting, and pagination, but the retrieved page does **not** document a parameter equivalent to “modified-since,” “changed-since,” or “discovered-since”. That means incremental refresh for a static catalog is not documented as a native API feature in the primary source set gathered here, so a full pull or a broad filtered pull plus local diffing is the conservative implementation choice.[1] There is, however, one very useful field for your own diff logic: `soln_date`, the date/time of orbit determination, and object-observation metadata such as `first_obs`, `last_obs`, `n_obs_used`, and `orbit_id`. In practice, those fields let you build a downstream “incremental enough” system by requerying the full NEA set on a schedule and diffing on `pdes`/`spkid` plus `orbit_id` or `soln_date`, but that is a consumer-side pattern, not an official upstream delta feed.[1]

### How often orbits change The cleanest primary-source statement is that “newly discovered objects and their orbits are added on a daily basis,” while “discovery circumstances are updated on a roughly monthly interval,” and other physical parameters are updated less often. That supports the claim that orbital elements do change continuously as observations arrive, but the exact **fraction of the NEA catalog updated per month** is **not** published in the official sources retrieved here, so any percentage estimate would be third-party-estimated rather than official-published.[2] Because the API exposes `soln_date`, `last_obs`, `n_obs_used`, and `orbit_id`, the fraction updated per month is in principle measurable by sampling or full historical snapshots, but I do not have an official-published monthly percentage from JPL in the gathered material. For product design, the safe conclusion is that recent discoveries and poorly constrained objects can change on a short cadence, while the mature long-arc population is less volatile, so freshness policy should be risk-tiered rather than uniform.[2][1]

### NEA population growth in 2025–2026 NASA’s discovery statistics page is the right primary source for cumulative NEA counts, but from the retrieved search snippets here I only have confirmation that the page exists and tracks cumulative known NEAs rather than a month-by-month table rendered in full content. A secondary result reports that the known NEA count surpassed **40,000** in November 2025 and that roughly **10,000** had been discovered in the prior three years, which suggests an average discovery pace on the order of a few hundred per month, but that figure is **third-party-estimated**, not official-published in the material retrieved here.[4][5][6] So the evidence-supported answer is: NEA discoveries were still growing materially through 2025–2026, and discovery additions are frequent enough that a static catalog frozen for many months will drift both in membership and orbital solutions. I would treat any exact “new discoveries per month” number in this response as unavailable from primary-source full text gathered here, except where explicitly flagged as third-party-estimated.[5][6][2]

### NHATS and Asterank in 2026 The NHATS API is still publicly documented at JPL SSD, but the retrieved documentation page is still labeled **Version 1.3 (2019 September)**, with the latest listed change also in 2019, which is a maintenance red flag even though the endpoint remains documented and live enough to have a current docs page. More importantly for product dependence, the NHATS API is tightly scoped to the NHATS-related tables used by the CNEOS “Accessible NEAs” page and its launch-window presets remain fixed to ranges topping out at `2045`, which looks more like legacy mission-screening infrastructure than an actively evolving modern planning backend.[7] Asterank’s public API page is still reachable and documents a Mongo-style query API, but the example payload shown in the retrieved page includes stale-looking orbit epochs and last-observation dates from much older data, and the page does not present a visible maintenance status, changelog, or freshness commitment. In 2026 terms, NHATS looks **official but stale-scoped**, while Asterank looks **publicly reachable but not a dependable maintained authoritative source** for mission-planning freshness.[8][7]

### Static-site regeneration patterns A standard pattern for scheduled regeneration is GitHub Actions on a cron, build the derived dataset, then deploy GitHub Pages from the workflow artifact or a Pages branch, and GitHub’s own Pages workflow ecosystem supports that model. The pitfall with committing multi-MB generated artifacts into git history is repo bloat over time; a widely cited operational lesson from a large Pages deployment is that preserving full history for heavy generated outputs causes clone size and processing costs to balloon, while orphaning or force-replacing the publish branch avoids retaining giant diffs indefinitely.[9][10] For a 41,906-body catalog, the practical implication is to prefer “build in CI, publish only the final site artifact” over “commit every regenerated dataset into the main repo history,” especially if you may later add compressed indices, transfer tables, or multiple ephemeris products. The official GitHub Pages workflow approach is compatible with that artifact-first pattern.[10][9]

## Decision branches

### Level 1 — Follow-up 1 Why this matters for the tool: it determines whether Aster should ship one monolithic asteroid catalog or split freshness policy by confidence/risk tier. **Question:** Should a browser-based mission-planning tool refresh the whole NEA catalog on one schedule, or use tiered freshness by object class and solution maturity? A tiered model is the stronger design. JPL states that newly discovered objects and their orbits are added daily, and the API exposes orbit-quality and recency signals such as `orbit_id`, `soln_date`, `last_obs`, `data_arc`, `n_obs_used`, and `condition_code`, which together support classifying objects into “stable enough for cached planning” versus “needs frequent refresh” buckets. Numbers here are **official-published** for the existence of those fields and the daily update statement, but any threshold you set, such as “refresh condition code \(\ge 5\) weekly,” would be **third-party-estimated** because the primary sources do not prescribe product thresholds.[1][2]

#### Level 2 — Follow-up 1.1 Why this matters for the tool: it directly affects CI runtime, data volume, and whether stale trajectories can mislead users on recently discovered targets. **Question:** Which official fields are strongest for defining a “volatile orbit” bucket in a static catalog? The best official-published candidates in the SBDB Query API are `condition_code`, `soln_date`, `last_obs`, `data_arc`, `n_obs_used`, and `orbit_id`. For design, `condition_code` and recency fields are the most load-bearing because they give a direct signal of uncertainty and recent orbit revision activity, while `orbit_id` is useful as a compact change detector between regenerations; that ranking is **third-party-estimated**, while the field availability itself is **official-published**.[1]

##### Level 3 — Follow-up 1.1.1 Why this matters for the tool: it decides whether users see a simple “fresh/stale” badge or a more nuanced orbit-quality warning before optimizing missions. **Question:** Should freshness UI be time-based only, or combine time with orbit-quality metadata? It should combine both. JPL’s own published fields separate “when the solution was produced” from “how well constrained it is,” so a badge keyed only to last refresh date would miss the distinction between a recently updated but still uncertain object and a stable long-arc object whose elements are weeks old. The field existence is **official-published**; the recommendation to combine them in UI is **third-party-estimated**.[1]

### Level 1 — Follow-up 2 Why this matters for the tool: it determines whether Aster can avoid expensive full recataloging by relying on upstream incremental discovery/update filters. **Question:** Can Aster safely architect around upstream delta queries, or must it own diffing itself? It should assume it must own diffing itself. The retrieved SBDB Query API documentation does not expose documented “changed since X” or “discovered since X” parameters, but it does expose stable identifiers and change-relevant metadata like `spkid`, `pdes`, `orbit_id`, and `soln_date`, which is enough to implement local snapshot comparison after each scheduled pull. The absence of documented delta parameters is **official-published** by omission in the current docs set; the architecture recommendation is **third-party-estimated**.[1]

#### Level 2 — Follow-up 2.1 Why this matters for the tool: it sets the minimum viable pipeline design for reliable catalog freshness without a backend server. **Question:** What is the lowest-complexity robust refresh architecture for GitHub Pages? The lowest-complexity robust pattern is scheduled CI that pulls the authoritative NEA subset, computes diffs locally using stable IDs plus `orbit_id` or `soln_date`, emits a single static artifact, and deploys Pages from the artifact rather than preserving every generated dataset revision in normal git history. The SBDB fields and GitHub Pages workflow support are **official-published**; the exact pipeline composition is **third-party-estimated best practice**.[9][10][1]

##### Level 3 — Follow-up 2.1.1 Why this matters for the tool: it affects repo hygiene and whether regeneration remains cheap after months of scheduled runs. **Question:** Should regenerated catalogs be committed into the repo, or published via disposable deploy output? Disposable deploy output is safer for long-term operations. GitHub Pages workflows support deployment from generated output, and operational experience from large generated Pages sites shows that keeping history for big generated artifacts can dramatically bloat repository size and processing time, while orphaning the publish history avoids that growth. GitHub workflow support is **official-published**; the performance/bloat lesson is **third-party-estimated operational evidence**.[10][9]

### Level 1 — Follow-up 3 Why this matters for the tool: it decides whether adjacent legacy sources can fill feature gaps such as accessibility screening or economic ranking. **Question:** Should Aster depend on NHATS or Asterank as upstream dependencies in 2026? For a serious browser mission-planning tool, neither should be a core dependency. NHATS is official, but the retrieved API documentation appears frozen at 2019 and scoped to a specific “Accessible NEAs” screening use case, while Asterank’s public API page lacks visible maintenance/freshness guarantees and shows example data with much older orbit-era fields. Those maintenance signals are **official-published** for NHATS versioning and **officially visible but weakly evidenced** for Asterank’s public page; the dependency recommendation is **third-party-estimated**.[7][8]

#### Level 2 — Follow-up 3.1 Why this matters for the tool: it separates “can borrow an idea” from “can trust as an authoritative data feed.” **Question:** Is NHATS still useful at all if it should not be a hard dependency? Yes, as a reference product and optional comparative layer. Because NHATS remains an official JPL-documented API with explicit accessible-NEA screening fields like total mission delta-V, duration, stay, launch window, and viable trajectory counts, it is still valuable as a benchmark for how one legacy accessibility screen was structured, even if it is too stale-scoped to be your primary data backbone in 2026. The field availability and version are **official-published**; the suggestion to use it as a benchmark rather than a dependency is **third-party-estimated**.[7]

## Practical policy For Aster’s static GitHub Pages catalog, the evidence supports a scheduled full or broad-subset regeneration job, not a thin incremental fetcher, with local diffing based on official SBDB identifiers and orbit-solution metadata. A weekly refresh is easy to justify from JPL’s “daily” orbit/discovery additions, while a daily refresh is defensible if your UI prominently features newly discovered or poorly constrained NEAs; the cadence recommendation itself is **third-party-estimated**, while the upstream update behavior is **official-published**.[2][1] I would treat NHATS as a comparative reference only and Asterank as an inspiration/reference source rather than an operational dependency. For deployment, publish generated outputs through Pages workflow artifacts or a disposable publish branch, and avoid accumulating regenerated multi-MB artifacts in mainline git history.[8][9][10][7]

## LOAD-BEARING NUMBERS
- 41,906 bodies — user-stated current Aster static NEA catalog size; **conversation-provided**, not externally verified.[1]
- Version 1.0 — SBDB Query API documentation version; **official-published**.[1]
- 2021 August — SBDB Query API doc date; **official-published**.[1]
- `limit-from` starts at record 0 — SBDB paging semantics; **official-published**.[1]
- Up to 3 sort fields — SBDB Query API sorting limit; **official-published**.[1]
- Daily additions of newly discovered objects and orbit updates — SBDB browser metadata freshness statement; **official-published**.[2]
- Roughly monthly discovery-circumstance updates — SBDB browser metadata freshness statement; **official-published**.[2]
- Version 1.3 — NHATS API documentation version; **official-published**.[7]
- 2019 September — NHATS API latest documented version date; **official-published**.[7]
- NHATS launch-window presets ending at 2045 — NHATS documented parameter range; **official-published**.[7]
- NHATS default delta-V 12 km/s — NHATS documented default; **official-published**.[7]
- NHATS default duration 450 days — NHATS documented default; **official-published**.[7]
- NHATS default stay 8 days — NHATS documented default; **official-published**.[7]
- NHATS sample viable trajectories for 2000 SG344: 3,302,718 — NHATS example payload; **official-published example**, not a current operational guarantee.[7]
- NHATS sample minimum total delta-V for 2000 SG344: 3.550 km/s — NHATS example payload; **official-published example**.[7]
- NHATS sample minimum-duration mission for 2000 SG344: 306 days — NHATS example payload; **official-published example**.[7]
- Generic NASA API key hourly limit 1,000 requests/hour — NASA API portal default; **official-published**, but not confirmed as binding on `ssd-api.jpl.nasa.gov`.[3]
- Generic DEMO_KEY limits 30 requests/hour/IP and 50 requests/day/IP — NASA API portal default; **official-published**, but not confirmed as binding on `ssd-api.jpl.nasa.gov`.[3]
- 40,000 known NEAs surpassed in November 2025 — secondary reporting on NEA growth; **third-party-estimated/reporting**.[5]
- About 10,000 NEAs discovered in the prior 3 years by late 2025 — secondary reporting; **third-party-estimated/reporting**.[5]
- Implied average from that secondary figure: about 278 discoveries/month over 36 months — derived from third-party-reported totals; **third-party-estimated**.[5]
- Example large Pages output 220 MB with whole repo reduced to about 15 MB after orphaned publish history — operational anecdote on git-history bloat; **third-party-estimated operational evidence**.[9]

Sources
[1] SBDB Query API https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html
[2] JPL Small Body Database Browser http://catalog.data.gov/dataset/jpl-small-body-database-browser
[3] NASA Open APIs https://api.nasa.gov/
[4] Discovery Statistics https://cneos.jpl.nasa.gov/stats/
[5] 40 000 near-Earth asteroids discovered! https://www.asdnews.com/news/aerospace/2025/11/20/40-000-nearearth-asteroids-discovered
[6] Near-Earth Asteroids (NEAs)
- Discovery Statistics
- NASA https://cneos.jpl.nasa.gov/stats/totals.html
[7] NHATS API https://ssd-api.jpl.nasa.gov/doc/nhats.html
[8] Asterank Database API https://www.asterank.com/api
[9] PSA: If you're using gh-pages to host your CI-generated ... https://www.reddit.com/r/rust/comments/wy3j50/psa_if_youre_using_ghpages_to_host_your/
[10] Deploying GitHub Pages sites with GitHub Workflows https://dev.to/davorg/deploying-github-pages-site-with-github-workflows-3bhh
[11] Space Science with Python
- Part 15: SBDB Query API https://www.youtube.com/watch?v=7RSWQnC1i9k
[12] Activity · nasa/api-docs https://github.com/nasa/api-docs/activity
[13] SBDB Close Approach Data API https://ssd-api.jpl.nasa.gov/doc/cad.html
[14] Making NASA JPL's Small Bodies DB APIs Dev Friendly https://daryl.wakatara.com/making-nasa-jpls-small-bodies-db-apis-dev-friendly/
[15] JPL SBDB Queries (astroquery.jplsbdb or ...
- Read the Docs https://astroquery.readthedocs.io/en/latest/jplsbdb/jplsbdb.html
[16] Asteroid Data from NASA API - useChainlinkFunctions() https://usechainlinkfunctions.com/posts/asteroid-data
[17] Code and issues relevant to the NASA APT project https://github.com/NASA-IMPACT/nasa-apt
[18] SBDB API https://ssd-api.jpl.nasa.gov/doc/sbdb.html [19] data-nasa-gov-frontpage https://github.com/nasa/data-nasa-gov-frontpage
[20] SBDB Filter Parameters - jpl ssd/cneos api
- NASA https://ssd-api.jpl.nasa.gov/doc/sbdb_filter.html
[21] NEO Earth Close Approaches https://cneos.jpl.nasa.gov/ca/
[22] Small-Body Orbits & Ephemerides
- JPL Solar System Dynamics https://ssd.jpl.nasa.gov/sb/orbits.html
[23] NEO Search Program https://cneos.jpl.nasa.gov/about/search_program.html
[24] Complete GitHub Actions Course
- From BEGINNER to PRO https://www.youtube.com/watch?v=Xwpi0ITkL3U
[25] Small-Body Database Query
- JPL Solar System Dynamics https://ssd.jpl.nasa.gov/tools/sbdb_query.html
[26] Feedback: Custom GitHub Actions Workflows (beta) #30113 https://github.com/orgs/community/discussions/30113
[27] Close Approaches List
- NEO
- NEOCC https://neo.ssa.esa.int/close-approaches
