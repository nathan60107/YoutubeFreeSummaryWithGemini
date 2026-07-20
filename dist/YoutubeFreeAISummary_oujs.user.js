// ==UserScript==
// @name              YoutubeFreeAISummary
// @name:zh-TW         YouTube 免費 AI 摘要
// @name:zh-CN         YouTube 免费 AI 摘要
// @name:ja            YouTube 無料 AI 要約
// @name:ko            YouTube 무료 AI 요약
// @name:es            Resumen de YouTube con IA gratis
// @name:fr            Résumé YouTube par IA gratuit
// @name:de            YouTube-KI-Zusammenfassung (kostenlos)
// @name:pt-BR         Resumo de YouTube com IA grátis
// @name:ru            Бесплатное AI-резюме YouTube
// @namespace         https://github.com/nathan60107/YoutubeFreeAISummary
// @version           0.8.2
// @description       Capture a YouTube video's on-page subtitles and send them straight to your chosen AI (AI Studio, Gemini, ChatGPT, Claude, or Grok) for a free summary
// @description:zh-TW  擷取 YouTube 影片頁面上的字幕，直接送到你選擇的 AI（AI Studio、Gemini、ChatGPT、Claude 或 Grok）做免費摘要
// @description:zh-CN  抓取 YouTube 视频页面上的字幕，直接发送到你选择的 AI（AI Studio、Gemini、ChatGPT、Claude 或 Grok）做免费摘要
// @description:ja     YouTube 動画ページの字幕を取得し、選んだ AI（AI Studio、Gemini、ChatGPT、Claude、Grok）にそのまま送って無料で要約します
// @description:ko     YouTube 동영상 페이지의 자막을 가져와 선택한 AI(AI Studio, Gemini, ChatGPT, Claude, Grok)로 바로 보내 무료로 요약합니다
// @description:es     Captura los subtítulos de la página de un vídeo de YouTube y los envía directamente a la IA que elijas (AI Studio, Gemini, ChatGPT, Claude o Grok) para un resumen gratis
// @description:fr     Récupère les sous-titres affichés sur la page d'une vidéo YouTube et les envoie directement à l'IA de votre choix (AI Studio, Gemini, ChatGPT, Claude ou Grok) pour un résumé gratuit
// @description:de     Erfasst die Untertitel auf der Seite eines YouTube-Videos und sendet sie direkt an die KI deiner Wahl (AI Studio, Gemini, ChatGPT, Claude oder Grok) für eine kostenlose Zusammenfassung
// @description:pt-BR  Captura as legendas na página de um vídeo do YouTube e as envia direto para a IA que você escolher (AI Studio, Gemini, ChatGPT, Claude ou Grok) para um resumo grátis
// @description:ru     Захватывает субтитры со страницы видео на YouTube и отправляет их напрямую выбранному ИИ (AI Studio, Gemini, ChatGPT, Claude или Grok) для бесплатного резюме
// @homepageURL       https://github.com/nathan60107/YoutubeFreeAISummary#readme
// @supportURL        https://github.com/nathan60107/YoutubeFreeAISummary/issues
// @license           MIT
// @author            nathan60107
// @copyright         nathan60107 (https://github.com/nathan60107)
// @icon              https://raw.githubusercontent.com/nathan60107/YoutubeFreeAISummary/main/assets/icon.svg?b=75a7c0f
// @match             *://*.youtube.com/*
// @match             *://aistudio.google.com/*
// @match             *://gemini.google.com/*
// @match             *://chatgpt.com/*
// @match             *://chat.openai.com/*
// @match             *://claude.ai/*
// @match             *://grok.com/*
// @run-at            document-start
// @downloadURL       https://openuserjs.org/install/nathan60107/YoutubeFreeAISummary
// @updateURL         https://openuserjs.org/install/nathan60107/YoutubeFreeAISummary
// @connect           github.com
// @connect           raw.githubusercontent.com
// @grant             GM.getValue
// @grant             GM.setValue
// @grant             GM.deleteValue
// @grant             GM.getResourceUrl
// @grant             GM.xmlHttpRequest
// @grant             GM.openInTab
// @grant             unsafeWindow
// @noframes
// @resource          img-icon https://raw.githubusercontent.com/nathan60107/YoutubeFreeAISummary/main/assets/icon.svg?b=75a7c0f
// @require           https://cdn.jsdelivr.net/npm/@sv443-network/userutils@6.3.0/dist/index.global.js
// ==/UserScript==

