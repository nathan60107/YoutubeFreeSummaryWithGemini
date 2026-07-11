/**
 * YouTube-side logic: injects the summary button into the watch page's action row
 * (next to Share / Save) and triggers subtitle capture when clicked.
 */

import { config } from "./config";
import { reportFailure } from "./feedback";
import { t } from "./i18n";
import { gearIcon, loadingIcon, sparkleIcon } from "./icons";
import { getProviderById } from "./providers";
import { openSettings } from "./settings";
import { captureAndHandoff } from "./summarize";
import { hasCaptionsAvailable } from "./subtitles";
import { initThumbnailButtons } from "./thumbnails";
import { debounce } from "@sv443-network/userutils";
import { error } from "./log";
import { addStyle, onInteraction, setInnerHtml } from "./utils";

/** id of the injected button, used to avoid inserting duplicates. */
const btnId = "yfas-summary-btn";

/**
 * The like/dislike segmented button. We anchor to this element (rather than the action-row
 * container) and insert immediately to its left, so the button stays put across responsive
 * reflows that move or collapse items in the action row.
 */
const likeDislikeSelector = "ytd-watch-metadata segmented-like-dislike-button-view-model";

/** Observes the action row so the button can be re-inserted while YouTube re-stamps it; see {@linkcode reconcileButton}. */
let rowObserver: MutationObserver | undefined;
/** Steady-state countdown; the button is deemed stable once it survives this without re-insertion. */
let settleTimer: ReturnType<typeof setTimeout> | undefined;
/** How long the button must stay put before the row counts as settled and we stop observing. */
const settleMs = 2500;

/** Registers the button injection. Call once on the YouTube side after DOM load. */
export function initYoutube() {
  addStyle(buttonStyle, "yfas-button");

  // Off-page trigger: sparkle button on video thumbnails across list surfaces (home/search/related).
  initThumbnailButtons();

  // YouTube is a SPA and rebuilds the watch action row asynchronously after each navigation, so we
  // re-sync every navigation rather than inserting just once.
  window.addEventListener("yt-navigate-finish", syncButtonForPage);
  // Re-label the button in place when the user changes the interface language in settings.
  window.addEventListener("yfas-lang-changed", relabelButton);
  syncButtonForPage();
}

/** Whether the current location is a page that should carry the summary button. */
function isWatchPage() {
  return location.pathname.startsWith("/watch") || location.pathname.startsWith("/live/");
}

/** On watch pages, start observing and try to insert; elsewhere, stop. */
function syncButtonForPage() {
  if(!isWatchPage()) {
    stopObserving();
    return;
  }
  observeRow();
  reconcileButton();
}

/** (Re)connects the observer to the watch container so {@linkcode reconcileButton} runs on every row rebuild. */
function observeRow() {
  const target = document.querySelector("ytd-watch-flexy") ?? document.body;
  rowObserver ??= new MutationObserver(debounce(reconcileButton, 150));
  rowObserver.disconnect();
  rowObserver.observe(target, { childList: true, subtree: true });
}

/** Disconnects the row observer and cancels any pending steady-state check. */
function stopObserving() {
  rowObserver?.disconnect();
  rowObserver = undefined;
  clearTimeout(settleTimer);
  settleTimer = undefined;
}

/**
 * Inserts the button if it's missing. YouTube re-stamps the action row a few times after navigation,
 * discarding our button each time, so each re-insertion restarts the settle countdown; the row is
 * treated as settled (and observing stops) once the button survives it.
 */
function reconcileButton() {
  if(!isWatchPage())
    return;
  if(document.getElementById(btnId)?.isConnected)
    return;
  const anchor = document.querySelector<HTMLElement>(likeDislikeSelector);
  if(anchor)
    addSummaryButton(anchor);
  if(document.getElementById(btnId)?.isConnected)
    scheduleSettleCheck();
}

/** (Re)starts the steady-state countdown: if the button is still in place when it fires, stop observing. */
function scheduleSettleCheck() {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    if(document.getElementById(btnId)?.isConnected)
      stopObserving();
  }, settleMs);
}

/** Re-applies the current interface language to an already-injected button (after a language change). */
function relabelButton() {
  const split = document.getElementById(btnId);
  if(!split)
    return;
  const mainBtn = split.querySelector<HTMLButtonElement>(".yfas-main");
  if(mainBtn) {
    const textEl = mainBtn.querySelector(".ytSpecButtonShapeNextButtonTextContent");
    if(textEl)
      textEl.textContent = t("button.label");
    setAvailable(mainBtn, !mainBtn.disabled); // re-applies title/aria in the new language for the current state
  }
  const gearBtn = split.querySelector<HTMLButtonElement>(".yfas-settings");
  if(gearBtn) {
    gearBtn.title = t("button.settings");
    gearBtn.setAttribute("aria-label", t("button.settings"));
  }
}

/** Shared YouTube button-shape classes so our button inherits the native (visible) styling. */
const shapeBase = "ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ytSpecButtonShapeNextSizeM";

