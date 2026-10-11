import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { h, render } from 'preact';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-honesty');
const viewSourcePath = path.join(repoRoot, 'src', 'v2', 'porkchop', 'porkchop-view.ts');

async function loadPorkchopView() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = runTsc([
    '--pretty',
    'false',
    '--outDir',
    tempOutDir,
    '--rootDir',
    path.join(repoRoot, 'src', 'v2'),
    '--module',
    'NodeNext',
    '--target',
    'ES2020',
    '--moduleResolution',
    'NodeNext',
    '--isolatedModules',
    'true',
    viewSourcePath,
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
  const view = await import(
    `${pathToFileURL(path.join(tempOutDir, 'porkchop', 'porkchop-view.js')).href}?honesty=${Date.now()}`,
  );
  const constants = await import(
    `${pathToFileURL(path.join(tempOutDir, 'core', 'constants', 'near-zero-c3.js')).href}?honesty=${Date.now()}`,
  );
  return { ...view, constants };
}

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
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'class') {
      this.className = String(value);
    }
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
}

class FakeDocument {
  constructor() {
    this.nodeType = 9;
    this.body = new FakeElement(this, 'body');
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
  if (node.localName === localName) {
    found.push(node);
  }
  for (const child of node.childNodes ?? []) {
    found.push(...findElements(child, localName));
  }
  return found;
}

async function flushEffects() {
  for (let index = 0; index < 20; index += 1) {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function makeCell(depJD, tofDays, c3) {
  return {
    depJD,
    tofDays,
    status: 'ok',
    M: 0,
    branches: [{
      branch: 'single',
      converged: true,
      c3,
      vInfDep: Math.sqrt(c3),
      vInfArr: 1,
      dlaDeg: 0,
      x: 0,
      v1: [0, 0, 0],
      v2: [0, 0, 0],
    }],
    selectedBranch: 0,
  };
}

const bodyElements = {
  aM: 1.1 * 149597870700,
  e: 0.1,
  iRad: 0,
  omRad: 0,
  wRad: 0,
  maRad: 0,
  epochTdbSeconds: 0,
};

const gridParams = {
  depStartJD: 2461041.500800741,
  depEndJD: 2461042.500800741,
  tofMinDays: 200,
  tofMaxDays: 300,
  nDep: 2,
  nTof: 2,
};

async function withFakeDom(callback) {
  const previous = {
    document: globalThis.document,
    window: globalThis.window,
    Node: globalThis.Node,
    Element: globalThis.Element,
    HTMLElement: globalThis.HTMLElement,
  };
  const document = new FakeDocument();
  globalThis.document = document;
  globalThis.window = new FakeWindow(document);
  globalThis.Node = FakeNode;
  globalThis.Element = FakeElement;
  globalThis.HTMLElement = FakeElement;
  try {
    return await callback(document);
  } finally {
    globalThis.document = previous.document;
    globalThis.window = previous.window;
    globalThis.Node = previous.Node;
    globalThis.Element = previous.Element;
    globalThis.HTMLElement = previous.HTMLElement;
  }
}

test('T3 Porkchop extremes and pinned readout flag, hide, and restore the same C3 source value', async () => {
  const { PorkchopView, constants } = await loadPorkchopView();
  await withFakeDom(async (document) => {
    const depJD = gridParams.depStartJD;
    const cells = [
      makeCell(depJD, gridParams.tofMinDays, 0.00005),
      makeCell(depJD, gridParams.tofMaxDays, 1.5),
      makeCell(gridParams.depEndJD, gridParams.tofMinDays, 1.6),
      makeCell(gridParams.depEndJD, gridParams.tofMaxDays, 1.7),
    ];
    const client = {
      computeGrid: async () => ({ cells, compute_ms: 1 }),
    };
    assert(0.00005 < constants.NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2);
    assert(1.5 > constants.NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2);
    assert.equal(constants.isNearZeroC3Degenerate(0.00005), true);
    assert.equal(constants.isNearZeroC3Degenerate(1.5), false);
    const props = {
      client,
      bodyId: 'asteroid-99942',
      bodyLabel: 'Apophis',
      bodyElements,
      gridParams,
      M: 0,
      showGridExtremes: true,
      validatedTarget: { depJD, tofDays: gridParams.tofMinDays, expectedC3: 0.00005 },
    };
    const mount = document.createElement('div');
    render(h(PorkchopView, props), mount);
    await flushEffects();

    const initialText = mount.textContent;
    assert.ok((initialText.match(/near-zero C3/g) ?? []).length >= 2, initialText);
    assert.match(initialText, /0\.000050/);
    assert.equal(cells[0].branches[0].c3, 0.00005);

    const inputs = findElements(mount, 'input');
    assert.ok(inputs.length >= 2, 'expected contour and hide checkboxes');
    const hideInput = inputs[1];
    assert.ok(hideInput, 'expected Porkchop hide checkbox');
    hideInput.dispatchEvent({ type: 'input' });
    await flushEffects();
    const hiddenText = mount.textContent;
    assert.equal((hiddenText.match(/near-zero-C3 window hidden \(1\)/g) ?? []).length, 2);
    assert.doesNotMatch(hiddenText, /near-zero C3/);
    assert.doesNotMatch(hiddenText, /0\.000050/);
    assert.equal(cells[0].branches[0].c3, 0.00005);

    hideInput.dispatchEvent({ type: 'input' });
    await flushEffects();
    const restoredText = mount.textContent;
    assert.ok((restoredText.match(/near-zero C3/g) ?? []).length >= 2);
    assert.match(restoredText, /0\.000050/);
    assert.equal(cells[0].branches[0].c3, 0.00005);

    const normalCells = cells.map((cell) => ({
      ...cell,
      branches: [{ ...cell.branches[0], c3: 1.5 }],
    }));
    const normalMount = document.createElement('div');
    render(h(PorkchopView, {
      ...props,
      client: { computeGrid: async () => ({ cells: normalCells, compute_ms: 1 }) },
      validatedTarget: { depJD, tofDays: gridParams.tofMinDays, expectedC3: 1.5 },
    }), normalMount);
    await flushEffects();
    assert.doesNotMatch(normalMount.textContent, /near-zero C3/);
  });
});
