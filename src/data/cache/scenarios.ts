/**
 * src/data/cache/scenarios.ts
 *
 * localStorage persistence for named mission scenarios.
 * Owns the save and load event-handler logic for the Burn Planner's
 * scenario save/load UI (index.html lines ~7295–7330).
 *
 * Each scenario is stored under the key `aster_scenario_<name>` and
 * contains the asteroid name, the burns array, and the current JD.
 *
 * NOTE: The handlers below reference runtime globals (asteroidData,
 * selectedId, burns, currentJD, burnModeActive, setCurrentJD,
 * selectAsteroid, toggleBurnMode, renderBurnList, recomputeAllBurnOrbits,
 * setStatus).  These are not imported here yet.
 * TODO: import from src/... once Stage 9 wiring is complete.
 */

export function bindScenarioSaveLoad(): void {
  document.getElementById('btn-save-scenario')!.addEventListener('click', () => {
    // TODO: import from src/...
    const name = (document.getElementById('scenario-name') as HTMLInputElement).value.trim();
    if (!name) { (window as any).setStatus('Enter a scenario name first', true); return; }
    if ((window as any).selectedId < 0) { (window as any).setStatus('Select an asteroid first', true); return; }
    const ast = (window as any).asteroidData[(window as any).selectedId];
    const key = `aster_scenario_${name}`;
    localStorage.setItem(key, JSON.stringify({
      asteroidName: ast.full_name || ast.pdes || ast.name,
      burns: (window as any).burns,
      jd: (window as any).currentJD,
    }));
    (window as any).setStatus(`✓ Scenario "${name}" saved`, true);
  });

  document.getElementById('btn-load-scenario')!.addEventListener('click', () => {
    // TODO: import from src/...
    const name = (document.getElementById('scenario-name') as HTMLInputElement).value.trim();
    if (!name) return;
    const raw = localStorage.getItem(`aster_scenario_${name}`);
    if (!raw) { (window as any).setStatus(`Scenario "${name}" not found`, true); return; }
    try {
      const saved = JSON.parse(raw);
      (window as any).burns = saved.burns || [];
      if (saved.jd) (window as any).setCurrentJD(saved.jd);
      const idx = (window as any).asteroidData.findIndex(
        (a: any) => (a.full_name || a.pdes || a.name) === saved.asteroidName
      );
      if (idx >= 0) {
        (window as any).selectAsteroid(idx);
        if (!(window as any).burnModeActive) (window as any).toggleBurnMode();
      }
      (window as any).renderBurnList();
      (window as any).recomputeAllBurnOrbits();
      (window as any).setStatus(`Scenario "${name}" loaded`, true);
    } catch (err) {
      console.error('[scenario load]', err);
      (window as any).setStatus(`Failed to load "${name}"`, true);
    }
  });
}
