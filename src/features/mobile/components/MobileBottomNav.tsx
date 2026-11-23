import { Link, useLocation } from '@tanstack/react-router'
import { Bell, Search, UserRound, type LucideIcon } from 'lucide-react'

type Tab = { to: string; label: string; icon: LucideIcon; aktifJika: (path: string) => boolean }

const TABS: Tab[] = [
    { to: '/m', label: 'Cari', icon: Search, aktifJika: (p) => p === '/m' || p === '/m/' },
    { to: '/notifications', label: 'Notifikasi', icon: Bell, aktifJika: (p) => p.startsWith('/notifications') },
    { to: '/profile', label: 'Akun', icon: UserRound, aktifJika: (p) => p.startsWith('/profile') },
]

/** Navigasi bawah tiga tab untuk beranda mobile. Tinggi dan area aman diperhitungkan di pemanggil. */
export function MobileBottomNav() {
    const path = useLocation({ select: (l) => l.pathname })
    return (
        <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <ul className="mx-auto grid max-w-md grid-cols-3">
                {TABS.map((t) => {
                    const aktif = t.aktifJika(path)
                    const Icon = t.icon
                    return (
                        <li key={t.to}>
                            <Link
                                to={t.to as never}
                                aria-current={aktif ? 'page' : undefined}
                                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs ${aktif ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
                            >
                                <Icon className="h-5 w-5" aria-hidden />
                                {t.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
