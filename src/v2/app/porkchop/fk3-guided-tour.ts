import { h, type VNode } from 'preact';

export type Fk3TourStep = 1 | 2 | 3 | 4;
export type Fk3TourVariant = 'red-no-price' | 'red-with-price' | 'penalty';

export const FK3_TOUR_STORAGE_KEY = 'aster.fk3TourSeen';

export interface TourAnchorRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const STEP_COPY: Record<Fk3TourStep, { readonly title: string; readonly body: string }> = {
  1: {
    title: 'The cheapest window',
    body: 'This is the lowest-energy departure to 2020 FK3 on the whole chart — the cell a pure energy search would pick. On energy alone, it\'s the obvious answer.',
  },
  2: {
    title: 'Now the geometry',
    body: 'Every departure needs a specific direction leaving Earth. This one points outside the declination band this launch site can reach directly — the constraint here is geometry, not energy.',
  },
  3: {
    title: 'The verdict',
    body: '',
  },
  4: {
    title: 'The point',
    body: 'The cheapest-looking answer hid the constraint that decides the mission. Aster surfaces it instead of quoting a number it can\'t stand behind — the difference between an energy calculator and a mission-planning tool.',
  },
};

const STEP_3_COPY: Record<Fk3TourVariant, string> = {
  'red-no-price': 'So Aster calls it: not feasible from this site as-is. Not a discount on the price — no price at all.',
  'red-with-price': 'So Aster calls it: not feasible from this site as-is. The number is still there — the verdict is what it won\'t soften.',
  penalty: 'So Aster prices what the cheap number hid: this window flies only with a dogleg — a plane-change cost the energy chart never showed.',
};

const BACKDROP_STYLE = [
  'position:fixed',
  'inset:0',
  'z-index:50',
  'pointer-events:none',
].join(';');

const CARD_BASE_STYLE = [
  'position:fixed',
  'z-index:52',
  'width:min(360px,calc(100vw - 32px))',
  'border:1px solid rgba(125,211,252,0.36)',
  'border-radius:8px',
  'background:rgba(5,7,13,0.96)',
  'box-shadow:0 18px 50px rgba(0,0,0,0.48)',
  'color:#eef2ff',
  'font-family:system-ui,-apple-system,sans-serif',
  'padding:14px',
  'pointer-events:auto',
].join(';');

const TITLE_STYLE = 'font-size:15px;font-weight:700;color:#fff;margin-bottom:8px;';
const BODY_STYLE = 'font-size:13px;line-height:1.55;color:#cbd5e1;margin-bottom:12px;';
const ACTION_ROW_STYLE = 'display:flex;justify-content:space-between;align-items:center;gap:8px;';
const BUTTON_STYLE = 'border:1px solid rgba(255,255,255,0.16);border-radius:6px;background:rgba(255,255,255,0.08);color:#eef2ff;padding:6px 9px;font:inherit;font-size:12px;cursor:pointer;';
const PRIMARY_BUTTON_STYLE = `${BUTTON_STYLE}background:rgba(125,211,252,0.18);border-color:rgba(125,211,252,0.42);`;
const STEP_BADGE_STYLE = 'font-size:11px;color:#93a4bf;';
const HIGHLIGHT_BASE_STYLE = [
  'position:fixed',
  'z-index:51',
  'border:2px solid rgba(125,211,252,0.85)',
  'box-shadow:0 0 0 9999px rgba(0,0,0,0.42),0 0 22px rgba(125,211,252,0.28)',
  'border-radius:10px',
  'pointer-events:none',
].join(';');

