> **Source:** Perplexity Pro / GPT deep research
> **Date:** 2026-06-02
> **Query author:** Hudson Clavin
> **Purpose:** Slice 11 pre-research literature input
> **Original PDF:** ~/Downloads/Porkchop Plot Conventions for Asteroid Missions.pdf

---

# Porkchop Plot Conventions for Asteroid Missions

## 1. Axis conventions

Porkchop plots almost always use departure date on one axis and either arrival date or flight time (TOF) on the other . In traditional mission analyses, the x‑axis is departure date and the y‑axis is arrival date . In interactive NASA tools (Trajectory Browser) the x‑axis is launch date and the y‑axis is mission duration (TOF, in days). Date axes are labeled in calendar format (typically day–month–year , e.g. “03- Apr-2019”【55†】 or similar) and TOF is expressed in days (sometimes shown as years or months if long). In short, use departure date (calendar) vs. either arrival date or TOF; ensure tick labels show full dates. Departure vs. Arrival: Conventional static plots put departure date (x) vs. arrival date (y). This makes “iso-contours” (constant C3) curves easy to interpret. Departure vs. TOF: Interactive tools often use departure vs. time-of-flight (days). In this mode the arrival date can be inferred (departure + TOF). Date format: Use full calendar dates (e.g. “DD-MMM-YYYY”). The Trajectory Browser , for example, labels dates like “03-Apr-2019” on the axis【55†】. TOF units: Days are standard (e.g. mission duration in days on the axis). For long missions, sometimes years or months are marked, but the underlying values are days.
## 2. Quantity plotted

The heatmap (color) in porkchop plots is usually launch energy (C₃) or total ΔV, since these capture mission cost. Nearly all examples show contours of characteristic energy or ΔV as the color field. (Some older plots simply contour “C₃ = v∞²”.) In addition, other key metrics are often overlaid as contour lines or side-by-side panels: for example, contours of departure C₃ vs arrival C₃ , departure ΔV and arrival ΔV, or total heliocentric ΔV . In practice mission designers may produce multiple porkchops for different quantities – e.g. one chart color-coded by C₃ and another by ΔV – or overlay several sets of contours on a single chart (such as arrival v∞ or flight-time lines on top of a C₃ map). Typical heatmap: Most published porkchops color-code launch C₃ (departure energy) . NASA’s Trajectory Browser , however , color-coded total ΔV from LEO as its primary metric. In general, choose one primary cost metric (C₃ or ΔV) for the color surface. Contour overlays: It is common to overlay additional contours on the same plot. For example, constant arrival v∞ or constant total ΔV contours can be drawn over a C₃ heatmap (or vice versa). The PySTK example shows drawing contour lines for arrival ΔV and for time-of-flight (TOF) on top of the C₃ surface. Likewise, the DegenerateConic example draws separate contours of Earth‑departure C₃ and Mars‑arrival C₃ (and their sum) on the same axes. Side-by-side porkchops: Some tools present “multiple porkchops” in panels. A common approach is to put, say, a C₃ heatmap and an ΔV heatmap side-by-side. Another is to have separate plots for departure C₃ and arrival v∞ (or departure ΔV and arrival ΔV). In any case, use consistent axes and color scales so users can compare.
## 1

## 2

## 3

## • 1 2

## • 3

## •

## • 3

## 1 4

## 1

## 2

## 5 6

## • 1 2

## 3

## •

## 6

## 2

## •

## 1

## 3. Color schemes

