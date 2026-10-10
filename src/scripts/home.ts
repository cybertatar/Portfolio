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

/**
 * Item tooltip for elements with `data-tip` (title), `data-tip-type` and `data-tip-text`
 * (plus `-en` variants). One fixed element, so the sidebar's overflow doesn't clip it.
 */
export function initTooltips() {
  const items = [...document.querySelectorAll<HTMLElement>('[data-tip]')];
  if (!items.length) return;

  const tip = document.createElement('div');
  tip.className = 'px-tip px-clip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.append(tip);

  const show = (el: HTMLElement) => {
    const en = document.documentElement.lang === 'en';
    const d = el.dataset;
    tip.replaceChildren(
      ...[
        ['px-tip-title', d.tip],
        ['px-tip-type', en ? d.tipTypeEn : d.tipType],
        ['px-tip-text', en ? d.tipTextEn : d.tipText],
      ]
        .filter(([, text]) => text)
        .map(([cls, text]) => {
          const line = document.createElement('span');
          line.className = cls!;
          line.textContent = text!;
          return line;
        }),
    );
    tip.hidden = false;
    const r = el.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, r.left + r.width / 2 - t.width / 2),
      innerWidth - t.width - 8,
    );
    const above = r.top - t.height - 8;
    tip.style.left = `${left}px`;
    tip.style.top = `${above >= 8 ? above : r.bottom + 8}px`;
  };
  const hide = () => {
    tip.hidden = true;
  };

  items.forEach((el) => {
    el.addEventListener('pointerenter', () => show(el));
    el.addEventListener('pointerleave', hide);
    el.addEventListener('focus', () => show(el));
    el.addEventListener('blur', hide);
  });
  addEventListener('scroll', hide, { passive: true, capture: true });
}
