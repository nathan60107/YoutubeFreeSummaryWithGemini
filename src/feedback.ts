/**
 * Shared failure feedback used by both the YouTube and AI provider sides.
 *
 * On a failure we show a modal telling the user to refresh and retry. Failure timestamps are
 * persisted (via GM storage, shared across tabs) so that if the user hits two failures within
 * five minutes — even across a page refresh or across the YouTube/AI provider tabs — the modal
 * escalates to include a copyable debug report and a prompt to file a GitHub issue.
 */

import { buildNumber, host, platformNames, repo, scriptInfo } from "./constants";
import { t } from "./i18n";
import { openModal } from "./modal";
import { getRecentLogs } from "./log";
import { addStyle } from "./utils";

/** GM storage key holding the recent failure timestamps (JSON array of epoch ms). */
const failuresKey = "yfas-recent-failures";
/** Sliding window within which repeated failures escalate the modal. */
const failureWindowMs = 5 * 60_000;
/** Number of failures within the window that triggers the debug-report escalation. */
const escalateThreshold = 2;

/** GitHub issues page users are directed to when reporting a persistent problem. */
const issuesUrl = `https://github.com/${repo}/issues/new`;

const overlayId = "yfas-feedback-overlay";
const styleRef = "yfas-feedback";

/** Options describing a failure to surface to the user. */
export interface FailureInfo {
  /** Short machine-ish label of where the failure happened, e.g. `"youtube:capture"`. Shown in the debug report. */
  context: string;
  /** User-facing explanation. Falls back to a generic "please refresh and retry" message. */
  userMessage?: string;
}

/**
 * Records the failure and shows the feedback modal, escalating to a debug report if this is the
 * {@linkcode escalateThreshold}-th failure within {@linkcode failureWindowMs}.
 */
export async function reportFailure(info: FailureInfo): Promise<void> {
  const count = await trackFailure();
  showModal(info, count >= escalateThreshold);
}

/** Clears the persisted failure counter. Exposed for the dev-only "reset" menu command. */
export async function clearFailureCount(): Promise<void> {
  await GM.deleteValue(failuresKey);
}

/** Appends `now` to the persisted failure list, prunes old entries, and returns the count in-window. */
async function trackFailure(): Promise<number> {
  const now = Date.now();
  let times: number[] = [];
  try {
    times = JSON.parse(await GM.getValue<string>(failuresKey, "[]"));
    if(!Array.isArray(times))
      times = [];
  }
  catch {
    times = [];
  }
  times = times.filter(t => typeof t === "number" && now - t < failureWindowMs);
  times.push(now);
  await GM.setValue(failuresKey, JSON.stringify(times));
  return times.length;
}

/** Assembles a plain-text diagnostic report: environment, install source, and recent logs. */
function buildDebugReport(context: string): string {
  // scriptHandler/version aren't in the GM typings, so read them loosely.
  const gm = GM.info as unknown as { scriptHandler?: string; version?: string };
  const langs = Array.isArray(navigator.languages) ? navigator.languages.join(", ") : navigator.language;
  const logs = getRecentLogs();

  return [
    "### YFAS debug report",
    `time: ${new Date().toISOString()}`,
    `context: ${context}`,
    "",
    "**Script**",
    `- name: ${scriptInfo.name}`,
    `- version: ${scriptInfo.version}`,
    `- build: ${buildNumber}`,
    `- install source: ${platformNames[host] ?? host}`,
    `- namespace: ${scriptInfo.namespace}`,
    "",
    "**Environment**",
    `- manager: ${gm.scriptHandler ?? "unknown"} ${gm.version ?? ""}`.trimEnd(),
    `- url: ${location.href}`,
    `- userAgent: ${navigator.userAgent}`,
    `- platform: ${(navigator as unknown as { platform?: string }).platform ?? "unknown"}`,
    `- language: ${navigator.language} (${langs})`,
    `- viewport: ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}x`,
    "",
    "**Recent logs**",
    logs.length > 0 ? logs.join("\n") : "(no logs captured)",
  ].join("\n");
}

