/**
 * Russian is rendered into the HTML. When the browser's first language is not Russian,
 * every element with `data-en` gets its English text (and `data-en-label` its aria-label),
 * and media with `data-en-src` / `data-en-poster` load their English versions.
 */
export function applyLang() {
  const nav = navigator.languages?.[0] ?? navigator.language ?? 'en';
  if (/^ru/i.test(nav)) return;
  document.documentElement.lang = 'en';
  document.querySelectorAll<HTMLElement>('[data-en]').forEach((el) => {
    el.textContent = el.dataset.en ?? el.textContent;
  });
  document.querySelectorAll<HTMLElement>('[data-en-label]').forEach((el) => {
    el.setAttribute('aria-label', el.dataset.enLabel ?? '');
  });
  document.querySelectorAll<HTMLVideoElement>('video[data-en-src]').forEach((el) => {
    el.src = el.dataset.enSrc ?? el.src;
    if (el.dataset.enPoster) el.poster = el.dataset.enPoster;
  });
}
