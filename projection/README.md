# Agile Sprint Lab 投影工具

依 `Agile_Sprint_Lab_HTML_Spec_v1.md` v1.1 開發。26 個畫面、13 個步驟、原始活動配額 120 分鐘。與根目錄舊版離線主持工具、`site/` 網站分開維護。

## 本機開發與測試

需要 Node.js 22 或以上（CI 使用 24）。在儲存庫根目錄執行：

```sh
npm ci
npm run dev
```

開啟 http://127.0.0.1:4173 。此服務只監聽本機。修改原始碼後執行 `npm run build`，再重新整理瀏覽器；本版沒有自動熱更新。

完整自動測試只需一個指令，不必先啟動服務：

```sh
npm run test:e2e
```

測試會自動啟動獨立本機服務，完成核心、156 組版面、完整 120 分鐘虛擬流程、備份還原與離線匯出檢查，再關閉測試服務。若已安裝 Chrome，可直接使用；沒有可用瀏覽器時才需執行 `npx playwright install chromium`。可用 `CHROME_PATH` 指定瀏覽器執行檔。

結果在 `projection/reports/latest.html`；正常本機服務啟動後，也可開啟 http://127.0.0.1:4173/test-results 。macOS 可雙擊根目錄的 `Start-Projection.command` 啟動投影，或 `Test-Projection.command` 執行整套測試。逐步人工試用見 [本機測試指引](LOCAL-TEST.md)。

截圖、JSON 與 HTML 報告不加入 Git；CI 保存為 artifact。若只想跑個別測試，`npm test` 檢查核心，`npm run test:browser` 與 `npm run test:journey` 則需先啟動本機服務。

## 離線使用

```sh
npm run build
```

可直接使用本資料夾的 `Agile-Sprint-Lab-Projection.html`；重新建置同時更新此檔與 `projection/dist/Agile-Sprint-Lab-Projection.html`。以 Chrome 或 Edge 直接開啟單檔，不需啟動服務或連網。HTML 內含內容、CSS、JavaScript 與 QR 產生器；不使用 CDN、外部字型或背景請求。

- 在 P00 按「開始工作坊」啟動第一頁與全場計時。
- `→`／`←`、PageDown／PageUp：換頁並暫停，按 Space 再開始。
- `Shift＋→`／`Shift＋PageDown`：下一頁並開始。
- Space：開始／暫停；`+`／`-`：加減一分鐘。
- `F`：全螢幕；`P`：控制台；`T`：隱藏倒數。
- Esc：關閉控制台；全螢幕時依瀏覽器原生處理。
- 所有操作也可在控制台點擊。控制台會被投影，開啟不暫停計時。

倒數歸零不自動換頁。向前換頁時，未用時間列為待處理，不自動加到下一頁；控制台可重新排入、捨棄或轉移。返回舊頁只回看，按開始才重新排入。全場經過時間包含暫停與轉場，預估完成是假設後續連續執行的時間。

重新整理會嘗試恢復進度。僅開一個操作分頁。瀏覽器禁止本機檔案儲存或儲存空間不足時，仍可使用記憶體操作；關閉前從控制台匯出進度備份。毀損或不相容的舊資料不自動覆寫，可先下載原始備份後明確清除。清除進度需確認，會保留場次設定與 Logo。

## 設定與素材

控制台可改語言、組隊人數、場次日期與時區、目標結束、回饋牆標題及上傳網址。組隊預設 4–5 人；矩陣使用通用 N＝實際組員數，不宣稱各組票數相同。上傳網址空白時不顯示上傳指示與 QR；有效網址僅產生 QR 與連結，本工具不接收照片或提供上傳後端。

目前尚無原始公司 Logo，採文字呈現。將原圖放入 `projection/assets/IMG_5971.jpeg` 後重新 build 即可嵌入；也可在控制台載入原圖，再「匯出離線單檔」，將目前設定與 Logo 一起打包。圖像不重畫、不裁切、不改色。匯出 HTML 不攜帶本場進度；進度另用 JSON 備份。

只有 PDF 核實的 Percy Hsu／Agile Coach 身分預設投影，延伸簡介依規格待確認。

## 原始碼

- `src/slides.json`：逐頁雙語內容，可直接維護。
- `src/engine.js`：與 UI 分開的計時與流程狀態核心。
- `src/app.js`：投影、控制台、存取備援與無障礙互動。
- `src/styles.css`：1920×1080 邏輯畫布與等比縮放。
- `index.template.html`：HTML 骨架。
- `scripts/build.mjs`：打包單檔，不需要前端框架。
- `scripts/sync-content.py`：從規格重新產生內容，須明確執行；會覆寫 slides.json，請檢查 diff。特殊圖形與工具名稱在 app.js 維護。
- `test/`：狀態核心與瀏覽器測試。

## GitHub 與部署

在功能分支開發，透過 Pull Request 檢查後合併。GitHub Actions 使用同一套 `test:e2e` 驗證狀態核心、建置、瀏覽器版面、完整流程與離線檔案，並保存下載用 HTML。

目前本機與離線檔已能完成投影用途，不需雲端。`projection/Dockerfile` 提供後續容器部署入口，使用平台提供的 PORT；若要部署 Google Cloud Run，下一步再指定 GCP 專案、區域與存取範圍。此版本沒有部署雲端，也不包含雲端照片儲存功能。

QR Code 使用 qrcode-generator（MIT），依賴版本由根目錄 package-lock.json 鎖定；授權保留於建置檔的來源註解與 `vendor/`。
