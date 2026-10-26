/**
 * Case page behaviour: the contents highlight the section being read, the mobile bar opens
 * the contents as a list, the home screen's callouts switch between before and after.
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

/**
 * The home screen's callouts (Annotated.astro): the switch flips the screen, its marks and the
 * leaders between "now" and "was"; a tap on the phone flips it too. On a wide stage each callout
 * sits level with its "now" mark, never closer than 20px to the one above, and a dashed elbow
 * runs from it past the phone's edge to the mark of each state. Hovering a callout lights its
 * leader and marks.
 */
export function initAnnotated(root: HTMLElement) {
  const field = root.querySelector<HTMLElement>('[data-ann-field]');
  const phone = root.querySelector<HTMLElement>('[data-ann-phone]');
  const svg = root.querySelector<SVGSVGElement>('[data-ann-leaders]');
  if (!field || !phone || !svg) return;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-ann-to]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-ann-item]')];
  const rings = [...root.querySelectorAll<HTMLElement>('[data-ann-ring]')];
  const pins = [...root.querySelectorAll<HTMLElement>('.pin')];

  const show = (state: string) => {
    root.dataset.state = state;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.annTo === state)));
  };
  buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.annTo ?? 'now')));
  phone.addEventListener('click', () => show(root.dataset.state === 'now' ? 'was' : 'now'));

  const light = (n: string | undefined) => {
    items.forEach((el) => el.classList.toggle('is-lit', el.dataset.annItem === n));
    rings.forEach((el) => el.classList.toggle('is-lit', el.dataset.annRing === n));
    svg
      .querySelectorAll<SVGGElement>('g[data-n]')
      .forEach((g) => g.classList.toggle('is-lit', g.dataset.n === n));
  };
  items.forEach((el) => {
    el.addEventListener('pointerenter', () => light(el.dataset.annItem));
    el.addEventListener('pointerleave', () => light(undefined));
  });

  const GAP = 20;
  const clipId = `ann-screen-${Math.random().toString(36).slice(2, 8)}`;
  const NS = 'http://www.w3.org/2000/svg';
  const layout = () => {
    svg.replaceChildren();
    const wide = root.clientWidth > 760;
    root.toggleAttribute('data-laid', wide);
    root.querySelectorAll<HTMLElement>('.side').forEach((list) => (list.style.height = ''));
    items.forEach((el) => (el.style.top = ''));
    if (!wide) {
      // The small numbers sit at fractions of the screen; on a half pixel their figures snap
      // up or down a pixel from one badge to the next. Put each centre on a whole pixel
      pins.forEach((pin) => (pin.style.translate = ''));
      pins.forEach((pin) => {
        const b = pin.getBoundingClientRect();
        const x = b.left + b.width / 2;
        const y = b.top + b.height / 2;
        pin.style.translate = `${Math.round(x) - x}px ${Math.round(y) - y}px`;
      });
      return;
    }

    const f = field.getBoundingClientRect();
    const p = phone.getBoundingClientRect();
    const screen = { top: p.top + (p.height * 23) / 920, height: (p.height * 874) / 920 };
    const clip = document.createElementNS(NS, 'clipPath');
    clip.id = clipId;
    const rect = document.createElementNS(NS, 'rect');
    Object.entries({
      x: p.left - f.left + (p.width * 24) / 450,
      y: screen.top - f.top,
      width: (p.width * 402) / 450,
      height: screen.height,
      rx: (p.width * 60) / 450,
    }).forEach(([k, v]) => rect.setAttribute(k, String(v)));
    clip.append(rect);
    const defs = document.createElementNS(NS, 'defs');
    defs.append(clip);
    svg.append(defs);
    // Runs of every leader, to break one where another crosses it
    const runs: {
      g: SVGGElement;
      state: string;
      x: number;
      y0: number;
      y1: number;
      y: number;
      from: number;
    }[] = [];
    root.querySelectorAll<HTMLElement>('.side').forEach((list) => {
      const left = list.classList.contains('left');
      const top = list.getBoundingClientRect().top;
      let floor = -Infinity;
      const own = [...list.querySelectorAll<HTMLElement>('[data-ann-item]')];
      for (const [i, el] of own.entries()) {
        const num = el.querySelector<HTMLElement>('.num');
        if (!num) continue;
        const head = num.offsetTop + num.offsetHeight / 2;
        const want = screen.top + Number(el.dataset.nowY) * screen.height - top - head;
        const y = Math.max(want, floor);
        el.style.top = `${y}px`;
        floor = y + el.offsetHeight + GAP;

        // From beside the number, along to just past the phone, then to the mark
        const n = num.getBoundingClientRect();
        const x0 = (left ? n.right + 8 : n.left - 8) - f.left;
        const y0 = n.top + n.height / 2 - f.top;
        // Each leader turns in its own column, lower ones nearer the phone, so the vertical
        // runs of neighbours never join up into one line
        const off = 8 + (own.length - 1 - i) * 6;
        const edge = (left ? p.left - off : p.right + off) - f.left;
        rings
          .filter((r) => r.dataset.annRing === el.dataset.annItem)
          .forEach((r) => {
            const b = r.getBoundingClientRect();
            const cx = b.left + b.width / 2 - f.left;
            const cy = b.top + b.height / 2 - f.top;
            // Square corners only: along to just past the phone, down or up to the mark's
            // height (or its lane), then straight in to it; a dot marks the spot
            const g = document.createElementNS(NS, 'g');
            g.classList.add(r.classList.contains('was') ? 'was' : 'now');
            g.dataset.n = el.dataset.annItem;
            const lane = r.dataset.lane
              ? screen.top - f.top + Number(r.dataset.lane) * screen.height
              : cy;
            const d = `M${x0} ${y0}H${edge}V${lane}H${cx}V${cy}`;
            const add = (tag: string, cls: string, attrs: Record<string, string | number>) => {
              const node = document.createElementNS(NS, tag);
              node.setAttribute('class', cls);
              Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
              g.append(node);
            };
            add('path', 'out', { d });
            // The same dashes, lighter where they cross the screen
            add('path', 'in', { d, 'clip-path': `url(#${clipId})` });
            add('circle', 'dot', { cx, cy, r: 3 });
            svg.append(g);
            const state = r.classList.contains('was') ? 'was' : 'now';
            runs.push({
              g,
              state,
              x: edge,
              y0: Math.min(y0, lane),
              y1: Math.max(y0, lane),
              y: y0,
              from: x0,
            });
          });
      }
      list.style.height = `${Math.max(0, floor - GAP)}px`;
    });

    // Where one leader's way in from its callout crosses another's vertical run (the cashback
    // fork down to the tab bar passes the history callout), the vertical one breaks for a
    // moment, as on a drawing, so the two read as separate lines
    for (const v of runs) {
      const holes = runs.filter(
        (h) =>
          h.g !== v.g &&
          h.state === v.state &&
          h.g.dataset.n !== v.g.dataset.n &&
          h.y > v.y0 + 4 &&
          h.y < v.y1 - 4 &&
          v.x > Math.min(h.x, h.from) &&
          v.x < Math.max(h.x, h.from),
      );
      if (!holes.length) continue;
      const mask = document.createElementNS(NS, 'mask');
      mask.id = `${clipId}-${runs.indexOf(v)}`;
      mask.setAttribute('maskUnits', 'userSpaceOnUse');
      const square = (x: number, y: number, size: number, fill: string) => {
        const node = document.createElementNS(NS, 'rect');
        Object.entries({
          x: x - size / 2,
          y: y - size / 2,
          width: size,
          height: size,
          fill,
        }).forEach(([k, val]) => node.setAttribute(k, String(val)));
        mask.append(node);
      };
      square(v.x, (v.y0 + v.y1) / 2, 20000, '#fff');
      holes.forEach((h) => square(v.x, h.y, 10, '#000'));
      defs.append(mask);
      v.g.setAttribute('mask', `url(#${mask.id})`);
    }
  };

  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      layout();
    });
  };
  new ResizeObserver(queue).observe(root);
  document.fonts.ready.then(queue);
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

  // The caption and the clock change while the race runs, and a line more or less moved the
  // page under them. Each lane tries every text it will show in the live elements themselves
  // (invisible copies wrapped differently in Safari) and keeps the tallest as the minimum
  const lock = () => {
    for (const l of lanes) {
      const time = l.clock?.parentElement;
      const caption = l.caption?.closest<HTMLElement>('p');
      if (!time || !caption || !l.clock || !l.step || !l.caption) continue;
      const was = [l.clock.textContent, l.step.textContent, l.caption.textContent];
      time.style.minHeight = caption.style.minHeight = '';
      let timeH = 0;
      for (const text of [clock(0), l.finish]) {
        l.clock.textContent = text;
        timeH = Math.max(timeH, time.getBoundingClientRect().height);
      }
      let captionH = 0;
      for (let step = 1; step <= l.steps; step++) {
        l.step.textContent = String(step);
        for (const text of l.captions) {
          l.caption.textContent = text;
          captionH = Math.max(captionH, caption.getBoundingClientRect().height);
        }
      }
      [l.clock.textContent, l.step.textContent, l.caption.textContent] = was;
      time.style.minHeight = `${timeH}px`;
      caption.style.minHeight = `${captionH}px`;
    }
  };
  let width = 0;
  new ResizeObserver(([entry]) => {
    if (entry.contentRect.width === width) return;
    width = entry.contentRect.width;
    lock();
  }).observe(root);
  document.fonts?.ready.then(lock);

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
