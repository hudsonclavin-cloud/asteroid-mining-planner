// ─── Phase 5: Onboarding Tour ─────────────────────────────────────────────────

interface TourStep {
  text: string;
  pos: Partial<CSSStyleDeclaration>;
}

export const TOUR_STEPS: TourStep[] = [
  {
    text: 'Welcome to ASTER — the asteroid mining mission planner. This 5-step tour shows you the key features.',
    pos: { bottom: '80px', left: '50%', transform: 'translateX(-50%)' },
  },
  {
    text: 'The left panel ranks asteroids by screening value and accessibility. Click any row to select a target, or use the filters at the top.',
    pos: { top: '80px', left: '340px' },
  },
  {
    text: 'Click any asteroid in the 3D view to inspect it. The right panel shows orbital elements, economics, and resource composition.',
    pos: { top: '80px', right: '360px' },
  },
  {
    text: 'Select an asteroid then press B (or click PLAN MISSION) to enter burn mode. Drag the gizmo arrows to simulate a ΔV maneuver.',
    pos: { bottom: '80px', right: '360px' },
  },
  {
    text: 'Press ? to see all keyboard shortcuts. Use [ and ] to control time speed, F to fly to your selected asteroid.',
    pos: { bottom: '80px', left: '50%', transform: 'translateX(-50%)' },
  },
];

export let tourStep = 0;

/** Start the onboarding tour from step 0. */
export function startTour(): void {
  tourStep = 0;
  showTourStep();
}

/** @deprecated Alias for startTour() — kept for backward compat with call sites that use showTour() */
export function showTour(): void {
  startTour();
}

export function showTourStep(): void {
  if (tourStep >= TOUR_STEPS.length) {
    document.getElementById('tour-overlay')!.style.display = 'none';
    localStorage.setItem('aster_toured', '1');
    return;
  }
  const step = TOUR_STEPS[tourStep];
  document.getElementById('tour-step-label')!.textContent = `STEP ${tourStep + 1} OF ${TOUR_STEPS.length}`;
  document.getElementById('tour-text')!.textContent = step.text;
  const box = document.getElementById('tour-box')!;
  Object.assign(box.style, { top: '', bottom: '', left: '', right: '', transform: '' });
  Object.assign(box.style, step.pos);
  document.getElementById('btn-tour-next')!.textContent =
    tourStep < TOUR_STEPS.length - 1 ? 'NEXT →' : 'DONE ✓';
  document.getElementById('tour-overlay')!.style.display = 'block';
}

export function advanceTour(): void {
  tourStep++;
  showTourStep();
}

export function skipTour(): void {
  document.getElementById('tour-overlay')!.style.display = 'none';
  localStorage.setItem('aster_toured', '1');
}

/** Wire up tour button event listeners. Call once during app initialisation. */
export function initTour(): void {
  document.getElementById('btn-tour-next')!.addEventListener('click', () => {
    tourStep++;
    showTourStep();
  });
  document.getElementById('btn-tour-skip')!.addEventListener('click', () => {
    document.getElementById('tour-overlay')!.style.display = 'none';
    localStorage.setItem('aster_toured', '1');
  });
}
