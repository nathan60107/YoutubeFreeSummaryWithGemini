import type { Translations } from "./en";

/** 简体中文 (Simplified Chinese). */
export const zhCN: Translations = {
  "settings.dialogLabel": "YFAS 设置",
  "settings.title": "YouTube 摘要设置",
  "settings.provider.label": "AI 服务",
  "settings.provider.hint": "选择摘要要发送到哪个 AI（需先登录该服务）",
  "settings.provider.recommended": "（推荐）",
  "settings.language.label": "界面语言",
  "settings.language.hint": "此脚本界面显示的语言",
  "settings.language.auto": "跟随浏览器",
  "settings.prompt.label": "提示词模板",
  "settings.prompt.hint": "可用变量：<code>{{title}}</code> 标题、<code>{{url}}</code> 链接、<code>{{transcript}}</code> 字幕",
  "settings.langs.label": "偏好字幕语言",
  "settings.langs.hint": "逗号分隔的语言代码，例如 <code>zh-TW, ja, en</code>。留空＝跟随浏览器语言",
  "settings.langs.placeholder": "留空＝自动",
  "settings.timestamps": "字幕包含时间戳（<code>[h:mm:ss]</code>）",
  "settings.autoSubmit": "注入后自动发送",
  "settings.reset": "重置为默认",
  "settings.cancel": "取消",
  "settings.save": "保存",

  "button.label": "摘要",
  "button.summarizeWith": "用 %1 摘要",
  "button.settings": "设置",
  "button.noCaptions": "这部视频没有可用的字幕，无法摘要",

  "feedback.title": "摘要失败",
  "feedback.defaultMessage": "摘要失败了。请刷新页面后再试一次。",
  "feedback.debug.lead": "这个问题似乎连续发生了。若持续无法使用，请协助反馈，让问题更快被修复：",
  "feedback.debug.step1": "点击下方“复制诊断信息”。",
  "feedback.debug.step2": "前往问题反馈页开一个新的 issue。",
  "feedback.debug.step3": "把刚刚复制的内容粘贴上去，并简述你的操作。",
  "feedback.debug.copy": "复制诊断信息",
  "feedback.debug.copied": "已复制 ✓",
  "feedback.debug.copyFailed": "复制失败，请手动选取",
  "feedback.debug.issue": "前往问题反馈页 ↗",
  "feedback.close": "关闭",

  "notice.title": "找不到字幕",

  "error.noCaptions": "找不到这部视频的字幕／翻译，无法摘要。请确认视频有字幕，刷新页面后再试一次。",
  "error.noInput": "在 %1 找不到输入框，可能是页面尚未加载完成或版面改版。请刷新页面后再试一次。",

  "provider.aistudio.note": "品质最佳：不限字数、可免费使用 Pro 模型；思考时间较长，但结果非常准确。适合长字幕。",
  "provider.gemini.note": "结果品质良好，但输入框有长度限制，较长的字幕可能无法完整粘贴。",
  "provider.chatgpt.note": "免费模型品质较弱；字幕过长时可能直接不回应。适合较短的视频。",
  "provider.claude.note": "思考时间较长，结果偶有瑕疵。",
  "provider.grok.note": "品质次于 AI Studio，结果偶有小瑕疵。",

  "dev.clearFailures": "[dev] 清除失败计数",

  "prompt.default": [
    "请依据以下 YouTube 视频字幕（含时间轴）做重点摘要，并在每个重点标注对应的时间戳。",
    "",
    "视频标题：{{title}}",
    "视频链接：{{url}}",
    "",
    "{{transcript}}",
  ].join("\n"),
};
