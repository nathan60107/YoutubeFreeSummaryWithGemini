/**
 * Off-page summary trigger: a small sparkle button that fades in over any video thumbnail (home,
 * search, related, channel, …). Clicking it summarizes that video without the user opening it.
 *
 * Public videos are captured entirely off-page via the ANDROID InnerTube player (`remote-subtitles.ts`).
 * Gated videos (member-only / age-restricted), which that unauthenticated player can't reach, fall
 * back to a new auto-summary tab that captures with the user's real session (`auto-summarize.ts`).
 */

import { openAutoSummaryTab } from "./auto-summarize";
import { config } from "./config";
import { notify, reportFailure } from "./feedback";
import { stashSummaryPayload } from "./handoff";
import { t } from "./i18n";
import { loadingIcon, sparkleIcon } from "./icons";
import { buildPrompt } from "./prompt";
import { getProviderById } from "./providers";
import { getSubtitlesForVideo } from "./remote-subtitles";
import { error, log, warn } from "./log";
import { addStyle, onInteraction, openInTab, setInnerHtml } from "./utils";

/** Class of the injected overlay button, also used to guard against double-injection. */
const btnClass = "yfas-thumb-btn";
/** Class placed on the thumbnail anchor that hosts a button, so CSS can reveal it on hover. */
const hostClass = "yfas-thumb-host";
/** Dataset flag marking an anchor we've already processed (whether or not a button was added). */
const processedFlag = "yfasThumb";

/**
 * Thumbnail anchors across YouTube's list surfaces. Classic renderers use `a#thumbnail`; the newer
 * `*ViewModel` lockups use camelCase content-image classes (`ytLockupViewModelContentImage` for
 * videos, `reel-item-endpoint` for Shorts). We deliberately target the *image* anchor, not the
 * metadata/title link, so the button lands on the positioned thumbnail box (where the duration badge
 * sits) — a reliable containing block for our absolutely-placed button. YouTube renames these often,
 * so this list is best-effort and expected to drift.
 */
const thumbnailAnchorSelector = [
  "a#thumbnail",
  "a.ytd-thumbnail",
  "a.ytLockupViewModelContentImage",           // current lockup (home/search/related feed)
  "a.reel-item-endpoint",                      // current Shorts lockup thumbnail
  "a.yt-lockup-view-model-wiz__content-image", // older lockup (kept for compatibility)
].join(", ");

/** Extracts a video id from a thumbnail anchor's href (watch / shorts / live / embed forms). */
function videoIdFromHref(href: string): string | null {
  try {
    const u = new URL(href, location.origin);
    const v = u.searchParams.get("v");
    if (v)
      return v;
    const path = u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{6,})/);
    return path ? path[1] : null;
  }
  catch {
    return null;
  }
}

/** Default label / tooltip for an overlay button, naming the currently selected provider. */
const buttonLabel = () => t("button.summarizeWith", getProviderById(config.getData().provider).label);

/** Injects the overlay button into a thumbnail anchor the first time it's hovered. */
function injectButton(anchor: HTMLAnchorElement): void {
  if (anchor.dataset[processedFlag])
    return;
  anchor.dataset[processedFlag] = "1";

  const videoId = videoIdFromHref(anchor.href);
  if (!videoId)
    return; // playlist/channel/other non-video thumbnail

  anchor.classList.add(hostClass);

  const btn = document.createElement("div");
  btn.className = btnClass;
  // A div with role=button (rather than a <button>) avoids nesting interactive content inside the
  // thumbnail's <a>; onInteraction gives it click + keyboard activation and stops the anchor from
  // navigating when it's pressed.
  btn.setAttribute("role", "button");
  btn.setAttribute("tabindex", "0");
  const label = buttonLabel();
  btn.title = label;
  btn.setAttribute("aria-label", label);
  setInnerHtml(btn, sparkleIcon);
  onInteraction(btn, () => void onThumbClick(btn, videoId));

  anchor.appendChild(btn);
}

/** Toggles an overlay button's busy state: swaps the sparkle for the spinner and blocks re-clicks. */
function setBusy(btn: HTMLElement, busy: boolean): void {
  btn.classList.toggle("yfas-busy", busy);
  setInnerHtml(btn, busy ? loadingIcon : sparkleIcon);
}

