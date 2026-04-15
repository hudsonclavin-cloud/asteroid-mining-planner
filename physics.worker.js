// Aster Physics Worker — Keplerian propagator + burn simulator
// Heliocentric Ecliptic J2000, positions in AU, velocities in km/s

const GM_sun = 1.327124400e20; // m³/s²
const AU = 1.496e11;           // m per AU
const J2000 = 2451545.0;       // JD of J2000 epoch
const TWO_PI = 2 * Math.PI;
const DEG = Math.PI / 180;
const GM_AU3_S2 = GM_sun / (AU * AU * AU); // ~3.964e-14 AU³/s²
const GM_earth  = 3.986004418e14;          // m³/s²
const R_earth   = 6.3781e6;               // m
const GM_moon   = 4902.0;                 // km³/s²
const R_moon    = 1737.4;                 // km
const R_cap     = R_moon + 5000;          // km — 5000 km altitude lunar capture orbit

// Standish 1992 planet elements at J2000 + secular rates
// Format: [a0, da, e0, de, i0, di, Om0, dOm, L0, dL, wb0, dwb]
// L = mean longitude (= Om + w + M), wb = longitude of perihelion (= Om + w)
// All angles in degrees; rates per Julian century
const PLANETS = [
  // Mercury
  [0.38709927, 0.00000037, 0.20563593, 0.00001906,
   7.00497902, -0.00594749, 48.33076593, -0.12534081,
   252.25032350, 149472.67411175, 77.45779628, 0.16047689],
  // Venus
  [0.72333566, 0.00000390, 0.00677672, -0.00004107,
   3.39467605, -0.00078890, 76.67984255, -0.27769418,
   181.97909950, 58517.81538729, 131.60246718, 0.00268329],
  // Earth
  [1.00000261, 0.00000562, 0.01671123, -0.00004392,
   -0.00001531, -0.01294668, 0.0, 0.0,
   100.46457166, 35999.37244981, 102.93768193, 0.32327364],
  // Mars
  [1.52371034, 0.00001847, 0.09339410, 0.00007882,
   1.84969142, -0.00813131, 49.55953891, -0.29257343,
   -4.55343205, 19140.30268499, -23.94362959, 0.44441088],
  // Jupiter
  [5.20288700, -0.00011607, 0.04838624, -0.00013253,
   1.30439695, -0.00183714, 100.47390909, 0.20469106,
   34.39644051, 3034.74612775, 14.72847983, 0.21252668],
  // Saturn
  [9.53667594, -0.00125060, 0.05386179, -0.00050991,
   2.48599187, 0.00193609, 113.66242448, -0.28867794,
   49.95424423, 1222.49362201, 92.59887831, -0.41897216],
  // Uranus
  [19.18916464, -0.00196176, 0.04725744, -0.00004397,
   0.77263783, -0.00242939, 74.01692503, 0.04240589,
   313.23810451, 428.48202785, 170.95427630, 0.40805281],
  // Neptune
  [30.06992276, 0.00026291, 0.00859048, 0.00005105,
   1.77004347, 0.00035372, 131.78422574, -0.00508664,
   -55.12002969, 218.45945325, 44.96476227, -0.32241464],
];

let asteroids = [];

const MISSION_GATE_DEP_KMS = 10.0;
const MISSION_GATE_TOTAL_KMS = 25.0;
const MISSION_HIGH_DV_KMS = 12.0;
const NHATS_DEFAULTS = { dv: '12', dur: '450', stay: '8' };
const DEFAULT_REDIRECT_CAPTURE = { key: 'lunar_orbit', label: 'Lunar Orbit', orbitRadiusKm: 6737, captureExtraDv: 1.7 };
const DEFAULT_REDIRECT_DELIVERY = { key: 'leo', label: 'Low Earth Orbit (LEO)', captureExtraDv: 0.0, deliveryExtraDv: 0.0, marketMultiplier: 1.0 };
const DEFAULT_REDIRECT_SPACECRAFT = { name: 'Medium Miner', dry_kg: 5000, payload_kg: 2000, isp: 320, cost_usd: 180e6 };
const DEFAULT_REDIRECT_LAUNCH = { name: 'Falcon 9', cost_per_kg: 2700, max_kg: 22800, label: 'Falcon 9' };

const FALLBACK_CATALOG = [
  { pdes: 433, full_name: '433 Eros (1898 DQ)', a: 1.45811225801466, e: 0.222735687791413, i: 10.82857013630658, om: 304.3062534664844, w: 178.8213653588039, ma: 47.23946575496196, epoch: 2458600.5, H: 11.16, spec: 'S', profit: 1.0779165041005357e-42, delta_v: 6.112354, price: 6.688146261052001e-42, pha: 'N', class: 'AMO', diameter: 16.84, albedo: 0.25, moid: 0.149341, last_obs: '2018-10-27', condition_code: 0 },
  { pdes: 719, full_name: '719 Albert (1911 MT)', a: 2.638780196295172, e: 0.5463009415651705, i: 11.5648447748565, om: 183.8872861432646, w: 156.1636682123583, ma: 48.31725263057137, epoch: 2458600.5, H: 15.4, spec: 'S', profit: 4.285173583378436e-43, delta_v: 7.724768, price: 4.123974587503586e-42, pha: 'N', class: 'AMO', diameter: null, albedo: null, moid: 0.203359, last_obs: '2018-11-03', condition_code: 0 },
  { pdes: 887, full_name: '887 Alinda (1918 DB)', a: 2.476487671729959, e: 0.5691156473282417, i: 9.384537356044309, om: 110.4284814357001, w: 350.4143214209113, ma: 193.4143465783937, epoch: 2458600.5, H: 13.4, spec: '?', profit: null, delta_v: 7.06642, price: null, pha: 'N', class: 'AMO', diameter: 4.2, albedo: 0.31, moid: 0.0865707, last_obs: '2018-07-12', condition_code: 0 },
  { pdes: 1036, full_name: '1036 Ganymed (1924 TD)', a: 2.664145334052341, e: 0.5332347372100545, i: 26.68761212144486, om: 215.5575038401243, w: 132.3963557605626, ma: 274.1561973977862, epoch: 2458600.5, H: 9.45, spec: 'S', profit: 7.107686773724316e-40, delta_v: 10.368777, price: 9.485008166604466e-39, pha: 'N', class: 'AMO', diameter: 37.675, albedo: 0.238, moid: 0.343497, last_obs: '2018-07-03', condition_code: 0 },
  { pdes: 1221, full_name: '1221 Amor (1932 EA1)', a: 1.91941566321919, e: 0.4353210351202446, i: 11.87652956555689, om: 171.3372302802219, w: 26.6748196824311, ma: 250.2803094387659, epoch: 2458600.5, H: 17.7, spec: '?', profit: null, delta_v: 6.687817, price: null, pha: 'N', class: 'AMO', diameter: 1, albedo: null, moid: 0.107716, last_obs: '2018-10-15', condition_code: 0 },
  { pdes: 1566, full_name: '1566 Icarus (1949 MA)', a: 1.077933978069936, e: 0.826810028209165, i: 22.85233700526169, om: 88.08176571328511, w: 31.29738216487599, ma: 33.0245871930141, epoch: 2453505.5, H: 16.9, spec: '?', profit: null, delta_v: 15.298098, price: null, pha: 'Y', class: 'APO', diameter: 1, albedo: 0.51, moid: 0.0350617, last_obs: '2018-07-26', condition_code: 0 },
  { pdes: 1580, full_name: '1580 Betulia (1950 KA)', a: 2.196729768306549, e: 0.4875957095290629, i: 52.098230224, om: 62.29224456812244, w: 159.5055235075437, ma: 74.0179593176497, epoch: 2458600.5, H: 14.7, spec: 'C', profit: 6934989326903.471, delta_v: 17.059994, price: 151930944581743.22, pha: 'N', class: 'AMO', diameter: 5.8, albedo: 0.08, moid: 0.135315, last_obs: '2018-07-17', condition_code: 0 },
  { pdes: 1620, full_name: '1620 Geographos (1951 RA)', a: 1.24530233955045, e: 0.3354404981112329, i: 13.33734833973119, om: 337.1953965589663, w: 276.9150418598405, ma: 311.5329572322354, epoch: 2458600.5, H: 15.6, spec: 'S', profit: 3.87743609006322e-43, delta_v: 6.747039, price: 2.97575945469195e-42, pha: 'Y', class: 'APO', diameter: 2.56, albedo: 0.29, moid: 0.0298285, last_obs: '2018-11-03', condition_code: 0 },
  { pdes: 1627, full_name: '1627 Ivar (1929 SH)', a: 1.863481492935208, e: 0.3966132591577319, i: 8.450368630107375, om: 133.1221704068903, w: 167.7698144036891, ma: 101.5580082429805, epoch: 2458600.5, H: 13.2, spec: 'S', profit: 1.993467397835755e-41, delta_v: 6.320181, price: 1.3454341325506982e-40, pha: 'N', class: 'AMO', diameter: 9.12, albedo: 0.15, moid: 0.11161, last_obs: '2018-11-02', condition_code: 0 },
  { pdes: 1685, full_name: '1685 Toro (1948 OA)', a: 1.367307961319918, e: 0.4358338371649736, i: 9.380085642650519, om: 274.3374253845515, w: 127.0621738468082, ma: 293.4107248356075, epoch: 2454917.5, H: 14.23, spec: 'S', profit: 9.273765410517366e-43, delta_v: 6.669782, price: 6.971314526034139e-42, pha: 'N', class: 'APO', diameter: 3.4, albedo: 0.31, moid: 0.0507715, last_obs: '2018-08-08', condition_code: 0 },
  { pdes: 1862, full_name: '1862 Apollo (1932 HA)', a: 1.470162312389734, e: 0.5597614018825802, i: 6.353445562610878, om: 35.73168803474559, w: 285.8593797344928, ma: 206.6290803122197, epoch: 2455958.5, H: 16.25, spec: 'Q', profit: 88356037.90588945, delta_v: 7.484202, price: 805034046.4611495, pha: 'Y', class: 'APO', diameter: 1.5, albedo: 0.25, moid: 0.025757, last_obs: '2017-05-17', condition_code: 0 },
];

function normalizeDesignation(raw) {
  return String(raw || '').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
}

function parseFiniteOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parsePositiveOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseEpochJD(value) {
  if (value === '' || value === null || value === undefined) return J2000;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n === 0) return J2000;
  return n > 2400000 ? n : null;
}

function buildNhatsUrl(overrides) {
  return 'https://aster-proxy.hudsonclavin.workers.dev/api/nhats?' + new URLSearchParams({
    ...NHATS_DEFAULTS,
    ...(overrides || {}),
  }).toString();
}

function buildSbdbQueryUrl(limit) {
  return 'https://aster-proxy.hudsonclavin.workers.dev/api/sbdb-query?' + new URLSearchParams({
    'sb-group': 'neo',
    'sb-kind': 'a',
    limit: String(limit),
    sort: 'moid',
    fields: 'spkid,full_name,pdes,name,class,neo,pha,moid,epoch,e,a,i,om,w,ma,per,last_obs,condition_code,H,diameter,albedo,spec_B,spec_T,source,data_arc,n_obs_used',
  }).toString();
}

function buildAsterankUrl(limit, sort = 'moid') {
  return 'https://aster-proxy.hudsonclavin.workers.dev/api/asterank?' + new URLSearchParams({
    query: JSON.stringify({ neo: 'Y' }),
    limit: String(limit),
    sort,
    fields: 'pdes,full_name,a,e,i,om,w,ma,epoch,H,spec,profit,delta_v,price,closeness,neo,pha,class,diameter,albedo,moid,last_obs,condition_code',
  }).toString();
}

