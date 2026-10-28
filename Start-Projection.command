#!/bin/zsh
set -eu
cd -- "${0:A:h}"
if ! command -v node >/dev/null 2>&1; then
  print '找不到 Node.js。仍可直接開啟 projection/Agile-Sprint-Lab-Projection.html 離線使用。'
  exit 1
fi
if [[ ! -d node_modules/qrcode-generator ]]; then
  print '尚未安裝開發依賴，請先執行 npm ci。離線使用不需安裝：直接開啟 projection/Agile-Sprint-Lab-Projection.html。'
  exit 1
fi
exec node projection/scripts/serve.mjs
