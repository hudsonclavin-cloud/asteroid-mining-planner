import { h, type VNode } from 'preact';
import { formatC3 } from '../../porkchop/format-c3.js';
import { requestFocus, selectBody, selectedBodySignal } from '../ui-store/index.js';
import { CATALOG_LIST_ROW_HEIGHT_PX, type CatalogListRowData } from './types.js';

export interface CatalogRowRenderOptions {
  readonly onOpenPorkchop?: ((bodyId: string) => void) | undefined;
  readonly porkchopDisabled?: boolean | undefined;
}

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

function tierBadgeColor(tier: string): string {
  return tier === 'L0' ? '#9a4a4a' : tier === 'L1' ? '#9a7a3a' : '#4f6680';
}

/**
 * S18 Item 3: an L0 body does not exist (verified impact / disintegration) or
 * cannot be propagated, so a LOW C3 / HIGH C3 badge would grade a transfer
 * that cannot happen. Only the two QUALITY statuses are suppressed; 'prop
 * fail' and 'unconv.' are not quality claims and stay. Non-L0 rows untouched.
 */
function isSuppressedQualityBadge(data: CatalogListRowData): boolean {
  return (
    data.tier.tier === 'L0' &&
    (data.screen.status === 'low_departure_c3' || data.screen.status === 'high_departure_c3')
  );
}

/** Visible context for an L0 row's numeric C3 (S18 Item 3). */
export const L0_C3_CONTEXT = 'computed from the last known orbit';
const L0_C3_TITLE =
  'Computed from the last known orbit. This object is tier L0, so the value is not a screening-quality signal.';

export function renderRow(
  data: CatalogListRowData,
  topPx: number,
  options: CatalogRowRenderOptions = {},
): VNode {
  const isSelected = selectedBodySignal.value === data.bodyId;
  const showPorkchopAffordance = typeof options.onOpenPorkchop === 'function';
  const affordanceDisabled = options.porkchopDisabled === true;
  // S18 Item 3: keep the number (a real two-body result) but read it as context,
  // not as a grade. A null C3 already renders '—' and needs no context.
  const deEmphasizeC3 = data.tier.tier === 'L0' && data.screen.minC3 !== null;

  return h(
    'div',
    {
      key: data.bodyId,
      style: {
        position: 'absolute',
        top: `${topPx}px`,
        left: 0,
        right: 0,
        height: `${CATALOG_LIST_ROW_HEIGHT_PX}px`,
        width: '100%',
        boxSizing: 'border-box',
      },
    },
    h(
      'button',
      {
        type: 'button',
        class: `catalog-list-row${isSelected ? ' catalog-list-row--selected' : ''}`,
        style: {
          position: 'absolute',
          inset: 0,
          padding: showPorkchopAffordance ? '8px 56px 8px 12px' : '8px 12px',
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
          if (data.tier.subReason === 'cannot-propagate-hyperbolic-orbit') {
            return;
          }
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
        isSuppressedQualityBadge(data)
          ? null
          : h(
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
        h('span', {
          style: {
            fontSize: '10px', padding: '2px 6px', borderRadius: '3px',
            background: tierBadgeColor(data.tier.tier), color: '#fff',
            letterSpacing: '0.5px', flexShrink: 0,
          },
          title: data.tier.subReason,
        }, data.tier.tier),
      ),
      deEmphasizeC3
        ? h(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                marginTop: '4px',
                color: '#aaa',
                fontSize: '11px',
              },
            },
            h('span', { style: { flexShrink: 0 } }, `${data.orbitClass}${data.screen.isCoOrbital ? ' · co-orbital' : ''}`),
            // Ellipsis-protected so a narrow sidebar never wraps the fixed-height
            // row; the tooltip carries the full sentence.
            h(
              'span',
              {
                style: {
                  opacity: 0.55,
                  fontStyle: 'italic',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                },
                title: L0_C3_TITLE,
              },
              `C3 ${formatC3(data.screen.minC3)} km²/s² · ${L0_C3_CONTEXT}`,
            ),
          )
        : h(
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
    ),
    showPorkchopAffordance
      ? h(
          'button',
          {
            type: 'button',
            disabled: affordanceDisabled,
            title: affordanceDisabled ? 'Porkchop busy' : 'Open porkchop view',
            'aria-label': 'Open porkchop view',
            style: {
              position: 'absolute',
              top: '50%',
              right: '12px',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.16)',
              background: affordanceDisabled ? 'rgba(255,255,255,0.04)' : 'rgba(90,130,220,0.22)',
              color: affordanceDisabled ? '#667085' : '#dbe7ff',
              cursor: affordanceDisabled ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              lineHeight: 1,
              pointerEvents: 'auto',
            },
            onClick: (event: MouseEvent) => {
              event.stopPropagation();
              event.preventDefault();
              if (affordanceDisabled) {
                return;
              }
              options.onOpenPorkchop?.(data.bodyId);
            },
          },
          'PC',
        )
      : null,
  );
}