function getNhatsMetricValue(value, key) {
  if (value && typeof value === 'object') {
    const nested = parsePositiveOrNull(value[key]);
    if (nested !== null) return nested;
    for (const candidate of Object.values(value)) {
      const parsed = parsePositiveOrNull(candidate);
      if (parsed !== null) return parsed;
    }
    return null;
  }
  return parseFiniteOrNull(value);
}

function normalizeNhatsRow(row) {
  if (!row) return null;
  const isArr = Array.isArray(row);
  const des = normalizeDesignation(isArr ? row[0] : (row.des ?? row.pdes));
  const fullname = normalizeDesignation(isArr ? row[1] : (row.fullname ?? row.full_name));
  const minDv = getNhatsMetricValue(isArr ? row[4] : (row.min_dv ?? row.minDv), 'dv');
  const minDur = getNhatsMetricValue(isArr ? row[5] : (row.min_dur ?? row.minDur), 'dur');
  const stayTime = getNhatsMetricValue(isArr ? row[7] : (row.min_stay ?? row.stayTime), 'dur');
  const nTrajectories = parseFiniteOrNull(isArr ? row[6] : (row.n_via_traj ?? row.n_via_points ?? row.nTrajectories));
  const occRaw = isArr ? row[9] : (row.occ ?? row.obs_flag);
  return {
    des,
    fullname,
    minDv,
    minDur,
    stayTime,
    nTrajectories: nTrajectories === null ? null : Math.max(0, Math.round(nTrajectories)),
    occ: occRaw === null || occRaw === undefined || occRaw === '' ? null : occRaw,
  };
}

function resolveDiameterKm(row) {
  const direct = parsePositiveOrNull(row.diameter);
  if (direct !== null) return { value: direct, source: 'catalog' };
  const hVal = parsePositiveOrNull(row.H);
  if (hVal === null) return { value: null, source: 'unknown' };
  const albedo = parsePositiveOrNull(row.albedo) || 0.15;
  return {
    value: (1329 / Math.sqrt(albedo)) * Math.pow(10, -hVal / 5),
    source: 'estimated',
  };
}

function resolveWholeBodyCatalogValueUsd(row) {
  return parsePositiveOrNull(row.price);
}

function estimateExtractableValueUsd({ spec, diameterKm }) {
  const d = parsePositiveOrNull(diameterKm);
  if (d === null) return null;
  const dM = d * 1000;
  const volume = (4 / 3) * Math.PI * Math.pow(dM / 2, 3);
  const s = String(spec || '').trim().charAt(0).toUpperCase();
  const density = (s === 'M' || s === 'E') ? 5000 : (s === 'S' || s === 'Q') ? 2700 : 1700;
  const valuePerKg = (s === 'M' || s === 'E') ? 100 : (s === 'S' || s === 'Q') ? 10 : 50;
  const wholeBodyValue = volume * density * valuePerKg;
  const extractableValue = wholeBodyValue * 0.05;
  return Number.isFinite(extractableValue) && extractableValue > 0 ? extractableValue : null;
}

function normalizeAsterankRow(row) {
  const a = parsePositiveOrNull(row.a);
  const e = parseFiniteOrNull(row.e);
  const epoch = parseEpochJD(row.epoch);
  if (a === null || e === null || e < 0 || e >= 1 || epoch === null) return null;
  const diameterInfo = resolveDiameterKm(row);
  const specRaw = String(row.spec || row.spec_T || '').trim();
  const rawPrice = resolveWholeBodyCatalogValueUsd(row);
  const rawProfit = parsePositiveOrNull(row.profit);
  const rawDv = parsePositiveOrNull(row.delta_v ?? row.dv);
  const extractableValue = estimateExtractableValueUsd({ spec: specRaw, diameterKm: diameterInfo.value });
  let astClass = String(row.class || '').trim();
  if (!astClass) {
    const q = a * (1 - e);
    const Q = a * (1 + e);
    if (Q < 0.983) astClass = 'IEO';
    else if (a < 1.0) astClass = 'ATE';
    else if (q < 1.017) astClass = 'APO';
    else astClass = 'AMO';
  }
  const moid = parseFiniteOrNull(row.moid);
  const conditionCode = parseFiniteOrNull(row.condition_code);
  return {
    spkid: row.spkid ? String(row.spkid).trim() : null,
    a,
    e,
    i: parseFiniteOrNull(row.i) || 0,
    om: parseFiniteOrNull(row.om) || 0,
    w: parseFiniteOrNull(row.w) || 0,
    ma: parseFiniteOrNull(row.ma) || 0,
    epoch,
    per: parsePositiveOrNull(row.per) || Math.sqrt(a * a * a),
    pdes: String(row.pdes || row.full_name || '').trim(),
    full_name: String(row.full_name || row.name || row.pdes || '').trim(),
    name: String(row.name || '').trim(),
    class: astClass,
    pha: row.pha || 'N',
    H: parsePositiveOrNull(row.H),
    diameter: diameterInfo.value,
    diameter_source: diameterInfo.source,
    albedo: parsePositiveOrNull(row.albedo),
    spec: specRaw || '?',
    spec_T: String(row.spec_T || specRaw || '').trim(),
    price: rawPrice,
    profit: rawProfit,
    value_extractable_est: extractableValue,
    value_extractable_source: extractableValue !== null ? 'heuristic' : 'unknown',
    economics_source: rawPrice !== null || rawProfit !== null ? 'asterank' : (extractableValue !== null ? 'heuristic' : 'unknown'),
    moid,
    delta_v: rawDv,
    last_obs: row.last_obs || null,
    condition_code: conditionCode === null ? null : conditionCode,
    data_arc_days: parsePositiveOrNull(row.data_arc),
    n_obs_used: parsePositiveOrNull(row.n_obs_used),
    data_source: row.data_source || 'asterank',
  };
}

function normalizeSbdbQueryResponse(json) {
  const fields = Array.isArray(json?.fields) ? json.fields : [];
  const rows = Array.isArray(json?.data) ? json.data : [];
  if (fields.length === 0 || rows.length === 0) return [];
  return rows.map(row => {
    if (!Array.isArray(row)) return null;
    const mapped = {};
    for (let i = 0; i < fields.length; i++) mapped[fields[i]] = row[i];
    return mapped;
  }).filter(Boolean);
}

function makeCanonicalObjectKey(row) {
  const pdes = normalizeDesignation(row?.pdes);
  if (pdes) return `pdes:${pdes}`;
  const spkid = String(row?.spkid || '').trim();
  if (spkid) return `spkid:${spkid}`;
  const name = normalizeDesignation(row?.full_name || row?.name);
  return name ? `name:${name}` : '';
}

function buildProvenanceField(value, source, status, updatedAt, assumptions) {
  return { value: value ?? null, source, status, updatedAt: updatedAt || null, assumptions: assumptions || null };
}

function buildCanonicalDossier(base, enrichment, nhatsRow, meta) {
  const updatedAt = meta?.updatedAt || null;
  const economicsSource = enrichment && (enrichment.price !== null || enrichment.profit !== null || enrichment.value_extractable_est !== null)
    ? 'asterank'
    : (base.value_extractable_est !== null ? 'heuristic' : 'unavailable');
  const deltaVSource = enrichment?.delta_v !== null && enrichment?.delta_v !== undefined
    ? 'asterank'
    : nhatsRow?.minDv !== null && nhatsRow?.minDv !== undefined
      ? 'nhats'
      : 'unavailable';
  const primarySource = meta?.primarySource || 'sbdb-query';
  return {
    version: 1,
    id: {
      pdes: base.pdes || null,
      fullName: base.full_name || null,
      name: base.name || null,
      spkid: base.spkid || null,
      normalizedKey: makeCanonicalObjectKey(base),
    },
    orbit: {
      a: buildProvenanceField(base.a, primarySource, Number.isFinite(base.a) ? 'known' : 'unavailable', updatedAt),
      e: buildProvenanceField(base.e, primarySource, Number.isFinite(base.e) ? 'known' : 'unavailable', updatedAt),
      i: buildProvenanceField(base.i, primarySource, Number.isFinite(base.i) ? 'known' : 'unavailable', updatedAt),
      om: buildProvenanceField(base.om, primarySource, Number.isFinite(base.om) ? 'known' : 'unavailable', updatedAt),
      w: buildProvenanceField(base.w, primarySource, Number.isFinite(base.w) ? 'known' : 'unavailable', updatedAt),
      ma: buildProvenanceField(base.ma, primarySource, Number.isFinite(base.ma) ? 'known' : 'unavailable', updatedAt),
      epoch: buildProvenanceField(base.epoch, primarySource, Number.isFinite(base.epoch) ? 'known' : 'unavailable', updatedAt),
      moid: buildProvenanceField(base.moid, primarySource, Number.isFinite(base.moid) ? 'known' : 'unavailable', updatedAt),
      class: buildProvenanceField(base.class, primarySource, base.class ? 'known' : 'unavailable', updatedAt),
      pha: buildProvenanceField(base.pha, primarySource, base.pha ? 'known' : 'unavailable', updatedAt),
      dataArcDays: buildProvenanceField(base.data_arc_days, primarySource, Number.isFinite(base.data_arc_days) ? 'known' : 'unavailable', updatedAt),
      observations: buildProvenanceField(base.n_obs_used, primarySource, Number.isFinite(base.n_obs_used) ? 'known' : 'unavailable', updatedAt),
    },
    physical: {
      H: buildProvenanceField(base.H, primarySource, Number.isFinite(base.H) ? 'known' : 'unavailable', updatedAt),
      diameterKm: buildProvenanceField(base.diameter, primarySource, base.diameter_source === 'estimated' ? 'derived' : Number.isFinite(base.diameter) ? 'known' : 'unavailable', updatedAt, base.diameter_source === 'estimated' ? 'estimated from H with assumed albedo' : null),
      albedo: buildProvenanceField(base.albedo, primarySource, Number.isFinite(base.albedo) ? 'known' : 'unavailable', updatedAt),
      spectralType: buildProvenanceField(base.spec === '?' ? null : base.spec, (base.spec_source || primarySource), base.spec === '?' ? 'unavailable' : (base.spec_source === 'asterank' ? 'derived' : 'known'), updatedAt),
      lastObs: buildProvenanceField(base.last_obs, primarySource, base.last_obs ? 'known' : 'unavailable', updatedAt),
      conditionCode: buildProvenanceField(base.condition_code, primarySource, base.condition_code !== null && base.condition_code !== undefined ? 'known' : 'unavailable', updatedAt),
    },
    accessibility: {
      plannerDeltaV: buildProvenanceField(base.delta_v, deltaVSource, Number.isFinite(base.delta_v) ? 'derived' : 'unavailable', updatedAt, deltaVSource === 'asterank' ? 'Asterank screening delta-v' : null),
      nhatsAccessible: buildProvenanceField(!!nhatsRow, 'nhats', nhatsRow ? 'known' : 'unavailable', updatedAt),
      nhatsMinDv: buildProvenanceField(nhatsRow?.minDv, 'nhats', Number.isFinite(nhatsRow?.minDv) ? 'known' : 'unavailable', updatedAt),
      nhatsMinDur: buildProvenanceField(nhatsRow?.minDur, 'nhats', Number.isFinite(nhatsRow?.minDur) ? 'known' : 'unavailable', updatedAt),
      nhatsStayTime: buildProvenanceField(nhatsRow?.stayTime, 'nhats', Number.isFinite(nhatsRow?.stayTime) ? 'known' : 'unavailable', updatedAt),
      nhatsTrajectories: buildProvenanceField(nhatsRow?.nTrajectories, 'nhats', Number.isFinite(nhatsRow?.nTrajectories) ? 'known' : 'unavailable', updatedAt),
    },
    hazard: {
      sentryRestricted: buildProvenanceField(null, 'sentry', 'unavailable', updatedAt),
      impactProbability: buildProvenanceField(null, 'sentry', 'unavailable', updatedAt),
    },
    economics: {
      asterankPriceUsd: buildProvenanceField(base.price, 'asterank', Number.isFinite(base.price) ? 'heuristic' : 'unavailable', updatedAt),
      asterankProfitUsd: buildProvenanceField(base.profit, 'asterank', Number.isFinite(base.profit) ? 'heuristic' : 'unavailable', updatedAt),
      heuristicExtractableValueUsd: buildProvenanceField(base.value_extractable_est, economicsSource, Number.isFinite(base.value_extractable_est) ? 'heuristic' : 'unavailable', updatedAt),
      screeningValueRank: buildProvenanceField(base.screening_value_rank, economicsSource, Number.isFinite(base.screening_value_rank) ? 'heuristic' : 'unavailable', updatedAt),
    },
    provenance: {
      primarySource,
      sourceMap: {
        orbit: primarySource,
        physical: primarySource,
        accessibility: nhatsRow ? 'nhats + asterank' : (deltaVSource === 'asterank' ? 'asterank' : primarySource),
        economics: economicsSource,
      },
      updatedAt,
      stale: !!meta?.stale,
      summaryStatus: meta?.summaryStatus || 'screening-grade',
    },
  };
}

