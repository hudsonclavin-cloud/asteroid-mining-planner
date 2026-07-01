import { computed, effect, signal, type ReadonlySignal } from '@preact/signals';
import type { Slice9CanonicalFixture } from '../../boundary/slice9-nea-catalog.js';
import type { AsteroidOrbitClass } from '../../core/index.js';

export type NEACatalog = Slice9CanonicalFixture;
export type OrbitClass = AsteroidOrbitClass;
export type LayoutMode = 'sidebar' | 'overlay';
export type SortKey =
  | 'designation-asc'
  | 'designation-desc'
  | 'class-asc'
  | 'absolute-magnitude-asc'
  | 'absolute-magnitude-desc';

const DEFAULT_SORT_KEY: SortKey = 'designation-asc';
export const DEFAULT_STARFIELD_BRIGHTNESS = 1;
export const DEFAULT_BODY_LABELS_VISIBLE = true;
const STORAGE_KEY_LAYOUT_MODE = 'aster-v2-layout-mode';

function loadInitialLayoutMode(): LayoutMode {
  try {
    const stored =
      typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_LAYOUT_MODE) : null;
    return stored === 'overlay' ? 'overlay' : 'sidebar';
  } catch {
    return 'sidebar';
  }
}

const mutableCatalog = signal<NEACatalog | null>(null);
const mutableFilterClass = signal<OrbitClass | null>(null);
const mutableSearchQuery = signal('');
const mutableSortKey = signal<SortKey>(DEFAULT_SORT_KEY);
const mutableSelectedBody = signal<string | null>(null);
const mutableFocusRequestId = signal(0);
const mutableStarfieldVisible = signal(true);
const mutableStarfieldBrightness = signal(DEFAULT_STARFIELD_BRIGHTNESS);
const mutableBodyLabelsVisible = signal(DEFAULT_BODY_LABELS_VISIBLE);
export const layoutModeSignal = signal<LayoutMode>(loadInitialLayoutMode());

export const catalogSignal = computed(() => mutableCatalog.value);
export const filterClassSignal = computed(() => mutableFilterClass.value);
export const searchQuerySignal = computed(() => mutableSearchQuery.value);
export const sortKeySignal = computed(() => mutableSortKey.value);
export const selectedBodySignal = computed(() => mutableSelectedBody.value);
export const focusRequestIdSignal = computed(() => mutableFocusRequestId.value);
export const starfieldVisibleSignal = computed(() => mutableStarfieldVisible.value);
export const starfieldBrightnessSignal = computed(() => mutableStarfieldBrightness.value);
export const bodyLabelsVisibleSignal = computed(() => mutableBodyLabelsVisible.value);

export interface UiStoreSignals {
  readonly catalog: ReadonlySignal<NEACatalog | null>;
  readonly filterClass: ReadonlySignal<OrbitClass | null>;
  readonly searchQuery: ReadonlySignal<string>;
  readonly sortKey: ReadonlySignal<SortKey>;
  readonly selectedBody: ReadonlySignal<string | null>;
  readonly focusRequestId: ReadonlySignal<number>;
  readonly starfieldVisible: ReadonlySignal<boolean>;
  readonly starfieldBrightness: ReadonlySignal<number>;
  readonly bodyLabelsVisible: ReadonlySignal<boolean>;
}

export const uiStoreSignals: UiStoreSignals = {
  catalog: catalogSignal,
  filterClass: filterClassSignal,
  searchQuery: searchQuerySignal,
  sortKey: sortKeySignal,
  selectedBody: selectedBodySignal,
  focusRequestId: focusRequestIdSignal,
  starfieldVisible: starfieldVisibleSignal,
  starfieldBrightness: starfieldBrightnessSignal,
  bodyLabelsVisible: bodyLabelsVisibleSignal,
};

export function readCatalog(): NEACatalog | null {
  return mutableCatalog.value;
}

export function readFilterClass(): OrbitClass | null {
  return mutableFilterClass.value;
}

export function readSearchQuery(): string {
  return mutableSearchQuery.value;
}

export function readSortKey(): SortKey {
  return mutableSortKey.value;
}

export function readSelectedBody(): string | null {
  return mutableSelectedBody.value;
}

export function readFocusRequestId(): number {
  return mutableFocusRequestId.value;
}

export function readStarfieldVisible(): boolean {
  return mutableStarfieldVisible.value;
}

export function readStarfieldBrightness(): number {
  return mutableStarfieldBrightness.value;
}

export function readBodyLabelsVisible(): boolean {
  return mutableBodyLabelsVisible.value;
}

export function readLayoutMode(): LayoutMode {
  return layoutModeSignal.value;
}

export function setCatalog(catalog: NEACatalog | null): void {
  mutableCatalog.value = catalog;
}

export function setFilterClass(orbitClass: OrbitClass | null): void {
  mutableFilterClass.value = orbitClass;
}

export function setSearch(query: string): void {
  mutableSearchQuery.value = query;
}

export function setSort(sortKey: SortKey): void {
  mutableSortKey.value = sortKey;
}

export function selectBody(bodyId: string | null): void {
  mutableSelectedBody.value = bodyId;
}

export function requestFocus(): number {
  mutableFocusRequestId.value += 1;
  return mutableFocusRequestId.value;
}

export function setStarfieldVisible(visible: boolean): void {
  mutableStarfieldVisible.value = visible;
}

export function setStarfieldBrightness(brightness: number): void {
  if (!Number.isFinite(brightness)) {
    return;
  }
  mutableStarfieldBrightness.value = Math.min(1, Math.max(0, brightness));
}

export function setBodyLabelsVisible(visible: boolean): void {
  mutableBodyLabelsVisible.value = visible;
}

export function setLayoutMode(mode: LayoutMode): void {
  layoutModeSignal.value = mode;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_LAYOUT_MODE, mode);
    }
  } catch {
    // localStorage unavailable; in-memory only
  }
}

export function subscribeToFocusRequests(onRequest: (requestId: number) => void): () => void {
  let lastSeen = mutableFocusRequestId.value;
  return effect(() => {
    const nextRequestId = focusRequestIdSignal.value;
    if (nextRequestId === lastSeen) {
      return;
    }
    lastSeen = nextRequestId;
    onRequest(nextRequestId);
  });
}

export function subscribeToStarfieldDisplay(
  onChange: (display: { visible: boolean; brightness: number }) => void,
): () => void {
  return effect(() => {
    onChange({
      visible: starfieldVisibleSignal.value,
      brightness: starfieldBrightnessSignal.value,
    });
  });
}

export function subscribeToBodyLabelsVisible(onChange: (visible: boolean) => void): () => void {
  return effect(() => {
    onChange(bodyLabelsVisibleSignal.value);
  });
}
