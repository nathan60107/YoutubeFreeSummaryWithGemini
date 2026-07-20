import type { Translations } from "./en";

/** 한국어 (Korean). */
export const ko: Translations = {
  "settings.dialogLabel": "YFAS 설정",
  "settings.title": "YouTube 요약 설정",
  "settings.provider.label": "AI 서비스",
  "settings.provider.hint": "요약을 보낼 AI를 선택하세요 (해당 서비스에 먼저 로그인해야 합니다)",
  "settings.provider.recommended": " (추천)",
  "settings.language.label": "인터페이스 언어",
  "settings.language.hint": "이 스크립트 화면을 표시할 언어",
  "settings.language.auto": "브라우저 따르기",
  "settings.prompt.label": "프롬프트 템플릿",
  "settings.prompt.hint": "사용 가능한 변수: <code>{{title}}</code> 제목, <code>{{url}}</code> 링크, <code>{{transcript}}</code> 자막",
  "settings.langs.label": "선호 자막 언어",
  "settings.langs.hint": "쉼표로 구분한 언어 코드, 예: <code>zh-TW, ja, en</code>. 비워 두면 브라우저 언어를 따릅니다",
  "settings.langs.placeholder": "비워 두면 자동",
  "settings.timestamps": "자막에 타임스탬프 포함 (<code>[h:mm:ss]</code>)",
  "settings.autoSubmit": "입력 후 자동 전송",
  "settings.reset": "기본값으로 재설정",
  "settings.cancel": "취소",
  "settings.save": "저장",

  "button.label": "요약",
  "button.summarizeWith": "%1(으)로 요약",
  "button.settings": "설정",
  "button.noCaptions": "이 동영상에는 사용할 수 있는 자막이 없어 요약할 수 없습니다",

  "feedback.title": "요약 실패",
  "feedback.defaultMessage": "요약에 실패했습니다. 페이지를 새로고침한 후 다시 시도해 주세요.",
  "feedback.debug.lead": "이 문제가 계속 발생하는 것 같습니다. 계속된다면 더 빨리 고칠 수 있도록 신고에 협조해 주세요:",
  "feedback.debug.step1": "아래의 “진단 정보 복사”를 클릭하세요.",
  "feedback.debug.step2": "이슈 트래커로 이동해 새 issue를 여세요.",
  "feedback.debug.step3": "복사한 내용을 붙여넣고 어떤 작업을 했는지 간단히 설명해 주세요.",
  "feedback.debug.copy": "진단 정보 복사",
  "feedback.debug.copied": "복사됨 ✓",
  "feedback.debug.copyFailed": "복사 실패, 직접 선택해 주세요",
  "feedback.debug.issue": "이슈 트래커로 이동 ↗",
  "feedback.close": "닫기",

  "notice.title": "자막을 찾을 수 없습니다",

  "error.noCaptions": "이 동영상의 자막/번역을 찾을 수 없어 요약할 수 없습니다. 동영상에 자막이 있는지 확인한 뒤 새로고침하고 다시 시도해 주세요.",
  "error.noInput": "%1에서 입력창을 찾지 못했습니다. 페이지 로딩이 끝나지 않았거나 레이아웃이 바뀌었을 수 있습니다. 새로고침한 후 다시 시도해 주세요.",

  "provider.aistudio.note": "최고 품질: 글자 수 제한 없이 Pro 모델을 무료로 사용할 수 있습니다. 사고 시간은 길지만 결과가 매우 정확합니다. 긴 자막에 적합합니다.",
  "provider.gemini.note": "결과 품질은 좋지만 입력창에 길이 제한이 있어 긴 자막은 전체가 붙여넣어지지 않을 수 있습니다.",
  "provider.chatgpt.note": "무료 모델은 품질이 약한 편이며 자막이 너무 길면 아예 응답하지 않을 수 있습니다. 짧은 동영상에 적합합니다.",
  "provider.claude.note": "사고 시간이 길고 결과에 가끔 사소한 결함이 있습니다.",
  "provider.grok.note": "품질은 AI Studio보다 낮고 결과에 가끔 사소한 결함이 있습니다.",

  "dev.clearFailures": "[dev] 실패 횟수 초기화",

  "prompt.default": [
    "다음 YouTube 동영상 자막(타임스탬프 포함)을 바탕으로 핵심 내용을 요약하고, 각 항목에 해당하는 타임스탬프를 표시해 주세요.",
    "",
    "제목: {{title}}",
    "URL: {{url}}",
    "",
    "{{transcript}}",
  ].join("\n"),
};
