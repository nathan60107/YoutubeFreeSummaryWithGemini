/**
 * "Auto-summary tab" — the off-page path for gated videos (member-only / age-restricted) that the
 * unauthenticated ANDROID player can't reach.
 *
 * Instead of navigating the user's current tab (which loses their feed scroll position), we open the
 * video's watch page in a *new* tab carrying a `#yfas-autosummarize` marker. That tab has the real,
 * session-authenticated player — so member content and correctly-bound PoTokens just work — detects
 * the marker on load, runs the normal on-page capture, hands off to the AI provider, and then closes
 * itself. The user's original tab is never touched.
 */

import { reportFailure } from "./feedback";
import { watchUrl } from "./remote-subtitles";
import { captureAndHandoff } from "./summarize";
import { error, log, openInTab, waitForSelector, warn } from "./utils";

/** URL-hash marker identifying a watch tab we opened to auto-summarize. */
const marker = "yfas-autosummarize";

/**
 * Opens `videoId`'s watch page in a new tab that will auto-summarize itself and close. Opened in the
 * foreground so the player runs without background-tab throttling and any failure stays visible; the
 * user's current (feed) tab keeps its scroll position because it is never navigated.
 */
export function openAutoSummaryTab(videoId: string): void {
  openInTab(`${watchUrl(videoId)}#${marker}`, false);
}

/** Whether this page load is an auto-summary request (a watch page we opened with the marker). */
export function isAutoSummaryRequest(): boolean {
  return location.pathname.startsWith("/watch") && location.hash.includes(marker);
}

/** Closes the current tab (best-effort — some managers restrict closing script-opened tabs). */
function closeSelfTab(): void {
  try {
    window.close();
  }
  catch(err) {
    warn("could not auto-close the summary tab:", err);
  }
}

/**
 * Runs in an auto-summary tab: waits for the player, captures + hands off, then closes the tab.
 * On failure the tab is left open so the reported error stays visible. `config` must already be loaded.
 */
export async function runAutoSummary(): Promise<void> {
  // Strip our marker from the URL so it doesn't leak into the prompt's {{url}} or linger in history.
  try {
    history.replaceState(null, "", location.pathname + location.search);
  }
  catch { /* replaceState unavailable — harmless, the marker just stays in the URL */ }

  log("Auto-summary tab: waiting for the player, then capturing…");
  let handedOff = false;
  try {
    await waitForSelector("#movie_player", 20_000);
    handedOff = await captureAndHandoff();
  }
  catch(err) {
    error("Auto-summary capture failed:", err);
    void reportFailure({ context: "youtube:auto-summary-error" });
  }

  if(handedOff)
    closeSelfTab();
}
