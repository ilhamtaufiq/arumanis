import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { importTenderReferensi, terapkanAnggaranTenderReferensi } from '../api/tender-referensi'

/** Impor CSV SPSE (tender dan non-tender) dan terapkan baris lengkap ke anggaran unit SPAM. */
export function SpamTenderImportCard() {
    const qc = useQueryClient()
    const inputRef = useRef<HTMLInputElement>(null)
    const [berkas, setBerkas] = useState<File | null>(null)

    const impor = useMutation({
        mutationFn: (file: File) => importTenderReferensi(file),
        onSuccess: (r) => {
            toast.success(
                `${r.dibaca} baris dibaca · ${r.lokasi_desa_dikenali} desa dikenali · ${r.terhubung_ke_unit} terhubung ke unit`,
            )
            setBerkas(null)
            if (inputRef.current) inputRef.current.value = ''
            qc.invalidateQueries({ queryKey: ['spam-unit-tender-referensi'] })
        },
        onError: (e: Error) => toast.error(e.message),
    })

    const terapkan = useMutation({
        mutationFn: terapkanAnggaranTenderReferensi,
        onSuccess: (r) => {
            toast.success(`${r.diterapkan} anggaran baru · ${r.sudah_ada_atau_tidak_lengkap} dilewati`)
            qc.invalidateQueries({ queryKey: ['spam-unit-detail'] })
        },
        onError: (e: Error) => toast.error(e.message),
    })

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Referensi tender SPSE (CSV)</CardTitle>
                <p className="text-xs text-muted-foreground">
                    Unggah CSV tender atau non-tender. Baris yang lengkap bisa diterapkan ke anggaran unit. Anggaran yang
                    sudah ada tidak diubah.
                </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,text/csv"
                    aria-label="Berkas CSV tender SPSE"
                    className="text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5"
                    onChange={(e) => setBerkas(e.target.files?.[0] ?? null)}
                />
                <div className="flex gap-2">
                    <Button onClick={() => berkas && impor.mutate(berkas)} disabled={!berkas || impor.isPending}>
                        {impor.isPending ? 'Mengunggah…' : 'Unggah CSV'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (window.confirm('Terapkan baris lengkap ke anggaran unit SPAM? Anggaran yang sudah ada tidak diubah.')) {
                                terapkan.mutate()
                            }
                        }}
                        disabled={terapkan.isPending}
                    >
                        Terapkan ke anggaran
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
