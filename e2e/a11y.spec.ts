import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const expectNoAccessibilityViolations = async (page: Page): Promise<void> => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()

  expect(results.violations).toEqual([])
}

test('@a11y list, editor and confirmation dialog have no WCAG A/AA violations', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expectNoAccessibilityViolations(page)

  await page.getByRole('link', { name: 'Создать заметку' }).click()
  await expect(page.getByRole('heading', { name: 'Новая заметка' })).toBeVisible()
  await expectNoAccessibilityViolations(page)

  await page.getByLabel('Название заметки').fill('Проверка доступности')
  await page.getByRole('button', { name: 'Отменить редактирование' }).click()
  await expect(page.getByRole('dialog', { name: 'Отменить редактирование?' })).toBeVisible()
  await expectNoAccessibilityViolations(page)
})