function computeDataConfidence(dossier) {
  if (!dossier) return 0;
  let score = 30;
  if (dossier.orbit.a.status === 'known' && dossier.orbit.e.status === 'known') score += 20;
  if (dossier.orbit.observations.status === 'known') score += 10;
  if (dossier.orbit.dataArcDays.status === 'known') score += 10;
  if (dossier.physical.diameterKm.status !== 'unavailable') score += dossier.physical.diameterKm.status === 'known' ? 15 : 8;
  if (dossier.physical.spectralType.status !== 'unavailable') score += 5;
  if (dossier.accessibility.nhatsAccessible.value) score += 5;
  if (dossier.economics.asterankPriceUsd.status !== 'unavailable' || dossier.economics.heuristicExtractableValueUsd.status !== 'unavailable') score += 5;
  return Math.max(0, Math.min(100, score));
}

// ─── Vector helpers ──────────────────────────────────────────────────────────
function mag(v) { return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); }
function dot(a,b) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
function cross(a,b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
function vscale(v,s) { return [v[0]*s, v[1]*s, v[2]*s]; }
function vsub(a,b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }

// Stumpff functions C(z) and S(z) for Lambert solver
function stumpff(z) {
  if (z > 1e-6) {
    const sq = Math.sqrt(z);
    return [(1 - Math.cos(sq)) / z, (sq - Math.sin(sq)) / (sq * sq * sq)];
  }
  if (z < -1e-6) {
    const sq = Math.sqrt(-z);
    return [(1 - Math.cosh(sq)) / z, (Math.sinh(sq) - sq) / (sq * sq * sq)];
  }
  return [0.5, 1/6];
}

// Solve Kepler's equation via Newton-Raphson
function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 10; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

// Keplerian elements → heliocentric ecliptic Cartesian (AU, km/s)
function kep2cart(a_AU, e, i_rad, Om_rad, w_rad, M0_rad, epoch_JD, t_JD) {
  const a_m = a_AU * AU;
  const n = Math.sqrt(GM_sun / (a_m * a_m * a_m));
  const dt = (t_JD - epoch_JD) * 86400.0;
  let M = M0_rad + n * dt;
  M = M - TWO_PI * Math.floor((M + Math.PI) / TWO_PI);
  const E = solveKepler(M, e);
  const nu = 2 * Math.atan2(Math.sqrt(1+e)*Math.sin(E/2), Math.sqrt(1-e)*Math.cos(E/2));
  const r = a_AU * (1 - e * Math.cos(E));
  const r_m = r * AU;
  const xo = r * Math.cos(nu);
  const yo = r * Math.sin(nu);

  // Orbital plane velocity (m/s)
  const sqrtGMa = Math.sqrt(GM_sun * a_m);
  const vxo = -(sqrtGMa / r_m) * Math.sin(E);
  const vyo =  (sqrtGMa / r_m) * Math.sqrt(1 - e * e) * Math.cos(E);

  // 3-1-3 Euler rotation: Ω, i, ω → ecliptic frame
  const cosOm = Math.cos(Om_rad), sinOm = Math.sin(Om_rad);
  const cosI  = Math.cos(i_rad),  sinI  = Math.sin(i_rad);
  const cosW  = Math.cos(w_rad),  sinW  = Math.sin(w_rad);

  const Rxx = cosOm*cosW - sinOm*sinW*cosI;
  const Rxy = -(cosOm*sinW + sinOm*cosW*cosI);
  const Ryx = sinOm*cosW + cosOm*sinW*cosI;
  const Ryy = -(sinOm*sinW - cosOm*cosW*cosI);
  const Rzx = sinW*sinI;
  const Rzy = cosW*sinI;

  return {
    x: xo*Rxx + yo*Rxy,
    y: xo*Ryx + yo*Ryy,
    z: xo*Rzx + yo*Rzy,
    vx: (vxo*Rxx + vyo*Rxy) / 1000,
    vy: (vxo*Ryx + vyo*Ryy) / 1000,
    vz: (vxo*Rzx + vyo*Rzy) / 1000,
  };
}

// Cartesian (AU, km/s) → Keplerian elements
function cart2kep(x, y, z, vx_kms, vy_kms, vz_kms, t_JD) {
  const mu = GM_AU3_S2; // AU³/s²
  const vx = vx_kms * 1000 / AU;
  const vy = vy_kms * 1000 / AU;
  const vz = vz_kms * 1000 / AU;

  const r_vec = [x, y, z];
  const v_vec = [vx, vy, vz];
  const r = mag(r_vec);
  const v2 = dot(v_vec, v_vec);

  const h_vec = cross(r_vec, v_vec);
  const h = mag(h_vec);

  // Node vector: [0,0,1] × h_vec = [-hy, hx, 0]
  const n_vec = [-h_vec[1], h_vec[0], 0];
  const n_mag = Math.sqrt(n_vec[0]*n_vec[0] + n_vec[1]*n_vec[1]);

  // Eccentricity vector: (v × h)/μ - r̂
  const vxh = cross(v_vec, h_vec);
  const e_vec = vsub(vscale(vxh, 1/mu), vscale(r_vec, 1/r));
  const e = mag(e_vec);

  // Semi-major axis (vis-viva)
  const a = 1 / (2/r - v2/mu);
  if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(e) || e >= 1) return null;

  // Inclination
  const inc = Math.acos(Math.max(-1, Math.min(1, h_vec[2] / h)));

  // RAAN (Ω)
  let Om = 0;
  if (n_mag > 1e-10) {
    Om = Math.acos(Math.max(-1, Math.min(1, n_vec[0] / n_mag)));
    if (n_vec[1] < 0) Om = TWO_PI - Om;
  }

  // Argument of periapsis (ω)
  let w = 0;
  if (n_mag > 1e-10 && e > 1e-10) {
    w = Math.acos(Math.max(-1, Math.min(1, dot(n_vec, e_vec) / (n_mag * e))));
    if (e_vec[2] < 0) w = TWO_PI - w;
  }

  // True anomaly (ν)
  let nu_anom = 0;
  if (e > 1e-10) {
    nu_anom = Math.acos(Math.max(-1, Math.min(1, dot(e_vec, r_vec) / (e * r))));
    if (dot(r_vec, v_vec) < 0) nu_anom = TWO_PI - nu_anom;
  }

  // Mean anomaly via eccentric anomaly
  const E_anom = 2 * Math.atan2(Math.sqrt(1-e)*Math.sin(nu_anom/2), Math.sqrt(1+e)*Math.cos(nu_anom/2));
  const M0 = E_anom - e * Math.sin(E_anom);
  if (![a, e, inc, Om, w, M0].every(Number.isFinite)) return null;

  return { a, e, i: inc, Om, w, M0, epoch_JD: t_JD, nu: nu_anom };
}

function isPlausiblePlannerOrbit(el, maxApoAu = 5.5) {
  if (!el || !Number.isFinite(el.a) || !Number.isFinite(el.e)) return false;
  if (el.a <= 0 || el.e < 0 || el.e >= 1) return false;
  const peri = el.a * (1 - el.e);
  const apo = el.a * (1 + el.e);
  return Number.isFinite(peri) &&
    Number.isFinite(apo) &&
    peri > 0 &&
    apo <= maxApoAu;
}

function solveLambertWithOrbitGuard(r1, r2, tof_days, originState, epoch_JD) {
  let lam = null;
  let orbit_el = null;
  let usedFallback = false;
  let suspiciousIzzo = false;

  try { lam = izzoLambert(r1, r2, tof_days); } catch(e) {}
  if (lam && lam.v1 && lam.v2 && lam.v1.every(Number.isFinite) && lam.v2.every(Number.isFinite)) {
    try {
      orbit_el = cart2kep(originState.x, originState.y, originState.z, lam.v1[0], lam.v1[1], lam.v1[2], epoch_JD);
    } catch(e) {}
    if (!isPlausiblePlannerOrbit(orbit_el)) {
      lam = null;
      orbit_el = null;
      suspiciousIzzo = true;
    }
  } else {
    lam = null;
  }

  if (!lam) {
    try { lam = lambert(r1, r2, tof_days); usedFallback = true; } catch(e) {}
    if (lam && lam.v1 && lam.v2 && lam.v1.every(Number.isFinite) && lam.v2.every(Number.isFinite)) {
      try {
        orbit_el = cart2kep(originState.x, originState.y, originState.z, lam.v1[0], lam.v1[1], lam.v1[2], epoch_JD);
      } catch(e) {}
      if (!isPlausiblePlannerOrbit(orbit_el)) {
        lam = null;
        orbit_el = null;
      }
    } else {
      lam = null;
    }
  }

  return { lam, orbit_el, usedFallback, suspiciousIzzo };
}

// Propagate a planet at Julian Date jd using Standish 1992 secular elements
function propagatePlanet(pIdx, jd) {
  const p = PLANETS[pIdx];
  const T = (jd - J2000) / 36525.0;

  const a  = p[0] + p[1] * T;
  const e  = p[2] + p[3] * T;
  const i  = (p[4] + p[5] * T) * DEG;
  const Om = (p[6] + p[7] * T) * DEG;
  const L  = (p[8] + p[9] * T) * DEG;
  const wb = (p[10] + p[11] * T) * DEG;

  const w  = wb - Om;
  const M0 = L - wb;

  return kep2cart(a, e, i, Om, w, M0, jd, jd);
}

// Propagate asteroid at Julian Date jd
function propagateAsteroid(ast, jd) {
  const a    = ast.a;
  const e    = ast.e;
  const i    = ast.i * DEG;
  const Om   = ast.om * DEG;
  const w    = ast.w * DEG;
  const M0   = ast.ma * DEG;
  const epochJD = ast.epoch; // already JD

  return kep2cart(a, e, i, Om, w, M0, epochJD, jd);
}

// Propagate using new cart2kep elements (stored with radians, epoch_JD)
function propagateElements(el, jd) {
  return kep2cart(el.a, el.e, el.i, el.Om, el.w, el.M0, el.epoch_JD, jd);
}

