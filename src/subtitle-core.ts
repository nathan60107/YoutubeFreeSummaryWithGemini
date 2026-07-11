/**
 * Shared subtitle primitives: the types describing YouTube's caption data and the pure functions
 * that parse and normalize it. Both capture strategies depend on this core — `subtitles.ts` for
 * on-page (watch page) capture and `remote-subtitles.ts` for off-page (InnerTube) capture — so the
 * shared code lives here rather than in either strategy module, keeping the dependency direction
 * flat (both strategies point at the core, not at each other).
 */

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

/** Options for picking which caption track to capture. */
export type CaptureOptions = {
  /**
   * Ordered list of preferred language codes (prefix match, e.g. "zh" matches "zh-Hant").
   * Defaults to the browser UI language followed by English.
   */
  preferredLangs?: string[];
};

//#endregion
//#region track selection

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

/** Returns the browser UI language plus English as default preferred languages. */
export function defaultPreferredLangs(): string[] {
  const langs = [navigator.language, ...(navigator.languages ?? [])].filter(Boolean);
  return [...new Set([...langs, "en"])];
}

//#endregion
//#region json3 parsing / formatting

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

/** Formats a number of seconds as `m:ss`, or `h:mm:ss` once it reaches an hour. */
function formatTimestamp(totalSeconds: number): string {
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

//#endregion
