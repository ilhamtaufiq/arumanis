import type { ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Bell, Camera, Home, Map as MapIcon, Briefcase, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-stores'

type Tab = { to: string; label: string; icon: LucideIcon; aktifJika: (path: string) => boolean }

const TABS: Tab[] = [
    { to: '/m', label: 'Beranda', icon: Home, aktifJika: (p) => p === '/m' || p === '/m/' },
    { to: '/m/proyek', label: 'Proyek', icon: Briefcase, aktifJika: (p) => p.startsWith('/m/proyek') || p.startsWith('/m/cari') },
    { to: '/m/lapangan', label: 'Lapangan', icon: Camera, aktifJika: (p) => p.startsWith('/m/lapangan') },
    { to: '/m/peta', label: 'Peta', icon: MapIcon, aktifJika: (p) => p.startsWith('/m/peta') },
]

/** Kerangka layar mobile: header ringkas (notifikasi dan akun) dan navigasi bawah empat tab. */
export function MobileShell({ children }: { children: ReactNode }) {
    const path = useLocation({ select: (l) => l.pathname })
    const nama = useAuthStore((s) => s.auth.user?.name)
    const inisial = (nama ?? 'A').trim().charAt(0).toUpperCase()

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <header
                className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
                    <Link to={'/m' as never} className="text-base font-bold tracking-tight">
                        ARUMANIS <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">SPM</span>
                    </Link>
                    <div className="flex items-center gap-1">
                        <Link to={'/notifications' as never} aria-label="Notifikasi" className="relative grid h-10 w-10 place-items-center rounded-full">
                            <Bell className="h-5 w-5" aria-hidden />
                        </Link>
                        <Link to={'/profile' as never} aria-label="Akun" className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                            {inisial}
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex-1">{children}</div>

            <nav
                aria-label="Navigasi utama"
                className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <ul className="mx-auto grid max-w-md grid-cols-4">
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
        </div>
    )
}
