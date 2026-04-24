// Owns dv scoring, composition data, material constants, and the scoring/ranking helpers.

export const COMPOSITIONS: Record<string, string> = {
  C: 'Water ice: ~8% mass\nCarbon/org: ~15%\nIron/nickel: ~20%\nSilicates: ~57%',
  B: 'Water ice: ~10% mass\nCarbon: ~20%\nIron/nickel: ~18%\nSilicates: ~52%',
  S: 'Iron/nickel: ~25%\nOlivine: ~35%\nPyroxene: ~30%\nOther: ~10%',
  M: 'Iron: ~55%\nNickel: ~35%\nCobalt: ~5%\nTrace PGMs: <1%',
  D: 'Volatiles: ~15%\nCarbon/org: ~25%\nSilicates: ~55%\nOther: ~5%',
  X: 'Composition uncertain\nCould be M, E, or P type\nRequires spectroscopy',
};

export const FRACTIONS: Record<string, { water: number; metals: number }> = {
  C: { water: 0.08, metals: 0.20 },
  B: { water: 0.10, metals: 0.18 },
  S: { water: 0,    metals: 0.25 },
  M: { water: 0,    metals: 0.90 },
  D: { water: 0.05, metals: 0.10 },
  DEFAULT: { water: 0.02, metals: 0.15 },
};

export const MAT_COLORS: Record<string, string> = {
  water: '#60a5fa', iron: '#9ca3af', nickel: '#6b7280',
  cobalt: '#3b82f6', carbon: '#374151', silicates: '#92400e',
  platinum: '#e5e7eb', gold: '#fbbf24', silver: '#d1d5db',
  copper: '#f97316', rareEarth: '#8b5cf6',
};

export const MAT_DIFFICULTY: Record<string, string> = {
  water: 'EASY', carbon: 'EASY', silicates: 'EASY',
  iron: 'MED', nickel: 'MED',
  cobalt: 'HARD', silver: 'HARD', copper: 'HARD',
  platinum: 'EXTR', gold: 'EXTR', rareEarth: 'EXTR',
};

export const DIFF_COLOR: Record<string, string> = {
  EASY: '#34d399', MED: '#fbbf24', HARD: '#f97316', EXTR: '#f87171',
};

export const MAT_KEYS: string[] = [
  'water', 'iron', 'nickel', 'cobalt', 'carbon', 'silicates',
  'pgm', 'gold', 'silver', 'copper', 'rareEarth',
];

export const MAT_NAMES: Record<string, string> = {
  water: 'Water', iron: 'Iron', nickel: 'Nickel', cobalt: 'Cobalt', carbon: 'Carbon',
  silicates: 'Silicates', pgm: 'PGMs', gold: 'Gold', silver: 'Silver',
  copper: 'Copper', rareEarth: 'Rare Earth',
};

export const MAT_COLORS_HEX: Record<string, string> = {
  water: '#4488ff', iron: '#cc6633', nickel: '#aaaaaa', cobalt: '#6699cc',
  carbon: '#555566', silicates: '#8B7355', pgm: '#00d4ff', gold: '#ffcc00',
  silver: '#cccccc', copper: '#cc8833', rareEarth: '#aa44cc',
};

export const MAT_COMP: Record<string, Record<string, number>> = {
  C: { water: 10,  carbon: 3,    silicates: 65, iron: 15,  nickel: 2,   cobalt: 0.05,  pgm: 0.003,  gold: 0.0001,  silver: 0.001,  copper: 0.001,  rareEarth: 0.01  },
  S: { water: 0.5, carbon: 0.2,  silicates: 68, iron: 22,  nickel: 3,   cobalt: 0.10,  pgm: 0.005,  gold: 0.0002,  silver: 0.002,  copper: 0.002,  rareEarth: 0.02  },
  M: { water: 0.1, carbon: 0.05, silicates: 4.8, iron: 88, nickel: 7,   cobalt: 0.10,  pgm: 0.010,  gold: 0.001,   silver: 0.005,  copper: 0.010,  rareEarth: 0.005 },
  X: { water: 5,   carbon: 2,    silicates: 67, iron: 18,  nickel: 2.5, cobalt: 0.08,  pgm: 0.004,  gold: 0.00015, silver: 0.0015, copper: 0.0015, rareEarth: 0.015 },
};

