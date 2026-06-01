import { computed, signal } from '@preact/signals';
import { h, type VNode } from 'preact';
import {
  catalogSignal,
  filterClassSignal,
  layoutModeSignal,
  searchQuerySignal,
  selectedBodySignal,
  setFilterClass,
  setLayoutMode,
  setSearch,
  setSort,
  sortKeySignal,
  type OrbitClass,
  type SortKey,
} from '../ui-store/index.js';
import {
  createLambertScreenIndex,
  loadLambertScreenCache,
} from '../../boundary/lambert-screen-cache.js';
import { renderEmpty } from './empty.js';
import { renderRow } from './row.js';
import { CATALOG_LIST_ROW_HEIGHT_PX, type CatalogListRowData } from './types.js';

const screeningCache = loadLambertScreenCache();
const screeningIndex = createLambertScreenIndex(screeningCache);

const ORBIT_CLASSES: ReadonlyArray<'ALL' | OrbitClass> = ['ALL', 'ATE', 'APO', 'AMO', 'IEO'];
const SORT_OPTIONS: ReadonlyArray<{ key: SortKey; label: string }> = [
  { key: 'designation-asc', label: 'A-Z' },
  { key: 'designation-desc', label: 'Z-A' },
  { key: 'class-asc', label: 'Class' },
  { key: 'absolute-magnitude-asc', label: 'H ↑' },
  { key: 'absolute-magnitude-desc', label: 'H ↓' },
];

const scrollTopSignal = signal(0);
const viewportHeightSignal = signal(600);

let scrollContainerEl: HTMLDivElement | null = null;
let resizeListenerInstalled = false;

const allRowsSignal = computed(() => {
  const catalog = catalogSignal.value;
  if (!catalog) {
    return [] as CatalogListRowData[];
  }

  const rows: CatalogListRowData[] = [];
  for (const body of Object.values(catalog.asteroids)) {
    const screen = screeningIndex.byBodyId.get(body.bodyId);
    if (!screen) {
      continue;
    }
    rows.push({
      bodyId: body.bodyId,
      spkId: body.spkId,
      designation: body.designation,
      name: body.name ?? '',
      orbitClass: body.orbitClass,
      H: typeof body.H === 'number' ? body.H : null,
      screen,
    });
  }
  return rows;
});

const filteredRowsSignal = computed(() => {
  const filterClass = filterClassSignal.value;
  const searchQuery = searchQuerySignal.value.trim().toLowerCase();
  const sortKey = sortKeySignal.value;

  let rows = allRowsSignal.value;
  if (filterClass !== null) {
    rows = rows.filter((row) => row.orbitClass === filterClass);
  }

  if (searchQuery.length > 0) {
    rows = rows.filter(
      (row) =>
        row.designation.toLowerCase().includes(searchQuery) ||
        row.name.toLowerCase().includes(searchQuery),
    );
  }

  const sorted = [...rows];
  switch (sortKey) {
    case 'designation-desc':
      sorted.sort((a, b) => b.designation.localeCompare(a.designation));
      break;
    case 'class-asc':
      sorted.sort((a, b) => {
        const classCompare = a.orbitClass.localeCompare(b.orbitClass);
        return classCompare !== 0 ? classCompare : a.designation.localeCompare(b.designation);
      });
      break;
    case 'absolute-magnitude-asc':
      sorted.sort((a, b) => (a.H ?? Infinity) - (b.H ?? Infinity));
      break;
    case 'absolute-magnitude-desc':
      sorted.sort((a, b) => (b.H ?? -Infinity) - (a.H ?? -Infinity));
      break;
    case 'designation-asc':
    default:
      sorted.sort((a, b) => a.designation.localeCompare(b.designation));
      break;
  }

  return sorted;
});

function updateViewportHeight(): void {
  if (!scrollContainerEl) {
    return;
  }
  const nextHeight = Math.max(0, scrollContainerEl.clientHeight);
  if (viewportHeightSignal.value !== nextHeight) {
    viewportHeightSignal.value = nextHeight;
  }
}

function handleResize(): void {
  updateViewportHeight();
}

function handleScroll(): void {
  if (!scrollContainerEl) {
    return;
  }
  const nextScrollTop = scrollContainerEl.scrollTop;
  if (scrollTopSignal.value !== nextScrollTop) {
    scrollTopSignal.value = nextScrollTop;
  }
}

function attachScrollContainer(el: HTMLDivElement | null): void {
  if (scrollContainerEl === el) {
    updateViewportHeight();
    return;
  }

  if (scrollContainerEl) {
    scrollContainerEl.removeEventListener('scroll', handleScroll);
  }

  scrollContainerEl = el;
  if (!el) {
    return;
  }

  el.addEventListener('scroll', handleScroll, { passive: true });
  updateViewportHeight();

  if (
    !resizeListenerInstalled &&
    typeof window !== 'undefined' &&
    typeof window.addEventListener === 'function'
  ) {
    window.addEventListener('resize', handleResize);
    resizeListenerInstalled = true;
  }
}

