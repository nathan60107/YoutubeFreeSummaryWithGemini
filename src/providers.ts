/**
 * AI provider registry + the generic "target tab" engine.
 *
 * The YouTube side captures subtitles and hands off a {@linkcode SummaryPayload}; the target tab
 * (whichever AI site the user picked) picks it up and injects it into that site's prompt input,
 * optionally submitting. Every site has a different DOM (textarea vs. contenteditable rich editor)
 * and different submit affordances, so each is described declaratively by an {@linkcode AiProvider}
 * and driven by one shared engine below.
 */

import { reportFailure } from "./feedback";
import { takeSummaryPayload } from "./handoff";
import { t, type TranslationKey } from "./i18n";
import { error, log, warn } from "./log";
import { waitForSelector } from "./utils";

/**
 * How a provider's prompt field accepts text:
 * - `textarea`: a real `<textarea>` (AI Studio). Set via the native value setter + input event.
 * - `contenteditable`: a rich editor div (ChatGPT/Claude ProseMirror, Gemini Quill). Filled by the
 *   verified cascade in {@linkcode injectContentEditable} (synthetic paste → execCommand → textContent).
 */
export type InputKind = "textarea" | "contenteditable";

/** Keyboard shortcut a provider uses to submit the prompt, when no button click is possible. */
export type SubmitShortcut = "enter" | "ctrl-enter";

/** Declarative description of one AI site we can hand a transcript off to. */
export interface AiProvider {
  /** Stable id persisted in config. Never change an existing one. */
  id: string;
  /** Human-facing name shown in the settings dropdown and the button tooltip. Not translated (a brand). */
  label: string;
  /** Translation key of this provider's quality/limitations note, shown in settings when selected. */
  note: TranslationKey;
  /** Marks the suggested provider so the settings UI can flag it as recommended. */
  recommended?: boolean;
  /** URL opened on the YouTube side to start a fresh chat. */
  newChatUrl: string;
  /** Hostnames this provider owns, used to route the target side. Exact host suffix match. */
  hosts: string[];
  /** Whether the prompt field is a textarea or a contenteditable rich editor. */
  inputKind: InputKind;
  /** Candidate prompt-input selectors, most specific first. */
  inputSelectors: string[];
  /** Candidate submit-button selectors, most specific first. */
  submitSelectors: string[];
  /** Fallback: button label texts (any locale) that mean "send / run". */
  submitTexts?: RegExp;
  /** Keyboard shortcut used if no submit button can be found. */
  submitShortcut: SubmitShortcut;
  /**
   * Wait for the page to stop mutating (hydration settled) before submitting. Some SPAs (notably
   * Gemini's fresh `/app` landing) accept a too-early submit but then reset the view instead of
   * routing to the new conversation — the request still runs in the background, but the tab looks
   * like nothing happened. Rather than guess a fixed delay, we watch the DOM and submit once it goes
   * quiet (capped by a timeout). Defaults to submitting immediately.
   */
  settleBeforeSubmit?: boolean;
}

/** Google AI Studio (the original target). Uses a plain textarea + a "Run" button. */
const aiStudio: AiProvider = {
  id: "aistudio",
  label: "Google AI Studio",
  note: "provider.aistudio.note",
  recommended: true,
  newChatUrl: "https://aistudio.google.com/prompts/new_chat",
  hosts: ["aistudio.google.com"],
  inputKind: "textarea",
  inputSelectors: [
    "ms-autosize-textarea textarea",
    "ms-prompt-input-wrapper textarea",
    "textarea[aria-label]",
    "textarea",
  ],
  submitSelectors: [
    "ms-run-button button",
    "run-button button",
    "button.run-button",
    "button[aria-label='Run']",
  ],
  submitTexts: /^(run|執行|送出|傳送)$/i,
  submitShortcut: "ctrl-enter",
};

