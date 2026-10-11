import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useExportJurnalPptx } from '../hooks/useJurnalKegiatan'
import { firstErrorMessage, optionalQueryText, parseStrategi } from '../lib/rhk-helpers'
import { MONTH_NAMES_ID } from '../lib/jurnal-helpers'

interface ExportPptxDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tahun: number
    bulan: number
    onOpenRhkSettings: () => void
}

export default function ExportPptxDialog({ open, onOpenChange, tahun, bulan, onOpenRhkSettings }: ExportPptxDialogProps) {
    const [feedback, setFeedback] = useState('')
    const [strategi, setStrategi] = useState('')
    const [formError, setFormError] = useState<string | null>(null)
    const [rhkMissing, setRhkMissing] = useState(false)
    const exportMutation = useExportJurnalPptx()

    const handleExport = async () => {
        setFormError(null)
        setRhkMissing(false)
        try {
            await exportMutation.mutateAsync({
                tahun,
                bulan,
                feedback: optionalQueryText(feedback),
                strategi: parseStrategi(strategi),
            })
            onOpenChange(false)
        } catch (error) {
            if (error instanceof ApiError && error.status === 422) {
                const data = error.data as { errors?: Record<string, string[] | string> } | undefined
                if (firstErrorMessage(data?.errors, 'rhk')) {
                    setRhkMissing(true)
                    setFormError(firstErrorMessage(data?.errors, 'rhk'))
                    return
                }
                setFormError(getApiErrorMessage(error, 'Data laporan tidak valid'))
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Export PPTX {MONTH_NAMES_ID[bulan - 1]} {tahun}</DialogTitle>
                    <DialogDescription>
                        Laporan berisi kegiatan bulan ini dan RHK tahun {tahun}. Kolom di bawah bersifat opsional.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="export-feedback">Umpan balik atasan</Label>
                        <Textarea
                            id="export-feedback"
                            rows={3}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Kosongkan untuk memakai teks standar"
                        />
                    </div>
                    <div>
                        <Label htmlFor="export-strategi">Strategi tambahan (pisahkan dengan ;)</Label>
                        <Textarea
                            id="export-strategi"
                            rows={2}
                            value={strategi}
                            onChange={(e) => setStrategi(e.target.value)}
                            placeholder="mis. Koordinasi lintas bidang; Pelatihan petugas"
                        />
                    </div>

                    {formError && (
                        <div role="alert" className="space-y-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            <p>{formError}</p>
                            {rhkMissing && (
                                <Button type="button" variant="outline" size="sm" onClick={onOpenRhkSettings}>
                                    Atur RHK
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={exportMutation.isPending}>
                        Batal
                    </Button>
                    <Button type="button" onClick={handleExport} disabled={exportMutation.isPending}>
                        <Download className="h-4 w-4" />
                        {exportMutation.isPending ? 'Menyiapkan...' : 'Unduh'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
