import { describe, expect, it } from 'vitest'
import { filterSidebarNavGroups } from '@/lib/sidebar-nav'
import type { NavGroup } from '@/components/layout/type'

const sampleGroups: NavGroup[] = [
    {
        title: 'Dashboard',
        items: [
            { title: 'Dashboard', url: '/dashboard', menuKey: 'dashboard' },
            { title: 'Kanban', url: '/kanban', menuKey: 'kanban', mvpTier: 'p2' },
        ],
    },
]

describe('filterSidebarNavGroups', () => {
    it('hides tier P2 items for standard users', () => {
        const result = filterSidebarNavGroups(sampleGroups, {
            canAccessMenu: () => true,
            showAdvancedFeatures: false,
        })

        expect(result[0]?.items.map((item) => item.title)).toEqual(['Dashboard'])
    })

    it('shows tier P2 items for admin/manager', () => {
        const result = filterSidebarNavGroups(sampleGroups, {
            canAccessMenu: () => true,
            showAdvancedFeatures: true,
        })

        expect(result[0]?.items).toHaveLength(2)
    })

    it('respects menu permissions', () => {
        const result = filterSidebarNavGroups(sampleGroups, {
            canAccessMenu: (menuKey) => menuKey !== 'kanban',
            showAdvancedFeatures: true,
        })

        expect(result[0]?.items.map((item) => item.title)).toEqual(['Dashboard'])
    })
})