export function disposePanel(): void {
  if (scrollContainerEl) {
    scrollContainerEl.removeEventListener('scroll', handleScroll);
    scrollContainerEl = null;
  }
  if (
    resizeListenerInstalled &&
    typeof window !== 'undefined' &&
    typeof window.removeEventListener === 'function'
  ) {
    window.removeEventListener('resize', handleResize);
    resizeListenerInstalled = false;
  }
}

export function trackPanelSignals(): void {
  filteredRowsSignal.value;
  layoutModeSignal.value;
  selectedBodySignal.value;
  scrollTopSignal.value;
  viewportHeightSignal.value;
}

export function renderPanel(): VNode {
  const catalog = catalogSignal.value;
  const filterClass = filterClassSignal.value;
  const searchQuery = searchQuerySignal.value;
  const sortKey = sortKeySignal.value;
  const layoutMode = layoutModeSignal.value;
  const filteredRows = filteredRowsSignal.value;

  const totalHeight = filteredRows.length * CATALOG_LIST_ROW_HEIGHT_PX;
  const maxScrollTop = Math.max(0, totalHeight - viewportHeightSignal.value);
  const effectiveScrollTop = Math.min(scrollTopSignal.value, maxScrollTop);
  const rowBuffer = 6;
  const startIdx = Math.max(0, Math.floor(effectiveScrollTop / CATALOG_LIST_ROW_HEIGHT_PX) - rowBuffer);
  const endIdx = Math.min(
    filteredRows.length,
    Math.ceil((effectiveScrollTop + viewportHeightSignal.value) / CATALOG_LIST_ROW_HEIGHT_PX) +
      rowBuffer,
  );
  const visibleRows = filteredRows.slice(startIdx, endIdx);

  const panelStyle =
    layoutMode === 'overlay'
      ? {
          position: 'absolute',
          top: '16px',
          left: '16px',
          width: '380px',
          height: 'calc(100vh - 32px)',
          background: 'rgba(20, 22, 28, 0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: '10',
          pointerEvents: 'auto',
        }
      : {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '400px',
          height: '100vh',
          background: 'rgba(15, 17, 22, 0.98)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: '10',
          pointerEvents: 'auto',
        };

  const listContent =
    filteredRows.length === 0
      ? catalog === null
        ? renderEmpty('no-data')
        : renderEmpty('no-matches')
      : h(
          'div',
          {
            style: {
              height: `${totalHeight}px`,
              position: 'relative',
            },
          },
          ...visibleRows.map((row, index) =>
            renderRow(row, (startIdx + index) * CATALOG_LIST_ROW_HEIGHT_PX),
          ),
        );

  return h(
    'section',
    {
      style: panelStyle,
    },
    h(
      'div',
      {
        style: {
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          },
        },
        h(
          'span',
          {
            style: {
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
            },
          },
          `NEA Catalog (${filteredRows.length.toLocaleString()})`,
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: () => setLayoutMode(layoutMode === 'overlay' ? 'sidebar' : 'overlay'),
            title: layoutMode === 'overlay' ? 'Switch to sidebar' : 'Switch to overlay',
            style: {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#bbb',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
            },
          },
          layoutMode === 'overlay' ? 'sidebar' : 'overlay',
        ),
      ),
      h('input', {
        type: 'text',
        placeholder: 'Search designation or name…',
        value: searchQuery,
        onInput: (event: Event) => setSearch((event.target as HTMLInputElement).value),
        style: {
          width: '100%',
          boxSizing: 'border-box',
          padding: '6px 10px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '13px',
          fontFamily: 'inherit',
          marginBottom: '8px',
        },
      }),
      h(
        'div',
        {
          style: {
            display: 'flex',
            gap: '4px',
            marginBottom: '8px',
            flexWrap: 'wrap',
          },
        },
        ...ORBIT_CLASSES.map((orbitClass) =>
          h(
            'button',
            {
              key: orbitClass,
              type: 'button',
              onClick: () => setFilterClass(orbitClass === 'ALL' ? null : orbitClass),
              style: {
                padding: '3px 8px',
                background:
                  (filterClass ?? 'ALL') === orbitClass
                    ? 'rgba(100,140,220,0.4)'
                    : 'rgba(255,255,255,0.05)',
                color: (filterClass ?? 'ALL') === orbitClass ? '#fff' : '#aaa',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
              },
            },
            orbitClass,
          ),
        ),
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          },
        },
        h('span', { style: { color: '#888', fontSize: '11px' } }, 'Sort:'),
        ...SORT_OPTIONS.map((option) =>
          h(
            'button',
            {
              key: option.key,
              type: 'button',
              onClick: () => setSort(option.key),
              style: {
                padding: '2px 6px',
                background:
                  sortKey === option.key ? 'rgba(100,140,220,0.4)' : 'transparent',
                color: sortKey === option.key ? '#fff' : '#aaa',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
              },
            },
            option.label,
          ),
        ),
      ),
    ),
    h(
      'div',
      {
        ref: (el: HTMLDivElement | null) => attachScrollContainer(el),
        style: {
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
        },
      },
      listContent,
    ),
  );
}
