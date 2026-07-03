// ==UserScript==
// @name              YoutubeFreeSummaryWithGemini
// @namespace         https://github.com/nathan60107/YoutubeFreeSummaryWithGemini
// @version           0.2.0
// @description       Capture a YouTube video's on-page subtitles and send them straight to Google AI Studio (Gemini) for a free summary
// @homepageURL       https://github.com/nathan60107/YoutubeFreeSummaryWithGemini#readme
// @supportURL        https://github.com/nathan60107/YoutubeFreeSummaryWithGemini/issues
// @license           MIT
// @author            nathan60107
// @copyright         nathan60107 (https://github.com/nathan60107)
// @icon              http://localhost:8710/assets/icon.svg?b=c43a55cf-6193-4d49-a3ac-ab665091b77f
// @match             *://*.youtube.com/*
// @match             *://aistudio.google.com/*
// @run-at            document-start
// @downloadURL       https://raw.githubusercontent.com/nathan60107/YoutubeFreeSummaryWithGemini/develop/dist/YoutubeFreeSummaryWithGemini.user.js
// @updateURL         https://raw.githubusercontent.com/nathan60107/YoutubeFreeSummaryWithGemini/develop/dist/YoutubeFreeSummaryWithGemini.user.js
// @connect           github.com
// @connect           raw.githubusercontent.com
// @grant             GM.getValue
// @grant             GM.setValue
// @grant             GM.deleteValue
// @grant             GM.getResourceUrl
// @grant             GM.xmlHttpRequest
// @grant             GM.openInTab
// @grant             unsafeWindow
// @noframes
// @resource          img-icon http://localhost:8710/assets/icon.svg?b=c43a55cf-6193-4d49-a3ac-ab665091b77f
// @require           https://cdn.jsdelivr.net/npm/@sv443-network/userutils@6.3.0/dist/index.global.js
// @grant             GM.registerMenuCommand
// @grant             GM.listValues
// ==/UserScript==

(function(userutils){'use strict';/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};const buildNumberRaw = "49df324";
/** The build number of the userscript */
const buildNumber = (buildNumberRaw.match(/^#{{.+}}$/) ? "BUILD_ERROR!" : buildNumberRaw); // asserted as generic string instead of literal
/** Default compression format used throughout the entire script */
const compressionFormat = "deflate-raw";
/** Whether sessionStorage is available and working */
typeof (sessionStorage === null || sessionStorage === void 0 ? void 0 : sessionStorage.setItem) !== "undefined"
    && (() => {
        try {
            const key = `_ses_test_${userutils.randomId(4)}`;
            sessionStorage.setItem(key, "test");
            sessionStorage.removeItem(key);
            return true;
        }
        catch (_a) {
            return false;
        }
    })();
/** Info about the userscript, parsed from the userscript header (tools/post-build.js) */
const scriptInfo = {
    name: GM.info.script.name,
    version: GM.info.script.version,
    namespace: GM.info.script.namespace,
};let canCompress;
/** Default prompt template - also used by the settings panel's "reset" action. */
const defaultPromptTemplate = [
    "請依據以下 YouTube 影片字幕（含時間軸）做重點摘要，並在每個重點標註對應的時間戳記。",
    "",
    "影片標題：{{title}}",
    "影片連結：{{url}}",
    "",
    "{{transcript}}",
].join("\n");
/** Factory so the defaults object isn't shared by reference. */
const getDefaultConfig = () => ({
    promptTemplate: defaultPromptTemplate,
    includeTimestamps: true,
    autoSubmit: true,
    preferredLangs: "",
});
const config = new userutils.DataStore({
    id: "script-config",
    defaultData: getDefaultConfig(),
    // increment this value if the data format changes:
    formatVersion: 1,
    // functions that migrate data from older versions to newer ones:
    migrations: {
    // migrate from v1 to v2:
    // 2: (oldData) => {
    //   return { ...oldData, newProp: "foo" };
    // },
    },
    encodeData: (data) => canCompress ? userutils.compress(data, compressionFormat, "string") : data,
    decodeData: (data) => canCompress ? userutils.decompress(data, compressionFormat, "string") : data,
});
function initConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        canCompress = yield compressionSupported();
        yield config.loadData();
    });
}
function compressionSupported() {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof canCompress === "boolean")
            return canCompress;
        try {
            yield userutils.compress(".", compressionFormat, "string");
            return canCompress = true;
        }
        catch (e) {
            return canCompress = false;
        }
    });
}//#region logging
/** Shared console prefix so every log is filterable and never lost behind a missing tag. */
const logPrefix = "[YFSWG]";
/** Prefixed `console.log`. */
const log = (...args) => console.log(logPrefix, ...args);
/** Prefixed `console.warn`. */
const warn = (...args) => console.warn(logPrefix, ...args);
/** Prefixed `console.error`. */
const error = (...args) => console.error(logPrefix, ...args);
/**
 * Opens the given URL in a new tab, using GM.openInTab if available
 * ⚠️ Requires the directive `@grant GM.openInTab`
 */
