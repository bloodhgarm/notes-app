import { expect, test, type Page } from '@playwright/test'

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
] as const

const expectNoHorizontalOverflow = async (page: Page) => {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
}

for (const viewport of viewports) {
  test(`${viewport.name}: list, editor and modal remain usable`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Создать заметку' })).toBeVisible()
    await expectNoHorizontalOverflow(page)

    await page.getByRole('link', { name: 'Создать заметку' }).click()
    await expect(page.getByRole('heading', { name: 'Новая заметка' })).toBeVisible()
    await page.getByRole('button', { name: 'Добавить задачу' }).click()
    await page.getByLabel('Название заметки').fill('Адаптивная заметка')
    await page.getByLabel(/^Текст задачи/).fill('Проверить длинный текст задачи на узком экране')
    await expectNoHorizontalOverflow(page)

    const cancelButton = page.getByRole('button', { name: 'Отменить редактирование' })
    await cancelButton.focus()
    await cancelButton.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Отменить редактирование?' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Закрыть' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(dialog.getByRole('button', { name: 'Отменить изменения' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: 'Закрыть' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(cancelButton).toBeFocused()
    await expectNoHorizontalOverflow(page)
  })
}

test('draft survives an immediate reload', async ({ page }) => {
  await page.goto('/notes/new')
  await page.getByLabel('Название заметки').fill('Черновик перед перезагрузкой')

  await page.reload()

  const dialog = page.getByRole('dialog', { name: 'Восстановить черновик?' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Восстановить', exact: true }).click()
  await expect(page.getByLabel('Название заметки')).toHaveValue('Черновик перед перезагрузкой')
})

test('opening a modal does not shift the page layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 })
  await page.goto('/notes/new')
  await page.getByLabel('Название заметки').fill('Проверка layout shift')

  const editor = page.locator('.note-editor')
  const before = await editor.boundingBox()
  expect(before).not.toBeNull()

  await page.getByRole('button', { name: 'Отменить редактирование' }).click()
  await expect(page.getByRole('dialog', { name: 'Отменить редактирование?' })).toBeVisible()

  const after = await editor.boundingBox()
  expect(after).not.toBeNull()
  expect(after!.x).toBeCloseTo(before!.x, 1)
})

test('the list header stays visible while scrolling', async ({ page }) => {
  await page.addInitScript(() => {
    const timestamp = '2026-09-06T12:00:00.000Z'
    const notes = Array.from({ length: 20 }, (_, index) => ({
      id: `note-${index}`,
      title: `Заметка ${index + 1}`,
      todos: [{ id: `todo-${index}`, text: 'Задача для проверки прокрутки', completed: false }],
      createdAt: timestamp,
      updatedAt: timestamp,
    }))

    window.localStorage.setItem('notes-app:notes', JSON.stringify({ schemaVersion: 1, notes }))
  })
  await page.goto('/')

  const header = page.locator('.notes-page__header')
  await expect(header).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 600))

  const box = await header.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.y).toBeCloseTo(0, 1)
})

test('shows a fallback for direct navigation to an unknown note', async ({ page }) => {
  await page.goto('/notes/unknown-note')

  await expect(page.getByRole('heading', { name: 'Заметка не найдена' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Вернуться к списку' })).toBeVisible()
})

test('saves, cancels and deletes a note from the editor', async ({ page }) => {
  await page.goto('/notes/new')
  await page.getByLabel('Название заметки').fill('Сохранённая заметка')
  await page.getByRole('button', { name: 'Добавить задачу' }).click()
  await page.getByLabel(/^Текст задачи/).fill('Первая задача')
  await page.getByRole('button', { name: 'Сохранить' }).click()

  await expect(page.getByRole('heading', { name: 'Сохранённая заметка' })).toBeVisible()
  await page.getByRole('link', { name: 'Редактировать' }).click()
  await page.getByLabel('Название заметки').fill('Несохранённое изменение')
  await page.getByRole('button', { name: 'Отменить редактирование' }).click()
  await page
    .getByRole('dialog', { name: 'Отменить редактирование?' })
    .getByRole('button', { name: 'Отменить изменения' })
    .click()

  await expect(page.getByRole('heading', { name: 'Сохранённая заметка' })).toBeVisible()
  await page.getByRole('link', { name: 'Редактировать' }).click()
  await page.getByRole('button', { name: 'Удалить', exact: true }).click()
  await page
    .getByRole('dialog', { name: 'Удалить заметку?' })
    .getByRole('button', { name: 'Удалить' })
    .click()

  await expect(page.getByRole('heading', { name: 'Заметок ещё нет' })).toBeVisible()
})

test('empty new note does not create a draft when navigating back', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Создать заметку' }).click()
  await page.getByRole('button', { name: 'Добавить задачу' }).click()
  await page.getByRole('button', { name: 'Удалить задачу без текста' }).click()
  await page.getByLabel('Название заметки').fill('Temporary title')
  await page.getByLabel('Название заметки').fill('')

  await page.goBack()

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(await page.evaluate(() => window.localStorage.getItem('notes-app:draft:new'))).toBeNull()
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => window.localStorage.getItem('notes-app:draft:new'))).toBeNull()

  await page.getByRole('link', { name: 'Создать заметку' }).click()
  await page.getByRole('button', { name: 'Добавить задачу' }).click()
  await page.getByRole('link', { name: 'Все заметки' }).click()

  expect(await page.evaluate(() => window.localStorage.getItem('notes-app:draft:new'))).toBeNull()
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => window.localStorage.getItem('notes-app:draft:new'))).toBeNull()
})

