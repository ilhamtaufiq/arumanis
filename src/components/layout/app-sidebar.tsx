import { useLayout } from '@/context/layout-provider'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuSkeleton } from '@/components/ui/sidebar'
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
    const { fetchMenuPermissions, canAccessMenu, isLoaded, isLoading, setUserRoles, allowedMenus, userRoles } = useMenuPermissionStore()

    // Fetch menu permissions when authenticated and set user roles
    useEffect(() => {
        if (auth.user) {
            // Set user roles for admin bypass check
            const roles = (auth.user.roles || []).map((r: any) =>
                typeof r === 'string' ? r : r.name
            );
            setUserRoles(roles);
            fetchMenuPermissions()
        }
        // Use JSON.stringify for roles to avoid reference issues
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.user?.id, JSON.stringify(auth.user?.roles), fetchMenuPermissions, setUserRoles])

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
        // Don't filter until permissions are loaded - return empty array to prevent flash
        if (!isLoaded) return []

        return sidebarData.navGroups
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => canAccessMenu(item.menuKey)),
            }))
            .filter((group) => group.items.length > 0)
    }, [isLoaded, canAccessMenu, allowedMenus, userRoles])

    // Show loading skeleton for menu when permissions are being loaded
    const showMenuSkeleton = !isLoaded || isLoading

    return (
        <Sidebar collapsible={collapsible} variant={variant}>
            <SidebarHeader>
                <TeamSwitcher teams={sidebarData.teams} />
            </SidebarHeader>
            <SidebarContent>
                {showMenuSkeleton ? (
                    // Show skeleton while loading menu permissions
                    <>
                        {sidebarData.navGroups.map((group) => (
                            <SidebarGroup key={group.title}>
                                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                                <SidebarMenu>
                                    {Array.from({ length: Math.min(group.items.length, 4) }).map((_, index) => (
                                        <SidebarMenuItem key={index}>
                                            <SidebarMenuSkeleton />
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroup>
                        ))}
                    </>
                ) : (
                    // Show actual filtered menus when loaded
                    filteredNavGroups.map((props) => (
                        <NavGroup key={props.title} {...props} />
                    ))
                )}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}