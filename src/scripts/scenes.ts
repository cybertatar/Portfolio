/**
 * Looping pixel scenes on the case page (they replace the co-author's videos). A scene is
 * a list of states: the root's data-state switches on a timer and CSS does the rest. The
 * loop runs only while the scene is on screen (and, inside the process deck, on the front
 * card). Under the scene sit its controls (SceneControls.astro): pause and a timeline cut
 * into chapters at the key moments, a click on a chapter jumps there. With reduced motion
 * the scene stays on its `still` state until the reader presses play.
 */
type Mark = string | { ru: string; en: string };

export interface SceneStep {
  state: string;
  ms: number;
  /** Called when the step starts, e.g. to type out a line. */
  enter?: (root: HTMLElement) => void;
  /** A key moment starts here: a chapter on the timeline. */
  mark?: Mark;
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const markText = (m: Mark) =>
  typeof m === 'string' ? m : document.documentElement.lang === 'en' ? m.en : m.ru;

interface Job {
  due: number;
  fn: () => void;
  keep: boolean;
  id?: ReturnType<typeof setTimeout>;
}

/**
 * The scene's own time: it stops on pause, so every timer of a step (the cursor's moves,
 * typed letters) waits with it instead of running on behind a frozen picture.
 */
export class SceneClock {
  private start = performance.now();
  private stoppedAt: number | null = null;
  private jobs = new Set<Job>();

  now() {
    return (this.stoppedAt ?? performance.now()) - this.start;
  }
  get paused() {
    return this.stoppedAt !== null;
  }
  private arm(job: Job) {
    job.id = setTimeout(
      () => {
        this.jobs.delete(job);
        job.fn();
      },
      Math.max(0, job.due - this.now()),
    );
  }
  /** Runs fn after ms of scene time. `keep` jobs survive clear() (the step timer). */
  at(ms: number, fn: () => void, keep = false) {
    const job: Job = { due: this.now() + ms, fn, keep };
    this.jobs.add(job);
    if (!this.paused) this.arm(job);
    return job;
  }
  cancel(job: Job | undefined) {
    if (!job) return;
    clearTimeout(job.id);
    this.jobs.delete(job);
  }
  /** Drops the step's timers, not the step timer itself. */
  clear() {
    for (const job of this.jobs) if (!job.keep) this.cancel(job);
  }
  pause() {
    if (this.paused) return;
    this.stoppedAt = performance.now();
    this.jobs.forEach((job) => clearTimeout(job.id));
  }
  resume() {
    if (this.stoppedAt === null) return;
    this.start += performance.now() - this.stoppedAt;
    this.stoppedAt = null;
    this.jobs.forEach((job) => this.arm(job));
  }
}

/** The scene's controls: the block marked data-scene-controls in the same host. */
const controlsOf = (el: HTMLElement) =>
  el.closest('[data-scene-host]')?.querySelector<HTMLElement>('[data-scene-controls]') ?? null;

interface Chapter {
  label: string;
  /** Start and length on the timeline, as fractions of the loop. */
  from: number;
  size: number;
  fill: HTMLElement;
  button: HTMLButtonElement;
}

/**
 * Builds the timeline in the controls and wires the pause button. Returns a painter for the
 * position (a fraction of the loop) and a setter for the button's state.
 */
export function wireControls(
  box: HTMLElement,
  chapters: { label: string; from: number; size: number }[],
  on: { toggle: () => void; seek: (from: number) => void },
) {
  const toggle = box.querySelector<HTMLButtonElement>('[data-scene-toggle]')!;
  const track = box.querySelector<HTMLElement>('[data-scene-track]')!;
  const en = document.documentElement.lang === 'en';
  const parts: Chapter[] = chapters.map((c, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chapter';
    button.style.flexGrow = String(c.size);
    button.setAttribute(
      'aria-label',
      en
        ? `${c.label}, part ${i + 1} of ${chapters.length}`
        : `${c.label}, часть ${i + 1} из ${chapters.length}`,
    );
    const bar = document.createElement('span');
    bar.className = 'chapter-bar';
    const fill = document.createElement('span');
    fill.className = 'chapter-fill';
    bar.append(fill);
    const name = document.createElement('span');
    name.className = 'chapter-name';
    name.textContent = c.label;
    button.append(bar, name);
    button.addEventListener('click', () => on.seek(c.from));
    track.append(button);
    return { ...c, fill, button };
  });
  toggle.addEventListener('click', on.toggle);
  box.hidden = false;

  let shown = -1;
  return {
    paint(at: number) {
      parts.forEach((c, i) => {
        const p = Math.min(1, Math.max(0, (at - c.from) / c.size));
        c.fill.style.transform = `scaleX(${p})`;
        if (at >= c.from && at < c.from + c.size && shown !== i) {
          shown = i;
          parts.forEach((x, n) => x.button.toggleAttribute('data-current', n === i));
        }
      });
    },
    /** 'done': at the end of a run that does not loop (the race), the button replays it. */
    playing(on: boolean | 'done') {
      toggle.dataset.playing = String(on);
      const name =
        on === 'done'
          ? en
            ? 'Replay'
            : 'Ещё раз'
          : on
            ? en
              ? 'Pause'
              : 'Пауза'
            : en
              ? 'Play'
              : 'Играть';
      toggle.setAttribute('aria-label', name);
    },
  };
}

export function runScene(
  root: HTMLElement,
  steps: SceneStep[],
  still: string,
  clock = new SceneClock(),
) {
  const total = steps.reduce((sum, s) => sum + s.ms, 0);
  const starts = steps.map((_, i) => steps.slice(0, i).reduce((sum, s) => sum + s.ms, 0));

  let i = 0;
  let stepAt = 0;
  let stepJob: ReturnType<SceneClock['at']> | undefined;
  const play = (n: number) => {
    i = n;
    const step = steps[i];
    clock.clear();
    clock.cancel(stepJob);
    root.dataset.state = step.state;
    stepAt = clock.now();
    step.enter?.(root);
    stepJob = clock.at(step.ms, () => play((i + 1) % steps.length), true);
  };
  const position = () => (starts[i] + Math.min(steps[i].ms, clock.now() - stepAt)) / total;

  // A card in the process deck: covered or not yet arrived, it waits (initChapters in case.ts)
  const card = root.closest<HTMLElement>('[data-chapter]');
  const box = controlsOf(root);
  let visible = false;
  // The reader's pause holds until they press play; with reduced motion the scene starts held
  let held = reduced();
  let begun = false;
  let frame = 0;
  let ui: ReturnType<typeof wireControls> | undefined;

  const loop = () => {
    ui?.paint(position());
    frame = clock.paused ? 0 : requestAnimationFrame(loop);
  };
  const sync = () => {
    const on = visible && card?.dataset.front !== 'false' && !held;
    ui?.playing(!held);
    if (on === !clock.paused && begun) return;
    if (on) {
      if (!begun) {
        begun = true;
        clock.pause();
        play(0);
      }
      clock.resume();
      root.removeAttribute('data-paused');
      if (!frame) frame = requestAnimationFrame(loop);
    } else {
      clock.pause();
      // Freezes the CSS loops too (blinking, dust), see global.css
      if (begun) root.dataset.paused = '';
    }
  };

  if (box) {
    const chapters: { label: string; from: number; size: number }[] = [];
    steps.forEach((s, n) => {
      if (s.mark || !chapters.length)
        chapters.push({ label: markText(s.mark ?? ''), from: starts[n] / total, size: 0 });
      chapters[chapters.length - 1].size += s.ms / total;
    });
    ui = wireControls(box, chapters, {
      toggle: () => {
        held = !held;
        sync();
      },
      seek: (from) => {
        const n = starts.findIndex((s) => Math.abs(s / total - from) < 1e-9);
        begun = true;
        if (!clock.paused) play(n);
        else {
          // Held: show the chapter's first frame, its timers start with play
          play(n);
          root.dataset.paused = '';
        }
        ui?.paint(position());
      },
    });
    ui.playing(!held);
  }

  if (reduced()) {
    root.dataset.state = still;
    root.querySelectorAll<HTMLElement>('[data-type]').forEach((el) => {
      el.textContent = el.dataset.type ?? '';
    });
    ui?.paint(1);
  } else {
    root.dataset.state = steps[0].state;
  }
  card?.addEventListener('chapter:front', sync);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0.3 },
  ).observe(root);
}

