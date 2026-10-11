/**
 * A fan of live prototype phones that flips by swipe, by a click on a phone behind, by the
 * arrow buttons or the arrow keys. The motion follows the colleague's deck on
 * psb-portfolio-preview: spring physics, the front phone follows the pointer, then slides out
 * and tucks under the deck while the next one comes forward.
 *
 * Markup: [data-deck] holds [data-deck-cards] with one [data-deck-card] per phone,
 * [data-deck-decor] sets (one per phone, shown with its phone), [data-deck-prev] /
 * [data-deck-next] buttons, [data-deck-caption] and [data-deck-dot] elements.
 */

type Spring = { position: number; velocity: number; target: number };
type CardState = Record<'x' | 'y' | 'rot' | 'scale' | 'opacity', Spring>;
type Params = { omega: number; zeta: number };

const SP: Record<'layout' | 'snapBack' | 'lift' | 'intro', Params> = {
  layout: { omega: (2 * Math.PI) / 0.45, zeta: 0.85 },
  snapBack: { omega: (2 * Math.PI) / 0.4, zeta: 0.7 },
  lift: { omega: (2 * Math.PI) / 0.4, zeta: 0.9 },
  intro: { omega: (2 * Math.PI) / 0.5, zeta: 0.94 },
};

/** Drag: the phone follows at half speed up to 70px; past 60px of pointer travel it flips. */
const DAMP = 0.5;
const MAX_X = 70;
const THRESHOLD = 60;
const LOCK = 10;
/** A phone pulled out of the deck goes under (or on top) once it is this far out, in widths. */
const LIFT_OUT = -0.45;
/** Carousels inside the app keep horizontal swipes to themselves. */
const OWN_SWIPES =
  '[aria-label="Карты счёта"], [aria-label="Предложения"], [aria-label="Счета и продукты"]';

const follow = (dx: number) => Math.sign(dx) * Math.min(MAX_X, Math.abs(dx * DAMP));
const moving = (s: Spring) => s.position !== s.target || s.velocity !== 0;

function step(s: Spring, p: Params, dt: number) {
  dt = Math.min(dt, 0.064);
  const off = s.position - s.target;
  if (Math.abs(off) < 0.001 && Math.abs(s.velocity) < 0.01) {
    s.position = s.target;
    s.velocity = 0;
    return;
  }
  const wd = p.omega * Math.sqrt(1 - p.zeta * p.zeta);
  const e = Math.exp(-p.zeta * p.omega * dt);
  const c = Math.cos(wd * dt);
  const sn = Math.sin(wd * dt);
  const f = (s.velocity + p.zeta * p.omega * off) / wd;
  s.position = s.target + e * (off * c + f * sn);
  s.velocity = e * ((f * wd - p.zeta * p.omega * off) * c - (off * wd + p.zeta * p.omega * f) * sn);
}

/**
 * Place of a phone n steps behind the front one, in phone widths. The next phone peeks out on
 * the right, the previous one on the left.
 */
function slot(n: number, count: number) {
  if (n === 0) return { x: 0, y: 0, rot: 0, scale: 1 };
  const right = n === 1;
  const depth = right ? 1 : count - n;
  return {
    x: (right ? 1 : -1) * 0.15 * depth,
    y: 0.025 + 0.012 * depth,
    rot: (right ? 4 : -4) * depth,
    scale: 0.93 - 0.04 * (depth - 1),
  };
}

