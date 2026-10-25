/**
 * Game-style dialog box: the text types out letter by letter, then the box hides on its own
 * or on click. One box is reused for every message. Given the element that speaks (the
 * portrait, a case's lock), it opens next to it as a speech bubble with a tail toward it:
 * at the bottom of the screen it was out of sight. Without one it sits at the bottom.
 */
let box: HTMLElement | undefined;
let timers: ReturnType<typeof setTimeout>[] = [];
let anchor: HTMLElement | undefined;
let queued = false;

const GAP = 12; // between the element and the bubble, the tail fills it
const EDGE = 16; // from the screen edges

/** Below the element if it fits, above otherwise; centred on it, kept inside the screen. */
const place = () => {
  queued = false;
  if (!box) return;
  if (!anchor || !anchor.isConnected) {
    box.removeAttribute('data-side');
    box.style.left = box.style.top = '';
    return;
  }
  const a = anchor.getBoundingClientRect();
  const w = box.offsetWidth;
  const h = box.offsetHeight;
  const below = a.bottom + GAP + h <= innerHeight - EDGE || a.top - GAP - h < EDGE;
  const x = Math.min(innerWidth - EDGE - w, Math.max(EDGE, a.left + a.width / 2 - w / 2));
  const y = below ? Math.min(a.bottom + GAP, innerHeight - EDGE - h) : a.top - GAP - h;
  box.dataset.side = below ? 'below' : 'above';
  box.style.left = `${Math.round(x)}px`;
  box.style.top = `${Math.round(Math.max(EDGE, y))}px`;
  // The tail points at the element's middle, within the bubble's straight edge
  const tail = Math.min(w - 24, Math.max(24, a.left + a.width / 2 - x));
  box.style.setProperty('--tail-x', `${Math.round(tail)}px`);
};
// Follows the element while the page or the feed scrolls
const follow = () => {
  if (queued || !box?.classList.contains('is-open')) return;
  queued = true;
  requestAnimationFrame(place);
};

const clear = () => {
  timers.forEach(clearTimeout);
  timers = [];
};

const hide = () => {
  clear();
  box?.classList.remove('is-open');
};

export function showDialog(text: string, from?: HTMLElement | null) {
  if (!box) {
    box = document.createElement('div');
    box.className = 'px-dialog px-clip';
    box.setAttribute('role', 'status');
    box.innerHTML =
      '<p class="px-dialog-text"><span></span></p><span class="px-dialog-next" aria-hidden="true"></span>';
    box.innerHTML += '<span class="px-dialog-tail" aria-hidden="true"></span>';
    box.addEventListener('click', hide);
    document.body.append(box);
    addEventListener('scroll', follow, { capture: true, passive: true });
    addEventListener('resize', follow);
  }
  anchor = from ?? undefined;
  clear();
  const line = box.querySelector<HTMLElement>('.px-dialog-text')!;
  const out = line.querySelector('span')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  box.classList.remove('is-done');
  // Reserve the final size so the box doesn't grow while typing.
  line.dataset.full = text;
  out.textContent = reduced ? text : '';
  place();
  requestAnimationFrame(() => box!.classList.add('is-open'));

  const step = reduced ? 0 : 28;
  if (!reduced) {
    [...text].forEach((_, i) => {
      timers.push(setTimeout(() => (out.textContent = text.slice(0, i + 1)), 160 + i * step));
    });
  }
  const typed = reduced ? 0 : 160 + text.length * step;
  timers.push(setTimeout(() => box!.classList.add('is-done'), typed));
  timers.push(setTimeout(hide, typed + 2600));
}

/** Picks the English variant when the page was switched to English (see lang.ts). */
export function localized(ru: string, en: string | undefined) {
  return document.documentElement.lang === 'en' && en ? en : ru;
}
