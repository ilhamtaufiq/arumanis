import { Link, useLocation } from '@tanstack/react-router'
import { Briefcase, Camera, Home, TrendingUp, UserRound, type LucideIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

type Item = { to: string; label: string; icon: LucideIcon; aktifJika: (path: string) => boolean }

const MENU: Item[] = [
    { to: '/m', label: 'Beranda', icon: Home, aktifJika: (p) => p === '/m' || p === '/m/' },
    { to: '/m/proyek', label: 'Pekerjaan', icon: Briefcase, aktifJika: (p) => p.startsWith('/m/proyek') || p.startsWith('/m/cari') },
    { to: '/m/progres', label: 'Progres Fisik', icon: TrendingUp, aktifJika: (p) => p.startsWith('/m/progres') },
    { to: '/m/lapangan', label: 'Lapangan', icon: Camera, aktifJika: (p) => p.startsWith('/m/lapangan') },
    { to: '/m/profil', label: 'Profil', icon: UserRound, aktifJika: (p) => p.startsWith('/m/profil') },
]

/** Menu samping mobile. Dibuka dari tombol burger di header dan tertutup otomatis saat berpindah halaman. */
export function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const path = useLocation({ select: (l) => l.pathname })
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-72 gap-0 p-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <SheetHeader className="border-b p-4 pr-12">
                    <SheetTitle className="text-base">Menu</SheetTitle>
                    <SheetDescription className="sr-only">Pilih halaman</SheetDescription>
                </SheetHeader>
                <nav aria-label="Menu utama" className="flex flex-col gap-1 p-3">
                    {MENU.map((m) => {
                        const aktif = m.aktifJika(path)
                        const Icon = m.icon
                        return (
                            <Link
                                key={m.to}
                                to={m.to as never}
                                onClick={() => onOpenChange(false)}
                                aria-current={aktif ? 'page' : undefined}
                                className={`flex h-12 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${aktif ? 'bg-primary/12 font-semibold text-primary' : 'font-medium text-foreground active:bg-muted'}`}
                            >
                                <Icon className="h-[19px] w-[19px]" aria-hidden />
                                {m.label}
                            </Link>
                        )
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    )
}
