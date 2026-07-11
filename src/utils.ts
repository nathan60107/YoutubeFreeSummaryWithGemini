import { openInNewTab, randomId, type LooseUnion } from "@sv443-network/userutils";
import type resources from "../assets/resources.json";
import { warn } from "./log";

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

/**
 * Minimal shape of the Trusted Types API we depend on. `@types/trusted-types` isn't installed and
 * we only ever touch `createPolicy` and the returned policy's `createHTML`.
 */
interface TrustedTypesLike {
  createPolicy(name: string, rules: { createHTML: (html: string) => string }): { createHTML: (html: string) => string };
}

/**
 * A pass-through Trusted Types policy, or `undefined` when the browser has no Trusted Types.
 * YouTube enforces `require-trusted-types-for 'script'` (observed in incognito windows), so a plain
 * `element.innerHTML = "..."` throws a "Sink type mismatch" CSP violation. Routing HTML through this
 * policy satisfies the enforcement; where Trusted Types is absent, assigning the raw string is
 * already allowed. YouTube ships no `trusted-types` names allowlist, so any policy name is accepted.
 */
const htmlPolicy = (() => {
  const tt = (window as unknown as { trustedTypes?: TrustedTypesLike }).trustedTypes;
  try {
    return tt?.createPolicy("yfas", { createHTML: html => html });
  }
  catch(err) {
    warn("Couldn't create Trusted Types policy; falling back to raw innerHTML:", err);
    return undefined;
  }
})();

/**
 * Sets `element.innerHTML`, wrapping the HTML in a Trusted Types policy where the browser enforces
 * Trusted Types. Use this instead of assigning `innerHTML` directly so the script keeps working
 * under YouTube's CSP (notably in incognito windows, where the assignment otherwise throws).
 */
export function setInnerHtml(element: Element, html: string) {
  element.innerHTML = (htmlPolicy?.createHTML(html) ?? html) as string;
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
  // Use textContent rather than a userutils helper's `innerHTML`: on a <style> element innerHTML is
  // still a Trusted Types sink, which YouTube's CSP blocks in incognito windows. textContent isn't.
  const elem = document.createElement("style");
  elem.textContent = css;
  elem.id = `global-style-${ref ?? randomId(5, 36)}`;
  document.head.appendChild(elem);
  return elem;
}
