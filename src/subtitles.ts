/**
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

import { peekTimedtextUrl, waitForTimedtextUrl } from "./intercept";
import { warn, waitForSelector } from "./utils";

//#region types

/** A single subtitle line with its start time (seconds) and text. */
export type SubtitleSegment = {
  /** Start time in seconds. */
  start: number;
  /** The line's text content, decoded and trimmed. */
  text: string;
};

/** Result of a successful subtitle capture. */
export type SubtitleResult = {
  /** BCP-47-ish language code of the captured track, e.g. "en", "zh-Hant". */
  lang: string;
  /** Human-readable track name, e.g. "English (auto-generated)". */
  trackName: string;
  /** Parsed segments in chronological order. */
  segments: SubtitleSegment[];
  /** Convenience: all segment texts joined with newlines (no timestamps). */
  text: string;
  /** All segments as `[h:mm:ss] text` lines - this is what gets sent to the AI for time-aware analysis. */
  timedText: string;
  /** Which strategy produced the result. */
  source: "intercept-timedtext" | "transcript-panel" | "innertube-player";
};

/** Subset of YouTube's player response that we rely on. */
export type YtPlayerResponse = {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: YtCaptionTrack[];
    };
  };
  videoDetails?: {
    videoId?: string;
    title?: string;
  };
};

type YtCaptionTrack = {
  /** e.g. { simpleText: "English" } */
  name?: { simpleText?: string; runs?: { text: string }[] };
  languageCode: string;
  /** "asr" for auto-generated tracks, otherwise absent. */
  kind?: string;
  /**
   * Static timedtext URL from the player response. On the watch page we prefer the intercepted
   * (PoToken-bearing) URL instead, but off-page — where no player runs — this is our only handle.
   */
  baseUrl?: string;
};

/** Shape of YouTube's `fmt=json3` timedtext payload (only the fields we read). */
export type Json3Response = {
  events?: {
    segs?: { utf8?: string }[];
    tStartMs?: number;
  }[];
};

/** The `#movie_player` element exposes these methods at runtime. */
type MoviePlayer = HTMLElement & {
  getPlayerResponse?: () => YtPlayerResponse;
};

//#endregion
//#region page-global access

/**
 * Page globals (`ytInitialPlayerResponse`, the player element's methods) live in the page's
 * realm. In sandboxed userscript engines we need `unsafeWindow` to reach them.
 */
const pageWindow = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window) as Window & {
  ytInitialPlayerResponse?: YtPlayerResponse;
};

/** Options for picking which caption track to capture. */
export type CaptureOptions = {
  /**
   * Ordered list of preferred language codes (prefix match, e.g. "zh" matches "zh-Hant").
   * Defaults to the browser UI language followed by English.
   */
  preferredLangs?: string[];
};

//#endregion
//#region player response

/**
 * Returns the most up-to-date player response. `movie_player.getPlayerResponse()` reflects the
 * currently playing video after SPA navigation, whereas `ytInitialPlayerResponse` goes stale.
 */
function getPlayerResponse(): YtPlayerResponse | undefined {
  try {
    const player = (pageWindow.document ?? document).getElementById("movie_player") as MoviePlayer | null;
    const fromPlayer = player?.getPlayerResponse?.();
    if(fromPlayer?.captions)
      return fromPlayer;
  }
  catch(err) {
    warn("getPlayerResponse() unavailable, falling back to ytInitialPlayerResponse:", err);
  }
  return pageWindow.ytInitialPlayerResponse;
}

/** Extracts the caption track list from a player response. */
export function getCaptionTracks(resp: YtPlayerResponse | undefined): YtCaptionTrack[] {
  return resp?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
}

/** Resolves a track's display name across the two shapes YouTube uses. */
export function trackName(track: YtCaptionTrack): string {
  return track.name?.simpleText
    ?? track.name?.runs?.map(r => r.text).join("")
    ?? track.languageCode;
}

