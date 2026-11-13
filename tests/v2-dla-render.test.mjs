import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { render } from 'preact';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-dla-render');
const mainSourcePath = path.join(repoRoot, 'src', 'v2', 'app', 'porkchop', 'main.ts');

class FakeNode {
  constructor(ownerDocument, nodeType) {
    this.ownerDocument = ownerDocument;
    this.nodeType = nodeType;
    this.parentNode = null;
    this.childNodes = [];
  }

  appendChild(child) {
    return this.insertBefore(child, null);
  }

  insertBefore(child, before) {
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    child.parentNode = this;
    if (before === null || before === undefined) {
      this.childNodes.push(child);
      return child;
    }
    const index = this.childNodes.indexOf(before);
    this.childNodes.splice(index < 0 ? this.childNodes.length : index, 0, child);
    return child;
  }

  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    if (index >= 0) {
      this.childNodes.splice(index, 1);
      child.parentNode = null;
    }
    return child;
  }

  replaceChildren(...children) {
    for (const child of [...this.childNodes]) {
      this.removeChild(child);
    }
    for (const child of children) {
      this.appendChild(child);
    }
  }

  remove() {
    this.parentNode?.removeChild(this);
  }

  get firstChild() {
    return this.childNodes[0] ?? null;
  }

  get nextSibling() {
    if (!this.parentNode) {
      return null;
    }
    const index = this.parentNode.childNodes.indexOf(this);
    return index >= 0 ? this.parentNode.childNodes[index + 1] ?? null : null;
  }

  get textContent() {
    return this.childNodes.map((child) => child.textContent).join('');
  }

  set textContent(value) {
    this.replaceChildren(this.ownerDocument.createTextNode(String(value)));
  }
}

class FakeTextNode extends FakeNode {
  constructor(ownerDocument, text) {
    super(ownerDocument, 3);
    this.data = text;
  }

  get nodeValue() {
    return this.data;
  }

  set nodeValue(value) {
    this.data = String(value);
  }

  get textContent() {
    return this.data;
  }

  set textContent(value) {
    this.data = String(value);
  }
}

function canvasContext() {
  return {
    imageSmoothingEnabled: false,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    createImageData: (width, height) => ({ data: new Uint8ClampedArray(width * height * 4), width, height }),
    putImageData() {},
    clearRect() {},
    drawImage() {},
    fillRect() {},
    save() {},
    restore() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    rect() {},
    fill() {},
    stroke() {},
    setLineDash() {},
  };
}

class FakeElement extends FakeNode {
  constructor(ownerDocument, localName) {
    super(ownerDocument, 1);
    this.localName = localName;
    this.nodeName = localName.toUpperCase();
    this.attributes = new Map();
    this.style = { cssText: '', setProperty() {} };
    this.className = '';
    this.ownerSVGElement = undefined;
    this.listeners = new Map();
    this.width = 1000;
    this.height = 500;
    this.value = '';
    this.checked = false;
    this.disabled = false;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'class') this.className = String(value);
    if (name === 'value') this.value = String(value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  removeEventListener(type, handler) {
    if (this.listeners.get(type) === handler) {
      this.listeners.delete(type);
    }
  }

  dispatchEvent(event) {
    const nextEvent = event ?? {};
    nextEvent.target = this;
    nextEvent.currentTarget = this;
    nextEvent.preventDefault ??= () => {};
    const directKey = Object.keys(this.l ?? {}).find((key) => key.toLowerCase().startsWith(nextEvent.type.toLowerCase()));
    const directHandler = directKey === undefined ? undefined : this.l[directKey];
    if (typeof directHandler === 'function') {
      directHandler(nextEvent);
      return true;
    }
    const handler = this.listeners.get(nextEvent.type)
      ?? this.listeners.get([...this.listeners.keys()].find((key) => key.toLowerCase() === nextEvent.type.toLowerCase()));
    handler?.call(this, nextEvent);
    return true;
  }

  getContext(kind) {
    return kind === '2d' ? canvasContext() : null;
  }

  get clientWidth() {
    return 760;
  }

  get clientHeight() {
    return 420;
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, right: 760, bottom: 420, width: 760, height: 420 };
  }

