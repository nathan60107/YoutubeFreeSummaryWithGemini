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