function openInTab(href, background = true) {
    try {
        userutils.openInNewTab(href, background);
    }
    catch (err) {
        window.open(href, "_blank", "noopener noreferrer");
    }
}
//#region DOM utils
let domLoaded = document.readyState === "complete" || document.readyState === "interactive";
document.addEventListener("DOMContentLoaded", () => domLoaded = true);
/**
 * Adds generic, accessible interaction listeners to the passed element.
 * All listeners have the default behavior prevented and stop immediate propagation.
 * @param listenerOptions Provide a {@linkcode listenerOptions} object to configure the listeners
 */
function onInteraction(elem, listener, listenerOptions) {
    const proxListener = (e) => {
        if (e instanceof KeyboardEvent && !(["Enter", " ", "Space", "Spacebar"].includes(e.key)))
            return;
        e.preventDefault();
        e.stopImmediatePropagation();
        (listenerOptions === null || listenerOptions === void 0 ? void 0 : listenerOptions.once) && e.type === "keydown" && elem.removeEventListener("click", proxListener, listenerOptions);
        (listenerOptions === null || listenerOptions === void 0 ? void 0 : listenerOptions.once) && e.type === "click" && elem.removeEventListener("keydown", proxListener, listenerOptions);
        listener(e);
    };
    elem.addEventListener("click", proxListener, listenerOptions);
    elem.addEventListener("keydown", proxListener, listenerOptions);
}
/** Resolves with the first element matching `selector`, polling until found or `timeoutMs` elapses (then `null`). */
function waitForSelector(selector, timeoutMs = 4000, intervalMs = 100) {
    const existing = document.querySelector(selector);
    if (existing)
        return Promise.resolve(existing);
    return new Promise((resolve) => {
        const start = Date.now();
        const timer = setInterval(() => {
            const el = document.querySelector(selector);
            if (el || Date.now() - start > timeoutMs) {
                clearInterval(timer);
                resolve(el);
            }
        }, intervalMs);
    });
}
/**
 * Adds a style element to the DOM at runtime.
 * @param css The CSS stylesheet to add
 * @param ref A reference string to identify the style element - defaults to a random 5-character string
 */
function addStyle(css, ref) {
    if (!domLoaded)
        throw new Error("DOM has not finished loading yet");
    const elem = userutils.addGlobalStyle(css);
    elem.id = `global-style-${ref !== null && ref !== void 0 ? ref : userutils.randomId(5, 36)}`;
    return elem;
}/**
 * Intercepts the YouTube player's own `/api/timedtext` network requests so we can reuse the URL
 * it generates - which carries a valid PoToken and the user's auth session. This is the only way
 * to capture subtitles for PoToken-gated (`exp=xpe`) and member-only videos, where the static
 * `baseUrl` from the player response returns an empty body and `get_transcript` is rejected.
 *
 * Installed at document-start (before the player runs) by patching `fetch` and `XMLHttpRequest`
 * on the page realm via `unsafeWindow`.
 */
const timedtextMarker = "/api/timedtext";
/** Page realm, where the player's `fetch` / `XMLHttpRequest` live. */
const pageWindow$1 = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
/** Most recently observed working timedtext URL (from the page's own requests). */
let latestUrl = null;
/** One-shot resolvers waiting for the next matching URL. */
const waiters = [];
let installed = false;
/** Records a captured URL if it is a timedtext request, and notifies any matching waiters. */
function record(rawUrl) {
    if (!rawUrl.includes(timedtextMarker))
        return;
    latestUrl = rawUrl;
    for (let i = waiters.length - 1; i >= 0; i--) {
        const w = waiters[i];
        if (w.match(rawUrl)) {
            clearTimeout(w.timer);
            waiters.splice(i, 1);
            w.resolve(rawUrl);
        }
    }
}
/** Patches `fetch` and `XMLHttpRequest.open` on the page realm. Idempotent. */
function installTimedtextInterceptor() {
    var _a;
    if (installed)
        return;
    installed = true;
    // fetch
    const origFetch = pageWindow$1.fetch;
    pageWindow$1.fetch = function (...args) {
        try {
            const input = args[0];
            const url = typeof input === "string"
                ? input
                : input instanceof URL ? input.href : input.url;
            record(url);
        }
        catch ( /* never let interception break the page's request */_a) { /* never let interception break the page's request */ }
        return origFetch.apply(this, args);
    };
    // XMLHttpRequest
    const proto = (_a = pageWindow$1.XMLHttpRequest) === null || _a === void 0 ? void 0 : _a.prototype;
    if (proto) {
        const origOpen = proto.open;
        proto.open = function (...args) {
            try {
                const u = args[1];
                record(typeof u === "string" ? u : u.href);
            }
            catch ( /* ignore */_a) { /* ignore */ }
            return origOpen.apply(this, args);
        };
    }
    log("timedtext interceptor installed");
}
/**
 * Resolves with a timedtext URL for `videoId` (or the latest one if `videoId` is omitted),
 * waiting up to `timeoutMs` for the player to issue one. Resolves `null` on timeout.
 */
