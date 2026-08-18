import { Menu } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import type { PublicMessages } from '../i18n/types'

type LandingMobileNavProps = {
    copy: PublicMessages['landing']
    showSpmDetailPage: boolean
    showCapaianPublikSection?: boolean
}

type NavItem =
    | { label: string; href: string; to?: undefined }
    | { label: string; href?: undefined; to: '/capaian-spm' }

export function LandingMobileNav({
    copy,
    showSpmDetailPage,
    showCapaianPublikSection = true,
}: LandingMobileNavProps) {
    const showAchievements = showCapaianPublikSection || showSpmDetailPage

    const navItems: NavItem[] = [
        ...(showAchievements
            ? [
                showSpmDetailPage
                    ? { label: copy.nav.achievements, to: '/capaian-spm' as const }
                    : { label: copy.nav.achievements, href: '#capaian-spm' },
            ]
            : []),
        { label: copy.nav.about, href: '#about' },
        { label: copy.nav.publications, href: '#publikasi' },
        { label: copy.nav.instagram, href: '#instagram' },
    ]

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="md:hidden h-9 rounded-sm border-2 border-[#1C1C1C] bg-white px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#1C1C1C] brutal-shadow hover:bg-[#FCE954]"
                    aria-label={copy.nav.menu}
                >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">{copy.nav.menu}</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="border-l-4 border-[#1C1C1C] bg-[#FAFAFA] text-[#1C1C1C]"
            >
                <SheetHeader>
                    <SheetTitle className="text-left text-sm font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/80">
                        {copy.nav.menu}
                    </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-2" aria-label={copy.nav.menu}>
                    {navItems.map((item) => (
                        <SheetClose key={item.label} asChild>
                            {item.to ? (
                                <Link
                                    to={item.to}
                                    className="rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow px-3 py-3 text-sm font-bold text-[#1C1C1C] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    href={item.href}
                                    className="rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow px-3 py-3 text-sm font-bold text-[#1C1C1C] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                                    onClick={(e) => {
                                        if (!item.href?.startsWith('#')) return
                                        e.preventDefault()
                                        const el = document.querySelector(item.href)
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                    }}
                                >
                                    {item.label}
                                </a>
                            )}
                        </SheetClose>
                    ))}
                    <Link
                        to="/publikasi"
                        className="rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow px-3 py-3 text-sm font-bold text-[#1C1C1C] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                        {copy.publications.cta}
                    </Link>
                    <Link
                        to="/tujuan-manfaat-hasil"
                        className="rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow px-3 py-3 text-sm font-bold text-[#1C1C1C] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                        {copy.footer.objectives}
                    </Link>
                    <Link
                        to="/rancang-bangun-inovasi"
                        className="rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow px-3 py-3 text-sm font-bold text-[#1C1C1C] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                        {copy.footer.designBuild}
                    </Link>
                    <Link
                        to="/changelog"
                        className="rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow px-3 py-3 text-sm font-bold text-[#1C1C1C] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                        {copy.footer.changelog}
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    )
}
