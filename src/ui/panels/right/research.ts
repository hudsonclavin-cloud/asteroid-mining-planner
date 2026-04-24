// src/ui/panels/right/research.ts
// Stage 8b extraction — AI research tab fetch + render block
// TODO: import from src/config — WORKER_URL
// TODO: import from src/physics/nhats — getDisplayDeltaV
// TODO: import from src/utils/markdown — markdownToHtml (or inline below)

// ─── Phase 9: Research Tab ─────────────────────────────────────────────────────

/**
 * markdownToHtml — minimal Markdown-to-HTML converter used by the research tab.
 * Handles headings h2/h3/h4, bold, lists, horizontal rules, and paragraphs.
 */
function markdownToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^---+$/gm, '<hr>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[^<]*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^([^<\n][^\n]*)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

/**
 * renderResearchBriefing — populates the research tab DOM with the provided
 * Markdown content and usage metadata. Hides the hint/error/loading elements
 * and shows the content + meta elements.
 *
 * @param html    Pre-rendered HTML string (pass through markdownToHtml first)
 * @param meta    Model/token usage string
 */
export function renderResearchBriefing(html: string, meta: string): void {
  const contentEl = document.getElementById('research-content');
  const metaEl    = document.getElementById('research-meta');
  const loadingEl = document.getElementById('research-loading');
  const errorEl   = document.getElementById('research-error');
  const hintEl    = document.getElementById('research-prompt-hint');
  if (!contentEl || !metaEl) return;
  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl)   errorEl.style.display   = 'none';
  if (hintEl)    hintEl.style.display    = 'none';
  contentEl.innerHTML     = html;
  metaEl.textContent      = meta;
  contentEl.style.display = 'block';
  metaEl.style.display    = 'block';
}

/**
 * fetchResearchBriefing — fetches an AI-generated research briefing for the
 * given asteroid from the /api/research endpoint. Results are cached in
 * sessionStorage keyed by asteroid designation. Handles loading/error states
 * and calls renderResearchBriefing on success.
 *
 * @param ast         Asteroid data object
 * @param WORKER_URL  Base URL for the Cloudflare Worker API
 * @param getDisplayDeltaV  Function to get the best available ΔV for an asteroid
 */
export async function fetchResearchBriefing(
  ast: any,
  WORKER_URL: string,
  getDisplayDeltaV: (ast: any) => number,
): Promise<void> {
  const cacheKey = 'research_' + (ast.pdes || ast.full_name || 'unknown');
  const contentEl = document.getElementById('research-content');
  const loadingEl = document.getElementById('research-loading');
  const errorEl   = document.getElementById('research-error');
  const metaEl    = document.getElementById('research-meta');
  const hintEl    = document.getElementById('research-prompt-hint');

  if (!contentEl || !loadingEl || !errorEl || !metaEl || !hintEl) return;

  hintEl.style.display    = 'none';
  errorEl.style.display   = 'none';
  contentEl.style.display = 'none';
  metaEl.style.display    = 'none';

  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { html, meta } = JSON.parse(cached);
      contentEl.innerHTML     = html;
      metaEl.textContent      = meta;
      contentEl.style.display = 'block';
      metaEl.style.display    = 'block';
      return;
    } catch (_) {}
  }

  const endpoint = WORKER_URL + '/api/research';
  loadingEl.style.display = 'block';
  try {
    const payload = {
      asteroidName: ast.full_name || ast.pdes,
      designation:  ast.pdes,
      spectralType: ast.spec || ast.spec_T || '',
      orbit: { a: ast.a, e: ast.e, i: ast.i },
      deltaV_kms: getDisplayDeltaV(ast).toFixed(2),
    };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    const html = markdownToHtml(data.content || '');
    const meta = data.usage
      ? `Model: ${data.model || 'gpt-4o-mini'} · ${data.usage.prompt_tokens ?? '?'} prompt + ${data.usage.completion_tokens ?? '?'} completion tokens`
      : '';
    sessionStorage.setItem(cacheKey, JSON.stringify({ html, meta }));
    contentEl.innerHTML     = html;
    metaEl.textContent      = meta;
    contentEl.style.display = 'block';
    metaEl.style.display    = 'block';
  } catch (err: any) {
    console.error('[Research] fetch error:', err);
    errorEl.innerHTML = `<div>AI research unavailable (${err.message}).</div>
  <div style="margin-top:8px">Look up this asteroid manually on JPL SBDB:<br>
  <a href="https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html"
     target="_blank" style="color:#00d4ff">
    ssd.jpl.nasa.gov/tools/sbdb_lookup.html
  </a></div>`;
    errorEl.style.display = 'block';
  } finally {
    loadingEl.style.display = 'none';
  }
}
