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
            'rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors',
            (category ? activeCategory === category : !activeCategory)
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        )

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        to="/"
                        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary sm:inline-flex"
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
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                                <Newspaper className="h-4 w-4" />
                            </div>
                        )}
                        <div className="min-w-0 leading-none">
                            <p className="truncate text-sm font-bold uppercase tracking-tight">
                                {appName || 'Arumanis'}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                                Publikasi
                            </p>
                        </div>
                    </Link>
                </div>

                <nav className="hidden items-center gap-1 lg:flex">
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
                                className="h-9 w-9 rounded-full lg:hidden"
                                aria-label="Buka menu kategori"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[min(100vw-2rem,320px)]">
                            <SheetHeader>
                                <SheetTitle>Kategori Publikasi</SheetTitle>
                            </SheetHeader>
                            <nav className="mt-6 flex flex-col gap-2">
                                <Link
                                    to="/publikasi"
                                    search={{}}
                                    className={cn(
                                        'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                                        !activeCategory
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted',
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
                                            'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                                            activeCategory === item
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted',
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