import type { Translations } from "./en";

/** 繁體中文 (Traditional Chinese). */
export const zhTW: Translations = {
  "settings.dialogLabel": "YFAS 設定",
  "settings.title": "YouTube 摘要設定",
  "settings.provider.label": "AI 服務",
  "settings.provider.hint": "選擇摘要要送到哪個 AI（需先登入該服務）",
  "settings.provider.recommended": "（推薦）",
  "settings.language.label": "介面語言",
  "settings.language.hint": "此腳本介面顯示的語言",
  "settings.language.auto": "跟隨瀏覽器",
  "settings.prompt.label": "提示詞模板",
  "settings.prompt.hint": "可用變數：<code>{{title}}</code> 標題、<code>{{url}}</code> 連結、<code>{{transcript}}</code> 字幕",
  "settings.langs.label": "偏好字幕語言",
  "settings.langs.hint": "逗號分隔的語言代碼，例如 <code>zh-TW, ja, en</code>。留空＝跟隨瀏覽器語言",
  "settings.langs.placeholder": "留空＝自動",
  "settings.timestamps": "字幕包含時間戳（<code>[h:mm:ss]</code>）",
  "settings.autoSubmit": "注入後自動送出",
  "settings.reset": "重設為預設",
  "settings.cancel": "取消",
  "settings.save": "儲存",

  "button.label": "摘要",
  "button.summarizeWith": "用 %1 摘要",
  "button.settings": "設定",
  "button.noCaptions": "這部影片沒有可用的字幕，無法摘要",

  "feedback.title": "摘要失敗",
  "feedback.defaultMessage": "摘要失敗了。請重新整理頁面後再試一次。",
  "feedback.debug.lead": "這個問題似乎連續發生了。若持續無法使用，請協助回報，讓問題更快被修好：",
  "feedback.debug.step1": "點下方「複製診斷資訊」。",
  "feedback.debug.step2": "前往問題回報頁開一個新的 issue。",
  "feedback.debug.step3": "把剛剛複製的內容貼上，並簡述你的操作。",
  "feedback.debug.copy": "複製診斷資訊",
  "feedback.debug.copied": "已複製 ✓",
  "feedback.debug.copyFailed": "複製失敗，請手動選取",
  "feedback.debug.issue": "前往問題回報頁 ↗",
  "feedback.close": "關閉",

  "notice.title": "找不到字幕",

  "error.noCaptions": "找不到這部影片的字幕／翻譯，無法摘要。請確認影片有字幕，重新整理頁面後再試一次。",
  "error.noInput": "在 %1 找不到輸入框，可能是頁面尚未載入完成或版面改版。請重新整理頁面後再試一次。",

  "provider.aistudio.note": "品質最佳：不限字數、可免費使用 Pro 模型；思考時間較長，但結果非常準確。適合長字幕。",
  "provider.gemini.note": "結果品質良好，但輸入框有長度限制，較長的字幕可能無法完整貼入。",
  "provider.chatgpt.note": "免費模型品質較弱；字幕過長時可能直接不回應。適合較短的影片。",
  "provider.claude.note": "思考時間較長，結果偶有瑕疵。",
  "provider.grok.note": "品質次於 AI Studio，結果偶有小瑕疵。",

  "dev.clearFailures": "[dev] 清除失敗計數",

  "prompt.default": [
    "請依據以下 YouTube 影片字幕（含時間軸）做重點摘要，並在每個重點標註對應的時間戳記。",
    "",
    "影片標題：{{title}}",
    "影片連結：{{url}}",
    "",
    "{{transcript}}",
  ].join("\n"),
};
