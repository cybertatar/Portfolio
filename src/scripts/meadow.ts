/**
 * A flower field in the footer, seen from above, after Frieren's favourite spell: when the reader
 * reaches the end of the feed, flowers bloom in a wave spreading from one spot; more flowers and
 * grass grow under the mouse cursor, or around a tap on touch screens. Once in a while a frog
 * turns up and hops off.
 */

/** Size of one sprite pixel, px. */
const U = 3;
/** Sprites are N×N pixels; plants sit on a grid of CELL px so they never overlap. */
const N = 7;
const CELL = (N + 2) * U;

/**
 * Pixel rows. `p` petal, `q` second petal shade, `c` heart, `l` leaf, `g` grass;
 * frog: `f` skin, `b` back, `d` legs, `w` `k` eyes.
 */
type Sprite = string[];

const SPROUT: Sprite = [
  '.......',
  '.......',
  '...l...',
  '..l.l..',
  '...l...',
  '.......',
  '.......',
];
const BUD: Sprite = ['.......', '.......', '...l...', '..lpl..', '...l...', '.......', '.......'];
const HALF: Sprite = ['.......', '...p...', '..lql..', '.pqcqp.', '..lql..', '...p...', '.......'];

/** Open flowers; a leaf peeks out on one side, never a full ring of them. */
const BLOOMS: Sprite[] = [
  // daisy
  ['...p...', '.p.p.p.', '..ppp..', 'pppcppp', '..ppp..', '.p.p.p.', '...p...'],
  // round, with a darker ring
  ['.......', '..ppp..', '.pqqqp.', '.pqcqp.', '.pqqqp.', 'l.ppp..', 'll.....'],
  // four petals
  ['.....ll', '..p.p.l', '.ppppp.', '..qcq..', '.ppppp.', '..p.p..', '.......'],
  // cross
  ['.......', '.pp.pp.', '.pqpqp.', '..pcp..', '.pqpqp.', '.pp.pp.', 'll.....'],
  // rose, petals in a swirl
  ['.......', '..ppp..', '.pqqpp.', '.pqcqp.', '.ppqqp.', '..ppp.l', '.....ll'],
  // forget-me-not cluster
  ['.p...p.', 'pcp.pcp', '.p.l.p.', '..ll...', '...p...', '..pcp..', '...p...'],
  // sunflower-ish, a big heart
  ['...p...', '.pqpqp.', '.qcccq.', 'pqcccqp', '.qcccq.', '.pqpqp.', '...p...'],
  // lavender spike
  ['...q...', '..pqp..', '...q...', '..pqp..', '...p...', '..l.l..', '...l...'],
  // bellflower, three bells on a stem
  ['.......', '.pq....', '.qq.pq.', '..l.qq.', '..l.l..', '...l...', '...l...'],
];

/** Grass seen from above. */
const TUFTS: Sprite[] = [
  ['.......', '.......', '.l...l.', '..l.l..', '...l...', '.......', '.......'],
  ['.......', '..l....', '...l.l.', '.l..l..', '..l....', '.......', '.......'],
  ['.......', '.......', '...l...', '.l.l.l.', '..lll..', '.......', '.......'],
  ['.......', '.g...g.', '..g.l..', '.l.g...', '...l.g.', '.......', '.......'],
  ['.......', '...g...', '.g.l.g.', '..lgl..', '...g...', '.......', '.......'],
  // clover
  ['.......', '..ll...', '.lll.l.', '..llll.', '.l.gl..', '...g...', '.......'],
  ['.......', '.......', 'g..g...', '.g.g.g.', '..ggg..', '...g...', '.......'],
];

/** Seen from above, facing up; rotated to face where it hops. 10×10, a little bigger than a flower. */
const FROG: Sprite = [
  '..........',
  '.ff....ff.',
  'fwkffffkwf',
  'ffffffffff',
  '.ffbbbbff.',
  'd.ffbbff.d',
  'dd.ffff.dd',
  '..dffffd..',
  '.dd.dd.dd.',
  'dd......dd',
];

const FILL: Record<string, string> = {
  p: 'var(--petal)',
  q: 'var(--petal-2)',
  c: 'var(--heart)',
  l: 'var(--flora-leaf)',
  g: 'var(--flora-grass)',
  f: 'var(--flora-frog)',
  b: 'var(--flora-frog-light)',
  d: 'var(--flora-frog-dark)',
  k: 'var(--text-primary)',
  w: 'var(--flora-white-1)',
};

