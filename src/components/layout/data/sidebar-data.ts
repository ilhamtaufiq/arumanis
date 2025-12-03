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
                },
                {
                    title: 'Kecamatan',
                    url: '/kecamatan',
                    icon: MapPin,
                },
                {
                    title: 'Desa',
                    url: '/desa',
                    icon: Map,
                },
                {
                    title: 'Pekerjaan',
                    url: '/pekerjaan',
                    icon: Briefcase,
                },
                {
                    title: 'Kontrak',
                    url: '/kontrak',
                    icon: FileText,
                },
                {
                    title: 'Output',
                    url: '/output',
                    icon: Package,
                },
                {
                    title: 'Penerima',
                    url: '/penerima',
                    icon: UserCheck,
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
                },
                {
                    title: 'Berkas',
                    url: '/berkas',
                    icon: FolderOpen,
                },
            ],
        },
        {
            title: 'Manajemen User',
            items: [
                {
                    title: 'Users',
                    url: '/users',
                    icon: Users,
                },
                {
                    title: 'Roles',
                    url: '/roles',
                    icon: Shield,
                },
                {
                    title: 'Permissions',
                    url: '/permissions',
                    icon: Key,
                },
                {
                    title: 'Kegiatan-Role',
                    url: '/kegiatan-role',
                    icon: Link2,
                },
            ],
        },
    ],
}