  focus() {}

  scrollIntoView() {}
}

class FakeDocument {
  constructor() {
    this.nodeType = 9;
    this.body = new FakeElement(this, 'body');
    this.app = new FakeElement(this, 'div');
    this.body.appendChild(this.app);
  }

  getElementById(id) {
    return id === 'app' ? this.app : null;
  }

  createElement(localName) {
    return new FakeElement(this, localName);
  }

  createElementNS(_namespace, localName) {
    return new FakeElement(this, localName);
  }

  createTextNode(text) {
    return new FakeTextNode(this, String(text));
  }
}

class FakeWindow {
  constructor(document) {
    this.document = document;
    this.listeners = new Map();
    this.innerWidth = 1200;
    this.innerHeight = 900;
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  removeEventListener(type, handler) {
    if (this.listeners.get(type) === handler) {
      this.listeners.delete(type);
    }
  }
}

function findElements(node, localName) {
  const found = [];
  if (node.localName === localName) found.push(node);
  for (const child of node.childNodes ?? []) found.push(...findElements(child, localName));
  return found;
}

async function flushEffects(rounds = 80) {
  for (let index = 0; index < rounds; index += 1) {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function gridCells(gridParams, M) {
  const cells = [];
  for (let depIndex = 0; depIndex < gridParams.nDep; depIndex += 1) {
    const depFraction = gridParams.nDep <= 1 ? 0 : depIndex / (gridParams.nDep - 1);
    const depJD = gridParams.depStartJD + (gridParams.depEndJD - gridParams.depStartJD) * depFraction;
    for (let tofIndex = 0; tofIndex < gridParams.nTof; tofIndex += 1) {
      const tofFraction = gridParams.nTof <= 1 ? 0 : tofIndex / (gridParams.nTof - 1);
      cells.push({
        depJD,
        tofDays: gridParams.tofMinDays + (gridParams.tofMaxDays - gridParams.tofMinDays) * tofFraction,
        status: 'ok',
        M,
        branches: [{
          branch: 'single',
          converged: true,
          // The GREEN cell (depIndex 0, tofIndex 0) sits past every published payload curve so the
          // card renders its "no delivered mass" state (2026-11-04 live review fix 1.2).
          c3: depIndex === 0 && tofIndex === 0 ? 10_000 : 1,
          vInfDep: 1,
          vInfArr: 2,
          dlaDeg: depIndex === 0 && tofIndex > 0 ? 40 : depIndex === 0 ? 0 : 80,
          x: 0,
        }],
        selectedBranch: 0,
      });
    }
  }
  return cells;
}

class FakeWorker {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  emit(message) {
    this.listeners.get('message')?.({ data: message });
  }

  postMessage(message) {
    if (message.type === 'init') {
      queueMicrotask(() => this.emit({ type: 'ready', earthSampleCount: message.earthStateSeries.length }));
      return;
    }
    if (message.type !== 'compute-grid') return;
    const key = `${message.M}:${message.gridParams.nDep}:${message.gridParams.nTof}`;
    const cells = this.cache.get(key) ?? gridCells(message.gridParams, message.M);
    this.cache.set(key, cells);
    queueMicrotask(() => this.emit({
      type: 'grid-result',
      bodyId: message.bodyId,
      M: message.M,
      cells,
      compute_ms: 1,
    }));
  }

  terminate() {}
}

function jsonResponse(value) {
  return { ok: true, status: 200, statusText: 'OK', json: async () => value };
}

test('DLA disclosure, site picker, and band legend render with contours off and on', async () => {
  const result = runTsc(
    [
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      mainSourcePath,
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  const launchVehicleConstants = await import(
    `${pathToFileURL(path.join(tempOutDir, 'porkchop', 'launch-vehicles.js')).href}?margin=${Date.now()}`,
  );
  const deltaVConstants = await import(
    `${pathToFileURL(path.join(tempOutDir, 'porkchop', 'delta-v.js')).href}?margin=${Date.now()}`,
  );
  const costMarginPercent = (launchVehicleConstants.DETERMINISTIC_MARGIN_FRACTION * 100).toFixed(0);
  const stackMarginPercent = (deltaVConstants.DV_MARGIN_FRACTION * 100).toFixed(0);

  const fixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'data', 'horizons-inner-solar-system-2026-2040.json'), 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json'), 'utf8'));
  const tiers = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'slice18-research', 'tier-sizing-per-body.json'), 'utf8'));
  const provenance = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'data', 'validation-provenance.json'), 'utf8'));
  const symmetricReturnError = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'data', 'symmetric-return-error.json'), 'utf8'));

  const previous = {
    document: globalThis.document,
    window: globalThis.window,
    Node: globalThis.Node,
    Element: globalThis.Element,
    HTMLElement: globalThis.HTMLElement,
    HTMLCanvasElement: globalThis.HTMLCanvasElement,
    HTMLSelectElement: globalThis.HTMLSelectElement,
    Worker: globalThis.Worker,
    fetch: globalThis.fetch,
    location: globalThis.location,
    sessionStorage: globalThis.sessionStorage,
    localStorage: globalThis.localStorage,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    cancelAnimationFrame: globalThis.cancelAnimationFrame,
  };
  const document = new FakeDocument();
  const window = new FakeWindow(document);
  const location = { search: '', pathname: '/v2/porkchop/', assign() {} };
  const sessionStorage = storage();
  const localStorage = storage({ 'aster.fk3TourSeen': '1' });
  globalThis.document = document;
  globalThis.window = window;
  globalThis.Node = FakeNode;
  globalThis.Element = FakeElement;
  globalThis.HTMLElement = FakeElement;
  globalThis.HTMLCanvasElement = FakeElement;
  globalThis.HTMLSelectElement = FakeElement;
  globalThis.Worker = FakeWorker;
  globalThis.location = location;
  globalThis.sessionStorage = sessionStorage;
  globalThis.localStorage = localStorage;
  globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes('horizons-inner-solar-system-2026-2040')) return jsonResponse(fixture);
    if (url.includes('nea-catalog-slice9')) return jsonResponse(catalog);
    if (url.includes('tier-sizing-per-body')) return jsonResponse(tiers);
    if (url.includes('validation-provenance')) return jsonResponse(provenance);
    if (url.includes('symmetric-return-error')) return jsonResponse(symmetricReturnError);
    throw new Error(`Unexpected test fetch: ${url}`);
  };

  try {
    await import(`${pathToFileURL(path.join(tempOutDir, 'app', 'porkchop', 'main.js')).href}?dla-render=${Date.now()}`);
    await flushEffects();

    const canvas = findElements(document.app, 'canvas')[0];
    assert.ok(canvas, 'expected the rendered porkchop heatmap canvas');
    canvas.dispatchEvent({ type: 'click', clientX: 1, clientY: 1 });
    await flushEffects();

    const pinnedText = document.app.textContent;
    assert.doesNotMatch(pinnedText, /asteroid-[0-9A-Z]/);
    assert.match(pinnedText, /Mission cost/);
    assert.match(pinnedText, /AMBER|Raised inclination/);
    // S19.5 tail2 F1/F2: AMBER says zero (DEC-13-3); one noun, "payload penalty".
    assert.match(pinnedText, /zero added ΔV in this model/);
    assert.match(pinnedText, /a payload penalty for this launch site and vehicle still applies/);
    // 2026-11-04 live review fix 1.1: the dogleg line and the delivered-mass note must agree on
    // what is modelled. The 0 m/s ΔV is modelled; the launch-site payload penalty is not.
    assert.match(pinnedText, /Dogleg penalty0 m\/s ΔV \(plane-matching absorbed by launch geometry — AMBER\); the launch-site payload penalty is not modelled/);
    assert.doesNotMatch(pinnedText, /0 m\/s \(modelled/);
    assert.doesNotMatch(pinnedText, /negligible/);
    assert.doesNotMatch(pinnedText, /~0/);
    assert.match(pinnedText, /Delivered mass excludes the launch-site payload penalty for this DLA band; Aster does not model that penalty\./);
    // The direct doesNotMatch above is what catches the original contradiction ('0 m/s (modelled; …)').
    // This loop guards the explicit phrase only: no AMBER "payload penalty" sentence may say it "is modelled".
    const amberPenaltySentences = pinnedText.match(/[^.]*payload penalty[^.]*\./g) ?? [];
    assert.ok(amberPenaltySentences.length >= 2, pinnedText);
    for (const sentence of amberPenaltySentences) {
      assert.doesNotMatch(sentence, /payload penalty[^.]*\bis modelled\b/, sentence);
    }
    assert.doesNotMatch(pinnedText, /launch-site payload penalty named above/);
    const oneWayCostMarginSentence = `Margin here is ${costMarginPercent}% of rendezvous \u0394V; the \u0394V stack below applies ${stackMarginPercent}% to the full stack.`;
    const oneWayStackMarginSentence = `Margin here is ${stackMarginPercent}% of the full stack; the cost card applies ${costMarginPercent}% to rendezvous \u0394V only.`;
    assert.ok(pinnedText.includes(oneWayCostMarginSentence), pinnedText);
    assert.ok(pinnedText.includes(oneWayStackMarginSentence), pinnedText);
    assert.match(pinnedText, /Rendezvous burn[0-9,]+ m\/s/);
    assert.doesNotMatch(pinnedText, /Rendezvous burn\d{4,} m\/s/);

    const redPayloadCaption = 'Vehicle payload at this C3, before any dogleg or launch-site penalty. Not a delivered-mass estimate.';
    assert.doesNotMatch(pinnedText, /Vehicle payload at this C3/);
    canvas.dispatchEvent({ type: 'click', clientX: 1, clientY: 419 });
    await flushEffects();
    const greenText = document.app.textContent;
    assert.match(greenText, /GREEN/);
    assert.doesNotMatch(greenText, /Vehicle payload at this C3/);
    // Fix 1.2: with delivered mass unavailable, the badge names the launch-geometry band.
    assert.match(greenText, /No published payload data past this C3 \u2014 not extrapolating\./);
    assert.match(greenText, /GREEN \u00B7 launch geometry/);
    canvas.dispatchEvent({ type: 'click', clientX: 759, clientY: 419 });
    await flushEffects();
    const redText = document.app.textContent;
    assert.match(redText, /RED/);
    assert.ok(redText.includes(redPayloadCaption), redText);
    assert.match(redText, /no delivered-mass number is honest at screening fidelity/);

    // S19.5 tail2 F3: no rendered attribute or tooltip leaks an internal storage key.
    const replay = findElements(document.app, 'button').find((button) => button.textContent.includes('Replay tour'));
    assert.ok(replay, 'expected the Replay tour control');
    const replayTitle = replay.title ?? replay.attributes.get('title');
    assert.equal(typeof replayTitle, 'string', 'Replay tour control should carry a tooltip');
    const everyElement = (node) => [node, ...(node.childNodes ?? []).flatMap(everyElement)];
    for (const element of everyElement(document.app)) {
      if (element.nodeType !== 1) continue;
      for (const value of [...element.attributes.values(), element.title, element.placeholder, element.alt]) {
        if (typeof value === 'string') assert.doesNotMatch(value, /aster\.[a-z]/i, `attribute leaks a storage key: ${value}`);
      }
    }

    const dlaLabel = findElements(document.app, 'label').find((label) => label.textContent.includes('DLA feasibility'));
    assert.ok(dlaLabel, 'expected the DLA contour toggle');
    const dlaInput = findElements(dlaLabel, 'input')[0];
    assert.ok(dlaInput, 'expected the DLA contour checkbox');

    dlaInput.dispatchEvent({ type: 'input' });
    await flushEffects();
    const offText = document.app.textContent;
    assert.match(offText, /Launch-feasibility bands are a screening estimate/);
    assert.match(offText, /Launch site/);
    assert.match(offText, /min direct inclination \(iMin\)/);
    assert.match(offText, /max direct declination \(ceiling\)/);

    dlaInput.dispatchEvent({ type: 'input' });
    await flushEffects();
    const onText = document.app.textContent;
    assert.match(onText, /Launch-feasibility bands are a screening estimate/);
    assert.match(onText, /Launch site/);
    assert.match(onText, /min direct inclination \(iMin\)/);
    assert.match(onText, /max direct declination \(ceiling\)/);
    assert.match(onText, /min direct inclination \(iMin\): 28\.5\u00b0 from Cape Canaveral/);
    assert.match(onText, /max direct declination \(ceiling\): 57\.0\u00b0 from Cape Canaveral/);

    const siteLabel = findElements(document.app, 'label').find((label) => label.textContent.includes('Launch site'));
    assert.ok(siteLabel, 'expected the launch-site picker');
    const siteSelect = findElements(siteLabel, 'select')[0];
    assert.ok(siteSelect, 'expected the launch-site select');
    siteSelect.value = 'Vandenberg SFB';
    siteSelect.dispatchEvent({ type: 'input' });
    await flushEffects();
    const vandenbergText = document.app.textContent;
    assert.match(vandenbergText, /min direct inclination \(iMin\): 70\.0\u00b0 from Vandenberg SFB/);
    assert.match(vandenbergText, /corridor covers all declinations from Vandenberg SFB/);
    assert.match(vandenbergText, /max direct declination \(ceiling\): none from Vandenberg SFB/);

    const modeLabel = findElements(document.app, 'label').find((label) => label.textContent.includes('Mission mode'));
    assert.ok(modeLabel, 'expected the mission-mode picker');
    const modeSelect = findElements(modeLabel, 'select')[0];
    assert.ok(modeSelect, 'expected the mission-mode select');
    assert.match(onText, /ΔV stack — One-way rendezvous/);
    assert.match(onText, /Assumptions: One-way rendezvous; impulsive, patched-conic, no gravity assists, no SEP; 200 km circular LEO/);
    assert.match(onText, /no departure burn in one-way mode/);

    modeSelect.value = 'sample-return';
    modeSelect.dispatchEvent({ type: 'input' });
    await flushEffects();
    const sampleReturnText = document.app.textContent;
    assert.match(sampleReturnText, /ΔV stack — Sample return/);
    assert.match(sampleReturnText, /Assumptions: Sample return; impulsive, patched-conic, no gravity assists, no SEP; 200 km circular LEO/);
    const sampleReturnCostMarginSentence = `Margin here is ${costMarginPercent}% of rendezvous and departure \u0394V; the \u0394V stack below applies ${stackMarginPercent}% to the full stack.`;
    const sampleReturnStackMarginSentence = `Margin here is ${stackMarginPercent}% of the full stack; the cost card applies ${costMarginPercent}% to rendezvous and departure \u0394V only.`;
    assert.ok(sampleReturnText.includes(sampleReturnCostMarginSentence), sampleReturnText);
    assert.ok(sampleReturnText.includes(sampleReturnStackMarginSentence), sampleReturnText);
    assert.match(sampleReturnText, /This stack counts launch injection as \u0394V \(a vehicle-agnostic total\); the cost card above does not/);
    assert.match(sampleReturnText, /departure = arrival v∞ under the symmetric-return assumption/);
    assert.match(sampleReturnText, /off by 0\.08-5\.1 km\/s, sometimes too high and sometimes too low, so treat sample-return totals as rough/);
  } finally {
    render(null, document.app);
    await flushEffects(10);
    globalThis.document = previous.document;
    globalThis.window = previous.window;
    globalThis.Node = previous.Node;
    globalThis.Element = previous.Element;
    globalThis.HTMLElement = previous.HTMLElement;
    globalThis.HTMLCanvasElement = previous.HTMLCanvasElement;
    globalThis.HTMLSelectElement = previous.HTMLSelectElement;
    globalThis.Worker = previous.Worker;
    globalThis.fetch = previous.fetch;
    globalThis.location = previous.location;
    globalThis.sessionStorage = previous.sessionStorage;
    globalThis.localStorage = previous.localStorage;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
    globalThis.cancelAnimationFrame = previous.cancelAnimationFrame;
  }
});
