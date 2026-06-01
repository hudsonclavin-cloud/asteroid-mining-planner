import type { LambertScreenResult } from '../../boundary/lambert-screen-cache.js';

/**
 * Row data combining the Slice 9 catalog identity with its screening result.
 * Built by joining catalog.asteroids with the Lambert screen cache.
 */
export interface CatalogListRowData {
  bodyId: string;
  spkId: number;
  designation: string;
  name: string;
  orbitClass: string;
  H: number | null;
  screen: LambertScreenResult;
}

export const CATALOG_LIST_ROW_HEIGHT_PX = 56;
