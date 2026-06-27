import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { downloadSpmSanitasiTemplate, importSpmSanitasi } from '../api'

interface ImportSpmSanitasiDialogProps {
    onSuccess: () => void
    trigger?: React.ReactNode
}

export function ImportSpmSanitasiDialog({ onSuccess, trigger }: ImportSpmSanitasiDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const [replace, setReplace] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleUpload = async () => {
        if (!file) {
            toast.error('Silakan pilih file terlebih dahulu')
            return
        }

        try {
            setUploading(true)
            const result = await importSpmSanitasi(file, replace)
            const imported = result.imported_rows ?? 0
            const skipped = result.skipped_rows ?? 0
            toast.success(`${result.message} (${imported} baris, ${skipped} dilewati)`)
            if (result.errors?.length) {
                toast.warning(result.errors.slice(0, 3).join('; '), { duration: 6000 })
            }
            setOpen(false)
            setFile(null)
            setReplace(false)
            onSuccess()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; errors?: string[] } } }
            const message = err.response?.data?.message || 'Gagal mengimport data SPM Sanitasi'
            toast.error(message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <FileUp className="mr-2 h-4 w-4" /> Impor Excel
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Impor Data SPM Sanitasi</DialogTitle>
                    <div className="flex items-center justify-between gap-2">
                        <DialogDescription>
                            Unggah file Excel dengan sheet SPALDT, SPALDS, dan IPLT sesuai format standar.
                        </DialogDescription>
                        <Button
                            variant="link"
                            size="sm"
                            className="h-auto shrink-0 p-0"
                            onClick={() => downloadSpmSanitasiTemplate()}
                        >
                            <Download className="mr-1 h-3 w-3" /> Template
                        </Button>
                    </div>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="spm-file">File Excel</Label>
                        <Input
                            id="spm-file"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            disabled={uploading}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="spm-replace"
                            checked={replace}
                            onCheckedChange={(checked) => setReplace(checked === true)}
                        />
                        <Label htmlFor="spm-replace" className="text-sm font-normal">
                            Ganti semua data existing sebelum import
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" disabled={!file || uploading} onClick={handleUpload}>
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengunggah...
                            </>
                        ) : (
                            'Unggah'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}