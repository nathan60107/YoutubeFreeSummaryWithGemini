import { addGlobalStyle, openInNewTab, randomId, type LooseUnion } from "@sv443-network/userutils";
import type resources from "../assets/resources.json";

//#region logging

/** Shared console prefix so every log is filterable and never lost behind a missing tag. */
const logPrefix = "[YFSWG]";

/** Log severity levels captured into the in-memory buffer. */
type LogLevel = "log" | "warn" | "error";
/** A single captured log line. */
interface LogEntry {
  /** Epoch ms when the line was logged. */
  t: number;
  level: LogLevel;
  /** The stringified log arguments, joined by spaces. */
  msg: string;
}

/**
 * In-memory ring buffer of the most recent log lines from all three streams. Kept in RAM only
 * (never persisted) so a debug report can include recent history without touching storage.
 */
const logBuffer: LogEntry[] = [];
/** Cap on retained log lines; oldest are dropped past this to bound memory use. */
const maxLogEntries = 300;

/** Best-effort conversion of a single log argument to a readable string (expanding Errors/objects). */
function stringifyArg(arg: unknown): string {
  if(typeof arg === "string")
    return arg;
  if(arg instanceof Error)
    return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ""}`;
  try {
    return JSON.stringify(arg);
  }
  catch {
    return String(arg);
  }
}

/** Appends a line to {@linkcode logBuffer}, trimming it back down to {@linkcode maxLogEntries}. */
function record(level: LogLevel, args: unknown[]): void {
  logBuffer.push({ t: Date.now(), level, msg: args.map(stringifyArg).join(" ") });
  if(logBuffer.length > maxLogEntries)
    logBuffer.splice(0, logBuffer.length - maxLogEntries);
}

/** Prefixed `console.log`, also captured into the in-memory log buffer. */
export const log = (...args: unknown[]) => { record("log", args); console.log(logPrefix, ...args); };
/** Prefixed `console.warn`, also captured into the in-memory log buffer. */
export const warn = (...args: unknown[]) => { record("warn", args); console.warn(logPrefix, ...args); };
/** Prefixed `console.error`, also captured into the in-memory log buffer. */
export const error = (...args: unknown[]) => { record("error", args); console.error(logPrefix, ...args); };

/** Returns the captured log lines (oldest first), each formatted as `[ISO time] LEVEL message`. */
export function getRecentLogs(): string[] {
  return logBuffer.map(e => `[${new Date(e.t).toISOString()}] ${e.level.toUpperCase()} ${e.msg}`);
}

//#region resources

/** Key of a resource in `assets/resources.json` and extra keys defined by `tools/post-build.ts` */
export type ResourceKey = keyof typeof resources;

/**
 * Returns the URL of a resource by its name, as defined in `assets/resources.json`, from GM resource cache - [see GM.getResourceUrl docs](https://wiki.greasespot.net/GM.getResourceUrl)  
 * Falls back to a `raw.githubusercontent.com` URL or base64-encoded data URI if the resource is not available in the GM resource cache.  
 * ⚠️ Requires the directive `@grant GM.getResourceUrl`
 */
export async function getResourceUrl(name: LooseUnion<ResourceKey>) {
  let url = await GM.getResourceUrl(name);
  if(!url || url.length === 0) {
    warn(`Couldn't get blob URL nor external URL for @resource '${name}', trying to use base64-encoded fallback`);
    // @ts-ignore
    url = await GM.getResourceUrl(name, false);
  }
  return url;
}

//#region requests / urls

/**
 * Sends a request with the specified parameters and returns the response as a Promise.  
 * Ignores the CORS policy, contrary to fetch and fetchAdvanced.  
 * ⚠️ Requires the directive `@grant GM.xmlhttpRequest`
 */
export function sendRequest<T = any>(details: GM.Request<T>) {
  return new Promise<GM.Response<T>>((resolve, reject) => {
    GM.xmlHttpRequest({
      timeout: 10_000,
      ...details,
      onload: resolve,
      onerror: reject,
      ontimeout: reject,
      onabort: reject,
    });
  });
}

/**
 * Opens the given URL in a new tab, using GM.openInTab if available  
 * ⚠️ Requires the directive `@grant GM.openInTab`
 */
export function openInTab(href: string, background = true) {
  try {
    openInNewTab(href, background);
  }
  catch(err) {
    window.open(href, "_blank", "noopener noreferrer");
  }
}

//#region DOM utils

export let domLoaded = document.readyState === "complete" || document.readyState === "interactive";
document.addEventListener("DOMContentLoaded", () => domLoaded = true);

/**
 * Adds generic, accessible interaction listeners to the passed element.  
 * All listeners have the default behavior prevented and stop immediate propagation.
 * @param listenerOptions Provide a {@linkcode listenerOptions} object to configure the listeners
 */
export function onInteraction<TElem extends HTMLElement>(elem: TElem, listener: (evt: MouseEvent | KeyboardEvent) => void, listenerOptions?: AddEventListenerOptions) {
  const proxListener = (e: MouseEvent | KeyboardEvent) => {
    if(e instanceof KeyboardEvent && !(["Enter", " ", "Space", "Spacebar"].includes(e.key)))
      return;
    e.preventDefault();
    e.stopImmediatePropagation();
    listenerOptions?.once && e.type === "keydown" && elem.removeEventListener("click", proxListener, listenerOptions);
    listenerOptions?.once && e.type === "click" && elem.removeEventListener("keydown", proxListener, listenerOptions);
    listener(e);
  };
  elem.addEventListener("click", proxListener, listenerOptions);
  elem.addEventListener("keydown", proxListener, listenerOptions);
}

/** Resolves with the first element matching `selector`, polling until found or `timeoutMs` elapses (then `null`). */
export function waitForSelector<T extends Element>(selector: string, timeoutMs = 4000, intervalMs = 100): Promise<T | null> {
  const existing = document.querySelector<T>(selector);
  if(existing)
    return Promise.resolve(existing);

  return new Promise((resolve) => {
    const start = Date.now();
    const timer = setInterval(() => {
      const el = document.querySelector<T>(selector);
      if(el || Date.now() - start > timeoutMs) {
        clearInterval(timer);
        resolve(el);
      }
    }, intervalMs);
  });
}

/** Removes all child nodes of an element without invoking the slow-ish HTML parser */
export function clearInner(element: Element) {
  while(element.hasChildNodes())
    clearNode(element!.firstChild as Element);
}

function clearNode(element: Element) {
  while(element.hasChildNodes())
    clearNode(element!.firstChild as Element);
  element.parentNode!.removeChild(element);
}

/**
 * Adds a style element to the DOM at runtime.
 * @param css The CSS stylesheet to add
 * @param ref A reference string to identify the style element - defaults to a random 5-character string
 */
export function addStyle(css: string, ref?: string) {
  if(!domLoaded)
    throw new Error("DOM has not finished loading yet");
  const elem = addGlobalStyle(css);
  elem.id = `global-style-${ref ?? randomId(5, 36)}`;
  return elem;
}
