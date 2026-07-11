/**
 * Shared modal scaffold used by the settings panel and the failure-feedback dialog.
 * Handles the common overlay/backdrop, Escape-to-close, one-at-a-time dedupe, and base styling
 * (overlay, box, title, primary/secondary buttons). Callers supply the inner HTML, wire up their
 * own controls, and add any content-specific styles of their own.
 */

import { addStyle, setInnerHtml } from "./utils";

/** Ref/id used for the shared base stylesheet, injected once. */
const styleRef = "yfas-modal";

export interface ModalHandle {
  /** The full-screen overlay/backdrop element (also the query root for the caller's controls). */
  overlay: HTMLDivElement;
  /** The centered modal box; content lives here. */
  modal: HTMLElement;
  /** Removes the modal from the DOM and detaches its document-level listeners. */
  close: () => void;
}

export interface ModalOptions {
  /** Unique element id for the overlay, used to prevent opening duplicates. */
  id: string;
  /** Accessible label for the dialog. */
  label: string;
  /** ARIA role; use `"alertdialog"` for error/alert dialogs. Defaults to `"dialog"`. */
  role?: "dialog" | "alertdialog";
  /** HTML for the modal body (everything inside the box). Use `.yfas-modal-title` / `.yfas-modal-btn*` for shared styling. */
  innerHtml: string;
}

/**
 * Opens a modal using the shared scaffold and returns a {@linkcode ModalHandle}, or `null` if a
 * modal with the same `id` is already open (so the caller can early-return). The dialog closes on
 * Escape or a backdrop click; clicks inside the box are not propagated to the backdrop.
 */
export function openModal(opts: ModalOptions): ModalHandle | null {
  if(document.getElementById(opts.id))
    return null;

  if(!document.getElementById(`global-style-${styleRef}`))
    addStyle(modalStyle, styleRef);

  const overlay = document.createElement("div");
  overlay.id = opts.id;
  overlay.className = "yfas-modal-overlay";
  mirrorYouTubeTheme(overlay);
  setInnerHtml(overlay, `<div class="yfas-modal-box" role="${opts.role ?? "dialog"}" aria-modal="true" aria-label="${opts.label}">${opts.innerHtml}</div>`);

  const modal = overlay.querySelector<HTMLElement>(".yfas-modal-box")!;

  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKeydown);
  };
  const onKeydown = (e: KeyboardEvent) => {
    if(e.key === "Escape")
      close();
  };

  overlay.addEventListener("click", (e) => {
    if(e.target === overlay)
      close();
  });
  modal.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("keydown", onKeydown);

  document.body.appendChild(overlay);
  return { overlay, modal, close };
}

// The modal sits under `<body>`, a sibling of `<ytd-app>`, and native YouTube doesn't publish its
// `--yt-spec-*` tokens at document scope, so `var(--yt-spec-…)` falls back to light even in dark
// mode. Enhancer for YouTube does publish them globally, so its palette is inherited as-is.
const darkTokens: Record<string, string> = {
  "--yt-spec-base-background": "#0f0f0f",
  "--yt-spec-text-primary": "#f1f1f1",
  "--yt-spec-text-secondary": "#aaa",
  "--yt-spec-call-to-action": "#3ea6ff",
  "--yt-spec-badge-chip-background": "rgba(255, 255, 255, 0.1)",
  "--yt-spec-10-percent-layer": "rgba(255, 255, 255, 0.2)",
};

function mirrorYouTubeTheme(overlay: HTMLElement): void {
  const dark = isYouTubeDark();
  overlay.style.colorScheme = dark ? "dark" : "light"; // native widgets: scrollbars, <select>, caret

  // If the tokens already reach the modal (Enhancer for YouTube), keep its palette; else supply dark.
  if(getComputedStyle(document.body).getPropertyValue("--yt-spec-base-background").trim())
    return;
  if(dark)
    for(const [name, value] of Object.entries(darkTokens))
      overlay.style.setProperty(name, value);
}

/** Whether YouTube is dark, from the luminance of its painted background, with attribute/OS fallback. */
function isYouTubeDark(): boolean {
  for(const el of [document.querySelector("ytd-app"), document.body, document.documentElement]) {
    const rgba = el && parseRgba(getComputedStyle(el).backgroundColor);
    if(rgba && rgba[3] > 0)
      return 0.299 * rgba[0] + 0.587 * rgba[1] + 0.114 * rgba[2] < 128;
  }
  return document.documentElement.hasAttribute("dark")
    || matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Parses a `rgb()/rgba()` string into `[r, g, b, a]`, or `null` if it isn't in that form. */
function parseRgba(color: string): [number, number, number, number] | null {
  const m = /rgba?\(([^)]+)\)/.exec(color);
  if(!m)
    return null;
  const p = m[1].split(",").map(n => parseFloat(n));
  return [p[0], p[1], p[2], p[3] ?? 1];
}

const modalStyle = `
.yfas-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  font-family: "Roboto", "Arial", sans-serif;
}
.yfas-modal-box {
  width: min(560px, 92vw);
  max-height: 88vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px 24px 24px;
  border-radius: 12px;
  background: var(--yt-spec-base-background, #fff);
  color: var(--yt-spec-text-primary, #0f0f0f);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.yfas-modal-title {
  margin: 0 0 16px;
  font-size: 1.8rem;
  font-weight: 500;
}
.yfas-modal-btn {
  padding: 8px 16px;
  font-size: 1.4rem;
  font-weight: 500;
  font-family: inherit;
  border-radius: 18px;
  border: none;
  cursor: pointer;
}
.yfas-modal-btn--primary {
  background: var(--yt-spec-call-to-action, #065fd4);
  color: #fff;
}
.yfas-modal-btn--secondary {
  background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.08));
  color: inherit;
}
.yfas-modal-btn:hover {
  filter: brightness(1.1);
}
`;