function waitForTimedtextUrl(videoId, timeoutMs = 6000) {
    const match = (url) => !videoId || url.includes(`v=${videoId}`);
    if (latestUrl && match(latestUrl))
        return Promise.resolve(latestUrl);
    return new Promise((resolve) => {
        const timer = window.setTimeout(() => {
            const i = waiters.findIndex(w => w.resolve === resolve);
            if (i >= 0)
                waiters.splice(i, 1);
            resolve(null);
        }, timeoutMs);
        waiters.push({ match, resolve, timer });
    });
}/** Options that are applied to every SelectorObserver instance */
const defaultObserverOptions = {
    defaultDebounce: 100,
    defaultDebounceEdge: "rising",
    subtree: false,
};
/** Global SelectorObserver instances usable throughout the script for improved performance */
const globservers = {};
/** Call after DOM load to initialize all SelectorObserver instances */
function initObservers() {
    try {
        //#region body
        // -> the entire <body> element - use sparingly due to performance impacts!
        globservers.body = new userutils.SelectorObserver(document.body, Object.assign(Object.assign({}, defaultObserverOptions), { defaultDebounce: 150 }));
        globservers.body.enable();
    }
    catch (err) {
        error("Failed to initialize observers:", err);
    }
}/**
 * Cross-tab handoff between the YouTube tab (which captures subtitles) and the AI Studio tab
 * (which injects them). GM storage is shared across all tabs running this userscript, so the
 * payload survives the `openInTab` jump without going through the URL (avoiding length limits).
 * ⚠️ Requires the directives `@grant GM.setValue`, `@grant GM.getValue`, `@grant GM.deleteValue`
 */
const storageKey = "yfswg-pending-summary";
/** Stores a captured payload for the AI Studio tab to pick up. */
function stashSummaryPayload(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        yield GM.setValue(storageKey, JSON.stringify(payload));
    });
}
/**
 * Reads and removes the pending payload (one-shot). Returns `null` if there is none or it is
 * older than `maxAgeMs` (a stale handoff from a previous, unrelated session).
 */
function takeSummaryPayload() {
    return __awaiter(this, arguments, void 0, function* (maxAgeMs = 5 * 60000) {
        const raw = yield GM.getValue(storageKey, "");
        if (!raw)
            return null;
        yield GM.deleteValue(storageKey);
        try {
            const payload = JSON.parse(raw);
            if (typeof payload.createdAt !== "number" || Date.now() - payload.createdAt > maxAgeMs)
                return null;
            return payload;
        }
        catch (_a) {
            return null;
        }
    });
}/**
 * Inline SVG icons used in the UI. Inline (rather than image resources) so they scale crisply
 * and inherit the button's text color via `currentColor`, adapting to YouTube's light/dark theme.
 */
/** "AI summarize" sparkle: one large four-point star plus two small ones. */
const sparkleIcon = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
  <path d="M11 3l1.6 4.4L17 9l-4.4 1.6L11 15l-1.6-4.4L5 9l4.4-1.6L11 3z"/>
  <path d="M18 12l.8 2.2L21 15l-2.2.8L18 18l-.8-2.2L15 15l2.2-.8L18 12z"/>
  <path d="M5.5 14l.6 1.7L8 16.3l-1.9.6L5.5 19l-.6-2.1L3 16.3l1.9-.6L5.5 14z"/>
</svg>`.trim();
/** Standard settings gear/cog. */
const gearIcon = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
  <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.3 7.3 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.4 2h-2.8a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.81 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.69.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.54c.05.24.25.42.49.42h2.8c.24 0 .45-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.26.12.55.02.69-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/>
</svg>`.trim();/**
 * Settings panel (modal) for the YouTube side, opened from the button's gear half.
 * Reads/writes the persisted {@linkcode config} DataStore.
 */
