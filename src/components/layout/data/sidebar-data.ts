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
    Shield,
    UserCog,
    MessageSquare,
    Bell,
    Calendar,
    History as HistoryIcon,
    Phone,
    FileSearch,
} from 'lucide-react'
import { type SidebarData } from '../type'

export const sidebarData: SidebarData = {
    user: {
        name: 'User',
        email: 'user@ilham.wtf',
        avatar: '/arumanis.svg',
    },
    teams: [
        {
            name: 'ARUMANIS',
            logo: '/arumanis.svg',
            plan: 'ilham.wtf',
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
                {
                    title: 'Tiket & Laporan',
                    url: '/tiket',
                    icon: MessageSquare,
                    menuKey: 'tiket',
                },
                {
                    title: 'Pusat Notifikasi',
                    url: '/notifications',
                    icon: Bell,
                    menuKey: 'notifications',
                },
                {
                    title: 'Kalender',
                    url: '/calendar',
                    icon: Calendar,
                    menuKey: 'calendar',
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
                    title: 'Checklist Pekerjaan',
                    url: '/checklist',
                    icon: UserCheck,
                    menuKey: 'checklist',
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
                {
                    title: 'Pengawas',
                    url: '/pengawas',
                    icon: UserCog,
                    menuKey: 'pengawas',
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
                    title: 'Peta Progress',
                    url: '/map',
                    icon: MapPin,
                    menuKey: 'map',
                },
                {
                    title: 'Simulasi Jaringan',
                    url: '/simulation',
                    icon: Command,
                    menuKey: 'simulation',
                },
                {
                    title: 'Berkas',
                    url: '/berkas',
                    icon: FolderOpen,
                    menuKey: 'berkas',
                },
                {
                    title: 'RAB Analyzer',
                    url: '/rab-analyzer',
                    icon: FileSearch,
                    menuKey: 'rab_analyzer',
                },
            ],
        },
        {
            title: 'Pengaturan',
            items: [
                {
                    title: 'Audit Trail',
                    url: '/audit-logs',
                    icon: HistoryIcon,
                    menuKey: 'audit_trail',
                },
                {
                    title: 'Pengaturan Aplikasi',
                    url: '/settings',
                    icon: Command,
                    menuKey: 'settings',
                },
                {
                    title: 'Menu Permissions',
                    url: '/menu-permissions',
                    icon: Shield,
                    menuKey: 'menu_permissions',
                },
                {
                    title: 'Assign Pekerjaan',
                    url: '/user-pekerjaan',
                    icon: UserCog,
                    menuKey: 'user_pekerjaan',
                },
                {
                    title: 'Broadcast Notifikasi',
                    url: '/notifications/broadcast',
                    icon: MessageSquare,
                    menuKey: 'broadcast_notification',
                },
                {
                    title: 'WhatsApp',
                    url: '/whatsapp',
                    icon: Phone,
                    menuKey: 'whatsapp',
                },
            ],
        },
    ],
}