// Apply ΔV burn (km/s in prograde/normal/radial) and return new elements
function applyBurn(ast_or_el, jd, dv_p, dv_n, dv_r) {
  let state;
  if (ast_or_el.epoch_JD !== undefined) {
    state = propagateElements(ast_or_el, jd);
  } else {
    state = propagateAsteroid(ast_or_el, jd);
  }

  const r_vec = [state.x, state.y, state.z];
  const v_vec = [state.vx, state.vy, state.vz];
  const r_m = mag(r_vec);
  const v_m = mag(v_vec);

  if (r_m < 1e-15 || v_m < 1e-15) return null;

  // Unit vectors: prograde, normal (h), radial
  const p_hat = vscale(v_vec, 1/v_m);
  const h_vec = cross(r_vec, v_vec);
  const h_m = mag(h_vec);
  const n_hat = h_m > 1e-15 ? vscale(h_vec, 1/h_m) : [0, 0, 1];
  const r_hat = vscale(r_vec, 1/r_m);

  const dvx = dv_p*p_hat[0] + dv_n*n_hat[0] + dv_r*r_hat[0];
  const dvy = dv_p*p_hat[1] + dv_n*n_hat[1] + dv_r*r_hat[1];
  const dvz = dv_p*p_hat[2] + dv_n*n_hat[2] + dv_r*r_hat[2];

  const vx_new = state.vx + dvx;
  const vy_new = state.vy + dvy;
  const vz_new = state.vz + dvz;

  return cart2kep(state.x, state.y, state.z, vx_new, vy_new, vz_new, jd);
}

// MOID approximation: sample both orbits independently, find minimum pairwise distance
// Accuracy ~0.01 AU (see DEVLOG.md)
function moidApprox(el, jd_ref, nPts) {
  nPts = nPts || 120;
  const earthPts = [];
  const astPts = [];
  const T_earth = 365.25;
  const T_ast = Math.sqrt(el.a * el.a * el.a) * 365.25;

  for (let k = 0; k < nPts; k++) {
    const f = k / nPts;
    earthPts.push(propagatePlanet(2, jd_ref + f * T_earth));
    if (el.epoch_JD !== undefined) {
      astPts.push(kep2cart(el.a, el.e, el.i, el.Om, el.w, el.M0, el.epoch_JD, el.epoch_JD + f * T_ast));
    } else {
      const epochJD = el.epoch; // already JD
      astPts.push(kep2cart(el.a, el.e, el.i*DEG, el.om*DEG, el.w*DEG, el.ma*DEG, epochJD, epochJD + f * T_ast));
    }
  }

  let minDist = Infinity;
  for (let j = 0; j < nPts; j++) {
    for (let k = 0; k < nPts; k++) {
      const dx = astPts[j].x - earthPts[k].x;
      const dy = astPts[j].y - earthPts[k].y;
      const dz = astPts[j].z - earthPts[k].z;
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (d < minDist) minDist = d;
    }
  }
  return minDist;
}

// Close approach scan: find top N closest Earth approaches over `years` years
function closeApproachScan(el, jd_start, years, n) {
  years = years || 5;
  n = n || 730;
  const dt = years * 365.25 / n;
  const localMins = [];
  let prevDist = null;
  let prevJD = jd_start;

  for (let k = 0; k <= n; k++) {
    const jd = jd_start + k * dt;
    let pos;
    try {
      pos = el.epoch_JD !== undefined ? propagateElements(el, jd) : propagateAsteroid(el, jd);
    } catch(_) { prevDist = null; continue; }
    const earth = propagatePlanet(2, jd);
    const dx = pos.x - earth.x, dy = pos.y - earth.y, dz = pos.z - earth.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (prevDist !== null && dist > prevDist && prevDist < 1.0) {
      localMins.push({ jd: prevJD, dist: prevDist });
    }
    prevDist = dist;
    prevJD = jd;
  }

  localMins.sort((a, b) => a.dist - b.dist);
  return localMins.slice(0, 3);
}

// Lambert solver (Bate-Mueller-White universal variable method)
// r1v, r2v: position vectors in AU; tof_days: time of flight in days
// Returns { v1, v2 } velocity vectors in km/s, or null on failure
function lambert(r1v, r2v, tof_days) {
  const tof_s = tof_days * 86400;
  const mu = GM_AU3_S2;
  const r1 = mag(r1v), r2 = mag(r2v);
  if (r1 < 1e-10 || r2 < 1e-10) return null;

  const cos_dnu = Math.max(-1, Math.min(1, dot(r1v, r2v) / (r1 * r2)));
  // Determine transfer direction from cross product z-component
  const cz = r1v[0]*r2v[1] - r1v[1]*r2v[0];
  const sin_dnu = (cz >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, 1 - cos_dnu*cos_dnu));

  const denom = 1 - cos_dnu;
  if (Math.abs(denom) < 1e-8) return null;

  const A = sin_dnu * Math.sqrt(r1 * r2 / denom);
  if (!isFinite(A) || Math.abs(A) < 1e-10) return null;

  // tof(z): compute transfer time for universal variable z
  function tofZ(z) {
    const [C, S] = stumpff(z);
    if (C < 1e-15) return Infinity;
    const y = r1 + r2 + A * (z * S - 1) / Math.sqrt(C);
    if (y <= 0) return Infinity;
    const x = Math.sqrt(y / C);
    const t = (x*x*x*S + A*Math.sqrt(y)) / Math.sqrt(mu);
    return isFinite(t) ? t : Infinity;
  }

  // Newton-Raphson with finite differences
  let z = 0;
  for (let iter = 0; iter < 50; iter++) {
    const t = tofZ(z);
    if (!isFinite(t)) { z += 0.5; continue; }
    const dz = Math.max(1e-5, Math.abs(z) * 0.002);
    const tp = tofZ(z + dz);
    if (!isFinite(tp)) { z -= 0.1; continue; }
    const dtdz = (tp - t) / dz;
    if (Math.abs(dtdz) < 1e-20) break;
    const step = (tof_s - t) / dtdz;
    z += Math.max(-20, Math.min(20, step));
    if (Math.abs(step) < 1e-7) break;
  }

  const [C, S] = stumpff(z);
  if (C < 1e-15) return null;
  const y = r1 + r2 + A * (z * S - 1) / Math.sqrt(C);
  if (y <= 0) return null;

  const f = 1 - y / r1;
  const g = A * Math.sqrt(y / mu);
  const gdot = 1 - y / r2;
  if (Math.abs(g) < 1e-15) return null;

  const v1_AU_s = vscale(vsub(r2v, vscale(r1v, f)), 1/g);
  const v2_AU_s = vscale(vsub(vscale(r2v, gdot), r1v), 1/g);

  const conv = AU / 1000; // AU/s → km/s
  return {
    v1: vscale(v1_AU_s, conv),
    v2: vscale(v2_AU_s, conv),
  };
}

// ─── Izzo 2015 Lambert solver ─────────────────────────────────────────────────
// r1v, r2v: [x,y,z] in AU; tof_days: days; direction: 1=prograde, -1=retrograde
// Returns { v1, v2 } in km/s, or null on failure.
function izzoLambert(r1v, r2v, tof_days, direction) {
  direction = direction || 1;
  const tof = tof_days * 86400; // seconds
  const mu  = GM_sun;

  const r1 = r1v.map(v => v * AU);
  const r2 = r2v.map(v => v * AU);
  const r1n = Math.hypot(r1[0], r1[1], r1[2]);
  const r2n = Math.hypot(r2[0], r2[1], r2[2]);
  if (r1n < 1e3 || r2n < 1e3 || tof <= 0) return null;

  const c = Math.hypot(r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]);
  const s = (r1n + r2n + c) / 2;
  if (s < 1e3 || c < 1e3) return null;

  // Cross product for transfer direction
  const crossVec = [
    r1[1]*r2[2] - r1[2]*r2[1],
    r1[2]*r2[0] - r1[0]*r2[2],
    r1[0]*r2[1] - r1[1]*r2[0],
  ];
  const thetaGt180 = (direction === 1) ? (crossVec[2] < 0) : (crossVec[2] >= 0);

  const lambda2 = 1 - c / s;
  let lambda = Math.sqrt(Math.max(0, lambda2));
  if (thetaGt180) lambda = -lambda;

  // Non-dimensional TOF
  const T = tof * Math.sqrt(2 * mu / (s * s * s));
  if (!isFinite(T) || T <= 0) return null;

  // Initial guess
  const sqL = Math.sqrt(1 - lambda * lambda);
  const T0 = Math.acos(lambda) + lambda * sqL;
  let x = (T >= T0) ? (T0 / T - 1) : Math.min(0.98, T0 / T);

  // Householder 3rd-order iterations
  for (let iter = 0; iter < 60; iter++) {
    const { T: Tx, dT, d2T, d3T } = _izzTofDerivs(x, lambda);
    const dx = Tx - T;
    if (Math.abs(dx) < 1e-12 * (Math.abs(T) + 1)) break;
    if (Math.abs(dT) < 1e-20) break;
    const h2 = d2T / (2 * dT);
    const h3 = d3T / (6 * dT) - h2 * h2;
    const step = dx / (dT * (1 + dx * (h2 + dx * h3)));
    x -= step;
    if (x <= -1) x = -0.99;
    else if (x >= 1) x = 0.99;
  }
  if (!isFinite(x) || Math.abs(x) >= 1) return null;

  // Recover velocities
  const gamma = Math.sqrt(mu * s / 2);
  const rho   = (r1n - r2n) / c;
  const sigma = Math.sqrt(Math.max(0, 1 - rho * rho));
  const y     = Math.sqrt(Math.max(0, 1 - lambda2 * (1 - x * x)));
  if (y < 1e-10) return null;

  const Vr1 =  gamma * ((lambda * y - x) - rho * (lambda * y + x)) / r1n;
  const Vr2 = -gamma * ((lambda * y - x) + rho * (lambda * y + x)) / r2n;
  const Vt1 =  gamma * sigma * (y + lambda * x) / r1n;
  const Vt2 =  gamma * sigma * (y + lambda * x) / r2n;

  const r1hat = r1.map(v => v / r1n);
  const r2hat = r2.map(v => v / r2n);
  const th1 = _unitVec([
    r1hat[1]*crossVec[2] - r1hat[2]*crossVec[1],
    r1hat[2]*crossVec[0] - r1hat[0]*crossVec[2],
    r1hat[0]*crossVec[1] - r1hat[1]*crossVec[0],
  ]);
  const th2 = _unitVec([
    r2hat[1]*crossVec[2] - r2hat[2]*crossVec[1],
    r2hat[2]*crossVec[0] - r2hat[0]*crossVec[2],
    r2hat[0]*crossVec[1] - r2hat[1]*crossVec[0],
  ]);

  const f = 1 / 1000; // m/s → km/s
  return {
    v1: [(Vr1*r1hat[0] + Vt1*th1[0])*f, (Vr1*r1hat[1] + Vt1*th1[1])*f, (Vr1*r1hat[2] + Vt1*th1[2])*f],
    v2: [(Vr2*r2hat[0] + Vt2*th2[0])*f, (Vr2*r2hat[1] + Vt2*th2[1])*f, (Vr2*r2hat[2] + Vt2*th2[2])*f],
  };
}

