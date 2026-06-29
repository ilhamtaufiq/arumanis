import { expect, test } from '@playwright/test'

test.describe('public smoke', () => {
    test('landing page renders hero content', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveTitle(/Arumanis/i)
        await expect(page.getByRole('link', { name: /masuk/i }).first()).toBeVisible()
    })

    test('sign-in page renders auth form', async ({ page }) => {
        await page.goto('/sign-in')
        await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
        await expect(page.getByText('Email', { exact: true })).toBeVisible()
        await expect(page.getByText('Password', { exact: true })).toBeVisible()
    })

    test('unknown route shows not-found shell', async ({ page }) => {
        const response = await page.goto('/__e2e-not-found__')
        expect(response?.status()).toBeLessThan(500)
        await expect(page.locator('body')).toBeVisible()
    })
})