/**
 * A flower field in the footer, seen from above, after Frieren's favourite spell: when the reader
 * reaches the end of the feed, flowers bloom in a wave spreading from one spot; more open
 * under the mouse cursor, or around a tap on touch screens.
 */

/** Size of one sprite pixel, px. */
const U = 3;
/** Sprites are N×N pixels; plants sit on a grid of CELL px so they never overlap. */
const N = 7;
const CELL = (N + 2) * U;

/** Pixel rows. `p` petal, `c` heart, `l` leaf. */
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
const HALF: Sprite = ['.......', '...p...', '..lpl..', '.ppcpp.', '..lpl..', '...p...', '.......'];

/** Open flowers; a leaf peeks out on one side, never a full ring of them. */
const BLOOMS: Sprite[] = [
  ['...p...', '.p.p.p.', '..ppp..', 'pppcppp', '..ppp..', '.p.p.p.', '...p...'],
  ['.......', '..ppp..', '.ppppp.', '.ppcpp.', '.ppppp.', 'l.ppp..', 'll.....'],
  ['.....ll', '..p.p.l', '.ppppp.', '..pcp..', '.ppppp.', '..p.p..', '.......'],
  ['.......', '.pp.pp.', '.ppppp.', '..pcp..', '.ppppp.', '.pp.pp.', 'll.....'],
];

/** Grass seen from above. */
const TUFTS: Sprite[] = [
  ['.......', '.......', '.l...l.', '..l.l..', '...l...', '.......', '.......'],
  ['.......', '..l....', '...l.l.', '.l..l..', '..l....', '.......', '.......'],
  ['.......', '.......', '...l...', '.l.l.l.', '..lll..', '.......', '.......'],
];

const FILL: Record<string, string> = {
  p: 'var(--petal)',
  c: 'var(--flora-heart)',
  l: 'var(--flora-leaf)',
};

/** Petal colours, repeated by weight: mostly pale sky and white, a little lilac. */
const PETALS = ['sky', 'sky', 'sky', 'white', 'white', 'white', 'deep', 'lilac', 'lilac'].map(
  (n) => `var(--flora-petal-${n})`,
);

/** Time per bloom frame, ms. */
const FRAME = 110;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

function svg(rows: Sprite) {
  const rects = rows
    .flatMap((row, y) =>
      [...row].map((c, x) =>
        c in FILL ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${FILL[c]}"/>` : '',
      ),
    )
    .join('');
  return `<svg viewBox="0 0 ${N} ${N}" width="${N * U}" height="${N * U}" shape-rendering="crispEdges">${rects}</svg>`;
}

type Kind = 'flower' | 'bud' | 'tuft';

export function initMeadow(footer: HTMLElement, meadow: HTMLElement) {
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Occupied cells, "col:row" → plant; the oldest come first. */
  const cells = new Map<string, HTMLElement>();

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
        ? [pick(TUFTS)]
        : kind === 'bud'
          ? [SPROUT, BUD]
          : [SPROUT, BUD, HALF, pick(BLOOMS)];
    const el = document.createElement('span');
    el.className = 'plant';
    el.dataset.kind = kind;
    // A pixel or two of jitter inside the cell, still on the sprite grid
    el.style.left = `${col * CELL + Math.round(rand(0, 2)) * U}px`;
    el.style.top = `${row * CELL + Math.round(rand(0, 2)) * U}px`;
    el.style.setProperty('--petal', pick(PETALS));
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

  /** Casts the spell at a point: flowers open in a ring around it, nearest first. */
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
        const kind: Kind = d < 1.2 || Math.random() < 0.7 ? 'flower' : 'bud';
        plant(col, row, kind, d * 90, true);
      }
    }
  };

  /** Mouse: now and then a single flower opens under the cursor as it wanders over the field;
      never right next to another one, so a sweep leaves scattered flowers, not a solid trail. */
  let cell = '';
  footer.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const box = meadow.getBoundingClientRect();
    const col = Math.floor((e.clientX - box.left) / CELL);
    const row = Math.floor((e.clientY - box.top) / CELL);
    const { cols, rows } = grid();
    const key = `${col}:${row}`;
    if (key === cell) return;
    cell = key;
    if (col < 0 || row < 0 || col >= cols || row >= rows || Math.random() > 0.45) return;
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (cells.get(`${col + dc}:${row + dr}`)?.dataset.kind === 'flower') return;
      }
    }
    plant(col, row, 'flower', 0, true);
  });
  footer.addEventListener('pointerleave', () => (cell = ''));

  /** Touch: a tap opens a wider ring. A swipe that scrolls the page cancels the pointer
      and never reaches pointerup, so scrolling past the field plants nothing. */
  footer.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') cast(e.clientX, e.clientY, 2.6);
  });
}
