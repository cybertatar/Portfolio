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

/**
 * "Before / after" race (Race.astro): both flows start together when the race comes into
 * view and run at their measured times, sped up. Pauses off screen; "Ещё раз" restarts.
 * With reduced motion it stays on the finish the page renders.
 */
export function initRace(root: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const speed = Number(root.dataset.speed) || 7;
  const replay = root.querySelector<HTMLButtonElement>('[data-replay]');
  const lanes = [...root.querySelectorAll<HTMLElement>('[data-lane]')].map((el) => ({
    el,
    seconds: Number(el.dataset.seconds),
    steps: Number(el.dataset.steps),
    captions: JSON.parse(el.dataset.captions ?? '[]') as string[],
    aways: JSON.parse(el.dataset.aways ?? '[]') as string[],
    away: el.querySelector<HTMLElement>('[data-away]'),
    shown: -1,
    screens: [...el.querySelectorAll<HTMLElement>('[data-screen]')],
    cells: [...el.querySelectorAll<HTMLElement>('[data-cell]')],
    clock: el.querySelector<HTMLElement>('[data-clock]'),
    step: el.querySelector<HTMLElement>('[data-step]'),
    caption: el.querySelector<HTMLElement>('[data-caption]'),
  }));
  const longest = Math.max(...lanes.map((l) => l.seconds));
  const clock = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // Real seconds of the race shown so far, then paint every lane at that moment
  let elapsed = 0;
  let last = 0;
  let frame = 0;
  let visible = false;
  const paint = () => {
    for (const l of lanes) {
      const t = Math.min(elapsed, l.seconds);
      const done = t >= l.seconds;
      const n = l.screens.length;
      const screen = done ? n - 1 : Math.min(n - 1, Math.floor((t / l.seconds) * (n - 1)));
      const steps = done ? l.steps : Math.floor((t / l.seconds) * l.steps);
      if (screen !== l.shown) {
        const prev = l.shown;
        l.screens.forEach((s, i) => {
          s.classList.toggle('is-on', i === screen);
          s.classList.toggle('was', i === prev);
          s.classList.remove('enter');
        });
        // Not on the first paint or a replay: the start screen just appears
        if (prev !== -1 && screen > 0) {
          const next = l.screens[screen];
          void next.offsetWidth;
          next.classList.add('enter');
          next.addEventListener('animationend', () => l.screens[prev]?.classList.remove('was'), {
            once: true,
          });
        }
        l.shown = screen;
      }
      if (l.away) l.away.textContent = l.aways[screen] ?? '';
      l.cells.forEach((c, i) => c.classList.toggle('is-on', i < steps));
      if (l.clock) l.clock.textContent = clock(t);
      if (l.step) l.step.textContent = String(Math.max(1, steps));
      if (l.caption) l.caption.textContent = l.captions[screen] ?? '';
      l.el.classList.toggle('is-done', done);
    }
  };
  const tick = (now: number) => {
    elapsed = Math.min(longest, elapsed + ((now - last) / 1000) * speed);
    last = now;
    paint();
    frame = elapsed < longest && visible ? requestAnimationFrame(tick) : 0;
  };
  const run = () => {
    if (frame || elapsed >= longest) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  paint();
  if (replay) {
    replay.hidden = false;
    replay.addEventListener('click', () => {
      elapsed = 0;
      lanes.forEach((l) => (l.shown = -1));
      paint();
      run();
    });
  }
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) run();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { threshold: 0.5 },
  ).observe(root);
}
