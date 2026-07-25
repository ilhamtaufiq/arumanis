import { useEffect, useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Sp2dMatchRef } from '../types'

type CatalogItem = { id: number; label: string; score?: number }

type MatchOverrideDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    candidates: Sp2dMatchRef[]
    current: Sp2dMatchRef | null
    catalog: CatalogItem[]
    onSelect: (value: Sp2dMatchRef | null) => void
}

/**
 * Lightweight override: candidates first, then search-filtered catalog (max 40 hits).
 */
export function MatchOverrideDialog({
    open,
    onOpenChange,
    title,
    description,
    candidates,
    current,
    catalog,
    onSelect,
}: MatchOverrideDialogProps) {
    const [query, setQuery] = useState('')

    useEffect(() => {
        if (!open) setQuery('')
    }, [open])

    const results = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) {
            const preferred = new Map<number, CatalogItem>()
            for (const c of candidates) {
                preferred.set(c.id, { id: c.id, label: c.label, score: c.score })
            }
            if (current) {
                preferred.set(current.id, {
                    id: current.id,
                    label: current.label,
                    score: current.score,
                })
            }
            for (const item of catalog.slice(0, 30)) {
                if (!preferred.has(item.id)) preferred.set(item.id, item)
            }
            return Array.from(preferred.values())
        }

        const hits: CatalogItem[] = []
        for (const item of catalog) {
            if (item.label.toLowerCase().includes(q)) {
                hits.push(item)
                if (hits.length >= 40) break
            }
        }
        return hits
    }, [query, candidates, current, catalog])

    const candidateIds = useMemo(() => new Set(candidates.map((c) => c.id)), [candidates])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[min(90vh,640px)] w-[min(100vw-2rem,32rem)] flex-col gap-4 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="space-y-1.5 border-b px-5 pb-3 pt-5 text-left">
                    <DialogTitle className="pr-8 text-base leading-snug">{title}</DialogTitle>
                    {description ? (
                        <DialogDescription className="line-clamp-2 text-xs leading-relaxed">
                            {description}
                        </DialogDescription>
                    ) : null}
                </DialogHeader>

                <div className="space-y-3 px-5">
                    {current ? (
                        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700/80 dark:text-emerald-400/80">
                                    Terpilih
                                </p>
                                <p className="break-words text-sm font-medium leading-snug text-emerald-950 dark:text-emerald-50">
                                    {current.label}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            autoFocus
                            className="h-9 pl-9"
                            placeholder="Cari nama…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto border-y px-2 py-1">
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
                        onClick={() => {
                            onSelect(null)
                            onOpenChange(false)
                        }}
                    >
                        <X className="h-3.5 w-3.5 shrink-0" />
                        <span>Kosongkan pilihan</span>
                    </button>

                    {results.map((item) => {
                        const selected = current?.id === item.id
                        const isCandidate = candidateIds.has(item.id)
                        const score = item.score
                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={cn(
                                    'flex w-full items-start gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                                    selected && 'bg-emerald-50 hover:bg-emerald-50 dark:bg-emerald-950/50',
                                )}
                                onClick={() => {
                                    onSelect({
                                        id: item.id,
                                        label: item.label,
                                        score: score && score > 0 ? score : 1,
                                    })
                                    onOpenChange(false)
                                }}
                            >
                                <span
                                    className={cn(
                                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                                        selected
                                            ? 'border-emerald-600 bg-emerald-600 text-white'
                                            : 'border-muted-foreground/30',
                                    )}
                                >
                                    {selected ? <Check className="h-2.5 w-2.5" /> : null}
                                </span>
                                <span className="min-w-0 flex-1 break-words leading-snug">{item.label}</span>
                                <span className="flex shrink-0 flex-col items-end gap-0.5">
                                    {isCandidate && score != null && score > 0 && score < 1 ? (
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
                                            {Math.round(score * 100)}%
                                        </Badge>
                                    ) : null}
                                    {isCandidate ? (
                                        <span className="text-[10px] text-muted-foreground">saran</span>
                                    ) : null}
                                </span>
                            </button>
                        )
                    })}

                    {results.length === 0 ? (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                            Tidak ada hasil. Coba kata kunci lain.
                        </p>
                    ) : null}
                </div>

                <DialogFooter className="px-5 pb-4 pt-0 sm:justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
