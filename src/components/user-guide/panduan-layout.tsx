import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'
import { Heading } from '@/components/ui/heading'
import type { TocItem, NavSection } from '@/lib/user-guide'

interface PanduanLayoutProps {
    sections: NavSection[]
    toc: TocItem[]
    title: string
    description?: string
    slug: string
    children: React.ReactNode
}

export function PanduanLayout({
    sections,
    toc,
    title,
    description,
    slug,
    children,
}: PanduanLayoutProps) {
    return (
        <div className="flex flex-1 flex-col">
            <Header>
                <Heading
                    title={title ?? 'Panduan Pengguna'}
                    description={description ?? ''}
                />
            </Header>
            <Main className="flex-1">
                <div className="flex gap-6">
                    {/* Left sidebar — navigation */}
                    <aside className="hidden w-56 shrink-0 lg:block">
                        <ScrollArea className="sticky top-20 h-[calc(100vh-8rem)]">
                            <nav className="space-y-4 pr-4">
                                <Link
                                    to="/panduan"
                                    className={cn(
                                        'block text-sm font-medium py-1',
                                        slug === 'index'
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    Ringkasan
                                </Link>
                                {sections.map((section) => (
                                    <div key={section.title}>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                            {section.title}
                                        </p>
                                        <ul className="space-y-0.5">
                                            {section.items.map((item) => (
                                                <li key={item.slug}>
                                                    <Link
                                                        to="/panduan/$slug"
                                                        params={{ slug: item.slug }}
                                                        className={cn(
                                                            'block text-sm py-0.5 border-l-2 pl-3 transition-colors',
                                                            slug === item.slug
                                                                ? 'border-primary text-foreground font-medium'
                                                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
                                                        )}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </nav>
                        </ScrollArea>
                    </aside>

                    {/* Main content */}
                    <div className="min-w-0 flex-1">
                        <article className="prose-custom max-w-3xl">
                            {children}
                        </article>
                    </div>

                    {/* Right sidebar — TOC */}
                    {toc.length > 0 && (
                        <aside className="hidden w-56 shrink-0 xl:block">
                            <ScrollArea className="sticky top-20 h-[calc(100vh-8rem)]">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    Di halaman ini
                                </p>
                                <nav>
                                    {toc.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={cn(
                                                'block text-sm py-0.5 border-l-2 border-transparent pl-3 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-colors',
                                                item.level === 3 && 'pl-6',
                                                item.level === 4 && 'pl-9',
                                            )}
                                        >
                                            {item.text}
                                        </a>
                                    ))}
                                </nav>
                            </ScrollArea>
                        </aside>
                    )}

                    {/* Mobile bottom nav */}
                    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
                        <div className="flex overflow-x-auto px-4 py-2 gap-2">
                            <Link
                                to="/panduan"
                                className={cn(
                                    'whitespace-nowrap text-xs rounded-full px-3 py-1',
                                    slug === 'index'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                Ringkasan
                            </Link>
                            {sections.flatMap((s) => s.items).map((item) => (
                                <Link
                                    key={item.slug}
                                    to="/panduan/$slug"
                                    params={{ slug: item.slug }}
                                    className={cn(
                                        'whitespace-nowrap text-xs rounded-full px-3 py-1',
                                        slug === item.slug
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>
            </Main>
        </div>
    )
}
