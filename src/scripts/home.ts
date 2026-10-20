import { localized, showDialog } from './dialog';
import { isBirthday, levelOn } from './level';

const MOBILE = '(max-width: 960px)';

/** Card-stack motion. Desktop and mobile values come from the design handoff. */
const STACK = {
  desktop: { travel: 480, lift: 72, scale: 0.06, fade: 0.35 },
  mobile: { travel: 320, lift: 24, scale: 0.03, fade: 0 },
};

/** Shrink the profile card in stages (0→3) until it fits the viewport height. Desktop only. */
export function initProfileFit(aside: HTMLElement) {
  const fit = () => {
    if (matchMedia(MOBILE).matches) {
      aside.dataset.stage = '0';
      return;
    }
    const room = Math.max(0, innerHeight - 48);
    for (const n of [0, 1, 2, 3]) {
      aside.dataset.stage = String(n);
      if (aside.scrollHeight <= Math.min(room, aside.clientHeight) + 8) return;
    }
  };

  let roTimer: ReturnType<typeof setTimeout> | undefined;
  new ResizeObserver(() => {
    clearTimeout(roTimer);
    roTimer = setTimeout(fit, 80);
  }).observe(aside);

  fit();
  requestAnimationFrame(fit);
  setTimeout(fit, 400);
  addEventListener('resize', fit);
  addEventListener('load', fit);
  document.fonts?.ready.then(fit);
}

/**
 * Each card recedes (lifts, shrinks, fades) as the next sticky card slides over it.
 * The footer fills what the last card leaves of the screen, so the scroll ends exactly with
 * the last card at its sticky top and the footer on the bottom edge.
 */
