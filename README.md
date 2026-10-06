# Portfolio

Личный сайт-портфолио на [Astro](https://astro.build). Сборка статическая: на выходе обычные HTML/CSS/JS-файлы, которые можно отдавать любым веб-сервером.

## Требования

- Node.js 22+ (версия указана в `.nvmrc`)

## Команды

| Команда           | Что делает                              |
| ----------------- | --------------------------------------- |
| `npm install`     | Установить зависимости                  |
| `npm run dev`     | Dev-сервер на http://localhost:4321     |
| `npm run build`   | Проверка типов и сборка сайта в `dist/` |
| `npm run preview` | Локально посмотреть собранный `dist/`   |
| `npm run format`  | Отформатировать код через Prettier      |

## Структура

```
public/            статические файлы (favicon, картинки) — копируются как есть
src/pages/         страницы; каждый файл = маршрут
src/layouts/       общие шаблоны страниц
src/components/    переиспользуемые компоненты
src/styles/        глобальные стили и переменные
```

## Хостинг

После `npm run build` скопируйте содержимое `dist/` на сервер и отдавайте его как статику. Пример для nginx:

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/portfolio;
  index index.html;

  location / {
    try_files $uri $uri/ $uri.html =404;
  }
}
```

## VS Code

При открытии проекта VS Code предложит поставить рекомендуемые расширения (Astro, Prettier, EditorConfig). Форматирование при сохранении уже включено в `.vscode/settings.json`.