/** Types the element's data-type text letter by letter, like the game dialog box. */
export function typeOut(el: HTMLElement | null, perChar = 32, clock?: SceneClock) {
  if (!el) return;
  const text = el.dataset.type ?? '';
  const host = el as HTMLElement & { _t?: (() => void)[] };
  host._t?.forEach((stop) => stop());
  const next: (() => void)[] = [];
  el.textContent = '';
  [...text].forEach((_, n) => {
    const show = () => (el.textContent = text.slice(0, n + 1));
    if (clock) {
      const job = clock.at(n * perChar, show);
      next.push(() => clock.cancel(job));
    } else {
      const id = setTimeout(show, n * perChar);
      next.push(() => clearTimeout(id));
    }
  });
  host._t = next;
}

/** A muted looping video on the same terms as runScene: it plays only while on screen and,
 * inside the process deck, on the front card; with reduced motion it stays on its poster
 * until play. Its controls show one chapter: the clip's progress, a click seeks. */
export function playWhileShown(video: HTMLVideoElement) {
  const card = video.closest<HTMLElement>('[data-chapter]');
  const box = controlsOf(video);
  let visible = false;
  let held = reduced();
  let frame = 0;
  const ui = box
    ? wireControls(box, [{ label: box.dataset.chapterName ?? '', from: 0, size: 1 }], {
        toggle: () => {
          held = !held;
          sync();
        },
        seek: () => {},
      })
    : undefined;
  const loop = () => {
    if (video.duration) ui?.paint(video.currentTime / video.duration);
    frame = video.paused ? 0 : requestAnimationFrame(loop);
  };
  // A click on the timeline seeks to that point of the clip
  box?.querySelector('.chapter')?.addEventListener('click', (e) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (video.duration)
      video.currentTime = (((e as MouseEvent).clientX - r.left) / r.width) * video.duration;
    if (video.duration) ui?.paint(video.currentTime / video.duration);
  });
  const sync = () => {
    ui?.playing(!held);
    const on = visible && card?.dataset.front !== 'false' && !held;
    if (on === !video.paused) return;
    if (on) {
      video
        .play()
        .then(() => {
          if (!frame) frame = requestAnimationFrame(loop);
        })
        .catch(() => {});
    } else video.pause();
  };
  ui?.playing(!held);
  card?.addEventListener('chapter:front', sync);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0.3 },
  ).observe(video);
}
