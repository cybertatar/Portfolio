/**
 * Captures the "after" screens of a PSB race from the live prototype on the case page
 * (Финальные экраны): the home phone is lifted out of the deck into a fixed 441px block, its
 * poster, body and the app's own island hidden, and the flow is clicked through by data-track.
 * Each shot is the screen alone, cropped 3px at the top and the sides (2px of page background)
 * and scaled to 800×1727 like the other race screens (Python with Pillow).
 *
 *   npm run build && npx astro preview   # in another shell
 *   node tools/psb-race/capture.mjs card   # or cats
 *
 * Needs Playwright: `npm i --no-save playwright` (CHROMIUM_PATH picks a browser binary).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '../../public/assets/cases/psb/race');
// Raw shots go to a temp folder; Pillow scales them to webp at the end
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'psb-race-'));
const url = process.env.PREVIEW_URL ?? 'http://localhost:4321/cases/psb/';

/** Flows: a shot name, then the data-track to click before the next shot. */
const flows = {
  card: [
    ['card-home', 'home.account.open'],
    ['card-account', 'account.card.primary.open'],
    ['card-card', 'FLIP'],
    ['card-data', 'COPY'],
    ['card-copied'],
  ],
  // Cashback already connected: next month's categories from «Выгода», as in the Figma flow
  // (categories that fit on the screen, so every tick shows)
  cats: [
    ['next-home', 'cashback.tab.open'],
    ['next-cashback', 'cashback.next_month.categories.open'],
    ['next-0', 'cashback.category.scooters.toggle'],
    ['next-1', 'cashback.category.taxi.toggle'],
    ['next-2', 'cashback.category.delivery.toggle'],
    ['next-3', 'cashback.categories.confirm'],
    ['next-success'],
  ],
};
const connected = process.argv[2] === 'cats';
const flow = flows[process.argv[2]];
if (!flow) throw new Error(`Flow: ${Object.keys(flows).join(', ')}`);

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  // three live phones need more video memory than headless Chromium assumes
  args: ['--force-gpu-mem-available-mb=4096'],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 1000 },
  deviceScaleFactor: 2,
});
await page.goto(url);
// Read when the app mounts, which waits for the phones to come near the screen
if (connected)
  await page.evaluate(() => {
    document.querySelector('[data-psb-live-route="/"]').dataset.psbCashback = 'connected';
  });
await page.locator('#screens').scrollIntoViewIfNeeded();
await page.waitForFunction(() =>
  document.querySelector('[data-psb-live-route="/"]')?.shadowRoot?.querySelector('[data-track]'),
);
await page.evaluate(() => {
  const host = document.querySelector('[data-psb-live-route="/"]');
  const phone = host.closest('[data-live-phone]');
  document.body.append(phone);
  Object.assign(phone.style, {
    position: 'fixed',
    left: '20px',
    top: '20px',
    width: '441px',
    zIndex: 9999,
  });
  phone.querySelector('.poster').style.display = 'none';
  phone.querySelector('.body').style.display = 'none';
  // Square corners: the app's own background fills them, Phone.astro rounds them on the page
  Object.assign(phone.querySelector('.screen').style, { borderRadius: '0', clipPath: 'none' });
  const hide = document.createElement('style');
  hide.textContent = '.portfolio-island{display:none!important}';
  host.shadowRoot.append(hide);
  window.scrollTo(0, 0);
});
const root = () =>
  page.evaluateHandle(() => document.querySelector('[data-psb-live-route="/"]').shadowRoot);
const click = (track) =>
  page.evaluate((t) => {
    const r = document.querySelector('[data-psb-live-route="/"]').shadowRoot;
    // The front card flips, the revealed number copies
    const sel =
      t === 'FLIP'
        ? '[data-track$=".flip"]'
        : t === 'COPY'
          ? '[data-track$=".number.copy"]'
          : `[data-track="${t}"]`;
    const el = r.querySelector(sel);
    if (!el) throw new Error(`No ${sel}`);
    el.click();
  }, track);
await root();
await page.waitForTimeout(1500);
for (const [name, next] of flow) {
  const box = await page.locator('[data-live-phone] .screen').last().boundingBox();
  const shot = await page.screenshot({
    clip: { x: box.x + 3 / 2, y: box.y + 3 / 2, width: box.width - 3, height: box.height - 3 / 2 },
  });
  fs.writeFileSync(path.join(scratch, `${name}.png`), shot);
  if (next) {
    await click(next);
    await page.waitForTimeout(1600);
  }
}
await browser.close();
// The same 800×1727 as the other race screens
execFileSync('python3', [
  '-c',
  `import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
for n in sys.argv[3:]:
    Image.open(f'{src}/{n}.png').convert('RGB').resize((800, 1727), Image.LANCZOS).save(f'{out}/{n}.webp', quality=86)`,
  scratch,
  out,
  ...flow.map(([name]) => name),
]);
