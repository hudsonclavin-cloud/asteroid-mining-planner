import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../core/units.js';
import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';
import type { PorkchopGridParams } from './grid-compute.js';
import type { PorkchopClient } from './porkchop-client.js';
import type { PorkchopWorkerCell } from './porkchop.worker.js';
import { colorForPorkchopCell } from './colormap.js';

const HEATMAP_PIXEL_WIDTH = 200;
const HEATMAP_PIXEL_HEIGHT = 100;
const DISPLAY_WIDTH = 1000;
const DISPLAY_HEIGHT = 500;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FRAME_STYLE = [
  'display:flex',
  'flex-direction:column',
  'gap:16px',
  'padding:20px',
  'color:#eef2ff',
  'font-family:"SF Mono","Roboto Mono",monospace',
  'background:#05070d',
  'min-height:100%',
  'box-sizing:border-box',
].join(';');

const PANEL_STYLE = [
  'border:1px solid rgba(255,255,255,0.14)',
  'border-radius:12px',
  'background:rgba(255,255,255,0.03)',
  'padding:16px',
].join(';');

const CANVAS_STYLE = [
  'display:block',
  `width:${DISPLAY_WIDTH}px`,
  `height:${DISPLAY_HEIGHT}px`,
  'max-width:100%',
  'background:#0a0d14',
  'border:1px solid rgba(255,255,255,0.16)',
  'cursor:crosshair',
  'image-rendering:pixelated',
].join(';');

const LABEL_ROW_STYLE = [
  'display:flex',
  'justify-content:space-between',
  'gap:16px',
  'font-size:12px',
  'opacity:0.8',
].join(';');

export interface PorkchopViewProps {
  readonly client: PorkchopClient;
  readonly bodyId: string;
  readonly bodyLabel: string;
  readonly bodyElements: AsteroidOrbitalElements;
  readonly gridParams: PorkchopGridParams;
  readonly M: number;
  readonly validatedTarget?: {
    readonly depJD: number;
    readonly tofDays: number;
    readonly expectedC3: number;
  };
}

interface PinnedReadout {
  readonly cell: PorkchopWorkerCell;
  readonly selectedBranchLabel: string | null;
  readonly selectedBranchIndex: number | null;
  readonly c3: number | null;
  readonly vInfDep: number | null;
  readonly vInfArr: number | null;
}

function jdTdbToDateParts(jdTdb: number): { year: number; monthIndex: number; day: number } {
  const shiftedJulianDay = jdTdb + 0.5;
  const z = Math.floor(shiftedJulianDay);
  const fractionalDay = shiftedJulianDay - z;
  let a = z;
  if (z >= 2_299_161) {
    const alpha = Math.floor((z - 1_867_216.25) / 36_524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1_524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const exactDay = b - d - Math.floor(30.6001 * e) + fractionalDay;
  const day = Math.floor(exactDay);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4_716 : c - 4_715;
  return { year, monthIndex: month - 1, day };
}

function formatJdTdb(jdTdb: number): string {
  const { year, monthIndex, day } = jdTdbToDateParts(jdTdb);
  return `${year} ${MONTH_LABELS[monthIndex]} ${String(day).padStart(2, '0')}`;
}

function formatNumber(value: number, digits: number): string {
  return value.toFixed(digits);
}

function getCellAtGridIndices(
  depIndex: number,
  tofIndex: number,
  cells: readonly PorkchopWorkerCell[],
  gridParams: PorkchopGridParams,
): PorkchopWorkerCell | null {
  if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
    return null;
  }
  return cells[depIndex * gridParams.nTof + tofIndex] ?? null;
}

function getCellAtCoordinates(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  cells: readonly PorkchopWorkerCell[],
  gridParams: PorkchopGridParams,
): PorkchopWorkerCell | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }
  const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width - 1);
  const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height - 1);
  const depIndex = Math.min(
    gridParams.nDep - 1,
    Math.floor((x / rect.width) * gridParams.nDep),
  );
  const rowFromTop = Math.min(
    gridParams.nTof - 1,
    Math.floor((y / rect.height) * gridParams.nTof),
  );
  const tofIndex = gridParams.nTof - 1 - rowFromTop;
  return getCellAtGridIndices(depIndex, tofIndex, cells, gridParams);
}

