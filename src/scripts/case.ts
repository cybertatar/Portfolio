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
        current.textContent = a.textContent ?? '';
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

  // The whole phone drags the handle, by finger too: a native range moves on touch only from
  // its thumb. A tap jumps there; a finger going up or down scrolls the page (touch-action:
  // pan-y), the browser then cancels the pointer
  const moveTo = (x: number) => {
    const box = root.getBoundingClientRect();
    range.value = String(Math.round(Math.min(1, Math.max(0, (x - box.left) / box.width)) * 100));
    set();
  };
  let drag: { id: number; x: number; y: number; on: boolean } | null = null;
  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: e.pointerType === 'mouse' };
    if (drag.on) {
      e.preventDefault();
      range.focus({ preventScroll: true });
      root.setPointerCapture(e.pointerId);
      moveTo(e.clientX);
    }
  });
  root.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    if (!drag.on) {
      const dx = Math.abs(e.clientX - drag.x);
      if (dx < 6 || dx < Math.abs(e.clientY - drag.y)) return;
      drag.on = true;
      root.setPointerCapture(e.pointerId);
    }
    moveTo(e.clientX);
  });
  root.addEventListener('pointerup', (e) => {
    if (drag?.id === e.pointerId && !drag.on) moveTo(e.clientX);
    drag = null;
  });
  root.addEventListener('pointercancel', () => (drag = null));
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
    sames: JSON.parse(el.dataset.sames ?? '[]') as boolean[],
    away: el.querySelector<HTMLElement>('[data-away]'),
    shown: -1,
    screens: [...el.querySelectorAll<HTMLElement>('[data-screen]')],
    bar: el.querySelector<HTMLElement>('[data-bar]'),
    clock: el.querySelector<HTMLElement>('[data-clock]'),
    // The server renders the finish, the median as measured
    finish: el.querySelector<HTMLElement>('[data-clock]')?.textContent ?? '',
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
        // Not on the first paint or a replay (the start screen just appears), and not within
        // one view, where only a box gets ticked
        if (prev !== -1 && screen > 0 && !l.sames[screen]) {
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
      if (l.bar) l.bar.style.width = `${(t / longest) * 100}%`;
      if (l.clock) l.clock.textContent = done ? l.finish : clock(t);
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
  // Screens load lazily; fetch them all before the race nears and start only once they're
  // decoded, or a lane flashes black on its first swap
  const shots = lanes.flatMap((l) => l.screens) as HTMLImageElement[];
  let ready: Promise<unknown> | undefined;
  const preload = () =>
    (ready ??= Promise.all(
      shots.map((img) => {
        img.loading = 'eager';
        return img.decode().catch(() => undefined);
      }),
    ));
  new IntersectionObserver(
    ([entry], obs) => {
      if (entry.isIntersecting) {
        preload();
        obs.disconnect();
      }
    },
    { rootMargin: '800px 0px' },
  ).observe(root);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) void preload().then(() => visible && run());
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { threshold: 0.5 },
  ).observe(root);
}

/**
 * "Как мы работали" as a deck, after the co-author's version. On a desktop tall enough for
 * it the deck holds still while the page scrolls: each next card slides in from below, the
 * earlier ones step back (up, smaller, darker) and peek out over the top. Where it does not
 * fit (phone, low laptop) the cards stick one over another as the page scrolls, stepping
 * back the same way; with reduced motion they stay a plain list. Scenes play on the front
 * card only (data-front, the chapter:front event, see runScene).
 */