/** Builds and shows the modal. Only one is shown at a time. */
function showModal(info: FailureInfo, escalate: boolean): void {
  const report = escalate ? buildDebugReport(info.context) : "";

  const handle = openModal({
    id: overlayId,
    label: t("feedback.title"),
    role: "alertdialog",
    innerHtml: `
      <h2 class="yfas-modal-title">${t("feedback.title")}</h2>
      <p class="yfas-fb-msg"></p>
      ${escalate ? `
        <div class="yfas-fb-debug">
          <p class="yfas-fb-debug-lead">${t("feedback.debug.lead")}</p>
          <ol class="yfas-fb-steps">
            <li>${t("feedback.debug.step1")}</li>
            <li>${t("feedback.debug.step2")}</li>
            <li>${t("feedback.debug.step3")}</li>
          </ol>
          <textarea class="yfas-fb-report" readonly rows="8"></textarea>
          <div class="yfas-fb-debug-actions">
            <button type="button" class="yfas-modal-btn yfas-modal-btn--secondary" data-action="copy">${t("feedback.debug.copy")}</button>
            <a class="yfas-fb-issue" href="${issuesUrl}" target="_blank" rel="noopener noreferrer">${t("feedback.debug.issue")}</a>
          </div>
        </div>` : ""}
      <div class="yfas-fb-actions">
        <button type="button" class="yfas-modal-btn yfas-modal-btn--primary" data-action="close">${t("feedback.close")}</button>
      </div>`,
  });
  if(!handle)
    return; // one at a time

  if(!document.getElementById(`global-style-${styleRef}`))
    addStyle(feedbackStyle, styleRef);

  const { overlay, close } = handle;

  // Assign text via textContent to avoid injecting untrusted strings as HTML.
  overlay.querySelector<HTMLElement>(".yfas-fb-msg")!.textContent = info.userMessage ?? t("feedback.defaultMessage");
  overlay.querySelector("[data-action='close']")!.addEventListener("click", close);

  if(escalate) {
    const reportEl = overlay.querySelector<HTMLTextAreaElement>(".yfas-fb-report")!;
    reportEl.value = report;
    const copyBtn = overlay.querySelector<HTMLButtonElement>("[data-action='copy']")!;
    copyBtn.addEventListener("click", async () => {
      const ok = await copyText(report, reportEl);
      copyBtn.textContent = ok ? t("feedback.debug.copied") : t("feedback.debug.copyFailed");
      setTimeout(() => (copyBtn.textContent = t("feedback.debug.copy")), 2500);
    });
  }

  overlay.querySelector<HTMLButtonElement>("[data-action='close']")!.focus();
}

/** Copies text to the clipboard, falling back to selecting the textarea + `execCommand`. */
async function copyText(text: string, textarea: HTMLTextAreaElement): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  }
  catch {
    try {
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.setSelectionRange(0, 0);
      textarea.blur();
      return ok;
    }
    catch {
      return false;
    }
  }
}

const feedbackStyle = `
.yfas-fb-msg {
  margin: 0 0 8px;
  font-size: 1.4rem;
  line-height: 1.5;
}
.yfas-fb-debug {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--yt-spec-10-percent-layer, rgba(0, 0, 0, 0.15));
}
.yfas-fb-debug-lead {
  margin: 0 0 8px;
  font-size: 1.3rem;
  line-height: 1.5;
}
.yfas-fb-steps {
  margin: 0 0 12px;
  padding-left: 20px;
  font-size: 1.3rem;
  line-height: 1.6;
}
.yfas-fb-report {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  font-family: monospace;
  font-size: 1.2rem;
  line-height: 1.4;
  padding: 8px 10px;
  border: 1px solid var(--yt-spec-10-percent-layer, rgba(0, 0, 0, 0.2));
  border-radius: 8px;
  background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.05));
  color: inherit;
  white-space: pre;
}
.yfas-fb-debug-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.yfas-fb-issue {
  font-size: 1.3rem;
  color: var(--yt-spec-call-to-action, #065fd4);
  text-decoration: none;
}
.yfas-fb-issue:hover {
  text-decoration: underline;
}
.yfas-fb-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
`;
