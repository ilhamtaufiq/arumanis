import { useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    downloadSpsePackageZip,
    fetchSpsePackageDocuments,
    importSpsePackageDocuments,
} from '@/features/procurement-sync/api';
import type { ProcurementStagingPaket, SpsePackageDocument } from '@/features/procurement-sync/types';

type DocRow = SpsePackageDocument & { jenis_dokumen: string };

interface SpseDocumentImportDialogProps {
    row: ProcurementStagingPaket | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SpseDocumentImportDialog({ row, open, onOpenChange }: SpseDocumentImportDialogProps) {
    const [documents, setDocuments] = useState<DocRow[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [downloadingZip, setDownloadingZip] = useState(false);

    const pekerjaanId = row?.matched_pekerjaan_id ?? row?.pekerjaan?.id ?? null;

    const loadDocuments = useCallback(async () => {
        if (!row?.kode_paket) return;
        setLoading(true);
        try {
            const res = await fetchSpsePackageDocuments(row.kode_paket, row.jenis_paket ?? undefined);
            const rows = res.data.map((doc) => ({
                ...doc,
                jenis_dokumen: doc.label.replace(/\.(pdf|zip|docx?)$/i, '').trim() || doc.label,
            }));
            setDocuments(rows);
            setSelected(new Set(rows.filter((d) => d.kind !== 'html_page').map((d) => d.id)));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal memuat dokumen SPSE');
            setDocuments([]);
            setSelected(new Set());
        } finally {
            setLoading(false);
        }
    }, [row]);

    useEffect(() => {
        if (open && row) {
            void loadDocuments();
        } else if (!open) {
            setDocuments([]);
            setSelected(new Set());
        }
    }, [open, row, loadDocuments]);

    const selectedDocs = useMemo(
        () => documents.filter((doc) => selected.has(doc.id)),
        [documents, selected],
    );

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelected(new Set(documents.map((d) => d.id)));
        } else {
            setSelected(new Set());
        }
    };

    const toggleOne = (id: string, checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const updateJenis = (id: string, value: string) => {
        setDocuments((prev) =>
            prev.map((doc) => (doc.id === id ? { ...doc, jenis_dokumen: value } : doc)),
        );
    };

    const handleDownloadZip = async () => {
        if (!row) return;
        if (selectedDocs.length === 0) {
            toast.error('Pilih minimal satu dokumen.');
            return;
        }

        const downloadable = selectedDocs.filter((doc) => doc.kind !== 'html_page');
        if (downloadable.length === 0) {
            toast.error('Tidak ada dokumen yang bisa diunduh. Halaman HTML tidak disertakan dalam ZIP.');
            return;
        }

        setDownloadingZip(true);
        try {
            const blob = await downloadSpsePackageZip({
                kode_paket: row.kode_paket,
                documents: downloadable.map((doc) => ({
                    url: doc.url,
                    label: doc.label,
                })),
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeName = row.nama_paket
                ? row.nama_paket.replace(/[\\/:*?"<>|]/g, '_').slice(0, 80)
                : row.kode_paket;
            link.setAttribute('download', `spse_${safeName}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`ZIP berisi ${downloadable.length} dokumen sedang diunduh`);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Unduh ZIP gagal');
        } finally {
            setDownloadingZip(false);
        }
    };

    const handleImport = async () => {
        if (!row || !pekerjaanId) {
            toast.error('Paket belum dipetakan ke pekerjaan Arumanis.');
            return;
        }
        if (selectedDocs.length === 0) {
            toast.error('Pilih minimal satu dokumen.');
            return;
        }

        const invalid = selectedDocs.find((doc) => !doc.jenis_dokumen.trim());
        if (invalid) {
            toast.error('Semua dokumen terpilih wajib punya jenis dokumen.');
            return;
        }

        setImporting(true);
        try {
            const res = await importSpsePackageDocuments({
                pekerjaan_id: pekerjaanId,
                kode_paket: row.kode_paket,
                documents: selectedDocs.map((doc) => ({
                    url: doc.url,
                    jenis_dokumen: doc.jenis_dokumen.trim(),
                    label: doc.label,
                })),
            });
            toast.success(res.message);
            if (res.failed === 0) {
                onOpenChange(false);
            }
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Import dokumen gagal');
        } finally {
            setImporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileDown className="h-5 w-5" />
                        Dokumen SPSE
                    </DialogTitle>
                    <DialogDescription>
                        {row ? (
                            <>
                                Paket <span className="font-mono text-xs">{row.kode_paket}</span>
                                {row.pekerjaan?.nama_paket && (
                                    <> → {row.pekerjaan.nama_paket}</>
                                )}
                            </>
                        ) : (
                            'Pilih paket dari tabel staging.'
                        )}
                    </DialogDescription>
                </DialogHeader>

                {!pekerjaanId && (
                    <p className="text-sm text-destructive">
                        Paket ini belum cocok dengan pekerjaan Arumanis. Mapping manual diperlukan sebelum import.
                    </p>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    checked={documents.length > 0 && selected.size === documents.length}
                                    onCheckedChange={(v) => toggleAll(Boolean(v))}
                                    disabled={loading || documents.length === 0}
                                />
                            </TableHead>
                            <TableHead>Label SPSE</TableHead>
                            <TableHead>Jenis dokumen (Berkas)</TableHead>
                            <TableHead>Sumber</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                    Memindai halaman SPSE...
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && documents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    Tidak ada link dokumen ditemukan di halaman paket ini.
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selected.has(doc.id)}
                                            onCheckedChange={(v) => toggleOne(doc.id, Boolean(v))}
                                        />
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <p className="text-sm truncate" title={doc.label}>
                                            {doc.label}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {doc.doc_type}
                                            </Badge>
                                            {doc.kind === 'html_page' && (
                                                <Badge variant="secondary" className="text-xs">
                                                    halaman HTML
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={doc.jenis_dokumen}
                                            onChange={(e) => updateJenis(doc.id, e.target.value)}
                                            disabled={!selected.has(doc.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                        {doc.source_page}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>

                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                    <p className="text-xs text-muted-foreground sm:mr-auto">
                        Unduh ZIP tidak memerlukan mapping pekerjaan. File gagal tercatat di{' '}
                        <code className="text-xs">_gagal.json</code> dalam arsip.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-end">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Tutup
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => void handleDownloadZip()}
                            disabled={downloadingZip || importing || selectedDocs.length === 0}
                        >
                            {downloadingZip && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Archive className="h-4 w-4 mr-2" />
                            Unduh ZIP ({selectedDocs.filter((d) => d.kind !== 'html_page').length})
                        </Button>
                        <Button
                            onClick={() => void handleImport()}
                            disabled={importing || downloadingZip || !pekerjaanId || selectedDocs.length === 0}
                        >
                            {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Import ke Berkas ({selectedDocs.length})
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}