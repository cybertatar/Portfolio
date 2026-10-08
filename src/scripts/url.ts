/** Prefix a path inside public/ with the site base (e.g. "/Portfolio" on GitHub Pages). */
export function withBase(path: string) {
  if (/^[a-z]+:/i.test(path)) return path;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
