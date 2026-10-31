# Agile Sprint Lab · Projection

IAF Asia 2026（杭州）120 分鐘線下工作坊雙語投影系統（26 頁、13 個步驟，獨立單一 HTML 離線運行）。

## 專案結構

- `projection/Agile-Sprint-Lab-Projection.html`：打包後的獨立離線投影單檔（內嵌所有字體樣式、Logo、肖像與 WeChat/LinkedIn QR Code，雙擊即可離線使用）
- `projection/src/app.js`：投影片渲染、HOW 逐條點出、全域浮動計時器與快捷鍵控制
- `projection/src/styles.css`：1920×1080 自適應縮放與雙語排版系統
- `projection/src/slides.json`：26 個畫面（`P00`–`P25`）雙語內容資料
- `projection/index.template.html`：HTML 模板
- `projection/assets/`：內嵌圖片素材（`agility-logo.jpg`、`percy-cartoon.png`、`qr-wechat.png`、`qr-linkedin.png`）
- `projection/scripts/`：建置（`build.mjs`）、預覽伺服器（`serve.mjs`）與測試腳本（`test-local.mjs`）
- `projection/test/`：版面檢測與端到端自動化測試

## 常用指令

```powershell
# 打包產生單一離線 HTML 檔案
node projection/scripts/build.mjs

# 啟動本機預覽伺服器 (http://127.0.0.1:4173)
node projection/scripts/serve.mjs

# 執行完整自動化測試
node projection/scripts/test-local.mjs
```
