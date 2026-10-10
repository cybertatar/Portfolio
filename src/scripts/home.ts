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
      spacer.style.height =
        mob && last ? `${Math.max(0, innerHeight - 16 - last.offsetHeight - 144)}px` : '0px';
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
