import type { Page, Route } from '@playwright/test'

export type MockSessionUser = {
    id: number
    name: string
    email: string
    roles: string[]
}

const DEFAULT_APP_SETTINGS = {
    data: [
        { id: 1, key: 'app_name', value: 'Arumanis', type: 'text', updated_at: '2026-01-01T00:00:00Z' },
        { id: 2, key: 'tahun_anggaran', value: '2025', type: 'text', updated_at: '2026-01-01T00:00:00Z' },
        { id: 3, key: 'landing_page_active', value: '1', type: 'text', updated_at: '2026-01-01T00:00:00Z' },
        { id: 4, key: 'capaian_publik_section_active', value: '1', type: 'text', updated_at: '2026-01-01T00:00:00Z' },
        { id: 5, key: 'spm_detail_page_active', value: '1', type: 'text', updated_at: '2026-01-01T00:00:00Z' },
    ],
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
    await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
    })
}

function isBffRequest(url: string): boolean {
    return url.includes('/bff/')
}

async function handleBffRoute(route: Route, user: MockSessionUser | null) {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/bff/auth/me')) {
        await fulfillJson(route, { user, isImpersonating: false, impersonator: null })
        return
    }

    if (method !== 'GET') {
        await fulfillJson(route, { data: null })
        return
    }

    if (url.includes('/app-settings')) {
        await fulfillJson(route, DEFAULT_APP_SETTINGS)
        return
    }

    if (url.includes('/events') || url.includes('/audit-logs') || url.includes('/notifications')) {
        await fulfillJson(route, { data: [] })
        return
    }

    if (url.includes('/route-permissions')) {
        await fulfillJson(route, { data: [] })
        return
    }

    if (url.includes('/dashboard/')) {
        await fulfillJson(route, {
            data: {
                totalPekerjaan: 0,
                totalKontrak: 0,
                totalNilaiKontrak: 0,
                totalPaguPekerjaan: 0,
            },
        })
        return
    }

    await fulfillJson(route, { data: [] })
}

export async function mockUnauthenticatedSession(page: Page) {
    await page.route(/\/bff\//, async (route) => {
        if (!isBffRequest(route.request().url())) {
            await route.continue()
            return
        }
        await handleBffRoute(route, null)
    })
}

export async function mockAuthenticatedSession(page: Page, user: MockSessionUser) {
    await page.route(/\/bff\//, async (route) => {
        if (!isBffRequest(route.request().url())) {
            await route.continue()
            return
        }
        await handleBffRoute(route, user)
    })
}