/**
 * Picks the best track for the user: first a manually-created track in a preferred language,
 * then an auto-generated one in a preferred language, then any manual track, then anything.
 */
export function pickTrack(tracks: YtCaptionTrack[], preferredLangs: string[]): YtCaptionTrack | undefined {
  if(tracks.length === 0)
    return undefined;

  const matchesLang = (t: YtCaptionTrack) =>
    preferredLangs.some(l => t.languageCode.toLowerCase().startsWith(l.toLowerCase()));
  const isManual = (t: YtCaptionTrack) => t.kind !== "asr";

  return tracks.find(t => matchesLang(t) && isManual(t))
    ?? tracks.find(t => matchesLang(t))
    ?? tracks.find(isManual)
    ?? tracks[0];
}

//#endregion
//#region json3 parsing

/** Decodes a json3 timedtext payload into ordered segments. */
export function parseJson3(data: Json3Response): SubtitleSegment[] {
  const segments: SubtitleSegment[] = [];
  for(const event of data.events ?? []) {
    const text = (event.segs ?? []).map(s => s.utf8 ?? "").join("").replace(/\s+/g, " ").trim();
    if(text.length === 0)
      continue;
    segments.push({
      start: (event.tStartMs ?? 0) / 1000,
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
function enablePlayerCaptions(): void {
  const btn = document.querySelector<HTMLButtonElement>(".ytp-subtitles-button");
  if(!btn) {
    warn("CC button (.ytp-subtitles-button) not found; cannot enable captions");
    return;
  }
  if(btn.getAttribute("aria-pressed") !== "true")
    btn.click();
}

/**
 * Strategy: trigger the player to fetch captions, grab the (PoToken-bearing, authenticated) URL
 * it requested via the interceptor, then refetch it as json3 ourselves. Works for member-only and
 * `exp=xpe` videos. Returns `null` if no request was captured or it produced no segments.
 */
async function fetchViaInterceptedUrl(videoId?: string): Promise<SubtitleSegment[] | null> {
  // If the player already issued a timedtext request we can reuse, don't disturb the user's
  // caption state; only toggle captions on when we have nothing captured yet.
  if(!peekTimedtextUrl(videoId))
    enablePlayerCaptions();

  const captured = await waitForTimedtextUrl(videoId, 6000);
  if(!captured) {
    warn("no player timedtext request captured (could not enable captions in time?)");
    return null;
  }

  const url = new URL(captured, location.origin);
  url.searchParams.set("fmt", "json3");

  const res = await fetch(url.toString(), { credentials: "include" });
  if(!res.ok)
    return null;

  const body = await res.text();
  if(body.trim().length === 0)
    return null;

  const segments = parseJson3(JSON.parse(body) as Json3Response);
  return segments.length > 0 ? segments : null;
}

//#endregion
//#region strategy 2: transcript panel DOM scrape

/** The "Show transcript" button, which lives in the description's transcript section. */
const transcriptButtonSelector =
  "ytd-video-description-transcript-section-renderer #primary-button button, "
  + "ytd-video-description-transcript-section-renderer button";
/** The description "...more" expander, which must be opened for the transcript section to render. */
const descriptionExpandSelector =
  "ytd-text-inline-expander #expand, #description #expand, tp-yt-paper-button#expand";
/** A rendered transcript line. */
const transcriptRowSelector = "transcript-segment-view-model";

/**
 * Opens YouTube's transcript panel so its segments render into the DOM, then waits for them.
 * The "Show transcript" button only renders after the description is expanded, so we expand it
 * first if the button isn't already present. Returns true once transcript rows are available.
 */
async function openTranscriptPanel(): Promise<boolean> {
  if(document.querySelector(transcriptRowSelector))
    return true;

  let button = document.querySelector<HTMLElement>(transcriptButtonSelector);
  if(!button) {
    document.querySelector<HTMLElement>(descriptionExpandSelector)?.click();
    button = await waitForSelector<HTMLElement>(transcriptButtonSelector, 3000);
  }

  if(!button) {
    warn("could not find the 'Show transcript' button");
    return false;
  }

  button.click();
  return Boolean(await waitForSelector(transcriptRowSelector, 5000));
}

/** Reads already-rendered transcript segments from YouTube's "Show transcript" panel, if open. */
function scrapeTranscriptPanel(): SubtitleSegment[] {
  const segments: SubtitleSegment[] = [];
  for(const row of document.querySelectorAll<HTMLElement>(transcriptRowSelector)) {
    const text = row.querySelector(".ytAttributedStringHost")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if(text.length === 0)
      continue;
    const stamp = row.querySelector(".ytwTranscriptSegmentViewModelTimestamp")?.textContent?.trim() ?? "";
    segments.push({ start: parseTimestamp(stamp), text });
  }
  return segments;
}

/** Parses a "m:ss" / "h:mm:ss" transcript timestamp into seconds. */
function parseTimestamp(stamp: string): number {
  const parts = stamp.split(":").map(Number);
  if(parts.some(isNaN))
    return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

//#endregion
//#region public API

/** Formats a number of seconds as `m:ss`, or `h:mm:ss` once it reaches an hour. */
export function formatTimestamp(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hrs > 0
    ? `${hrs}:${pad(mins)}:${pad(secs)}`
    : `${mins}:${pad(secs)}`;
}

/** Joins segments into `[h:mm:ss] text` lines for time-aware AI analysis. */
export function toTimedText(segments: SubtitleSegment[]): string {
  return segments.map(s => `[${formatTimestamp(s.start)}] ${s.text}`).join("\n");
}

/** Returns the browser UI language plus English as default preferred languages. */
export function defaultPreferredLangs(): string[] {
  const langs = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean);
  return [...new Set([...langs, "en"])];
}

/**
 * Whether the currently playing video exposes any caption track. Used to grey out the summary
 * button up front when there is nothing to summarize.
 */
export function hasCaptionsAvailable(): boolean {
  return getCaptionTracks(getPlayerResponse()).length > 0;
}

/**
 * Captures subtitles for the currently playing video using page-based strategies.
 * Returns `null` if the video has no captions available at all.
 *
 * @throws if a track was found but every strategy failed to produce text.
 */
export async function getCurrentSubtitles(opts: CaptureOptions = {}): Promise<SubtitleResult | null> {
  const preferredLangs = opts.preferredLangs ?? defaultPreferredLangs();

  const resp = getPlayerResponse();
  const tracks = getCaptionTracks(resp);
  const track = pickTrack(tracks, preferredLangs);

  // Strategy 1: intercept the player's own timedtext request (carries a valid PoToken and the
  // user's session, so it works on member-only / exp=xpe videos).
  if(track) {
    let segments: SubtitleSegment[] | null = null;
    try {
      segments = await fetchViaInterceptedUrl(resp?.videoDetails?.videoId);
    }
    catch(err) {
      warn("intercepted-timedtext fetch failed:", err);
    }

    if(segments && segments.length > 0) {
      return {
        lang: track.languageCode,
        trackName: trackName(track),
        segments,
        text: segments.map(s => s.text).join("\n"),
        timedText: toTimedText(segments),
        source: "intercept-timedtext",
      };
    }
  }

  // Strategy 2: open + scrape YouTube's own transcript panel.
  await openTranscriptPanel();
  const panelSegments = scrapeTranscriptPanel();
  if(panelSegments.length > 0) {
    return {
      lang: track?.languageCode ?? "unknown",
      trackName: track ? trackName(track) : "Transcript",
      segments: panelSegments,
      text: panelSegments.map(s => s.text).join("\n"),
      timedText: toTimedText(panelSegments),
      source: "transcript-panel",
    };
  }

  if(!track)
    return null; // no captions at all

  throw new Error("Found a caption track but could not capture its text (PoToken-gated and transcript panel unavailable)");
}

//#endregion
