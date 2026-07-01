import { Menu } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import type { PublicMessages } from '../i18n/types'

type LandingMobileNavProps = {
    copy: PublicMessages['landing']
    showSpmDetailPage: boolean
}

export function LandingMobileNav({ copy, showSpmDetailPage }: LandingMobileNavProps) {
    const navItems = [
        {
            label: copy.nav.achievements,
            href: showSpmDetailPage ? undefined : '#capaian-spm',
            to: showSpmDetailPage ? '/capaian-spm' as const : undefined,
        },
        { label: copy.nav.access, href: '#access' },
        { label: copy.nav.about, href: '#about' },
        { label: copy.nav.publications, href: '#publikasi' },
    ]

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="md:hidden h-9 rounded-full border-white/20 bg-black/20 px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-2xl hover:bg-white/15"
                    aria-label={copy.nav.menu}
                >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">{copy.nav.menu}</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl"
            >
                <SheetHeader>
                    <SheetTitle className="text-left text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                        {copy.nav.menu}
                    </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-2" aria-label={copy.nav.menu}>
                    {navItems.map((item) =>
                        item.to ? (
                            <Link
                                key={item.label}
                                to={item.to}
                                className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <a
                                key={item.label}
                                href={item.href}
                                className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                            >
                                {item.label}
                            </a>
                        ),
                    )}
                    <Link
                        to="/publikasi"
                        className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                    >
                        {copy.publications.cta}
                    </Link>
                    <Link
                        to="/tujuan-manfaat-hasil"
                        className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                    >
                        {copy.footer.objectives}
                    </Link>
                    <Link
                        to="/rancang-bangun-inovasi"
                        className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                    >
                        {copy.footer.designBuild}
                    </Link>
                    <Link
                        to="/changelog"
                        className="rounded-lg px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                    >
                        {copy.footer.changelog}
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    )
}