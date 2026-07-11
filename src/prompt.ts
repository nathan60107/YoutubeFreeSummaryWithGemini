/**
 * Builds the final AI prompt from a captured transcript, shared by both trigger surfaces: the
 * watch-page summary button and the off-page thumbnail overlay. Kept separate from `youtube.ts`
 * so the off-page path can supply its own title/URL (the ones it fetched) instead of reading the
 * current watch page's DOM.
 */

import { t } from "./i18n";
import type { SubtitleResult } from "./subtitles";

/**
 * Substitutes the template tokens with the video's data. An empty template means "follow the
 * interface language": the active locale's default prompt is used instead.
 *
 * @param title   Video title, substituted for `{{title}}`.
 * @param url     Watch URL, substituted for `{{url}}`.
 */
export function buildPrompt(
  result: SubtitleResult,
  template: string,
  includeTimestamps: boolean,
  title: string,
  url: string,
): string {
  const transcript = includeTimestamps ? result.timedText : result.text;
  return (template.trim() || t("prompt.default"))
    .split("{{title}}").join(title)
    .split("{{url}}").join(url)
    .split("{{transcript}}").join(transcript);
}
