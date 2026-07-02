import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../core/units.js';
import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';
import {
  CAPE_CANAVERAL,
  classifyFeasibility,
  type FeasibilityClass,
  type LaunchSite,
} from '../core/lambert/feasibility.js';
import type { PorkchopGridParams } from './grid-compute.js';
import type { PorkchopClient } from './porkchop-client.js';
import type { PorkchopWorkerCell } from './porkchop.worker.js';
import { C3_COLOR_MAX, C3_COLOR_MIN, colorForPorkchopCell } from './colormap.js';

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

const LEGEND_STACK_STYLE = [
  'display:flex',
  'flex-direction:column',
  'align-items:flex-end',
  'gap:6px',
  'min-width:280px',
].join(';');

const LEGEND_BAR_STYLE = [
  'width:280px',
  'height:14px',
  'border-radius:999px',
  'border:1px solid rgba(255,255,255,0.16)',
  'overflow:hidden',
].join(';');

const LEGEND_TICKS_STYLE = [
  'display:flex',
  'justify-content:space-between',
  'gap:12px',
  'width:280px',
  'font-size:11px',
  'opacity:0.84',
].join(';');

const CANVAS_STAGE_STYLE = [
  'position:relative',
  `width:${DISPLAY_WIDTH}px`,
  'max-width:100%',
].join(';');

const TOOLTIP_STYLE = [
  'position:absolute',
  'pointer-events:none',
  'min-width:180px',
  'padding:10px 12px',
  'border-radius:10px',
  'border:1px solid rgba(255,255,255,0.14)',
  'background:rgba(5,7,13,0.94)',
  'box-shadow:0 14px 30px rgba(0,0,0,0.28)',
  'font-size:12px',
  'line-height:1.45',
  'color:#eef2ff',
  'z-index:2',
].join(';');

const FEASIBILITY_BADGE_STYLE: Record<Exclude<FeasibilityClass, null>, string> = {
  GREEN: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;background:#22c55e;color:#04130a;font-size:11px;font-weight:700;',
  AMBER: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;background:#f59e0b;color:#170f02;font-size:11px;font-weight:700;',
  RED: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;background:#ef4444;color:#1f0505;font-size:11px;font-weight:700;',
};

const FEASIBILITY_BADGE_LABEL: Record<Exclude<FeasibilityClass, null>, string> = {
  GREEN: 'Direct',
  AMBER: 'Penalized',
  RED: 'Dogleg req.',
};

export interface PorkchopViewProps {
  readonly client: PorkchopClient;
  readonly bodyId: string;
  readonly bodyLabel: string;
  readonly bodyElements: AsteroidOrbitalElements;
  readonly gridParams: PorkchopGridParams;
  readonly M: number;
  readonly onPinnedCellChange?: ((readout: PorkchopPinnedReadout | null) => void) | undefined;
  readonly showDlaOverlayControl?: boolean | undefined;
  readonly showDlaContours?: boolean | undefined;
  readonly launchSite?: LaunchSite | undefined;
  readonly validatedTarget?: {
    readonly depJD: number;
    readonly tofDays: number;
    readonly expectedC3: number;
  };
}

export interface PorkchopPinnedReadout {
  readonly status: PorkchopWorkerCell['status'];
  readonly depJD: number;
  readonly arrivalJD: number;
  readonly tofDays: number;
  readonly M: number;
  readonly selectedBranchLabel: string | null;
  readonly selectedBranchIndex: number | null;
  readonly c3: number | null;
  readonly vInfDep: number | null;
  readonly vInfArr: number | null;
  readonly dlaDeg: number | null;
  readonly feasibility: FeasibilityClass;
}

interface HoverTooltipPosition {
  readonly x: number;
  readonly y: number;
}

interface GridIndices {
  readonly depIndex: number;
  readonly tofIndex: number;
}

interface ContourSegment {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly strokeStyle: string;
}

interface ContourLevel {
  readonly value: number;
  readonly strokeStyle: string;
}

const C3_CONTOUR_LEVELS: readonly ContourLevel[] = [
  { value: 10, strokeStyle: 'rgba(255,255,255,0.72)' },
  { value: 30, strokeStyle: 'rgba(255,255,255,0.72)' },
  { value: 100, strokeStyle: 'rgba(255,255,255,0.72)' },
  { value: 300, strokeStyle: 'rgba(255,255,255,0.72)' },
];

