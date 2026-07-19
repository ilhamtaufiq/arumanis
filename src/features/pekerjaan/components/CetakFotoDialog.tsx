import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import {
    DEFAULT_FOTO_PRINT_OPTIONS,
    buildFotoPdfFileName,
    buildFotoPrintHtml,
    collectFotoPrintItems,
    downloadFotoPdf,
    filterGroupsForMatrix,
    layoutLabel,
    openFotoPrintWindow,
    type FotoPrintLayout,
    type FotoPrintOptions,
    type FotoPrintScope,
} from '../lib/foto-print'
import type { PenerimaFotoGroup } from '../lib/foto-tab'
import { getKecamatanName, getDesaName } from '@/lib/wilayah-fields'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    groups: PenerimaFotoGroup[]
    selectedFotoIds: number[]
    komponenLabel: string
    pekerjaan?: Pekerjaan
    tahun?: string | number
}

const LAYOUTS: { id: FotoPrintLayout; label: string; hint: string }[] = [
    { id: 'grid2', label: '2 / halaman', hint: 'Detail besar, A4 portrait' },
    { id: 'grid4', label: '4 / halaman', hint: 'Seimbang, A4 portrait' },
    { id: 'grid6', label: '6 / halaman', hint: 'Ringkas, A4 portrait' },
    { id: 'matrix', label: 'Matriks 0–100%', hint: 'Rekap slot progress, A4 landscape' },
]

function buildMeta(
    pekerjaan: Pekerjaan | undefined,
    komponenLabel: string,
    totalLabel: string,
    tahun?: string | number,
) {
    const today = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
    const desa = pekerjaan ? getDesaName(pekerjaan.desa) : ''
    const kec = pekerjaan ? getKecamatanName(pekerjaan.kecamatan) : ''
    const lokasi =
        pekerjaan?.is_konsultan
            ? 'Paket konsultan (tanpa desa)'
            : [desa, kec].filter(Boolean).join(', ') || '—'

    return {
        paketName: pekerjaan?.nama_paket || `Pekerjaan #${pekerjaan?.id ?? '-'}`,
        lokasi,
        tahun: tahun != null ? String(tahun) : undefined,
        komponenLabel,
        printedAt: today,
        totalLabel,
        watermark: 'Arumanis · Kabupaten Cianjur',
    }
}

