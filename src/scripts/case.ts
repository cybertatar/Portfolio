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

/** Quest log (QuestLog.astro): one quest open at a time; ↑/↓ move between quests. */
export function initQuestLog(root: HTMLElement) {
  const quests = [...root.querySelectorAll<HTMLButtonElement>('[data-quest]')];
  const open = (quest: HTMLButtonElement) => {
    quests.forEach((q) => {
      const isOpen = q === quest;
      q.setAttribute('aria-expanded', String(isOpen));
      const page = document.getElementById(q.getAttribute('aria-controls') ?? '');
      if (page) page.hidden = !isOpen;
    });
  };
  quests.forEach((quest, i) => {
    quest.addEventListener('click', () => open(quest));
    quest.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const next = quests[(i + step + quests.length) % quests.length];
      next.focus();
      open(next);
    });
  });
}