const overlayId = "yfswg-settings-overlay";
/** Opens the settings modal, prefilled from the current config. */
function openSettings() {
    if (document.getElementById(overlayId))
        return; // already open
    addStyle(settingsStyle, "yfswg-settings");
    const data = config.getData();
    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.className = "yfswg-overlay";
    overlay.innerHTML = `
    <div class="yfswg-modal" role="dialog" aria-modal="true" aria-label="YFSWG 設定">
      <h2 class="yfswg-modal-title">YouTube 摘要設定</h2>

      <label class="yfswg-field">
        <span class="yfswg-field-label">提示詞模板</span>
        <span class="yfswg-field-hint">可用變數：<code>{{title}}</code> 標題、<code>{{url}}</code> 連結、<code>{{transcript}}</code> 字幕</span>
        <textarea class="yfswg-input yfswg-textarea" data-field="promptTemplate" rows="8"></textarea>
      </label>

      <label class="yfswg-field">
        <span class="yfswg-field-label">偏好字幕語言</span>
        <span class="yfswg-field-hint">逗號分隔的語言代碼，例如 <code>zh-TW, ja, en</code>。留空＝跟隨瀏覽器語言</span>
        <input type="text" class="yfswg-input" data-field="preferredLangs" placeholder="留空＝自動" />
      </label>

      <label class="yfswg-check">
        <input type="checkbox" data-field="includeTimestamps" />
        <span>字幕包含時間戳（<code>[h:mm:ss]</code>）</span>
      </label>

      <label class="yfswg-check">
        <input type="checkbox" data-field="autoSubmit" />
        <span>注入後自動於 AI Studio 送出</span>
      </label>

      <div class="yfswg-actions">
        <button type="button" class="yfswg-btn-secondary" data-action="reset">重設為預設</button>
        <span class="yfswg-spacer"></span>
        <button type="button" class="yfswg-btn-secondary" data-action="cancel">取消</button>
        <button type="button" class="yfswg-btn-primary" data-action="save">儲存</button>
      </div>
    </div>`;
    const modal = overlay.querySelector(".yfswg-modal");
    const promptEl = overlay.querySelector("[data-field='promptTemplate']");
    const langEl = overlay.querySelector("[data-field='preferredLangs']");
    const tsEl = overlay.querySelector("[data-field='includeTimestamps']");
    const autoEl = overlay.querySelector("[data-field='autoSubmit']");
    // Prefill from config.
    promptEl.value = data.promptTemplate;
    langEl.value = data.preferredLangs;
    tsEl.checked = data.includeTimestamps;
    autoEl.checked = data.autoSubmit;
    const close = () => {
        overlay.remove();
        document.removeEventListener("keydown", onKeydown);
    };
    const onKeydown = (e) => {
        if (e.key === "Escape")
            close();
    };
    // Close when clicking the backdrop (but not inside the modal).
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay)
            close();
    });
    modal.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("keydown", onKeydown);
    overlay.querySelector("[data-action='cancel']").addEventListener("click", close);
    overlay.querySelector("[data-action='reset']").addEventListener("click", () => {
        promptEl.value = defaultPromptTemplate;
        langEl.value = "";
        tsEl.checked = true;
        autoEl.checked = true;
    });
    overlay.querySelector("[data-action='save']").addEventListener("click", () => {
        void config.setData({
            promptTemplate: promptEl.value,
            preferredLangs: langEl.value.trim(),
            includeTimestamps: tsEl.checked,
            autoSubmit: autoEl.checked,
        });
        close();
    });
    document.body.appendChild(overlay);
    promptEl.focus();
}
const settingsStyle = `
.yfswg-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}
.yfswg-modal {
  width: min(560px, 92vw);
  max-height: 88vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px 24px 24px;
  border-radius: 12px;
  background: var(--yt-spec-base-background, #fff);
  color: var(--yt-spec-text-primary, #0f0f0f);
  font-family: "Roboto", "Arial", sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.yfswg-modal-title {
  margin: 0 0 16px;
  font-size: 1.8rem;
  font-weight: 500;
}
.yfswg-field {
  display: block;
  margin-bottom: 16px;
}
.yfswg-field-label {
  display: block;
  font-size: 1.4rem;
  font-weight: 500;
  margin-bottom: 4px;
}
.yfswg-field-hint {
  display: block;
  font-size: 1.2rem;
  opacity: 0.7;
  margin-bottom: 6px;
}
.yfswg-field-hint code,
.yfswg-check code {
  font-family: monospace;
  background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.08));
  padding: 1px 4px;
  border-radius: 4px;
}
.yfswg-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  font-size: 1.4rem;
  font-family: inherit;
  border: 1px solid var(--yt-spec-10-percent-layer, rgba(0, 0, 0, 0.2));
  border-radius: 8px;
  background: var(--yt-spec-base-background, #fff);
  color: inherit;
}
.yfswg-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: monospace;
  line-height: 1.4;
}
.yfswg-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.4rem;
  margin-bottom: 12px;
  cursor: pointer;
}
.yfswg-check input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.yfswg-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}
.yfswg-spacer {
  flex: 1;
}
.yfswg-btn-primary,
.yfswg-btn-secondary {
  padding: 8px 16px;
  font-size: 1.4rem;
  font-weight: 500;
  font-family: inherit;
  border-radius: 18px;
  border: none;
  cursor: pointer;
}
.yfswg-btn-primary {
  background: var(--yt-spec-call-to-action, #065fd4);
  color: #fff;
}
.yfswg-btn-secondary {
  background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.08));
  color: inherit;
}
.yfswg-btn-primary:hover,
.yfswg-btn-secondary:hover {
  filter: brightness(1.1);
}
`;/**
 * Page-based YouTube subtitle extraction.
 *
 * Design goal (see project memory): capture subtitles directly from the page the user
 * is already watching, never via an external subtitle API. This is what makes the script
 * work on member-only / region-locked / age-restricted videos, and avoids the third-party
 * scraper breakage caused by YouTube's PoToken (`&exp=xpe`) requirement.
 *
 * Two layered strategies, tried in order:
 *  1. Intercept the player's own `/api/timedtext` request (it carries a valid PoToken and the
 *     user's session) and refetch it as `fmt=json3`.
 *  2. DOM scrape of YouTube's own "Show transcript" panel.
 */
//#endregion
//#region page-global access
/**
 * Page globals (`ytInitialPlayerResponse`, the player element's methods) live in the page's
 * realm. In sandboxed userscript engines we need `unsafeWindow` to reach them.
 */
const pageWindow = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
//#endregion
//#region player response
/**
 * Returns the most up-to-date player response. `movie_player.getPlayerResponse()` reflects the
 * currently playing video after SPA navigation, whereas `ytInitialPlayerResponse` goes stale.
 */
