# YouTube Free Summary with Gemini

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![zh-TW](https://img.shields.io/badge/lang-zh--TW-green.svg)](README.zh-TW.md)

---

**YouTube Free Summary with Gemini** 是一款 Tampermonkey / Violentmonkey userscript，會在 YouTube 上增加一個按鈕，擷取目前影片的字幕，並直接丟進新開的 Google AI Studio（Gemini）分頁，讓你立刻進行總結。

它專門解決其他總結腳本會遇到的兩個問題：無法從頁面外部抓到的字幕，以及因為把字幕夾帶在網址中而被截斷的提詞。

## 功能特色

- **擷取頁面字幕** — 直接讀取頁面當下已經取得的字幕，而不是從外部 API 抓取，因此在外部工具無法存取的受限、會員專屬或地區限定影片上依然可用
- **沒有字數上限** — 將字幕直接交給 AI Studio，而非透過網址參數傳遞，避免其他腳本會遇到的字數截斷問題
- **完全免費** — 不需要 API 金鑰、也不需要付費服務，你只需要登入 Google AI Studio
- **一鍵完成** — 在 YouTube 播放頁面加上一個按鈕，按下後即可擷取字幕並為你開啟 AI Studio

## 開發藍圖

規劃中的功能與修復：

- **修復隱私視窗支援** — 目前按鈕在部分登出／隱私視窗情境下可能不會出現
- **多語系支援** — 介面多國語言化
- **不可用時反灰按鈕** — 當影片沒有可用字幕／翻譯時，將按鈕設為停用狀態
- **在觀看頁面外摘要** — 不需開啟完整播放頁即可觸發摘要（例如從縮圖或影片列表）
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