/**
 * Summarizes a thumbnail's video. Tries the fast ANDROID InnerTube player first (fully off-page,
 * covers public videos). If that throws, the video is gated (member-only / age-restricted) — the
 * unauthenticated player exposed no tracks — so we open a new auto-summary tab that captures it with
 * the user's real session and closes itself. A `null` from the fast path means "genuinely no captions".
 */
async function onThumbClick(btn: HTMLElement, videoId: string): Promise<void> {
  if (btn.classList.contains("yfas-busy"))
    return;
  setBusy(btn, true);
  try {
    const cfg = config.getData();
    const preferredLangs = cfg.preferredLangs.split(",").map(s => s.trim()).filter(Boolean);
    const opts = preferredLangs.length > 0 ? { preferredLangs } : {};

    let result;
    try {
      result = await getSubtitlesForVideo(videoId, opts);
    }
    catch (err) {
      // Gated video: open a new tab that captures it with the user's real session and closes itself.
      // The user's feed tab stays put (scroll position preserved).
      warn(`ANDROID off-page capture failed for ${videoId}; opening an auto-summary tab:`, err);
      openAutoSummaryTab(videoId);
      return;
    }

    if (!result) {
      // No captions is an expected outcome, not a failure: just tell the user, without counting it
      // toward the repeated-failure escalation (which would wrongly prompt them to file an issue).
      warn(`No captions are available for video ${videoId}.`);
      notify(t("error.noCaptions"));
      return;
    }

    log(
      `Captured ${result.segments.length} subtitle lines off-page for ${videoId} `
      + `(${result.trackName}, lang=${result.lang}).`,
    );

    await stashSummaryPayload({
      prompt: buildPrompt(result, cfg.promptTemplate, cfg.includeTimestamps, result.videoTitle || videoId, result.videoUrl),
      autoSubmit: cfg.autoSubmit,
      title: result.videoTitle,
      createdAt: Date.now(),
    });
    openInTab(getProviderById(cfg.provider).newChatUrl, false);
  }
  catch (err) {
    error(`Failed to summarize video ${videoId} off-page:`, err);
    void reportFailure({ context: "youtube:thumbnail:capture-error" });
  }
  finally {
    setBusy(btn, false);
  }
}

/** Lazily injects a button when the pointer first enters a thumbnail (handles infinite scroll for free). */
function onPointerOver(e: Event): void {
  const target = e.target as Element | null;
  const anchor = target?.closest?.(thumbnailAnchorSelector) as HTMLAnchorElement | null;
  if (anchor)
    injectButton(anchor);
}

/** Re-applies the current interface language to all already-injected overlay buttons. */
function relabelButtons(): void {
  const label = buttonLabel();
  for (const btn of document.querySelectorAll<HTMLElement>(`.${btnClass}`)) {
    btn.title = label;
    btn.setAttribute("aria-label", label);
  }
}

/** Registers the thumbnail overlay. Call once on the YouTube side after DOM load. */
export function initThumbnailButtons(): void {
  addStyle(thumbnailStyle, "yfas-thumb");
  // Event delegation over the whole body: cheaper than observing every list container, and it
  // naturally covers thumbnails added later by SPA navigation and infinite scroll.
  document.body.addEventListener("pointerover", onPointerOver, { capture: true, passive: true });
  window.addEventListener("yfas-lang-changed", relabelButtons);
}

const thumbnailStyle = `
.${hostClass} {
  position: relative;
}
.${btnClass} {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  padding: 5px;
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.72);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s ease, background 0.12s ease;
}
.${btnClass}:hover {
  background: rgba(0, 0, 0, 0.92);
}
.${btnClass} svg {
  width: 100%;
  height: 100%;
  display: block;
}
.${hostClass}:hover .${btnClass},
.${btnClass}:focus-visible {
  opacity: 1;
}
.${btnClass}.yfas-busy {
  opacity: 1;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.88);
}
.${btnClass}.yfas-busy svg {
  animation: yfas-spin 0.8s linear infinite;
}
@keyframes yfas-spin {
  to { transform: rotate(360deg); }
}
`;
