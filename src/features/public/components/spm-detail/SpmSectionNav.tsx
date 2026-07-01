import { BarChart3, Map, Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PublicMessages } from '../../i18n/types'

type SpmSectionNavProps = {
    copy: PublicMessages['spmDetail']['nav']
    activeSection?: 'map' | 'summary' | 'table'
    onNavigate: (section: 'map' | 'summary' | 'table') => void
}

const SECTIONS = [
    { id: 'map' as const, icon: Map },
    { id: 'summary' as const, icon: BarChart3 },
    { id: 'table' as const, icon: Table2 },
]

export function SpmSectionNav({ copy, activeSection, onNavigate }: SpmSectionNavProps) {
    const labels = {
        map: copy.map,
        summary: copy.summary,
        table: copy.table,
    }

    return (
        <nav
            className="sticky top-[4.5rem] z-40 mx-auto flex max-w-2xl justify-center px-4 py-3 md:top-[5.5rem]"
            aria-label="Navigasi bagian capaian SPM"
        >
            <div className="inline-flex w-full rounded-full border border-white/15 bg-slate-950/70 p-1 shadow-lg shadow-black/25 backdrop-blur-md sm:w-auto">
                {SECTIONS.map(({ id, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onNavigate(id)}
                        className={cn(
                            'inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all sm:flex-none sm:px-5',
                            activeSection === id
                                ? 'bg-white text-slate-950 shadow-sm'
                                : 'text-white/65 hover:bg-white/10 hover:text-white',
                        )}
                    >
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        <span className="hidden sm:inline">{labels[id]}</span>
                    </button>
                ))}
            </div>
        </nav>
    )
}