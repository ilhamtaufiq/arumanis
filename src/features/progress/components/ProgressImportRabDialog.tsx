import { Calculator, ClipboardPaste, FileSpreadsheet, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { RabPasteInput } from '@/features/rab-analyzer/components/RabPasteInput'
import { RabAnalysisSummary } from '@/features/rab-analyzer/components/RabAnalysisSummary'
import type { useRabImport } from '../hooks/useRabImport'

type RabImportState = ReturnType<typeof useRabImport>

type ProgressImportRabDialogProps = {
    rabImport: RabImportState
}

export function ProgressImportRabDialog({ rabImport }: ProgressImportRabDialogProps) {
    const {
        open,
        setOpen,
        pasteText,
        setPasteText,
        analyzed,
        analysis,
        pendingReplace,
        setPendingReplace,
        handleAnalyze,
        confirmImport,
        handleFileUpload,
        resetDialog,
    } = rabImport

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen)
                if (!nextOpen) resetDialog()
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Import Item Pekerjaan dari RAB
                    </DialogTitle>
                    <DialogDescription>
                        Tempel data MCK/SPAM JP atau unggah Excel. Analisa dulu untuk melihat DPP dan PPN 11% sebelum import.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="p-6 border-2 border-dashed rounded-2xl bg-muted/30 flex flex-col items-center justify-center gap-3">
                        <FileSpreadsheet className="h-8 w-8 text-primary" />
                        <p className="text-sm font-bold">Pilih File Excel (.xlsx / .xls)</p>
                        <Input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(event) => handleFileUpload(event.target.files?.[0])}
                            className="max-w-xs cursor-pointer"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-dashed" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground font-bold">Atau Tempel Data</span>
                        </div>
                    </div>

                    <RabPasteInput
                        value={pasteText}
                        onChange={setPasteText}
                        minHeightClassName="min-h-[180px]"
                    />

                    {analysis && analyzed ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="font-mono text-[11px]">Preview Import</Badge>
                                <span className="text-xs text-muted-foreground">{analysis.summary.itemCount} item</span>
                            </div>
                            <RabAnalysisSummary summary={analysis.summary} compact />
                        </div>
                    ) : null}

                    {pendingReplace ? (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                            Item pekerjaan yang ada akan diganti dengan data RAB baru. Lanjutkan?
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="gap-2 flex-wrap">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setOpen(false)
                            resetDialog()
                        }}
                        className="rounded-full"
                    >
                        Batal
                    </Button>
                    {pendingReplace ? (
                        <Button variant="outline" onClick={() => setPendingReplace(false)} className="rounded-full">
                            Kembali
                        </Button>
                    ) : null}
                    <Button
                        variant="outline"
                        onClick={handleAnalyze}
                        disabled={!pasteText.trim()}
                        className="rounded-full gap-2"
                    >
                        <Calculator className="h-4 w-4" />
                        Analisa
                    </Button>
                    <Button
                        onClick={confirmImport}
                        disabled={!pasteText.trim()}
                        className="rounded-full gap-2 px-6"
                    >
                        <ClipboardPaste className="h-4 w-4" />
                        {pendingReplace ? 'Ya, Ganti & Import' : 'Import ke Laporan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}