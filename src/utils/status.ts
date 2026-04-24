/**
 * Status bar helper — displays a short message in #status.
 * Source: index.html lines ~7478–7486.
 */

let statusTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Set the status bar text. Pass autoFade=true to fade the message out after 3 s.
 * Clears any pending auto-fade timer before setting the new message.
 */
export function setStatus(msg: string, autoFade?: boolean): void {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('fade');
  if (statusTimer) clearTimeout(statusTimer);
  if (autoFade) statusTimer = setTimeout(() => el.classList.add('fade'), 3000);
}
