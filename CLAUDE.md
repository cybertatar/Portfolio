# Portfolio — правила работы

- Сайт на Astro (статическая сборка), продакшн: https://cybertatar.github.io/Portfolio/ — деплоится сам из `main` (`.github/workflows/deploy.yml`).
- Не сливать изменения в `main` без явного «ок» владельца. Сначала работать в отдельной ветке, собрать сайт и показать превью.
- Превью для показа: артефакт https://claude.ai/artifact/CXQuMo6vfckqykF1kN2wei. Обновлять его тем же URL из сборки ветки (`npm run build`, затем убрать обёртку документа и сделать пути относительными; папку `_astro` переименовать, имена с `_` артефакт не принимает).
- Перед пушем: `npm run build` (включает `astro check`) и `npm run format:check` без ошибок.
- Источник дизайна: черновик Claude Design `design_handoff_home`. Токены в `src/styles/tokens`, контент в `src/content/site.ts`.
