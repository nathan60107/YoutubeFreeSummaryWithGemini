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
import { error, warn } from "./log";
import { addStyle, onInteraction, setInnerHtml, waitForSelector } from "./utils";

/** id of the injected button, used to avoid inserting duplicates. */
const btnId = "yfas-summary-btn";

/**
 * The like/dislike segmented button. We anchor to this element (rather than the action-row
 * container) and insert immediately to its left, so the button stays put across responsive
 * reflows that move or collapse items in the action row.
 */
const likeDislikeSelector = "ytd-watch-metadata segmented-like-dislike-button-view-model";

/** Registers the button injection. Call once on the YouTube side after DOM load. */
export function initYoutube() {
  addStyle(buttonStyle, "yfas-button");

  // Off-page trigger: sparkle button on video thumbnails across list surfaces (home/search/related).
  initThumbnailButtons();

  void ensureSummaryButton();
  // The action row is re-rendered on SPA navigation, so re-insert after each navigation.
  window.addEventListener("yt-navigate-finish", () => void ensureSummaryButton());
  // Re-label the button in place when the user changes the interface language in settings.
  window.addEventListener("yfas-lang-changed", relabelButton);
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

/**
 * Polls the live DOM for the like/dislike anchor and inserts the button next to it. Polling
 * directly (rather than via SelectorObserver) avoids the observer's debounce dropping the only
 * trigger, which made the button intermittently fail to appear.
 */
async function ensureSummaryButton() {
  if(!location.pathname.startsWith("/watch") && !location.pathname.startsWith("/live/"))
    return;
  const anchor = await waitForSelector<HTMLElement>(likeDislikeSelector, 15000);
  if(anchor)
    addSummaryButton(anchor);
  else
    warn("like/dislike anchor not found within timeout; button not inserted");
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