There is no single mandated color palette for porkchops; conventions vary. However , published plots usually use a sequential or spectrum colormap where “low cost” is cool (blue/green) and “high cost” is warm (yellow/red), to give an intuitive heatmap. For example, the NASA Apophis porkchop below uses a blue→green→yellow→red palette (low ΔV = blue, high ΔV = red). Modern design guidelines favor perceptually-uniform maps (like viridis or plasma), but many legacy plots still use rainbow-like schemes. Gray-scale plots with colored iso-contours are also seen (especially in internal NASA docs). We did not find any domain rule like “low C₃ must be green” – authors mix palettes as long as a clear legend is provided. Figure: Example NASA JPL porkchop (Apophis rendezvous) with Launch Date vs Duration (days), color-coded by total ΔV . Note the blue-to-red colormap (low-to-high cost). Sequential vs. Diverging: Most porkchops use a sequential scale (e.g. blue→green→red). Diverging (red-blue) is uncommon unless highlighting positive/negative C₃. Grayscale backgrounds with colored contour lines are also used (e.g. overlay of colored iso-lines on a gray map). Radar (rainbow) vs. Viridis: Older figures often used rainbow-like “jet” colors (as in the NASA example above). Recent practice (especially in interactive tools) leans toward viridis/magma for better perceptual uniformity. Either is acceptable if well-labeled. Consistency: Whatever palette is chosen, keep it consistent across related plots. Label the legend or colorbar clearly (include units, e.g. “C₃ (km²/s²)” or “ΔV (km/s)” in the caption).
## 4. Iso-contours

Overlaid iso-contours (lines of constant value) help quantify key levels. Common contour values are: C₃ contours: e.g. C₃ = 0, 5, 10, 20, 30, 50 (km²/s²). In many analyses C₃=10 is a convenient reference (one study notes the “C₃=10” curve marks the feasible window). Plotting C₃=0 (Earth escape) is also standard.
## 7

## 3

## •

## •

## •

## •

## 8

## 2

ΔV contours: If color is C₃, one might draw total ΔV contours (e.g. every 1 km/s). If color is ΔV, one might draw iso–C₃ lines. Arrival ΔV contours (including ΔV = 0 for a free return) can be shown if relevant. Time-of-flight lines: Iso-TOF contours (e.g. 150, 200, 250 days or 0.5, 1 year) are often drawn as dashed lines. (In the Wikipedia figure, red lines mark equal-TOF contours.) These are usually a different color or line style to distinguish them. Phase/geometry lines: Sometimes contours of constant Sun–target–spacecraft angle (phase angle) or launch asymptote declination are drawn, particularly if those affect mission design. In a NASA study of DART, for example, they drew contours of “arrival solar phase angle”. Contour labeling: Labels should be placed near the line, ideally parallel to it, and outside the bulk color region for readability. If lines are dense, labels may be at line ends. Always include units (e.g. “C₃ = 10 km²/ s²”) in small text. Contour labels are often placed on the perimeter of the plot pointing into the lines (as seen in many NASA/ESA papers).
## 5. Type‑1 vs. Type‑2 transfers

Type‑1 (short-way) and Type‑2 (long-way) trajectories naturally appear as two lobes in the porkchop. They are usually shown on the same plot, separated by a diagonal “ridge” corresponding to a ~180° heliocentric transfer . In most figures, Type‑1 arcs occupy the lower-right region (shorter TOF) and Type‑2 occupy the upper-left (longer TOF). For example, one Mars mission study notes “solutions on the bottom-right are Type I [short], in the upper-left are Type II”. Another explicitly labels “Type 1 on the right lobe, Type 2 on the left” . The boundary is the curve of exactly 180° transfer angle – it often appears as a continuous line (or gap) from the bottom-left toward the top-right of the plot. Visualization: Both types are normally drawn together . Often different colors or line styles distinguish them (e.g. the blog example uses black vs. blue contours for short/long), or the ridge may simply look like a break between two lobes. Rarely do authors make entirely separate figures for Type I and II, since designers want to compare them directly. Boundary shape: The Type‑1/Type‑2 divide is a smooth curve on the (departure, TOF) plane – essentially where the transfer angle = 180°. It often slopes upward from short TOF at early launch to long TOF at late launch. In coplanar cases it is a clean diagonal; with inclined orbits it can bend or “bridge” slightly. It is not just a vertical or horizontal line but cuts across the plot.
## 6. Multi-revolution branches (M ≥ 1)

