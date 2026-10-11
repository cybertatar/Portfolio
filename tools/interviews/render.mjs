/**
 * Renders the interview cut for the PSB case in Russian and English.
 *
 *   node tools/interviews/render.mjs <interviews-1080.h264.mp4> [--frames-only]
 *
 * The source is the co-author's finished 1080p cut (Google Drive, folder PSBinterviewvideo).
 * 1. Crops the respondents' footage out of it into frames/ (h = landscape, v = portrait cards).
 * 2. Measures loudness per frame into frames/level.json for the audio-only waveform.
 * 3. Steps interviews.html through every frame in Chromium and pipes screenshots to ffmpeg,
 *    with the original audio → public/assets/cases/psb/interviews.{ru,en}.mp4 and posters.
 * Needs ffmpeg and Playwright: `npm i --no-save playwright` (CHROMIUM_PATH picks a browser binary).
 */
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../../public/assets/cases/psb');
const [source, flag] = process.argv.slice(2);
if (!source) throw new Error('Pass the path to interviews-1080.h264.mp4');
const FPS = 30;
const DURATION = 63.4;

// 1. Footage: the cards sit clear of the burned-in subtitles; the crops stay inside the
// rounded corners and stop above the topic label.
const frames = join(here, 'frames');
mkdirSync(frames, { recursive: true });
for (const [kind, crop] of [
  ['h', '1224:650:348:60'],
  ['v', '540:650:690:60'],
]) {
  execFileSync('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-i',
    source,
    '-vf',
    `crop=${crop}`,
    '-q:v',
    '2',
    '-start_number',
    '0',
    join(frames, `${kind}%04d.jpg`),
  ]);
}

// 2. Loudness per video frame, normalised to the 97th percentile, for the waveform bars
const pcm = execFileSync(
  'ffmpeg',
  ['-v', 'error', '-i', source, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
  { maxBuffer: 1 << 28 },
);
const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1);
const hop = 16000 / FPS;
const rms = [];
for (let i = 0; (i + 1) * hop <= samples.length; i++) {
  const [a, b] = [Math.floor(i * hop), Math.floor((i + 1) * hop)];
  let sum = 0;
  for (let j = a; j < b; j++) sum += (samples[j] / 32768) ** 2;
  rms.push(Math.sqrt(sum / (b - a)));
}
const p97 = [...rms].sort((a, b) => a - b)[Math.floor(rms.length * 0.97)];
writeFileSync(
  join(frames, 'level.json'),
  JSON.stringify(rms.map((r) => +(Math.min(1, r / p97) ** 0.7).toFixed(3))),
);
if (flag === '--frames-only') process.exit(0);

// 3. Render: a tiny static server, since the page fetches its JSON
const types = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};
const server = createServer((req, res) => {
  try {
    const path = join(here, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(readFileSync(path));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

const { chromium } = await import('playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const lang of ['ru', 'en']) {
  await page.goto(`http://localhost:${port}/interviews.html?lang=${lang}`);
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
      '-shortest',
      join(out, `interviews.${lang}.mp4`),
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const total = Math.round(DURATION * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.render(t), f / FPS);
    const shot = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(shot)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(lang, `${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  // Poster: the first take, mid-sentence
  await page.evaluate(() => window.render(2.4));
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
    join(out, `interviews-poster.${lang}.webp`),
  ]);
}
await browser.close();
server.close();
