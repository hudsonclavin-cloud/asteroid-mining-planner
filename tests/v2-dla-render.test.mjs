import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
          c3: 1,
          vInfDep: 1,
          vInfArr: 2,
          dlaDeg: 40,
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

  const fixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'data', 'horizons-inner-solar-system-2026-2040.json'), 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json'), 'utf8'));
  const tiers = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'slice18-research', 'tier-sizing-per-body.json'), 'utf8'));
  const provenance = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'data', 'validation-provenance.json'), 'utf8'));

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
    assert.match(pinnedText, /Mission cost/);
    assert.match(pinnedText, /AMBER|Raised inclination/);

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
  } finally {
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