function buildDlaContourLevels(site: LaunchSite): readonly ContourLevel[] {
  // Band edges per AMD-12-1: green = GREEN/AMBER boundary (iMinDeg), red = AMBER/RED
  // boundary (dlaCeilingDeg). NOT latitude / raw iMax — see SLICE_12_FOUNDING.md AMD-12-1.
  return [
    { value: site.iMinDeg, strokeStyle: '#22c55e' },
    { value: site.dlaCeilingDeg, strokeStyle: '#ef4444' },
  ];
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

function rgbToCss(rgb: readonly [number, number, number]): string {
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
}

function buildLegendGradient(): string {
  const stops: string[] = [];
  const sampleCount = 12;
  for (let index = 0; index <= sampleCount; index += 1) {
    const fraction = index / sampleCount;
    const c3 = Math.exp(
      Math.log(C3_COLOR_MIN) + fraction * (Math.log(C3_COLOR_MAX) - Math.log(C3_COLOR_MIN)),
    );
    const rgb = colorForPorkchopCell('ok', c3);
    stops.push(`${rgbToCss(rgb)} ${formatNumber(fraction * 100, 2)}%`);
  }
  return `linear-gradient(90deg, ${stops.join(', ')})`;
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

function buildPinnedReadout(cell: PorkchopWorkerCell, launchSite: LaunchSite): PorkchopPinnedReadout {
  if (cell.status !== 'ok' || cell.selectedBranch === null) {
    return {
      status: cell.status,
      depJD: cell.depJD,
      arrivalJD: cell.depJD + cell.tofDays,
      tofDays: cell.tofDays,
      M: cell.M,
      selectedBranchLabel: null,
      selectedBranchIndex: cell.selectedBranch,
      c3: null,
      vInfDep: null,
      vInfArr: null,
      dlaDeg: null,
      feasibility: null,
    };
  }

  const branch = cell.branches[cell.selectedBranch];
  const dlaDeg = branch?.dlaDeg ?? null;
  return {
    status: cell.status,
    depJD: cell.depJD,
    arrivalJD: cell.depJD + cell.tofDays,
    tofDays: cell.tofDays,
    M: cell.M,
    selectedBranchLabel: branch?.branch ?? null,
    selectedBranchIndex: cell.selectedBranch,
    c3: branch?.c3 ?? null,
    vInfDep: branch?.vInfDep ?? null,
    vInfArr: branch?.vInfArr ?? null,
    dlaDeg,
    feasibility: classifyFeasibility(dlaDeg, launchSite),
  };
}

function renderFeasibilityBadge(feasibility: FeasibilityClass) {
  if (feasibility === null) {
    return null;
  }
  return h('span', { style: FEASIBILITY_BADGE_STYLE[feasibility] }, FEASIBILITY_BADGE_LABEL[feasibility]);
}

function getGridIndicesForCell(
  cell: PorkchopWorkerCell,
  gridParams: PorkchopGridParams,
): GridIndices | null {
  const depStep = gridParams.nDep <= 1
    ? 0
    : (gridParams.depEndJD - gridParams.depStartJD) / (gridParams.nDep - 1);
  const tofStep = gridParams.nTof <= 1
    ? 0
    : (gridParams.tofMaxDays - gridParams.tofMinDays) / (gridParams.nTof - 1);
  const depIndex = depStep === 0
    ? 0
    : Math.round((cell.depJD - gridParams.depStartJD) / depStep);
  const tofIndex = tofStep === 0
    ? 0
    : Math.round((cell.tofDays - gridParams.tofMinDays) / tofStep);

  if (depIndex < 0 || depIndex >= gridParams.nDep || tofIndex < 0 || tofIndex >= gridParams.nTof) {
    return null;
  }

  return { depIndex, tofIndex };
}

function getDisplayCoordinatesForIndices(
  depIndex: number,
  tofIndex: number,
  gridParams: PorkchopGridParams,
): { x: number; y: number } {
  return getDisplayCoordinatesForGridPoint(depIndex, tofIndex, gridParams);
}

function getDisplayCoordinatesForGridPoint(
  depIndex: number,
  tofIndex: number,
  gridParams: PorkchopGridParams,
): { x: number; y: number } {
  const cellWidth = DISPLAY_WIDTH / gridParams.nDep;
  const cellHeight = DISPLAY_HEIGHT / gridParams.nTof;
  const rowFromTop = gridParams.nTof - 1 - tofIndex;
  return {
    x: depIndex * cellWidth + cellWidth / 2,
    y: rowFromTop * cellHeight + cellHeight / 2,
  };
}

function drawMarker(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  strokeStyle: string,
  fillStyle: string,
  radius: number,
) {
  context.save();
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = fillStyle;
  context.strokeStyle = strokeStyle;
  context.lineWidth = 2;
  context.fill();
  context.stroke();

  context.beginPath();
  context.moveTo(x - radius - 4, y);
  context.lineTo(x + radius + 4, y);
  context.moveTo(x, y - radius - 4);
  context.lineTo(x, y + radius + 4);
  context.stroke();
  context.restore();
}

function getSelectedBranchC3(cell: PorkchopWorkerCell): number | null {
  if (cell.status !== 'ok' || cell.selectedBranch === null) {
    return null;
  }
  return cell.branches[cell.selectedBranch]?.c3 ?? null;
}

function getSelectedBranchAbsDla(cell: PorkchopWorkerCell): number | null {
  if (cell.status !== 'ok' || cell.selectedBranch === null) {
    return null;
  }
  const dlaDeg = cell.branches[cell.selectedBranch]?.dlaDeg ?? null;
  return dlaDeg === null ? null : Math.abs(dlaDeg);
}

function interpolateEdge(level: number, startValue: number, endValue: number): number {
  const delta = endValue - startValue;
  if (delta === 0) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, (level - startValue) / delta));
}

