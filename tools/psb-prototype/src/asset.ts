// Files sit next to app.js, wherever the page is served from (the site lives under /Portfolio/).
const script = document.currentScript as HTMLScriptElement | null;
const base = script ? new URL('.', script.src).href : '';

export const asset = (path: string) => base + path.replace(/^\//, '');
