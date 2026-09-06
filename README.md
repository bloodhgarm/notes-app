# Notes App

`Небольшое SPA для заметок и задач. Проект написан на Nuxt 4 с Composition API, Pinia и TypeScript в strict-режиме. Данные хранятся в `localStorage`, сервер и API не требуются.

## Быстрый старт

Для работы нужны Bun и Node.js 24 или новее.

```bash
bun install
bun run dev
```

После запуска приложение доступно на `http://localhost:3000`.

Перед первым запуском E2E-тестов установите браузеры Playwright:

```bash
bun run test:e2e:install
```

## Docker

Production-образ собирается и запускается на `http://localhost:3000`:

```bash
docker compose up --build
# или
bun run docker:prod
```

Режим разработки использует bind mount и hot reload, адрес — `http://localhost:3001`:

```bash
docker compose --profile development up --build notes-app-dev
# или
bun run docker:dev
```

Перед запуском dev-контейнер синхронизирует зависимости по `bun.lock`. Это нужно, чтобы именованный том `node_modules` не сохранял устаревший набор пакетов после изменения зависимостей.

## Команды

```bash
bun run check         # все проверки без изменения файлов
bun run check:fix     # форматирование, затем все проверки
bun run lint          # ESLint
bun run validate:html # html-validate и проверка Vue template
bun run typecheck     # vue-tsc через Nuxt
bun run format:check  # проверка форматирования
bun run format        # форматирование исходников
bun run test          # unit-тесты Vitest
bun run test:a11y     # axe-core: WCAG A/AA аудит в Chromium
bun run test:e2e      # Playwright: Chromium, Firefox и WebKit
bun run build         # production-сборка
bun run preview       # локальный запуск собранного приложения
```

## Устройство проекта

Маршруты лежат в `app/pages`: список заметок и редактор. Компоненты предметной области находятся в `app/components/notes`, а общие элементы интерфейса — в `app/components/ui`. Это собственные SCSS-компоненты: Element Plus использовался только как визуальный и структурный reference и не установлен в runtime.

`app/stores/notes.ts` отвечает за коллекцию заметок, `app/stores/editor.ts` — за одну сессию редактирования. Слой `app/services` изолирует работу с `localStorage`, валидацию данных и `schemaVersion`; в `app/utils` находятся операции истории, debounce и функции для модели заметки. Общие стили и семантические дизайн-токены собраны в `app/assets/styles/_tokens.scss`, а повторяющаяся геометрия страниц — в `_mixins.scss`.

История Undo/Redo хранит компактные операции, а не снимки заметки. Она ограничена 50 шагами; непрерывный ввод объединяется в один шаг после паузы 600 мс или потери фокуса. Новое изменение после Undo очищает ветку Redo, а Save и Cancel сбрасывают историю. Вне текстовых полей работают `Ctrl+Z`, `Ctrl+Shift+Z` и `Ctrl+Y` на Windows/Linux, `Cmd+Z` и `Cmd+Shift+Z` на macOS. В `input`, `textarea` и contenteditable-элементах эти сочетания остаются нативными для браузера.

Заметки и черновики сохраняются вручную с debounce. Черновик записывается отдельно и принудительно синхронизируется при `pagehide`, уходе вкладки в background и размонтировании редактора. Пустая новая заметка не создаёт запись в хранилище. При следующем открытии редактор предлагает восстановить или удалить найденный черновик. Событие `storage` поддерживает работу в нескольких вкладках: если заметку удалили в другой вкладке, редактор предлагает сохранить текущие изменения как новую заметку или вернуться к списку.

Модальные окна реализованы в `BaseModal`: используются `role="dialog"`, `aria-modal`, корректные связи заголовка и описания, ловушка фокуса, Escape, возврат фокуса и блокировка прокрутки. Unit-тесты покрывают доменную логику, историю, storage и drafts; E2E-тесты проверяют страницы, модальные окна, клавиатурные сценарии, адаптивность и отсутствие горизонтального overflow на desktop, tablet и mobile.
