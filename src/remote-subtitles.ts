/**
 * Off-page subtitle capture: fetches subtitles for an arbitrary video id *without* opening its
 * watch page, so the thumbnail overlay button (see `thumbnails.ts`) can summarize straight from a
 * home/search/related list.
 *
 * The on-page strategies in `subtitles.ts` (intercepting the player's timedtext request, scraping
 * the transcript panel) all need the player to be running, which it isn't off-page. And the static
 * `captionTracks[].baseUrl` from a normal (WEB) player response is now PoToken-gated (`exp=xpe`) and
 * returns an empty body when fetched directly.
 *
 * So instead we ask YouTube's InnerTube `player` endpoint for a fresh player response while
 * impersonating the **ANDROID** client: that client's `captionTracks[].baseUrl` is *not* PoToken-
 * gated, so we can fetch it as `fmt=json3` and parse it with the same code path as the watch page.
 * The request is same-origin (we're on youtube.com), so it just works under YouTube's CSP.
 *
 * Known limitation: this uses the *unauthenticated* ANDROID player (no SAPISIDHASH), so member-only
 * / age-restricted / private videos return no caption tracks off-page. Those still need the watch
 * page, where the interceptor strategy handles them with the user's real session.
 */

import {
  defaultPreferredLangs,
  getCaptionTracks,
  parseJson3,
  pickTrack,
  toTimedText,
  trackName,
  type CaptureOptions,
  type Json3Response,
  type SubtitleResult,
  type YtPlayerResponse,
} from "./subtitles";
import { warn } from "./utils";

/** A subtitle capture plus the title/URL of the (remote) video it came from. */
export type RemoteSubtitleResult = SubtitleResult & {
  /** The video id these subtitles belong to. */
  videoId: string;
  /** The video's title, read from its fetched player response. */
  videoTitle: string;
  /** The canonical watch URL for the video. */
  videoUrl: string;
};

/**
 * ANDROID InnerTube client identity. The ANDROID client's caption `baseUrl`s aren't PoToken-gated,
 * which is the whole reason we impersonate it here. The version drifts over time but YouTube is
 * lenient about it; bump it if the endpoint starts rejecting requests.
 */
const ANDROID_CLIENT = {
  clientName: "ANDROID",
  clientVersion: "20.10.38",
  androidSdkVersion: 30,
} as const;

/** Public WEB InnerTube key, used only as a fallback if the page's own key can't be read. */
const FALLBACK_INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

/** Page realm, where YouTube's `ytcfg` (holding the real InnerTube key) lives. */
const pageWindow = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window) as unknown as {
  ytcfg?: { get?: (k: string) => unknown; data_?: Record<string, unknown> };
};

/** Builds the canonical watch URL for a video id. */
export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Reads the page's own InnerTube API key (from `ytcfg`), falling back to the public WEB key. */
function getInnertubeApiKey(): string {
  try {
    const key = pageWindow.ytcfg?.get?.("INNERTUBE_API_KEY")
      ?? pageWindow.ytcfg?.data_?.INNERTUBE_API_KEY;
    if(typeof key === "string" && key.length > 0)
      return key;
  }
  catch { /* fall through to the constant */ }
  return FALLBACK_INNERTUBE_API_KEY;
}

/**
 * Fetches a fresh player response for `videoId` from the InnerTube `player` endpoint using the
 * ANDROID client, so the caption `baseUrl`s it returns are usable without a PoToken.
 */
async function fetchAndroidPlayerResponse(videoId: string): Promise<YtPlayerResponse | null> {
  const apiKey = getInnertubeApiKey();
  const hl = (navigator.language || "en").split("-")[0];

  const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-YouTube-Client-Name": "3", // 3 = ANDROID
      "X-YouTube-Client-Version": ANDROID_CLIENT.clientVersion,
    },
    body: JSON.stringify({ context: { client: { ...ANDROID_CLIENT, hl } }, videoId }),
  });

  if(!res.ok) {
    warn(`InnerTube player request for ${videoId} failed with HTTP ${res.status}`);
    return null;
  }
  return await res.json() as YtPlayerResponse;
}

/** Fetches a caption track's `baseUrl` as `fmt=json3` and parses it into segments. */
async function fetchTrackSegments(baseUrl: string) {
  const url = new URL(baseUrl, "https://www.youtube.com");
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

/** The `playabilityStatus.status` field, when present, tells us why a video is inaccessible. */
type PlayerResponseWithStatus = YtPlayerResponse & { playabilityStatus?: { status?: string } };

/**
 * Captures subtitles for `videoId` without opening its watch page.
 * Returns `null` if the video has no caption tracks at all.
 *
 * @throws if the video is gated (login/age) or a track exists but its text couldn't be fetched.
 */
export async function getSubtitlesForVideo(
  videoId: string,
  opts: CaptureOptions = {},
): Promise<RemoteSubtitleResult | null> {
  const preferredLangs = opts.preferredLangs ?? defaultPreferredLangs();

  const resp = await fetchAndroidPlayerResponse(videoId) as PlayerResponseWithStatus | null;
  const tracks = getCaptionTracks(resp ?? undefined);
  const track = pickTrack(tracks, preferredLangs);

  if(!track) {
    // No tracks can mean "genuinely no captions" or "the ANDROID player couldn't play it" (member-
    // only / age-restricted / private): distinguish so the failure message can point to the watch page.
    const status = resp?.playabilityStatus?.status;
    if(status && status !== "OK")
      throw new Error(`Video ${videoId} is not accessible off-page (${status}); open the watch page to summarize it`);
    return null; // no captions at all
  }

  const videoTitle = resp?.videoDetails?.title ?? "";

  if(!track.baseUrl)
    throw new Error(`Caption track for ${videoId} has no baseUrl to fetch`);

  const segments = await fetchTrackSegments(track.baseUrl);
  if(!segments)
    throw new Error(`Found a caption track for ${videoId} but its timedtext body was empty`);

  return {
    videoId,
    videoTitle,
    videoUrl: watchUrl(videoId),
    lang: track.languageCode,
    trackName: trackName(track),
    segments,
    text: segments.map(s => s.text).join("\n"),
    timedText: toTimedText(segments),
    source: "innertube-player",
  };
}
