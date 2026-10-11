import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useJurnalBukti, useJurnalRhk } from '../hooks/useJurnalKegiatan'
import { groupBuktiByRhk } from '../lib/bukti-helpers'
import { MONTH_NAMES_ID } from '../lib/jurnal-helpers'
import type { JurnalFoto } from '../types'
import BuktiRhkCard from './BuktiRhkCard'
import FotoPreviewDialog, { type FotoPreviewState } from './FotoPreviewDialog'

interface JurnalBuktiSectionProps {
    tahun: number
    bulan: number
    onOpenRhkSettings: () => void
}

export default function JurnalBuktiSection({ tahun, bulan, onOpenRhkSettings }: JurnalBuktiSectionProps) {
    const rhkQuery = useJurnalRhk(tahun)
    const buktiQuery = useJurnalBukti({ tahun, bulan })
    const [preview, setPreview] = useState<FotoPreviewState | null>(null)

    const monthLabel = `${MONTH_NAMES_ID[bulan - 1]} ${tahun}`
    const masterRhk = rhkQuery.data ?? []
    const cards = groupBuktiByRhk(masterRhk, buktiQuery.data ?? [])
    const masterKosong = rhkQuery.isSuccess && masterRhk.length === 0

    const openPreview = (photos: JurnalFoto[], index: number) => setPreview({ photos, index })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Foto Bukti RHK</CardTitle>
                <CardDescription>
                    Bukti per RHK untuk {monthLabel}. Foto di sini dipakai sebagai bukti per RHK pada slide laporan PPTX.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {rhkQuery.isError && (
                    <p className="text-sm text-destructive">{getApiErrorMessage(rhkQuery.error, 'Gagal memuat daftar RHK')}</p>
                )}
                {buktiQuery.isError && (
                    <div className="flex flex-col items-start gap-2 text-sm">
                        <p className="text-destructive">{getApiErrorMessage(buktiQuery.error, 'Gagal memuat foto bukti')}</p>
                        <Button variant="outline" size="sm" onClick={() => buktiQuery.refetch()}>
                            Coba lagi
                        </Button>
                    </div>
                )}

                {masterKosong && (
                    <div className="flex flex-col items-start gap-2 rounded-md border border-dashed p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-muted-foreground">
                            Belum ada RHK untuk tahun {tahun}. Atur RHK dulu sebelum mengunggah foto bukti.
                        </p>
                        <Button variant="outline" size="sm" onClick={onOpenRhkSettings}>
                            <Settings2 className="h-4 w-4" />
                            Atur RHK
                        </Button>
                    </div>
                )}

                {(rhkQuery.isLoading || buktiQuery.isLoading) && cards.length === 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                    </div>
                )}

                {cards.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {cards.map((card) => (
                            <BuktiRhkCard
                                key={`${tahun}-${bulan}-${card.no}`}
                                card={card}
                                tahun={tahun}
                                bulan={bulan}
                                monthLabel={monthLabel}
                                onPreview={openPreview}
                            />
                        ))}
                    </div>
                )}
            </CardContent>

            <FotoPreviewDialog
                preview={preview}
                onChange={setPreview}
                onClose={() => setPreview(null)}
            />
        </Card>
    )
}
