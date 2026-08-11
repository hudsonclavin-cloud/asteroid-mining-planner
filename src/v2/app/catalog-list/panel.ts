import { computed, signal } from '@preact/signals';
import { h, type VNode } from 'preact';
import {
  bodyLabelsVisibleSignal,
  catalogSignal,
  filterClassSignal,
  layoutModeSignal,
  searchQuerySignal,
  selectedBodySignal,
  setBodyLabelsVisible,
  setFilterClass,
  setLayoutMode,
  setSearch,
  setSort,
  setStarfieldBrightness,
  setStarfieldVisible,
  sortKeySignal,
  starfieldBrightnessSignal,
  starfieldVisibleSignal,
  type OrbitClass,
  type SortKey,
} from '../ui-store/index.js';
import {
  createLambertScreenIndex,
  loadLambertScreenCacheAsync,
} from '../../boundary/lambert-screen-cache.js';
import { renderEmpty, type EmptyReason } from './empty.js';
import {
  disclosureIntro,
  disclosureSections,
  FOOTER_CLICK_HINT,
  footerText,
  type ScreeningWindow,
} from './honesty-disclosure.js';
import { renderRow } from './row.js';
import { CATALOG_LIST_ROW_HEIGHT_PX, type CatalogListRowData } from './types.js';

export interface RenderPanelOptions {
  readonly onOpenPorkchop?: ((bodyId: string) => void) | undefined;
  readonly porkchopDisabled?: boolean | undefined;
}

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
const popoverOpenSignal = signal(false);
const screeningIndexSignal = signal<ReturnType<typeof createLambertScreenIndex> | null>(null);
const screeningWindowSignal = signal<ScreeningWindow | null>(null);
const ABOUT_ROUTE = '../about/';

// Module-scope fetch, deliberate: b6b7f92 moved the screening cache out
// of the bundle graph to fix a vite build OOM. Consequence — importing
// this module outside a browser fires a fetch against the root-relative
// '/lambert-screen-cache.json' and fails with ERR_INVALID_URL. That is
// expected in Node test harnesses and is not a defect; the failure is
// logged and swallowed. Do not convert this to a lazy or guarded load
// without re-checking the build memory footprint that b6b7f92 fixed.
loadLambertScreenCacheAsync()
  .then((cache) => {
    screeningIndexSignal.value = createLambertScreenIndex(cache);
    screeningWindowSignal.value = cache.metadata.screeningWindow;
  })
  .catch((error) => {
    console.error('Failed to load Lambert screen cache:', error);
  });

let scrollContainerEl: HTMLDivElement | null = null;
let resizeListenerInstalled = false;

function buildRowData(): CatalogListRowData[] {
  const catalog = catalogSignal.value;
  const screeningIndex = screeningIndexSignal.value;
  if (!catalog || !screeningIndex) {
    return [];
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
}

const allRowsSignal = computed(() => buildRowData());

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
  screeningWindowSignal.value;
  layoutModeSignal.value;
  selectedBodySignal.value;
  bodyLabelsVisibleSignal.value;
  starfieldBrightnessSignal.value;
  starfieldVisibleSignal.value;
  scrollTopSignal.value;
  viewportHeightSignal.value;
  popoverOpenSignal.value;
}

function renderFooter(): VNode {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // S-S17-FRONTB-BATCH-2026-08-11-A (B0 narrow-viewport): allow the
        // footer row to wrap. WRAP chosen over ellipsis: the "Loaded ..."
        // numbers are the footer's payload, and the hint span is already
        // built (inline-block + nowrap, see below) to move to its own row
        // whole — so wrapping keeps every glyph legible at the 320px clamp
        // floor, where ellipsis would eat the data.
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 16px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.3)',
        fontSize: '11px',
        color: '#888',
        cursor: 'pointer',
        fontFamily: 'system-ui, sans-serif',
        flexShrink: 0,
      },
      onClick: () => {
        popoverOpenSignal.value = true;
      },
      title: 'Click to view screen limitations',
    },
    h(
      'span',
      // minWidth: 0 lets this flex child actually shrink below its content
      // width, so the inner hint span's designed whole-row wrap can engage
      // instead of the label overflowing the panel (same B0 marker as above).
      { style: { minWidth: 0 } },
      h('span', { style: { fontWeight: 500, color: '#aaa' } }, footerText(screeningWindowSignal.value)),
      // L1 measurements (tools/overnight-2026-08-05/L1_FOOTER_LAYOUT.md): the
      // loaded label fits a 400px sidebar with 1.25px slack, and a RENDERED
      // leading space (+2.94px) wraps it. inline-block collapses the
      // text-level space at line start (textContent stays correct, width
      // unchanged); nowrap makes any wrap move the whole hint to its own row,
      // never splitting mid-text. No px value added or changed.
      h(
        'span',
        {
          style: {
            marginLeft: '8px',
            color: '#666',
            fontSize: '10px',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          },
        },
        ` · ${FOOTER_CLICK_HINT}`,
      ),
    ),
    h(
      'a',
      {
        href: ABOUT_ROUTE,
        onClick: (event: MouseEvent) => {
          event.stopPropagation();
        },
        style: {
          color: '#7dd3fc',
          textDecoration: 'none',
          flexShrink: 0,
        },
      },
      'About this tool',
    ),
  );
}