export function initDeck(root: HTMLElement) {
  const box = root.querySelector<HTMLElement>('[data-deck-cards]');
  const cards = [...root.querySelectorAll<HTMLElement>('[data-deck-card]')];
  if (!box || cards.length < 2) return;
  const count = cards.length;
  const screens = cards.map((c) => c.querySelector<HTMLElement>('[data-psb-live-route]'));
  const decor = [...root.querySelectorAll<HTMLElement>('[data-deck-decor]')];
  const caption = root.querySelector<HTMLElement>('[data-deck-caption]');
  const dots = [...root.querySelectorAll<HTMLElement>('[data-deck-dot]')];
  const still = matchMedia('(prefers-reduced-motion: reduce)');

  const order = cards.map((_, i) => i);
  const state: CardState[] = cards.map(() => {
    const s = (v: number) => ({ position: v, velocity: 0, target: v });
    return { x: s(0), y: s(0.1), rot: s(0), scale: s(0.94), opacity: s(0) };
  });
  let revealed = false;
  let lock = false;
  /** Phone being pulled out of the deck, and whether it is above the others while it is. */
  let lifted = -1;
  let liftedOnTop = false;
  let raf = 0;
  let last = 0;

  // Pointer drag
  let pointer: number | null = null;
  let touch = false;
  let dir: 'h' | null = null;
  let sx = 0;
  let sy = 0;
  let dx = 0;
  let dy = 0;
  let dragged = false;

  const width = () => cards[0].offsetWidth || 300;

  function front(i: number) {
    cards.forEach((card, k) => {
      const on = k === i;
      card.classList.toggle('is-front', on);
      screens[k]?.toggleAttribute('inert', !on || !revealed);
    });
    decor.forEach((d) =>
      d.classList.toggle('is-active', revealed && Number(d.dataset.deckDecor) === i),
    );
    dots.forEach((d) => d.toggleAttribute('aria-current', Number(d.dataset.deckDot) === i));
    const label = cards[i].dataset.title ?? '';
    if (caption && caption.textContent !== label) caption.textContent = label;
  }

  function request() {
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(render);
    }
  }

  function render(now: number) {
    raf = 0;
    const dt = last ? (now - last) / 1000 : 1 / 60;
    last = now;
    const w = width();
    const p = pointer !== null && dir === 'h' ? Math.min(1, Math.abs(dx) / THRESHOLD) * 0.82 : 0;
    // Faded decor while a phone is being pulled away
    root.style.setProperty('--deck-pull', p.toFixed(3));

    order.forEach((ci, n) => {
      const s = state[ci];
      const top = n === 0;
      if (ci !== lifted && revealed) {
        const here = slot(n, count);
        // While dragging, the phones behind move halfway to where the flip will put them
        const next = dx < 0 ? slot(n - 1, count) : slot((n + 1) % count, count);
        const mix = (a: number, b: number) => (top ? a : a + (b - a) * p);
        s.x.target = mix(here.x, next.x);
        s.y.target = mix(here.y, next.y);
        s.rot.target = mix(here.rot, next.rot);
        s.scale.target = mix(here.scale, next.scale);
        s.opacity.target = 1;
      }
      const params = ci === lifted ? SP.lift : !revealed ? SP.intro : top ? SP.snapBack : SP.layout;
      for (const k of ['x', 'y', 'rot', 'scale', 'opacity'] as const) {
        if (still.matches) {
          s[k].position = s[k].target;
          s[k].velocity = 0;
        } else step(s[k], params, dt);
      }

      if (ci === lifted && s.x.position <= LIFT_OUT) settleLift();

      const held = top && pointer !== null && dir === 'h';
      const x = held ? follow(dx) : s.x.position * w;
      const y = held ? dy * 0.2 : s.y.position * w;
      const rot = held ? follow(dx) / 20 : s.rot.position;
      const sc = held ? 1 : s.scale.position;
      const el = cards[ci];
      const idle =
        !held && Math.abs(x) < 0.05 && Math.abs(y) < 0.05 && Math.abs(rot) < 0.01 && sc === 1;
      const transform = idle
        ? 'none'
        : `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      if (el.style.transform !== transform) el.style.transform = transform;
      const z = String(ci !== lifted ? count - n : liftedOnTop ? count + 1 : 0);
      if (el.style.zIndex !== z) el.style.zIndex = z;
      const op = s.opacity.position.toFixed(3);
      if (el.style.opacity !== op) el.style.opacity = op;
    });

    const busy = pointer !== null || state.some((s) => Object.values(s).some(moving));
    if (busy) raf = requestAnimationFrame(render);
  }

  /**
   * Flip like a deck of cards. Forward: the front phone slides out to the left on top of the
   * others, then tucks under the deck into the last slot. Back: the bottom phone slides out from
   * under the deck on the left, then lands on top.
   */
  function flip(forward: boolean, fromX = 0, fromY = 0) {
    if (lock || !revealed) return;
    lock = true;
    const w = width();
    const top = state[order[0]];
    top.x.position = fromX / w;
    top.y.position = fromY / w;
    top.rot.position = fromX / 20;
    const moving = forward ? order[0] : order[count - 1];
    const s = state[moving];
    // Out to the side, clear of the phone in front
    s.x.target = -0.62;
    s.y.target = 0.02;
    s.rot.target = -8;
    s.scale.target = 0.96;
    s.x.velocity = s.rot.velocity = 0;
    lifted = moving;
    liftedOnTop = forward;
    if (forward) order.push(order.shift()!);
    else order.unshift(order.pop()!);
    front(order[0]);
    request();
    // Fallback for slow frames; normally render() tucks it once it is out far enough
    setTimeout(settleLift, still.matches ? 0 : 450);
  }

  /** Tucked under (or laid on top): from here it springs into its slot like the rest. */
  function settleLift() {
    if (lifted < 0) return;
    lifted = -1;
    request();
    setTimeout(() => (lock = false), still.matches ? 0 : 200);
  }

  function show(i: number) {
    const n = order.indexOf(i);
    if (n <= 0) return;
    // Bring a phone forward the short way round
    flip(n <= count / 2);
  }

  function release(flipIt: boolean) {
    const x = follow(dx);
    const y = dy * 0.2;
    const forward = dx < 0;
    pointer = null;
    dir = null;
    dx = dy = 0;
    root.classList.remove('is-dragging');
    if (flipIt) {
      root.classList.add('hint-swiped');
      flip(forward, x, y);
    } else {
      const s = state[order[0]];
      const w = width();
      s.x.position = x / w;
      s.y.position = y / w;
      s.rot.position = x / 20;
    }
    request();
  }

  box.addEventListener('pointerdown', (e) => {
    if (!revealed || lock || pointer !== null || e.button !== 0) return;
    const card = (e.target as Element).closest<HTMLElement>('[data-deck-card]');
    if (!card || order[0] !== cards.indexOf(card)) return;
    const inner = e.composedPath()[0] as Element;
    if (inner.closest?.(OWN_SWIPES)) return;
    pointer = e.pointerId;
    touch = e.pointerType !== 'mouse';
    dir = null;
    sx = e.clientX;
    sy = e.clientY;
    dx = dy = 0;
  });
  addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointer) return;
    dx = e.clientX - sx;
    dy = e.clientY - sy;
    if (dir === null && Math.hypot(dx, dy) > LOCK) {
      // A vertical finger stays a scroll of the app or the page
      if (touch && Math.abs(dy) > Math.abs(dx) * 1.2) {
        pointer = null;
        return;
      }
      dir = 'h';
      dragged = true;
      root.classList.add('is-dragging');
      box.setPointerCapture?.(e.pointerId);
    }
    if (dir === 'h') request();
  });
  addEventListener('pointerup', (e) => {
    if (e.pointerId !== pointer) return;
    if (dir === 'h') release(Math.abs(dx) > THRESHOLD);
    else pointer = null;
  });
  addEventListener('pointercancel', (e) => {
    if (e.pointerId === pointer) release(false);
  });
  // A drag must not end as a tap on whatever was under the pointer
  box.addEventListener(
    'click',
    (e) => {
      if (dragged) {
        e.stopPropagation();
        e.preventDefault();
      }
      dragged = false;
    },
    true,
  );
  box.addEventListener('pointerdown', () => (dragged = false), true);
  box.addEventListener('click', (e) => {
    const card = (e.target as Element).closest<HTMLElement>('[data-deck-card]');
    if (!card) return;
    const i = cards.indexOf(card);
    if (order[0] === i) root.classList.add('hint-clicked');
    else show(i);
  });

  root.querySelector('[data-deck-prev]')?.addEventListener('click', () => flip(false));
  root.querySelector('[data-deck-next]')?.addEventListener('click', () => {
    root.classList.add('hint-swiped');
    flip(true);
  });
  dots.forEach((d) => d.addEventListener('click', () => show(Number(d.dataset.deckDot))));
  root.addEventListener('keydown', (e) => {
    if ((e.target as Element).closest('[data-deck-card]')) return;
    if (e.key === 'ArrowLeft') flip(false);
    if (e.key === 'ArrowRight') flip(true);
  });

  // The fan opens when it comes into view
  front(0);
  request();
  const seen = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      seen.disconnect();
      revealed = true;
      front(order[0]);
      request();
    },
    { threshold: 0.25 },
  );
  seen.observe(root);
}
