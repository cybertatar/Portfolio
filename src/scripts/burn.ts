import { showDialog } from './dialog';

/** Pixel cells across the portrait: big enough to read as pixels, small enough to look like fire. */
const COLUMNS = 28;
/** The fire front climbs from the bottom edge to the top in this time. */
const BURN_MS = 1500;
/** A cell glows this long before it breaks off. */
const GLOW_MS = 220;
/** From the poke to the respawn, as the dialog promises. */
const RESPAWN_AT_MS = 5000;
const RESPAWN_MS = 700;
/** Hot to cold: the colours an ember goes through before it turns to ash. */
const EMBER = ['#f8d77a', '#f2a04a', '#dc5a2e', '#93402a'];
const ASH = '#857b70';

type Cell = { x: number; y: number; color: string; at: number };
type Spark = Cell & { vx: number; vy: number; life: number; ash: boolean };

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));
const frame = () => new Promise<number>((done) => requestAnimationFrame(done));

/**
 * Burns the portrait down like a defeated unit: a ragged fire front climbs from the bottom, every
 * pixel cell glows and breaks off as an ember that drifts up and cools to ash. The empty slot stays
 * for a few seconds, then the portrait respawns cell by cell with a sky-blue flash.
 * Resolves once the portrait is back. With reduced motion it simply disappears and comes back.
 */
export async function burnPortrait(slot: HTMLElement, fallen: string, respawned: string) {
  const img = slot.querySelector('img');
  const start = performance.now();
  if (!img || !img.complete || !img.naturalWidth) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    img.style.visibility = 'hidden';
    slot.classList.add('is-down');
    showDialog(fallen, slot);
    await wait(RESPAWN_AT_MS);
    img.style.visibility = '';
    slot.classList.remove('is-down');
    showDialog(respawned, slot);
    return;
  }

  const w = slot.clientWidth;
  const h = slot.clientHeight;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  // The picture as the <img> shows it (object-fit: cover, centred), kept whole for the redraws.
  const fit = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * fit;
  const dh = img.naturalHeight * fit;
  const full = document.createElement('canvas');
  full.width = canvas.width;
  full.height = canvas.height;
  const fullCtx = full.getContext('2d')!;
  fullCtx.drawImage(img, ((w - dw) / 2) * dpr, ((h - dh) / 2) * dpr, dw * dpr, dh * dpr);

  // One colour per cell: the picture shrunk to the grid.
  const size = Math.ceil(w / COLUMNS);
  const cols = Math.ceil(w / size);
  const rows = Math.ceil(h / size);
  const grid = document.createElement('canvas');
  grid.width = cols;
  grid.height = rows;
  const gridCtx = grid.getContext('2d')!;
  gridCtx.drawImage(full, 0, 0, cols, rows);
  let pixels: Uint8ClampedArray | undefined;
  try {
    pixels = gridCtx.getImageData(0, 0, cols, rows).data;
  } catch {
    /* a tainted canvas: the embers start orange */
  }

  // The front is ragged: each column runs a little ahead or behind, each cell jitters.
  const lag = Array.from({ length: cols }, () => Math.random() * 260);
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = (r * cols + c) * 4;
      const color = pixels ? `rgb(${pixels[k]}, ${pixels[k + 1]}, ${pixels[k + 2]})` : EMBER[1];
      const height = 1 - (r + 0.5) / rows;
      cells.push({
        x: c * size,
        y: r * size,
        color,
        at: height * BURN_MS + lag[c] + Math.random() * 120,
      });
    }
  }

  slot.append(canvas);
  img.style.visibility = 'hidden';
  slot.classList.add('is-down');
  showDialog(fallen, slot);

  const sparks: Spark[] = [];
  const pending = [...cells].sort((a, b) => a.at - b.at);
  const burnt = new Set<Cell>();
  let last = start;
  for (;;) {
    const now = await frame();
    const t = now - start;
    const dt = Math.min(50, now - last) / 1000;
    last = now;

    while (pending.length && pending[0].at <= t) {
      const cell = pending.shift()!;
      burnt.add(cell);
      sparks.push({
        ...cell,
        at: t,
        vx: (Math.random() - 0.5) * 30,
        vy: -(40 + Math.random() * 70),
        life: 700 + Math.random() * 700,
        ash: Math.random() < 0.3,
      });
    }

    ctx.clearRect(0, 0, w, h);
    // What still stands, glowing along the front
    for (const cell of cells) {
      if (burnt.has(cell)) continue;
      ctx.drawImage(
        full,
        cell.x * dpr,
        cell.y * dpr,
        size * dpr,
        size * dpr,
        cell.x,
        cell.y,
        size,
        size,
      );
      const heat = 1 - (cell.at - t) / GLOW_MS;
      if (heat > 0) {
        ctx.globalAlpha = 0.3 + 0.6 * heat;
        ctx.fillStyle = EMBER[heat < 0.5 ? 1 : 0];
        ctx.fillRect(cell.x, cell.y, size, size);
        ctx.globalAlpha = 1;
      }
    }
    // Embers: hot right away, then cooling; ash is slower and lingers grey
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      const age = (t - s.at) / s.life;
      if (age >= 1) {
        sparks.splice(i, 1);
        continue;
      }
      s.x += s.vx * dt;
      s.y += s.vy * (s.ash ? 0.5 : 1) * dt;
      s.vx += (Math.random() - 0.5) * 60 * dt;
      const side = Math.max(2, Math.round(size * (1 - age * 0.7)));
      ctx.globalAlpha = 1 - age * age;
      ctx.fillStyle =
        age < 0.12 ? s.color : s.ash && age > 0.45 ? ASH : EMBER[Math.min(3, Math.floor(age * 4))];
      ctx.fillRect(Math.round(s.x), Math.round(s.y), side, side);
      ctx.globalAlpha = 1;
    }
    if (!pending.length && !sparks.length) break;
  }
  ctx.clearRect(0, 0, w, h);

  await wait(Math.max(0, RESPAWN_AT_MS - (performance.now() - start)));

  // Respawn: cells come back in a random order, each with a brief flash of sky
  const flash = getComputedStyle(slot).getPropertyValue('--sky-300').trim() || '#9cc0e2';
  const back = cells.map((cell) => ({ ...cell, at: Math.random() * RESPAWN_MS * 0.8 }));
  const from = performance.now();
  for (;;) {
    const t = (await frame()) - from;
    ctx.clearRect(0, 0, w, h);
    for (const cell of back) {
      if (cell.at > t) continue;
      ctx.drawImage(
        full,
        cell.x * dpr,
        cell.y * dpr,
        size * dpr,
        size * dpr,
        cell.x,
        cell.y,
        size,
        size,
      );
      const glow = 1 - (t - cell.at) / 180;
      if (glow > 0) {
        ctx.globalAlpha = glow;
        ctx.fillStyle = flash;
        ctx.fillRect(cell.x, cell.y, size, size);
        ctx.globalAlpha = 1;
      }
    }
    if (t > RESPAWN_MS) break;
  }
  img.style.visibility = '';
  slot.classList.remove('is-down');
  canvas.remove();
  showDialog(respawned, slot);
}