function getPlayerResponse() {
    var _a, _b;
    try {
        const player = ((_a = pageWindow.document) !== null && _a !== void 0 ? _a : document).getElementById("movie_player");
        const fromPlayer = (_b = player === null || player === void 0 ? void 0 : player.getPlayerResponse) === null || _b === void 0 ? void 0 : _b.call(player);
        if (fromPlayer === null || fromPlayer === void 0 ? void 0 : fromPlayer.captions)
            return fromPlayer;
    }
    catch (err) {
        warn("getPlayerResponse() unavailable, falling back to ytInitialPlayerResponse:", err);
    }
    return pageWindow.ytInitialPlayerResponse;
}
/** Extracts the caption track list from a player response. */
function getCaptionTracks(resp) {
    var _a, _b, _c;
    return (_c = (_b = (_a = resp === null || resp === void 0 ? void 0 : resp.captions) === null || _a === void 0 ? void 0 : _a.playerCaptionsTracklistRenderer) === null || _b === void 0 ? void 0 : _b.captionTracks) !== null && _c !== void 0 ? _c : [];
}
/** Resolves a track's display name across the two shapes YouTube uses. */
function trackName(track) {
    var _a, _b, _c, _d, _e;
    return (_e = (_b = (_a = track.name) === null || _a === void 0 ? void 0 : _a.simpleText) !== null && _b !== void 0 ? _b : (_d = (_c = track.name) === null || _c === void 0 ? void 0 : _c.runs) === null || _d === void 0 ? void 0 : _d.map(r => r.text).join("")) !== null && _e !== void 0 ? _e : track.languageCode;
}
/**
 * Picks the best track for the user: first a manually-created track in a preferred language,
 * then an auto-generated one in a preferred language, then any manual track, then anything.
 */
function pickTrack(tracks, preferredLangs) {
    var _a, _b, _c;
    if (tracks.length === 0)
        return undefined;
    const matchesLang = (t) => preferredLangs.some(l => t.languageCode.toLowerCase().startsWith(l.toLowerCase()));
    const isManual = (t) => t.kind !== "asr";
    return (_c = (_b = (_a = tracks.find(t => matchesLang(t) && isManual(t))) !== null && _a !== void 0 ? _a : tracks.find(t => matchesLang(t))) !== null && _b !== void 0 ? _b : tracks.find(isManual)) !== null && _c !== void 0 ? _c : tracks[0];
}
//#endregion
//#region json3 parsing
/** Decodes a json3 timedtext payload into ordered segments. */
function parseJson3(data) {
    var _a, _b, _c, _d;
    const segments = [];
    for (const event of (_a = data.events) !== null && _a !== void 0 ? _a : []) {
        const text = ((_b = event.segs) !== null && _b !== void 0 ? _b : []).map(s => { var _a; return (_a = s.utf8) !== null && _a !== void 0 ? _a : ""; }).join("").replace(/\s+/g, " ").trim();
        if (text.length === 0)
            continue;
        segments.push({
            start: ((_c = event.tStartMs) !== null && _c !== void 0 ? _c : 0) / 1000,
            duration: ((_d = event.dDurationMs) !== null && _d !== void 0 ? _d : 0) / 1000,
            text,
        });
    }
    return segments;
}
//#endregion
//#region strategy 1: intercepted player timedtext request
/**
 * Turns on the player's captions (via the CC button) so it issues a timedtext request that our
 * interceptor can capture. Clicking is a plain DOM action, avoiding cross-realm method calls.
 */
function enablePlayerCaptions() {
    const btn = document.querySelector(".ytp-subtitles-button");
    if (!btn) {
        warn("CC button (.ytp-subtitles-button) not found; cannot enable captions");
        return;
    }
    if (btn.getAttribute("aria-pressed") !== "true")
        btn.click();
}
/**
 * Strategy: trigger the player to fetch captions, grab the (PoToken-bearing, authenticated) URL
 * it requested via the interceptor, then refetch it as json3 ourselves. Works for member-only and
 * `exp=xpe` videos. Returns `null` if no request was captured or it produced no segments.
 */
function fetchViaInterceptedUrl(videoId) {
    return __awaiter(this, void 0, void 0, function* () {
        enablePlayerCaptions();
        const captured = yield waitForTimedtextUrl(videoId, 6000);
        if (!captured) {
            warn("no player timedtext request captured (could not enable captions in time?)");
            return null;
        }
        const url = new URL(captured, location.origin);
        url.searchParams.set("fmt", "json3");
        const res = yield fetch(url.toString(), { credentials: "include" });
        if (!res.ok)
            return null;
        const body = yield res.text();
        if (body.trim().length === 0)
            return null;
        const segments = parseJson3(JSON.parse(body));
        return segments.length > 0 ? segments : null;
    });
}
//#endregion
//#region strategy 2: transcript panel DOM scrape
/** The "Show transcript" button, which lives in the description's transcript section. */
const transcriptButtonSelector = "ytd-video-description-transcript-section-renderer #primary-button button, "
    + "ytd-video-description-transcript-section-renderer button";
/** The description "...more" expander, which must be opened for the transcript section to render. */
const descriptionExpandSelector = "ytd-text-inline-expander #expand, #description #expand, tp-yt-paper-button#expand";
/** A rendered transcript line. */
const transcriptRowSelector = "transcript-segment-view-model";
/**
 * Opens YouTube's transcript panel so its segments render into the DOM, then waits for them.
 * The "Show transcript" button only renders after the description is expanded, so we expand it
 * first if the button isn't already present. Returns true once transcript rows are available.
 */
