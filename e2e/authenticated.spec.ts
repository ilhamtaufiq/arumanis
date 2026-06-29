import { expect, test } from '@playwright/test'
import { mockAuthenticatedSession, mockUnauthenticatedSession } from './helpers/mock-api'

test.describe('authenticated flows', () => {
    test('unauthenticated dashboard redirects to sign-in', async ({ page }) => {
        await mockUnauthenticatedSession(page)
        await page.goto('/dashboard')

        await expect(page).toHaveURL(/\/sign-in/)
        await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible()
    })

    test('authenticated user can open dashboard lounge tab', async ({ page }) => {
        await mockAuthenticatedSession(page, {
            id: 1,
            name: 'Admin E2E',
            email: 'admin@e2e.test',
            roles: ['admin'],
        })

        await page.goto('/dashboard')
        await expect(page).toHaveURL(/\/dashboard/)
        await expect(page.getByRole('tab', { name: /lounge/i })).toBeVisible({ timeout: 15_000 })
        await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible()
    })

    test('non-manager user is blocked from executive dashboard', async ({ page }) => {
        await mockAuthenticatedSession(page, {
            id: 2,
            name: 'TFL E2E',
            email: 'tfl@e2e.test',
            roles: ['tfl'],
        })

        await page.goto('/executive-dashboard')
        await expect(page).toHaveURL(/\/forbidden/)
        await expect(page.getByText('Akses ditolak')).toBeVisible()
    })
})