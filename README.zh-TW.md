# YouTube Free AI Summary

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![zh-TW](https://img.shields.io/badge/lang-zh--TW-green.svg)](README.zh-TW.md)

---

**YouTube Free AI Summary** 是一款 Tampermonkey / Violentmonkey userscript，會在 YouTube 上增加一個按鈕，擷取目前影片的字幕，並直接丟進新開的 AI 對話分頁——可自由選擇 Google AI Studio、Gemini、ChatGPT、Claude 或 Grok——讓你立刻進行總結。

它專門解決其他總結腳本會遇到的兩個問題：無法從頁面外部抓到的字幕，以及因為把字幕夾帶在網址中而被截斷的提詞。

## 功能特色

- **擷取頁面字幕** — 直接讀取頁面當下已經取得的字幕，而不是從外部 API 抓取，因此在外部工具無法存取的受限、會員專屬或地區限定影片上依然可用
- **可選擇 AI 服務** — 可將字幕送到你偏好的 AI：Google AI Studio、Gemini、ChatGPT、Claude 或 Grok，於設定視窗中挑選
- **沒有字數上限** — 將字幕直接填入 AI 的輸入框，而非透過網址參數傳遞，避免其他腳本會遇到的字數截斷問題
- **完全免費** — 不需要 API 金鑰、也不需要付費服務，你只需要登入所選的 AI 服務
- **一鍵完成** — 在 YouTube 播放頁面加上一個按鈕，按下後即可擷取字幕並為你開啟所選的 AI
- **在觀看頁面外摘要** — 將滑鼠移到任何影片縮圖（首頁、搜尋、相關影片、頻道頁）就會浮現一顆星形按鈕，不必先開啟影片即可摘要。公開影片直接在頁面外即時完成；會員專屬與年齡限制影片則會用你的登入狀態，在新分頁短暫開啟、自動摘要後關閉，完全不動到你目前的頁面

## 開發藍圖

規劃中的功能與修復：

- **修復進出頁面按鈕沒生成問題** — YouTube 換頁不會整頁重新載入，進出觀看頁面時按鈕有時未能正確（重新）生成
- **擴充元件版本** — 除了 userscript，另提供打包的瀏覽器擴充功能

## 安裝方式

> 本專案目前仍在積極開發中，尚未提供正式安裝連結。

| 平台 | 連結 |
|------|------|
| GreasyFork（Tampermonkey / Violentmonkey） | 🚧 開發中 |
| OpenUserJS（Tampermonkey / Violentmonkey） | 🚧 開發中 |

## 開發

```bash
# 安裝依賴
npm install

# 開發模式（含熱重載）
npm run dev

# 生產建置（所有平台）
npm run build-prod
```

## 授權

本專案採用 [MIT License](./LICENSE.txt)。