function openTranscriptPanel() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (document.querySelector(transcriptRowSelector))
            return true;
        let button = document.querySelector(transcriptButtonSelector);
        if (!button) {
            (_a = document.querySelector(descriptionExpandSelector)) === null || _a === void 0 ? void 0 : _a.click();
            button = yield waitForSelector(transcriptButtonSelector, 3000);
        }
        if (!button) {
            warn("could not find the 'Show transcript' button");
            return false;
        }
        button.click();
        return Boolean(yield waitForSelector(transcriptRowSelector, 5000));
    });
}
/** Reads already-rendered transcript segments from YouTube's "Show transcript" panel, if open. */
function scrapeTranscriptPanel() {
    var _a, _b, _c, _d, _e, _f;
    const segments = [];
    for (const row of document.querySelectorAll(transcriptRowSelector)) {
        const text = (_c = (_b = (_a = row.querySelector(".ytAttributedStringHost")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.replace(/\s+/g, " ").trim()) !== null && _c !== void 0 ? _c : "";
        if (text.length === 0)
            continue;
        const stamp = (_f = (_e = (_d = row.querySelector(".ytwTranscriptSegmentViewModelTimestamp")) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "";
        segments.push({ start: parseTimestamp(stamp), duration: 0, text });
    }
    return segments;
}
/** Parses a "m:ss" / "h:mm:ss" transcript timestamp into seconds. */
function parseTimestamp(stamp) {
    const parts = stamp.split(":").map(Number);
    if (parts.some(isNaN))
        return 0;
    return parts.reduce((acc, n) => acc * 60 + n, 0);
}
//#endregion
//#region public API
/** Formats a number of seconds as `m:ss`, or `h:mm:ss` once it reaches an hour. */
function formatTimestamp(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const pad = (n) => n.toString().padStart(2, "0");
    return hrs > 0
        ? `${hrs}:${pad(mins)}:${pad(secs)}`
        : `${mins}:${pad(secs)}`;
}
/** Joins segments into `[h:mm:ss] text` lines for time-aware AI analysis. */
function toTimedText(segments) {
    return segments.map(s => `[${formatTimestamp(s.start)}] ${s.text}`).join("\n");
}
/** Returns the browser UI language plus English as default preferred languages. */
function defaultPreferredLangs() {
    var _a;
    const langs = [navigator.language, ...((_a = navigator.languages) !== null && _a !== void 0 ? _a : [])].filter(Boolean);
    return [...new Set([...langs, "en"])];
}
/**
 * Captures subtitles for the currently playing video using page-based strategies.
 * Returns `null` if the video has no captions available at all.
 *
 * @throws if a track was found but every strategy failed to produce text.
 */
function getCurrentSubtitles() {
    return __awaiter(this, arguments, void 0, function* (opts = {}) {
        var _a, _b, _c;
        const preferredLangs = (_a = opts.preferredLangs) !== null && _a !== void 0 ? _a : defaultPreferredLangs();
        const resp = getPlayerResponse();
        const tracks = getCaptionTracks(resp);
        const track = pickTrack(tracks, preferredLangs);
        // Strategy 1: intercept the player's own timedtext request (carries a valid PoToken and the
        // user's session, so it works on member-only / exp=xpe videos).
        if (track) {
            let segments = null;
            try {
                segments = yield fetchViaInterceptedUrl((_b = resp === null || resp === void 0 ? void 0 : resp.videoDetails) === null || _b === void 0 ? void 0 : _b.videoId);
            }
            catch (err) {
                warn("intercepted-timedtext fetch failed:", err);
            }
            if (segments && segments.length > 0) {
                return {
                    lang: track.languageCode,
                    trackName: trackName(track),
                    autoGenerated: track.kind === "asr",
                    segments,
                    text: segments.map(s => s.text).join("\n"),
                    timedText: toTimedText(segments),
                    source: "intercept-timedtext",
                };
            }
        }
        // Strategy 2: open + scrape YouTube's own transcript panel.
        yield openTranscriptPanel();
        const panelSegments = scrapeTranscriptPanel();
        if (panelSegments.length > 0) {
            return {
                lang: (_c = track === null || track === void 0 ? void 0 : track.languageCode) !== null && _c !== void 0 ? _c : "unknown",
                trackName: track ? trackName(track) : "Transcript",
                autoGenerated: (track === null || track === void 0 ? void 0 : track.kind) === "asr",
                segments: panelSegments,
                text: panelSegments.map(s => s.text).join("\n"),
                timedText: toTimedText(panelSegments),
                source: "transcript-panel",
            };
        }
        if (!track)
            return null; // no captions at all
        throw new Error("Found a caption track but could not capture its text (PoToken-gated and transcript panel unavailable)");
    });
}
//#endregion
/**
 * YouTube-side logic: injects the "Summarize with Gemini" button into the watch page's
 * action row (next to Share / Save) and triggers subtitle capture when clicked.
 */
/** Where to open Google AI Studio for a fresh chat. */
const aiStudioUrl = "https://aistudio.google.com/prompts/new_chat";
/** id of the injected button, used to avoid inserting duplicates. */
const btnId = "yfswg-summary-btn";
/**
 * The like/dislike segmented button. We anchor to this element (rather than the action-row
 * container) and insert immediately to its left, so the button stays put across responsive
 * reflows that move or collapse items in the action row.
 */
const likeDislikeSelector = "ytd-watch-metadata segmented-like-dislike-button-view-model";
/** Registers the button injection. Call once on the YouTube side after DOM load. */
function initYoutube() {
    addStyle(buttonStyle, "yfswg-button");
    void ensureSummaryButton();
    // The action row is re-rendered on SPA navigation, so re-insert after each navigation.
    window.addEventListener("yt-navigate-finish", () => void ensureSummaryButton());
}
/**
 * Polls the live DOM for the like/dislike anchor and inserts the button next to it. Polling
 * directly (rather than via SelectorObserver) avoids the observer's debounce dropping the only
 * trigger, which made the button intermittently fail to appear.
 */
function ensureSummaryButton() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!location.pathname.startsWith("/watch"))
            return;
        const anchor = yield waitForSelector(likeDislikeSelector, 15000);
        if (anchor)
            addSummaryButton(anchor);
        else
            warn("like/dislike anchor not found within timeout; button not inserted");
    });
}
/** Shared YouTube button-shape classes so our button inherits the native (visible) styling. */
const shapeBase = "ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ytSpecButtonShapeNextSizeM";
/**
 * Inserts a segmented button immediately to the left of the like/dislike button, mirroring
 * YouTube's own segmented button: the left segment (sparkle + label) runs the summary, the right
 * segment (gear) opens settings. Reuses YouTube's `ytSpecButtonShapeNext*` classes so it matches.
 */
