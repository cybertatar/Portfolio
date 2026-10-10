/**
 * Game-style dialog box at the bottom of the screen: the text types out letter by letter,
 * then the box hides on its own or on click. One box is reused for every message.
 */
let box: HTMLElement | undefined;
let timers: ReturnType<typeof setTimeout>[] = [];

const clear = () => {
  timers.forEach(clearTimeout);
  timers = [];
};

const hide = () => {
  clear();
  box?.classList.remove('is-open');
};

export function showDialog(text: string) {
  if (!box) {
    box = document.createElement('div');
    box.className = 'px-dialog px-clip';
    box.setAttribute('role', 'status');
    box.innerHTML =
      '<p class="px-dialog-text"><span></span></p><span class="px-dialog-next" aria-hidden="true"></span>';
    box.addEventListener('click', hide);
    document.body.append(box);
  }
  clear();
  const line = box.querySelector<HTMLElement>('.px-dialog-text')!;
  const out = line.querySelector('span')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  box.classList.remove('is-done');
  // Reserve the final size so the box doesn't grow while typing.
  line.dataset.full = text;
  out.textContent = reduced ? text : '';
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
