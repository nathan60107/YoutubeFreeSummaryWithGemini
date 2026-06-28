# YouTube Free Summary with Gemini

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![zh-TW](https://img.shields.io/badge/lang-zh--TW-green.svg)](README.zh-TW.md)

---

**YouTube Free Summary with Gemini** is a Tampermonkey / Violentmonkey userscript that adds a button to YouTube which grabs the current video's subtitles and drops them straight into a freshly opened Google AI Studio (Gemini) tab, ready to be summarized.

It is built to solve the two problems that other summary scripts run into: subtitles that can't be fetched from outside the page, and prompts that get truncated because the transcript is smuggled through the URL.

## Features

- **On-page subtitle capture** — Reads the subtitles the page already has access to, instead of fetching them from an external API, so it still works on restricted, members-only or region-locked videos that outside tools can't reach
- **No length limit** — Hands the transcript to AI Studio directly rather than through URL parameters, avoiding the character cap that truncates other scripts
- **Completely free** — No API key and no paid service required; you only need to be logged into Google AI Studio
- **One click** — Adds a single button to the YouTube player page that captures the subtitles and opens AI Studio for you

## Installation

> This project is currently under active development. Installation links will be added with the first release.

| Platform | Link |
|----------|------|
| GreasyFork (Tampermonkey / Violentmonkey) | 🚧 In Development |
| OpenUserJS (Tampermonkey / Violentmonkey) | 🚧 In Development |

## Development

```bash
# Install dependencies
npm install

# Development mode with live reload
npm run dev

# Production build (all platforms)
npm run build-prod
```

## License

This project is licensed under the [MIT License](./LICENSE.txt).