test('native undo and redo remain available inside editor text fields', async ({
  page,
  browserName,
}) => {
  await page.goto('/notes/new')

  const titleInput = page.getByLabel('Название заметки')
  await titleInput.fill('Native title')

  await page.keyboard.press('Control+z')
  await expect(titleInput).toHaveValue('')
  await page.keyboard.press(browserName === 'webkit' ? 'Control+Shift+z' : 'Control+y')
  await expect(titleInput).toHaveValue('Native title')

  await page.getByRole('button', { name: 'Добавить задачу' }).click()
  const todoInput = page.getByLabel(/^Текст задачи/)
  await todoInput.fill('Native todo')

  await page.keyboard.press('Control+z')
  await expect(todoInput).toHaveValue('')
  await page.keyboard.press('Control+Shift+z')
  await expect(todoInput).toHaveValue('Native todo')

  const localizedShortcutWasCanceled = await todoInput.evaluate((element) => {
    const event = new KeyboardEvent('keydown', {
      key: 'н',
      code: 'KeyY',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    })

    return !element.dispatchEvent(event)
  })

  expect(localizedShortcutWasCanceled).toBe(false)
})

test('application history shortcuts work outside text fields across platforms', async ({
  page,
}) => {
  await page.goto('/notes/new')

  const titleInput = page.getByLabel('Название заметки')
  await titleInput.fill('Application title')
  await titleInput.blur()

  await page.keyboard.press('Control+z')
  await expect(titleInput).toHaveValue('')
  await page.keyboard.press('Control+y')
  await expect(titleInput).toHaveValue('Application title')

  await page.keyboard.press('Control+z')
  await expect(titleInput).toHaveValue('')
  await page.keyboard.press('Control+Shift+z')
  await expect(titleInput).toHaveValue('Application title')

  await titleInput.fill('macOS title')
  await titleInput.blur()

  await page.keyboard.press('Meta+z')
  await expect(titleInput).toHaveValue('Application title')
  await page.keyboard.press('Meta+Shift+z')
  await expect(titleInput).toHaveValue('macOS title')

  await page.evaluate(() => {
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'я',
        code: 'KeyZ',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    )
  })
  await expect(titleInput).toHaveValue('Application title')

  await page.evaluate(() => {
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'н',
        code: 'KeyY',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    )
  })
  await expect(titleInput).toHaveValue('macOS title')
})

test('editor handles deletion from another tab', async ({ browser }) => {
  const context = await browser.newContext()
  await context.addInitScript(() => {
    const timestamp = '2026-09-05T10:00:00.000Z'
    window.localStorage.setItem(
      'notes-app:notes',
      JSON.stringify({
        schemaVersion: 1,
        notes: [
          {
            id: 'shared-note',
            title: 'Общая заметка',
            todos: [],
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
      }),
    )
  })

  const editorPage = await context.newPage()
  const listPage = await context.newPage()
  await editorPage.goto('/notes/shared-note')
  await listPage.goto('/')

  await listPage.getByRole('button', { name: 'Удалить' }).click()
  const deleteDialog = listPage.getByRole('dialog', { name: 'Удалить заметку?' })
  await deleteDialog.getByRole('button', { name: 'Удалить' }).click()

  await expect(
    editorPage.getByRole('dialog', { name: 'Заметка удалена в другой вкладке' }),
  ).toBeVisible()

  await context.close()
})