function buildContourSegments(
  cells: readonly PorkchopWorkerCell[],
  gridParams: PorkchopGridParams,
  levels: readonly ContourLevel[],
  getScalar: (cell: PorkchopWorkerCell) => number | null,
): readonly ContourSegment[] {
  const segments: ContourSegment[] = [];
  const edgePairsByCase: Readonly<Record<number, readonly [number, number][]>> = {
    0: [],
    1: [[3, 0]],
    2: [[0, 1]],
    3: [[3, 1]],
    4: [[1, 2]],
    5: [[3, 2], [0, 1]],
    6: [[0, 2]],
    7: [[3, 2]],
    8: [[2, 3]],
    9: [[0, 2]],
    10: [[0, 3], [1, 2]],
    11: [[1, 2]],
    12: [[1, 3]],
    13: [[0, 1]],
    14: [[0, 3]],
    15: [],
  };

  for (const contourLevel of levels) {
    const level = contourLevel.value;
    for (let depIndex = 0; depIndex < gridParams.nDep - 1; depIndex += 1) {
      for (let tofIndex = 0; tofIndex < gridParams.nTof - 1; tofIndex += 1) {
        const bottomLeft = getCellAtGridIndices(depIndex, tofIndex, cells, gridParams);
        const bottomRight = getCellAtGridIndices(depIndex + 1, tofIndex, cells, gridParams);
        const topRight = getCellAtGridIndices(depIndex + 1, tofIndex + 1, cells, gridParams);
        const topLeft = getCellAtGridIndices(depIndex, tofIndex + 1, cells, gridParams);

        if (bottomLeft === null || bottomRight === null || topRight === null || topLeft === null) {
          continue;
        }

        const v0 = getScalar(bottomLeft);
        const v1 = getScalar(bottomRight);
        const v2 = getScalar(topRight);
        const v3 = getScalar(topLeft);
        if (v0 === null || v1 === null || v2 === null || v3 === null) {
          continue;
        }

        const caseIndex =
          (v0 >= level ? 1 : 0) |
          (v1 >= level ? 2 : 0) |
          (v2 >= level ? 4 : 0) |
          (v3 >= level ? 8 : 0);
        const edgePairs = edgePairsByCase[caseIndex];
        if (edgePairs.length === 0) {
          continue;
        }

        const edgePoints = [
          () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v0, v1), tofIndex, gridParams),
          () => getDisplayCoordinatesForGridPoint(depIndex + 1, tofIndex + interpolateEdge(level, v1, v2), gridParams),
          () => getDisplayCoordinatesForGridPoint(depIndex + interpolateEdge(level, v3, v2), tofIndex + 1, gridParams),
          () => getDisplayCoordinatesForGridPoint(depIndex, tofIndex + interpolateEdge(level, v0, v3), gridParams),
        ] as const;

        for (const [startEdge, endEdge] of edgePairs) {
          const start = edgePoints[startEdge]();
          const end = edgePoints[endEdge]();
          segments.push({ x1: start.x, y1: start.y, x2: end.x, y2: end.y, strokeStyle: contourLevel.strokeStyle });
        }
      }
    }
  }

  return segments;
}

