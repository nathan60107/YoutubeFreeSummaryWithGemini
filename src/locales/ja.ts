import type { Translations } from "./en";

/** 日本語 (Japanese). */
export const ja: Translations = {
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
