import {
    LayoutDashboard,
    Package,
    MapPin,
    Map,
    Briefcase,
    FileText,
    UserCheck,
    Camera,
    FolderOpen,
    Command,
    Users,
    Shield,
    Key,
    Link2,
} from 'lucide-react'
import { type SidebarData } from '../type'

export const sidebarData: SidebarData = {
    user: {
        name: 'User',
        email: 'user@disperkim.go.id',
        avatar: '/arumanis.svg',
    },
    teams: [
        {
            name: 'ARUMANIS',
            logo: '/arumanis.svg',
            plan: 'Disperkim',
        },
    ],
    navGroups: [
        {
            title: 'Dashboard',
            items: [
                {
                    title: 'Dashboard',
                    url: '/',
                    icon: LayoutDashboard,
                    menuKey: 'dashboard',
                },
            ],
        },
        {
            title: 'Master Data',
            items: [
                {
                    title: 'Program Kegiatan',
                    url: '/kegiatan',
                    icon: Package,
                    menuKey: 'kegiatan',
                },
                {
                    title: 'Kecamatan',
                    url: '/kecamatan',
                    icon: MapPin,
                    menuKey: 'kecamatan',
                },
                {
                    title: 'Desa',
                    url: '/desa',
                    icon: Map,
                    menuKey: 'desa',
                },
                {
                    title: 'Pekerjaan',
                    url: '/pekerjaan',
                    icon: Briefcase,
                    menuKey: 'pekerjaan',
                },
                {
                    title: 'Kontrak',
                    url: '/kontrak',
                    icon: FileText,
                    menuKey: 'kontrak',
                },
                {
                    title: 'Output',
                    url: '/output',
                    icon: Package,
                    menuKey: 'output',
                },
                {
                    title: 'Penerima',
                    url: '/penerima',
                    icon: UserCheck,
                    menuKey: 'penerima',
                },
            ],
        },
        {
            title: 'Dokumentasi',
            items: [
                {
                    title: 'Foto',
                    url: '/foto',
                    icon: Camera,
                    menuKey: 'foto',
                },
                {
                    title: 'Berkas',
                    url: '/berkas',
                    icon: FolderOpen,
                    menuKey: 'berkas',
                },
            ],
        },
        {
            title: 'Pengaturan',
            items: [
                {
                    title: 'Settings',
                    url: '/settings',
                    icon: Command,
                    menuKey: 'settings',
                },
                {
                    title: 'Users',
                    url: '/users',
                    icon: Users,
                    menuKey: 'users',
                },
                {
                    title: 'Roles',
                    url: '/roles',
                    icon: Shield,
                    menuKey: 'roles',
                },
                {
                    title: 'Permissions',
                    url: '/permissions',
                    icon: Key,
                    menuKey: 'permissions',
                },
                {
                    title: 'Kegiatan-Role',
                    url: '/kegiatan-role',
                    icon: Link2,
                    menuKey: 'kegiatan_role',
                },
                {
                    title: 'Menu Permissions',
                    url: '/menu-permissions',
                    icon: Shield,
                    menuKey: 'menu_permissions',
                },
            ],
        },
    ],
}