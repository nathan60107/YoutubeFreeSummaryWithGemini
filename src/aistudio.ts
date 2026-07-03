/**
 * Google AI Studio side: picks up the subtitle payload handed off from the YouTube tab and
 * injects it into the prompt input, ready for the user to run.
 */

import { reportFailure } from "./feedback";
import { takeSummaryPayload } from "./handoff";
import { error, log, warn, waitForSelector } from "./utils";

/**
 * Candidate selectors for AI Studio's prompt input, most specific first. AI Studio is an Angular
 * Material app whose DOM shifts over time, so we try several and fall back to the first visible
 * textarea on the page.
 */
const promptInputSelectors = [
  "ms-autosize-textarea textarea",
  "ms-prompt-input-wrapper textarea",
  "textarea[aria-label]",
  "textarea",
];

/** Entry point for the AI Studio tab. Call once on load. */
export async function initAiStudio(): Promise<void> {
  const payload = await takeSummaryPayload();
  if(!payload)
    return; // normal AI Studio visit, nothing to inject

  try {
    const textarea = await waitForPromptInput();
    if(!textarea) {
      warn("Could not find the AI Studio prompt input to inject into.");
      void reportFailure({
        context: "aistudio:no-input",
        userMessage: "在 AI Studio 找不到輸入框，可能是頁面尚未載入完成或版面改版。請重新整理頁面後再試一次。",
      });
      return;
    }

    injectPrompt(textarea, payload.prompt);
    log(`Injected subtitles into AI Studio prompt${payload.title ? ` for "${payload.title}"` : ""}.`);

    if(payload.autoSubmit)
      await submitPrompt(textarea);
    else
      log("Auto-submit disabled; leaving the prompt for review.");
  }
  catch(err) {
    error("Failed to inject the prompt into AI Studio:", err);
    void reportFailure({ context: "aistudio:inject-error" });
  }
}

/** Waits (generously, since AI Studio loads slowly) for any candidate prompt input to appear. */
async function waitForPromptInput(): Promise<HTMLTextAreaElement | null> {
  const combined = promptInputSelectors.join(", ");
  const found = await waitForSelector<HTMLTextAreaElement>(combined, 20_000, 200);
  if(!found)
    return null;

  // Prefer a visible one if several match.
  const all = [...document.querySelectorAll<HTMLTextAreaElement>(combined)];
  return all.find(el => el.offsetParent !== null) ?? found;
}

/** Candidate selectors for AI Studio's "Run" button, most specific first. */
const runButtonSelectors = [
  "ms-run-button button",
  "run-button button",
  "button.run-button",
  "button[aria-label='Run']",
];
/** Button label texts that mean "run / submit" across locales. */
const runButtonTexts = /^(run|執行|送出|傳送)$/i;

/**
 * Submits the prompt on the user's behalf: clicks the Run button once it becomes enabled,
 * falling back to the Ctrl+Enter shortcut if the button can't be located.
 */
async function submitPrompt(textarea: HTMLTextAreaElement): Promise<void> {
  const button = await waitForRunButton();
  if(button) {
    button.click();
    log("Clicked AI Studio Run button.");
    return;
  }

  warn("Run button not found; trying Ctrl+Enter fallback.");
  dispatchRunShortcut(textarea);
}

/** Polls for a visible, enabled Run button (Angular enables it once the prompt has content). */
function waitForRunButton(timeoutMs = 8000, intervalMs = 150): Promise<HTMLButtonElement | null> {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      const btn = findRunButton();
      if(btn)
        return resolve(btn);
      if(Date.now() - start > timeoutMs)
        return resolve(null);
      setTimeout(check, intervalMs);
    };
    check();
  });
}

/** Finds a clickable Run button by selector or by button text. */
function findRunButton(): HTMLButtonElement | null {
  const bySelector = [...document.querySelectorAll<HTMLButtonElement>(runButtonSelectors.join(", "))];
  const byText = [...document.querySelectorAll<HTMLButtonElement>("button")]
    .filter(b => runButtonTexts.test(b.textContent?.trim() ?? ""));
  return [...bySelector, ...byText].find(isClickable) ?? null;
}

/** Whether a button is visible and not disabled. */
function isClickable(btn: HTMLButtonElement): boolean {
  return btn.offsetParent !== null && !btn.disabled && btn.getAttribute("aria-disabled") !== "true";
}

/** Dispatches Ctrl+Enter, AI Studio's keyboard shortcut to run the prompt. */
function dispatchRunShortcut(el: HTMLElement): void {
  const opts: KeyboardEventInit = {
    key: "Enter", code: "Enter", keyCode: 13, which: 13,
    ctrlKey: true, bubbles: true, cancelable: true,
  } as KeyboardEventInit;
  el.dispatchEvent(new KeyboardEvent("keydown", opts));
  el.dispatchEvent(new KeyboardEvent("keyup", opts));
}

/**
 * Sets a value on an Angular-controlled textarea. Assigning `.value` directly is ignored by
 * Angular's change detection, so we use the native value setter and dispatch an `input` event.
 */
function injectPrompt(textarea: HTMLTextAreaElement, value: string): void {
  const proto = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window).HTMLTextAreaElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set
    ?? Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;

  if(setter)
    setter.call(textarea, value);
  else
    textarea.value = value;

  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
  textarea.focus();
}
