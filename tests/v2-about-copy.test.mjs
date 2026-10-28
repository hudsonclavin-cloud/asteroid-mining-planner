import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { render } from 'preact';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-about-copy');

class Node_ {
  constructor(nodeType) { this.nodeType = nodeType; this.childNodes = []; this.parentNode = null; }
  get firstChild() { return this.childNodes[0] ?? null; }
  get nextSibling() { return this.parentNode?.childNodes[this.parentNode.childNodes.indexOf(this) + 1] ?? null; }
  appendChild(child) { return this.insertBefore(child, null); }
  insertBefore(child, ref) {
    child.parentNode?.removeChild(child);
    const index = ref === null || ref === undefined ? this.childNodes.length : this.childNodes.indexOf(ref);
    this.childNodes.splice(index, 0, child);
    child.parentNode = this;
    return child;
  }
  removeChild(child) { this.childNodes.splice(this.childNodes.indexOf(child), 1); child.parentNode = null; return child; }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(''); }
}
class Text_ extends Node_ {
  constructor(data) { super(3); this.data = String(data); }
  get textContent() { return this.data; }
  set nodeValue(value) { this.data = String(value); }
  get nodeValue() { return this.data; }
}
class Element_ extends Node_ {
  constructor(name) { super(1); this.localName = name; this.nodeName = name.toUpperCase(); this.attributes = new Map(); this.style = {}; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener() {}
  removeEventListener() {}
}

async function flush() {
  for (let index = 0; index < 20; index += 1) await new Promise((resolve) => setTimeout(resolve, 5));
}

test('About decision record carries no emoji (tail2 F7)', async () => {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'about', 'main.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const provenance = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'data', 'validation-provenance.json'), 'utf8'));
  const mount = new Element_('div');
  const doc = {
    getElementById: () => mount,
    createElement: (name) => new Element_(name),
    createElementNS: (_ns, name) => new Element_(name),
    createTextNode: (data) => new Text_(data),
    title: '',
  };
  const previous = { document: globalThis.document, window: globalThis.window, Node: globalThis.Node, Element: globalThis.Element, HTMLElement: globalThis.HTMLElement, fetch: globalThis.fetch, location: globalThis.location };
  globalThis.document = doc;
  globalThis.window = { document: doc, location: { search: '', pathname: '/v2/about/' }, addEventListener() {}, removeEventListener() {} };
  globalThis.Node = Node_;
  globalThis.Element = Element_;
  globalThis.HTMLElement = Element_;
  globalThis.location = globalThis.window.location;
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => provenance });
  try {
    await import(`${pathToFileURL(path.join(outDir, 'app', 'about', 'main.js')).href}?about-copy=${Date.now()}`);
    await flush();
    const text = mount.textContent;
    assert.match(text, /Launch-feasibility overlay — founding document/);
    assert.match(text, /Mission cost card — founding document/);
    assert.doesNotMatch(text, /[⭐☀-➿\u{1F300}-\u{1FAFF}]/u);
  } finally {
    render(null, mount);
    await flush();
    Object.assign(globalThis, previous);
  }
});
