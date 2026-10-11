/**
 * Case page behaviour: the contents highlight the section being read, the mobile bar opens
 * the contents as a list, before/after sliders follow their range inputs.
 */

/** Marks the link of the section under the reading line (a third down the screen). */
export function initScrollSpy(links: HTMLAnchorElement[], current: HTMLElement | null) {
  const sections = links
    .map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))
    .filter((el): el is HTMLElement => el !== null);
  if (!sections.length) return;

  let active = '';
  let ticking = false;

  const update = () => {
    ticking = false;
    const line = innerHeight / 3;
    let id = sections[0].id;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= line) id = s.id;
    }
    // The last section may be too short to reach the line: the page end counts as reaching it
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
      id = sections[sections.length - 1].id;
    }
    if (id === active) return;
    active = id;
    links.forEach((a) => {
      const on = a.hash === `#${id}`;
      if (on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
      if (on && current && a.closest('[data-case-menu]')) {
        current.textContent = a.dataset.title ?? a.textContent ?? '';
      }
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
}

/** Mobile bar: the toggle opens the contents; a pick, Escape or a tap outside closes them. */
export function initCaseMenu(bar: HTMLElement) {
  const toggle = bar.querySelector<HTMLButtonElement>('[data-case-toggle]');
  const menu = bar.querySelector<HTMLElement>('[data-case-menu]');
  if (!toggle || !menu) return;

  const set = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      set(false);
      toggle.focus();
    }
  });
  addEventListener('click', (e) => {
    if (!menu.hidden && !bar.contains(e.target as Node)) set(false);
  });
}

export function initCompare(root: HTMLElement) {
  const range = root.querySelector<HTMLInputElement>('[data-compare-range]');
  if (!range) return;
  const set = () => root.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', set);
  set();
}

/** Plays the results HUD once, when it comes into view (Hud.astro). */
export function initHud(root: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.dataset.armed = '';
  const seen = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      root.classList.add('is-on');
      seen.disconnect();
    },
    { threshold: 0.4 },
  );
  seen.observe(root);
}

/** Quest deck on phones (QuestDeck.astro): the dot of the card at the start of the swipe lights up. */
export function initQuestDeck(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>('[data-quest-track]');
  const cards = [...root.querySelectorAll<HTMLElement>('[data-quest-card]')];
  const dots = [...root.querySelectorAll<HTMLElement>('[data-quest-dot]')];
  if (!track || !cards.length) return;
  let queued = false;
  const update = () => {
    queued = false;
    const start =
      track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
    let current = 0;
    cards.forEach((card, i) => {
      const off = Math.abs(card.getBoundingClientRect().left - start);
      if (off < Math.abs(cards[current].getBoundingClientRect().left - start)) current = i;
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-on', i === current));
  };
  track.addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
}