/** Consumer Gemini (gemini.google.com) — a Quill rich editor, not AI Studio. */
const gemini: AiProvider = {
  id: "gemini",
  label: "Gemini",
  note: "provider.gemini.note",
  newChatUrl: "https://gemini.google.com/app",
  hosts: ["gemini.google.com"],
  inputKind: "contenteditable",
  inputSelectors: [
    "rich-textarea .ql-editor[contenteditable='true']",
    "div.ql-editor[contenteditable='true']",
    "[role='textbox'][contenteditable='true']",
  ],
  submitSelectors: [
    "button.send-button",
    "button[aria-label*='傳送']",
    "button[aria-label*='發送']",
    "button[aria-label*='Send']",
  ],
  submitShortcut: "enter",
  // Gemini's /app landing resets the view on a too-early submit; wait for it to settle first.
  settleBeforeSubmit: true,
};

/** ChatGPT (chatgpt.com) — ProseMirror contenteditable `#prompt-textarea`. */
const chatgpt: AiProvider = {
  id: "chatgpt",
  label: "ChatGPT",
  note: "provider.chatgpt.note",
  newChatUrl: "https://chatgpt.com/",
  hosts: ["chatgpt.com", "chat.openai.com"],
  inputKind: "contenteditable",
  inputSelectors: [
    "#prompt-textarea",
    "div.ProseMirror[contenteditable='true']",
    "[contenteditable='true'][id='prompt-textarea']",
  ],
  submitSelectors: [
    "button[data-testid='send-button']",
    "#composer-submit-button",
    "button[aria-label*='Send']",
  ],
  submitShortcut: "enter",
};

/** Claude (claude.ai) — ProseMirror contenteditable editor. */
const claude: AiProvider = {
  id: "claude",
  label: "Claude",
  note: "provider.claude.note",
  newChatUrl: "https://claude.ai/new",
  hosts: ["claude.ai"],
  inputKind: "contenteditable",
  inputSelectors: [
    "div.ProseMirror[contenteditable='true']",
    "[contenteditable='true'][role='textbox']",
    "fieldset div.ProseMirror",
  ],
  submitSelectors: [
    "button[aria-label='Send message']",
    "button[aria-label*='Send']",
  ],
  submitShortcut: "enter",
};

/** Grok (grok.com) — a plain textarea composer. */
const grok: AiProvider = {
  id: "grok",
  label: "Grok",
  note: "provider.grok.note",
  newChatUrl: "https://grok.com/",
  hosts: ["grok.com"],
  inputKind: "textarea",
  inputSelectors: [
    "textarea[aria-label]",
    "textarea[dir='auto']",
    "form textarea",
    "textarea",
  ],
  submitSelectors: [
    "button[type='submit']",
    "button[aria-label*='Submit']",
    "button[aria-label*='Send']",
  ],
  submitShortcut: "enter",
};

/** All supported providers, ordered best-to-worst (roughly) — this is the order shown to the user. */
export const providers: readonly AiProvider[] = [aiStudio, grok, claude, gemini, chatgpt];

/** Provider used when config is empty or references an unknown id (keeps old behaviour). */
export const defaultProvider = aiStudio;

/** Looks up a provider by its persisted id, falling back to {@linkcode defaultProvider}. */
export function getProviderById(id: string | undefined): AiProvider {
  return providers.find(p => p.id === id) ?? defaultProvider;
}

/** Returns the provider that owns the given hostname, if any (used to route the target tab). */
export function getProviderByHost(hostname: string): AiProvider | undefined {
  return providers.find(p => p.hosts.some(h => hostname === h || hostname.endsWith(`.${h}`)));
}

/**
 * Entry point for a target tab. Reads the pending payload (if this tab was opened by our YouTube
 * side) and injects it into `provider`'s prompt field. A no-op on a normal, unrelated visit.
 */
