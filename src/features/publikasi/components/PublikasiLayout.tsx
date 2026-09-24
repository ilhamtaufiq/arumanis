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
        <div className="relative min-h-screen bg-background font-sans text-foreground">
            <PublikasiHeader />

            <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
                {children}
            </main>

            <footer className="relative border-t border-border">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8 lg:py-16">
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold tracking-tight">
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
                        <p className="pt-2 text-xs uppercase tracking-widest text-muted-foreground">
                            Bidang Air Minum dan Sanitasi
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