function getNearestCellForTarget(
  targetDepJD: number,
  targetTofDays: number,
  cells: readonly PorkchopWorkerCell[],
  gridParams: PorkchopGridParams,
): PorkchopWorkerCell | null {
  const depStep = gridParams.nDep <= 1
    ? 0
    : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
  const tofStep = gridParams.nTof <= 1
    ? 0
    : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
  const depIndex = depStep === 0
    ? 0
    : Math.min(
        gridParams.nDep - 1,
        Math.max(0, Math.round((targetDepJD - gridParams.depStartJD) / depStep)),
      );
  const tofIndex = tofStep === 0
    ? 0
    : Math.min(
        gridParams.nTof - 1,
        Math.max(0, Math.round((targetTofDays - gridParams.tofMinDays) / tofStep)),
      );
  return getCellAtGridIndices(depIndex, tofIndex, cells, gridParams);
}

function buildPinnedReadout(cell: PorkchopWorkerCell): PinnedReadout {
  if (cell.status !== 'ok' || cell.selectedBranch === null) {
    return {
      cell,
      selectedBranchLabel: null,
      selectedBranchIndex: cell.selectedBranch,
      c3: null,
      vInfDep: null,
      vInfArr: null,
    };
  }

  const branch = cell.branches[cell.selectedBranch];
  return {
    cell,
    selectedBranchLabel: branch?.branch ?? null,
    selectedBranchIndex: cell.selectedBranch,
    c3: branch?.c3 ?? null,
    vInfDep: branch?.vInfDep ?? null,
    vInfArr: branch?.vInfArr ?? null,
  };
}

