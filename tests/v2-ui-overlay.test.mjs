import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-ui-overlay');
const runtimeSource = fs.readFileSync(
  path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
  'utf8',
);

function compileOverlayModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const result = runTsc(
[
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
      path.join(repoRoot, 'src', 'v2', 'app', 'ui-overlay', 'overlay.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
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
    if (before === null || typeof before === 'undefined') {
      this.childNodes.push(child);
      return child;
    }

    const index = this.childNodes.indexOf(before);
    if (index === -1) {
      this.childNodes.push(child);
      return child;
    }

    this.childNodes.splice(index, 0, child);
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
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  get firstChild() {
    return this.childNodes[0] ?? null;
  }

  get nextSibling() {
    if (!this.parentNode) {
      return null;
    }
    const siblings = this.parentNode.childNodes;
    const index = siblings.indexOf(this);
    return index >= 0 ? siblings[index + 1] ?? null : null;
  }

  get textContent() {
    return this.childNodes.map((child) => child.textContent).join('');
  }

  set textContent(value) {
    this.replaceChildren(this.ownerDocument.createTextNode(value));
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

class FakeElement extends FakeNode {
  constructor(ownerDocument, localName) {
    super(ownerDocument, 1);
    this.localName = localName;
    this.nodeName = localName.toUpperCase();
    this.attributes = new Map();
    this.style = { cssText: '', setProperty() {} };
    this.ownerSVGElement = undefined;
    this.className = '';
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

  addEventListener() {}

  removeEventListener() {}

  dispatchEvent() {
    return true;
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

function findByTestId(node, testId) {
  if (node instanceof FakeElement && node.getAttribute('data-testid') === testId) {
    return node;
  }
  for (const child of node.childNodes ?? []) {
    const found = findByTestId(child, testId);
    if (found) {
      return found;
    }
  }
  return null;
}

async function loadFreshOverlayModules() {
  compileOverlayModule();
  const overlayHref = pathToFileURL(path.join(tempOutDir, 'app', 'ui-overlay', 'overlay.js')).href;
  const storeHref = pathToFileURL(path.join(tempOutDir, 'app', 'ui-store', 'store.js')).href;
  const overlayCacheBust = `cacheBust=${Date.now()}-${Math.random()}`;

  const [overlay, store] = await Promise.all([
    import(`${overlayHref}?${overlayCacheBust}`),
    import(storeHref),
  ]);

  return { overlay, store };
}

test('Phase C overlay mounts with real Preact, reflects store subscriptions, and cleans up', async () => {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const previousNode = globalThis.Node;
  const previousElement = globalThis.Element;
  const previousHTMLElement = globalThis.HTMLElement;
  const document = new FakeDocument();

  globalThis.document = document;
  globalThis.window = { document };
  globalThis.Node = FakeNode;
  globalThis.Element = FakeElement;
  globalThis.HTMLElement = FakeElement;

  try {
    const { overlay, store } = await loadFreshOverlayModules();
    const mount = document.createElement('div');

    const dispose = overlay.mountPhaseCOverlay(mount);
    const host = findByTestId(mount, overlay.PHASE_C_OVERLAY_HOST_TEST_ID);
    let root = findByTestId(mount, overlay.PHASE_C_OVERLAY_ROOT_TEST_ID);
    let selectionState = findByTestId(mount, overlay.PHASE_C_OVERLAY_SELECTION_TEST_ID);
    let focusRequest = findByTestId(mount, overlay.PHASE_C_OVERLAY_FOCUS_REQUEST_TEST_ID);

    assert.ok(host, 'expected overlay host to mount');
    assert.ok(root, 'expected overlay root to mount');
    assert.equal(root.getAttribute('data-selected-body-state'), 'none');
    assert.equal(selectionState.textContent, 'none');
    assert.equal(focusRequest.textContent, '0');

    store.selectBody('433');
    store.requestFocus();
    await Promise.resolve();

    root = findByTestId(mount, overlay.PHASE_C_OVERLAY_ROOT_TEST_ID);
    selectionState = findByTestId(mount, overlay.PHASE_C_OVERLAY_SELECTION_TEST_ID);
    focusRequest = findByTestId(mount, overlay.PHASE_C_OVERLAY_FOCUS_REQUEST_TEST_ID);

    assert.equal(root.getAttribute('data-selected-body-state'), 'selected');
    assert.equal(selectionState.textContent, '433');
    assert.equal(focusRequest.textContent, '1');

    dispose();
    assert.equal(findByTestId(mount, overlay.PHASE_C_OVERLAY_HOST_TEST_ID), null);
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
    globalThis.Node = previousNode;
    globalThis.Element = previousElement;
    globalThis.HTMLElement = previousHTMLElement;
  }
});

test('runtime wires the Phase C.1 overlay mount and focus-request bridge without changing scene ownership', () => {
  assert.match(runtimeSource, /mountPhaseCOverlay\(mount\)/);
  assert.match(runtimeSource, /Phase C\.1 bridge: UI dispatches requestFocus\(\) into the external store\./);
  assert.match(runtimeSource, /const disposeUiFocusBridge = subscribeToFocusRequests\(\(\) => \{/);
  assert.match(runtimeSource, /const nextBodyId = resolveStoreSelectedAsteroidBodyId\(readSelectedBody\(\)\);/);
  assert.match(runtimeSource, /startFocusTransition\(nextBodyId, nextOrbitRadius\);/);
  assert.match(runtimeSource, /disposeUiFocusBridge\(\);/);
});
