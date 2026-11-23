import type { ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Bell, Camera, Briefcase, Home, UserRound, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-stores'

type Tab = { to: string; label: string; icon: LucideIcon; aktifJika: (path: string) => boolean }

const TABS: Tab[] = [
    { to: '/m', label: 'Beranda', icon: Home, aktifJika: (p) => p === '/m' || p === '/m/' },
    { to: '/m/proyek', label: 'Proyek', icon: Briefcase, aktifJika: (p) => p.startsWith('/m/proyek') || p.startsWith('/m/cari') },
    { to: '/m/lapangan', label: 'Lapangan', icon: Camera, aktifJika: (p) => p.startsWith('/m/lapangan') },
    { to: '/m/profil', label: 'Profil', icon: UserRound, aktifJika: (p) => p.startsWith('/m/profil') },
]

/** Header kaca: merek ringkas, tombol notifikasi, dan avatar. */
function Header() {
    const nama = useAuthStore((s) => s.auth.user?.name)
    const inisial = (nama ?? 'A').trim().charAt(0).toUpperCase()
    return (
        <header
            className="sticky top-0 z-30 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
            <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-4">
                <Link to={'/m' as never} className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-sm font-black text-primary-foreground shadow-sm">A</span>
                    <span className="flex flex-col leading-none">
                        <span className="text-[15px] font-extrabold tracking-tight">Arumanis</span>
                        <span className="mt-1 text-[11px] font-medium text-muted-foreground">Kab. Cianjur · SPM</span>
                    </span>
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        to={'/notifications' as never}
                        aria-label="Notifikasi"
                        className="grid h-10 w-10 place-items-center rounded-full bg-muted/70 text-foreground transition-colors active:bg-muted"
                    >
                        <Bell className="h-[18px] w-[18px]" aria-hidden />
                    </Link>
                    <Link
                        to={'/m/profil' as never}
                        aria-label="Akun"
                        className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-background"
                    >
                        {inisial}
                    </Link>
                </div>
            </div>
        </header>
    )
}

/** Navigasi bawah berbentuk pil mengambang. Tab aktif menyala dengan latar dan label. */
function BottomNav() {
    const path = useLocation({ select: (l) => l.pathname })
    return (
        <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 z-40 px-4"
            style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
            <ul className="mx-auto grid max-w-md grid-cols-4 rounded-full border bg-background/85 p-1.5 shadow-xl shadow-black/10 backdrop-blur-xl">
                {TABS.map((t) => {
                    const aktif = t.aktifJika(path)
                    const Icon = t.icon
                    return (
                        <li key={t.to}>
                            <Link
                                to={t.to as never}
                                aria-current={aktif ? 'page' : undefined}
                                className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] transition-colors ${aktif ? 'bg-primary/12 font-semibold text-primary' : 'font-medium text-muted-foreground'}`}
                            >
                                <Icon className={`h-[19px] w-[19px] ${aktif ? 'stroke-[2.4]' : ''}`} aria-hidden />
                                {t.label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

/** Kerangka layar mobile: header kaca, konten, dan navigasi bawah pil. */
export function MobileShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <Header />
            <div className="flex-1 pb-28">{children}</div>
            <BottomNav />
        </div>
    )
}
