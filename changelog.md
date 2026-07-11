# 0.8.1
- Match the settings and feedback dialogs to YouTube's dark theme, instead of always showing them in light mode; a custom Enhancer for YouTube palette is still respected

# 0.8.0
- Reliably (re)insert the summary button across YouTube's SPA navigation: the watch action row is rebuilt a few times right after each in-page navigation, which previously dropped the button when moving in and out of the watch page

# 0.7.0
- Summarize a video straight from its thumbnail — on the home feed, search, related list, or a channel page — without opening the watch page first: hover for a sparkle button that captures its subtitles and hands them to your chosen AI
- Capture public videos off-page via YouTube's ANDROID player, whose caption tracks aren't PoToken-gated (the static caption URL from the normal web response returns an empty body)
- Handle member-only and age-restricted videos off-page by opening a short-lived tab that captures them with your signed-in session and closes itself, leaving your current page and scroll position untouched

# 0.6.0
- Localize the whole UI with a new i18n engine and 10 locales; language auto-detects from the browser with a manual override in settings
- The default prompt follows the interface language and auto-switches while it is unmodified
- Localize the userscript's `@name` / `@description` header at build time

# 0.5.0
- Choose which AI service handles the summary — AI Studio, Gemini, ChatGPT, Claude, or Grok — from settings, with per-provider quality notes and a recommended pick
- Route the transcript to the chosen provider by hostname, with a verified injection cascade and a DOM-quiet settle so submission is reliable
- Rename the project YoutubeFreeSummaryWithGemini → YoutubeFreeAISummary, since it is no longer Gemini-only

# 0.4.0
- Support Trusted Types CSP so the script works in incognito windows, where YouTube enforces `require-trusted-types-for 'script'` (previously every `innerHTML` assignment threw a "Sink type mismatch" violation)
- Insert the "Summarize" button on `/live/` pages

# 0.3.0
- Grey out the "Summarize" button (with an explanatory hover tooltip) on videos that have no captions, instead of failing after a click
- Add clearer failure feedback: a spinner while working, a retry dialog, and a copyable debug report
- Avoid re-toggling the player's captions when a usable subtitle request has already been captured
- Replace the placeholder icon with a custom project icon

# 0.2.0
- Add a "Summarize" button next to the like/dislike buttons on the watch page
- Capture subtitles (including member-only / PoToken videos) by intercepting the player's timedtext request, with a transcript-panel fallback; output includes timestamps
- Open Google AI Studio and inject the prompt automatically, with optional auto-submit
- Settings panel: prompt template, include timestamps, auto-submit, preferred subtitle languages

# 0.1.0
- Initial release