function _izzTofDerivs(x, lam) {
  // Elliptic Lancaster-Blanchard TOF (Izzo 2015, Eq. 9) + derivatives
  // T(x) = (acos(x) + λx·sqrt(1-x²)) / (1-x²)
  const x2 = x * x;
  const omx2 = 1 - x2;
  if (omx2 < 1e-14) return { T: 1e30, dT: 0, d2T: 0, d3T: 0 };
  const sqrtOmx2 = Math.sqrt(omx2);
  const T  = (Math.acos(x) + lam * x * sqrtOmx2) / omx2;
  if (!isFinite(T)) return { T: 1e30, dT: 0, d2T: 0, d3T: 0 };
  const q  = (sqrtOmx2 > 1e-14) ? (lam * x) / sqrtOmx2 : 0;
  const dT  = (1 - q * T) / omx2;
  const d2T = (2 * dT - q * dT * T + lam * lam) * (-x) / omx2;
  const d3T = (3 * d2T * x - 2 * dT + q * (T + T)) / omx2;
  return { T, dT, d2T, d3T };
}

function _unitVec(v) {
  const n = Math.hypot(v[0], v[1], v[2]);
  return n > 0 ? [v[0]/n, v[1]/n, v[2]/n] : [0, 0, 0];
}

// ─── Patched-conic helpers ────────────────────────────────────────────────────

// Compute patched-conic departure + arrival burns from a Lambert solution.
// v_earth, v_ast: heliocentric velocity vectors [km/s]
// v_t1, v_t2:    Lambert transfer velocities [km/s] at Earth and asteroid ends
// r_park_km:     parking orbit radius (km) from Earth centre
// Returns { dv_dep, dv_arr, C3, vinf_dep_mag, vinf_arr_mag }
function patchedConic(v_earth, v_t1, v_ast, v_t2, r_park_km) {
  const mu_e = 398600.4418; // km³/s²
  const rp   = r_park_km;

  const vinf_dep = [v_t1[0]-v_earth[0], v_t1[1]-v_earth[1], v_t1[2]-v_earth[2]];
  const vinf_dep_mag = Math.hypot(vinf_dep[0], vinf_dep[1], vinf_dep[2]);
  const C3 = vinf_dep_mag * vinf_dep_mag;

  const v_park = Math.sqrt(mu_e / rp);
  const v_hyp  = Math.sqrt(C3 + 2 * mu_e / rp);
  const dv_dep = v_hyp - v_park;

  const vinf_arr = [v_t2[0]-v_ast[0], v_t2[1]-v_ast[1], v_t2[2]-v_ast[2]];
  const dv_arr   = Math.hypot(vinf_arr[0], vinf_arr[1], vinf_arr[2]);

  return { dv_dep, dv_arr, C3, vinf_dep_mag, vinf_arr_mag: dv_arr };
}

// Compute destination-capture ΔV on return.
// v_inf_mag: arrival v-infinity at Earth [km/s]
function destinationCaptureDv(v_inf_mag, destination, r_park_km) {
  const mu_e = 398600.4418;
  const rp   = r_park_km;
  const v_circ = Math.sqrt(mu_e / rp);
  const v_hyp  = Math.sqrt(v_inf_mag * v_inf_mag + 2 * mu_e / rp);
  const dv_leo = v_hyp - v_circ;
  const extras = { leo:0, geo:1.5, l1:0.5, l2:0.5, lunar:1.7, mars:0.9 }; // screening-only adders
  return dv_leo + (extras[destination] || 0);
}

// Heuristic: flag low-C3 departures as lunar-assist candidates (v_inf < 3.2 km/s → C3 < ~10)
function checkLunarAssist(vinf_dep_mag) {
  return vinf_dep_mag < 3.2;
}

