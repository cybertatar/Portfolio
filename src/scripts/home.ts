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

/** Each card recedes (lifts, shrinks, fades) as the next sticky card slides over it. */
export function initCardStack(feed: HTMLElement, slots: HTMLElement[], spacer: HTMLElement | null) {
  let ticking = false;

  const update = () => {
    ticking = false;
    const mob = matchMedia(MOBILE).matches;
    const off = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cfg = mob ? STACK.mobile : STACK.desktop;
    const top = mob ? 0 : feed.getBoundingClientRect().top;
    const visible = slots.filter((el) => el.offsetParent !== null);
    const last = visible[visible.length - 1];

    // Mobile: room after the footer so the last card can reach the top and cover the previous one.
    if (spacer) {
      // The footer and its 48px top margin sit between the last card and the spacer
      const footer = (spacer.previousElementSibling as HTMLElement | null)?.offsetHeight ?? 0;
      spacer.style.height =
        mob && last
          ? `${Math.max(0, innerHeight - 16 - last.offsetHeight - footer - 48)}px`
          : '0px';
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
