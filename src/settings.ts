/**
 * Settings panel (modal) for the YouTube side, opened from the button's gear half.
 * Reads/writes the persisted {@linkcode config} DataStore.
 */

import { config, defaultPromptTemplate } from "./config";
import { openModal } from "./modal";
import { addStyle } from "./utils";

const overlayId = "yfswg-settings-overlay";
const styleRef = "yfswg-settings";

/** Opens the settings modal, prefilled from the current config. */
export function openSettings(): void {
  const data = config.getData();

  const handle = openModal({
    id: overlayId,
    label: "YFSWG 設定",
    innerHtml: `
      <h2 class="yfswg-modal-title">YouTube 摘要設定</h2>

      <label class="yfswg-field">
        <span class="yfswg-field-label">提示詞模板</span>
        <span class="yfswg-field-hint">可用變數：<code>{{title}}</code> 標題、<code>{{url}}</code> 連結、<code>{{transcript}}</code> 字幕</span>
        <textarea class="yfswg-input yfswg-textarea" data-field="promptTemplate" rows="8"></textarea>
      </label>

      <label class="yfswg-field">
        <span class="yfswg-field-label">偏好字幕語言</span>
        <span class="yfswg-field-hint">逗號分隔的語言代碼，例如 <code>zh-TW, ja, en</code>。留空＝跟隨瀏覽器語言</span>
        <input type="text" class="yfswg-input" data-field="preferredLangs" placeholder="留空＝自動" />
      </label>

      <label class="yfswg-check">
        <input type="checkbox" data-field="includeTimestamps" />
        <span>字幕包含時間戳（<code>[h:mm:ss]</code>）</span>
      </label>

      <label class="yfswg-check">
        <input type="checkbox" data-field="autoSubmit" />
        <span>注入後自動於 AI Studio 送出</span>
      </label>

      <div class="yfswg-actions">
        <button type="button" class="yfswg-modal-btn yfswg-modal-btn--secondary" data-action="reset">重設為預設</button>
        <span class="yfswg-spacer"></span>
        <button type="button" class="yfswg-modal-btn yfswg-modal-btn--secondary" data-action="cancel">取消</button>
        <button type="button" class="yfswg-modal-btn yfswg-modal-btn--primary" data-action="save">儲存</button>
      </div>`,
  });
  if(!handle)
    return; // already open

  if(!document.getElementById(`global-style-${styleRef}`))
    addStyle(settingsStyle, styleRef);

  const { overlay, close } = handle;
  const promptEl = overlay.querySelector<HTMLTextAreaElement>("[data-field='promptTemplate']")!;
  const langEl = overlay.querySelector<HTMLInputElement>("[data-field='preferredLangs']")!;
  const tsEl = overlay.querySelector<HTMLInputElement>("[data-field='includeTimestamps']")!;
  const autoEl = overlay.querySelector<HTMLInputElement>("[data-field='autoSubmit']")!;

  // Prefill from config.
  promptEl.value = data.promptTemplate;
  langEl.value = data.preferredLangs;
  tsEl.checked = data.includeTimestamps;
  autoEl.checked = data.autoSubmit;

  overlay.querySelector("[data-action='cancel']")!.addEventListener("click", close);

  overlay.querySelector("[data-action='reset']")!.addEventListener("click", () => {
    promptEl.value = defaultPromptTemplate;
    langEl.value = "";
    tsEl.checked = true;
    autoEl.checked = true;
  });

  overlay.querySelector("[data-action='save']")!.addEventListener("click", () => {
    void config.setData({
      promptTemplate: promptEl.value,
      preferredLangs: langEl.value.trim(),
      includeTimestamps: tsEl.checked,
      autoSubmit: autoEl.checked,
    });
    close();
  });

  promptEl.focus();
}

const settingsStyle = `
.yfswg-field {
  display: block;
  margin-bottom: 16px;
}
.yfswg-field-label {
  display: block;
  font-size: 1.4rem;
  font-weight: 500;
  margin-bottom: 4px;
}
.yfswg-field-hint {
  display: block;
  font-size: 1.2rem;
  opacity: 0.7;
  margin-bottom: 6px;
}
.yfswg-field-hint code,
.yfswg-check code {
  font-family: monospace;
  background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.08));
  padding: 1px 4px;
  border-radius: 4px;
}
.yfswg-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  font-size: 1.4rem;
  font-family: inherit;
  border: 1px solid var(--yt-spec-10-percent-layer, rgba(0, 0, 0, 0.2));
  border-radius: 8px;
  background: var(--yt-spec-base-background, #fff);
  color: inherit;
}
.yfswg-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: monospace;
  line-height: 1.4;
}
.yfswg-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.4rem;
  margin-bottom: 12px;
  cursor: pointer;
}
.yfswg-check input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.yfswg-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}
.yfswg-spacer {
  flex: 1;
}
`;