When allowing multiple sun revolutions in Lambert solutions, each revolution count yields a separate “branch” of solutions. In practice, these are usually handled as separate plots or clearly labeled series: e.g. one panel for single‐rev, one for double‐rev, etc. We found no published standard, but to avoid clutter it is recommended to either use separate subplots (labeled M=0,1,2…) or distinct line styles/colors for each M on the same axes. (For example, the JPL Trajectory Browser supports up to two revolutions, implying multiple solution sets.) In any case, clearly annotate which branch (0, 1, 2 rev) is shown. Concrete recommendation: We suggest creating separate panels or an interactive toggle for each revolution count. Label them “M=0, 1, 2, …” and use different color/line conventions if overlaying. Since multi‑rev arcs often have much higher ΔV, overlaying them on a single plot with the 0‑rev case can obscure details; separation is safer .
## •

## •

## 9 9

## •

## 10

## 8

## 11

## •

## 12

## 13

## •

## 13

## 14

## •

## 3

## 7. Auxiliary data on porkchops

Published analyses often annotate porkchops with mission constraints or geometry. Common examples include: launch asymptote declination (DLA), launch-site latitude limits, Sun‑target angles, and markers for optimal solutions. Declination of launch asymptote (DLA): Many reports show contours or labels of the departure v∞ declination. (The JPL Trajectory Browser calculates “DLA” as the angle of v∞ to the equatorial plane .) DLA contours are especially important to enforce launch site latitude limits. For instance, the DART mission study only considered trajectories with |DLA|<28.5° (Cape Canaveral’s latitude) and notes that higher DLA would need dog-leg maneuvers. You may draw a contour line at DLA = site latitude to show the allowed region. Arrival geometry: Analogously, contours of arrival hyperbolic excess (v∞ at encounter) or solar phase angle can be added. The DART paper’s porkchops were annotated with “arrival solar phase angle” and even impact angle contours . In many mission papers, lines of constant Sun‑probe‑target angle are shown (Wikipedia notes “green lines represent the Sun–Earth–spacecraft angle” ). Launch-window markers: It’s common to highlight the minimum‐cost trajectory. For example, the center point of the porkchop is the lowest-C₃ solution, and authors often mark it with a dot or cross. Likewise, vertical/horizontal lines may be drawn at optimum departure or arrival dates. If multiple local minima exist, those can be annotated too. Other info: Many analyses include inset tables or side panels with additional data (optimum ΔV, needed v∞, etc.). Key constraints (like a maximum allowed C₃, or minimum required stay time) are sometimes overlaid. At a minimum, include a colorbar and legend so readers know what “low” and “high” mean. In short, supplement the porkchop with any mission‐specific constraints that affect the launch window. The DART mission’s plots, for example, explicitly labeled contours of launch C₃, DLA, arrival phase angle, and impact angle, and even enforced CCAFS’s latitude constraint in the plot.
## 8. Interactive vs. static plots (UX)

We did not find formal UX guidelines in the literature, but common interactive conventions include: Hover tooltips: Show numeric values (departure date, TOF, C₃, ΔV, etc.) when the cursor hovers over the heatmap. This helps the user read precise data points. Click/pin a solution: Allow clicking on the plot to “pin” a chosen solution and display its data (e.g. in a side panel). This makes it easy to compare alternatives. Zoom & pan: Permit zooming on dense regions by scroll or drag, and panning across the date axes. (Because optimal regions can be narrow, zooming helps explore.) Sliders and filters: Provide sliders for date range or ΔV limits to update the plot in real time. For example, a slider could sweep the departure date and dynamically highlight the best arrival time. Legend and colorbar: Always include an interactive legend/colorbar (e.g. hover over the colorbar to read the numeric value). Let users toggle between linear/log scales or switch between C₃ and ΔV heatmaps. Export/print: Allow exporting the current view (PDF or image) so designers can capture static snapshots.
## •

## 15

## 16

## •

## 10

## 9

## •

## 1

## •

## 10 16

## •

## •

## •

## •

## •

## •

## 4

