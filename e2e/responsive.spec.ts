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

    await page.getByRole('button', { name: 'Отменить редактирование' }).click()
    const dialog = page.getByRole('dialog', { name: 'Отменить редактирование?' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Закрыть' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('button', { name: 'Отменить редактирование' })).toBeFocused()
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
