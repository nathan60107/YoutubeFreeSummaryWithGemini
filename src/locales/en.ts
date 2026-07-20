/**
 * English locale — the reference dictionary.
 *
 * Its keys define the {@linkcode TranslationKey} union that every other locale must satisfy, and its
 * values are the runtime fallback used whenever an active locale is missing a key. When you add a new
 * user-facing string, add it here first; TypeScript will then flag it as missing in the other locales.
 *
 * Values may contain trusted inline HTML (e.g. `<code>…</code>`) — they are our own constants, never
 * user input, and are injected through the Trusted Types policy. `%1`, `%2`, … are positional
 * placeholders replaced by {@linkcode t} arguments.
 */
export const en = {
  // Settings modal
  "settings.dialogLabel": "YFAS Settings",
  "settings.title": "YouTube Summary Settings",
  "settings.provider.label": "AI service",
  "settings.provider.hint": "Choose which AI receives the summary (you must be signed in to it first)",
  "settings.provider.recommended": " (recommended)",
  "settings.language.label": "Interface language",
  "settings.language.hint": "Language this script's own interface is shown in",
  "settings.language.auto": "Follow browser",
  "settings.prompt.label": "Prompt template",
  "settings.prompt.hint": "Variables: <code>{{title}}</code> title, <code>{{url}}</code> link, <code>{{transcript}}</code> subtitles",
  "settings.langs.label": "Preferred subtitle languages",
  "settings.langs.hint": "Comma-separated language codes, e.g. <code>zh-TW, ja, en</code>. Empty = follow browser language",
  "settings.langs.placeholder": "Empty = auto",
  "settings.timestamps": "Include timestamps in subtitles (<code>[h:mm:ss]</code>)",
  "settings.autoSubmit": "Auto-submit after injecting",
  "settings.reset": "Reset to defaults",
  "settings.cancel": "Cancel",
  "settings.save": "Save",

  // Summary button (YouTube side)
  "button.label": "Summarize",
  "button.summarizeWith": "Summarize with %1",
  "button.settings": "Settings",
  "button.noCaptions": "This video has no captions available, so it can't be summarized",

  // Failure-feedback modal
  "feedback.title": "Summary failed",
  "feedback.defaultMessage": "The summary failed. Please refresh the page and try again.",
  "feedback.debug.lead": "This problem seems to keep happening. If it persists, please help report it so it can be fixed faster:",
  "feedback.debug.step1": "Click “Copy diagnostics” below.",
  "feedback.debug.step2": "Go to the issue tracker and open a new issue.",
  "feedback.debug.step3": "Paste what you copied and briefly describe what you did.",
  "feedback.debug.copy": "Copy diagnostics",
  "feedback.debug.copied": "Copied ✓",
  "feedback.debug.copyFailed": "Copy failed, please select manually",
  "feedback.debug.issue": "Go to the issue tracker ↗",
  "feedback.close": "Close",

  // Notice modal — an expected, non-error condition (e.g. a video simply has no captions)
  "notice.title": "No captions found",

  // Error messages shown in the feedback modal
  "error.noCaptions": "No subtitles/translations were found for this video, so it can't be summarized. Make sure the video has captions, then refresh and try again.",
  "error.noInput": "Couldn't find the input box on %1 — the page may not have finished loading, or its layout changed. Please refresh and try again.",

  // Per-provider quality/limitation notes (shown in settings when selected)
  "provider.aistudio.note": "Best quality: no length limit and free access to Pro models; longer thinking time, but very accurate results. Great for long subtitles.",
  "provider.gemini.note": "Good results, but the input box has a length limit; longer subtitles may not paste in full.",
  "provider.chatgpt.note": "Weaker free model; may not respond at all when the subtitles are too long. Best for shorter videos.",
  "provider.claude.note": "Longer thinking time; results occasionally have minor flaws.",
  "provider.grok.note": "Quality below AI Studio; results occasionally have minor flaws.",

  // Development-only menu command
  "dev.clearFailures": "[dev] Clear failure count",

  // Default summary prompt sent to the AI. Keep the {{title}}/{{url}}/{{transcript}} tokens verbatim.
  "prompt.default": [
    "Summarize the key points of the following YouTube video subtitles (with timestamps), and mark the corresponding timestamp for each point.",
    "",
    "Title: {{title}}",
    "URL: {{url}}",
    "",
    "{{transcript}}",
  ].join("\n"),
} as const;

/** Every translation key. Each non-reference locale must provide a value for all of these. */
export type TranslationKey = keyof typeof en;

/** Shape of a complete locale dictionary. */
export type Translations = Record<TranslationKey, string>;
