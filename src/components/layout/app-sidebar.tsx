import { useLayout } from '@/context/layout-provider'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useAuthStore } from '@/stores/auth-stores'
import { useMenuPermissionStore } from '@/stores/menu-permission-store'
import { useEffect, useMemo } from 'react'
import type { NavGroup as NavGroupType } from './type'

export function AppSidebar() {
    const { collapsible, variant } = useLayout()
    const { auth } = useAuthStore()
    const { fetchMenuPermissions, canAccessMenu, isLoaded } = useMenuPermissionStore()

    // Fetch menu permissions when authenticated
    useEffect(() => {
        if (auth.user) {
            fetchMenuPermissions()
        }
    }, [auth.user, fetchMenuPermissions])

    // Get user data from auth store, fallback to sidebarData if not available
    const user = auth.user
        ? {
            name: auth.user.name,
            email: auth.user.email,
            avatar: sidebarData.user.avatar,
        }
        : sidebarData.user

    // Filter navGroups based on menu permissions
    const filteredNavGroups = useMemo((): NavGroupType[] => {
        if (!isLoaded) return sidebarData.navGroups

        return sidebarData.navGroups
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => canAccessMenu(item.menuKey)),
            }))
            .filter((group) => group.items.length > 0)
    }, [isLoaded, canAccessMenu])

    return (
        <Sidebar collapsible={collapsible} variant={variant}>
            <SidebarHeader>
                <TeamSwitcher teams={sidebarData.teams} />
            </SidebarHeader>
            <SidebarContent>
                {filteredNavGroups.map((props) => (
                    <NavGroup key={props.title} {...props} />
                ))}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}