// import { type LinkProps } from 'react-router-dom'
import { type LucideIcon } from 'lucide-react'

type User = {
    name: string
    email: string
    avatar: string
}

type Team = {
    name: string
    logo: React.ElementType | string
    plan: string
    /** Navigate here when the team is selected */
    url?: string
    /** When set, this team is active while the pathname starts with this prefix */
    routePrefix?: string
}

type BaseNavItem = {
    title: string
    badge?: string
    icon?: LucideIcon
    menuKey?: string
    /** Tier P2 features are hidden from non-admin/manager roles in MVP mode */
    mvpTier?: 'p2'
}

type NavLink = BaseNavItem & {
    url: string
    items?: never
}

type NavCollapsible = BaseNavItem & {
    items: (BaseNavItem & { url: string })[]
    url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
    title: string
    items: NavItem[]
}

type SidebarData = {
    user: User
    teams: Team[]
    navGroups: NavGroup[]
}

export type { SidebarData, Team, NavGroup, NavItem, NavCollapsible, NavLink }