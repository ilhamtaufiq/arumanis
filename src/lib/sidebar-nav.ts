import type { NavGroup, NavItem } from '@/components/layout/type'

function shouldShowNavItem(item: NavItem, showAdvancedFeatures: boolean): boolean {
    if (item.mvpTier === 'p2' && !showAdvancedFeatures) {
        return false
    }

    return true
}

export function filterSidebarNavGroups(
    navGroups: NavGroup[],
    options: {
        canAccessMenu: (menuKey?: string) => boolean
        showAdvancedFeatures: boolean
    },
): NavGroup[] {
    return navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter(
                (item) =>
                    shouldShowNavItem(item, options.showAdvancedFeatures)
                    && options.canAccessMenu(item.menuKey),
            ),
        }))
        .filter((group) => group.items.length > 0)
}