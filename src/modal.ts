/**
 * Shared modal scaffold used by the settings panel and the failure-feedback dialog.
 * Handles the common overlay/backdrop, Escape-to-close, one-at-a-time dedupe, and base styling
 * (overlay, box, title, primary/secondary buttons). Callers supply the inner HTML, wire up their
 * own controls, and add any content-specific styles of their own.
 */

import { addStyle } from "./utils";

/** Ref/id used for the shared base stylesheet, injected once. */
const styleRef = "yfswg-modal";

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
  /** HTML for the modal body (everything inside the box). Use `.yfswg-modal-title` / `.yfswg-modal-btn*` for shared styling. */
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
  overlay.className = "yfswg-modal-overlay";
  overlay.innerHTML = `<div class="yfswg-modal-box" role="${opts.role ?? "dialog"}" aria-modal="true" aria-label="${opts.label}">${opts.innerHtml}</div>`;

  const modal = overlay.querySelector<HTMLElement>(".yfswg-modal-box")!;

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

const modalStyle = `
.yfswg-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  font-family: "Roboto", "Arial", sans-serif;
}
.yfswg-modal-box {
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
.yfswg-modal-title {
  margin: 0 0 16px;
  font-size: 1.8rem;
  font-weight: 500;
}
.yfswg-modal-btn {
  padding: 8px 16px;
  font-size: 1.4rem;
  font-weight: 500;
  font-family: inherit;
  border-radius: 18px;
  border: none;
  cursor: pointer;
}
.yfswg-modal-btn--primary {
  background: var(--yt-spec-call-to-action, #065fd4);
  color: #fff;
}
.yfswg-modal-btn--secondary {
  background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.08));
  color: inherit;
}
.yfswg-modal-btn:hover {
  filter: brightness(1.1);
}
`;