export function initChapters(root: HTMLElement) {
  const cabinet = root.querySelector<HTMLElement>('.cabinet');
  const run = root.querySelector<HTMLElement>('[data-chapters-run]');
  const cards = [...root.querySelectorAll<HTMLElement>('[data-chapter]')];
  if (!cabinet || !run || cards.length < 2) return;
  const dims = cards.map((card) => card.querySelector<HTMLElement>('[data-chapter-dim]'));
  const bar = document.querySelector<HTMLElement>('[data-case-bar]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // How an earlier card steps back for each card on top of it, and how deep the pile shows
  const OFFSET = 14;
  const SCALE = 0.04;
  const DIM = 0.05;
  const DEPTH = 3;
  const ROOM = OFFSET * DEPTH;
  const PAD = 24;
  const last = cards.length - 1;

  let mode: 'list' | 'deck' | 'stack' = 'list';
  let pin = 0; // deck: where the pile holds still
  let step = 1; // deck: scroll per card
  let travel = 0; // deck: how far below the pile a coming card starts
  let stick = 0; // stack: where each card sticks
  let pitch = 1; // stack: card height and gap
  let front = -2;
  let ticking = false;

  const clamp = (t: number, max: number) => Math.min(max, Math.max(0, t));

  const setFront = (index: number) => {
    if (index === front) return;
    front = index;
    cards.forEach((card, i) => {
      const on = index < 0 || i === index ? 'true' : 'false';
      if (card.dataset.front === on) return;
      card.dataset.front = on;
      card.dispatchEvent(new Event('chapter:front'));
    });
  };

  const progress = () =>
    mode === 'deck'
      ? clamp((pin - root.getBoundingClientRect().top) / step, last)
      : clamp((stick - cabinet.getBoundingClientRect().top) / pitch, last);

  const update = () => {
    ticking = false;
    if (mode === 'list') return;
    const p = progress();
    cards.forEach((card, i) => {
      const d = p - i;
      let transform = '';
      let dim = 0;
      let opacity = '';
      if (d < 0 && mode === 'deck') {
        transform = `translate3d(0, ${(Math.min(1, -d) * travel).toFixed(1)}px, 0)`;
        // Rises from just under the pile and shows up on the way, rather than flying in
        // from the bottom of a tall screen across empty space
        opacity = d < -1 ? '0' : Math.min(1, (1 + d) / 0.3).toFixed(3);
      } else if (d > 0) {
        const depth = Math.min(d, DEPTH);
        transform = `translate3d(0, ${(-OFFSET * depth).toFixed(1)}px, 0) scale(${(1 - SCALE * depth).toFixed(4)})`;
        dim = DIM * depth;
      }
      card.style.transform = transform;
      card.style.opacity = opacity;
      card.style.visibility = d > DEPTH + 1 || d < -1 ? 'hidden' : '';
      const layer = dims[i];
      if (layer) layer.style.opacity = dim.toFixed(3);
    });
    setFront(Math.round(p));
  };

  const layout = () => {
    root.classList.remove('is-deck', 'is-stack');
    ['--deck-pin', '--deck-stage', '--deck-room', '--card-h', '--stick-top'].forEach((name) =>
      root.style.removeProperty(name),
    );
    run.style.height = '';
    cards.forEach((card, i) => {
      card.style.transform = card.style.opacity = card.style.visibility = '';
      const layer = dims[i];
      if (layer) layer.style.opacity = '';
    });
    if (reduced.matches) {
      mode = 'list';
      setFront(-1);
      return;
    }

    // Natural heights as a list; every card takes the tallest, or a shorter one's bottom
    // would show from under the next
    const cardH = Math.max(...cards.map((card) => card.offsetHeight));
    const gap = parseFloat(getComputedStyle(cabinet).rowGap) || 0;
    const vh = innerHeight;
    const top = bar && bar.offsetParent ? bar.offsetHeight : 0;
    root.style.setProperty('--card-h', `${cardH}px`);
    root.style.setProperty('--deck-room', `${ROOM}px`);

    if (!top && ROOM + cardH + PAD * 2 <= vh) {
      mode = 'deck';
      // The pile holds where it sits under the section heading once the section reaches the
      // top of the screen. Centred instead, on a tall screen it stopped well below the heading
      // and the next card was already halfway in while the heading still showed.
      const section = root.closest('section') ?? root;
      const natural = root.getBoundingClientRect().top - section.getBoundingClientRect().top;
      pin = Math.round(Math.max(PAD, Math.min(natural, vh - ROOM - cardH - PAD)));
      step = Math.round(vh * 0.7);
      travel = Math.min(vh - pin - ROOM + 48, cardH + PAD * 4);
      root.style.setProperty('--deck-pin', `${pin}px`);
      root.style.setProperty('--deck-stage', `${ROOM + cardH}px`);
      run.style.height = `${step * last}px`;
      root.classList.add('is-deck');
    } else {
      mode = 'stack';
      // A card taller than the screen scrolls through first and sticks by its bottom
      stick = Math.min(top + 16 + ROOM, vh - cardH - 16);
      pitch = cardH + gap;
      root.style.setProperty('--stick-top', `${stick}px`);
      root.classList.add('is-stack');
    }
    front = -2;
    update();
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', layout, { passive: true });
  reduced.addEventListener('change', layout);
  layout();
  document.fonts?.ready.then(layout);
}
