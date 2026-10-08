/**
 * Russian is rendered into the HTML. When the browser's first language is not Russian,
 * every element with `data-en` gets its English text (and `data-en-label` its aria-label).
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
}
