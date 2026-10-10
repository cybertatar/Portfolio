/**
 * A flower field along the footer line, after Frieren's favourite spell: when the reader
 * reaches the end of the feed, pixel flowers sprout from left to right; a click plants more.
 */

/** Size of one sprite pixel, px. */
const U = 3;
/** Sprite width in pixels; the stem runs up column 2. */
const W = 5;

/** Flower heads. `p` petal, `c` heart. */
const HEADS = [
  ['.ppp.', 'ppcpp', '.ppp.'],
  ['..p..', '.pcp.', '..p..'],
  ['p.p.p', 'ppppp', '.ppp.'],
  ['p.p.p', '.pcp.', 'p.p.p'],
  ['.p.p.', 'ppcpp', '.ppp.'],
];

/** Grass tufts. `l` leaf. */
const TUFTS = [
  ['l...l', '.l.l.', '.l.l.'],
  ['..l..', 'l.l..', '.ll.l', '.lll.'],
  ['.l...', '.l..l', '..ll.'],
];

const FILL: Record<string, string> = {
  p: 'var(--petal)',
  c: 'var(--flora-heart)',
  g: 'var(--flora-stem)',
  l: 'var(--flora-leaf)',
};

/** Petal colours, repeated by weight: mostly pale sky and white, a little lilac. */
const PETALS = ['sky', 'sky', 'sky', 'white', 'white', 'white', 'deep', 'lilac', 'lilac'].map(
  (n) => `var(--flora-petal-${n})`,
);

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/** Stem rows under a head: a straight stem with one or two leaves. */
function stem(length: number) {
  const rows = Array.from({ length }, () => '..g..');
  const leaves = length > 3 ? 2 : 1;
  for (let n = 0; n < leaves; n++) {
    const y = 1 + Math.floor(Math.random() * (length - 1));
    rows[y] = Math.random() < 0.5 ? '.lg..' : '..gl.';
  }
  return rows;
}

function svg(head: string[], body: string[]) {
  const rect = (row: string, y: number) =>
    [...row]
      .map((c, x) =>
        c in FILL ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${FILL[c]}"/>` : '',
      )
      .join('');
  const h = head.length + body.length;
  const top = head.map(rect).join('');
  const bottom = body.map((row, i) => rect(row, head.length + i)).join('');
  return {
    rows: h,
    html:
      `<svg viewBox="0 0 ${W} ${h}" width="${W * U}" height="${h * U}" shape-rendering="crispEdges">` +
      `<g class="head">${top}</g>${bottom}</svg>`,
  };
}

type Kind = 'flower' | 'bud' | 'tuft';

function sprite(kind: Kind) {
  if (kind === 'tuft') return svg([], pick(TUFTS));
  const head = kind === 'bud' ? HEADS[1] : pick(HEADS);
  const length = kind === 'bud' ? Math.round(rand(1, 3)) : Math.round(rand(3, 8));
  return svg(head, stem(length));
}

export function initMeadow(footer: HTMLElement, meadow: HTMLElement) {
  const plants: HTMLElement[] = [];

  const plant = (x: number, kind: Kind, delay = 0) => {
    const { rows, html } = sprite(kind);
    const el = document.createElement('span');
    el.className = 'plant';
    el.innerHTML = html;
    // Snap to the sprite grid so every plant shares crisp pixel edges
    const left =
      Math.round(Math.min(Math.max(x - (W * U) / 2, 0), meadow.clientWidth - W * U) / U) * U;
    el.style.left = `${left}px`;
    el.style.setProperty('--petal', pick(PETALS));
    el.style.setProperty('--rows', String(rows));
    el.style.setProperty('--delay', `${Math.round(delay)}ms`);
    if (kind === 'flower' && Math.random() < 0.6) {
      el.classList.add('sways');
      el.style.setProperty('--sway', `${rand(4, 9).toFixed(1)}s`);
      el.style.setProperty('--sway-delay', `${rand(-9, 0).toFixed(1)}s`);
    }
    meadow.append(el);
    plants.push(el);

    // Keep the field from turning into a hedge: the oldest plants wilt away
    const cap = Math.max(12, Math.floor(meadow.clientWidth / 8));
    while (plants.length > cap) plants.shift()?.remove();
  };

  /** The first bloom: a wave that sweeps across the line, flowers in loose clumps. */
  const bloom = () => {
    const width = meadow.clientWidth;
    const slot = W * U + U;
    for (let x = slot / 2; x < width; x += slot) {
      const r = Math.random();
      const kind: Kind | null = r < 0.32 ? 'flower' : r < 0.42 ? 'bud' : r < 0.6 ? 'tuft' : null;
      if (kind) plant(x + rand(-U, U), kind, (x / width) * 1400 + rand(0, 300));
    }
  };

  new IntersectionObserver(
    (entries, io) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      bloom();
    },
    { threshold: 0.5 },
  ).observe(footer);

  footer.addEventListener('click', (e) => {
    const x = e.clientX - meadow.getBoundingClientRect().left;
    plant(x, 'flower');
    plant(x - rand(4, 7) * U, Math.random() < 0.5 ? 'bud' : 'tuft', 120);
    plant(x + rand(4, 7) * U, Math.random() < 0.5 ? 'bud' : 'tuft', 220);
  });
}