// ─── Message handler ─────────────────────────────────────────────────────────
self.onmessage = function(e) {
  const msg = e.data;

  if (msg.cmd === 'init') {
    asteroids = Array.isArray(msg.asteroids) ? msg.asteroids.filter(ast =>
      ast && Number.isFinite(ast.a) && Number.isFinite(ast.e) && Number.isFinite(ast.epoch)
    ) : [];
    return;
  }

  if (msg.cmd === 'propagate') {
    const jd = msg.jd;
    const N = asteroids.length;
    const total = (8 + N) * 3;
    const buf = new Float32Array(total);

    for (let i = 0; i < 8; i++) {
      const pos = propagatePlanet(i, jd);
      buf[i*3]   = pos.x;
      buf[i*3+1] = pos.y;
      buf[i*3+2] = pos.z;
    }

    const base = 24;
    for (let i = 0; i < N; i++) {
      try {
        const pos = propagateAsteroid(asteroids[i], jd);
        buf[base+i*3]   = pos.x;
        buf[base+i*3+1] = pos.y;
        buf[base+i*3+2] = pos.z;
      } catch(_) {
        buf[base+i*3]   = 0;
        buf[base+i*3+1] = 0;
        buf[base+i*3+2] = 0;
      }
    }

    self.postMessage({ type: 'positions', jd, buffer: buf }, [buf.buffer]);
    return;
  }

  if (msg.cmd === 'get_state') {
    const ast = asteroids[msg.ast_idx];
    if (!ast) return;
    const jd = msg.jd;
    const state = propagateAsteroid(ast, jd);
    const el = cart2kep(state.x, state.y, state.z, state.vx, state.vy, state.vz, jd);
    self.postMessage({ type: 'state', ...state, ...el });
    return;
  }

  if (msg.cmd === 'apply_burn') {
    const src = msg.elements || asteroids[msg.ast_idx];
    if (!src) return;
    const newEl = applyBurn(src, msg.jd, msg.dv_p || 0, msg.dv_n || 0, msg.dv_r || 0);
    if (!newEl) { self.postMessage({ type: 'burn_result', error: 'Singular state' }); return; }

    const period_days = TWO_PI * Math.sqrt(Math.pow(newEl.a, 3) / GM_AU3_S2) / 86400;
    const origEl = src.epoch_JD !== undefined ? src : {
      a: src.a, e: src.e, i: src.i*DEG, Om: src.om*DEG, w: src.w*DEG, M0: src.ma*DEG,
      epoch_JD: src.epoch
    };
    const origPeriod = TWO_PI * Math.sqrt(Math.pow(origEl.a !== undefined ? origEl.a : src.a, 3) / GM_AU3_S2) / 86400;
    // Skip MOID during live drag (preview=true) — computed once on pointer-up
    const moid = msg.preview ? null : moidApprox(newEl, msg.jd, 120);

    self.postMessage({
      type: 'burn_result',
      elements: newEl,
      period_days,
      orig_period_days: origPeriod,
      moid_approx: moid,
    });
    return;
  }

  if (msg.cmd === 'close_approach_scan') {
    const el = msg.elements;
    const results = closeApproachScan(el, msg.jd_start, msg.years || 5, 730);
    self.postMessage({ type: 'close_approaches', results });
    return;
  }

  if (msg.cmd === 'porkchop') {
    const ast = msg.ast;
    const { jd_start, jd_end, tof_min, tof_max, nx, ny } = msg;
    const burnEl = msg.burn_elements || null;

    const grid = new Float32Array(nx * ny);

    for (let i = 0; i < nx; i++) {
      const t1 = jd_start + i / (nx - 1) * (jd_end - jd_start);
      let r1, v_ast;
      try {
        const s1 = burnEl ? propagateElements(burnEl, t1) : propagateAsteroid(ast, t1);
        r1 = [s1.x, s1.y, s1.z];
        v_ast = [s1.vx, s1.vy, s1.vz];
      } catch(_) {
        for (let j = 0; j < ny; j++) grid[i*ny+j] = 20;
        continue;
      }

      for (let j = 0; j < ny; j++) {
        const tof = tof_min + j / (ny - 1) * (tof_max - tof_min);
        const t2 = t1 + tof;
        try {
          const earth2 = propagatePlanet(2, t2);
          const r2 = [earth2.x, earth2.y, earth2.z];
          const v_earth2 = [earth2.vx, earth2.vy, earth2.vz];

          let lam = izzoLambert(r1, r2, tof);
          if (!lam) lam = lambert(r1, r2, tof);
          if (!lam) { grid[i*ny+j] = 20; continue; }

          const dv_dep = Math.sqrt(
            Math.pow(lam.v1[0]-v_ast[0],2) +
            Math.pow(lam.v1[1]-v_ast[1],2) +
            Math.pow(lam.v1[2]-v_ast[2],2)
          );
          const dv_arr = Math.sqrt(
            Math.pow(lam.v2[0]-v_earth2[0],2) +
            Math.pow(lam.v2[1]-v_earth2[1],2) +
            Math.pow(lam.v2[2]-v_earth2[2],2)
          );
          grid[i*ny+j] = Math.min(20, dv_dep + dv_arr);
        } catch(_) {
          grid[i*ny+j] = 20;
        }
      }
    }

    self.postMessage({ type: 'porkchop', grid, nx, ny, jd_start, jd_end, tof_min, tof_max }, [grid.buffer]);
    return;
  }

  if (msg.cmd === 'plan_mission') {
    const { ast, jd_start, jd_end, destination, parkingAlt_km, spacecraft, stayDays: stayMsg } = msg;
    const r_park_km = 6371 + (parkingAlt_km || 400);
    const STAY_DEF  = { light: 14, medium: 45, heavy: 90 };
    const stayDays  = stayMsg || STAY_DEF[spacecraft] || 45;

    const STEP_DEP  = 15;
    const TOF_STEPS = 24;
    const TOF_MIN   = 60, TOF_MAX = 600;

    const totalDeps = Math.ceil((jd_end - jd_start) / STEP_DEP);
    let depIdx = 0;
    const phase1 = [];

    // ── Phase 1: outbound Lambert grid ──────────────────────────────────────
    let dbg_lambert_null = 0, dbg_gate_fail = 0, dbg_best_dv = Infinity;
    for (let jd_dep = jd_start; jd_dep <= jd_end; jd_dep += STEP_DEP) {
      depIdx++;
      if (depIdx % 15 === 0) {
        self.postMessage({
          type: 'plan_progress',
          pct: 0.5 * depIdx / totalDeps,
          label: `Phase 1/2 — Scanning outbound windows (${depIdx}/${totalDeps} dates)...`,
        });
      }

      let earthDep;
      try { earthDep = propagatePlanet(2, jd_dep); } catch(_) { continue; }
      const r1 = [earthDep.x, earthDep.y, earthDep.z];
      const ve  = [earthDep.vx, earthDep.vy, earthDep.vz];

      for (let step = 0; step <= TOF_STEPS; step++) {
        const tof    = TOF_MIN + (TOF_MAX - TOF_MIN) * step / TOF_STEPS;
        const jd_arr = jd_dep + tof;

        let astArr;
        try { astArr = propagateAsteroid(ast, jd_arr); } catch(_) { continue; }
        const r2 = [astArr.x, astArr.y, astArr.z];
        const va  = [astArr.vx, astArr.vy, astArr.vz];

        let lam = izzoLambert(r1, r2, tof);
        if (!lam) lam = lambert(r1, r2, tof);
        if (!lam) { dbg_lambert_null++; continue; }

        const pc = patchedConic(ve, lam.v1, va, lam.v2, r_park_km);
        if (!pc) continue;
        const combined = pc.dv_dep + pc.dv_arr;
        if (combined < dbg_best_dv) dbg_best_dv = combined;
        if (!isFinite(pc.dv_dep) || !isFinite(pc.dv_arr) || pc.dv_dep > 50 || pc.dv_arr > 50) { dbg_lambert_null++; continue; } // skip NaN/huge Lambert output
        if (pc.dv_dep > MISSION_GATE_DEP_KMS) { dbg_gate_fail++; continue; }

        phase1.push({
          jd_dep, jd_arr, tof,
          dv_dep: pc.dv_dep, dv_arr: pc.dv_arr,
          dv_mcc: 0.02 * (pc.dv_dep + pc.dv_arr),
          C3: pc.C3,
          vinf_dep: pc.vinf_dep_mag,
          vinf_arr: pc.vinf_arr_mag,
          earthPos: { x: r1[0], y: r1[1], z: r1[2] },
          astPos:   { x: r2[0], y: r2[1], z: r2[2] },
        });
      }
    }

    // Keep top 30 outbound by combined outbound ΔV
    phase1.sort((a, b) => (a.dv_dep + a.dv_arr) - (b.dv_dep + b.dv_arr));
    const candidates = phase1.slice(0, 200);

    // ── Phase 2: return Lambert + destination capture ────────────────────────
    const results = [];
    for (let ci = 0; ci < candidates.length; ci++) {
      const c = candidates[ci];
      self.postMessage({
        type: 'plan_progress',
        pct: 0.5 + 0.5 * (ci + 1) / candidates.length,
        label: `Phase 2/2 — Return trajectories (${ci+1}/${candidates.length})...`,
      });

      const jd_ret_dep = c.jd_arr + stayDays;
      let bestReturn = null;

      for (let rs = 0; rs <= 20; rs++) {
        const ret_tof     = 60 + 540 * rs / 20;
        const jd_ret_arr  = jd_ret_dep + ret_tof;

        let astDep, earthArr;
        try { astDep  = propagateAsteroid(ast, jd_ret_dep); } catch(_) { continue; }
        try { earthArr = propagatePlanet(2, jd_ret_arr);    } catch(_) { continue; }

        const rr1 = [astDep.x,   astDep.y,   astDep.z];
        const rr2 = [earthArr.x, earthArr.y, earthArr.z];
        const vad = [astDep.vx,  astDep.vy,  astDep.vz];
        const ved = [earthArr.vx,earthArr.vy,earthArr.vz];

        let lam = izzoLambert(rr1, rr2, ret_tof);
        if (!lam) lam = lambert(rr1, rr2, ret_tof);
        if (!lam || !lam.v1 || !lam.v2 || !lam.v1.every(Number.isFinite) || !lam.v2.every(Number.isFinite)) continue;

        const dv_ret_dep = Math.hypot(lam.v1[0]-vad[0], lam.v1[1]-vad[1], lam.v1[2]-vad[2]);
        const vinf_ret   = Math.hypot(lam.v2[0]-ved[0], lam.v2[1]-ved[1], lam.v2[2]-ved[2]);
        const dv_cap     = destinationCaptureDv(vinf_ret, destination, r_park_km);
        const total_return = dv_ret_dep + dv_cap;
        if (![dv_ret_dep, vinf_ret, dv_cap, total_return].every(Number.isFinite)) continue;

        if (!bestReturn || total_return < bestReturn.total_return) {
          bestReturn = { dv_return: dv_ret_dep, dv_capture: dv_cap,
            vinf_return: vinf_ret, tof_return: ret_tof, jd_ret_arr, total_return };
        }
      }
      if (!bestReturn) continue;

      const mcc = c.dv_mcc + 0.02 * bestReturn.dv_return;
      const dv_total = c.dv_dep + c.dv_arr + mcc + bestReturn.dv_return + bestReturn.dv_capture;
      if (!Number.isFinite(dv_total) || dv_total > MISSION_GATE_TOTAL_KMS) continue;

      results.push({
        jd_dep:    c.jd_dep,
        jd_arr:    c.jd_arr,
        jd_ret_dep,
        jd_ret_arr: bestReturn.jd_ret_arr,
        tof:        c.tof,
        tof_return: bestReturn.tof_return,
        stay_days:  stayDays,
        dv_dep:     +c.dv_dep.toFixed(3),
        dv_arr:     +c.dv_arr.toFixed(3),
        dv_mcc:     +mcc.toFixed(3),
        dv_return:  +bestReturn.dv_return.toFixed(3),
        dv_capture: +bestReturn.dv_capture.toFixed(3),
        dv_total:   +dv_total.toFixed(3),
        highDv:     dv_total > MISSION_HIGH_DV_KMS,
        C3:         +c.C3.toFixed(3),
        vinf_dep:   +c.vinf_dep.toFixed(3),
        vinf_arr:   +c.vinf_arr.toFixed(3),
        vinf_return:+bestReturn.vinf_return.toFixed(3),
        lunarAssist: checkLunarAssist(c.vinf_dep),
        earthPos:   c.earthPos,
        astPos:     c.astPos,
      });
    }

    results.sort((a, b) => a.dv_total - b.dv_total);
    const top = results.slice(0, 10);
    const dbg = { lambert_null: dbg_lambert_null, gate_fail: dbg_gate_fail,
      phase1_count: phase1.length, best_dv: dbg_best_dv === Infinity ? null : +dbg_best_dv.toFixed(2) };
    if (top.length === 0) {
      self.postMessage({ type: 'plan_result', results: [], noFeasibleWindow: true,
        dbg: Object.assign(dbg, { dv_dep_gate: MISSION_GATE_DEP_KMS, dv_total_gate: MISSION_GATE_TOTAL_KMS, high_dv_badge_gate: MISSION_HIGH_DV_KMS }) });
      return;
    }
    self.postMessage({ type: 'plan_result', results: top, noFeasibleWindow: false, dbg });
    return;
  }

  if (msg.cmd === 'plan_redirect_mission') {
    const {
      ast,
      jd_start,
      jd_end,
      reqId,
      propulsionModule,
      miningFraction,
      captureTarget,
      deliveryDestination,
      spacecraft,
      launchVehicle,
    } = msg;
    const captureProfile = captureTarget && Number.isFinite(captureTarget.orbitRadiusKm)
      ? captureTarget
      : DEFAULT_REDIRECT_CAPTURE;
    const deliveryProfile = deliveryDestination && Number.isFinite(deliveryDestination.marketMultiplier)
      ? deliveryDestination
      : DEFAULT_REDIRECT_DELIVERY;
    const spacecraftProfile = spacecraft && Number.isFinite(spacecraft.dry_kg)
      ? spacecraft
      : DEFAULT_REDIRECT_SPACECRAFT;
    const launchProfile = launchVehicle && Number.isFinite(launchVehicle.max_kg)
      ? launchVehicle
      : DEFAULT_REDIRECT_LAUNCH;

    // Validate orbital elements
    if (!ast || !isFinite(ast.a) || !isFinite(ast.e) || !isFinite(ast.i)) {
      self.postMessage({ type: 'redirect_result', schema_version: 1, reqId, feasible: false, error: 'Invalid asteroid orbital elements' });
      return;
    }
    // Founding Doc §6.2: block redirect for any asteroid with a non-zero Sentry impact probability
    if (ast.Sentry && Number.isFinite(ast.Sentry.impact_probability) && ast.Sentry.impact_probability > 0) {
      self.postMessage({ type: 'redirect_result', schema_version: 1, reqId, feasible: false, error: 'RESTRICTED: Asteroid has non-zero Sentry impact probability. Redirect planning blocked for hazardous objects.' });
      return;
    }

    // A — Intercept scan: keep a pool of low-departure candidates, then score redirect feasibility per propulsion mode.
    const tof_options = [120, 180, 240, 300, 360, 420, 480, 540, 600];
    const interceptCandidates = [];
    let lambert_fallback = false;

    for (let jd_dep = jd_start; jd_dep <= jd_end; jd_dep += 30) {
      let earthDep;
      try { earthDep = propagatePlanet(2, jd_dep); } catch(e) { continue; }
      const r1   = [earthDep.x, earthDep.y, earthDep.z];
      const ve   = [earthDep.vx, earthDep.vy, earthDep.vz];

      for (const tof of tof_options) {
        const jd_arr = jd_dep + tof;
        let astArr;
        try { astArr = propagateAsteroid(ast, jd_arr); } catch(e) { continue; }
        const r2   = [astArr.x, astArr.y, astArr.z];
        const va   = [astArr.vx, astArr.vy, astArr.vz];

        const interceptSolve = solveLambertWithOrbitGuard(
          r1,
          r2,
          tof,
          { x: earthDep.x, y: earthDep.y, z: earthDep.z },
          jd_dep
        );
        const lam = interceptSolve.lam;
        if (interceptSolve.usedFallback || interceptSolve.suspiciousIzzo) lambert_fallback = true;
        if (!lam) continue;

        const pc = patchedConic(ve, lam.v1, va, lam.v2, R_earth / 1000 + 400);
        if (!pc || !isFinite(pc.dv_dep) || pc.dv_dep > MISSION_GATE_DEP_KMS) continue;

        interceptCandidates.push({
          jd_dep, jd_arr, tof,
          dv_dep: pc.dv_dep,
          earthPos: { x: earthDep.x, y: earthDep.y, z: earthDep.z },
          astPos:   { x: astArr.x,   y: astArr.y,   z: astArr.z },
          v_ast:    { vx: astArr.vx, vy: astArr.vy, vz: astArr.vz },
          orbit_el: interceptSolve.orbit_el,
          ve, va,
        });
      }
    }

    if (!interceptCandidates.length) {
      self.postMessage({ type: 'redirect_result', schema_version: 1, reqId, feasible: false, error: `No viable intercept found within ΔV budget (${MISSION_GATE_DEP_KMS.toFixed(0)} km/s)` });
      return;
    }

    interceptCandidates.sort((a, b) => a.dv_dep - b.dv_dep);
    const candidatePool = interceptCandidates.slice(0, 60);

    // B — Asteroid mass
    let d_m;
    if (isFinite(ast._diam_m) && ast._diam_m > 0) {
      d_m = ast._diam_m;
    } else if (isFinite(ast.diameter) && ast.diameter > 0) {
      d_m = ast.diameter * 1000;
    } else {
      const H = isFinite(ast.H) ? ast.H : 18;
      const albedo = isFinite(ast.albedo) ? ast.albedo : 0.15;
      d_m = (1329 / Math.sqrt(albedo)) * Math.pow(10, -H / 5) * 1000;
    }
    const mass_kg = (4 / 3) * Math.PI * Math.pow(d_m / 2, 3) * 1500; // 1500 kg/m³ rubble pile
    const spec_type = ast.spec || ast.spec_T || 'unknown';

    const mineable_kg = mass_kg * 0.05;
    const water_kg = mineable_kg * (1 - miningFraction);
    const metal_kg = mineable_kg * miningFraction;
    const whole_body_price_usd = isFinite(ast.price) && ast.price > 0 ? ast.price : null;
    const stype = spec_type.charAt(0).toUpperCase();
    let extractable_value_usd = null;
    if (stype === 'C') extractable_value_usd = water_kg * 1500 + metal_kg * 500;
    else if (stype === 'M') extractable_value_usd = water_kg * 500 + metal_kg * 15000;
    else extractable_value_usd = water_kg * 500 + metal_kg * 3000;
    if (!isFinite(extractable_value_usd) || extractable_value_usd <= 0) extractable_value_usd = null;

    function evaluateRedirectCandidate(best) {
      const r_ast_AU = Math.hypot(best.astPos.x, best.astPos.y, best.astPos.z);
      const a_transfer_AU = (r_ast_AU + 1.0) / 2;
      const hohmann_s = Math.PI * Math.sqrt(Math.pow(a_transfer_AU, 3) / GM_AU3_S2);
      const hohmann_days = hohmann_s / 86400;
      const hohmann_center = Math.max(90, Math.min(960, Math.round(hohmann_days / 30) * 30));
      const redirectTofCandidates = Array.from(new Set(
        [120, 180, 240, 300, 360, 420, 480, 540, 600, 720, 840, 960]
          .concat([-180, -120, -60, 0, 60, 120, 180].map(offset => hohmann_center + offset))
          .filter(days => Number.isFinite(days) && days >= 90 && days <= 1080)
      )).sort((a, b) => a - b);

      let bestRedirectResult = null;
      let bestRedirectFallback = null;
      let bestError = 'No redirect transfer solved for this intercept.';

      for (const redirectTofDays of redirectTofCandidates) {
        const jd_earth_arr = best.jd_arr + redirectTofDays;

        let earthArrPos;
        try { earthArrPos = propagatePlanet(2, jd_earth_arr); } catch(e) { continue; }

        let dv_redirect = null;
        let earth_arrival_vinf = null;
        let redirect_lam_fallback = false;
        let redirect_orbit_el = null;

        try {
          const astArr2 = [best.astPos.x, best.astPos.y, best.astPos.z];
          const earArr2 = [earthArrPos.x, earthArrPos.y, earthArrPos.z];
          const redirectSolve = solveLambertWithOrbitGuard(
            astArr2,
            earArr2,
            redirectTofDays,
            { x: best.astPos.x, y: best.astPos.y, z: best.astPos.z },
            best.jd_arr
          );
          const rLam = redirectSolve.lam;
          redirect_lam_fallback = redirectSolve.usedFallback || redirectSolve.suspiciousIzzo;
          redirect_orbit_el = redirectSolve.orbit_el;
          if (!rLam) {
            bestError = 'Redirect Lambert solve failed for all tested return windows.';
            continue;
          }

          const dv_x = rLam.v1[0] - best.v_ast.vx;
          const dv_y = rLam.v1[1] - best.v_ast.vy;
          const dv_z = rLam.v1[2] - best.v_ast.vz;
          dv_redirect = Math.hypot(dv_x, dv_y, dv_z);

          const dv_arr_x = rLam.v2[0] - earthArrPos.vx;
          const dv_arr_y = rLam.v2[1] - earthArrPos.vy;
          const dv_arr_z = rLam.v2[2] - earthArrPos.vz;
          earth_arrival_vinf = Math.hypot(dv_arr_x, dv_arr_y, dv_arr_z);
        } catch(e) {
          bestError = 'Redirect transfer evaluation failed during state conversion.';
          continue;
        }

        if (!isFinite(dv_redirect) || !redirect_orbit_el) {
          bestError = 'Redirect leg did not yield a bounded elliptic orbit. Hyperbolic/non-elliptic redirects are not supported yet.';
          continue;
        }

        const redirectSafetyMoid = moidApprox(redirect_orbit_el, best.jd_arr, 120);
        if (isFinite(redirectSafetyMoid) && redirectSafetyMoid < 0.0005) {
          bestError = 'RESTRICTED: Redirected orbit MOID < 75,000 km. Planetary defense constraint.';
          continue;
        }

        const v_e = propulsionModule.isp_s * 9.80665 / 1000;
        const mass_ratio = isFinite(dv_redirect) ? Math.exp(dv_redirect / v_e) : null;
        const m_prop = isFinite(mass_ratio) ? mass_kg * (mass_ratio - 1) / mass_ratio : null;
        const m_prop_fraction = isFinite(m_prop) ? m_prop / mass_kg : null;

        const tugDryKg = spacecraftProfile.dry_kg + spacecraftProfile.payload_kg;
        const outboundMassRatio = Number.isFinite(best.dv_dep) ? Math.exp(best.dv_dep / v_e) : null;
        const outboundPropKg = Number.isFinite(outboundMassRatio) ? tugDryKg * (outboundMassRatio - 1) : null;
        const tugLaunchMassKg = Number.isFinite(outboundPropKg) ? tugDryKg + outboundPropKg : null;
        const fitsLaunchVehicle = Number.isFinite(tugLaunchMassKg) ? tugLaunchMassKg <= launchProfile.max_kg : false;
        const launchCostUsd = Number.isFinite(tugLaunchMassKg) ? tugLaunchMassKg * launchProfile.cost_per_kg : null;
        const supportMissionCostUsd = Number.isFinite(launchCostUsd) ? launchCostUsd + (spacecraftProfile.cost_usd || 0) : null;

        const captureBaseDv = Number.isFinite(earth_arrival_vinf)
          ? Math.max(0.25, earth_arrival_vinf * 0.35)
          : null;
        const dv_capture_target = Number.isFinite(captureBaseDv)
          ? captureBaseDv + (captureProfile.captureExtraDv || 0)
          : null;
        const dv_delivery = Number.isFinite(dv_capture_target)
          ? (deliveryProfile.deliveryExtraDv || 0)
          : null;
        const dv_total_redirect = Number.isFinite(dv_redirect) && Number.isFinite(dv_capture_target) && Number.isFinite(dv_delivery)
          ? best.dv_dep + dv_redirect + dv_capture_target + dv_delivery
          : null;
        const adjustedExtractableValueUsd = Number.isFinite(extractable_value_usd)
          ? extractable_value_usd * (deliveryProfile.marketMultiplier || 1)
          : null;
        const dv_score   = isFinite(dv_total_redirect) ? Math.max(0, 1 - dv_total_redirect / 18) * 45 : 0;
        const prop_score = isFinite(m_prop_fraction) ? Math.max(0, 1 - m_prop_fraction) * 30 : 0;
        const isru_score = isFinite(adjustedExtractableValueUsd) ? Math.min(20, Math.log10(Math.max(1, adjustedExtractableValueUsd)) / 12 * 20) : 0;
        const launch_score = fitsLaunchVehicle ? 5 : -20;
        const feasibility_score = Math.round((isFinite(dv_score) ? dv_score : 0) + prop_score + isru_score + launch_score);
        const prop_fraction_pct = isFinite(m_prop_fraction) ? Math.round(m_prop_fraction * 100) : null;
        const redirectFeasible = Number.isFinite(best.dv_dep) &&
          Number.isFinite(dv_redirect) &&
          Number.isFinite(m_prop_fraction) &&
          fitsLaunchVehicle &&
          m_prop_fraction < 0.95 &&
          !!redirect_orbit_el;

        const result = {
          type: 'redirect_result',
          schema_version: 1,
          reqId,
          feasible: redirectFeasible,
          intercept: {
            jd_dep: best.jd_dep,
            jd_arr: best.jd_arr,
            tof: best.tof,
            dv_dep: best.dv_dep,
            earthPos: best.earthPos,
            astPos: best.astPos,
            orbit_el: best.orbit_el || null,
            segment_jd_start: best.jd_dep,
            segment_jd_end: best.jd_arr,
          },
          redirect: {
            dv_redirect,
            tof_redirect: redirectTofDays,
            jd_earth_arr,
            earthArrPos: { x: earthArrPos.x, y: earthArrPos.y, z: earthArrPos.z },
            propulsion: propulsionModule.name,
            isp_s: propulsionModule.isp_s,
            orbit_el: redirect_orbit_el,
            segment_jd_start: best.jd_arr,
            segment_jd_end: jd_earth_arr,
          },
          capture: {
            target_key: captureProfile.key || null,
            label: captureProfile.label,
            delivery_key: deliveryProfile.key || null,
            delivery_label: deliveryProfile.label,
            dv_lunar_capture: dv_capture_target,
            dv_delivery,
            r_cap_km: captureProfile.orbitRadiusKm,
            v_inf_earth_arrival: isFinite(earth_arrival_vinf) ? earth_arrival_vinf : null,
            capture_modeled: Number.isFinite(dv_capture_target),
            capture_basis: 'screening-grade Earth-arrival insertion + target adders',
          },
          asteroid: { mass_kg, d_m, spec_type },
          isru: {
            mineable_kg,
            water_kg,
            metal_kg,
            mining_frac: miningFraction,
            whole_body_price_usd,
            extractable_value_usd: adjustedExtractableValueUsd,
            extractable_value_basis: '5% extraction heuristic',
          },
          logistics: {
            spacecraft_name: spacecraftProfile.name,
            launch_vehicle_name: launchProfile.name,
            tug_dry_kg: tugDryKg,
            outbound_propellant_kg: Number.isFinite(outboundPropKg) ? outboundPropKg : null,
            tug_launch_mass_kg: Number.isFinite(tugLaunchMassKg) ? tugLaunchMassKg : null,
            launch_vehicle_max_kg: launchProfile.max_kg,
            fits_launch_vehicle: fitsLaunchVehicle,
            launch_cost_usd: launchCostUsd,
            spacecraft_cost_usd: spacecraftProfile.cost_usd || null,
            support_mission_cost_usd: supportMissionCostUsd,
          },
          flags: {
            prop_fraction_pct,
            high_prop_load: isFinite(m_prop_fraction) ? m_prop_fraction > 0.5 : false,
            lambert_fallback: lambert_fallback || redirect_lam_fallback,
            safety_moid_au: Number.isFinite(redirectSafetyMoid) ? redirectSafetyMoid : null,
            launch_capacity_ok: fitsLaunchVehicle,
          },
          feasibility_score,
          _rank_dv_total: dv_total_redirect,
          _rank_prop_fraction: m_prop_fraction,
        };

        if (!bestRedirectFallback) {
          bestRedirectFallback = result;
        } else {
          const currProp = Number.isFinite(result._rank_prop_fraction) ? result._rank_prop_fraction : Infinity;
          const bestProp = Number.isFinite(bestRedirectFallback._rank_prop_fraction) ? bestRedirectFallback._rank_prop_fraction : Infinity;
          const currDv = Number.isFinite(result._rank_dv_total) ? result._rank_dv_total : Infinity;
          const bestDv = Number.isFinite(bestRedirectFallback._rank_dv_total) ? bestRedirectFallback._rank_dv_total : Infinity;
          if (currProp < bestProp || (currProp === bestProp && currDv < bestDv)) bestRedirectFallback = result;
        }

        if (!redirectFeasible) continue;
        if (!bestRedirectResult) {
          bestRedirectResult = result;
          continue;
        }
        const betterScore = result.feasibility_score > bestRedirectResult.feasibility_score;
        const tieBreakDv = result.feasibility_score === bestRedirectResult.feasibility_score &&
          (Number.isFinite(result._rank_dv_total) ? result._rank_dv_total : Infinity) <
          (Number.isFinite(bestRedirectResult._rank_dv_total) ? bestRedirectResult._rank_dv_total : Infinity);
        if (betterScore || tieBreakDv) bestRedirectResult = result;
      }

      const chosen = bestRedirectResult || bestRedirectFallback;
      if (!chosen) {
        return {
          type: 'redirect_result',
          schema_version: 1,
          reqId,
          feasible: false,
          error: bestError,
        };
      }
      if (!chosen.feasible && !chosen.error) {
        if (chosen.flags?.launch_capacity_ok === false) {
          chosen.error = `${launchProfile.name} cannot launch the ${spacecraftProfile.name} redirect stack within capacity.`;
        } else if (Number.isFinite(chosen.flags?.prop_fraction_pct)) {
          chosen.error = `Propellant requirement exceeds ${chosen.flags.prop_fraction_pct}% of asteroid mass for ${propulsionModule.name}`;
        }
      }
      return chosen;
    }

    let bestResult = null;
    let bestFallback = null;
    for (const candidate of candidatePool) {
      const result = evaluateRedirectCandidate(candidate);
      if (!result) continue;
      if (!bestFallback) bestFallback = result;
      else {
        const currProp = Number.isFinite(result._rank_prop_fraction) ? result._rank_prop_fraction : Infinity;
        const bestProp = Number.isFinite(bestFallback._rank_prop_fraction) ? bestFallback._rank_prop_fraction : Infinity;
        const currDv = Number.isFinite(result._rank_dv_total) ? result._rank_dv_total : Infinity;
        const bestDv = Number.isFinite(bestFallback._rank_dv_total) ? bestFallback._rank_dv_total : Infinity;
        if (currProp < bestProp || (currProp === bestProp && currDv < bestDv)) bestFallback = result;
      }
      if (!result.feasible) continue;
      if (!bestResult) {
        bestResult = result;
        continue;
      }
      const betterScore = result.feasibility_score > bestResult.feasibility_score;
      const tieBreakDv = result.feasibility_score === bestResult.feasibility_score &&
        (Number.isFinite(result._rank_dv_total) ? result._rank_dv_total : Infinity) <
        (Number.isFinite(bestResult._rank_dv_total) ? bestResult._rank_dv_total : Infinity);
      if (betterScore || tieBreakDv) bestResult = result;
    }

    const finalResult = bestResult || bestFallback;
    if (!finalResult) {
      self.postMessage({ type: 'redirect_result', schema_version: 1, reqId, feasible: false, error: 'No redirect solution could be evaluated for this target and propulsion mode.' });
      return;
    }
    if (!finalResult.feasible && !finalResult.error) {
      if (finalResult.flags?.launch_capacity_ok === false) {
        finalResult.error = `${launchProfile.name} cannot launch the ${spacecraftProfile.name} redirect stack within capacity.`;
      } else if (Number.isFinite(finalResult.flags?.prop_fraction_pct)) {
        finalResult.error = `Propellant requirement exceeds ${finalResult.flags.prop_fraction_pct}% of asteroid mass for ${propulsionModule.name}`;
      }
    }
    delete finalResult._rank_dv_total;
    delete finalResult._rank_prop_fraction;
    self.postMessage(finalResult);
    return;
  }

  if (msg.cmd === 'query_pos') {
    const { jd, planetIdx, reqId } = msg;
    try {
      const s = propagatePlanet(planetIdx, jd);
      self.postMessage({ type: 'query_pos_result', reqId, ok: true,
        x: s.x, y: s.y, z: s.z, vx: s.vx, vy: s.vy, vz: s.vz });
    } catch(e) {
      self.postMessage({ type: 'query_pos_result', reqId, ok: false });
    }
    return;
  }

  if (msg.cmd === 'fetch_nhats') {
    (async function() {
      const url = buildNhatsUrl();
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        const rows = (json.data || json.nhats || [])
          .map(normalizeNhatsRow)
          .filter(row => row && row.des);
        self.postMessage({ type: 'nhats_result', ok: true, data: rows, source: 'nhats', stale: !!json.stale });
        return;
      } catch(err) {
        console.warn('[NHATS worker] fetch error:', err.message);
      }
      self.postMessage({ type: 'nhats_result', ok: false, error: 'All NHATS URLs failed' });
    })();
    return;
  }

  if (msg.cmd === 'fetch_catalog') {
    (async function() {
      const requestedLimit = Math.max(10, Math.min(Number(msg.limit) || 5000, 5000));
      const fetchLimit = Math.max(250, Math.min(requestedLimit, 2000));
      const SBDB_URL = buildSbdbQueryUrl(fetchLimit);
      const ASTERANK_URL = buildAsterankUrl(fetchLimit, 'moid');
      const NHATS_URL = buildNhatsUrl();

      async function fetchSbdbWorker() {
        try {
          const r = await fetch(SBDB_URL);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const json = await r.json();
          const rows = normalizeSbdbQueryResponse(json);
          if (!rows.length) throw new Error('empty response');
          self.postMessage({ type: 'load_progress', source: 'sbdb', status: 'ok', count: rows.length });
          return { rows, source: 'sbdb-query', fallback: false, stale: !!json.stale, updatedAt: json.cachedAt || Date.now() };
        } catch (err) {
          console.warn('[Catalog] SBDB query failed:', err.message);
          self.postMessage({ type: 'load_progress', source: 'sbdb', status: 'error', error: err.message });
          return { rows: [], source: 'sbdb-query', fallback: false, stale: true, updatedAt: Date.now() };
        }
      }

      async function fetchAsterankWorker(allowFallback) {
        try {
          const r = await fetch(ASTERANK_URL);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const json = await r.json();
          const rows = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
          if (!Array.isArray(rows) || rows.length === 0) throw new Error('empty response');
          self.postMessage({ type: 'load_progress', source: 'asterank', status: 'ok', count: rows.length });
          return { rows, source: 'asterank', fallback: false, stale: !!json?.stale, updatedAt: json?.cachedAt || Date.now() };
        } catch(err) {
          console.warn('[Catalog] Asterank fetch failed:', err.message);
          const rows = allowFallback ? FALLBACK_CATALOG.slice() : [];
          if (allowFallback && rows.length > 0) {
            self.postMessage({ type: 'load_progress', source: 'asterank', status: 'fallback', count: rows.length });
            return { rows, source: 'fallback-static', fallback: true, stale: true, updatedAt: Date.now() };
          }
          self.postMessage({ type: 'load_progress', source: 'asterank', status: 'error', error: err.message });
          return { rows: [], source: 'asterank', fallback: false, stale: true, updatedAt: Date.now() };
        }
      }

      async function fetchNHATSWorker() {
        try {
          const r = await fetch(NHATS_URL);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const json = await r.json();
          const rows = (json.data || json.nhats || [])
            .map(normalizeNhatsRow)
            .filter(row => row && row.des);
          self.postMessage({ type: 'load_progress', source: 'nhats', status: 'ok', count: rows.length });
          return { rows, source: 'nhats', stale: !!json.stale };
        } catch(err) {
          self.postMessage({ type: 'load_progress', source: 'nhats', status: 'error', error: 'offline' });
          return { rows: [], source: 'nhats', stale: true };
        }
      }

      // Fetch in parallel
      const [sbdbPayload, nhatsPayload, initialAsterankPayload] = await Promise.all([
        fetchSbdbWorker(), fetchNHATSWorker(), fetchAsterankWorker(false)
      ]);
      let asterankPayload = initialAsterankPayload;
      let asterankRows = asterankPayload.rows || [];
      let sbdbRows = sbdbPayload.rows || [];
      const nhatsRows = nhatsPayload.rows || [];
      let primarySource = sbdbPayload.source;
      let catalogFallback = false;
      if (sbdbRows.length === 0) {
        const fallbackAsterankPayload = await fetchAsterankWorker(true);
        asterankPayload = fallbackAsterankPayload;
        asterankRows = fallbackAsterankPayload.rows || [];
        primarySource = fallbackAsterankPayload.source;
        catalogFallback = !!fallbackAsterankPayload.fallback;
        if (asterankRows.length === 0) {
          self.postMessage({ type: 'catalog_error', error: 'Catalog unavailable. Live JPL SBDB query failed and no fallback catalog is available.' });
          return;
        }
      }
      if (sbdbRows.length === 0 && asterankRows.length === 0) {
        self.postMessage({ type: 'catalog_error', error: 'Catalog unavailable. No JPL or fallback catalog rows returned.' });
        return;
      }

      const nhatsLookup = new Map();
      for (const row of nhatsRows) {
        if (!row?.des) continue;
        nhatsLookup.set(row.des, row);
        if (row.fullname) nhatsLookup.set(row.fullname, row);
      }

      const asterankLookup = new Map();
      for (const row of asterankRows) {
        const normalized = normalizeAsterankRow({
          ...row,
          data_source: catalogFallback ? 'fallback-static' : 'asterank',
        });
        if (!normalized) continue;
        const key = makeCanonicalObjectKey(normalized);
        if (key) asterankLookup.set(key, normalized);
      }

      const catalog = [];
      const primaryRows = sbdbRows.length ? sbdbRows : asterankRows;
      for (const row of primaryRows) {
        const normalized = normalizeAsterankRow({
          ...row,
          data_source: sbdbRows.length ? 'sbdb-query' : (catalogFallback ? 'fallback-static' : 'asterank'),
        });
        if (!normalized) continue;
        const enrichment = asterankLookup.get(makeCanonicalObjectKey(normalized));
        if (enrichment) {
          if (!normalized.name && enrichment.name) normalized.name = enrichment.name;
          if ((normalized.spec === '?' || !normalized.spec) && enrichment.spec && enrichment.spec !== '?') {
            normalized.spec = enrichment.spec;
            normalized.spec_T = enrichment.spec_T || enrichment.spec;
            normalized.spec_source = 'asterank';
          } else {
            normalized.spec_source = normalized.data_source;
          }
          if ((!Number.isFinite(normalized.diameter) || normalized.diameter === null) && Number.isFinite(enrichment.diameter)) {
            normalized.diameter = enrichment.diameter;
            normalized.diameter_source = enrichment.diameter_source || 'asterank';
          }
          if ((!Number.isFinite(normalized.albedo) || normalized.albedo === null) && Number.isFinite(enrichment.albedo)) normalized.albedo = enrichment.albedo;
          normalized.price = enrichment.price;
          normalized.profit = enrichment.profit;
          normalized.delta_v = enrichment.delta_v;
          normalized.value_extractable_est = enrichment.value_extractable_est;
          normalized.value_extractable_source = enrichment.value_extractable_source;
          normalized.economics_source = enrichment.economics_source;
        } else {
          normalized.spec_source = normalized.data_source;
        }
        const pdesKey = normalizeDesignation(normalized.pdes);
        const nhatsRow = nhatsLookup.get(pdesKey) ||
          nhatsLookup.get(normalizeDesignation(normalized.full_name || normalized.name || ''));
        const rankingValue = normalized.profit !== null
          ? normalized.profit
          : normalized.value_extractable_est !== null
            ? normalized.value_extractable_est * (normalized.diameter_source === 'catalog' ? 0.15 : 0.05)
            : null;
        normalized.screening_value_rank = rankingValue;
        normalized.rank_score = (normalized.screening_value_rank || 0) / Math.max(normalized.delta_v || 12, 1);
        normalized.nhats = nhatsRow ? {
          accessible: true,
          minDv: nhatsRow.minDv,
          minDur: nhatsRow.minDur,
          nTrajectories: nhatsRow.nTrajectories,
          stayTime: nhatsRow.stayTime,
          occ: nhatsRow.occ,
        } : { accessible: false, minDv: null, minDur: null, nTrajectories: null, stayTime: null, occ: null };
        normalized._nhats = !!nhatsRow;
        normalized.dossier = buildCanonicalDossier(normalized, enrichment || null, nhatsRow || null, {
          primarySource: sbdbRows.length ? 'sbdb-query' : primarySource,
          stale: !!sbdbPayload.stale || !!asterankPayload.stale || !!nhatsPayload.stale,
          updatedAt: Math.max(sbdbPayload.updatedAt || 0, asterankPayload.updatedAt || 0, Date.now()),
          summaryStatus: normalized.data_source === 'sbdb-query' ? 'source-backed' : 'screening-grade',
        });
        normalized.data_confidence = computeDataConfidence(normalized.dossier);
        normalized.primary_source = normalized.dossier.provenance.primarySource;
        normalized.provenance_status = normalized.dossier.provenance.summaryStatus;
        catalog.push(normalized);
      }

      // Sort by accessibility-adjusted score (profit per km/s of ΔV) so reachable NEOs rank first
      catalog.sort((a, b) => {
        const scoreA = a.rank_score || 0;
        const scoreB = b.rank_score || 0;
        return scoreB - scoreA;
      });
      const trimmed = catalog.slice(0, requestedLimit);

      self.postMessage({
        type: 'catalog_ready',
        data: trimmed,
        nhatsRows,
        source: primarySource,
        fallback: !!catalogFallback,
        stale: !!sbdbPayload.stale || !!asterankPayload.stale || !!nhatsPayload.stale,
        requestedLimit,
        returnedCount: trimmed.length,
      });
    })();
    return;
  }
};
