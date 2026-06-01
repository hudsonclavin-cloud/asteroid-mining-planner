import { h, type VNode } from 'preact';
import { requestFocus, selectBody, selectedBodySignal } from '../ui-store/index.js';
import { CATALOG_LIST_ROW_HEIGHT_PX, type CatalogListRowData } from './types.js';

function statusBadgeText(status: string): string {
  switch (status) {
    case 'low_departure_c3':
      return 'low C3';
    case 'high_departure_c3':
      return 'high C3';
    case 'lambert_unconvergeable':
      return 'unconv.';
    case 'propagator_failed':
      return 'prop fail';
    default:
      return status;
  }
}

function statusBadgeColor(status: string): string {
  switch (status) {
    case 'low_departure_c3':
      return '#3a8d4a';
    case 'high_departure_c3':
      return '#666';
    case 'lambert_unconvergeable':
      return '#9a4a4a';
    case 'propagator_failed':
      return '#7a3a7a';
    default:
      return '#555';
  }
}

function formatC3(c3: number | null): string {
  if (c3 === null) {
    return '—';
  }
  if (c3 < 0.01) {
    return c3.toExponential(2);
  }
  if (c3 < 10) {
    return c3.toFixed(3);
  }
  return c3.toFixed(1);
}

export function renderRow(data: CatalogListRowData, topPx: number): VNode {
  const isSelected = selectedBodySignal.value === data.bodyId;

  return h(
    'button',
    {
      key: data.bodyId,
      type: 'button',
      class: `catalog-list-row${isSelected ? ' catalog-list-row--selected' : ''}`,
      style: {
        position: 'absolute',
        top: `${topPx}px`,
        left: 0,
        right: 0,
        height: `${CATALOG_LIST_ROW_HEIGHT_PX}px`,
        padding: '8px 12px',
        cursor: 'pointer',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: isSelected ? 'rgba(80,120,200,0.25)' : 'transparent',
        color: '#ddd',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxSizing: 'border-box',
        textAlign: 'left',
        width: '100%',
      },
      onClick: () => {
        selectBody(data.bodyId);
        requestFocus();
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        },
      },
      h(
        'span',
        {
          style: {
            fontWeight: 600,
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          },
        },
        data.name || data.designation,
      ),
      h(
        'span',
        {
          style: {
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '3px',
            background: statusBadgeColor(data.screen.status),
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            flexShrink: 0,
          },
        },
        statusBadgeText(data.screen.status),
      ),
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          color: '#aaa',
          fontSize: '11px',
        },
      },
      h('span', null, `${data.orbitClass}${data.screen.isCoOrbital ? ' · co-orbital' : ''}`),
      h('span', null, `C3 ${formatC3(data.screen.minC3)} km²/s²`),
    ),
  );
}
