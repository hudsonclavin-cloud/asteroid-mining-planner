/**
 * Honesty layer disclosure text (INV-016 amendment, OQ-1 surface).
 *
 * Phase C.4 surfaces these limitations to UI consumers. Updating any of
 * these strings does not require a code change elsewhere — the panel
 * reads them at render time.
 */

export interface DisclosureSection {
  title: string;
  body: string;
}

export const FOOTER_TEXT = 'Patched-conic screen · 2026–2040';
export const FOOTER_CLICK_HINT = 'click for details';

export const DISCLOSURE_INTRO =
  'The catalog status colors and "min C3" values come from a patched-conic Lambert ' +
  'screen across the 2026–2040 departure window. They are a first-pass mission-design ' +
  'filter, not a full mission accessibility verdict.';

export const DISCLOSURE_SECTIONS: DisclosureSection[] = [
  {
    title: 'What "low C3" actually means',
    body:
      'A "low_departure_c3" status means the body has at least one (departure, ' +
      'time-of-flight) window in the 14-year screening range with departure C3 ≤ 25 km²/s². ' +
      'That is a necessary condition for a low-energy launch, but not sufficient: arrival ' +
      'ΔV, stay time, and return ΔV are not factored in. NHATS-style accessibility verdicts ' +
      'require the full mission stack, which later slices add.',
  },
  {
    title: 'Co-orbital targets are tagged for a reason',
    body:
      'Bodies marked co-orbital (cyan tint in the 3D view) have orbits very similar to ' +
      "Earth's — low eccentricity, low inclination, semi-major axis within 0.05 AU of 1 AU. " +
      'The Keplerian propagation that drives this screen diverges from full N-body truth for ' +
      'these bodies, by up to ~1 km/s on v∞_dep over a 4-year horizon (OQ-7). For most ' +
      'co-orbital targets the divergence is small, but the tag is a flag to treat the ' +
      'numbers with extra caution and re-validate before committing to a mission profile.',
  },
  {
    title: 'Close-approach degeneracy',
    body:
      'For bodies that pass very close to Earth during the screening window, the Lambert ' +
      'solver can find "transfer" geometries with near-zero relative velocity — the ' +
      'spacecraft and target are accidentally in nearly the same heliocentric state because ' +
      'Earth and the body are nearly co-located. Apophis at its 2029 close approach is the ' +
      'canonical example. The resulting minC3 is mathematically valid but operationally ' +
      'meaningless: it does not describe a real rendezvous mission. Treat any minC3 below ' +
      '0.1 km²/s² as a flag to inspect the geometry, not a real planning number.',
  },
];