export const MAT_DENSITY_KGM3: Record<string, number> = {
  C: 1300, S: 2700, M: 5300, X: 2000,
};

export function formatSignedScoreTerm(value: number): string {
  if (!Number.isFinite(value)) return 'unknown';
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}`;
}

export function formatScoreBucket(value: number, maxValue: number): string {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) return 'unknown';
  return `${Math.round(value)}/${Math.round(maxValue)}`;
}

export function scoreTermClass(value: number): string {
  if (!Number.isFinite(value)) return 'score-neutral';
  if (value > 0.1) return 'score-pos';
  if (value < -20) return 'score-bad';
  if (value < -0.1) return 'score-neg';
  return 'score-neutral';
}

export function scoreBucketClass(value: number, maxValue: number): string {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) return 'score-neutral';
  const ratio = value / maxValue;
  if (ratio >= 0.66) return 'score-pos';
  if (ratio >= 0.33) return 'score-neg';
  return 'score-bad';
}

export interface ScoreChip {
  label: string;
  value: string;
  valueClass?: string;
  note?: string;
}

export interface ScoreBreakdownOptions {
  title: string;
  formula?: string;
  chips?: ScoreChip[];
  note?: string;
}

export function renderScoreBreakdownHtml({ title, formula, chips, note }: ScoreBreakdownOptions): string {
  const chipHtml = (chips || []).map(chip => `
    <div class="score-chip">
      <span class="score-chip-label">${chip.label}</span>
      <span class="score-chip-value ${chip.valueClass || 'score-neutral'}">${chip.value}</span>
      ${chip.note ? `<span class="score-chip-note">${chip.note}</span>` : ''}
    </div>`).join('');
  return `<div class="score-explain">
    <div class="score-explain-header">
      <span class="score-explain-title">${title}</span>
      ${formula ? `<span class="score-explain-formula">${formula}</span>` : ''}
    </div>
    <div class="score-chip-row">${chipHtml}</div>
    ${note ? `<div class="score-mini-note">${note}</div>` : ''}
  </div>`;
}

export interface ExtractOps {
  dvPenalty: number;
  launchPenalty: number;
  roiTerm: number;
  roi: number | null;
  fitsLaunchVehicle: boolean;
}

export function buildExtractScoreBreakdownHtml(traj: any, ops: ExtractOps | null): string {
  if (!traj || !ops) return '';
  const chips: ScoreChip[] = [
    {
      label: 'Base',
      value: '100',
      valueClass: 'score-neutral',
      note: 'starting ceiling',
    },
    {
      label: 'Delta-V',
      value: formatSignedScoreTerm(ops.dvPenalty),
      valueClass: scoreTermClass(ops.dvPenalty),
      note: `${traj.dv_total.toFixed(2)} km/s total`,
    },
    {
      label: 'Launcher',
      value: formatSignedScoreTerm(ops.launchPenalty),
      valueClass: scoreTermClass(ops.launchPenalty),
      note: ops.fitsLaunchVehicle ? 'fits selected vehicle' : 'wet mass exceeds launcher',
    },
    {
      label: 'Est. ROI',
      value: formatSignedScoreTerm(ops.roiTerm),
      valueClass: scoreTermClass(ops.roiTerm),
      note: Number.isFinite(ops.roi) ? `${ops.roi!.toFixed(2)}x realized NPV / total cost` : 'unknown stays neutral',
    },
  ];
  const note = Number.isFinite(ops.roi)
    ? 'Perfect scores need low total ΔV, launcher fit, and strong realized NPV against mission cost.'
    : 'ROI is neutral here because the realized-return side is unknown or not finite.';
  return renderScoreBreakdownHtml({
    title: 'Score Breakdown',
    formula: '100 - 3×ΔV - launcher penalty + screening ROI term',
    chips,
    note,
  });
}

export interface RedirectScoreSummary {
  dvTotal: number | null;
  propFraction: number | null;
  extractableValueUsd: number | null;
  fitsLaunchVehicle: boolean;
  dvScore: number | null;
  propScore: number | null;
  valueScore: number | null;
  launchScore: number | null;
}

export function summarizeRedirectScore(data: any): RedirectScoreSummary | null {
  if (!data) return null;
  const dvTotal = Number.isFinite(data._rank_dv_total) ? data._rank_dv_total : null;
  const propFraction = Number.isFinite(data._rank_prop_fraction) ? data._rank_prop_fraction : null;
  const extractableValueUsd = Number.isFinite(data.isru?.extractable_value_usd) ? data.isru.extractable_value_usd : null;
  const fitsLaunchVehicle = data.logistics?.fits_launch_vehicle === true;
  const dvScore = Number.isFinite(dvTotal) ? Math.max(0, 1 - dvTotal! / 18) * 45 : null;
  const propScore = Number.isFinite(propFraction) ? Math.max(0, 1 - propFraction!) * 30 : null;
  const valueScore = Number.isFinite(extractableValueUsd)
    ? Math.min(20, Math.log10(Math.max(1, extractableValueUsd!)) / 12 * 20)
    : null;
  const launchScore = data.logistics?.fits_launch_vehicle === false ? -20 : (fitsLaunchVehicle ? 5 : null);
  return { dvTotal, propFraction, extractableValueUsd, fitsLaunchVehicle, dvScore, propScore, valueScore, launchScore };
}

export function buildRedirectScoreBreakdownHtml(data: any): string {
  // TODO: import fmtUSD from src/utils/
  const fmtUSD = (v: number) => `$${v.toLocaleString()}`;

  const summary = summarizeRedirectScore(data);
  if (!summary) return '';
  const launchFitKnown = data.logistics?.fits_launch_vehicle === true || data.logistics?.fits_launch_vehicle === false;
  const launchNote = launchFitKnown
    ? (summary.fitsLaunchVehicle ? 'vehicle fit confirmed' : 'vehicle fit failed')
    : 'vehicle fit unknown';
  const chips: ScoreChip[] = [
    {
      label: 'Delta-V',
      value: formatScoreBucket(summary.dvScore!, 45),
      valueClass: scoreBucketClass(summary.dvScore!, 45),
      note: Number.isFinite(summary.dvTotal) ? `${summary.dvTotal!.toFixed(2)} km/s total redirect budget` : 'unknown total redirect ΔV',
    },
    {
      label: 'Propellant',
      value: formatScoreBucket(summary.propScore!, 30),
      valueClass: scoreBucketClass(summary.propScore!, 30),
      note: Number.isFinite(summary.propFraction) ? `${Math.round(summary.propFraction! * 100)}% asteroid mass` : 'unknown propellant fraction',
    },
    {
      label: 'Value',
      value: formatScoreBucket(summary.valueScore!, 20),
      valueClass: scoreBucketClass(summary.valueScore!, 20),
      note: Number.isFinite(summary.extractableValueUsd) ? fmtUSD(summary.extractableValueUsd!) : 'unknown extractable value',
    },
    {
      label: 'Launcher',
      value: formatSignedScoreTerm(summary.launchScore!),
      valueClass: scoreTermClass(summary.launchScore!),
      note: launchNote,
    },
  ];
  const note = data.feasible
    ? 'Redirect scores are weighted from ΔV, propellant fraction, adjusted extractable value, and launcher fit.'
    : 'This is still the best screened candidate found; hard feasibility gates prevented it from becoming a valid redirect mission.';
  return renderScoreBreakdownHtml({
    title: 'Score Breakdown',
    formula: 'ΔV /45 + propellant /30 + value /20 + launcher',
    chips,
    note,
  });
}