export function PorkchopView(props: PorkchopViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cells, setCells] = useState<readonly PorkchopWorkerCell[] | null>(null);
  const [computeMs, setComputeMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedCell, setPinnedCell] = useState<PorkchopWorkerCell | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPinnedCell(null);
    void props.client.computeGrid({
      bodyId: props.bodyId,
      bodyElements: props.bodyElements,
      gridParams: props.gridParams,
      M: props.M,
    }).then((result) => {
      if (cancelled) {
        return;
      }
      setCells(result.cells);
      setComputeMs(result.compute_ms);
      setLoading(false);
    }).catch((nextError: Error) => {
      if (cancelled) {
        return;
      }
      setError(nextError.message);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [props.client, props.bodyId, props.bodyElements, props.gridParams, props.M]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cells === null) {
      return;
    }

    canvas.width = DISPLAY_WIDTH;
    canvas.height = DISPLAY_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = HEATMAP_PIXEL_WIDTH;
    offscreen.height = HEATMAP_PIXEL_HEIGHT;
    const offscreenContext = offscreen.getContext('2d');
    if (!offscreenContext) {
      return;
    }

    const image = offscreenContext.createImageData(HEATMAP_PIXEL_WIDTH, HEATMAP_PIXEL_HEIGHT);

    for (let depIndex = 0; depIndex < props.gridParams.nDep; depIndex += 1) {
      for (let tofIndex = 0; tofIndex < props.gridParams.nTof; tofIndex += 1) {
        const cell = cells[depIndex * props.gridParams.nTof + tofIndex];
        const selectedBranch = cell.selectedBranch === null ? null : cell.branches[cell.selectedBranch];
        const rgb = colorForPorkchopCell(cell.status, selectedBranch?.c3 ?? null);
        const rowFromTop = props.gridParams.nTof - 1 - tofIndex;
        const pixelOffset = (rowFromTop * HEATMAP_PIXEL_WIDTH + depIndex) * 4;
        image.data[pixelOffset] = rgb[0];
        image.data[pixelOffset + 1] = rgb[1];
        image.data[pixelOffset + 2] = rgb[2];
        image.data[pixelOffset + 3] = 255;
      }
    }

    offscreenContext.putImageData(image, 0, 0);
    context.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    context.imageSmoothingEnabled = false;
    context.drawImage(offscreen, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
  }, [cells, props.gridParams]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cells === null) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const cell = getCellAtCoordinates(event, canvas, cells, props.gridParams);
      if (cell !== null) {
        setPinnedCell(cell);
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [cells, props.gridParams]);

  useEffect(() => {
    if (cells === null || props.validatedTarget === undefined) {
      return;
    }
    const cell = getNearestCellForTarget(
      props.validatedTarget.depJD,
      props.validatedTarget.tofDays,
      cells,
      props.gridParams,
    );
    if (cell !== null) {
      setPinnedCell(cell);
    }
  }, [cells, props.gridParams, props.validatedTarget]);

  const pinnedReadout = useMemo(
    () => (pinnedCell === null ? null : buildPinnedReadout(pinnedCell)),
    [pinnedCell],
  );

  const depEndLabel = formatJdTdb(props.gridParams.depEndJD);
  const depStartLabel = formatJdTdb(props.gridParams.depStartJD);
  const tofMinLabel = `${formatNumber(props.gridParams.tofMinDays, 1)} d`;
  const tofMaxLabel = `${formatNumber(props.gridParams.tofMaxDays, 1)} d`;
  const hasValidatedTarget = props.validatedTarget !== undefined;

  return h(
    'div',
    { style: FRAME_STYLE },
    h(
      'div',
      { style: PANEL_STYLE },
      h('div', { style: 'font-size:20px;font-weight:600;margin-bottom:8px;' }, `${props.bodyLabel} — M=${props.M}`),
      h(
        'div',
        { style: 'font-size:13px;opacity:0.85;line-height:1.5;' },
        'Standalone Phase B smoke mount. X axis: departure date (early → late). Y axis: TOF days (short bottom → long top). ',
        computeMs === null ? '' : `worker compute ${formatNumber(computeMs, 1)} ms.`,
      ),
      hasValidatedTarget
        ? h(
            'button',
            {
              type: 'button',
              style: 'margin-top:12px;padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:#172033;color:#eef2ff;font:inherit;cursor:pointer;',
              onClick: () => {
                if (cells === null || props.validatedTarget === undefined) {
                  return;
                }
                const cell = getNearestCellForTarget(
                  props.validatedTarget.depJD,
                  props.validatedTarget.tofDays,
                  cells,
                  props.gridParams,
                );
                if (cell !== null) {
                  setPinnedCell(cell);
                }
              },
            },
            'Pin validated cell',
          )
        : null,
    ),
    h(
      'div',
      { style: PANEL_STYLE },
      loading
        ? h('div', { style: 'font-size:15px;padding:18px 0;' }, 'Loading screening data…')
        : error !== null
          ? h('div', { style: 'font-size:15px;color:#ff8ba7;padding:18px 0;' }, error)
          : h(
              'div',
              { style: 'display:flex;flex-direction:column;gap:10px;' },
              h(
                'div',
                { style: LABEL_ROW_STYLE },
                h('span', null, `TOF ↑ ${tofMaxLabel}`),
                h('span', null, `${depStartLabel} → ${depEndLabel}`),
              ),
              h('canvas', {
                ref: canvasRef,
                width: DISPLAY_WIDTH,
                height: DISPLAY_HEIGHT,
                style: CANVAS_STYLE,
              }),
              h(
                'div',
                { style: LABEL_ROW_STYLE },
                h('span', null, `TOF ↓ ${tofMinLabel}`),
                h('span', null, 'viridis, linear 0 → 30 km²/s²; >30 clamped'),
              ),
            ),
    ),
    h(
      'div',
      { style: PANEL_STYLE },
      h('div', { style: 'font-size:15px;font-weight:600;margin-bottom:10px;' }, 'Pinned cell'),
      pinnedReadout === null
        ? h('div', { style: 'font-size:13px;opacity:0.75;' }, 'Click a cell to pin departure/arrival values.')
        : h(
            'div',
            { style: 'display:grid;grid-template-columns:max-content 1fr;gap:8px 14px;font-size:13px;line-height:1.5;' },
            h('span', null, 'Status'),
            h('span', null, pinnedReadout.cell.status),
            h('span', null, 'Departure'),
            h('span', null, formatJdTdb(pinnedReadout.cell.depJD)),
            h('span', null, 'Arrival'),
            h('span', null, formatJdTdb(pinnedReadout.cell.depJD + pinnedReadout.cell.tofDays)),
            h('span', null, 'TOF'),
            h('span', null, `${formatNumber(pinnedReadout.cell.tofDays, 3)} d`),
            h('span', null, 'M'),
            h('span', null, String(pinnedReadout.cell.M)),
            h('span', null, 'Branch'),
            h('span', null, pinnedReadout.selectedBranchLabel ?? 'n/a'),
            h('span', null, 'Branch index'),
            h('span', null, pinnedReadout.selectedBranchIndex === null ? 'n/a' : String(pinnedReadout.selectedBranchIndex)),
            h('span', null, 'C3'),
            h('span', null, pinnedReadout.c3 === null ? 'n/a' : `${formatNumber(pinnedReadout.c3, 6)} km²/s²`),
            props.validatedTarget === undefined
              ? null
              : [
                  h('span', { key: 'expected-c3-label' }, 'Expected C3'),
                  h('span', { key: 'expected-c3-value' }, `${formatNumber(props.validatedTarget.expectedC3, 2)} km²/s²`),
                ],
            h('span', null, 'v∞ dep'),
            h('span', null, pinnedReadout.vInfDep === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfDep, 6)} km/s`),
            h('span', null, 'v∞ arr'),
            h('span', null, pinnedReadout.vInfArr === null ? 'n/a' : `${formatNumber(pinnedReadout.vInfArr, 6)} km/s`),
          ),
    ),
  );
}
