/**
 * The shared "capture the current watch page's subtitles and hand them to the AI provider" flow.
 *
 * Used by two triggers: the watch-page summary button (`youtube.ts`), and the auto-summary tab that
 * the off-page thumbnail button opens for gated videos (`auto-summarize.ts`). Keeping it here (rather
 * than in `youtube.ts`) avoids an import cycle with `auto-summarize.ts`.
 */

import { config } from "./config";
import { notify } from "./feedback";
import { stashSummaryPayload } from "./handoff";
import { t } from "./i18n";
import { buildPrompt } from "./prompt";
import { getProviderById } from "./providers";
import { getCurrentSubtitles } from "./subtitles";
import { log, warn } from "./log";
import { openInTab } from "./utils";

/** Reads the current video's title from the watch page, falling back to the document title. */
function getVideoTitle(): string {
  const fromMeta = document.querySelector("ytd-watch-metadata h1")?.textContent?.trim();
  if(fromMeta)
    return fromMeta;
  return document.title.replace(/\s*-\s*YouTube\s*$/, "").trim();
}

/**
 * Captures the current watch page's subtitles and stashes a payload for the AI provider tab, then
 * opens that tab. Assumes we're on a watch page with the player available.
 *
 * @returns `true` if a summary was handed off; `false` if the video has no captions (the user is
 *   notified of that expected condition, but it is not counted as a failure).
 * @throws if capture itself fails (the caller is expected to report the error).
 */
export async function captureAndHandoff(): Promise<boolean> {
  const cfg = config.getData();
  const preferredLangs = cfg.preferredLangs.split(",").map(s => s.trim()).filter(Boolean);

  const result = await getCurrentSubtitles(preferredLangs.length > 0 ? { preferredLangs } : {});
  if(!result) {
    // No captions is an expected outcome, not a failure: notify without counting it toward the
    // repeated-failure escalation (which would wrongly prompt the user to file an issue).
    warn("No captions are available for this video.");
    notify(t("error.noCaptions"));
    return false;
  }

  log(
    `Captured ${result.segments.length} subtitle lines `
    + `(${result.trackName}, lang=${result.lang}, via ${result.source}).`,
  );

  await stashSummaryPayload({
    prompt: buildPrompt(result, cfg.promptTemplate, cfg.includeTimestamps, getVideoTitle(), location.href),
    autoSubmit: cfg.autoSubmit,
    title: getVideoTitle(),
    createdAt: Date.now(),
  });
  openInTab(getProviderById(cfg.provider).newChatUrl, false); // foreground the AI provider tab
  return true;
}
