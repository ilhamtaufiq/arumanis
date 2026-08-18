import { Link, useSearch } from '@tanstack/react-router'
import { ArrowLeft, Menu, Newspaper } from 'lucide-react'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { cn } from '@/lib/utils'
import { PUBLIKASI_CATEGORIES } from '../lib/format'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'

export function PublikasiHeader() {
    const { logoUrl, appName } = useAppSettingsValues()
    const finalLogo = logoUrl || '/arumanis.svg'
    const search = useSearch({ strict: false }) as { category?: string }
    const activeCategory = search?.category

    const navLinkClass = (category?: string) =>
        cn(
            'rounded-sm border-2 border-[#1C1C1C] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-transform',
            (category ? activeCategory === category : !activeCategory)
                ? 'bg-[#FCE954] brutal-shadow'
                : 'bg-[#FAFAFA] text-[#1C1C1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
        )

    return (
        <header className="sticky top-0 z-50 border-b-4 border-[#1C1C1C] bg-[#FAFAFA]">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        to="/"
                        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-sm border-2 border-[#1C1C1C] bg-white text-[#1C1C1C] transition-colors hover:bg-[#FCE954] sm:inline-flex"
                        aria-label="Kembali ke beranda"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>

                    <Link to="/publikasi" className="group flex min-w-0 items-center gap-3">
                        {logoUrl ? (
                            <img
                                src={finalLogo}
                                alt={appName || 'Logo'}
                                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-sm border-2 border-[#1C1C1C] bg-[#FF9CBA] text-[#1C1C1C]">
                                <Newspaper className="h-4 w-4" />
                            </div>
                        )}
                        <div className="min-w-0 leading-none">
                            <p className="truncate text-sm font-bold uppercase tracking-tight text-[#1C1C1C]">
                                {appName || 'Arumanis'}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9B72CF]">
                                Publikasi
                            </p>
                        </div>
                    </Link>
                </div>

                <nav className="hidden items-center gap-2 lg:flex">
                    <Link to="/publikasi" search={{}} className={navLinkClass()}>
                        Semua
                    </Link>
                    {PUBLIKASI_CATEGORIES.map((item) => (
                        <Link
                            key={item}
                            to="/publikasi"
                            search={{ category: item }}
                            className={navLinkClass(item)}
                        >
                            {item}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-sm border-2 border-[#1C1C1C] bg-white text-[#1C1C1C] lg:hidden"
                                aria-label="Buka menu kategori"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[min(100vw-2rem,320px)] border-l-4 border-[#1C1C1C] bg-[#FAFAFA] text-[#1C1C1C]">
                            <SheetHeader>
                                <SheetTitle className="text-[#1C1C1C]">Kategori Publikasi</SheetTitle>
                            </SheetHeader>
                            <nav className="mt-6 flex flex-col gap-2">
                                <Link
                                    to="/publikasi"
                                    search={{}}
                                    className={cn(
                                        'rounded-sm border-2 border-[#1C1C1C] px-4 py-3 text-sm font-bold transition-transform',
                                        !activeCategory
                                            ? 'bg-[#FCE954] brutal-shadow'
                                            : 'bg-white text-[#1C1C1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                                    )}
                                >
                                    Semua Publikasi
                                </Link>
                                {PUBLIKASI_CATEGORIES.map((item) => (
                                    <Link
                                        key={item}
                                        to="/publikasi"
                                        search={{ category: item }}
                                        className={cn(
                                            'rounded-sm border-2 border-[#1C1C1C] px-4 py-3 text-sm font-bold transition-transform',
                                            activeCategory === item
                                                ? 'bg-[#FCE954] brutal-shadow'
                                                : 'bg-white text-[#1C1C1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                                        )}
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}