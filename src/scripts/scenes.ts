/**
 * Looping pixel scenes on the case page (they replace the co-author's videos). A scene is
 * a list of states: the root's data-state switches on a timer and CSS does the rest. The
 * loop runs only while the scene is on screen (and, inside the process deck, on the front
 * card); with reduced motion the scene stays on its `still` state.
 */
export interface SceneStep {
  state: string;
  ms: number;
  /** Called when the step starts, e.g. to type out a line. */
  enter?: (root: HTMLElement) => void;
}

export function runScene(root: HTMLElement, steps: SceneStep[], still: string) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.dataset.state = still;
    root.querySelectorAll<HTMLElement>('[data-type]').forEach((el) => {
      el.textContent = el.dataset.type ?? '';
    });
    return;
  }

  let i = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const play = () => {
    const step = steps[i];
    root.dataset.state = step.state;
    step.enter?.(root);
    timer = setTimeout(() => {
      i = (i + 1) % steps.length;
      play();
    }, step.ms);
  };

  // A card in the process deck: covered or not yet arrived, it waits (initChapters in case.ts)
  const card = root.closest<HTMLElement>('[data-chapter]');
  let visible = false;
  let playing = false;
  const sync = () => {
    const on = visible && card?.dataset.front !== 'false';
    if (on === playing) return;
    playing = on;
    clearTimeout(timer);
    if (on) play();
  };

  root.dataset.state = steps[0].state;
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
export function typeOut(el: HTMLElement | null, perChar = 32) {
  if (!el) return;
  const text = el.dataset.type ?? '';
  const timers = (el as HTMLElement & { _t?: ReturnType<typeof setTimeout>[] })._t;
  timers?.forEach(clearTimeout);
  const next: ReturnType<typeof setTimeout>[] = [];
  el.textContent = '';
  [...text].forEach((_, n) => {
    next.push(setTimeout(() => (el.textContent = text.slice(0, n + 1)), n * perChar));
  });
  (el as HTMLElement & { _t?: ReturnType<typeof setTimeout>[] })._t = next;
}

/** A muted looping video on the same terms as runScene: it plays only while on screen and,
 * inside the process deck, on the front card; with reduced motion it stays on its poster. */
export function playWhileShown(video: HTMLVideoElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const card = video.closest<HTMLElement>('[data-chapter]');
  let visible = false;
  const sync = () => {
    const on = visible && card?.dataset.front !== 'false';
    if (on === !video.paused) return;
    if (on) video.play().catch(() => {});
    else video.pause();
  };
  card?.addEventListener('chapter:front', sync);
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0.3 },
  ).observe(video);
}
