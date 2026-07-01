import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { PublikasiHeader } from './PublikasiHeader'
import { useAppSettingsValues } from '@/hooks/use-app-settings'

interface PublikasiLayoutProps {
    children: ReactNode
}

export function PublikasiLayout({ children }: PublikasiLayoutProps) {
    const { appName, appDescription } = useAppSettingsValues()

    return (
        <div className="relative min-h-screen bg-background font-sans selection:bg-primary/15 selection:text-primary">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden"
            >
                <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute right-0 top-16 h-96 w-96 rounded-full bg-sky-500/5 blur-3xl" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
            </div>

            <PublikasiHeader />

            <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
                {children}
            </main>

            <footer className="relative border-t border-border/60 bg-muted/20">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8 lg:py-16">
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold tracking-tight">
                            {appName || 'Arumanis'}{' '}
                            <span className="text-primary">Publikasi</span>
                        </h4>
                        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                            {appDescription ||
                                'Kanal informasi resmi seputar pembangunan infrastruktur air minum dan sanitasi Kabupaten Cianjur.'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 text-sm text-muted-foreground lg:items-end">
                        <Link to="/" className="font-medium text-foreground transition-colors hover:text-primary">
                            Kembali ke Beranda Arumanis
                        </Link>
                        <Link
                            to="/publikasi"
                            className="transition-colors hover:text-primary"
                        >
                            Semua Publikasi
                        </Link>
                        <p className="pt-2 text-xs uppercase tracking-widest text-muted-foreground/70">
                            Bidang Air Minum dan Sanitasi
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}