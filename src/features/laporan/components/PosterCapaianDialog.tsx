import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadBlob } from '@/lib/download-file'
import { getCapaianBidang } from '../api/capaian-bidang'
import { cariBidang, POSTER_HEIGHT, POSTER_LAYOUT, POSTER_WIDTH, type PosterBidang } from '../lib/poster-capaian'
import { PosterCapaian } from './PosterCapaian'

type PosterCapaianDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    tahun: string
}

const BIDANG: PosterBidang[] = ['air-minum', 'sanitasi']
const NAMA_TAB: Record<PosterBidang, string> = { 'air-minum': 'Air Minum', sanitasi: 'Sanitasi' }

/** Pratinjau dan unduh poster capaian per bidang (PNG), dengan angka dari `/dashboard/capaian-bidang`. */
export function PosterCapaianDialog({ open, onOpenChange, tahun }: PosterCapaianDialogProps) {
    const [aktif, setAktif] = useState<PosterBidang>('air-minum')
    const [mengunduh, setMengunduh] = useState(false)
    const [lebar, setLebar] = useState(0)
    const wadahRef = useRef<HTMLDivElement>(null)
    const unduhRef = useRef<Record<PosterBidang, HTMLDivElement | null>>({ 'air-minum': null, sanitasi: null })

    const query = useQuery({
        queryKey: ['capaian-bidang', tahun],
        queryFn: () => getCapaianBidang(tahun),
        enabled: open,
        staleTime: 60_000,
    })
    const tanggal = useMemo(() => new Date(query.dataUpdatedAt || Date.now()), [query.dataUpdatedAt])

    useEffect(() => {
        const wadah = wadahRef.current
        if (!open || !wadah) return
        const ukur = () => setLebar(wadah.clientWidth)
        ukur()
        const pengamat = new ResizeObserver(ukur)
        pengamat.observe(wadah)
        return () => pengamat.disconnect()
    }, [open, query.isSuccess])

    const skala = lebar > 0 ? Math.min(1, lebar / POSTER_WIDTH) : 0.3

    const unduh = async (target: PosterBidang[]) => {
        setMengunduh(true)
        try {
            const { default: html2canvas } = await import('html2canvas')
            for (const bidang of target) {
                const el = unduhRef.current[bidang]
                if (!el) throw new Error('Poster belum siap')
                await Promise.all(
                    Array.from(el.querySelectorAll('img')).map((gambar) => gambar.decode().catch(() => undefined)),
                )
                const kanvas = await html2canvas(el, {
                    width: POSTER_WIDTH,
                    height: POSTER_HEIGHT,
                    scale: 1,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                })
                const blob = await new Promise<Blob | null>((selesai) => kanvas.toBlob(selesai, 'image/png'))
                if (!blob) throw new Error('Gagal membuat gambar')
                downloadBlob(blob, `poster-capaian-${bidang}-${tahun}.png`)
            }
            toast.success(target.length > 1 ? 'Kedua poster berhasil diunduh' : 'Poster berhasil diunduh')
        } catch (error) {
            console.error('Unduh poster capaian gagal:', error)
            toast.error('Gagal mengunduh poster')
        } finally {
            setMengunduh(false)
        }
    }

    const data = query.data?.bidang

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[92vh] max-w-3xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Poster Capaian TA {tahun}</DialogTitle>
                    <DialogDescription>
                        Angka diambil langsung dari data terbaru, per sub bidang. Unduh sebagai gambar PNG 1536×2048.
                    </DialogDescription>
                </DialogHeader>

                <div className='flex flex-wrap items-center justify-between gap-2'>
                    <Tabs value={aktif} onValueChange={(nilai) => setAktif(nilai as PosterBidang)}>
                        <TabsList>
                            {BIDANG.map((bidang) => (
                                <TabsTrigger key={bidang} value={bidang}>
                                    {NAMA_TAB[bidang]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className='flex flex-wrap gap-2'>
                        <Button size='sm' disabled={!data || mengunduh} onClick={() => void unduh([aktif])}>
                            {mengunduh ? <Loader2 className='animate-spin' /> : <Download />}
                            Unduh PNG
                        </Button>
                        <Button
                            size='sm'
                            variant='secondary'
                            disabled={!data || mengunduh}
                            onClick={() => void unduh(BIDANG)}
                        >
                            Unduh kedua poster
                        </Button>
                    </div>
                </div>

                {query.isLoading ? (
                    <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
                        <Loader2 className='mr-2 size-4 animate-spin' />
                        Memuat data capaian...
                    </div>
                ) : query.isError || !data ? (
                    <div className='rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground'>
                        Data capaian tidak bisa dimuat. Coba lagi nanti.
                    </div>
                ) : (
                    <>
                        <div ref={wadahRef} className='w-full'>
                            <div
                                className='mx-auto overflow-hidden rounded-lg border shadow-sm'
                                style={{ width: POSTER_WIDTH * skala, height: POSTER_HEIGHT * skala }}
                            >
                                <div
                                    style={{
                                        width: POSTER_WIDTH,
                                        height: POSTER_HEIGHT,
                                        transform: `scale(${skala})`,
                                        transformOrigin: 'top left',
                                    }}
                                >
                                    <PosterCapaian
                                        bidang={aktif}
                                        tahun={tahun}
                                        data={cariBidang(data, POSTER_LAYOUT[aktif].namaApi)}
                                        tanggal={tanggal}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Salinan ukuran asli di luar layar, dipakai untuk membuat PNG tanpa skala pratinjau. */}
                        <div aria-hidden='true' style={{ position: 'absolute', left: -10000, top: 0 }}>
                            {BIDANG.map((bidang) => (
                                <PosterCapaian
                                    key={bidang}
                                    ref={(el) => {
                                        unduhRef.current[bidang] = el
                                    }}
                                    bidang={bidang}
                                    tahun={tahun}
                                    data={cariBidang(data, POSTER_LAYOUT[bidang].namaApi)}
                                    tanggal={tanggal}
                                />
                            ))}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