In essence, make the porkchop explorable. Interactive porkchop tools (like NASA’s Trajectory Browser) let users quickly adjust parameters and inspect the plot. For a custom tool, ensure that hovering shows data, clicking fixes points, and zooming is available. Non-obvious things to know Additional overlaid constraints: Beyond transfer costs, porkchops can include contours of arrival conditions. For example, the MSL study overlaid a contour of inertial Mars entry velocity on the same axes , linking launch window to EDL speed. They also plotted TPS heating limits (210 W/cm²) as contours . In general, consider any constraint that depends on launch/arrival dates (entry flight- path angle, radiation dose, etc.) and contour it. Contours for environment: In practice, shading regions with “no solution” (e.g. too low ΔV to reach the target) can clarify the chart. Blank areas often mean the Lambert solver failed or constraints prevent a solution. Transfer symmetry: If the departure and arrival bodies were coplanar with circular orbits, the porkchop is symmetric around the 180° line. In reality, eccentricity/inclination skews the lobes (see the “ridge” discussion above). Be aware that porkchops assume patched‑conic; real N‑body effects or gravity assists will alter the shape. Alternative axes: Some designers plot departure date vs. TOF and use contours of arrival date (the inverse representation). This can be useful if you want linear horizontal lines for constant TOF. Decide which pair (arrival date or TOF) is more intuitive for the user . Units and labels: Always label units (e.g. km²/s² for C₃, km/s for v∞) in the legend and caption. It’s easy to forget that “time” might be days or years; spell it out. Plot extent: Crop the axes to relevant windows. E.g. if TOF beyond 4 years is uninteresting, limit the plot. Conversely, ensure you don’t cut off low-ΔV pockets at the edge. Color perception: Watch out for colorblindness. If using rainbows, also draw isolines or hatch patterns so the information isn’t lost to some viewers. By following these conventions and annotations, your porkchop plots will match the expectations of mission designers. Use departure vs. arrival (or TOF) axes with calendar dates, plot C₃ or ΔV as the heatmap, overlay key iso-lines and constraints, and label everything clearly. This will make your asteroid rendezvous tool immediately familiar to trajectory analysts. Sources: Authoritative textbooks and papers (Curtis, Vallado, JPL mission design handbooks) describe porkchop plots in general, and the above conventions are borne out by NASA and mission papers . When specific conventions were not stated in the literature, the recommendations above are based on common practice in published figures. Porkchop plot - Wikipedia https://en.wikipedia.org/wiki/Porkchop_plot Degenerate Conic | articles in the "Orbital Mechanics" category https://degenerateconic.com/category/orbital-mechanics.html User Guide https://trajbrowser .arc.nasa.gov/user_guide.php
## •

## 11

## 17

## •

## •

## 13

## •

## •

## •

## •

## 1 3

## 1 3

## 10 11

## 1 9

## 2 12

## 3 14 15

## 5

## Porkchop plots — PySTK

https://stk.docs.pyansys.com/version/stable/examples/porkchop-plots.html Pork Chop Plots of Ballistic Earth-to-Mars Trajectories - File Exchange - MATLAB Central https://www.mathworks.com/matlabcentral/fileexchange/39248-pork-chop-plots-of-ballistic-earth-to-mars-trajectories Why you should use Viridis and not Jet (rainbow) as a colormap https://www.domestic-engineering.com/drafts/viridis/viridis.html ntrs.nasa.gov
## https://ntrs.nasa.gov/api/citations/20160010656/downloads/20160010656.pdf

Trajectory options for the DART mission - ScienceDirect
## https://www.sciencedirect.com/science/article/abs/pii/S0094576515303040

## Microsoft Word - lf99-3007_final-IEEE1447_Final_v1.doc

## https://ntrs.nasa.gov/api/citations/20060009305/downloads/20060009305.pdf?attachment=true

politesi.polimi.it https://www.politesi.polimi.it/retrieve/a0ffb113-1137-4079-a7aa-0b8173e4c50d/Thesis_JacopoFossen_FINAL.pdf
## 4 6

## 5

## 7

## 8

## 10 16

## 11 17

## 13

## 6