(function (userutils) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    const modeRaw = "production";
    const hostRaw = "openuserjs";
    const buildNumberRaw = "75a7c0f";
    /** The mode in which the script was built (production or development) */
    const mode = (modeRaw.match(/^#{{.+}}$/) ? "production" : modeRaw);
    /** Path to the GitHub repo in the format "User/Repo" */
    const repo = "nathan60107/YoutubeFreeAISummary";
    /** Which host the userscript was installed from */
    const host = (hostRaw.match(/^#{{.+}}$/) ? "github" : hostRaw);
    /** The build number of the userscript */
    const buildNumber = (buildNumberRaw.match(/^#{{.+}}$/) ? "BUILD_ERROR!" : buildNumberRaw); // asserted as generic string instead of literal
    /** Names of platforms by value of {@linkcode host} */
    const platformNames = {
        github: "GitHub",
        greasyfork: "GreasyFork",
        openuserjs: "OpenUserJS",
    };
    /** Default compression format used throughout the entire script */
    const compressionFormat = "deflate-raw";
    /** Whether sessionStorage is available and working */
    typeof (sessionStorage === null || sessionStorage === void 0 ? void 0 : sessionStorage.setItem) !== "undefined"
        && (() => {
            try {
                const key = `_ses_test_${userutils.randomId(4)}`;
                sessionStorage.setItem(key, "test");
                sessionStorage.removeItem(key);
                return true;
            }
            catch (_a) {
                return false;
            }
        })();
    /** Info about the userscript, parsed from the userscript header (tools/post-build.js) */
    const scriptInfo = {
        name: GM.info.script.name,
        version: GM.info.script.version,
        namespace: GM.info.script.namespace,
    };

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
    const en = {
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
    };

    /** 繁體中文 (Traditional Chinese). */
    const zhTW = {
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

    /** 简体中文 (Simplified Chinese). */
    const zhCN = {
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

    /** 日本語 (Japanese). */
    const ja = {
        "settings.dialogLabel": "YFAS 設定",
        "settings.title": "YouTube 要約の設定",
        "settings.provider.label": "AI サービス",
        "settings.provider.hint": "要約を送る AI を選択します（事前にそのサービスへのログインが必要です）",
        "settings.provider.recommended": "（推奨）",
        "settings.language.label": "表示言語",
        "settings.language.hint": "このスクリプトの画面を表示する言語",
        "settings.language.auto": "ブラウザに従う",
        "settings.prompt.label": "プロンプトのテンプレート",
        "settings.prompt.hint": "使用できる変数：<code>{{title}}</code> タイトル、<code>{{url}}</code> リンク、<code>{{transcript}}</code> 字幕",
        "settings.langs.label": "優先する字幕の言語",
        "settings.langs.hint": "カンマ区切りの言語コード（例：<code>zh-TW, ja, en</code>）。空欄＝ブラウザの言語に従う",
        "settings.langs.placeholder": "空欄＝自動",
        "settings.timestamps": "字幕にタイムスタンプを含める（<code>[h:mm:ss]</code>）",
        "settings.autoSubmit": "入力後に自動送信する",
        "settings.reset": "初期設定に戻す",
        "settings.cancel": "キャンセル",
        "settings.save": "保存",
        "button.label": "要約",
        "button.summarizeWith": "%1 で要約",
        "button.settings": "設定",
        "button.noCaptions": "この動画には利用できる字幕がないため、要約できません",
        "feedback.title": "要約に失敗しました",
        "feedback.defaultMessage": "要約に失敗しました。ページを再読み込みしてもう一度お試しください。",
        "feedback.debug.lead": "この問題が繰り返し発生しているようです。解決しない場合は、より早く修正できるよう報告にご協力ください：",
        "feedback.debug.step1": "下の「診断情報をコピー」をクリックします。",
        "feedback.debug.step2": "問題報告ページで新しい issue を作成します。",
        "feedback.debug.step3": "コピーした内容を貼り付け、操作内容を簡単に説明してください。",
        "feedback.debug.copy": "診断情報をコピー",
        "feedback.debug.copied": "コピーしました ✓",
        "feedback.debug.copyFailed": "コピーに失敗しました。手動で選択してください",
        "feedback.debug.issue": "問題報告ページへ ↗",
        "feedback.close": "閉じる",
        "notice.title": "字幕が見つかりません",
        "error.noCaptions": "この動画の字幕／翻訳が見つからないため、要約できません。動画に字幕があることを確認し、ページを再読み込みしてからもう一度お試しください。",
        "error.noInput": "%1 で入力欄が見つかりませんでした。ページの読み込みが完了していないか、レイアウトが変更された可能性があります。ページを再読み込みしてもう一度お試しください。",
        "provider.aistudio.note": "最高品質：文字数制限なし、Pro モデルを無料で利用可能。思考時間は長めですが、結果は非常に正確です。長い字幕に最適。",
        "provider.gemini.note": "結果の品質は良好ですが、入力欄に文字数制限があり、長い字幕は全文を貼り付けられない場合があります。",
        "provider.chatgpt.note": "無料モデルは品質がやや低く、字幕が長すぎると応答しないことがあります。短い動画に最適。",
        "provider.claude.note": "思考時間が長めで、結果にまれに不備があります。",
        "provider.grok.note": "品質は AI Studio に次ぎ、結果にまれに小さな不備があります。",
        "dev.clearFailures": "[dev] 失敗カウントをクリア",
        "prompt.default": [
            "以下の YouTube 動画の字幕（タイムスタンプ付き）をもとに要点を要約し、各要点に対応するタイムスタンプを付記してください。",
            "",
            "タイトル：{{title}}",
            "URL：{{url}}",
            "",
            "{{transcript}}",
        ].join("\n"),
    };

    /** 한국어 (Korean). */
    const ko = {
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

    /** Español (Spanish). */
    const es = {
        "settings.dialogLabel": "Ajustes de YFAS",
        "settings.title": "Ajustes del resumen de YouTube",
        "settings.provider.label": "Servicio de IA",
        "settings.provider.hint": "Elige a qué IA se envía el resumen (primero debes haber iniciado sesión en ella)",
        "settings.provider.recommended": " (recomendado)",
        "settings.language.label": "Idioma de la interfaz",
        "settings.language.hint": "Idioma en el que se muestra la interfaz de este script",
        "settings.language.auto": "Seguir el navegador",
        "settings.prompt.label": "Plantilla del prompt",
        "settings.prompt.hint": "Variables: <code>{{title}}</code> título, <code>{{url}}</code> enlace, <code>{{transcript}}</code> subtítulos",
        "settings.langs.label": "Idiomas de subtítulos preferidos",
        "settings.langs.hint": "Códigos de idioma separados por comas, p. ej. <code>zh-TW, ja, en</code>. Vacío = seguir el idioma del navegador",
        "settings.langs.placeholder": "Vacío = automático",
        "settings.timestamps": "Incluir marcas de tiempo en los subtítulos (<code>[h:mm:ss]</code>)",
        "settings.autoSubmit": "Enviar automáticamente tras insertar",
        "settings.reset": "Restablecer valores predeterminados",
        "settings.cancel": "Cancelar",
        "settings.save": "Guardar",
        "button.label": "Resumir",
        "button.summarizeWith": "Resumir con %1",
        "button.settings": "Ajustes",
        "button.noCaptions": "Este vídeo no tiene subtítulos disponibles, así que no se puede resumir",
        "feedback.title": "El resumen falló",
        "feedback.defaultMessage": "El resumen falló. Actualiza la página e inténtalo de nuevo.",
        "feedback.debug.lead": "Este problema parece repetirse. Si continúa, ayúdanos a informarlo para que se pueda solucionar más rápido:",
        "feedback.debug.step1": "Haz clic en «Copiar diagnóstico» abajo.",
        "feedback.debug.step2": "Ve al gestor de incidencias y abre una nueva.",
        "feedback.debug.step3": "Pega lo que copiaste y describe brevemente lo que hiciste.",
        "feedback.debug.copy": "Copiar diagnóstico",
        "feedback.debug.copied": "Copiado ✓",
        "feedback.debug.copyFailed": "Error al copiar, selecciónalo manualmente",
        "feedback.debug.issue": "Ir al gestor de incidencias ↗",
        "feedback.close": "Cerrar",
        "notice.title": "No se encontraron subtítulos",
        "error.noCaptions": "No se encontraron subtítulos ni traducciones para este vídeo, así que no se puede resumir. Asegúrate de que el vídeo tenga subtítulos, actualiza la página e inténtalo de nuevo.",
        "error.noInput": "No se encontró el cuadro de texto en %1. Puede que la página no haya terminado de cargar o que su diseño haya cambiado. Actualiza la página e inténtalo de nuevo.",
        "provider.aistudio.note": "La mejor calidad: sin límite de longitud y acceso gratuito a modelos Pro; el tiempo de razonamiento es más largo, pero los resultados son muy precisos. Ideal para subtítulos largos.",
        "provider.gemini.note": "Buenos resultados, pero el cuadro de texto tiene un límite de longitud; los subtítulos largos podrían no pegarse por completo.",
        "provider.chatgpt.note": "El modelo gratuito es más débil; puede no responder cuando los subtítulos son demasiado largos. Mejor para vídeos cortos.",
        "provider.claude.note": "Tiempo de razonamiento más largo; los resultados a veces tienen pequeños defectos.",
        "provider.grok.note": "Calidad inferior a AI Studio; los resultados a veces tienen pequeños defectos.",
        "dev.clearFailures": "[dev] Borrar el contador de fallos",
        "prompt.default": [
            "Resume los puntos clave de los siguientes subtítulos de un vídeo de YouTube (con marcas de tiempo), e indica la marca de tiempo correspondiente a cada punto.",
            "",
            "Título: {{title}}",
            "URL: {{url}}",
            "",
            "{{transcript}}",
        ].join("\n"),
    };

    /** Français (French). */
    const fr = {
        "settings.dialogLabel": "Paramètres YFAS",
        "settings.title": "Paramètres du résumé YouTube",
        "settings.provider.label": "Service d’IA",
        "settings.provider.hint": "Choisissez à quelle IA le résumé est envoyé (vous devez d’abord y être connecté)",
        "settings.provider.recommended": " (recommandé)",
        "settings.language.label": "Langue de l’interface",
        "settings.language.hint": "Langue d’affichage de l’interface de ce script",
        "settings.language.auto": "Suivre le navigateur",
        "settings.prompt.label": "Modèle de prompt",
        "settings.prompt.hint": "Variables : <code>{{title}}</code> titre, <code>{{url}}</code> lien, <code>{{transcript}}</code> sous-titres",
        "settings.langs.label": "Langues de sous-titres préférées",
        "settings.langs.hint": "Codes de langue séparés par des virgules, p. ex. <code>zh-TW, ja, en</code>. Vide = suivre la langue du navigateur",
        "settings.langs.placeholder": "Vide = automatique",
        "settings.timestamps": "Inclure les horodatages dans les sous-titres (<code>[h:mm:ss]</code>)",
        "settings.autoSubmit": "Envoyer automatiquement après insertion",
        "settings.reset": "Réinitialiser aux valeurs par défaut",
        "settings.cancel": "Annuler",
        "settings.save": "Enregistrer",
        "button.label": "Résumer",
        "button.summarizeWith": "Résumer avec %1",
        "button.settings": "Paramètres",
        "button.noCaptions": "Cette vidéo n’a aucun sous-titre disponible, elle ne peut donc pas être résumée",
        "feedback.title": "Échec du résumé",
        "feedback.defaultMessage": "Le résumé a échoué. Veuillez actualiser la page et réessayer.",
        "feedback.debug.lead": "Ce problème semble se répéter. S’il persiste, aidez-nous à le signaler pour qu’il soit corrigé plus vite :",
        "feedback.debug.step1": "Cliquez sur « Copier le diagnostic » ci-dessous.",
        "feedback.debug.step2": "Rendez-vous sur le suivi des problèmes et ouvrez un nouveau ticket.",
        "feedback.debug.step3": "Collez ce que vous avez copié et décrivez brièvement ce que vous avez fait.",
        "feedback.debug.copy": "Copier le diagnostic",
        "feedback.debug.copied": "Copié ✓",
        "feedback.debug.copyFailed": "Échec de la copie, sélectionnez manuellement",
        "feedback.debug.issue": "Aller au suivi des problèmes ↗",
        "feedback.close": "Fermer",
        "notice.title": "Aucun sous-titre trouvé",
        "error.noCaptions": "Aucun sous-titre ni traduction n’a été trouvé pour cette vidéo, elle ne peut donc pas être résumée. Assurez-vous que la vidéo a des sous-titres, puis actualisez et réessayez.",
        "error.noInput": "Impossible de trouver le champ de saisie sur %1 — la page n’a peut-être pas fini de charger, ou sa mise en page a changé. Veuillez actualiser et réessayer.",
        "provider.aistudio.note": "Meilleure qualité : aucune limite de longueur et accès gratuit aux modèles Pro ; temps de réflexion plus long, mais résultats très précis. Idéal pour les longs sous-titres.",
        "provider.gemini.note": "Bons résultats, mais le champ de saisie a une limite de longueur ; les longs sous-titres risquent de ne pas être collés en entier.",
        "provider.chatgpt.note": "Modèle gratuit plus faible ; il peut ne pas répondre du tout quand les sous-titres sont trop longs. Idéal pour les vidéos courtes.",
        "provider.claude.note": "Temps de réflexion plus long ; les résultats présentent parfois de petits défauts.",
        "provider.grok.note": "Qualité inférieure à AI Studio ; les résultats présentent parfois de petits défauts.",
        "dev.clearFailures": "[dev] Réinitialiser le compteur d’échecs",
        "prompt.default": [
            "Résume les points clés des sous-titres suivants d’une vidéo YouTube (avec horodatage), et indique l’horodatage correspondant à chaque point.",
            "",
            "Titre : {{title}}",
            "URL : {{url}}",
            "",
            "{{transcript}}",
        ].join("\n"),
    };

    /** Deutsch (German). */
    const de = {
        "settings.dialogLabel": "YFAS-Einstellungen",
        "settings.title": "Einstellungen der YouTube-Zusammenfassung",
        "settings.provider.label": "KI-Dienst",
        "settings.provider.hint": "Wähle, an welche KI die Zusammenfassung gesendet wird (du musst dort zuerst angemeldet sein)",
        "settings.provider.recommended": " (empfohlen)",
        "settings.language.label": "Oberflächensprache",
        "settings.language.hint": "Sprache, in der die Oberfläche dieses Skripts angezeigt wird",
        "settings.language.auto": "Browser folgen",
        "settings.prompt.label": "Prompt-Vorlage",
        "settings.prompt.hint": "Variablen: <code>{{title}}</code> Titel, <code>{{url}}</code> Link, <code>{{transcript}}</code> Untertitel",
        "settings.langs.label": "Bevorzugte Untertitelsprachen",
        "settings.langs.hint": "Kommagetrennte Sprachcodes, z. B. <code>zh-TW, ja, en</code>. Leer = der Browsersprache folgen",
        "settings.langs.placeholder": "Leer = automatisch",
        "settings.timestamps": "Zeitstempel in Untertiteln einschließen (<code>[h:mm:ss]</code>)",
        "settings.autoSubmit": "Nach dem Einfügen automatisch absenden",
        "settings.reset": "Auf Standard zurücksetzen",
        "settings.cancel": "Abbrechen",
        "settings.save": "Speichern",
        "button.label": "Zusammenfassen",
        "button.summarizeWith": "Mit %1 zusammenfassen",
        "button.settings": "Einstellungen",
        "button.noCaptions": "Dieses Video hat keine verfügbaren Untertitel und kann daher nicht zusammengefasst werden",
        "feedback.title": "Zusammenfassung fehlgeschlagen",
        "feedback.defaultMessage": "Die Zusammenfassung ist fehlgeschlagen. Bitte lade die Seite neu und versuche es erneut.",
        "feedback.debug.lead": "Dieses Problem scheint wiederholt aufzutreten. Falls es weiterhin besteht, hilf bitte mit, es zu melden, damit es schneller behoben werden kann:",
        "feedback.debug.step1": "Klicke unten auf „Diagnose kopieren“.",
        "feedback.debug.step2": "Gehe zum Issue-Tracker und öffne ein neues Issue.",
        "feedback.debug.step3": "Füge das Kopierte ein und beschreibe kurz, was du getan hast.",
        "feedback.debug.copy": "Diagnose kopieren",
        "feedback.debug.copied": "Kopiert ✓",
        "feedback.debug.copyFailed": "Kopieren fehlgeschlagen, bitte manuell auswählen",
        "feedback.debug.issue": "Zum Issue-Tracker ↗",
        "feedback.close": "Schließen",
        "notice.title": "Keine Untertitel gefunden",
        "error.noCaptions": "Für dieses Video wurden keine Untertitel/Übersetzungen gefunden, daher kann es nicht zusammengefasst werden. Stelle sicher, dass das Video Untertitel hat, lade die Seite neu und versuche es erneut.",
        "error.noInput": "Das Eingabefeld auf %1 wurde nicht gefunden – die Seite ist möglicherweise noch nicht fertig geladen oder ihr Layout hat sich geändert. Bitte lade die Seite neu und versuche es erneut.",
        "provider.aistudio.note": "Beste Qualität: keine Längenbegrenzung und kostenloser Zugriff auf Pro-Modelle; längere Denkzeit, aber sehr genaue Ergebnisse. Ideal für lange Untertitel.",
        "provider.gemini.note": "Gute Ergebnisse, aber das Eingabefeld hat eine Längenbegrenzung; längere Untertitel lassen sich womöglich nicht vollständig einfügen.",
        "provider.chatgpt.note": "Schwächeres kostenloses Modell; antwortet bei zu langen Untertiteln möglicherweise gar nicht. Am besten für kürzere Videos.",
        "provider.claude.note": "Längere Denkzeit; die Ergebnisse haben gelegentlich kleine Mängel.",
        "provider.grok.note": "Qualität unter AI Studio; die Ergebnisse haben gelegentlich kleine Mängel.",
        "dev.clearFailures": "[dev] Fehlerzähler zurücksetzen",
        "prompt.default": [
            "Fasse die wichtigsten Punkte der folgenden Untertitel eines YouTube-Videos (mit Zeitstempeln) zusammen und gib zu jedem Punkt den entsprechenden Zeitstempel an.",
            "",
            "Titel: {{title}}",
            "URL: {{url}}",
            "",
            "{{transcript}}",
        ].join("\n"),
    };

    /** Português (Brasil) — Brazilian Portuguese. */
    const ptBR = {
        "settings.dialogLabel": "Configurações do YFAS",
        "settings.title": "Configurações do resumo do YouTube",
        "settings.provider.label": "Serviço de IA",
        "settings.provider.hint": "Escolha para qual IA o resumo é enviado (você precisa estar conectado a ela primeiro)",
        "settings.provider.recommended": " (recomendado)",
        "settings.language.label": "Idioma da interface",
        "settings.language.hint": "Idioma em que a interface deste script é exibida",
        "settings.language.auto": "Seguir o navegador",
        "settings.prompt.label": "Modelo de prompt",
        "settings.prompt.hint": "Variáveis: <code>{{title}}</code> título, <code>{{url}}</code> link, <code>{{transcript}}</code> legendas",
        "settings.langs.label": "Idiomas de legenda preferidos",
        "settings.langs.hint": "Códigos de idioma separados por vírgula, ex.: <code>zh-TW, ja, en</code>. Vazio = seguir o idioma do navegador",
        "settings.langs.placeholder": "Vazio = automático",
        "settings.timestamps": "Incluir marcações de tempo nas legendas (<code>[h:mm:ss]</code>)",
        "settings.autoSubmit": "Enviar automaticamente após inserir",
        "settings.reset": "Restaurar padrões",
        "settings.cancel": "Cancelar",
        "settings.save": "Salvar",
        "button.label": "Resumir",
        "button.summarizeWith": "Resumir com %1",
        "button.settings": "Configurações",
        "button.noCaptions": "Este vídeo não tem legendas disponíveis, então não é possível resumi-lo",
        "feedback.title": "Falha no resumo",
        "feedback.defaultMessage": "O resumo falhou. Atualize a página e tente novamente.",
        "feedback.debug.lead": "Esse problema parece estar se repetindo. Se continuar, ajude a relatá-lo para que possa ser corrigido mais rápido:",
        "feedback.debug.step1": "Clique em “Copiar diagnóstico” abaixo.",
        "feedback.debug.step2": "Vá ao rastreador de problemas e abra uma nova issue.",
        "feedback.debug.step3": "Cole o que você copiou e descreva brevemente o que fez.",
        "feedback.debug.copy": "Copiar diagnóstico",
        "feedback.debug.copied": "Copiado ✓",
        "feedback.debug.copyFailed": "Falha ao copiar, selecione manualmente",
        "feedback.debug.issue": "Ir ao rastreador de problemas ↗",
        "feedback.close": "Fechar",
        "notice.title": "Nenhuma legenda encontrada",
        "error.noCaptions": "Não foram encontradas legendas/traduções para este vídeo, então não é possível resumi-lo. Verifique se o vídeo tem legendas, atualize a página e tente novamente.",
        "error.noInput": "Não foi possível encontrar o campo de entrada em %1 — a página pode não ter terminado de carregar, ou seu layout mudou. Atualize a página e tente novamente.",
        "provider.aistudio.note": "Melhor qualidade: sem limite de tamanho e acesso gratuito a modelos Pro; tempo de raciocínio maior, mas resultados muito precisos. Ótimo para legendas longas.",
        "provider.gemini.note": "Bons resultados, mas o campo de entrada tem limite de tamanho; legendas longas podem não ser coladas por completo.",
        "provider.chatgpt.note": "Modelo gratuito mais fraco; pode não responder quando as legendas são muito longas. Melhor para vídeos curtos.",
        "provider.claude.note": "Tempo de raciocínio maior; os resultados ocasionalmente têm pequenas falhas.",
        "provider.grok.note": "Qualidade abaixo do AI Studio; os resultados ocasionalmente têm pequenas falhas.",
        "dev.clearFailures": "[dev] Limpar contagem de falhas",
        "prompt.default": [
            "Resuma os pontos principais das seguintes legendas de um vídeo do YouTube (com marcações de tempo) e indique a marcação de tempo correspondente a cada ponto.",
            "",
            "Título: {{title}}",
            "URL: {{url}}",
            "",
            "{{transcript}}",
        ].join("\n"),
    };

    /** Русский (Russian). */
    const ru = {
        "settings.dialogLabel": "Настройки YFAS",
        "settings.title": "Настройки резюме YouTube",
        "settings.provider.label": "Сервис ИИ",
        "settings.provider.hint": "Выберите, какому ИИ отправлять резюме (сначала нужно войти в этот сервис)",
        "settings.provider.recommended": " (рекомендуется)",
        "settings.language.label": "Язык интерфейса",
        "settings.language.hint": "Язык, на котором отображается интерфейс этого скрипта",
        "settings.language.auto": "Как в браузере",
        "settings.prompt.label": "Шаблон запроса",
        "settings.prompt.hint": "Переменные: <code>{{title}}</code> заголовок, <code>{{url}}</code> ссылка, <code>{{transcript}}</code> субтитры",
        "settings.langs.label": "Предпочитаемые языки субтитров",
        "settings.langs.hint": "Коды языков через запятую, например <code>zh-TW, ja, en</code>. Пусто = следовать языку браузера",
        "settings.langs.placeholder": "Пусто = автоматически",
        "settings.timestamps": "Включать тайм-коды в субтитры (<code>[h:mm:ss]</code>)",
        "settings.autoSubmit": "Автоматически отправлять после вставки",
        "settings.reset": "Сбросить к настройкам по умолчанию",
        "settings.cancel": "Отмена",
        "settings.save": "Сохранить",
        "button.label": "Резюме",
        "button.summarizeWith": "Резюмировать через %1",
        "button.settings": "Настройки",
        "button.noCaptions": "У этого видео нет доступных субтитров, поэтому его нельзя резюмировать",
        "feedback.title": "Не удалось создать резюме",
        "feedback.defaultMessage": "Не удалось создать резюме. Обновите страницу и попробуйте снова.",
        "feedback.debug.lead": "Похоже, эта проблема повторяется. Если она не исчезает, помогите сообщить о ней, чтобы её быстрее исправили:",
        "feedback.debug.step1": "Нажмите «Копировать диагностику» ниже.",
        "feedback.debug.step2": "Перейдите в трекер задач и откройте новый issue.",
        "feedback.debug.step3": "Вставьте скопированное и кратко опишите свои действия.",
        "feedback.debug.copy": "Копировать диагностику",
        "feedback.debug.copied": "Скопировано ✓",
        "feedback.debug.copyFailed": "Не удалось скопировать, выделите вручную",
        "feedback.debug.issue": "Перейти в трекер задач ↗",
        "feedback.close": "Закрыть",
        "notice.title": "Субтитры не найдены",
        "error.noCaptions": "Для этого видео не найдены субтитры или перевод, поэтому его нельзя резюмировать. Убедитесь, что у видео есть субтитры, обновите страницу и попробуйте снова.",
        "error.noInput": "Не удалось найти поле ввода на %1 — возможно, страница не догрузилась или её вёрстка изменилась. Обновите страницу и попробуйте снова.",
        "provider.aistudio.note": "Лучшее качество: без ограничения длины и бесплатный доступ к моделям Pro; время обдумывания дольше, но результаты очень точные. Отлично подходит для длинных субтитров.",
        "provider.gemini.note": "Хорошие результаты, но у поля ввода есть ограничение длины; длинные субтитры могут вставиться не полностью.",
        "provider.chatgpt.note": "Бесплатная модель слабее; при слишком длинных субтитрах может вообще не ответить. Лучше для коротких видео.",
        "provider.claude.note": "Время обдумывания дольше; в результатах изредка встречаются мелкие недочёты.",
        "provider.grok.note": "Качество ниже, чем у AI Studio; в результатах изредка встречаются мелкие недочёты.",
        "dev.clearFailures": "[dev] Сбросить счётчик ошибок",
        "prompt.default": [
            "Кратко изложи ключевые моменты по следующим субтитрам видео с YouTube (с тайм-кодами) и укажи соответствующий тайм-код для каждого пункта.",
            "",
            "Заголовок: {{title}}",
            "Ссылка: {{url}}",
            "",
            "{{transcript}}",
        ].join("\n"),
    };

    /**
     * Tiny i18n engine for the userscript.
     *
     * Strings live in per-locale dictionaries under `./locales`. English (`en`) is the reference: it
     * defines every {@linkcode TranslationKey} and is the runtime fallback when the active locale is
     * missing a key. The active locale is resolved once at startup ({@linkcode initI18n}) from the user's
     * saved `config.language` (or, when that is `"auto"`, from the browser's languages).
     *
     * Rendering helpers:
     * - {@linkcode t} — translate a key in the active locale (used everywhere outside the settings modal).
     * - {@linkcode translate} — translate a key in an *explicit* locale, so the settings modal can preview
     *   another language without committing to it until the user saves.
     * - {@linkcode applyI18n} — fills every `[data-i18n*]` element under a root, so modal markup can be
     *   built once with attributes and (re-)localized in one call when the previewed language changes.
     */
    /** The special config value meaning "pick the locale from the browser". */
    const AUTO_LANG = "auto";
    /** All locale dictionaries, keyed by code. `en` doubles as the fallback. */
    const dictionaries = {
        "en": en,
        "zh-TW": zhTW,
        "zh-CN": zhCN,
        "ja": ja,
        "ko": ko,
        "es": es,
        "fr": fr,
        "de": de,
        "pt-BR": ptBR,
        "ru": ru,
    };
    /**
     * Locales offered in the settings dropdown, in display order, each labelled with its own endonym so a
     * user can recognise their language regardless of the current interface language.
     */
    const supportedLanguages = [
        { code: "en", label: "English" },
        { code: "zh-TW", label: "繁體中文" },
        { code: "zh-CN", label: "简体中文" },
        { code: "ja", label: "日本語" },
        { code: "ko", label: "한국어" },
        { code: "es", label: "Español" },
        { code: "fr", label: "Français" },
        { code: "de", label: "Deutsch" },
        { code: "pt-BR", label: "Português (BR)" },
        { code: "ru", label: "Русский" },
    ];
    const langCodes = supportedLanguages.map(l => l.code);
    /** Active locale, resolved by {@linkcode initI18n}. Defaults to English until then. */
    let activeLang = "en";
    /**
     * Resolves a stored config language (`"auto"` or a specific code) to a concrete locale, matching the
     * browser's preferred languages when set to auto. Falls back to English if nothing matches.
     */
    function resolveLanguage(configured) {
        if (configured !== AUTO_LANG && langCodes.includes(configured))
            return configured;
        return matchBrowserLanguage();
    }
    /** Picks the best-supported locale from the browser's language preferences. */
    function matchBrowserLanguage() {
        const prefs = Array.isArray(navigator.languages) && navigator.languages.length > 0
            ? navigator.languages
            : [navigator.language];
        for (const raw of prefs) {
            const tag = raw === null || raw === void 0 ? void 0 : raw.trim();
            if (!tag)
                continue;
            // Exact code match (case-insensitively), e.g. "pt-BR".
            const exact = langCodes.find(c => c.toLowerCase() === tag.toLowerCase());
            if (exact)
                return exact;
            // Chinese needs script/region disambiguation: Traditional (TW/HK/MO/Hant) vs. Simplified.
            const lower = tag.toLowerCase();
            if (lower.startsWith("zh"))
                return /(^|-)(hant|tw|hk|mo)(-|$)/.test(lower) ? "zh-TW" : "zh-CN";
            // Otherwise match on the primary subtag, e.g. "en-GB" -> "en", "pt-PT" -> "pt-BR".
            const base = lower.split("-")[0];
            const byBase = langCodes.find(c => c.split("-")[0] === base);
            if (byBase)
                return byBase;
        }
        return "en";
    }
    /** Sets the active locale used by {@linkcode t} and the default of {@linkcode applyI18n}. */
    function setActiveLanguage(lang) {
        activeLang = lang;
    }
    /** The currently active locale. */
    function getActiveLanguage() {
        return activeLang;
    }
    /**
     * Resolves the active locale from the given stored config value and applies it. Call once after the
     * config DataStore has loaded, on every page the script runs on.
     */
    function initI18n(configuredLanguage) {
        setActiveLanguage(resolveLanguage(configuredLanguage));
    }
    /** Replaces `%1`, `%2`, … placeholders with the positional args (1-indexed). */
    function interpolate(raw, args) {
        if (args.length === 0)
            return raw;
        return raw.replace(/%(\d+)/g, (match, n) => {
            const val = args[Number(n) - 1];
            return val === undefined ? match : String(val);
        });
    }
    /** Translates `key` in an explicit `lang`, falling back to English then the key itself. */
    function translate(lang, key, ...args) {
        var _a, _b, _c;
        const raw = (_c = (_b = (_a = dictionaries[lang]) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : en[key]) !== null && _c !== void 0 ? _c : key;
        return interpolate(raw, args);
    }
    /** Translates `key` in the active locale. */
    function t(key, ...args) {
        return translate(activeLang, key, ...args);
    }
    /**
     * Localizes an already-rendered DOM subtree from its `data-i18n*` attributes, using `lang` (or the
     * active locale). Lets modal markup be authored once with attributes and re-localized in one call
     * when the previewed language changes:
     * - `data-i18n` → element text content
     * - `data-i18n-html` → element inner HTML (for values containing trusted `<code>` etc.)
     * - `data-i18n-placeholder` → the `placeholder` attribute
     *
     * Callers must provide a `setHtml` sink (our Trusted Types-aware `setInnerHtml`) for the HTML variant;
     * i18n stays free of DOM-injection policy that way.
     */
    function applyI18n(root, setHtml, lang = activeLang) {
        root.querySelectorAll("[data-i18n]").forEach((el) => {
            el.textContent = translate(lang, el.dataset.i18n);
        });
        root.querySelectorAll("[data-i18n-html]").forEach((el) => {
            setHtml(el, translate(lang, el.dataset.i18nHtml));
        });
        root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
            el.placeholder = translate(lang, el.dataset.i18nPlaceholder);
        });
    }

    /**
     * Prefixed console logging with an in-memory ring buffer. Every `log`/`warn`/`error` call is both
     * printed (behind a filterable `[YFAS]` prefix) and captured into a bounded RAM buffer so a debug
     * report can include recent history without ever touching storage. Kept separate from `utils.ts`
     * so the many modules that only need logging don't pull in the DOM/GM helpers alongside it.
     */
    /** Shared console prefix so every log is filterable and never lost behind a missing tag. */
    const logPrefix = "[YFAS]";
    /**
     * In-memory ring buffer of the most recent log lines from all three streams. Kept in RAM only
     * (never persisted) so a debug report can include recent history without touching storage.
     */
    const logBuffer = [];
    /** Cap on retained log lines; oldest are dropped past this to bound memory use. */
    const maxLogEntries = 300;
    /** Best-effort conversion of a single log argument to a readable string (expanding Errors/objects). */
    function stringifyArg(arg) {
        if (typeof arg === "string")
            return arg;
        if (arg instanceof Error)
            return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ""}`;
        try {
            return JSON.stringify(arg);
        }
        catch (_a) {
            return String(arg);
        }
    }
    /** Appends a line to {@linkcode logBuffer}, trimming it back down to {@linkcode maxLogEntries}. */
    function record$1(level, args) {
        logBuffer.push({ t: Date.now(), level, msg: args.map(stringifyArg).join(" ") });
        if (logBuffer.length > maxLogEntries)
            logBuffer.splice(0, logBuffer.length - maxLogEntries);
    }
    /** Prefixed `console.log`, also captured into the in-memory log buffer. */
    const log = (...args) => { record$1("log", args); console.log(logPrefix, ...args); };
    /** Prefixed `console.warn`, also captured into the in-memory log buffer. */
    const warn = (...args) => { record$1("warn", args); console.warn(logPrefix, ...args); };
    /** Prefixed `console.error`, also captured into the in-memory log buffer. */
    const error = (...args) => { record$1("error", args); console.error(logPrefix, ...args); };
    /** Returns the captured log lines (oldest first), each formatted as `[ISO time] LEVEL message`. */
    function getRecentLogs() {
        return logBuffer.map(e => `[${new Date(e.t).toISOString()}] ${e.level.toUpperCase()} ${e.msg}`);
    }

    /**
     * Opens the given URL in a new tab, using GM.openInTab if available
     * ⚠️ Requires the directive `@grant GM.openInTab`
     */
    function openInTab(href, background = true) {
        try {
            userutils.openInNewTab(href, background);
        }
        catch (err) {
            window.open(href, "_blank", "noopener noreferrer");
        }
    }
    //#region DOM utils
    let domLoaded = document.readyState === "complete" || document.readyState === "interactive";
    document.addEventListener("DOMContentLoaded", () => domLoaded = true);
    /**
     * Adds generic, accessible interaction listeners to the passed element.
     * All listeners have the default behavior prevented and stop immediate propagation.
     * @param listenerOptions Provide a {@linkcode listenerOptions} object to configure the listeners
     */
    function onInteraction(elem, listener, listenerOptions) {
        const proxListener = (e) => {
            if (e instanceof KeyboardEvent && !(["Enter", " ", "Space", "Spacebar"].includes(e.key)))
                return;
            e.preventDefault();
            e.stopImmediatePropagation();
            (listenerOptions === null || listenerOptions === void 0 ? void 0 : listenerOptions.once) && e.type === "keydown" && elem.removeEventListener("click", proxListener, listenerOptions);
            (listenerOptions === null || listenerOptions === void 0 ? void 0 : listenerOptions.once) && e.type === "click" && elem.removeEventListener("keydown", proxListener, listenerOptions);
            listener(e);
        };
        elem.addEventListener("click", proxListener, listenerOptions);
        elem.addEventListener("keydown", proxListener, listenerOptions);
    }
    /** Resolves with the first element matching `selector`, polling until found or `timeoutMs` elapses (then `null`). */
    function waitForSelector(selector, timeoutMs = 4000, intervalMs = 100) {
        const existing = document.querySelector(selector);
        if (existing)
            return Promise.resolve(existing);
        return new Promise((resolve) => {
            const start = Date.now();
            const timer = setInterval(() => {
                const el = document.querySelector(selector);
                if (el || Date.now() - start > timeoutMs) {
                    clearInterval(timer);
                    resolve(el);
                }
            }, intervalMs);
        });
    }
    /**
     * A pass-through Trusted Types policy, or `undefined` when the browser has no Trusted Types.
     * YouTube enforces `require-trusted-types-for 'script'` (observed in incognito windows), so a plain
     * `element.innerHTML = "..."` throws a "Sink type mismatch" CSP violation. Routing HTML through this
     * policy satisfies the enforcement; where Trusted Types is absent, assigning the raw string is
     * already allowed. YouTube ships no `trusted-types` names allowlist, so any policy name is accepted.
     */
    const htmlPolicy = (() => {
        const tt = window.trustedTypes;
        try {
            return tt === null || tt === void 0 ? void 0 : tt.createPolicy("yfas", { createHTML: html => html });
        }
        catch (err) {
            warn("Couldn't create Trusted Types policy; falling back to raw innerHTML:", err);
            return undefined;
        }
    })();
    /**
     * Sets `element.innerHTML`, wrapping the HTML in a Trusted Types policy where the browser enforces
     * Trusted Types. Use this instead of assigning `innerHTML` directly so the script keeps working
     * under YouTube's CSP (notably in incognito windows, where the assignment otherwise throws).
     */
    function setInnerHtml(element, html) {
        var _a;
        element.innerHTML = ((_a = htmlPolicy === null || htmlPolicy === void 0 ? void 0 : htmlPolicy.createHTML(html)) !== null && _a !== void 0 ? _a : html);
    }
    /**
     * Adds a style element to the DOM at runtime.
     * @param css The CSS stylesheet to add
     * @param ref A reference string to identify the style element - defaults to a random 5-character string
     */
    function addStyle(css, ref) {
        if (!domLoaded)
            throw new Error("DOM has not finished loading yet");
        // Use textContent rather than a userutils helper's `innerHTML`: on a <style> element innerHTML is
        // still a Trusted Types sink, which YouTube's CSP blocks in incognito windows. textContent isn't.
        const elem = document.createElement("style");
        elem.textContent = css;
        elem.id = `global-style-${ref !== null && ref !== void 0 ? ref : userutils.randomId(5, 36)}`;
        document.head.appendChild(elem);
        return elem;
    }

    /**
     * Shared modal scaffold used by the settings panel and the failure-feedback dialog.
     * Handles the common overlay/backdrop, Escape-to-close, one-at-a-time dedupe, and base styling
     * (overlay, box, title, primary/secondary buttons). Callers supply the inner HTML, wire up their
     * own controls, and add any content-specific styles of their own.
     */
    /** Ref/id used for the shared base stylesheet, injected once. */
    const styleRef$2 = "yfas-modal";
    /**
     * Opens a modal using the shared scaffold and returns a {@linkcode ModalHandle}, or `null` if a
     * modal with the same `id` is already open (so the caller can early-return). The dialog closes on
     * Escape or a backdrop click; clicks inside the box are not propagated to the backdrop.
     */
    function openModal(opts) {
        var _a;
        if (document.getElementById(opts.id))
            return null;
        if (!document.getElementById(`global-style-${styleRef$2}`))
            addStyle(modalStyle, styleRef$2);
        const overlay = document.createElement("div");
        overlay.id = opts.id;
        overlay.className = "yfas-modal-overlay";
        mirrorYouTubeTheme(overlay);
        setInnerHtml(overlay, `<div class="yfas-modal-box" role="${(_a = opts.role) !== null && _a !== void 0 ? _a : "dialog"}" aria-modal="true" aria-label="${opts.label}">${opts.innerHtml}</div>`);
        const modal = overlay.querySelector(".yfas-modal-box");
        const close = () => {
            overlay.remove();
            document.removeEventListener("keydown", onKeydown);
        };
        const onKeydown = (e) => {
            if (e.key === "Escape")
                close();
        };
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay)
                close();
        });
        modal.addEventListener("click", (e) => e.stopPropagation());
        document.addEventListener("keydown", onKeydown);
        document.body.appendChild(overlay);
        return { overlay, modal, close };
    }
    // The modal sits under `<body>`, a sibling of `<ytd-app>`, and native YouTube doesn't publish its
    // `--yt-spec-*` tokens at document scope, so `var(--yt-spec-…)` falls back to light even in dark
    // mode. Enhancer for YouTube does publish them globally, so its palette is inherited as-is.
    const darkTokens = {
        "--yt-spec-base-background": "#0f0f0f",
        "--yt-spec-text-primary": "#f1f1f1",
        "--yt-spec-text-secondary": "#aaa",
        "--yt-spec-call-to-action": "#3ea6ff",
        "--yt-spec-badge-chip-background": "rgba(255, 255, 255, 0.1)",
        "--yt-spec-10-percent-layer": "rgba(255, 255, 255, 0.2)",
    };
    function mirrorYouTubeTheme(overlay) {
        const dark = isYouTubeDark();
        overlay.style.colorScheme = dark ? "dark" : "light"; // native widgets: scrollbars, <select>, caret
        // If the tokens already reach the modal (Enhancer for YouTube), keep its palette; else supply dark.
        if (getComputedStyle(document.body).getPropertyValue("--yt-spec-base-background").trim())
            return;
        if (dark)
            for (const [name, value] of Object.entries(darkTokens))
                overlay.style.setProperty(name, value);
    }
    /** Whether YouTube is dark, from the luminance of its painted background, with attribute/OS fallback. */
    function isYouTubeDark() {
        for (const el of [document.querySelector("ytd-app"), document.body, document.documentElement]) {
            const rgba = el && parseRgba(getComputedStyle(el).backgroundColor);
            if (rgba && rgba[3] > 0)
                return 0.299 * rgba[0] + 0.587 * rgba[1] + 0.114 * rgba[2] < 128;
        }
        return document.documentElement.hasAttribute("dark")
            || matchMedia("(prefers-color-scheme: dark)").matches;
    }
    /** Parses a `rgb()/rgba()` string into `[r, g, b, a]`, or `null` if it isn't in that form. */
    function parseRgba(color) {
        var _a;
        const m = /rgba?\(([^)]+)\)/.exec(color);
        if (!m)
            return null;
        const p = m[1].split(",").map(n => parseFloat(n));
        return [p[0], p[1], p[2], (_a = p[3]) !== null && _a !== void 0 ? _a : 1];
    }
    const modalStyle = `
.yfas-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  font-family: "Roboto", "Arial", sans-serif;
}
.yfas-modal-box {
  width: min(560px, 92vw);
  max-height: 88vh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px 24px 24px;
  border-radius: 12px;
  background: var(--yt-spec-base-background, #fff);
  color: var(--yt-spec-text-primary, #0f0f0f);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.yfas-modal-title {
  margin: 0 0 16px;
  font-size: 1.8rem;
  font-weight: 500;
}
.yfas-modal-btn {
  padding: 8px 16px;
  font-size: 1.4rem;
  font-weight: 500;
  font-family: inherit;
  border-radius: 18px;
  border: none;
  cursor: pointer;
}
.yfas-modal-btn--primary {
  background: var(--yt-spec-call-to-action, #065fd4);
  color: #fff;
}
.yfas-modal-btn--secondary {
  background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.08));
  color: inherit;
}
.yfas-modal-btn:hover {
  filter: brightness(1.1);
}
`;

    /**
     * Shared user feedback used by both the YouTube and AI provider sides.
     *
     * On a failure ({@linkcode reportFailure}) we show a modal telling the user to refresh and retry.
     * Failure timestamps are persisted (via GM storage, shared across tabs) so that if the user hits two
     * failures within five minutes — even across a page refresh or across the YouTube/AI provider tabs —
     * the modal escalates to include a copyable debug report and a prompt to file a GitHub issue.
     *
     * Expected, non-error conditions (e.g. a video simply has no captions) go through {@linkcode notify}
     * instead, which shows a plain informational modal and is deliberately *not* counted toward that
     * escalation — otherwise a couple of caption-less videos would wrongly prompt the user to file a bug.
     */
    /** GM storage key holding the recent failure timestamps (JSON array of epoch ms). */
    const failuresKey = "yfas-recent-failures";
    /** Sliding window within which repeated failures escalate the modal. */
    const failureWindowMs = 5 * 60000;
    /** Number of failures within the window that triggers the debug-report escalation. */
    const escalateThreshold = 2;
    /** GitHub issues page users are directed to when reporting a persistent problem. */
    const issuesUrl = `https://github.com/${repo}/issues/new`;
    const overlayId$1 = "yfas-feedback-overlay";
    const styleRef$1 = "yfas-feedback";
    /**
     * Records the failure and shows the feedback modal, escalating to a debug report if this is the
     * {@linkcode escalateThreshold}-th failure within {@linkcode failureWindowMs}.
     */
    function reportFailure(info) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const count = yield trackFailure();
            showModal({
                title: t("feedback.title"),
                role: "alertdialog",
                message: (_a = info.userMessage) !== null && _a !== void 0 ? _a : t("feedback.defaultMessage"),
                context: info.context,
                escalate: count >= escalateThreshold,
            });
        });
    }
    /**
     * Notifies the user of an *expected*, non-error condition — e.g. a video simply has no captions, so
     * there is nothing to summarize. Unlike {@linkcode reportFailure} this never records a failure or
     * escalates to the debug report, so a run of these can't trigger the "please file an issue" prompt.
     */
    function notify(message) {
        showModal({ title: t("notice.title"), role: "dialog", message, escalate: false });
    }
    /** Clears the persisted failure counter. Exposed for the dev-only "reset" menu command. */
    function clearFailureCount() {
        return __awaiter(this, void 0, void 0, function* () {
            yield GM.deleteValue(failuresKey);
        });
    }
    /** Appends `now` to the persisted failure list, prunes old entries, and returns the count in-window. */
    function trackFailure() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            let times = [];
            try {
                times = JSON.parse(yield GM.getValue(failuresKey, "[]"));
                if (!Array.isArray(times))
                    times = [];
            }
            catch (_a) {
                times = [];
            }
            times = times.filter(t => typeof t === "number" && now - t < failureWindowMs);
            times.push(now);
            yield GM.setValue(failuresKey, JSON.stringify(times));
            return times.length;
        });
    }
    /** Assembles a plain-text diagnostic report: environment, install source, and recent logs. */
    function buildDebugReport(context) {
        var _a, _b, _c, _d;
        // scriptHandler/version aren't in the GM typings, so read them loosely.
        const gm = GM.info;
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
            `- install source: ${(_a = platformNames[host]) !== null && _a !== void 0 ? _a : host}`,
            `- namespace: ${scriptInfo.namespace}`,
            "",
            "**Environment**",
            `- manager: ${(_b = gm.scriptHandler) !== null && _b !== void 0 ? _b : "unknown"} ${(_c = gm.version) !== null && _c !== void 0 ? _c : ""}`.trimEnd(),
            `- url: ${location.href}`,
            `- userAgent: ${navigator.userAgent}`,
            `- platform: ${(_d = navigator.platform) !== null && _d !== void 0 ? _d : "unknown"}`,
            `- language: ${navigator.language} (${langs})`,
            `- viewport: ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}x`,
            "",
            "**Recent logs**",
            logs.length > 0 ? logs.join("\n") : "(no logs captured)",
        ].join("\n");
    }
    /** Builds and shows the modal. Only one is shown at a time. */
    function showModal(opts) {
        var _a;
        const { title, role, message, escalate } = opts;
        const report = escalate ? buildDebugReport((_a = opts.context) !== null && _a !== void 0 ? _a : "") : "";
        const handle = openModal({
            id: overlayId$1,
            label: title,
            role,
            innerHtml: `
      <h2 class="yfas-modal-title">${title}</h2>
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
        if (!handle)
            return; // one at a time
        if (!document.getElementById(`global-style-${styleRef$1}`))
            addStyle(feedbackStyle, styleRef$1);
        const { overlay, close } = handle;
        // Assign text via textContent to avoid injecting untrusted strings as HTML.
        overlay.querySelector(".yfas-fb-msg").textContent = message;
        overlay.querySelector("[data-action='close']").addEventListener("click", close);
        if (escalate) {
            const reportEl = overlay.querySelector(".yfas-fb-report");
            reportEl.value = report;
            const copyBtn = overlay.querySelector("[data-action='copy']");
            copyBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const ok = yield copyText(report, reportEl);
                copyBtn.textContent = ok ? t("feedback.debug.copied") : t("feedback.debug.copyFailed");
                setTimeout(() => (copyBtn.textContent = t("feedback.debug.copy")), 2500);
            }));
        }
        overlay.querySelector("[data-action='close']").focus();
    }
    /** Copies text to the clipboard, falling back to selecting the textarea + `execCommand`. */
    function copyText(text, textarea) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield navigator.clipboard.writeText(text);
                return true;
            }
            catch (_a) {
                try {
                    textarea.focus();
                    textarea.select();
                    const ok = document.execCommand("copy");
                    textarea.setSelectionRange(0, 0);
                    textarea.blur();
                    return ok;
                }
                catch (_b) {
                    return false;
                }
            }
        });
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

    /**
     * Shared subtitle primitives: the types describing YouTube's caption data and the pure functions
     * that parse and normalize it. Both capture strategies depend on this core — `subtitles.ts` for
     * on-page (watch page) capture and `remote-subtitles.ts` for off-page (InnerTube) capture — so the
     * shared code lives here rather than in either strategy module, keeping the dependency direction
     * flat (both strategies point at the core, not at each other).
     */
    //#endregion
    //#region track selection
    /** Extracts the caption track list from a player response. */
    function getCaptionTracks(resp) {
        var _a, _b, _c;
        return (_c = (_b = (_a = resp === null || resp === void 0 ? void 0 : resp.captions) === null || _a === void 0 ? void 0 : _a.playerCaptionsTracklistRenderer) === null || _b === void 0 ? void 0 : _b.captionTracks) !== null && _c !== void 0 ? _c : [];
    }
    /** Resolves a track's display name across the two shapes YouTube uses. */
    function trackName(track) {
        var _a, _b, _c, _d, _e;
        return (_e = (_b = (_a = track.name) === null || _a === void 0 ? void 0 : _a.simpleText) !== null && _b !== void 0 ? _b : (_d = (_c = track.name) === null || _c === void 0 ? void 0 : _c.runs) === null || _d === void 0 ? void 0 : _d.map(r => r.text).join("")) !== null && _e !== void 0 ? _e : track.languageCode;
    }
    /**
     * Picks the best track for the user: first a manually-created track in a preferred language,
     * then an auto-generated one in a preferred language, then any manual track, then anything.
     */
    function pickTrack(tracks, preferredLangs) {
        var _a, _b, _c;
        if (tracks.length === 0)
            return undefined;
        const matchesLang = (t) => preferredLangs.some(l => t.languageCode.toLowerCase().startsWith(l.toLowerCase()));
        const isManual = (t) => t.kind !== "asr";
        return (_c = (_b = (_a = tracks.find(t => matchesLang(t) && isManual(t))) !== null && _a !== void 0 ? _a : tracks.find(t => matchesLang(t))) !== null && _b !== void 0 ? _b : tracks.find(isManual)) !== null && _c !== void 0 ? _c : tracks[0];
    }
    /** Returns the browser UI language plus English as default preferred languages. */
    function defaultPreferredLangs() {
        var _a;
        const langs = [navigator.language, ...((_a = navigator.languages) !== null && _a !== void 0 ? _a : [])].filter(Boolean);
        return [...new Set([...langs, "en"])];
    }
    //#endregion
    //#region json3 parsing / formatting
    /** Decodes a json3 timedtext payload into ordered segments. */
    function parseJson3(data) {
        var _a, _b, _c;
        const segments = [];
        for (const event of (_a = data.events) !== null && _a !== void 0 ? _a : []) {
            const text = ((_b = event.segs) !== null && _b !== void 0 ? _b : []).map(s => { var _a; return (_a = s.utf8) !== null && _a !== void 0 ? _a : ""; }).join("").replace(/\s+/g, " ").trim();
            if (text.length === 0)
                continue;
            segments.push({
                start: ((_c = event.tStartMs) !== null && _c !== void 0 ? _c : 0) / 1000,
                text,
            });
        }
        return segments;
    }
    /** Formats a number of seconds as `m:ss`, or `h:mm:ss` once it reaches an hour. */
    function formatTimestamp(totalSeconds) {
        const s = Math.max(0, Math.floor(totalSeconds));
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        const pad = (n) => n.toString().padStart(2, "0");
        return hrs > 0
            ? `${hrs}:${pad(mins)}:${pad(secs)}`
            : `${mins}:${pad(secs)}`;
    }
    /** Joins segments into `[h:mm:ss] text` lines for time-aware AI analysis. */
    function toTimedText(segments) {
        return segments.map(s => `[${formatTimestamp(s.start)}] ${s.text}`).join("\n");
    }
    //#endregion

    /**
     * Off-page subtitle capture: fetches subtitles for an arbitrary video id *without* opening its
     * watch page, so the thumbnail overlay button (see `thumbnails.ts`) can summarize straight from a
     * home/search/related list.
     *
     * The on-page strategies in `subtitles.ts` (intercepting the player's timedtext request, scraping
     * the transcript panel) all need the player to be running, which it isn't off-page. And the static
     * `captionTracks[].baseUrl` from a normal (WEB) player response is now PoToken-gated (`exp=xpe`) and
     * returns an empty body when fetched directly.
     *
     * So instead we ask YouTube's InnerTube `player` endpoint for a fresh player response while
     * impersonating the **ANDROID** client: that client's `captionTracks[].baseUrl` is *not* PoToken-
     * gated, so we can fetch it as `fmt=json3` and parse it with the same code path as the watch page.
     * The request is same-origin (we're on youtube.com), so it just works under YouTube's CSP.
     *
     * Known limitation: this uses the *unauthenticated* ANDROID player (no SAPISIDHASH), so member-only
     * / age-restricted / private videos return no caption tracks off-page. Those still need the watch
     * page, where the interceptor strategy handles them with the user's real session.
     */
    /**
     * ANDROID InnerTube client identity. The ANDROID client's caption `baseUrl`s aren't PoToken-gated,
     * which is the whole reason we impersonate it here. The version drifts over time but YouTube is
     * lenient about it; bump it if the endpoint starts rejecting requests.
     */
    const ANDROID_CLIENT = {
        clientName: "ANDROID",
        clientVersion: "20.10.38",
        androidSdkVersion: 30,
    };
    /** Public WEB InnerTube key, used only as a fallback if the page's own key can't be read. */
    const FALLBACK_INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
    /** Page realm, where YouTube's `ytcfg` (holding the real InnerTube key) lives. */
    const pageWindow$2 = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
    /** Builds the canonical watch URL for a video id. */
    function watchUrl(videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    /** Reads the page's own InnerTube API key (from `ytcfg`), falling back to the public WEB key. */
    function getInnertubeApiKey() {
        var _a, _b, _c, _d, _e;
        try {
            const key = (_c = (_b = (_a = pageWindow$2.ytcfg) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, "INNERTUBE_API_KEY")) !== null && _c !== void 0 ? _c : (_e = (_d = pageWindow$2.ytcfg) === null || _d === void 0 ? void 0 : _d.data_) === null || _e === void 0 ? void 0 : _e.INNERTUBE_API_KEY;
            if (typeof key === "string" && key.length > 0)
                return key;
        }
        catch ( /* fall through to the constant */_f) { /* fall through to the constant */ }
        return FALLBACK_INNERTUBE_API_KEY;
    }
    /**
     * Fetches a fresh player response for `videoId` from the InnerTube `player` endpoint using the
     * ANDROID client, so the caption `baseUrl`s it returns are usable without a PoToken.
     */
    function fetchAndroidPlayerResponse(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = getInnertubeApiKey();
            const hl = (navigator.language || "en").split("-")[0];
            const res = yield fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-YouTube-Client-Name": "3", // 3 = ANDROID
                    "X-YouTube-Client-Version": ANDROID_CLIENT.clientVersion,
                },
                body: JSON.stringify({ context: { client: Object.assign(Object.assign({}, ANDROID_CLIENT), { hl }) }, videoId }),
            });
            if (!res.ok) {
                warn(`InnerTube player request for ${videoId} failed with HTTP ${res.status}`);
                return null;
            }
            return yield res.json();
        });
    }
    /** Fetches a caption track's `baseUrl` as `fmt=json3` and parses it into segments. */
    function fetchTrackSegments(baseUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL(baseUrl, "https://www.youtube.com");
            url.searchParams.set("fmt", "json3");
            const res = yield fetch(url.toString(), { credentials: "include" });
            if (!res.ok)
                return null;
            const body = yield res.text();
            if (body.trim().length === 0)
                return null;
            const segments = parseJson3(JSON.parse(body));
            return segments.length > 0 ? segments : null;
        });
    }
    /**
     * Captures subtitles for `videoId` without opening its watch page.
     * Returns `null` if the video has no caption tracks at all.
     *
     * @throws if the video is gated (login/age) or a track exists but its text couldn't be fetched.
     */
    function getSubtitlesForVideo(videoId_1) {
        return __awaiter(this, arguments, void 0, function* (videoId, opts = {}) {
            var _a, _b, _c, _d;
            const preferredLangs = (_a = opts.preferredLangs) !== null && _a !== void 0 ? _a : defaultPreferredLangs();
            const resp = yield fetchAndroidPlayerResponse(videoId);
            const tracks = getCaptionTracks(resp !== null && resp !== void 0 ? resp : undefined);
            const track = pickTrack(tracks, preferredLangs);
            if (!track) {
                // No tracks can mean "genuinely no captions" or "the ANDROID player couldn't play it" (member-
                // only / age-restricted / private): distinguish so the failure message can point to the watch page.
                const status = (_b = resp === null || resp === void 0 ? void 0 : resp.playabilityStatus) === null || _b === void 0 ? void 0 : _b.status;
                if (status && status !== "OK")
                    throw new Error(`Video ${videoId} is not accessible off-page (${status}); open the watch page to summarize it`);
                return null; // no captions at all
            }
            const videoTitle = (_d = (_c = resp === null || resp === void 0 ? void 0 : resp.videoDetails) === null || _c === void 0 ? void 0 : _c.title) !== null && _d !== void 0 ? _d : "";
            if (!track.baseUrl)
                throw new Error(`Caption track for ${videoId} has no baseUrl to fetch`);
            const segments = yield fetchTrackSegments(track.baseUrl);
            if (!segments)
                throw new Error(`Found a caption track for ${videoId} but its timedtext body was empty`);
            return {
                videoId,
                videoTitle,
                videoUrl: watchUrl(videoId),
                lang: track.languageCode,
                trackName: trackName(track),
                segments,
                text: segments.map(s => s.text).join("\n"),
                timedText: toTimedText(segments),
                source: "innertube-player",
            };
        });
    }

    /**
     * Cross-tab handoff between the YouTube tab (which captures subtitles) and the AI provider tab
     * (which injects them). GM storage is shared across all tabs running this userscript, so the
     * payload survives the `openInTab` jump without going through the URL (avoiding length limits).
     * ⚠️ Requires the directives `@grant GM.setValue`, `@grant GM.getValue`, `@grant GM.deleteValue`
     */
    const storageKey = "yfas-pending-summary";
    /** Stores a captured payload for the AI provider tab to pick up. */
    function stashSummaryPayload(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield GM.setValue(storageKey, JSON.stringify(payload));
        });
    }
    /**
     * Reads and removes the pending payload (one-shot). Returns `null` if there is none or it is
     * older than `maxAgeMs` (a stale handoff from a previous, unrelated session).
     */
    function takeSummaryPayload() {
        return __awaiter(this, arguments, void 0, function* (maxAgeMs = 5 * 60000) {
            const raw = yield GM.getValue(storageKey, "");
            if (!raw)
                return null;
            yield GM.deleteValue(storageKey);
            try {
                const payload = JSON.parse(raw);
                if (typeof payload.createdAt !== "number" || Date.now() - payload.createdAt > maxAgeMs)
                    return null;
                return payload;
            }
            catch (_a) {
                return null;
            }
        });
    }

    /**
     * AI provider registry + the generic "target tab" engine.
     *
     * The YouTube side captures subtitles and hands off a {@linkcode SummaryPayload}; the target tab
     * (whichever AI site the user picked) picks it up and injects it into that site's prompt input,
     * optionally submitting. Every site has a different DOM (textarea vs. contenteditable rich editor)
     * and different submit affordances, so each is described declaratively by an {@linkcode AiProvider}
     * and driven by one shared engine below.
     */
    /** Google AI Studio (the original target). Uses a plain textarea + a "Run" button. */
    const aiStudio = {
        id: "aistudio",
        label: "Google AI Studio",
        note: "provider.aistudio.note",
        recommended: true,
        newChatUrl: "https://aistudio.google.com/prompts/new_chat",
        hosts: ["aistudio.google.com"],
        inputKind: "textarea",
        inputSelectors: [
            "ms-autosize-textarea textarea",
            "ms-prompt-input-wrapper textarea",
            "textarea[aria-label]",
            "textarea",
        ],
        submitSelectors: [
            "ms-run-button button",
            "run-button button",
            "button.run-button",
            "button[aria-label='Run']",
        ],
        submitTexts: /^(run|執行|送出|傳送)$/i,
        submitShortcut: "ctrl-enter",
    };
    /** Consumer Gemini (gemini.google.com) — a Quill rich editor, not AI Studio. */
    const gemini = {
        id: "gemini",
        label: "Gemini",
        note: "provider.gemini.note",
        newChatUrl: "https://gemini.google.com/app",
        hosts: ["gemini.google.com"],
        inputKind: "contenteditable",
        inputSelectors: [
            "rich-textarea .ql-editor[contenteditable='true']",
            "div.ql-editor[contenteditable='true']",
            "[role='textbox'][contenteditable='true']",
        ],
        submitSelectors: [
            "button.send-button",
            "button[aria-label*='傳送']",
            "button[aria-label*='發送']",
            "button[aria-label*='Send']",
        ],
        submitShortcut: "enter",
        // Gemini's /app landing resets the view on a too-early submit; wait for it to settle first.
        settleBeforeSubmit: true,
    };
    /** ChatGPT (chatgpt.com) — ProseMirror contenteditable `#prompt-textarea`. */
    const chatgpt = {
        id: "chatgpt",
        label: "ChatGPT",
        note: "provider.chatgpt.note",
        newChatUrl: "https://chatgpt.com/",
        hosts: ["chatgpt.com", "chat.openai.com"],
        inputKind: "contenteditable",
        inputSelectors: [
            "#prompt-textarea",
            "div.ProseMirror[contenteditable='true']",
            "[contenteditable='true'][id='prompt-textarea']",
        ],
        submitSelectors: [
            "button[data-testid='send-button']",
            "#composer-submit-button",
            "button[aria-label*='Send']",
        ],
        submitShortcut: "enter",
    };
    /** Claude (claude.ai) — ProseMirror contenteditable editor. */
    const claude = {
        id: "claude",
        label: "Claude",
        note: "provider.claude.note",
        newChatUrl: "https://claude.ai/new",
        hosts: ["claude.ai"],
        inputKind: "contenteditable",
        inputSelectors: [
            "div.ProseMirror[contenteditable='true']",
            "[contenteditable='true'][role='textbox']",
            "fieldset div.ProseMirror",
        ],
        submitSelectors: [
            "button[aria-label='Send message']",
            "button[aria-label*='Send']",
        ],
        submitShortcut: "enter",
    };
    /** Grok (grok.com) — a plain textarea composer. */
    const grok = {
        id: "grok",
        label: "Grok",
        note: "provider.grok.note",
        newChatUrl: "https://grok.com/",
        hosts: ["grok.com"],
        inputKind: "textarea",
        inputSelectors: [
            "textarea[aria-label]",
            "textarea[dir='auto']",
            "form textarea",
            "textarea",
        ],
        submitSelectors: [
            "button[type='submit']",
            "button[aria-label*='Submit']",
            "button[aria-label*='Send']",
        ],
        submitShortcut: "enter",
    };
    /** All supported providers, ordered best-to-worst (roughly) — this is the order shown to the user. */
    const providers = [aiStudio, grok, claude, gemini, chatgpt];
    /** Provider used when config is empty or references an unknown id (keeps old behaviour). */
    const defaultProvider = aiStudio;
    /** Looks up a provider by its persisted id, falling back to {@linkcode defaultProvider}. */
    function getProviderById(id) {
        var _a;
        return (_a = providers.find(p => p.id === id)) !== null && _a !== void 0 ? _a : defaultProvider;
    }
    /** Returns the provider that owns the given hostname, if any (used to route the target tab). */
    function getProviderByHost(hostname) {
        return providers.find(p => p.hosts.some(h => hostname === h || hostname.endsWith(`.${h}`)));
    }
    /**
     * Entry point for a target tab. Reads the pending payload (if this tab was opened by our YouTube
     * side) and injects it into `provider`'s prompt field. A no-op on a normal, unrelated visit.
     */
    function initProviderTarget(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield takeSummaryPayload();
            if (!payload)
                return; // normal visit, nothing to inject
            try {
                let input = yield waitForInput(provider);
                if (!input) {
                    warn(`Could not find the ${provider.label} prompt input to inject into.`);
                    void reportFailure({
                        context: `provider:${provider.id}:no-input`,
                        userMessage: t("error.noInput", provider.label),
                    });
                    return;
                }
                injectPrompt(provider, input, payload.prompt);
                log(`Injected subtitles into ${provider.label}${payload.title ? ` for "${payload.title}"` : ""}.`);
                if (payload.autoSubmit) {
                    if (provider.settleBeforeSubmit)
                        input = yield settleBeforeSubmit(provider, input, payload.prompt);
                    yield submitPrompt(provider, input);
                }
                else {
                    log("Auto-submit disabled; leaving the prompt for review.");
                }
            }
            catch (err) {
                error(`Failed to inject the prompt into ${provider.label}:`, err);
                void reportFailure({ context: `provider:${provider.id}:inject-error` });
            }
        });
    }
    /**
     * Waits for the page to stop mutating before submitting, then makes sure our text is still in the
     * field (the hydration churn can replace or clear the editor). Returns the input to submit against —
     * re-resolved if the original node was swapped out. Used only by providers with `settleBeforeSubmit`.
     */
    function settleBeforeSubmit(provider, input, value) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield waitForDomQuiet();
            // If the settled app swapped the editor node or wiped its contents, re-find and re-inject.
            const current = input.isConnected ? input : (_a = yield waitForInput(provider)) !== null && _a !== void 0 ? _a : input;
            if (provider.inputKind === "contenteditable" && !hasText(current)) {
                log(`${provider.label} cleared the prompt while settling; re-injecting.`);
                injectPrompt(provider, current, value);
            }
            return current;
        });
    }
    /**
     * Resolves once the DOM has gone `quietMs` without a mutation (a proxy for "the SPA finished
     * hydrating"), or after `maxMs` regardless so it can never hang. Cheaper and more accurate than a
     * fixed sleep: it proceeds the moment the app calms down and only waits longer when it's still busy.
     */
    function waitForDomQuiet(quietMs = 450, maxMs = 6000) {
        return new Promise((resolve) => {
            let quietTimer = 0;
            const finish = () => {
                clearTimeout(quietTimer);
                clearTimeout(hardCap);
                obs.disconnect();
                resolve();
            };
            const obs = new MutationObserver(() => {
                clearTimeout(quietTimer);
                quietTimer = window.setTimeout(finish, quietMs);
            });
            obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
            quietTimer = window.setTimeout(finish, quietMs);
            const hardCap = window.setTimeout(finish, maxMs);
        });
    }
    /** Waits (generously — these apps load slowly) for any candidate prompt input to appear. */
    function waitForInput(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const combined = provider.inputSelectors.join(", ");
            const found = yield waitForSelector(combined, 20000, 200);
            if (!found)
                return null;
            // Prefer a visible one if several match.
            const all = [...document.querySelectorAll(combined)];
            return (_a = all.find(el => el.offsetParent !== null)) !== null && _a !== void 0 ? _a : found;
        });
    }
    /** Dispatches text into the provider's prompt field according to its {@linkcode InputKind}. */
    function injectPrompt(provider, input, value) {
        if (provider.inputKind === "textarea")
            injectTextarea(input, value);
        else
            injectContentEditable(input, value);
    }
    /**
     * Sets a value on a framework-controlled textarea. Assigning `.value` directly is ignored by
     * Angular/React change detection, so we use the native value setter and dispatch an `input` event.
     */
    function injectTextarea(textarea, value) {
        var _a, _b, _c;
        const proto = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window).HTMLTextAreaElement.prototype;
        const setter = (_b = (_a = Object.getOwnPropertyDescriptor(proto, "value")) === null || _a === void 0 ? void 0 : _a.set) !== null && _b !== void 0 ? _b : (_c = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")) === null || _c === void 0 ? void 0 : _c.set;
        if (setter)
            setter.call(textarea, value);
        else
            textarea.value = value;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
        textarea.focus();
    }
    /**
     * Inserts text into a contenteditable rich editor (ProseMirror/Quill/Lexical). These editors ignore
     * direct `textContent` writes, so we try, in order, the techniques they *do* honour, and after each
     * one check whether text actually landed before giving up on it:
     *   1. a synthetic `paste` carrying the transcript as `text/plain` (editors convert newlines to
     *      their own block structure) — but a "handled" paste can still insert nothing if the engine
     *      ignores our constructed `clipboardData`, so we verify rather than trusting `defaultPrevented`;
     *   2. `execCommand("insertText")`, which fires the `beforeinput` these editors listen to;
     *   3. a raw `textContent` write + `input` event as a last resort.
     * Verifying between steps is what makes auto-submit work: the send button only enables once the
     * editor's own model actually holds the text.
     */
    function injectContentEditable(el, value) {
        el.focus();
        placeCaretAtEnd(el);
        try {
            const dt = new DataTransfer();
            dt.setData("text/plain", value);
            const paste = new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true });
            el.dispatchEvent(paste);
            if (hasText(el))
                return; // the editor consumed the paste and text landed
        }
        catch (err) {
            warn("Synthetic paste failed, falling back to execCommand:", err);
        }
        if (document.execCommand("insertText", false, value) && hasText(el))
            return;
        warn("Paste and execCommand both left the editor empty; writing textContent directly.");
        el.textContent = value;
        el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
    }
    /** Whether a contenteditable currently holds any non-whitespace text. */
    function hasText(el) {
        var _a;
        return ((_a = el.textContent) !== null && _a !== void 0 ? _a : "").trim().length > 0;
    }
    /** Collapses the selection to the end of a contenteditable so insertions land inside it. */
    function placeCaretAtEnd(el) {
        try {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel === null || sel === void 0 ? void 0 : sel.removeAllRanges();
            sel === null || sel === void 0 ? void 0 : sel.addRange(range);
        }
        catch (err) {
            warn("Could not place caret in the editor:", err);
        }
    }
    /**
     * Submits the prompt on the user's behalf: clicks the provider's submit button once it becomes
     * enabled, falling back to the provider's keyboard shortcut if the button can't be located.
     */
    function submitPrompt(provider, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const button = yield waitForSubmitButton(provider);
            if (button) {
                button.click();
                log(`Clicked ${provider.label} submit button.`);
                return;
            }
            warn(`${provider.label} submit button not found; trying keyboard shortcut fallback.`);
            dispatchSubmitShortcut(input, provider.submitShortcut);
        });
    }
    /** Polls for a visible, enabled submit button (frameworks enable it once the prompt has content). */
    function waitForSubmitButton(provider, timeoutMs = 8000, intervalMs = 150) {
        const start = Date.now();
        return new Promise((resolve) => {
            const check = () => {
                const btn = findSubmitButton(provider);
                if (btn)
                    return resolve(btn);
                if (Date.now() - start > timeoutMs)
                    return resolve(null);
                setTimeout(check, intervalMs);
            };
            check();
        });
    }
    /** Finds a clickable submit button by selector or (fallback) by button text. */
    function findSubmitButton(provider) {
        var _a;
        const bySelector = [...document.querySelectorAll(provider.submitSelectors.join(", "))];
        const { submitTexts } = provider;
        const byText = submitTexts
            ? [...document.querySelectorAll("button")]
                .filter(b => { var _a, _b; return submitTexts.test((_b = (_a = b.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : ""); })
            : [];
        return (_a = [...bySelector, ...byText].find(isClickable)) !== null && _a !== void 0 ? _a : null;
    }
    /** Whether a button is visible and not disabled. */
    function isClickable(btn) {
        return btn.offsetParent !== null && !btn.disabled && btn.getAttribute("aria-disabled") !== "true";
    }
    /** Dispatches the provider's submit shortcut (Enter or Ctrl+Enter) on the prompt field. */
    function dispatchSubmitShortcut(el, shortcut) {
        const opts = {
            key: "Enter", code: "Enter", keyCode: 13, which: 13,
            ctrlKey: shortcut === "ctrl-enter", bubbles: true, cancelable: true,
        };
        el.dispatchEvent(new KeyboardEvent("keydown", opts));
        el.dispatchEvent(new KeyboardEvent("keyup", opts));
    }

    let canCompress;
    /** Factory so the defaults object isn't shared by reference. */
    const getDefaultConfig = () => ({
        language: AUTO_LANG,
        provider: defaultProvider.id,
        // Empty = follow the interface language; the locale's default prompt is resolved at use time.
        promptTemplate: "",
        includeTimestamps: true,
        autoSubmit: true,
        preferredLangs: "",
    });
    const config = new userutils.DataStore({
        id: "script-config",
        defaultData: getDefaultConfig(),
        // increment this value if the data format changes:
        formatVersion: 1,
        // functions that migrate data from older versions to newer ones:
        migrations: {
        // migrate from v1 to v2:
        // 2: (oldData) => {
        //   return { ...oldData, newProp: "foo" };
        // },
        },
        encodeData: (data) => canCompress ? userutils.compress(data, compressionFormat, "string") : data,
        decodeData: (data) => canCompress ? userutils.decompress(data, compressionFormat, "string") : data,
    });
    function initConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            canCompress = yield compressionSupported();
            yield config.loadData();
        });
    }
    function compressionSupported() {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof canCompress === "boolean")
                return canCompress;
            try {
                yield userutils.compress(".", compressionFormat, "string");
                return canCompress = true;
            }
            catch (e) {
                return canCompress = false;
            }
        });
    }

    /**
     * Builds the final AI prompt from a captured transcript, shared by both trigger surfaces: the
     * watch-page summary button and the off-page thumbnail overlay. Kept separate from `youtube.ts`
     * so the off-page path can supply its own title/URL (the ones it fetched) instead of reading the
     * current watch page's DOM.
     */
    /**
     * Substitutes the template tokens with the video's data. An empty template means "follow the
     * interface language": the active locale's default prompt is used instead.
     *
     * @param title   Video title, substituted for `{{title}}`.
     * @param url     Watch URL, substituted for `{{url}}`.
     */
    function buildPrompt(result, template, includeTimestamps, title, url) {
        const transcript = includeTimestamps ? result.timedText : result.text;
        return (template.trim() || t("prompt.default"))
            .split("{{title}}").join(title)
            .split("{{url}}").join(url)
            .split("{{transcript}}").join(transcript);
    }

    /**
     * Intercepts the YouTube player's own `/api/timedtext` network requests so we can reuse the URL
     * it generates - which carries a valid PoToken and the user's auth session. This is the only way
     * to capture subtitles for PoToken-gated (`exp=xpe`) and member-only videos, where the static
     * `baseUrl` from the player response returns an empty body and `get_transcript` is rejected.
     *
     * Installed at document-start (before the player runs) by patching `fetch` and `XMLHttpRequest`
     * on the page realm via `unsafeWindow`.
     */
    const timedtextMarker = "/api/timedtext";
    /** Page realm, where the player's `fetch` / `XMLHttpRequest` live. */
    const pageWindow$1 = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
    /** Most recently observed working timedtext URL (from the page's own requests). */
    let latestUrl = null;
    /** One-shot resolvers waiting for the next matching URL. */
    const waiters = [];
    let installed = false;
    /** Records a captured URL if it is a timedtext request, and notifies any matching waiters. */
    function record(rawUrl) {
        if (!rawUrl.includes(timedtextMarker))
            return;
        latestUrl = rawUrl;
        for (let i = waiters.length - 1; i >= 0; i--) {
            const w = waiters[i];
            if (w.match(rawUrl)) {
                clearTimeout(w.timer);
                waiters.splice(i, 1);
                w.resolve(rawUrl);
            }
        }
    }
    /** Patches `fetch` and `XMLHttpRequest.open` on the page realm. Idempotent. */
    function installTimedtextInterceptor() {
        var _a;
        if (installed)
            return;
        installed = true;
        // fetch
        const origFetch = pageWindow$1.fetch;
        pageWindow$1.fetch = function (...args) {
            try {
                const input = args[0];
                const url = typeof input === "string"
                    ? input
                    : input instanceof URL ? input.href : input.url;
                record(url);
            }
            catch ( /* never let interception break the page's request */_a) { /* never let interception break the page's request */ }
            return origFetch.apply(this, args);
        };
        // XMLHttpRequest
        const proto = (_a = pageWindow$1.XMLHttpRequest) === null || _a === void 0 ? void 0 : _a.prototype;
        if (proto) {
            const origOpen = proto.open;
            proto.open = function (...args) {
                try {
                    const u = args[1];
                    record(typeof u === "string" ? u : u.href);
                }
                catch ( /* ignore */_a) { /* ignore */ }
                return origOpen.apply(this, args);
            };
        }
        log("timedtext interceptor installed");
    }
    /** True when `url` belongs to `videoId` (or any video when `videoId` is omitted). */
    function matchesVideo(url, videoId) {
        return !videoId || url.includes(`v=${videoId}`);
    }
    /**
     * Returns an already-captured timedtext URL for `videoId` (or the latest one) without waiting,
     * or `null` if none has been observed yet. Lets callers skip re-triggering the player.
     */
    function peekTimedtextUrl(videoId) {
        return latestUrl && matchesVideo(latestUrl, videoId) ? latestUrl : null;
    }
    /**
     * Resolves with a timedtext URL for `videoId` (or the latest one if `videoId` is omitted),
     * waiting up to `timeoutMs` for the player to issue one. Resolves `null` on timeout.
     */
    function waitForTimedtextUrl(videoId, timeoutMs = 6000) {
        const match = (url) => matchesVideo(url, videoId);
        if (latestUrl && match(latestUrl))
            return Promise.resolve(latestUrl);
        return new Promise((resolve) => {
            const timer = window.setTimeout(() => {
                const i = waiters.findIndex(w => w.resolve === resolve);
                if (i >= 0)
                    waiters.splice(i, 1);
                resolve(null);
            }, timeoutMs);
            waiters.push({ match, resolve, timer });
        });
    }

    /**
     * Page-based YouTube subtitle extraction.
     *
     * Design goal (see project memory): capture subtitles directly from the page the user
     * is already watching, never via an external subtitle API. This is what makes the script
     * work on member-only / region-locked / age-restricted videos, and avoids the third-party
     * scraper breakage caused by YouTube's PoToken (`&exp=xpe`) requirement.
     *
     * Two layered strategies, tried in order:
     *  1. Intercept the player's own `/api/timedtext` request (it carries a valid PoToken and the
     *     user's session) and refetch it as `fmt=json3`.
     *  2. DOM scrape of YouTube's own "Show transcript" panel.
     *
     * The types and pure parsing helpers shared with the off-page path live in `subtitle-core.ts`.
     */
    /**
     * Page globals (`ytInitialPlayerResponse`, the player element's methods) live in the page's
     * realm. In sandboxed userscript engines we need `unsafeWindow` to reach them.
     */
    const pageWindow = (typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
    //#endregion
    //#region player response
    /**
     * Returns the most up-to-date player response. `movie_player.getPlayerResponse()` reflects the
     * currently playing video after SPA navigation, whereas `ytInitialPlayerResponse` goes stale.
     */
    function getPlayerResponse() {
        var _a, _b;
        try {
            const player = ((_a = pageWindow.document) !== null && _a !== void 0 ? _a : document).getElementById("movie_player");
            const fromPlayer = (_b = player === null || player === void 0 ? void 0 : player.getPlayerResponse) === null || _b === void 0 ? void 0 : _b.call(player);
            if (fromPlayer === null || fromPlayer === void 0 ? void 0 : fromPlayer.captions)
                return fromPlayer;
        }
        catch (err) {
            warn("getPlayerResponse() unavailable, falling back to ytInitialPlayerResponse:", err);
        }
        return pageWindow.ytInitialPlayerResponse;
    }
    //#endregion
    //#region strategy 1: intercepted player timedtext request
    /**
     * Turns on the player's captions (via the CC button) so it issues a timedtext request that our
     * interceptor can capture. Clicking is a plain DOM action, avoiding cross-realm method calls.
     */
    function enablePlayerCaptions() {
        const btn = document.querySelector(".ytp-subtitles-button");
        if (!btn) {
            warn("CC button (.ytp-subtitles-button) not found; cannot enable captions");
            return;
        }
        if (btn.getAttribute("aria-pressed") !== "true")
            btn.click();
    }
    /**
     * Strategy: trigger the player to fetch captions, grab the (PoToken-bearing, authenticated) URL
     * it requested via the interceptor, then refetch it as json3 ourselves. Works for member-only and
     * `exp=xpe` videos. Returns `null` if no request was captured or it produced no segments.
     */
    function fetchViaInterceptedUrl(videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            // If the player already issued a timedtext request we can reuse, don't disturb the user's
            // caption state; only toggle captions on when we have nothing captured yet.
            if (!peekTimedtextUrl(videoId))
                enablePlayerCaptions();
            const captured = yield waitForTimedtextUrl(videoId, 6000);
            if (!captured) {
                warn("no player timedtext request captured (could not enable captions in time?)");
                return null;
            }
            const url = new URL(captured, location.origin);
            url.searchParams.set("fmt", "json3");
            const res = yield fetch(url.toString(), { credentials: "include" });
            if (!res.ok)
                return null;
            const body = yield res.text();
            if (body.trim().length === 0)
                return null;
            const segments = parseJson3(JSON.parse(body));
            return segments.length > 0 ? segments : null;
        });
    }
    //#endregion
    //#region strategy 2: transcript panel DOM scrape
    /** The "Show transcript" button, which lives in the description's transcript section. */
    const transcriptButtonSelector = "ytd-video-description-transcript-section-renderer #primary-button button, "
        + "ytd-video-description-transcript-section-renderer button";
    /** The description "...more" expander, which must be opened for the transcript section to render. */
    const descriptionExpandSelector = "ytd-text-inline-expander #expand, #description #expand, tp-yt-paper-button#expand";
    /** A rendered transcript line. */
    const transcriptRowSelector = "transcript-segment-view-model";
    /**
     * Opens YouTube's transcript panel so its segments render into the DOM, then waits for them.
     * The "Show transcript" button only renders after the description is expanded, so we expand it
     * first if the button isn't already present. Returns true once transcript rows are available.
     */
    function openTranscriptPanel() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (document.querySelector(transcriptRowSelector))
                return true;
            let button = document.querySelector(transcriptButtonSelector);
            if (!button) {
                (_a = document.querySelector(descriptionExpandSelector)) === null || _a === void 0 ? void 0 : _a.click();
                button = yield waitForSelector(transcriptButtonSelector, 3000);
            }
            if (!button) {
                warn("could not find the 'Show transcript' button");
                return false;
            }
            button.click();
            return Boolean(yield waitForSelector(transcriptRowSelector, 5000));
        });
    }
    /** Reads already-rendered transcript segments from YouTube's "Show transcript" panel, if open. */
    function scrapeTranscriptPanel() {
        var _a, _b, _c, _d, _e, _f;
        const segments = [];
        for (const row of document.querySelectorAll(transcriptRowSelector)) {
            const text = (_c = (_b = (_a = row.querySelector(".ytAttributedStringHost")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.replace(/\s+/g, " ").trim()) !== null && _c !== void 0 ? _c : "";
            if (text.length === 0)
                continue;
            const stamp = (_f = (_e = (_d = row.querySelector(".ytwTranscriptSegmentViewModelTimestamp")) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "";
            segments.push({ start: parseTimestamp(stamp), text });
        }
        return segments;
    }
    /** Parses a "m:ss" / "h:mm:ss" transcript timestamp into seconds. */
    function parseTimestamp(stamp) {
        const parts = stamp.split(":").map(Number);
        if (parts.some(isNaN))
            return 0;
        return parts.reduce((acc, n) => acc * 60 + n, 0);
    }
    //#endregion
    //#region public API
    /**
     * Whether the currently playing video exposes any caption track. Used to grey out the summary
     * button up front when there is nothing to summarize.
     */
    function hasCaptionsAvailable() {
        return getCaptionTracks(getPlayerResponse()).length > 0;
    }
    /**
     * Captures subtitles for the currently playing video using page-based strategies.
     * Returns `null` if the video has no captions available at all.
     *
     * @throws if a track was found but every strategy failed to produce text.
     */
    function getCurrentSubtitles() {
        return __awaiter(this, arguments, void 0, function* (opts = {}) {
            var _a, _b, _c;
            const preferredLangs = (_a = opts.preferredLangs) !== null && _a !== void 0 ? _a : defaultPreferredLangs();
            const resp = getPlayerResponse();
            const tracks = getCaptionTracks(resp);
            const track = pickTrack(tracks, preferredLangs);
            // Strategy 1: intercept the player's own timedtext request (carries a valid PoToken and the
            // user's session, so it works on member-only / exp=xpe videos).
            if (track) {
                let segments = null;
                try {
                    segments = yield fetchViaInterceptedUrl((_b = resp === null || resp === void 0 ? void 0 : resp.videoDetails) === null || _b === void 0 ? void 0 : _b.videoId);
                }
                catch (err) {
                    warn("intercepted-timedtext fetch failed:", err);
                }
                if (segments && segments.length > 0) {
                    return {
                        lang: track.languageCode,
                        trackName: trackName(track),
                        segments,
                        text: segments.map(s => s.text).join("\n"),
                        timedText: toTimedText(segments),
                        source: "intercept-timedtext",
                    };
                }
            }
            // Strategy 2: open + scrape YouTube's own transcript panel.
            yield openTranscriptPanel();
            const panelSegments = scrapeTranscriptPanel();
            if (panelSegments.length > 0) {
                return {
                    lang: (_c = track === null || track === void 0 ? void 0 : track.languageCode) !== null && _c !== void 0 ? _c : "unknown",
                    trackName: track ? trackName(track) : "Transcript",
                    segments: panelSegments,
                    text: panelSegments.map(s => s.text).join("\n"),
                    timedText: toTimedText(panelSegments),
                    source: "transcript-panel",
                };
            }
            if (!track)
                return null; // no captions at all
            throw new Error("Found a caption track but could not capture its text (PoToken-gated and transcript panel unavailable)");
        });
    }
    //#endregion

    /**
     * The shared "capture the current watch page's subtitles and hand them to the AI provider" flow.
     *
     * Used by two triggers: the watch-page summary button (`youtube.ts`), and the auto-summary tab that
     * the off-page thumbnail button opens for gated videos (`auto-summarize.ts`). Keeping it here (rather
     * than in `youtube.ts`) avoids an import cycle with `auto-summarize.ts`.
     */
    /** Reads the current video's title from the watch page, falling back to the document title. */
    function getVideoTitle() {
        var _a, _b;
        const fromMeta = (_b = (_a = document.querySelector("ytd-watch-metadata h1")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
        if (fromMeta)
            return fromMeta;
        return document.title.replace(/\s*-\s*YouTube\s*$/, "").trim();
    }
    /**
     * Captures the current watch page's subtitles and stashes a payload for the AI provider tab, then
     * opens that tab. Assumes we're on a watch page with the player available.
     *
     * @returns `true` if a summary was handed off; `false` if the video has no captions (the user is
     *   notified of that expected condition, but it is not counted as a failure).
     * @throws if capture itself fails (the caller is expected to report the error).
     */
    function captureAndHandoff() {
        return __awaiter(this, void 0, void 0, function* () {
            const cfg = config.getData();
            const preferredLangs = cfg.preferredLangs.split(",").map(s => s.trim()).filter(Boolean);
            const result = yield getCurrentSubtitles(preferredLangs.length > 0 ? { preferredLangs } : {});
            if (!result) {
                // No captions is an expected outcome, not a failure: notify without counting it toward the
                // repeated-failure escalation (which would wrongly prompt the user to file an issue).
                warn("No captions are available for this video.");
                notify(t("error.noCaptions"));
                return false;
            }
            log(`Captured ${result.segments.length} subtitle lines `
                + `(${result.trackName}, lang=${result.lang}, via ${result.source}).`);
            yield stashSummaryPayload({
                prompt: buildPrompt(result, cfg.promptTemplate, cfg.includeTimestamps, getVideoTitle(), location.href),
                autoSubmit: cfg.autoSubmit,
                title: getVideoTitle(),
                createdAt: Date.now(),
            });
            openInTab(getProviderById(cfg.provider).newChatUrl, false); // foreground the AI provider tab
            return true;
        });
    }

    /**
     * "Auto-summary tab" — the off-page path for gated videos (member-only / age-restricted) that the
     * unauthenticated ANDROID player can't reach.
     *
     * Instead of navigating the user's current tab (which loses their feed scroll position), we open the
     * video's watch page in a *new* tab carrying a `#yfas-autosummarize` marker. That tab has the real,
     * session-authenticated player — so member content and correctly-bound PoTokens just work — detects
     * the marker on load, runs the normal on-page capture, hands off to the AI provider, and then closes
     * itself. The user's original tab is never touched.
     */
    /** URL-hash marker identifying a watch tab we opened to auto-summarize. */
    const marker = "yfas-autosummarize";
    /**
     * Opens `videoId`'s watch page in a new tab that will auto-summarize itself and close. Opened in the
     * foreground so the player runs without background-tab throttling and any failure stays visible; the
     * user's current (feed) tab keeps its scroll position because it is never navigated.
     */
    function openAutoSummaryTab(videoId) {
        openInTab(`${watchUrl(videoId)}#${marker}`, false);
    }
    /** Whether this page load is an auto-summary request (a watch page we opened with the marker). */
    function isAutoSummaryRequest() {
        return location.pathname.startsWith("/watch") && location.hash.includes(marker);
    }
    /** Closes the current tab (best-effort — some managers restrict closing script-opened tabs). */
    function closeSelfTab() {
        try {
            window.close();
        }
        catch (err) {
            warn("could not auto-close the summary tab:", err);
        }
    }
    /**
     * Runs in an auto-summary tab: waits for the player, captures + hands off, then closes the tab.
     * On failure the tab is left open so the reported error stays visible. `config` must already be loaded.
     */
    function runAutoSummary() {
        return __awaiter(this, void 0, void 0, function* () {
            // Strip our marker from the URL so it doesn't leak into the prompt's {{url}} or linger in history.
            try {
                history.replaceState(null, "", location.pathname + location.search);
            }
            catch ( /* replaceState unavailable — harmless, the marker just stays in the URL */_a) { /* replaceState unavailable — harmless, the marker just stays in the URL */ }
            log("Auto-summary tab: waiting for the player, then capturing…");
            let handedOff = false;
            try {
                yield waitForSelector("#movie_player", 20000);
                handedOff = yield captureAndHandoff();
            }
            catch (err) {
                error("Auto-summary capture failed:", err);
                void reportFailure({ context: "youtube:auto-summary-error" });
            }
            if (handedOff)
                closeSelfTab();
        });
    }

    /** Options that are applied to every SelectorObserver instance */
    const defaultObserverOptions = {
        defaultDebounce: 100,
        defaultDebounceEdge: "rising",
        subtree: false,
    };
    /** Global SelectorObserver instances usable throughout the script for improved performance */
    const globservers = {};
    /** Call after DOM load to initialize all SelectorObserver instances */
    function initObservers() {
        try {
            //#region body
            // -> the entire <body> element - use sparingly due to performance impacts!
            globservers.body = new userutils.SelectorObserver(document.body, Object.assign(Object.assign({}, defaultObserverOptions), { defaultDebounce: 150 }));
            globservers.body.enable();
        }
        catch (err) {
            error("Failed to initialize observers:", err);
        }
    }

    /**
     * Inline SVG icons used in the UI. Inline (rather than image resources) so they scale crisply
     * and inherit the button's text color via `currentColor`, adapting to YouTube's light/dark theme.
     */
    /** "AI summarize" sparkle: one large four-point star plus two small ones. */
    const sparkleIcon = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
  <path d="M11 3l1.6 4.4L17 9l-4.4 1.6L11 15l-1.6-4.4L5 9l4.4-1.6L11 3z"/>
  <path d="M18 12l.8 2.2L21 15l-2.2.8L18 18l-.8-2.2L15 15l2.2-.8L18 12z"/>
  <path d="M5.5 14l.6 1.7L8 16.3l-1.9.6L5.5 19l-.6-2.1L3 16.3l1.9-.6L5.5 14z"/>
</svg>`.trim();
    /**
     * Spinning loading indicator: a ~270° arc drawn with `currentColor`. Rotation comes from the
     * `yfas-spin` CSS keyframes applied to its container while a summary is in progress.
     */
    const loadingIcon = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
  <path d="M12 3a9 9 0 1 0 6.4 2.65"/>
</svg>`.trim();
    /** Standard settings gear/cog. */
    const gearIcon = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
  <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.3 7.3 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.4 2h-2.8a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.81 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.69.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.54c.05.24.25.42.49.42h2.8c.24 0 .45-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.26.12.55.02.69-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"/>
</svg>`.trim();

    /**
     * Settings panel (modal) for the YouTube side, opened from the button's gear half.
     * Reads/writes the persisted {@linkcode config} DataStore.
     */
    const overlayId = "yfas-settings-overlay";
    const styleRef = "yfas-settings";
    /** Opens the settings modal, prefilled from the current config. */
    function openSettings() {
        const data = config.getData();
        const handle = openModal({
            id: overlayId,
            label: t("settings.dialogLabel"),
            // Text lives in the locale dictionaries; markup carries `data-i18n*` hooks filled by `localize()`
            // below, so the whole panel can be re-rendered in another language without rebuilding it.
            innerHtml: `
      <h2 class="yfas-modal-title" data-i18n="settings.title"></h2>

      <label class="yfas-field">
        <span class="yfas-field-label" data-i18n="settings.provider.label"></span>
        <span class="yfas-field-hint" data-i18n="settings.provider.hint"></span>
        <select class="yfas-input" data-field="provider"></select>
        <span class="yfas-provider-note" data-role="provider-note"></span>
      </label>

      <label class="yfas-field">
        <span class="yfas-field-label" data-i18n="settings.language.label"></span>
        <span class="yfas-field-hint" data-i18n="settings.language.hint"></span>
        <select class="yfas-input" data-field="language">
          <option value="${AUTO_LANG}" data-i18n="settings.language.auto"></option>
          ${supportedLanguages.map(l => `<option value="${l.code}">${l.label}</option>`).join("")}
        </select>
      </label>

      <label class="yfas-field">
        <span class="yfas-field-label" data-i18n="settings.prompt.label"></span>
        <span class="yfas-field-hint" data-i18n-html="settings.prompt.hint"></span>
        <textarea class="yfas-input yfas-textarea" data-field="promptTemplate" rows="8"></textarea>
      </label>

      <label class="yfas-field">
        <span class="yfas-field-label" data-i18n="settings.langs.label"></span>
        <span class="yfas-field-hint" data-i18n-html="settings.langs.hint"></span>
        <input type="text" class="yfas-input" data-field="preferredLangs" data-i18n-placeholder="settings.langs.placeholder" />
      </label>

      <label class="yfas-check">
        <input type="checkbox" data-field="includeTimestamps" />
        <span data-i18n-html="settings.timestamps"></span>
      </label>

      <label class="yfas-check">
        <input type="checkbox" data-field="autoSubmit" />
        <span data-i18n="settings.autoSubmit"></span>
      </label>

      <div class="yfas-actions">
        <button type="button" class="yfas-modal-btn yfas-modal-btn--secondary" data-action="reset" data-i18n="settings.reset"></button>
        <span class="yfas-spacer"></span>
        <button type="button" class="yfas-modal-btn yfas-modal-btn--secondary" data-action="cancel" data-i18n="settings.cancel"></button>
        <button type="button" class="yfas-modal-btn yfas-modal-btn--primary" data-action="save" data-i18n="settings.save"></button>
      </div>`,
        });
        if (!handle)
            return; // already open
        if (!document.getElementById(`global-style-${styleRef}`))
            addStyle(settingsStyle, styleRef);
        const { overlay, close } = handle;
        const providerEl = overlay.querySelector("[data-field='provider']");
        const providerNoteEl = overlay.querySelector("[data-role='provider-note']");
        const languageEl = overlay.querySelector("[data-field='language']");
        const promptEl = overlay.querySelector("[data-field='promptTemplate']");
        const langEl = overlay.querySelector("[data-field='preferredLangs']");
        const tsEl = overlay.querySelector("[data-field='includeTimestamps']");
        const autoEl = overlay.querySelector("[data-field='autoSubmit']");
        // The raw language setting the user has picked (persisted verbatim: `"auto"` or a locale code) and
        // the concrete locale it currently resolves to (used to render the panel and provider note).
        let selectedLangSetting = data.language;
        let previewLang = resolveLanguage(selectedLangSetting);
        /** Rebuilds the provider `<option>`s in `lang` (only the "(recommended)" suffix is translated). */
        const buildProviderOptions = (lang) => {
            const selected = providerEl.value || data.provider;
            setInnerHtml(providerEl, providers
                .map(p => `<option value="${p.id}">${p.label}${p.recommended ? translate(lang, "settings.provider.recommended") : ""}</option>`)
                .join(""));
            providerEl.value = selected;
        };
        /** True when the prompt box still shows a built-in default (so it should track the language). */
        const promptIsDefault = () => promptEl.value.trim() === "" || promptEl.value.trim() === translate(previewLang, "prompt.default").trim();
        /** Renders every translatable part of the panel in `lang` (static labels + the dynamic bits). */
        const localize = (lang) => {
            applyI18n(overlay, setInnerHtml, lang);
            buildProviderOptions(lang);
            providerNoteEl.textContent = translate(lang, getProviderById(providerEl.value).note);
        };
        // Prefill from config, then localize.
        languageEl.value = selectedLangSetting;
        promptEl.value = data.promptTemplate.trim() ? data.promptTemplate : translate(previewLang, "prompt.default");
        langEl.value = data.preferredLangs;
        tsEl.checked = data.includeTimestamps;
        autoEl.checked = data.autoSubmit;
        localize(previewLang);
        // Keep the provider note in sync with the dropdown.
        providerEl.addEventListener("change", () => {
            providerNoteEl.textContent = translate(previewLang, getProviderById(providerEl.value).note);
        });
        // Switching the interface language re-renders the panel live. If the prompt is still an unmodified
        // default, swap it to the newly selected language's default too (per the "auto-switch" behaviour).
        languageEl.addEventListener("change", () => {
            const wasDefaultPrompt = promptIsDefault();
            selectedLangSetting = languageEl.value;
            previewLang = resolveLanguage(selectedLangSetting);
            localize(previewLang);
            if (wasDefaultPrompt)
                promptEl.value = translate(previewLang, "prompt.default");
        });
        overlay.querySelector("[data-action='cancel']").addEventListener("click", close);
        overlay.querySelector("[data-action='reset']").addEventListener("click", () => {
            providerEl.value = defaultProvider.id;
            selectedLangSetting = AUTO_LANG;
            languageEl.value = AUTO_LANG;
            previewLang = resolveLanguage(AUTO_LANG);
            localize(previewLang);
            promptEl.value = translate(previewLang, "prompt.default");
            langEl.value = "";
            tsEl.checked = true;
            autoEl.checked = true;
        });
        overlay.querySelector("[data-action='save']").addEventListener("click", () => {
            void config.setData({
                language: selectedLangSetting,
                provider: providerEl.value,
                // Empty = follow the language; store "" when the box still shows a built-in default.
                promptTemplate: promptIsDefault() ? "" : promptEl.value,
                preferredLangs: langEl.value.trim(),
                includeTimestamps: tsEl.checked,
                autoSubmit: autoEl.checked,
            });
            // Apply the chosen language immediately so the rest of the page updates without a reload.
            // `previewLang` already holds resolveLanguage(selectedLangSetting) (kept in sync above).
            if (previewLang !== getActiveLanguage()) {
                setActiveLanguage(previewLang);
                window.dispatchEvent(new Event("yfas-lang-changed"));
            }
            close();
        });
        promptEl.focus();
    }
    const settingsStyle = `
.yfas-field {
  display: block;
  margin-bottom: 16px;
}
.yfas-field-label {
  display: block;
  font-size: 1.4rem;
  font-weight: 500;
  margin-bottom: 4px;
}
.yfas-field-hint {
  display: block;
  font-size: 1.2rem;
  opacity: 0.7;
  margin-bottom: 6px;
}
.yfas-field-hint code,
.yfas-check code {
  font-family: monospace;
  background: var(--yt-spec-badge-chip-background, rgba(0, 0, 0, 0.08));
  padding: 1px 4px;
  border-radius: 4px;
}
.yfas-input {
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
select.yfas-input {
  cursor: pointer;
  appearance: auto;
}
.yfas-provider-note {
  display: block;
  margin-top: 6px;
  font-size: 1.2rem;
  line-height: 1.5;
  opacity: 0.85;
  color: var(--yt-spec-text-secondary, inherit);
}
.yfas-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: monospace;
  line-height: 1.4;
}
.yfas-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.4rem;
  margin-bottom: 12px;
  cursor: pointer;
}
.yfas-check input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.yfas-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}
.yfas-spacer {
  flex: 1;
}
`;

    /**
     * Off-page summary trigger: a small sparkle button that fades in over any video thumbnail (home,
     * search, related, channel, …). Clicking it summarizes that video without the user opening it.
     *
     * Public videos are captured entirely off-page via the ANDROID InnerTube player (`remote-subtitles.ts`).
     * Gated videos (member-only / age-restricted), which that unauthenticated player can't reach, fall
     * back to a new auto-summary tab that captures with the user's real session (`auto-summarize.ts`).
     */
    /** Class of the injected overlay button, also used to guard against double-injection. */
    const btnClass = "yfas-thumb-btn";
    /** Class placed on the thumbnail anchor that hosts a button, so CSS can reveal it on hover. */
    const hostClass = "yfas-thumb-host";
    /** Dataset flag marking an anchor we've already processed (whether or not a button was added). */
    const processedFlag = "yfasThumb";
    /**
     * Thumbnail anchors across YouTube's list surfaces. Classic renderers use `a#thumbnail`; the newer
     * `*ViewModel` lockups use camelCase content-image classes (`ytLockupViewModelContentImage` for
     * videos, `reel-item-endpoint` for Shorts). We deliberately target the *image* anchor, not the
     * metadata/title link, so the button lands on the positioned thumbnail box (where the duration badge
     * sits) — a reliable containing block for our absolutely-placed button. YouTube renames these often,
     * so this list is best-effort and expected to drift.
     */
    const thumbnailAnchorSelector = [
        "a#thumbnail",
        "a.ytd-thumbnail",
        "a.ytLockupViewModelContentImage", // current lockup (home/search/related feed)
        "a.reel-item-endpoint", // current Shorts lockup thumbnail
        "a.yt-lockup-view-model-wiz__content-image", // older lockup (kept for compatibility)
    ].join(", ");
    /** Extracts a video id from a thumbnail anchor's href (watch / shorts / live / embed forms). */
    function videoIdFromHref(href) {
        try {
            const u = new URL(href, location.origin);
            const v = u.searchParams.get("v");
            if (v)
                return v;
            const path = u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{6,})/);
            return path ? path[1] : null;
        }
        catch (_a) {
            return null;
        }
    }
    /** Default label / tooltip for an overlay button, naming the currently selected provider. */
    const buttonLabel = () => t("button.summarizeWith", getProviderById(config.getData().provider).label);
    /** Injects the overlay button into a thumbnail anchor the first time it's hovered. */
    function injectButton(anchor) {
        if (anchor.dataset[processedFlag])
            return;
        anchor.dataset[processedFlag] = "1";
        const videoId = videoIdFromHref(anchor.href);
        if (!videoId)
            return; // playlist/channel/other non-video thumbnail
        anchor.classList.add(hostClass);
        const btn = document.createElement("div");
        btn.className = btnClass;
        // A div with role=button (rather than a <button>) avoids nesting interactive content inside the
        // thumbnail's <a>; onInteraction gives it click + keyboard activation and stops the anchor from
        // navigating when it's pressed.
        btn.setAttribute("role", "button");
        btn.setAttribute("tabindex", "0");
        const label = buttonLabel();
        btn.title = label;
        btn.setAttribute("aria-label", label);
        setInnerHtml(btn, sparkleIcon);
        onInteraction(btn, () => void onThumbClick(btn, videoId));
        anchor.appendChild(btn);
    }
    /** Toggles an overlay button's busy state: swaps the sparkle for the spinner and blocks re-clicks. */
    function setBusy$1(btn, busy) {
        btn.classList.toggle("yfas-busy", busy);
        setInnerHtml(btn, busy ? loadingIcon : sparkleIcon);
    }
    /**
     * Summarizes a thumbnail's video. Tries the fast ANDROID InnerTube player first (fully off-page,
     * covers public videos). If that throws, the video is gated (member-only / age-restricted) — the
     * unauthenticated player exposed no tracks — so we open a new auto-summary tab that captures it with
     * the user's real session and closes itself. A `null` from the fast path means "genuinely no captions".
     */
    function onThumbClick(btn, videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (btn.classList.contains("yfas-busy"))
                return;
            setBusy$1(btn, true);
            try {
                const cfg = config.getData();
                const preferredLangs = cfg.preferredLangs.split(",").map(s => s.trim()).filter(Boolean);
                const opts = preferredLangs.length > 0 ? { preferredLangs } : {};
                let result;
                try {
                    result = yield getSubtitlesForVideo(videoId, opts);
                }
                catch (err) {
                    // Gated video: open a new tab that captures it with the user's real session and closes itself.
                    // The user's feed tab stays put (scroll position preserved).
                    warn(`ANDROID off-page capture failed for ${videoId}; opening an auto-summary tab:`, err);
                    openAutoSummaryTab(videoId);
                    return;
                }
                if (!result) {
                    // No captions is an expected outcome, not a failure: just tell the user, without counting it
                    // toward the repeated-failure escalation (which would wrongly prompt them to file an issue).
                    warn(`No captions are available for video ${videoId}.`);
                    notify(t("error.noCaptions"));
                    return;
                }
                log(`Captured ${result.segments.length} subtitle lines off-page for ${videoId} `
                    + `(${result.trackName}, lang=${result.lang}).`);
                yield stashSummaryPayload({
                    prompt: buildPrompt(result, cfg.promptTemplate, cfg.includeTimestamps, result.videoTitle || videoId, result.videoUrl),
                    autoSubmit: cfg.autoSubmit,
                    title: result.videoTitle,
                    createdAt: Date.now(),
                });
                openInTab(getProviderById(cfg.provider).newChatUrl, false);
            }
            catch (err) {
                error(`Failed to summarize video ${videoId} off-page:`, err);
                void reportFailure({ context: "youtube:thumbnail:capture-error" });
            }
            finally {
                setBusy$1(btn, false);
            }
        });
    }
    /** Lazily injects a button when the pointer first enters a thumbnail (handles infinite scroll for free). */
    function onPointerOver(e) {
        var _a;
        const target = e.target;
        const anchor = (_a = target === null || target === void 0 ? void 0 : target.closest) === null || _a === void 0 ? void 0 : _a.call(target, thumbnailAnchorSelector);
        if (anchor)
            injectButton(anchor);
    }
    /** Re-applies the current interface language to all already-injected overlay buttons. */
    function relabelButtons() {
        const label = buttonLabel();
        for (const btn of document.querySelectorAll(`.${btnClass}`)) {
            btn.title = label;
            btn.setAttribute("aria-label", label);
        }
    }
    /** Registers the thumbnail overlay. Call once on the YouTube side after DOM load. */
    function initThumbnailButtons() {
        addStyle(thumbnailStyle, "yfas-thumb");
        // Event delegation over the whole body: cheaper than observing every list container, and it
        // naturally covers thumbnails added later by SPA navigation and infinite scroll.
        document.body.addEventListener("pointerover", onPointerOver, { capture: true, passive: true });
        window.addEventListener("yfas-lang-changed", relabelButtons);
    }
    const thumbnailStyle = `
.${hostClass} {
  position: relative;
}
.${btnClass} {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  padding: 5px;
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, 0.72);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s ease, background 0.12s ease;
}
.${btnClass}:hover {
  background: rgba(0, 0, 0, 0.92);
}
.${btnClass} svg {
  width: 100%;
  height: 100%;
  display: block;
}
.${hostClass}:hover .${btnClass},
.${btnClass}:focus-visible {
  opacity: 1;
}
.${btnClass}.yfas-busy {
  opacity: 1;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.88);
}
.${btnClass}.yfas-busy svg {
  animation: yfas-spin 0.8s linear infinite;
}
@keyframes yfas-spin {
  to { transform: rotate(360deg); }
}
`;

    /**
     * YouTube-side logic: injects the summary button into the watch page's action row
     * (next to Share / Save) and triggers subtitle capture when clicked.
     */
    /** id of the injected button, used to avoid inserting duplicates. */
    const btnId = "yfas-summary-btn";
    /**
     * The like/dislike segmented button. We anchor to this element (rather than the action-row
     * container) and insert immediately to its left, so the button stays put across responsive
     * reflows that move or collapse items in the action row.
     */
    const likeDislikeSelector = "ytd-watch-metadata segmented-like-dislike-button-view-model";
    /** Observes the action row so the button can be re-inserted while YouTube re-stamps it; see {@linkcode reconcileButton}. */
    let rowObserver;
    /** Steady-state countdown; the button is deemed stable once it survives this without re-insertion. */
    let settleTimer;
    /** How long the button must stay put before the row counts as settled and we stop observing. */
    const settleMs = 2500;
    /** Registers the button injection. Call once on the YouTube side after DOM load. */
    function initYoutube() {
        addStyle(buttonStyle, "yfas-button");
        // Off-page trigger: sparkle button on video thumbnails across list surfaces (home/search/related).
        initThumbnailButtons();
        // YouTube is a SPA and rebuilds the watch action row asynchronously after each navigation, so we
        // re-sync every navigation rather than inserting just once.
        window.addEventListener("yt-navigate-finish", syncButtonForPage);
        // Re-label the button in place when the user changes the interface language in settings.
        window.addEventListener("yfas-lang-changed", relabelButton);
        syncButtonForPage();
    }
    /** Whether the current location is a page that should carry the summary button. */
    function isWatchPage() {
        return location.pathname.startsWith("/watch") || location.pathname.startsWith("/live/");
    }
    /** On watch pages, start observing and try to insert; elsewhere, stop. */
    function syncButtonForPage() {
        if (!isWatchPage()) {
            stopObserving();
            return;
        }
        observeRow();
        reconcileButton();
    }
    /** (Re)connects the observer to the watch container so {@linkcode reconcileButton} runs on every row rebuild. */
    function observeRow() {
        var _a;
        const target = (_a = document.querySelector("ytd-watch-flexy")) !== null && _a !== void 0 ? _a : document.body;
        rowObserver !== null && rowObserver !== void 0 ? rowObserver : (rowObserver = new MutationObserver(userutils.debounce(reconcileButton, 150)));
        rowObserver.disconnect();
        rowObserver.observe(target, { childList: true, subtree: true });
    }
    /** Disconnects the row observer and cancels any pending steady-state check. */
    function stopObserving() {
        rowObserver === null || rowObserver === void 0 ? void 0 : rowObserver.disconnect();
        rowObserver = undefined;
        clearTimeout(settleTimer);
        settleTimer = undefined;
    }
    /**
     * Inserts the button if it's missing. YouTube re-stamps the action row a few times after navigation,
     * discarding our button each time, so each re-insertion restarts the settle countdown; the row is
     * treated as settled (and observing stops) once the button survives it.
     */
    function reconcileButton() {
        var _a, _b;
        if (!isWatchPage())
            return;
        if ((_a = document.getElementById(btnId)) === null || _a === void 0 ? void 0 : _a.isConnected)
            return;
        const anchor = document.querySelector(likeDislikeSelector);
        if (anchor)
            addSummaryButton(anchor);
        if ((_b = document.getElementById(btnId)) === null || _b === void 0 ? void 0 : _b.isConnected)
            scheduleSettleCheck();
    }
    /** (Re)starts the steady-state countdown: if the button is still in place when it fires, stop observing. */
    function scheduleSettleCheck() {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
            var _a;
            if ((_a = document.getElementById(btnId)) === null || _a === void 0 ? void 0 : _a.isConnected)
                stopObserving();
        }, settleMs);
    }
    /** Re-applies the current interface language to an already-injected button (after a language change). */
    function relabelButton() {
        const split = document.getElementById(btnId);
        if (!split)
            return;
        const mainBtn = split.querySelector(".yfas-main");
        if (mainBtn) {
            const textEl = mainBtn.querySelector(".ytSpecButtonShapeNextButtonTextContent");
            if (textEl)
                textEl.textContent = t("button.label");
            setAvailable(mainBtn, !mainBtn.disabled); // re-applies title/aria in the new language for the current state
        }
        const gearBtn = split.querySelector(".yfas-settings");
        if (gearBtn) {
            gearBtn.title = t("button.settings");
            gearBtn.setAttribute("aria-label", t("button.settings"));
        }
    }
    /** Shared YouTube button-shape classes so our button inherits the native (visible) styling. */
    const shapeBase = "ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ytSpecButtonShapeNextSizeM";
    /**
     * Inserts a segmented button immediately to the left of the like/dislike button, mirroring
     * YouTube's own segmented button: the left segment (sparkle + label) runs the summary, the right
     * segment (gear) opens settings. Reuses YouTube's `ytSpecButtonShapeNext*` classes so it matches.
     */
    function addSummaryButton(likeDislike) {
        const parent = likeDislike.parentElement;
        if (!parent || parent.querySelector(`#${btnId}`))
            return;
        const split = document.createElement("div");
        split.id = btnId;
        split.className = "yfas-split";
        setInnerHtml(split, `
    <button class="yfas-main ${shapeBase} ytSpecButtonShapeNextIconLeading ytSpecButtonShapeNextSegmentedStart" title="${enabledLabel()}" aria-label="${enabledLabel()}">
      <div aria-hidden="true" class="ytSpecButtonShapeNextIcon">${sparkleIcon}</div>
      <div class="ytSpecButtonShapeNextButtonTextContent">${t("button.label")}</div>
    </button>
    <button class="yfas-settings ${shapeBase} ytSpecButtonShapeNextIconButton ytSpecButtonShapeNextSegmentedEnd" title="${t("button.settings")}" aria-label="${t("button.settings")}">
      <div aria-hidden="true" class="ytSpecButtonShapeNextIcon">${gearIcon}</div>
    </button>`);
        const mainBtn = split.querySelector(".yfas-main");
        const gearBtn = split.querySelector(".yfas-settings");
        onInteraction(mainBtn, () => void onSummaryClick(mainBtn));
        onInteraction(gearBtn, () => openSettings());
        likeDislike.before(split);
        void watchCaptionAvailability(mainBtn);
    }
    /** Default (enabled) label / tooltip for the summary button, naming the currently selected provider. */
    const enabledLabel = () => t("button.summarizeWith", getProviderById(config.getData().provider).label);
    /** Label / tooltip shown while the button is greyed out because the video has no captions. */
    const noCaptionsLabel = () => t("button.noCaptions");
    /**
     * Greys out the summary button until captions are detected for the current video. The player
     * response can lag behind button insertion, so we poll: enable as soon as a track appears, and
     * settle on the disabled state only if none shows up within the timeout.
     */
    function watchCaptionAvailability(mainBtn_1) {
        return __awaiter(this, arguments, void 0, function* (mainBtn, timeoutMs = 10000, intervalMs = 400) {
            setAvailable(mainBtn, false);
            const start = Date.now();
            while (mainBtn.isConnected && Date.now() - start < timeoutMs) {
                if (hasCaptionsAvailable()) {
                    setAvailable(mainBtn, true);
                    return;
                }
                yield new Promise(r => setTimeout(r, intervalMs));
            }
        });
    }
    /**
     * Toggles the summary button between its normal and greyed-out (no-captions) states. The native
     * `disabled` attribute blocks the click without any JS guard, while the `title` tooltip still
     * surfaces on hover so the user learns why it is greyed out. `aria-disabled` mirrors the state for
     * assistive tech.
     */
    function setAvailable(mainBtn, available) {
        mainBtn.classList.toggle("yfas-disabled", !available);
        mainBtn.disabled = !available;
        mainBtn.setAttribute("aria-disabled", String(!available));
        const label = available ? enabledLabel() : noCaptionsLabel();
        mainBtn.title = label;
        mainBtn.setAttribute("aria-label", label);
    }
    /** Captures the current video's subtitles when the button is pressed. */
    function onSummaryClick(btn) {
        return __awaiter(this, void 0, void 0, function* () {
            const iconEl = btn.querySelector(".ytSpecButtonShapeNextIcon");
            setBusy(btn, iconEl, true);
            try {
                yield captureAndHandoff();
                // Success: restore silently (handled in finally), no extra indicator.
            }
            catch (err) {
                error("Failed to capture subtitles:", err);
                void reportFailure({ context: "youtube:capture-error" });
            }
            finally {
                setBusy(btn, iconEl, false);
            }
        });
    }
    /** Toggles the button's busy state: dims it and swaps the sparkle icon for the spinner (or back). */
    function setBusy(btn, iconEl, busy) {
        btn.classList.toggle("yfas-busy", busy);
        if (!iconEl)
            return;
        iconEl.classList.toggle("yfas-spin", busy);
        setInnerHtml(iconEl, busy ? loadingIcon : sparkleIcon);
    }
    const buttonStyle = `
.yfas-split {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-right: 8px;
  vertical-align: middle;
}
.yfas-split .ytSpecButtonShapeNextIcon svg {
  width: 100%;
  height: 100%;
  display: block;
}
.yfas-main.yfas-busy {
  opacity: 0.6;
  pointer-events: none;
}
.yfas-main.yfas-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.yfas-split .ytSpecButtonShapeNextIcon.yfas-spin {
  animation: yfas-spin 0.8s linear infinite;
}
@keyframes yfas-spin {
  to { transform: rotate(360deg); }
}
`;

    /** Runs when the userscript is loaded initially */
    function init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Must run at document-start, before the YouTube player issues its timedtext requests.
            if (location.hostname.endsWith("youtube.com"))
                installTimedtextInterceptor();
            yield initConfig();
            // Resolve the interface language now that the saved config (and its `language` field) is loaded.
            initI18n(config.getData().language);
            if (domLoaded)
                run();
            else
                document.addEventListener("DOMContentLoaded", run);
        });
    }
    /** Runs after the DOM is available */
    function run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                log(`Initializing ${scriptInfo.name} v${scriptInfo.version} (#${buildNumber})...`);
                // A watch tab we opened to summarize a gated video (see auto-summarize.ts): capture + close, no UI.
                if (location.hostname.endsWith("youtube.com") && isAutoSummaryRequest()) {
                    void runAutoSummary();
                    return;
                }
                // post-build these double quotes are replaced by backticks (because if backticks are used here, the bundler converts them to double quotes)
                addStyle("#{{GLOBAL_STYLE}}", "global");
                registerDevCommands();
                initObservers();
                // The script matches YouTube and every supported AI provider - run only the relevant side.
                if (location.hostname.endsWith("youtube.com")) {
                    initYoutube();
                }
                else {
                    const provider = getProviderByHost(location.hostname);
                    if (provider)
                        void initProviderTarget(provider);
                }
            }
            catch (err) {
                error("Fatal error:", err);
                return;
            }
        });
    }
    /** Registers development-only menu commands. `GM.registerMenuCommand` is only granted in dev builds. */
    function registerDevCommands() {
        if (mode !== "development")
            return;
        GM.registerMenuCommand(t("dev.clearFailures"), () => __awaiter(this, void 0, void 0, function* () {
            yield clearFailureCount();
            log("Failure counter cleared.");
        }));
    }
    init();

})(UserUtils);