export async function initProviderTarget(provider: AiProvider): Promise<void> {
  const payload = await takeSummaryPayload();
  if(!payload)
    return; // normal visit, nothing to inject

  try {
    let input = await waitForInput(provider);
    if(!input) {
      warn(`Could not find the ${provider.label} prompt input to inject into.`);
      void reportFailure({
        context: `provider:${provider.id}:no-input`,
        userMessage: t("error.noInput", provider.label),
      });
      return;
    }

    injectPrompt(provider, input, payload.prompt);
    log(`Injected subtitles into ${provider.label}${payload.title ? ` for "${payload.title}"` : ""}.`);

    if(payload.autoSubmit) {
      if(provider.settleBeforeSubmit)
        input = await settleBeforeSubmit(provider, input, payload.prompt);
      await submitPrompt(provider, input);
    }
    else {
      log("Auto-submit disabled; leaving the prompt for review.");
    }
  }
  catch(err) {
    error(`Failed to inject the prompt into ${provider.label}:`, err);
    void reportFailure({ context: `provider:${provider.id}:inject-error` });
  }
}

/**
 * Waits for the page to stop mutating before submitting, then makes sure our text is still in the
 * field (the hydration churn can replace or clear the editor). Returns the input to submit against —
 * re-resolved if the original node was swapped out. Used only by providers with `settleBeforeSubmit`.
 */
async function settleBeforeSubmit(provider: AiProvider, input: HTMLElement, value: string): Promise<HTMLElement> {
  await waitForDomQuiet();

  // If the settled app swapped the editor node or wiped its contents, re-find and re-inject.
  const current = input.isConnected ? input : await waitForInput(provider) ?? input;
  if(provider.inputKind === "contenteditable" && !hasText(current)) {
    log(`${provider.label} cleared the prompt while settling; re-injecting.`);
    injectPrompt(provider, current, value);
  }
  return current;
}

/**
 * Resolves once the DOM has gone `quietMs` without a mutation (a proxy for "the SPA finished
 * hydrating"), or after `maxMs` regardless so it can never hang. Cheaper and more accurate than a
 * fixed sleep: it proceeds the moment the app calms down and only waits longer when it's still busy.
 */
function waitForDomQuiet(quietMs = 450, maxMs = 6000): Promise<void> {
  return new Promise((resolve) => {
    let quietTimer = 0;
    const finish = () => {
      clearTimeout(quietTimer);
      clearTimeout(hardCap);
      obs.disconnect();
      resolve();
    };
    const obs = new MutationObserver(() => {
      clearTimeout(quietTimer);
      quietTimer = window.setTimeout(finish, quietMs);
    });
    obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
    quietTimer = window.setTimeout(finish, quietMs);
    const hardCap = window.setTimeout(finish, maxMs);
  });
}

/** Waits (generously — these apps load slowly) for any candidate prompt input to appear. */
async function waitForInput(provider: AiProvider): Promise<HTMLElement | null> {
  const combined = provider.inputSelectors.join(", ");
  const found = await waitForSelector<HTMLElement>(combined, 20_000, 200);
  if(!found)
    return null;

  // Prefer a visible one if several match.
  const all = [...document.querySelectorAll<HTMLElement>(combined)];
  return all.find(el => el.offsetParent !== null) ?? found;
}

/** Dispatches text into the provider's prompt field according to its {@linkcode InputKind}. */
function injectPrompt(provider: AiProvider, input: HTMLElement, value: string): void {
  if(provider.inputKind === "textarea")
    injectTextarea(input as HTMLTextAreaElement, value);
  else
    injectContentEditable(input, value);
}

/**
 * Sets a value on a framework-controlled textarea. Assigning `.value` directly is ignored by
 * Angular/React change detection, so we use the native value setter and dispatch an `input` event.
 */
