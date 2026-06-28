import { Calculator } from 'lucide-react'
import { useSearch } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { RabAnalyzerPanel } from './RabAnalyzerPanel'

export default function RabAnalyzerPage() {
    const search = useSearch({ from: '/_authenticated/rab-analyzer/' }) as {
        pekerjaanId?: string | number
    }
    const initialPekerjaanId = search.pekerjaanId ? String(search.pekerjaanId) : undefined
    return (
        <>
            <Header fixed />

            <Main className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/8 via-background to-background p-6 shadow-sm">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

                    <div className="relative space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/5 text-primary">
                                <Calculator className="h-3 w-3" />
                                RAB Analyzer
                            </Badge>
                            <Badge variant="secondary" className="font-mono text-[11px]">
                                MCK · SPAM JP
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Analisa RAB
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Tempel data RAB dari Excel untuk mengurai item pekerjaan, menghitung DPP, PPN 11%, dan total secara otomatis.
                        </p>
                    </div>
                </div>

                <RabAnalyzerPanel initialPekerjaanId={initialPekerjaanId} />
            </Main>
        </>
    )
}