function renderPopover(): VNode {
  const sections = disclosureSections(screeningWindowSignal.value).map((section) =>
    h(
      'div',
      { key: section.title, style: { marginBottom: '16px' } },
      h(
        'div',
        {
          style: { fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '4px' },
        },
        section.title,
      ),
      h(
        'div',
        {
          style: { color: '#bbb', fontSize: '12px', lineHeight: '1.5' },
        },
        section.body,
      ),
    ),
  );

  return h(
    'div',
    {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      },
      onClick: (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
          popoverOpenSignal.value = false;
        }
      },
    },
    h(
      'div',
      {
        style: {
          background: 'rgba(25, 27, 33, 0.98)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '520px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        },
      },
      h(
        'button',
        {
          type: 'button',
          onClick: () => {
            popoverOpenSignal.value = false;
          },
          style: {
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
          },
          title: 'Close',
        },
        '×',
      ),
      h(
        'div',
        {
          style: {
            fontSize: '15px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '12px',
          },
        },
        'About this screen',
      ),
      h(
        'div',
        {
          style: {
            fontSize: '12px',
            color: '#bbb',
            lineHeight: '1.5',
            marginBottom: '20px',
          },
        },
        disclosureIntro(screeningWindowSignal.value),
      ),
      ...sections,
    ),
  );
}

export function renderPanel(options: RenderPanelOptions = {}): VNode {
  const catalog = catalogSignal.value;
  const screeningIndex = screeningIndexSignal.value;
  const filterClass = filterClassSignal.value;
  const searchQuery = searchQuerySignal.value;
  const sortKey = sortKeySignal.value;
  const layoutMode = layoutModeSignal.value;
  const bodyLabelsVisible = bodyLabelsVisibleSignal.value;
  const starfieldVisible = starfieldVisibleSignal.value;
  const starfieldBrightness = starfieldBrightnessSignal.value;
  const filteredRows = filteredRowsSignal.value;
  const popover = popoverOpenSignal.value ? renderPopover() : null;

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
          // S-S17-FRONTB-BATCH-2026-08-11-A (B0 narrow-viewport): 380px ->
          // clamp so the overlay stops overlapping the scene below ~950px.
          width: 'clamp(300px, 40vw, 380px)',
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
          // S-S17-FRONTB-BATCH-2026-08-11-A (B0 narrow-viewport): 400px ->
          // clamp so the sidebar yields at narrow widths instead of clipping.
          width: 'clamp(320px, 42vw, 400px)',
          height: '100vh',
          background: 'rgba(15, 17, 22, 0.98)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: '10',
          pointerEvents: 'auto',
        };

  let listContent: VNode;
  if (filteredRows.length === 0) {
    let reason: EmptyReason;
    if (screeningIndex === null) {
      reason = 'loading';
    } else if (catalog === null) {
      reason = 'no-data';
    } else {
      reason = 'no-matches';
    }
    listContent = renderEmpty(reason);
  } else {
    listContent = h(
          'div',
          {
            style: {
              height: `${totalHeight}px`,
              position: 'relative',
            },
          },
          ...visibleRows.map((row, index) =>
            renderRow(row, (startIdx + index) * CATALOG_LIST_ROW_HEIGHT_PX, {
              onOpenPorkchop: options.onOpenPorkchop,
              porkchopDisabled: options.porkchopDisabled,
            }),
          ),
        );
  }

  return h(
    'div',
    null,
    h(
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
          id: 'catalog-search',
          name: 'catalog-search',
          'aria-label': 'Search catalog by designation or name',
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
              marginBottom: '8px',
              padding: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '8px',
              },
            },
            h('span', { style: { color: '#888', fontSize: '11px' } }, 'Display'),
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  gap: '4px',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                },
              },
              h(
                'button',
                {
                  type: 'button',
                  onClick: () => setStarfieldVisible(!starfieldVisible),
                  style: {
                    padding: '3px 8px',
                    background: starfieldVisible ? 'rgba(100,140,220,0.4)' : 'rgba(255,255,255,0.05)',
                    color: starfieldVisible ? '#fff' : '#aaa',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  },
                },
                starfieldVisible ? 'Starfield on' : 'Starfield off',
              ),
              h(
                'button',
                {
                  type: 'button',
                  onClick: () => setBodyLabelsVisible(!bodyLabelsVisible),
                  style: {
                    padding: '3px 8px',
                    background: bodyLabelsVisible ? 'rgba(100,140,220,0.4)' : 'rgba(255,255,255,0.05)',
                    color: bodyLabelsVisible ? '#fff' : '#aaa',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  },
                },
                bodyLabelsVisible ? 'Labels on' : 'Labels off',
              ),
            ),
          ),
          h(
            'label',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: '8px',
                color: '#aaa',
                fontSize: '11px',
              },
            },
            h('span', null, 'Starfield brightness'),
            h('span', { style: { color: '#888', fontVariantNumeric: 'tabular-nums' } }, `${Math.round(starfieldBrightness * 100)}%`),
            h('input', {
              type: 'range',
              min: '0',
              max: '1',
              step: '0.05',
              value: String(starfieldBrightness),
              onInput: (event: Event) => setStarfieldBrightness(Number((event.target as HTMLInputElement).value)),
              style: {
                gridColumn: '1 / -1',
                width: '100%',
                cursor: 'pointer',
              },
            }),
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
      renderFooter(),
    ),
    popover,
  );
}