function injectTextarea(textarea: HTMLTextAreaElement, value: string): void {
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

/**
 * Inserts text into a contenteditable rich editor (ProseMirror/Quill/Lexical). These editors ignore
 * direct `textContent` writes, so we try, in order, the techniques they *do* honour, and after each
 * one check whether text actually landed before giving up on it:
 *   1. a synthetic `paste` carrying the transcript as `text/plain` (editors convert newlines to
 *      their own block structure) — but a "handled" paste can still insert nothing if the engine
 *      ignores our constructed `clipboardData`, so we verify rather than trusting `defaultPrevented`;
 *   2. `execCommand("insertText")`, which fires the `beforeinput` these editors listen to;
 *   3. a raw `textContent` write + `input` event as a last resort.
 * Verifying between steps is what makes auto-submit work: the send button only enables once the
 * editor's own model actually holds the text.
 */
function injectContentEditable(el: HTMLElement, value: string): void {
  el.focus();
  placeCaretAtEnd(el);

  try {
    const dt = new DataTransfer();
    dt.setData("text/plain", value);
    const paste = new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true });
    el.dispatchEvent(paste);
    if(hasText(el))
      return; // the editor consumed the paste and text landed
  }
  catch(err) {
    warn("Synthetic paste failed, falling back to execCommand:", err);
  }

  if(document.execCommand("insertText", false, value) && hasText(el))
    return;

  warn("Paste and execCommand both left the editor empty; writing textContent directly.");
  el.textContent = value;
  el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
}

/** Whether a contenteditable currently holds any non-whitespace text. */
function hasText(el: HTMLElement): boolean {
  return (el.textContent ?? "").trim().length > 0;
}

/** Collapses the selection to the end of a contenteditable so insertions land inside it. */
function placeCaretAtEnd(el: HTMLElement): void {
  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
  catch(err) {
    warn("Could not place caret in the editor:", err);
  }
}

/**
 * Submits the prompt on the user's behalf: clicks the provider's submit button once it becomes
 * enabled, falling back to the provider's keyboard shortcut if the button can't be located.
 */
async function submitPrompt(provider: AiProvider, input: HTMLElement): Promise<void> {
  const button = await waitForSubmitButton(provider);
  if(button) {
    button.click();
    log(`Clicked ${provider.label} submit button.`);
    return;
  }

  warn(`${provider.label} submit button not found; trying keyboard shortcut fallback.`);
  dispatchSubmitShortcut(input, provider.submitShortcut);
}

/** Polls for a visible, enabled submit button (frameworks enable it once the prompt has content). */
function waitForSubmitButton(provider: AiProvider, timeoutMs = 8000, intervalMs = 150): Promise<HTMLButtonElement | null> {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      const btn = findSubmitButton(provider);
      if(btn)
        return resolve(btn);
      if(Date.now() - start > timeoutMs)
        return resolve(null);
      setTimeout(check, intervalMs);
    };
    check();
  });
}

/** Finds a clickable submit button by selector or (fallback) by button text. */
function findSubmitButton(provider: AiProvider): HTMLButtonElement | null {
  const bySelector = [...document.querySelectorAll<HTMLButtonElement>(provider.submitSelectors.join(", "))];
  const { submitTexts } = provider;
  const byText = submitTexts
    ? [...document.querySelectorAll<HTMLButtonElement>("button")]
      .filter(b => submitTexts.test(b.textContent?.trim() ?? ""))
    : [];
  return [...bySelector, ...byText].find(isClickable) ?? null;
}

/** Whether a button is visible and not disabled. */
function isClickable(btn: HTMLButtonElement): boolean {
  return btn.offsetParent !== null && !btn.disabled && btn.getAttribute("aria-disabled") !== "true";
}

/** Dispatches the provider's submit shortcut (Enter or Ctrl+Enter) on the prompt field. */
function dispatchSubmitShortcut(el: HTMLElement, shortcut: SubmitShortcut): void {
  const opts: KeyboardEventInit = {
    key: "Enter", code: "Enter", keyCode: 13, which: 13,
    ctrlKey: shortcut === "ctrl-enter", bubbles: true, cancelable: true,
  } as KeyboardEventInit;
  el.dispatchEvent(new KeyboardEvent("keydown", opts));
  el.dispatchEvent(new KeyboardEvent("keyup", opts));
}