export function PorkchopView(props: PorkchopViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cells, setCells] = useState<readonly PorkchopWorkerCell[] | null>(null);
  const [computeMs, setComputeMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedCell, setPinnedCell] = useState<PorkchopWorkerCell | null>(null);
  const [hoverCell, setHoverCell] = useState<PorkchopWorkerCell | null>(null);
  const [hoverTooltipPosition, setHoverTooltipPosition] = useState<HoverTooltipPosition | null>(null);
  const [showContours, setShowContours] = useState(false);
  const launchSite = props.launchSite ?? CAPE_CANAVERAL;
  const contourSegments = useMemo(
    () => (cells === null ? [] : buildContourSegments(cells, props.gridParams, C3_CONTOUR_LEVELS, getSelectedBranchC3)),
    [cells, props.gridParams],
  );
  const dlaContourLevels = useMemo(() => buildDlaContourLevels(launchSite), [launchSite]);
  const dlaContourSegments = useMemo(
    () => (cells === null ? [] : buildContourSegments(cells, props.gridParams, dlaContourLevels, getSelectedBranchAbsDla)),
    [cells, dlaContourLevels, props.gridParams],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPinnedCell(null);
    setHoverCell(null);
    setHoverTooltipPosition(null);
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

    if (showContours) {
      context.save();
      context.lineWidth = 1.2;
      context.lineCap = 'round';
      for (const segment of contourSegments) {
        context.beginPath();
        context.strokeStyle = segment.strokeStyle;
        context.moveTo(segment.x1, segment.y1);
        context.lineTo(segment.x2, segment.y2);
        context.stroke();
      }
      context.restore();
    }

    if (props.showDlaOverlayControl === true && props.showDlaContours === true) {
      context.save();
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.setLineDash([8, 5]);
      for (const segment of dlaContourSegments) {
        context.beginPath();
        context.strokeStyle = segment.strokeStyle;
        context.moveTo(segment.x1, segment.y1);
        context.lineTo(segment.x2, segment.y2);
        context.stroke();
      }
      context.restore();
    }

    const drawCellMarker = (
      cell: PorkchopWorkerCell | null,
      strokeStyle: string,
      fillStyle: string,
      radius: number,
    ) => {
      if (cell === null) {
        return;
      }
      const indices = getGridIndicesForCell(cell, props.gridParams);
      if (indices === null) {
        return;
      }
      const { x, y } = getDisplayCoordinatesForIndices(
        indices.depIndex,
        indices.tofIndex,
        props.gridParams,
      );
      drawMarker(context, x, y, strokeStyle, fillStyle, radius);
    };

    drawCellMarker(pinnedCell, 'rgba(255,255,255,0.92)', 'rgba(10,13,20,0.22)', 8);
    drawCellMarker(hoverCell, 'rgba(167,243,208,0.95)', 'rgba(167,243,208,0.16)', 6);
  }, [cells, contourSegments, dlaContourSegments, hoverCell, pinnedCell, props.gridParams, props.showDlaContours, props.showDlaOverlayControl, showContours]);

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
    const canvas = canvasRef.current;
    if (!canvas || cells === null) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const cell = getCellAtCoordinates(event, canvas, cells, props.gridParams);
      const rect = canvas.getBoundingClientRect();
      setHoverCell(cell);
      setHoverTooltipPosition({
        x: Math.min(Math.max(event.clientX - rect.left + 12, 8), rect.width - 188),
        y: Math.min(Math.max(event.clientY - rect.top + 12, 8), rect.height - 108),
      });
    };

    const handlePointerLeave = () => {
      setHoverCell(null);
      setHoverTooltipPosition(null);
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
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
    () => (pinnedCell === null ? null : buildPinnedReadout(pinnedCell, launchSite)),
    [launchSite, pinnedCell],
  );
  const hoverReadout = useMemo(
    () => (hoverCell === null ? null : buildPinnedReadout(hoverCell, launchSite)),
    [hoverCell, launchSite],
  );
  const depEndLabel = formatJdTdb(props.gridParams.depEndJD);
  const depStartLabel = formatJdTdb(props.gridParams.depStartJD);
  const tofMinLabel = `${formatNumber(props.gridParams.tofMinDays, 1)} d`;
  const tofMaxLabel = `${formatNumber(props.gridParams.tofMaxDays, 1)} d`;
  const hasValidatedTarget = props.validatedTarget !== undefined;
  const legendGradient = useMemo(() => buildLegendGradient(), []);

  useEffect(() => {
    props.onPinnedCellChange?.(pinnedReadout);
  }, [pinnedReadout, props.onPinnedCellChange]);

  return h(
    'div',
    { style: FRAME_STYLE },
    h(
      'div',
      { style: PANEL_STYLE },
      h(
        'div',
        { style: 'font-size:20px;font-weight:600;margin-bottom:8px;' },
        hasValidatedTarget
          ? `${props.bodyLabel} — M=${props.M}`
          : `${props.bodyLabel} — Earth-Departure Porkchop (M=${props.M})`,
      ),
      hasValidatedTarget
        ? h(
            'div',
            { style: 'font-size:13px;opacity:0.85;line-height:1.5;' },
            'Standalone Phase B smoke mount. X axis: departure date (early → late). Y axis: TOF days (short bottom → long top). ',
            computeMs === null ? '' : `worker compute ${formatNumber(computeMs, 1)} ms.`,
          )
        : h(
            'div',
            { style: 'font-size:13px;opacity:0.85;line-height:1.5;' },
            'Departure date runs left to right; time of flight increases upward. Color shows departure C3 energy (km²/s²) on a logarithmic scale — darker regions are lower-energy, more accessible transfer windows.',
          ),
      h(
        'label',
        {
          style: 'display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12px;opacity:0.9;cursor:pointer;',
        },
        h('input', {
          type: 'checkbox',
          checked: showContours,
          onInput: () => setShowContours((current) => !current),
        }),
        `Show contours (${C3_CONTOUR_LEVELS.map((level) => level.value).join(', ')} km²/s²)`,
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
              h(
                'div',
                { style: CANVAS_STAGE_STYLE },
                h('canvas', {
                  ref: canvasRef,
                  width: DISPLAY_WIDTH,
                  height: DISPLAY_HEIGHT,
                  style: CANVAS_STYLE,
                }),
                hoverReadout !== null && hoverTooltipPosition !== null
                  ? h(
                      'div',
                      {
                        style: `${TOOLTIP_STYLE};left:${formatNumber(hoverTooltipPosition.x, 0)}px;top:${formatNumber(hoverTooltipPosition.y, 0)}px;`,
                      },
                      h('div', { style: 'font-weight:600;margin-bottom:6px;' }, 'Hover cell'),
                      h('div', null, `Status: ${hoverReadout.status}`),
                      h('div', null, `Departure: ${formatJdTdb(hoverReadout.depJD)}`),
                      h('div', null, `TOF: ${formatNumber(hoverReadout.tofDays, 3)} d`),
                      h(
                        'div',
                        null,
                        `C3: ${hoverReadout.c3 === null ? 'n/a' : `${formatNumber(hoverReadout.c3, 6)} km²/s²`}`,
                      ),
                    )
                  : null,
              ),
              h(
                'div',
                { style: LABEL_ROW_STYLE },
                h('span', null, `TOF ↓ ${tofMinLabel}`),
                h(
                  'div',
                  { style: LEGEND_STACK_STYLE },
                  h('div', { style: `${LEGEND_BAR_STYLE};background:${legendGradient};` }),
                  h(
                    'div',
                    { style: LEGEND_TICKS_STYLE },
                    h('span', null, '1'),
                    h('span', null, '10'),
                    h('span', null, '100'),
                    h('span', null, '1000'),
                  ),
                  h('div', { style: 'font-size:10px;opacity:0.7;width:280px;text-align:right;' }, 'logarithmic scale'),
                ),
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
            h('span', null, pinnedReadout.status),
            h('span', null, 'Departure'),
            h('span', null, formatJdTdb(pinnedReadout.depJD)),
            h('span', null, 'Arrival'),
            h('span', null, formatJdTdb(pinnedReadout.arrivalJD)),
            h('span', null, 'TOF'),
            h('span', null, `${formatNumber(pinnedReadout.tofDays, 3)} d`),
            h('span', null, 'M'),
            h('span', null, String(pinnedReadout.M)),
            h('span', null, 'Branch'),
            h('span', null, pinnedReadout.selectedBranchLabel ?? 'n/a'),
            h('span', null, 'Branch index'),
            h('span', null, pinnedReadout.selectedBranchIndex === null ? 'n/a' : String(pinnedReadout.selectedBranchIndex)),
            h('span', null, 'C3'),
            h('span', null, pinnedReadout.c3 === null ? 'n/a' : `${formatNumber(pinnedReadout.c3, 6)} km²/s²`),
            h('span', null, 'DLA'),
            h(
              'span',
              { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;' },
              pinnedReadout.dlaDeg === null ? '—' : `${formatNumber(pinnedReadout.dlaDeg, 1)}°`,
              renderFeasibilityBadge(pinnedReadout.feasibility),
            ),
            h('span', null, ''),
            h(
              'span',
              { style: 'font-size:11px;line-height:1.45;color:#93a4bf;font-style:italic;' },
              'Screening estimate. Actual launch geometry may differ (see azimuth constraints).',
            ),
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