/** Flower colourings, repeated by weight: mostly sky and white, now and then something warmer. */
const PALETTES = [
  'sky',
  'sky',
  'sky',
  'white',
  'white',
  'white',
  'lilac',
  'lilac',
  'rose',
  'rose',
  'deep',
  'butter',
];

/** Time per bloom frame, ms. */
const FRAME = 110;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

function svg(rows: Sprite) {
  const rects = rows
    .flatMap((row, y) =>
      [...row].map((c, x) =>
        c in FILL ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${FILL[c]}"/>` : '',
      ),
    )
    .join('');
  const w = rows[0].length;
  const h = rows.length;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w * U}" height="${h * U}" shape-rendering="crispEdges">${rects}</svg>`;
}

type Kind = 'flower' | 'bud' | 'tuft';

export function initMeadow(footer: HTMLElement, meadow: HTMLElement) {
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Occupied cells, "col:row" → plant; the oldest come first. */
  const cells = new Map<string, HTMLElement>();
  let frog: HTMLElement | null = null;

  const grid = () => ({
    cols: Math.floor(meadow.clientWidth / CELL),
    rows: Math.floor(meadow.clientHeight / CELL),
  });

  /** `over`: replace grass or a bud already in the cell (a click always gets its flowers). */
  const plant = (col: number, row: number, kind: Kind, delay: number, over = false) => {
    const key = `${col}:${row}`;
    const taken = cells.get(key);
    if (taken) {
      if (!over || taken.dataset.kind === 'flower') return;
      taken.remove();
      cells.delete(key);
    }
    const frames =
      kind === 'tuft'
        ? [SPROUT, pick(TUFTS)]
        : kind === 'bud'
          ? [SPROUT, BUD]
          : [SPROUT, BUD, HALF, pick(BLOOMS)];
    const el = document.createElement('span');
    el.className = 'plant';
    el.dataset.kind = kind;
    // A pixel or two of jitter inside the cell, still on the sprite grid
    el.style.left = `${col * CELL + Math.round(rand(0, 2)) * U}px`;
    el.style.top = `${row * CELL + Math.round(rand(0, 2)) * U}px`;
    const palette = pick(PALETTES);
    el.style.setProperty('--petal', `var(--flora-${palette}-1)`);
    el.style.setProperty('--petal-2', `var(--flora-${palette}-2)`);
    el.style.setProperty('--heart', `var(--flora-${palette}-heart, var(--flora-heart))`);
    meadow.append(el);
    cells.set(key, el);

    if (still()) {
      el.innerHTML = svg(frames[frames.length - 1]);
    } else {
      frames.forEach((f, i) => setTimeout(() => (el.innerHTML = svg(f)), delay + i * FRAME));
    }

    // Keep the field from turning into a hedge: the oldest plants wilt away
    const { cols, rows } = grid();
    const cap = Math.max(16, Math.floor(cols * rows * 0.45));
    for (const [k, old] of cells) {
      if (cells.size <= cap) break;
      old.remove();
      cells.delete(k);
    }
  };

  /** A frog turns up, looks around, hops a few cells and is gone. One at a time. */
  const summonFrog = async (col: number, row: number) => {
    if (frog) return;
    const { cols, rows } = grid();
    const el = document.createElement('span');
    el.className = 'frog';
    el.innerHTML = svg(FROG);
    meadow.append(el);
    frog = el;

    let x = col;
    let y = row;
    let facing = Math.floor(rand(0, 4));
    const place = () => {
      el.style.left = `${x * CELL}px`;
      el.style.top = `${y * CELL}px`;
      el.style.setProperty('--turn', `${facing * 90}deg`);
    };
    place();

    if (!still()) {
      await wait(rand(1000, 1800));
      for (let hops = Math.round(rand(3, 5)); hops > 0; hops--) {
        // Mostly keeps its heading, sometimes turns; never hops off the field
        const ways = [0, 1, 2, 3].filter((w) => {
          const [nx, ny] = [x + [0, 2, 0, -2][w], y + [-2, 0, 2, 0][w]];
          return nx >= 0 && ny >= 0 && nx < cols && ny < rows;
        });
        if (!ways.length) break;
        facing = ways.includes(facing) && Math.random() < 0.6 ? facing : pick(ways);
        x += [0, 2, 0, -2][facing];
        y += [-2, 0, 2, 0][facing];
        el.classList.add('hop');
        place();
        await wait(260);
        el.classList.remove('hop');
        await wait(rand(400, 1100));
      }
    }
    await wait(still() ? 4000 : 1200);
    el.classList.add('gone');
    await wait(400);
    el.remove();
    frog = null;
  };

  /** The first bloom: loose patches, opening in a wave from one spot of the field. */
  const bloom = () => {
    const { cols, rows } = grid();
    const patches = Array.from({ length: Math.max(2, Math.round(cols / 8)) }, () => ({
      x: rand(0, cols),
      y: rand(0, rows),
      r: rand(3, 6),
    }));
    const origin = pick(patches);
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const near = Math.max(
          ...patches.map((p) => 1 - Math.hypot(col - p.x, (row - p.y) * 1.4) / p.r),
        );
        const chance = 0.1 + Math.max(0, near) * 0.5;
        const r = Math.random();
        if (r > chance) continue;
        const kind: Kind = r < chance * 0.55 ? 'flower' : r < chance * 0.7 ? 'bud' : 'tuft';
        plant(col, row, kind, Math.hypot(col - origin.x, row - origin.y) * 70 + rand(0, 120));
      }
    }
  };

  new IntersectionObserver(
    (entries, io) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      bloom();
    },
    { threshold: 0.4 },
  ).observe(meadow);

  /** Field cell under a point on screen, or null outside the field. */
  const cellAt = (x: number, y: number) => {
    const box = meadow.getBoundingClientRect();
    const { cols, rows } = grid();
    const col = Math.floor((x - box.left) / CELL);
    const row = Math.floor((y - box.top) / CELL);
    return col < 0 || row < 0 || col >= cols || row >= rows ? null : { col, row };
  };

  /** Casts the spell at a point: flowers and grass open in a ring around it, nearest first. */
  const cast = (x: number, y: number, radius: number) => {
    const box = meadow.getBoundingClientRect();
    const { cols, rows } = grid();
    const cx = (x - box.left) / CELL;
    const cy = (y - box.top) / CELL;
    for (let col = Math.floor(cx - radius); col <= cx + radius; col++) {
      for (let row = Math.floor(cy - radius); row <= cy + radius; row++) {
        if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
        const d = Math.hypot(col + 0.5 - cx, row + 0.5 - cy);
        if (d > radius || Math.random() > 1 - d / (radius + 1.4)) continue;
        const r = Math.random();
        const kind: Kind = d < 1.2 || r < 0.55 ? 'flower' : r < 0.85 ? 'tuft' : 'bud';
        plant(col, row, kind, d * 90, kind === 'flower');
      }
    }
  };

  /** Mouse: now and then a flower or a tuft of grass grows under the cursor as it wanders over
      the field; flowers never right next to each other, so a sweep leaves them scattered. */
  let last = '';
  footer.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const at = cellAt(e.clientX, e.clientY);
    const key = at ? `${at.col}:${at.row}` : '';
    if (key === last) return;
    last = key;
    if (!at || Math.random() > 0.45) return;
    if (Math.random() < 0.02) {
      summonFrog(at.col, at.row);
      return;
    }
    const r = Math.random();
    if (r < 0.4) return plant(at.col, at.row, 'tuft', 0);
    if (r < 0.5) return plant(at.col, at.row, 'bud', 0);
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (cells.get(`${at.col + dc}:${at.row + dr}`)?.dataset.kind === 'flower') return;
      }
    }
    plant(at.col, at.row, 'flower', 0, true);
  });
  footer.addEventListener('pointerleave', () => (last = ''));

  /** Touch: a tap opens a wider ring. A swipe that scrolls the page cancels the pointer
      and never reaches pointerup, so scrolling past the field plants nothing. */
  footer.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse') return;
    cast(e.clientX, e.clientY, 2.6);
    const at = cellAt(e.clientX, e.clientY);
    if (at && Math.random() < 0.08) setTimeout(() => summonFrog(at.col, at.row), 500);
  });
}