function addSummaryButton(likeDislike) {
    const parent = likeDislike.parentElement;
    if (!parent || parent.querySelector(`#${btnId}`))
        return;
    const split = document.createElement("div");
    split.id = btnId;
    split.className = "yfswg-split";
    split.innerHTML = `
    <button class="yfswg-main ${shapeBase} ytSpecButtonShapeNextIconLeading ytSpecButtonShapeNextSegmentedStart" title="用 Gemini 摘要" aria-label="用 Gemini 摘要">
      <div aria-hidden="true" class="ytSpecButtonShapeNextIcon">${sparkleIcon}</div>
      <div class="ytSpecButtonShapeNextButtonTextContent">摘要</div>
    </button>
    <button class="yfswg-settings ${shapeBase} ytSpecButtonShapeNextIconButton ytSpecButtonShapeNextSegmentedEnd" title="設定" aria-label="設定">
      <div aria-hidden="true" class="ytSpecButtonShapeNextIcon">${gearIcon}</div>
    </button>`;
    const mainBtn = split.querySelector(".yfswg-main");
    const gearBtn = split.querySelector(".yfswg-settings");
    onInteraction(mainBtn, () => void onSummaryClick(mainBtn));
    onInteraction(gearBtn, () => openSettings());
    likeDislike.before(split);
}
/** Captures the current video's subtitles when the button is pressed. */
function onSummaryClick(btn) {
    return __awaiter(this, void 0, void 0, function* () {
        btn.classList.add("yfswg-busy");
        btn.classList.remove("yfswg-done", "yfswg-error");
        try {
            const cfg = config.getData();
            const preferredLangs = cfg.preferredLangs.split(",").map(s => s.trim()).filter(Boolean);
            const result = yield getCurrentSubtitles(preferredLangs.length > 0 ? { preferredLangs } : {});
            if (!result) {
                warn("No captions are available for this video.");
                flash(btn, "yfswg-error");
                return;
            }
            log(`Captured ${result.segments.length} subtitle lines `
                + `(${result.trackName}, lang=${result.lang}, via ${result.source}).`);
            yield stashSummaryPayload({
                prompt: buildPrompt(result, cfg.promptTemplate, cfg.includeTimestamps),
                autoSubmit: cfg.autoSubmit,
                title: getVideoTitle(),
                createdAt: Date.now(),
            });
            openInTab(aiStudioUrl, false); // foreground the AI Studio tab
            flash(btn, "yfswg-done");
        }
        catch (err) {
            error("Failed to capture subtitles:", err);
            flash(btn, "yfswg-error");
        }
        finally {
            btn.classList.remove("yfswg-busy");
        }
    });
}
/** Builds the final prompt by substituting the template tokens with the video's data. */
function buildPrompt(result, template, includeTimestamps) {
    const transcript = includeTimestamps ? result.timedText : result.text;
    return template
        .split("{{title}}").join(getVideoTitle())
        .split("{{url}}").join(location.href)
        .split("{{transcript}}").join(transcript);
}
/** Reads the current video's title from the watch page, falling back to the document title. */
function getVideoTitle() {
    var _a, _b;
    const fromMeta = (_b = (_a = document.querySelector("ytd-watch-metadata h1")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
    if (fromMeta)
        return fromMeta;
    return document.title.replace(/\s*-\s*YouTube\s*$/, "").trim();
}
/** Briefly applies a status class to the button for visual feedback. */
function flash(btn, cls, ms = 1500) {
    btn.classList.add(cls);
    setTimeout(() => btn.classList.remove(cls), ms);
}
const buttonStyle = `
.yfswg-split {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-right: 8px;
  vertical-align: middle;
}
.yfswg-split .ytSpecButtonShapeNextIcon svg {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
}
.yfswg-main.yfswg-busy {
  opacity: 0.6;
  pointer-events: none;
}
.yfswg-main.yfswg-done {
  box-shadow: inset 0 0 0 2px #2ba640;
}
.yfswg-main.yfswg-error {
  box-shadow: inset 0 0 0 2px #cc0000;
}
`;/**
 * Google AI Studio side: picks up the subtitle payload handed off from the YouTube tab and
 * injects it into the prompt input, ready for the user to run.
 */
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
function initAiStudio() {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = yield takeSummaryPayload();
        if (!payload)
            return; // normal AI Studio visit, nothing to inject
        const textarea = yield waitForPromptInput();
        if (!textarea) {
            warn("Could not find the AI Studio prompt input to inject into.");
            return;
        }
        injectPrompt(textarea, payload.prompt);
        log(`Injected subtitles into AI Studio prompt${payload.title ? ` for "${payload.title}"` : ""}.`);
        if (payload.autoSubmit)
            yield submitPrompt(textarea);
        else
            log("Auto-submit disabled; leaving the prompt for review.");
    });
}
/** Waits (generously, since AI Studio loads slowly) for any candidate prompt input to appear. */
function waitForPromptInput() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const combined = promptInputSelectors.join(", ");
        const found = yield waitForSelector(combined, 20000, 200);
        if (!found)
            return null;
        // Prefer a visible one if several match.
        const all = [...document.querySelectorAll(combined)];
        return (_a = all.find(el => el.offsetParent !== null)) !== null && _a !== void 0 ? _a : found;
    });
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
function submitPrompt(textarea) {
    return __awaiter(this, void 0, void 0, function* () {
        const button = yield waitForRunButton();
        if (button) {
            button.click();
            log("Clicked AI Studio Run button.");
            return;
        }
        warn("Run button not found; trying Ctrl+Enter fallback.");
        dispatchRunShortcut(textarea);
    });
}
/** Polls for a visible, enabled Run button (Angular enables it once the prompt has content). */
function waitForRunButton(timeoutMs = 8000, intervalMs = 150) {
    const start = Date.now();
    return new Promise((resolve) => {
        const check = () => {
            const btn = findRunButton();
            if (btn)
                return resolve(btn);
            if (Date.now() - start > timeoutMs)
                return resolve(null);
            setTimeout(check, intervalMs);
        };
        check();
    });
}
/** Finds a clickable Run button by selector or by button text. */
function findRunButton() {
    var _a;
    const bySelector = [...document.querySelectorAll(runButtonSelectors.join(", "))];
    const byText = [...document.querySelectorAll("button")]
        .filter(b => { var _a, _b; return runButtonTexts.test((_b = (_a = b.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : ""); });
    return (_a = [...bySelector, ...byText].find(isClickable)) !== null && _a !== void 0 ? _a : null;
}
/** Whether a button is visible and not disabled. */
function isClickable(btn) {
    return btn.offsetParent !== null && !btn.disabled && btn.getAttribute("aria-disabled") !== "true";
}
/** Dispatches Ctrl+Enter, AI Studio's keyboard shortcut to run the prompt. */
function dispatchRunShortcut(el) {
    const opts = {
        key: "Enter", code: "Enter", keyCode: 13, which: 13,
        ctrlKey: true, bubbles: true, cancelable: true,
    };
    el.dispatchEvent(new KeyboardEvent("keydown", opts));
    el.dispatchEvent(new KeyboardEvent("keyup", opts));
}
/**
 * Sets a value on an Angular-controlled textarea. Assigning `.value` directly is ignored by
 * Angular's change detection, so we use the native value setter and dispatch an `input` event.
 */
function injectPrompt(textarea, value) {
    var _a, _b, _c;
    const proto = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window).HTMLTextAreaElement.prototype;
    const setter = (_b = (_a = Object.getOwnPropertyDescriptor(proto, "value")) === null || _a === void 0 ? void 0 : _a.set) !== null && _b !== void 0 ? _b : (_c = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")) === null || _c === void 0 ? void 0 : _c.set;
    if (setter)
        setter.call(textarea, value);
    else
        textarea.value = value;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    textarea.focus();
}/** Runs when the userscript is loaded initially */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // Must run at document-start, before the YouTube player issues its timedtext requests.
        if (location.hostname.endsWith("youtube.com"))
            installTimedtextInterceptor();
        yield initConfig();
        if (domLoaded)
            run();
        else
            document.addEventListener("DOMContentLoaded", run);
    });
}
/** Runs after the DOM is available */
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            log(`Initializing ${scriptInfo.name} v${scriptInfo.version} (#${buildNumber})...`);
            // post-build these double quotes are replaced by backticks (because if backticks are used here, the bundler converts them to double quotes)
            addStyle("#{{GLOBAL_STYLE}}", "global");
            initObservers();
            // The script matches both YouTube and Google AI Studio - run only the relevant side.
            if (location.hostname.endsWith("youtube.com"))
                initYoutube();
            else if (location.hostname.endsWith("aistudio.google.com"))
                void initAiStudio();
        }
        catch (err) {
            error("Fatal error:", err);
            return;
        }
    });
}
init();})(UserUtils);//# sourceMappingURL=http://localhost:8710/YoutubeFreeSummaryWithGemini.user.js.map
