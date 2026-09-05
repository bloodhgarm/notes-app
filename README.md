# Notes App

SPA-приложение для заметок и Todo на Nuxt 4, Composition API, Pinia и TypeScript strict.

## Запуск

Требования: Bun и Node.js 24+.

```bash
bun install
bun run dev
```

Приложение будет доступно по адресу `http://localhost:3000`.

Production-проверка:

```bash
bun run build
bun run preview
```

Запуск через Docker:

```bash
docker compose up --build
```

## Проверки

```bash
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
```

## Архитектура

- `app/pages` — маршруты списка заметок и редактора, получение данных и orchestration.
- `app/components/notes` — карточка, список Todo и отдельный Todo item.
- `app/components/ui` — собственные Button, IconButton, LinkButton, Input, Checkbox и Modal.
- `app/stores` — состояние заметок и отдельная сессия редактора.
- `app/services` — ручная работа с localStorage и версионирование persisted state.
- `app/utils` — чистые операции над заметкой и memory-efficient history.
- `app/types` — доменные типы Note, Todo и history operations.

## Undo / Redo

История реализована без сторонних библиотек и без полных снимков заметки. В стеках хранятся
компактные операции с данными для прямого и обратного применения. История ограничена 50 шагами,
а новое изменение после Undo очищает ветку Redo. Непрерывный ввод группируется в один шаг по
паузе 600 мс или по blur. После Save и Cancel история очищается.

## Persistence и черновики

Заметки сохраняются в localStorage вручную с debounce и полем `schemaVersion`. Черновик текущей
сессии хранится отдельно, сохраняется с debounce и принудительно записывается при `pagehide`,
переходе вкладки в background и размонтировании редактора. После перезагрузки пользователь может
восстановить или удалить найденный черновик.

Событие `storage` синхронизирует вкладки. Если редактируемую заметку удалили в другой вкладке,
редактор предлагает сохранить изменения как новую заметку либо вернуться к списку.

## Modal и accessibility

Собственный `BaseModal` использует semantic HTML, `role="dialog"`, `aria-modal`,
`aria-labelledby` и `aria-describedby`. Реализованы focus trap, Escape, Tab/Shift+Tab, начальный
фокус, блокировка прокрутки страницы и возврат фокуса после закрытия.

## UI

Element Plus не установлен и не используется в runtime. Его документация применялась только как
визуальный и структурный reference для состояний Checkbox, Input, Button, Dialog и list-like UI.
Вся итоговая разметка и SCSS написаны в проекте самостоятельно.

## Тесты

Vitest покрывает:

- add/remove/edit/toggle и Undo/Redo;
- очистку redo-ветки и лимит истории 50;
- группировку непрерывного ввода и сброс истории;
- CRUD и debounce notes store;
- загрузку и `schemaVersion` persisted state;
- сохранение, восстановление и удаление draft;
- синхронизацию удаления через storage event;
- некорректные данные в localStorage.

Playwright проверяет список, редактор, modal, keyboard/focus и отсутствие горизонтального overflow
на desktop, tablet и mobile viewport.
