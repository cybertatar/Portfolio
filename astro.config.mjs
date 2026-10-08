// @ts-check
import { defineConfig } from 'astro/config';

// Статическая сборка: `npm run build` кладёт готовый сайт в dist/,
// его можно отдавать любым веб-сервером (nginx, Caddy и т. п.).
// На GitHub Pages сайт живёт в подпапке (/Portfolio/): адрес и путь
// передаёт workflow .github/workflows/deploy.yml через SITE_URL и BASE_PATH.
const { SITE_URL, BASE_PATH } = /** @type {any} */ (globalThis).process.env;

export default defineConfig({
  output: 'static',
  site: SITE_URL,
  base: BASE_PATH || '/',
});
