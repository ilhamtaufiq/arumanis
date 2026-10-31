import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { getBerkasList } from '@/features/berkas/api'
import type { Berkas } from '@/features/berkas/types'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    pekerjaanId: number | null
    onPilih: (berkas: Berkas[]) => void
}

const namaBerkas = (b: Berkas) => b.original_name || b.file_name || `berkas_${b.id}`

/** Pilih satu atau lebih berkas PDF dari pekerjaan yang dipilih, untuk dimasukkan ke buku kontrak. */
export function BerkasPdfPicker({ open, onOpenChange, pekerjaanId, onPilih }: Props) {
    const [terpilih, setTerpilih] = useState<Set<number>>(new Set())

    const { data: berkasList = [], isLoading, isError } = useQuery({
        queryKey: ['buku-kontrak', 'berkas', pekerjaanId],
        queryFn: async () => {
            // Ambil semua halaman berkas pekerjaan, bukan hanya halaman pertama.
            const semua: Berkas[] = []
            let page = 1
            let lastPage = 1
            do {
                const res = await getBerkasList({ pekerjaan_id: pekerjaanId ?? undefined, page })
                semua.push(...res.data)
                lastPage = res.meta?.last_page ?? page
                page += 1
            } while (page <= lastPage)
            return semua
        },
        enabled: open && pekerjaanId !== null,
    })

    // PDF dikenali dari tipe MIME, atau dari nama file bila tipe MIME tidak ada.
    const pdf = berkasList.filter((b) => b.mime_type === 'application/pdf' || /\.pdf$/i.test(namaBerkas(b)))

    const toggle = (id: number) =>
        setTerpilih((s) => {
            const n = new Set(s)
            if (n.has(id)) n.delete(id)
            else n.add(id)
            return n
        })

    const tambahkan = () => {
        onPilih(pdf.filter((b) => terpilih.has(b.id)))
        setTerpilih(new Set())
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Ambil PDF dari berkas pekerjaan</DialogTitle>
                    <DialogDescription>Hanya berkas PDF yang ditampilkan.</DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-2">
                    {pekerjaanId === null ? (
                        <p className="text-sm text-muted-foreground">Pilih pekerjaan tujuan dulu.</p>
                    ) : isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Memuat berkas...
                        </div>
                    ) : isError ? (
                        <p className="text-sm text-destructive">Gagal memuat berkas pekerjaan.</p>
                    ) : pdf.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Pekerjaan ini belum punya berkas PDF.</p>
                    ) : (
                        pdf.map((b) => (
                            <label key={b.id} className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={terpilih.has(b.id)}
                                    onChange={() => toggle(b.id)}
                                />
                                <span className="min-w-0">
                                    <span className="block break-all text-sm font-medium">{namaBerkas(b)}</span>
                                    <span className="block text-xs text-muted-foreground">{b.jenis_dokumen}</span>
                                </span>
                            </label>
                        ))
                    )}
                </div>

                <DialogFooter className="gap-2 border-t pt-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={tambahkan} disabled={terpilih.size === 0}>
                        Tambahkan ({terpilih.size})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
