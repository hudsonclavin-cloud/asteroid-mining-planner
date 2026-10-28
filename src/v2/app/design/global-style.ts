import { colors } from './tokens.js';

const STYLE_ID = 'aster-v2-global-focus-style';

export function installGlobalFocusStyle(): void {
  if (typeof document === 'undefined' || !document.head || document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `:where(button, a, input, select, textarea, [tabindex]):focus-visible { outline: 2px solid ${colors.dark.accent}; outline-offset: 2px; }`;
  document.head.appendChild(style);
}
