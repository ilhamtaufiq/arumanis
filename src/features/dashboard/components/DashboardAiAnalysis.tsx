import { useMutation } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { analyzeDashboard, type RingkasanDashboardAi } from '../api/ai'

interface DashboardAiAnalysisProps {
    ringkasan: RingkasanDashboardAi | null
}

/** Kartu analisa AI. Analisa dibuat hanya saat diminta, supaya tidak memanggil model setiap buka dashboard. */
export function DashboardAiAnalysis({ ringkasan }: DashboardAiAnalysisProps) {
    const mutation = useMutation({
        mutationFn: (data: RingkasanDashboardAi) => analyzeDashboard(data),
    })

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Analisa AI
                </CardTitle>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!ringkasan || mutation.isPending}
                    onClick={() => ringkasan && mutation.mutate(ringkasan)}
                >
                    {mutation.isPending ? 'Menganalisa…' : mutation.data ? 'Analisa ulang' : 'Buat analisa'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {mutation.isPending && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                        {/* Pet: Driplet oleh ibreeze2017, dari Petdex (petdex.dev/pets/driplet). */}
                        <img src="/animations/driplet-idle.webp" alt="" width={64} height={69} className="shrink-0" />
                        <span>Sedang membuat analisa…</span>
                    </div>
                )}
                {mutation.isError && (
                    <p role="alert" className="text-destructive">{mutation.error.message}</p>
                )}
                {mutation.data ? (
                    <>
                        <div className="space-y-2 leading-relaxed [&_li]:ml-4 [&_li]:list-disc">
                            <ReactMarkdown>{mutation.data.analisa}</ReactMarkdown>
                        </div>
                        <p className="text-xs text-muted-foreground">Model: {mutation.data.model}. Analisa AI bisa keliru, periksa angka sumbernya.</p>
                    </>
                ) : (
                    !mutation.isError && !mutation.isPending && (
                        <p className="text-muted-foreground">
                            Buat ringkasan kondisi, temuan utama, dan rekomendasi dari angka dashboard TA ini.
                        </p>
                    )
                )}
            </CardContent>
        </Card>
    )
}
