import {existsSync} from 'node:fs';
import {chromium} from 'playwright';

// Use an isolated browser profile; never attach to the user's browser session.
export function browserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    chromium.executablePath(),
    process.platform === 'darwin' && '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    process.platform === 'linux' && '/usr/bin/google-chrome',
    process.platform === 'linux' && '/usr/bin/chromium',
    process.platform === 'win32' && `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`
  ];
  const found = candidates.find(p => p && existsSync(p));
  if (!found) throw new Error('找不到測試瀏覽器。請先執行 npx playwright install chromium，或設定 CHROME_PATH。');
  return found;
}
export async function launchBrowser() {
  return chromium.launch({headless:true, executablePath:browserExecutable()});
}
