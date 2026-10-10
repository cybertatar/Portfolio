/**
 * Looping pixel scenes on the case page (they replace the co-author's videos). A scene is
 * a list of states: the root's data-state switches on a timer and CSS does the rest. The
 * loop runs only while the scene is on screen; with reduced motion the scene stays on
 * its `still` state.
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

  root.dataset.state = steps[0].state;
  new IntersectionObserver(
    ([entry]) => {
      clearTimeout(timer);
      if (entry.isIntersecting) play();
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
