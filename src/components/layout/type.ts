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
}

type BaseNavItem = {
    title: string
    badge?: string
    icon?: LucideIcon
    menuKey?: string
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

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }