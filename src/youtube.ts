/**
 * YouTube-side logic: injects the "Summarize with Gemini" button into the watch page's
 * action row (next to Share / Save) and triggers subtitle capture when clicked.
 */

import { config } from "./config";
import { reportFailure } from "./feedback";
import { stashSummaryPayload } from "./handoff";
import { gearIcon, loadingIcon, sparkleIcon } from "./icons";
import { openSettings } from "./settings";
import { getCurrentSubtitles, type SubtitleResult } from "./subtitles";
import { addStyle, error, log, onInteraction, openInTab, waitForSelector, warn } from "./utils";

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
export function initYoutube() {
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
async function ensureSummaryButton() {
  if(!location.pathname.startsWith("/watch"))
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
  split.className = "yfswg-split";
  split.innerHTML = `
    <button class="yfswg-main ${shapeBase} ytSpecButtonShapeNextIconLeading ytSpecButtonShapeNextSegmentedStart" title="用 Gemini 摘要" aria-label="用 Gemini 摘要">
      <div aria-hidden="true" class="ytSpecButtonShapeNextIcon">${sparkleIcon}</div>
      <div class="ytSpecButtonShapeNextButtonTextContent">摘要</div>
    </button>
    <button class="yfswg-settings ${shapeBase} ytSpecButtonShapeNextIconButton ytSpecButtonShapeNextSegmentedEnd" title="設定" aria-label="設定">
      <div aria-hidden="true" class="ytSpecButtonShapeNextIcon">${gearIcon}</div>
    </button>`;

  const mainBtn = split.querySelector<HTMLButtonElement>(".yfswg-main")!;
  const gearBtn = split.querySelector<HTMLButtonElement>(".yfswg-settings")!;
  onInteraction(mainBtn, () => void onSummaryClick(mainBtn));
  onInteraction(gearBtn, () => openSettings());

  likeDislike.before(split);
}

/** Captures the current video's subtitles when the button is pressed. */
async function onSummaryClick(btn: HTMLButtonElement) {
  const iconEl = btn.querySelector<HTMLElement>(".ytSpecButtonShapeNextIcon");
  setBusy(btn, iconEl, true);
  try {
    const cfg = config.getData();
    const preferredLangs = cfg.preferredLangs.split(",").map(s => s.trim()).filter(Boolean);

    const result = await getCurrentSubtitles(preferredLangs.length > 0 ? { preferredLangs } : {});
    if(!result) {
      warn("No captions are available for this video.");
      void reportFailure({
        context: "youtube:no-captions",
        userMessage: "找不到這部影片的字幕／翻譯，無法摘要。請確認影片有字幕，重新整理頁面後再試一次。",
      });
      return;
    }

    log(
      `Captured ${result.segments.length} subtitle lines `
      + `(${result.trackName}, lang=${result.lang}, via ${result.source}).`,
    );

    await stashSummaryPayload({
      prompt: buildPrompt(result, cfg.promptTemplate, cfg.includeTimestamps),
      autoSubmit: cfg.autoSubmit,
      title: getVideoTitle(),
      createdAt: Date.now(),
    });
    openInTab(aiStudioUrl, false); // foreground the AI Studio tab
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
  btn.classList.toggle("yfswg-busy", busy);
  if(!iconEl)
    return;
  iconEl.classList.toggle("yfswg-spin", busy);
  iconEl.innerHTML = busy ? loadingIcon : sparkleIcon;
}

/** Builds the final prompt by substituting the template tokens with the video's data. */
function buildPrompt(result: SubtitleResult, template: string, includeTimestamps: boolean): string {
  const transcript = includeTimestamps ? result.timedText : result.text;
  return template
    .split("{{title}}").join(getVideoTitle())
    .split("{{url}}").join(location.href)
    .split("{{transcript}}").join(transcript);
}

/** Reads the current video's title from the watch page, falling back to the document title. */
function getVideoTitle(): string {
  const fromMeta = document.querySelector("ytd-watch-metadata h1")?.textContent?.trim();
  if(fromMeta)
    return fromMeta;
  return document.title.replace(/\s*-\s*YouTube\s*$/, "").trim();
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
}
.yfswg-main.yfswg-busy {
  opacity: 0.6;
  pointer-events: none;
}
.yfswg-split .ytSpecButtonShapeNextIcon.yfswg-spin {
  animation: yfswg-spin 0.8s linear infinite;
}
@keyframes yfswg-spin {
  to { transform: rotate(360deg); }
}
`;
