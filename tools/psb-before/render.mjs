/**
 * Cleans the "before" screens of the PSB cashback flow for the iPhone body on the case page:
 * an iOS status bar and home indicator instead of Android's bars, no red highlight boxes from
 * the scenario, a made-up address instead of the scribbled-out one. Sources in src/ are the
 * screens of the PSB Figma file, section "Пользователь подключает кешбэк" (node 28-489), 590×1280.
 *
 *   node tools/psb-before/render.mjs
 *
 * Needs Playwright: `npm i --no-save playwright` (CHROMIUM_PATH picks a browser binary).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '../../public/assets/cases/psb/before');
const { chromium } = await import('playwright');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto('file://' + path.join(dir, 'fix.html'));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
const screens = await page.evaluate(() => window.fixAll());
for (const [n, url] of Object.entries(screens)) {
  const file = path.join(out, `cb-${String(n).padStart(2, '0')}.webp`);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
