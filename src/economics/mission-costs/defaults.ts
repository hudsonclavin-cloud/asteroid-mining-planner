/**
 * Mission planner spacecraft, launch vehicle, and destination configuration tables.
 * Source: index.html lines ~1285–1315.
 *
 * These are the screening-grade defaults used by the mission planner UI.
 * All costs and performance numbers are order-of-magnitude estimates.
 */

export const SPACECRAFT = {
  light:  { name: 'Light Prospector', dry_kg: 500,   payload_kg: 200,   isp: 3000, cost_usd: 50e6  },
  medium: { name: 'Medium Miner',     dry_kg: 5000,  payload_kg: 2000,  isp: 320,  cost_usd: 180e6 },
  heavy:  { name: 'Heavy Hauler',     dry_kg: 50000, payload_kg: 20000, isp: 320,  cost_usd: 500e6 },
} as const;

export const LAUNCH_VEHICLES = {
  f9_rs:   { name: 'Falcon 9 Rideshare', cost_per_kg: 5000,  max_kg: 1000,   label: 'F9 Rideshare' },
  f9:      { name: 'Falcon 9',           cost_per_kg: 2700,  max_kg: 22800,  label: 'Falcon 9'     },
  fh:      { name: 'Falcon Heavy',       cost_per_kg: 1500,  max_kg: 63800,  label: 'Falcon Heavy' },
  starship:{ name: 'Starship',           cost_per_kg: 100,   max_kg: 150000, label: 'Starship*'    },
  vulcan:  { name: 'Vulcan Centaur',     cost_per_kg: 4000,  max_kg: 27200,  label: 'Vulcan'       },
  ng:      { name: 'New Glenn',          cost_per_kg: 2000,  max_kg: 45000,  label: 'New Glenn*'   },
} as const;

export const DEST_LABELS: Record<string, string> = {
  leo:   'LEO (400 km)',
  geo:   'GEO (35,786 km)',
  l1:    'Earth-Moon L1',
  l2:    'Earth-Moon L2',
  lunar: 'Lunar Surface',
  mars:  'Mars Orbit',
};

export const DELIVERY_DESTINATIONS = {
  leo:   { key: 'leo',   label: 'Low Earth Orbit (LEO)',  captureExtraDv: 0.0, deliveryExtraDv: 0.0, marketMultiplier: 1.00 },
  geo:   { key: 'geo',   label: 'High Earth Orbit (GEO)', captureExtraDv: 1.5, deliveryExtraDv: 0.6, marketMultiplier: 1.08 },
  l1:    { key: 'l1',    label: 'Earth-Moon L1',          captureExtraDv: 0.5, deliveryExtraDv: 0.4, marketMultiplier: 1.12 },
  l2:    { key: 'l2',    label: 'Earth-Moon L2',          captureExtraDv: 0.5, deliveryExtraDv: 0.4, marketMultiplier: 1.12 },
  lunar: { key: 'lunar', label: 'Lunar Surface',          captureExtraDv: 1.7, deliveryExtraDv: 1.6, marketMultiplier: 1.20 },
  mars:  { key: 'mars',  label: 'Mars Orbit',             captureExtraDv: 0.9, deliveryExtraDv: 3.5, marketMultiplier: 1.35 },
} as const;

export const REDIRECT_CAPTURE_TARGETS = {
  lunar_orbit: { key: 'lunar_orbit', label: 'Lunar Orbit',    orbitRadiusKm: 6737,   captureExtraDv: 1.7 },
  el4:         { key: 'el4',         label: 'Earth-Moon L4',  orbitRadiusKm: 384400, captureExtraDv: 0.8 },
  el5:         { key: 'el5',         label: 'Earth-Moon L5',  orbitRadiusKm: 384400, captureExtraDv: 0.8 },
} as const;

/** Maximum ΔV threshold for the mission planner filter (km/s). */
export const MISSION_DV_FILTER_MAX = 10;
