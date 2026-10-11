/**
 * Renders the senior's review for the PSB case in Russian and English.
 *
 *   node tools/review/render.mjs <review.mp4> [--frames-only]
 *
 * The source is the reviewer's portrait selfie recording, 720×1280 (Google Drive), with
 * burned-in subtitles and a name plate along the bottom.
 * 1. Crops the reviewer out of it into frames/, stopping above the subtitles and the plate.
 * 2. Steps review.html through every frame in Chromium and pipes screenshots to ffmpeg,
 *    with the original audio → public/assets/cases/psb/review.{ru,en}.mp4 and posters.
 * Needs ffmpeg and Playwright: `npm i --no-save playwright` (CHROMIUM_PATH picks a browser binary).
 */
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../../public/assets/cases/psb');
const [source, flag] = process.argv.slice(2);
if (!source) throw new Error('Pass the path to the review recording');
const FPS = 30;
// The recording runs 125 s; the outro folds the card and types the title after it
const DURATION = 127.5;

// 1. Footage: from the top of the head down to just above the subtitles (their top edge is
// y ≥ 978). The name plate starts at y = 953 in the first five seconds; its last few rows
// hide under the name label on the card.
const frames = join(here, 'frames');
mkdirSync(frames, { recursive: true });
execFileSync('ffmpeg', [
  '-v',
  'error',
  '-y',
  '-i',
  source,
  '-vf',
  'crop=720:715:0:260',
  '-q:v',
  '2',
  '-start_number',
  '0',
  join(frames, 'f%04d.jpg'),
]);
if (flag === '--frames-only') process.exit(0);

// 2. Render: a tiny static server, since the page fetches its JSON
const types = { '.html': 'text/html', '.json': 'application/json', '.jpg': 'image/jpeg' };
const server = createServer((req, res) => {
  try {
    const path = join(here, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const body = readFileSync(path);
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

const { chromium } = await import('playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const lang of ['ru', 'en']) {
  await page.goto(`http://localhost:${port}/review.html?lang=${lang}`);
  await page.evaluate(() => document.fonts.ready);
  const ff = spawn(
    'ffmpeg',
    [
      '-v',
      'error',
      '-y',
      '-f',
      'image2pipe',
      '-framerate',
      String(FPS),
      '-i',
      '-',
      '-i',
      source,
      '-map',
      '0:v',
      '-map',
      '1:a',
      // Silence under the outro
      '-af',
      'apad',
      '-t',
      String(DURATION),
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '26',
      '-pix_fmt',
      'yuv420p',
      '-tune',
      'stillimage',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      join(out, `review.${lang}.mp4`),
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const total = Math.round(DURATION * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.render(t), f / FPS);
    const shot = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(shot)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log(lang, `${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  // Poster: the opening verdict, mid-sentence
  await page.evaluate(() => window.render(6.6));
  await page.screenshot({ path: join(frames, `poster.${lang}.png`) });
  execFileSync('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-i',
    join(frames, `poster.${lang}.png`),
    '-vf',
    'scale=1280:-1',
    '-quality',
    '85',
    join(out, `review-poster.${lang}.webp`),
  ]);
}
await browser.close();
server.close();