function stepBody(step: Fk3TourStep, variant: Fk3TourVariant): string {
  return step === 3 ? STEP_3_COPY[variant] : STEP_COPY[step].body;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function expandRect(rect: TourAnchorRect, padding: number): TourAnchorRect {
  return {
    left: Math.max(8, rect.left - padding),
    top: Math.max(8, rect.top - padding),
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function rectStyle(rect: TourAnchorRect): string {
  return `left:${rect.left.toFixed(0)}px;top:${rect.top.toFixed(0)}px;width:${rect.width.toFixed(0)}px;height:${rect.height.toFixed(0)}px;`;
}

function cardPosition(step: Fk3TourStep, anchor: TourAnchorRect | null): string {
  if (step === 4 || anchor === null) {
    return 'left:50%;top:50%;transform:translate(-50%,-50%);';
  }

  const cardWidth = Math.min(360, Math.max(280, window.innerWidth - 32));
  const margin = 20;
  let left: number;
  let top: number;

  if (step === 3) {
    left = Math.max(anchor.left + anchor.width + 32, 360);
    top = anchor.top;
  } else {
    const preferRight = anchor.left + anchor.width + cardWidth + margin * 2 < window.innerWidth;
    left = preferRight ? anchor.left + anchor.width + margin : anchor.left - cardWidth - margin;
    top = anchor.top - 24;
  }

  left = clamp(left, 16, Math.max(16, window.innerWidth - cardWidth - 16));
  top = clamp(top, 16, Math.max(16, window.innerHeight - 220));
  return `left:${left.toFixed(0)}px;top:${top.toFixed(0)}px;`;
}

function stepAnchor(
  step: Fk3TourStep,
  cellRect: TourAnchorRect | null,
  costCardRect: TourAnchorRect | null,
): TourAnchorRect | null {
  if (step === 1) {
    return cellRect === null ? null : expandRect(cellRect, 14);
  }
  if (step === 2) {
    return cellRect === null ? null : expandRect(cellRect, 26);
  }
  if (step === 3) {
    return costCardRect === null ? null : expandRect(costCardRect, 6);
  }
  return null;
}

export function markFk3TourSeen(): void {
  try {
    localStorage.setItem(FK3_TOUR_STORAGE_KEY, '1');
  } catch {
    // localStorage unavailable; first-visit gating becomes session-only.
  }
}

export function hasSeenFk3Tour(): boolean {
  try {
    return localStorage.getItem(FK3_TOUR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

interface Fk3GuidedTourProps {
  readonly step: Fk3TourStep;
  readonly variant: Fk3TourVariant;
  readonly cellRect: TourAnchorRect | null;
  readonly costCardRect: TourAnchorRect | null;
  readonly onNext: () => void;
  readonly onSkip: () => void;
  readonly onClose: () => void;
}

export function Fk3GuidedTour(props: Fk3GuidedTourProps): VNode {
  const copy = STEP_COPY[props.step];
  const isFinal = props.step === 4;
  const anchor = stepAnchor(props.step, props.cellRect, props.costCardRect);
  return h(
    'div',
    { style: BACKDROP_STYLE, 'aria-live': 'polite' },
    anchor === null ? null : h('div', { style: `${HIGHLIGHT_BASE_STYLE};${rectStyle(anchor)}` }),
    h(
      'section',
      {
        role: 'dialog',
        'aria-label': copy.title,
        style: `${CARD_BASE_STYLE};${cardPosition(props.step, anchor)}`,
      },
      h('div', { style: TITLE_STYLE }, copy.title),
      h('div', { style: BODY_STYLE }, stepBody(props.step, props.variant)),
      h(
        'div',
        { style: ACTION_ROW_STYLE },
        h('span', { style: STEP_BADGE_STYLE }, `Step ${props.step} of 4`),
        h(
          'span',
          { style: 'display:flex;gap:8px;' },
          h('button', { type: 'button', onClick: props.onSkip, style: BUTTON_STYLE }, 'Skip tour'),
          h(
            'button',
            {
              type: 'button',
              onClick: isFinal ? props.onClose : props.onNext,
              style: PRIMARY_BUTTON_STYLE,
            },
            isFinal ? 'Close' : 'Next',
          ),
        ),
      ),
    ),
  );
}
