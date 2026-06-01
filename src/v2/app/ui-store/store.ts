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
export const layoutModeSignal = signal<LayoutMode>(loadInitialLayoutMode());

export const catalogSignal = computed(() => mutableCatalog.value);
export const filterClassSignal = computed(() => mutableFilterClass.value);
export const searchQuerySignal = computed(() => mutableSearchQuery.value);
export const sortKeySignal = computed(() => mutableSortKey.value);
export const selectedBodySignal = computed(() => mutableSelectedBody.value);
export const focusRequestIdSignal = computed(() => mutableFocusRequestId.value);

export interface UiStoreSignals {
  readonly catalog: ReadonlySignal<NEACatalog | null>;
  readonly filterClass: ReadonlySignal<OrbitClass | null>;
  readonly searchQuery: ReadonlySignal<string>;
  readonly sortKey: ReadonlySignal<SortKey>;
  readonly selectedBody: ReadonlySignal<string | null>;
  readonly focusRequestId: ReadonlySignal<number>;
}

export const uiStoreSignals: UiStoreSignals = {
  catalog: catalogSignal,
  filterClass: filterClassSignal,
  searchQuery: searchQuerySignal,
  sortKey: sortKeySignal,
  selectedBody: selectedBodySignal,
  focusRequestId: focusRequestIdSignal,
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
