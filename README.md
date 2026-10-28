# Agile Sprint Lab

## 新版投影工具（規格 v1.1）

本機啟動：`npm ci` → `npm run dev`，開啟 http://127.0.0.1:4173 。

可直接下載並離線開啟 [新版單檔投影](projection/Agile-Sprint-Lab-Projection.html)。

26 頁、13 步驟、120 分鐘；雙語投影、活動與步驟倒數、單視窗引導者控制台、恢復進度與離線單檔。執行 `npm run build` 產生 `projection/dist/Agile-Sprint-Lab-Projection.html`。

操作與開發細節見 [新版投影工具說明](projection/README.md)，開發依據見 [HTML 規格 v1.1](Agile_Sprint_Lab_HTML_Spec_v1.md)。目前 Logo 原圖待補，投影暫用文字標題。

以下為保留的舊版工具說明。

## 舊版離線主持工具與網站

用於 IAF 工作坊的 120 分鐘引導工具，包含離線主持介面、英文逐字稿、計時器、獨立投影與本機海報成果牆。

## 直接離線使用

1. 下載本 repo（Code → Download ZIP）並解壓縮。
2. 用 Chrome 或 Edge 開啟 `Agile-Sprint-Lab-Offline.html`。
3. 在 Settings 設定主持人姓名與隊伍數，再選擇活動、啟動計時。
4. 按 Open projection，將新視窗移到投影螢幕。

不需要網路、伺服器、安裝套件或 ChatGPT 登入。完整腳本與樣式已嵌入單一 HTML。

紙本活動包括介紹卡、挑戰卡、紅綠點投票、海報及回饋牆。每隊一次處理一個挑戰，完成一張海報後，若時間允許再處理下一題。同隊可有多張海報。

離線版的照片需帶到主持人的電腦，再從 Poster gallery 匯入；其他手機無法直接上傳到這個本機 HTML。用 **Save backup** 保存場次與照片；**Export gallery** 可匯出內含照片的 HTML 成果檔。瀏覽器對本機檔案儲存的支援可能不同，離開前請保留備份。

詳細操作見 [離線操作說明](Agile-Sprint-Lab-Offline-Instructions.txt)。

## 檔案結構

| 檔案或資料夾 | 內容 |
| --- | --- |
| `Agile-Sprint-Lab-Offline.html` | 可直接開啟的完整離線工具 |
| `offline-source/` | 單檔 HTML 的產生器、CSS、JavaScript 與程式檢查 |
| `site/` | Vinext 網站原始碼，包含共用照片上傳、D1 與 R2 整合 |
| `Agile Sprint Lab Rundown and Facilitator Script.txt` | 120 分鐘 rundown 及英文主持稿 |
| `Agile Sprint Lab Website Plan.txt` | 網站規劃與現場限制 |
| `Agile Workshop Facilitation Framework & Guide.docx` | 原始工作坊參考文件 |

## 開發與檢查

使用現成離線 HTML 不需要 Node.js。修改原始碼後，可使用 Node.js 執行：

```sh
node offline-source/test.mjs
```

若要重新產生離線 HTML，先安裝 `site/` 的開發相依套件：

```sh
npm ci --prefix site
node offline-source/build.mjs
node offline-source/test.mjs
```

完整網站的設定、資料庫 migration 與開發方式見 [site/README.md](site/README.md)。託管網站使用 D1、R2 及 Sites 身分驗證，不能直接以靜態 GitHub Pages 執行後端。託管版本的存取設定與這個 GitHub repo 的可見性分開管理。

## 驗證範圍

離線檔案已通過獨立程式檢查，包括 120 分鐘內容、語法、計時、活動切換、範例投影片、同隊多張海報、隊伍篩選、投影訊息與儲存備援。開發用的內建瀏覽器禁止 `file://` 導航，因此直接開檔的完整瀏覽器流程仍需在主持人的 Chrome 或 Edge 演練。
