// @ts-check
import { defineConfig } from 'astro/config';

// Статическая сборка: `npm run build` кладёт готовый сайт в dist/,
// его можно отдавать любым веб-сервером (nginx, Caddy и т. п.).
export default defineConfig({
  output: 'static',
});