export function CetakFotoDialog({
    open,
    onOpenChange,
    groups,
    selectedFotoIds,
    komponenLabel,
    pekerjaan,
    tahun,
}: Props) {
    const [layout, setLayout] = useState<FotoPrintLayout>(DEFAULT_FOTO_PRINT_OPTIONS.layout)
    const [scope, setScope] = useState<FotoPrintScope>('filtered')
    const [includeKoordinat, setIncludeKoordinat] = useState(true)
    const [onlyValidGps, setOnlyValidGps] = useState(false)
    const [useFullQuality, setUseFullQuality] = useState(false)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        if (!open) return
        setLayout(DEFAULT_FOTO_PRINT_OPTIONS.layout)
        setIncludeKoordinat(true)
        setOnlyValidGps(false)
        setUseFullQuality(false)
        setScope(selectedFotoIds.length > 0 ? 'selected' : 'filtered')
    }, [open, selectedFotoIds.length])

    const options: FotoPrintOptions = useMemo(
        () => ({
            layout,
            scope,
            includeKoordinat,
            onlyValidGps,
            useFullQuality,
        }),
        [layout, scope, includeKoordinat, onlyValidGps, useFullQuality],
    )

    const previewCount = useMemo(() => {
        if (layout === 'matrix') {
            const g = filterGroupsForMatrix(groups, options, selectedFotoIds)
            return g.reduce(
                (n, row) =>
                    n +
                    (['0%', '25%', '50%', '75%', '100%'] as const).reduce(
                        (a, l) => a + row.fotos[l].length,
                        0,
                    ),
                0,
            )
        }
        return collectFotoPrintItems(groups, options, selectedFotoIds).length
    }, [groups, options, selectedFotoIds, layout])

    const canExport = previewCount > 0 && !(scope === 'selected' && selectedFotoIds.length === 0)

    const runPrint = () => {
        if (!canExport) {
            toast.error(
                scope === 'selected' && selectedFotoIds.length === 0
                    ? 'Pilih minimal satu foto di tabel, atau ganti cakupan ke “Semua terfilter”'
                    : 'Tidak ada foto untuk dicetak',
            )
            return
        }

        const meta = buildMeta(pekerjaan, komponenLabel, `${previewCount} foto`, tahun)
        const { html, itemCount } = buildFotoPrintHtml(groups, meta, options, selectedFotoIds)
        if (itemCount === 0) {
            toast.error('Tidak ada foto yang cocok filter cetak')
            return
        }

        const win = openFotoPrintWindow(html)
        if (!win) {
            toast.error('Popup diblokir. Izinkan popup browser untuk mencetak.')
            return
        }
        toast.success(
            'Jendela cetak dibuka. Tunggu gambar termuat, lalu gunakan Ctrl+P / Save as PDF.',
        )
        onOpenChange(false)
    }

    const runDownloadPdf = async () => {
        if (!canExport) {
            toast.error('Tidak ada foto untuk diunduh')
            return
        }
        if (layout === 'matrix') {
            toast.message('Matriks memakai cetak browser (hasil lebih rapi di tabel).')
            runPrint()
            return
        }

        setBusy(true)
        const meta = buildMeta(pekerjaan, komponenLabel, `${previewCount} foto`, tahun)
        try {
            toast.loading('Menyusun PDF dokumentasi foto…')
            const result = await downloadFotoPdf(
                groups,
                meta,
                options,
                selectedFotoIds,
                (msg) => toast.loading(msg),
            )
            toast.dismiss()
            if (result.ok) {
                toast.success(`PDF diunduh: ${result.fileName ?? buildFotoPdfFileName(meta.paketName)}`)
                onOpenChange(false)
                return
            }
            if (result.reason === 'empty') {
                toast.error('Tidak ada foto untuk diunduh')
                return
            }
            if (result.reason === 'cors') {
                toast.message('Gambar tidak bisa di-embed ke PDF (CORS). Membuka cetak browser…')
                runPrint()
                return
            }
            runPrint()
        } catch (err) {
            toast.dismiss()
            console.error(err)
            toast.error('Gagal membuat PDF. Coba Cetak browser.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-lg">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Cetak / Unduh Dokumentasi Foto</DialogTitle>
                    <DialogDescription>
                        A4 profesional dengan header paket, status GPS, dan watermark Arumanis.
                        Cetak lewat browser atau unduh PDF (grid).
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2 pr-1">
                    <div className="space-y-2">
                        <Label>Layout</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {LAYOUTS.map((item) => (
                                <Button
                                    key={item.id}
                                    type="button"
                                    size="sm"
                                    variant={layout === item.id ? 'default' : 'outline'}
                                    className="h-auto flex-col items-start gap-0.5 px-3 py-2 text-left"
                                    disabled={busy}
                                    onClick={() => setLayout(item.id)}
                                >
                                    <span className="font-medium">{item.label}</span>
                                    <span className="text-[10px] font-normal opacity-80">{item.hint}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Cakupan</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={scope === 'filtered' ? 'default' : 'outline'}
                                disabled={busy}
                                onClick={() => setScope('filtered')}
                            >
                                Semua terfilter
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={scope === 'selected' ? 'default' : 'outline'}
                                disabled={busy || selectedFotoIds.length === 0}
                                onClick={() => setScope('selected')}
                            >
                                Hanya terpilih ({selectedFotoIds.length})
                            </Button>
                        </div>
                        {selectedFotoIds.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Centang foto di tabel untuk mencetak subset terpilih.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 rounded-md border p-3">
                        <label className="flex cursor-pointer items-start gap-2 text-sm">
                            <Checkbox
                                checked={includeKoordinat}
                                disabled={busy}
                                onCheckedChange={(v) => setIncludeKoordinat(v === true)}
                                className="mt-0.5"
                            />
                            <span>
                                <span className="font-medium">Sertakan koordinat GPS</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Tampilkan string lat/lng di kartu / matriks
                                </span>
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-2 text-sm">
                            <Checkbox
                                checked={onlyValidGps}
                                disabled={busy}
                                onCheckedChange={(v) => setOnlyValidGps(v === true)}
                                className="mt-0.5"
                            />
                            <span>
                                <span className="font-medium">Hanya foto GPS valid</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Sembunyikan tanpa koordinat / validasi desa gagal
                                </span>
                            </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-2 text-sm">
                            <Checkbox
                                checked={useFullQuality}
                                disabled={busy}
                                onCheckedChange={(v) => setUseFullQuality(v === true)}
                                className="mt-0.5"
                            />
                            <span>
                                <span className="font-medium">Kualitas penuh (bukan thumb)</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Lebih tajam, unduh PDF lebih lambat
                                </span>
                            </span>
                        </label>
                    </div>

                    <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        <p>
                            <strong className="text-foreground">{previewCount}</strong> foto ·{' '}
                            {layoutLabel(layout)}
                            {scope === 'selected' ? ' · subset terpilih' : ' · filter tab aktif'}
                        </p>
                        <p className="mt-1">
                            Paket: {pekerjaan?.nama_paket || '—'} · Komponen: {komponenLabel}
                        </p>
                    </div>
                </div>

                <DialogFooter className="shrink-0 flex-col gap-2 border-t pt-3 sm:flex-row sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={busy}
                    >
                        Batal
                    </Button>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={busy || !canExport}
                            onClick={() => void runDownloadPdf()}
                        >
                            {busy ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Unduh PDF
                        </Button>
                        <Button type="button" disabled={busy || !canExport} onClick={runPrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
