/**
 * Inline SVG icons used in the UI. Inline (rather than image resources) so they scale crisply
 * and inherit the button's text color via `currentColor`, adapting to YouTube's light/dark theme.
 */

/** "AI summarize" sparkle: one large four-point star plus two small ones. */
export const sparkleIcon = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
  <path d="M11 3l1.6 4.4L17 9l-4.4 1.6L11 15l-1.6-4.4L5 9l4.4-1.6L11 3z"/>
  <path d="M18 12l.8 2.2L21 15l-2.2.8L18 18l-.8-2.2L15 15l2.2-.8L18 12z"/>
  <path d="M5.5 14l.6 1.7L8 16.3l-1.9.6L5.5 19l-.6-2.1L3 16.3l1.9-.6L5.5 14z"/>
</svg>`.trim();

/**
 * Spinning loading indicator: a ~270° arc drawn with `currentColor`. Rotation comes from the
 * `yfswg-spin` CSS keyframes applied to its container while a summary is in progress.
 */
export const loadingIcon = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
  <path d="M12 3a9 9 0 1 0 6.4 2.65"/>
</svg>`.trim();

/** Standard settings gear/cog. */
export const gearIcon = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
  <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.3 7.3 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.4 2h-2.8a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.81 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.69.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.54c.05.24.25.42.49.42h2.8c.24 0 .45-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.26.12.55.02.69-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/>
</svg>`.trim();
