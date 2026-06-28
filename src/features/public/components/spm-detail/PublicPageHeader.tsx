import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { LocaleToggle } from '../locale-toggle'
import type { PublicMessages } from '../../i18n/types'

type PublicPageHeaderProps = {
    copy: PublicMessages['spmDetail']['header']
}

export function PublicPageHeader({ copy }: PublicPageHeaderProps) {
    return (
        <header className="fixed top-5 md:top-8 z-50 w-full pointer-events-none">
            <div className="container mx-auto flex items-center justify-between gap-3 px-6 pointer-events-auto">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-2xl transition-colors hover:bg-white/15"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                        {copy.back}
                    </Link>
                    <img src="/arumanis.svg" alt="Arumanis" className="hidden h-9 w-auto sm:block" />
                </div>

                <div className="flex items-center gap-2">
                    <LocaleToggle variant="header" className="hidden sm:inline-flex" />
                    <Link
                        to="/sign-in"
                        className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-950 shadow-lg shadow-black/15 transition-colors hover:bg-white/90"
                    >
                        {copy.signIn}
                    </Link>
                </div>
            </div>
        </header>
    )
}