export function initCardStack(feed: HTMLElement, slots: HTMLElement[], footer: HTMLElement | null) {
  let ticking = false;

  const update = () => {
    ticking = false;
    const mob = matchMedia(MOBILE).matches;
    const off = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cfg = mob ? STACK.mobile : STACK.desktop;
    const top = mob ? 0 : feed.getBoundingClientRect().top;
    const visible = slots.filter((el) => el.offsetParent !== null);
    const last = visible[visible.length - 1];

    if (footer && last) {
      const lastTop = parseFloat(getComputedStyle(last).top) || 0;
      const gap = parseFloat(getComputedStyle(footer).marginTop) || 0;
      // CSS min-height wins when the screen is too short for both
      const h = `${Math.floor(innerHeight - lastTop - last.offsetHeight - gap)}px`;
      if (footer.style.height !== h) footer.style.height = h;
    }

    visible.forEach((slot, i) => {
      const next = visible[i + 1];
      if (off || !next) {
        slot.style.transform = 'none';
        slot.style.opacity = '1';
        return;
      }
      const stickyTop = parseFloat(getComputedStyle(slot).top) || 0;
      const d = next.getBoundingClientRect().top - top - stickyTop;
      const p = Math.min(1, Math.max(0, 1 - d / cfg.travel));
      slot.style.transform = `translate3d(0, ${-cfg.lift * p}px, 0) scale(${1 - cfg.scale * p})`;
      slot.style.opacity = String(1 - cfg.fade * p);
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  feed.addEventListener('scroll', onScroll, { passive: true });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
}

/** Keeps the level badge in step with the real age and says "Level up!" on the birthday. */
export function initLevel(el: HTMLElement, birthday: string, message: { ru: string; en: string }) {
  const level = levelOn(birthday);
  el.textContent = String(level);
  if (!isBirthday(birthday)) return;

  // Once per day and visitor; storage may be unavailable, then it simply shows again.
  const key = `level-up-${new Date().getFullYear()}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
  const text = localized(message.ru, message.en).replace('{n}', String(level));
  setTimeout(() => showDialog(text), 900);
}

/** Locked cases: the lock shakes and a dialog says there's not enough mana. */
export function initLocked(cards: HTMLElement[]) {
  cards.forEach((card) => {
    const lock = card.querySelector<HTMLElement>('[data-lock]');
    const open = () => {
      showDialog(localized(card.dataset.msg ?? '', card.dataset.msgEn));
      if (!lock) return;
      lock.classList.remove('is-shaking');
      void lock.offsetWidth; // restart the animation
      lock.classList.add('is-shaking');
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}

/**
 * Poking the portrait: it flinches and says the next line, like an NPC clicked once too often.
 * The lines come as JSON in data-pokes (data-en-pokes takes its place in English, see lang).
 */
export function initPoke(el: HTMLElement) {
  let i = 0;
  el.addEventListener('click', () => {
    let lines: string[] = [];
    try {
      lines = JSON.parse(el.dataset.pokes ?? '[]');
    } catch {
      /* ignore */
    }
    if (!lines.length) return;
    showDialog(lines[i]);
    // After the achievement, start over from the second line: the greeting is said once.
    i = i + 1 < lines.length ? i + 1 : Math.min(1, lines.length - 1);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.remove('is-hit');
    void el.offsetWidth; // restart the animation
    el.classList.add('is-hit');
  });
}

/** Side-quest card width on desktop: narrower ones turn squarish, wider ones too long (owner). */
const SIDE_CARD = { min: 340, max: 420 };

/**
 * Side quests: as many whole cards as fit the row, 340–420px each. When there are more, the
 * neighbours peek in at the sides, faded under the arrows; the arrows and a swipe move one card
 * at a time and always stop on whole cards.
 */
export function initSideQuests(side: HTMLElement) {
  const row = side.querySelector<HTMLElement>('[data-side-row]');
  const prev = side.querySelector<HTMLButtonElement>('[data-side-prev]');
  const next = side.querySelector<HTMLButtonElement>('[data-side-next]');
  if (!row || !prev || !next) return;
  const cards = [...row.children] as HTMLElement[];
  let step = 0;
  let pad = 0;

  // The fade covers exactly what the whole cards leave of the row on each side
  const fades = () => {
    const box = row.getBoundingClientRect();
    const whole = cards
      .map((c) => c.getBoundingClientRect())
      .filter((r) => r.left >= box.left - 1 && r.right <= box.right + 1);
    if (!whole.length) return;
    side.style.setProperty('--fade-l', `${Math.max(0, whole[0].left - box.left)}px`);
    side.style.setProperty(
      '--fade-r',
      `${Math.max(0, box.right - whole[whole.length - 1].right)}px`,
    );
  };

  const edges = () => {
    const max = row.scrollWidth - row.clientWidth;
    const left = row.scrollLeft > 2;
    const right = row.scrollLeft < max - 2;
    side.toggleAttribute('data-more-left', left);
    side.toggleAttribute('data-more-right', right);
    prev.hidden = !left;
    next.hidden = !right;
  };

  const layout = () => {
    if (matchMedia(MOBILE).matches) {
      // Phone: CSS sizes the cards, the row runs to the screen edges
      side.style.removeProperty('--card-w');
      row.style.removeProperty('scroll-padding-inline');
      step = (cards[0]?.offsetWidth ?? 0) + (parseFloat(getComputedStyle(row).columnGap) || 0);
      edges();
      return;
    }
    const w = row.clientWidth;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    const peek = parseFloat(getComputedStyle(side).getPropertyValue('--peek')) || 0;
    const fit = (room: number) => Math.max(1, Math.floor((room + gap) / (SIDE_CARD.min + gap)));
    let n = fit(w);
    let room = w;
    if (cards.length > n) {
      // Leave at least a peek of a neighbour on each side
      room = w - 2 * (gap + peek);
      n = fit(room);
    } else {
      n = cards.length;
    }
    const cardW = Math.min(SIDE_CARD.max, Math.floor((room - gap * (n - 1)) / n));
    // Whole cards stop in the middle, with equal peeks on both sides
    pad = cards.length > n ? Math.floor((w - n * cardW - (n - 1) * gap) / 2) : 0;
    side.style.setProperty('--card-w', `${cardW}px`);
    row.style.scrollPaddingInline = `${pad}px`;
    step = cardW + gap;
    edges();
    fades();
  };

  const go = (dir: 1 | -1) => {
    const max = row.scrollWidth - row.clientWidth;
    const at = Math.round((row.scrollLeft + (row.scrollLeft > 2 ? pad : 0)) / step);
    const to = Math.min(cards.length - 1, Math.max(0, at + dir));
    const left = Math.min(max, Math.max(0, to * step - (to > 0 ? pad : 0)));
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
  };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  let settle: ReturnType<typeof setTimeout> | undefined;
  row.addEventListener(
    'scroll',
    () => {
      edges();
      clearTimeout(settle);
      settle = setTimeout(fades, 120);
    },
    { passive: true },
  );
  new ResizeObserver(layout).observe(row);
  layout();
}