/**
 * Inserts a segmented button immediately to the left of the like/dislike button, mirroring
 * YouTube's own segmented button: the left segment (sparkle + label) runs the summary, the right
 * segment (gear) opens settings. Reuses YouTube's `ytSpecButtonShapeNext*` classes so it matches.
 */
function addSummaryButton(likeDislike: HTMLElement) {
  const parent = likeDislike.parentElement;
  if(!parent || parent.querySelector(`#${btnId}`))
    return;

  const split = document.createElement("div");
  split.id = btnId;
  split.className = "yfas-split";
  setInnerHtml(split, `
    <button class="yfas-main ${shapeBase} ytSpecButtonShapeNextIconLeading ytSpecButtonShapeNextSegmentedStart" title="${enabledLabel()}" aria-label="${enabledLabel()}">
      <div aria-hidden="true" class="ytSpecButtonShapeNextIcon">${sparkleIcon}</div>
      <div class="ytSpecButtonShapeNextButtonTextContent">${t("button.label")}</div>
    </button>
    <button class="yfas-settings ${shapeBase} ytSpecButtonShapeNextIconButton ytSpecButtonShapeNextSegmentedEnd" title="${t("button.settings")}" aria-label="${t("button.settings")}">
      <div aria-hidden="true" class="ytSpecButtonShapeNextIcon">${gearIcon}</div>
    </button>`);

  const mainBtn = split.querySelector<HTMLButtonElement>(".yfas-main")!;
  const gearBtn = split.querySelector<HTMLButtonElement>(".yfas-settings")!;
  onInteraction(mainBtn, () => void onSummaryClick(mainBtn));
  onInteraction(gearBtn, () => openSettings());

  likeDislike.before(split);
  void watchCaptionAvailability(mainBtn);
}

/** Default (enabled) label / tooltip for the summary button, naming the currently selected provider. */
const enabledLabel = () => t("button.summarizeWith", getProviderById(config.getData().provider).label);
/** Label / tooltip shown while the button is greyed out because the video has no captions. */
const noCaptionsLabel = () => t("button.noCaptions");

/**
 * Greys out the summary button until captions are detected for the current video. The player
 * response can lag behind button insertion, so we poll: enable as soon as a track appears, and
 * settle on the disabled state only if none shows up within the timeout.
 */
async function watchCaptionAvailability(mainBtn: HTMLButtonElement, timeoutMs = 10000, intervalMs = 400) {
  setAvailable(mainBtn, false);
  const start = Date.now();
  while(mainBtn.isConnected && Date.now() - start < timeoutMs) {
    if(hasCaptionsAvailable()) {
      setAvailable(mainBtn, true);
      return;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
}

/**
 * Toggles the summary button between its normal and greyed-out (no-captions) states. The native
 * `disabled` attribute blocks the click without any JS guard, while the `title` tooltip still
 * surfaces on hover so the user learns why it is greyed out. `aria-disabled` mirrors the state for
 * assistive tech.
 */
function setAvailable(mainBtn: HTMLButtonElement, available: boolean) {
  mainBtn.classList.toggle("yfas-disabled", !available);
  mainBtn.disabled = !available;
  mainBtn.setAttribute("aria-disabled", String(!available));
  const label = available ? enabledLabel() : noCaptionsLabel();
  mainBtn.title = label;
  mainBtn.setAttribute("aria-label", label);
}

/** Captures the current video's subtitles when the button is pressed. */
async function onSummaryClick(btn: HTMLButtonElement) {
  const iconEl = btn.querySelector<HTMLElement>(".ytSpecButtonShapeNextIcon");
  setBusy(btn, iconEl, true);
  try {
    await captureAndHandoff();
    // Success: restore silently (handled in finally), no extra indicator.
  }
  catch(err) {
    error("Failed to capture subtitles:", err);
    void reportFailure({ context: "youtube:capture-error" });
  }
  finally {
    setBusy(btn, iconEl, false);
  }
}

/** Toggles the button's busy state: dims it and swaps the sparkle icon for the spinner (or back). */
function setBusy(btn: HTMLButtonElement, iconEl: HTMLElement | null, busy: boolean) {
  btn.classList.toggle("yfas-busy", busy);
  if(!iconEl)
    return;
  iconEl.classList.toggle("yfas-spin", busy);
  setInnerHtml(iconEl, busy ? loadingIcon : sparkleIcon);
}

const buttonStyle = `
.yfas-split {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-right: 8px;
  vertical-align: middle;
}
.yfas-split .ytSpecButtonShapeNextIcon svg {
  width: 100%;
  height: 100%;
  display: block;
}
.yfas-main.yfas-busy {
  opacity: 0.6;
  pointer-events: none;
}
.yfas-main.yfas-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.yfas-split .ytSpecButtonShapeNextIcon.yfas-spin {
  animation: yfas-spin 0.8s linear infinite;
}
@keyframes yfas-spin {
  to { transform: rotate(360deg); }
}
`;
