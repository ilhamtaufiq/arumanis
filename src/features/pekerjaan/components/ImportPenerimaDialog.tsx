import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Download, FileUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getOutput } from '@/features/output/api/output';
import type { Output } from '@/features/output/types';
import type { ParsePenerimaExcelResult, ParsedPenerimaRow } from '../types/daftar-penerima-import';
import {
    downloadAllPenerimaImportTemplates,
    downloadPenerimaImportTemplate,
} from '../utils/penerima-excel-template';
import { getPenerimaImportProfile } from '../utils/penerima-import-profile';
import {
    countReadyFotoSlots,
    parsePenerimaExcelFile,
    revokeParsedRowPreviews,
} from '../utils/parse-penerima-excel';
import { FOTO_PROGRESS_LEVELS } from '../utils/foto-progress-levels';
import { importPenerimaBatch } from '../utils/import-penerima-batch';

interface ImportPenerimaDialogProps {
    pekerjaanId: number;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export default function ImportPenerimaDialog({
    pekerjaanId,
    onSuccess,
    trigger,
}: ImportPenerimaDialogProps) {
    const [open, setOpen] = useState(false);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [parsedResult, setParsedResult] = useState<ParsePenerimaExcelResult | null>(null);
    const [importFoto, setImportFoto] = useState(true);
    const [komponenId, setKomponenId] = useState('');
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [progressLabel, setProgressLabel] = useState('');
    const parsedRowsRef = useRef<ParsedPenerimaRow[]>([]);

    const { data: outputList = [] } = useQuery({
        queryKey: ['output', { pekerjaan_id: pekerjaanId }],
        queryFn: async () => {
            const response = await getOutput({ pekerjaan_id: pekerjaanId, per_page: -1 });
            return response.data;
        },
        enabled: open,
    });

    const selectedOutput = useMemo(
        () => outputList.find((output) => output.id.toString() === komponenId),
        [outputList, komponenId],
    );

    const selectedProfile = useMemo(
        () => (selectedOutput ? getPenerimaImportProfile(selectedOutput) : null),
        [selectedOutput],
    );

    const isKomunal = selectedProfile?.type === 'komunal';

    useEffect(() => {
        if (open) {
            return;
        }

        revokeParsedRowPreviews(parsedRowsRef.current);
        parsedRowsRef.current = [];
        setExcelFile(null);
        setZipFile(null);
        setParsedResult(null);
        setImportFoto(true);
        setKomponenId('');
        setParsing(false);
        setImporting(false);
        setProgressLabel('');
    }, [open]);

    useEffect(() => {
        if (outputList.length === 1) {
            setKomponenId(outputList[0].id.toString());
        }
    }, [outputList]);

    const validRows = parsedResult?.rows.filter((row) => row.isValid) ?? [];
    const readyFotoCount = parsedResult ? countReadyFotoSlots(validRows) : 0;
    const canImportFoto = importFoto && readyFotoCount > 0;
    const importProfile = parsedResult?.profile ?? selectedProfile;

    const parseFiles = async (excel: File, zip: File | null, output?: Output) => {
        setParsing(true);
        try {
            const result = await parsePenerimaExcelFile(excel, zip, output);
            parsedRowsRef.current = result.rows;
            setParsedResult(result);

            if (result.warnings.length > 0) {
                toast.warning(result.warnings.join(' '));
            }

            toast.success(`${result.rows.length} baris terbaca untuk ${result.profile?.komponen ?? 'komponen'}`);
        } catch (error) {
            console.error('Failed to parse penerima excel:', error);
            const message = error instanceof Error ? error.message : 'Gagal membaca file Excel';
            toast.error(message);
            setParsedResult(null);
            parsedRowsRef.current = [];
        } finally {
            setParsing(false);
        }
    };

    const handleExcelChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        if (!selected) {
            return;
        }

        if (!selectedOutput) {
            toast.error('Pilih komponen output terlebih dahulu');
            event.target.value = '';
            return;
        }

        setExcelFile(selected);
        await parseFiles(selected, zipFile, selectedOutput);
    };

    const handleZipChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0] ?? null;
        setZipFile(selected);

        if (excelFile && selectedOutput) {
            await parseFiles(excelFile, selected, selectedOutput);
        }
    };

    const handleKomponenChange = async (value: string) => {
        setKomponenId(value);
        setParsedResult(null);
        parsedRowsRef.current = [];
        setExcelFile(null);
        setZipFile(null);
    };

    const handleImport = async () => {
        if (!parsedResult || validRows.length === 0 || !importProfile) {
            toast.error('Tidak ada data valid untuk diimport');
            return;
        }

        if (importProfile.type === 'komunal' && !canImportFoto) {
            toast.error('Komponen komunal membutuhkan koordinat dan foto untuk diimport');
            return;
        }

        setImporting(true);
        try {
            const result = await importPenerimaBatch({
                pekerjaanId,
                profile: importProfile,
                rows: parsedResult.rows,
                importFoto: canImportFoto,
                onProgress: (progress) => {
                    const label = progress.phase === 'penerima'
                        ? `Menyimpan penerima ${progress.current}/${progress.total}`
                        : `Mengunggah foto ${progress.level ?? ''} ${progress.current}/${progress.total}`.trim();
                    setProgressLabel(label);
                },
            });

            const summaryParts = [];
            if (result.penerimaCreated > 0) {
                summaryParts.push(`${result.penerimaCreated} penerima`);
            }
            if (result.fotoCreated > 0) {
                summaryParts.push(`${result.fotoCreated} foto progress`);
            }

            if (summaryParts.length > 0) {
                toast.success(`Import selesai: ${summaryParts.join(', ')}`);
            }

            if (result.errors.length > 0) {
                toast.error(`Beberapa baris gagal: ${result.errors.slice(0, 3).join('; ')}`, {
                    duration: 6000,
                });
            }

            if (result.penerimaCreated > 0 || result.fotoCreated > 0) {
                setOpen(false);
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to import penerima:', error);
            toast.error('Gagal mengimport data');
        } finally {
            setImporting(false);
            setProgressLabel('');
        }
    };

    const importButtonLabel = isKomunal
        ? `Import ${canImportFoto ? readyFotoCount : validRows.length} Unit/Foto`
        : `Import ${validRows.length} Penerima${canImportFoto ? ` + ${readyFotoCount} foto` : ''}`;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <FileUp className="mr-2 h-4 w-4" />
                        Impor Excel
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Impor Excel per Komponen</DialogTitle>
                    <DialogDescription>
                        Pilih komponen output, unduh template yang sudah disesuaikan (volume &amp; tipe),
                        lalu unggah kembali. Komponen komunal tidak membutuhkan NIK, alamat, atau jumlah jiwa.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="space-y-2 rounded-lg border p-4">
                        <Label>Komponen Output</Label>
                        <SearchableSelect
                            options={outputList.map((output) => {
                                const profile = getPenerimaImportProfile(output);
                                return {
                                    value: output.id.toString(),
                                    label: `${output.komponen} (${output.volume} ${output.satuan}) — ${profile.type === 'komunal' ? 'Komunal' : 'Per unit'}`,
                                };
                            })}
                            value={komponenId}
                            onValueChange={handleKomponenChange}
                            placeholder={outputList.length === 0 ? 'Belum ada komponen output' : 'Pilih komponen'}
                            searchPlaceholder="Cari komponen..."
                            emptyMessage="Komponen tidak ditemukan."
                            disabled={outputList.length === 0 || importing}
                        />

                        {selectedProfile && (
                            <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="secondary">
                                    Target: {selectedProfile.targetRows} baris
                                </Badge>
                                <Badge variant={isKomunal ? 'outline' : 'default'}>
                                    {isKomunal ? 'Template komunal' : 'Template per penerima'}
                                </Badge>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!selectedOutput}
                                onClick={() => {
                                    if (!selectedOutput) return;
                                    downloadPenerimaImportTemplate(selectedOutput);
                                    toast.success('Template komponen berhasil diunduh');
                                }}
                            >
                                <Download className="mr-1 h-3 w-3" />
                                Template komponen ini
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={outputList.length === 0}
                                onClick={() => {
                                    downloadAllPenerimaImportTemplates(outputList);
                                    toast.success('Template semua komponen berhasil diunduh');
                                }}
                            >
                                <Download className="mr-1 h-3 w-3" />
                                Template semua komponen
                            </Button>
                        </div>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="penerima-excel-file">File Excel</Label>
                        <Input
                            id="penerima-excel-file"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleExcelChange}
                            disabled={parsing || importing || !selectedOutput}
                        />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="penerima-zip-file">ZIP Foto (opsional)</Label>
                        <Input
                            id="penerima-zip-file"
                            type="file"
                            accept=".zip,application/zip"
                            onChange={handleZipChange}
                            disabled={parsing || importing || !excelFile}
                        />
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border p-4">
                        <Checkbox
                            id="import-foto-0"
                            checked={importFoto}
                            onCheckedChange={(checked) => setImportFoto(checked === true)}
                            disabled={importing}
                        />
                        <Label htmlFor="import-foto-0" className="font-normal">
                            Sekaligus import foto progress (0%, 25%, 50%, 75%, 100%)
                        </Label>
                    </div>

                    {parsedResult && (
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="secondary">
                                    {parsedResult.rows.length} baris terbaca
                                </Badge>
                                <Badge variant="secondary">
                                    {validRows.length} valid
                                </Badge>
                                {parsedResult.profile && (
                                    <Badge>
                                        Target {parsedResult.profile.targetRows}
                                    </Badge>
                                )}
                                <Badge variant="secondary">
                                    {parsedResult.totalImages} slot foto siap
                                </Badge>
                            </div>

                            {parsedResult.warnings.length > 0 && (
                                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p>{parsedResult.warnings.join(' ')}</p>
                                </div>
                            )}

                            <div className="max-h-72 overflow-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>No</TableHead>
                                            {isKomunal ? (
                                                <>
                                                    <TableHead>Unit</TableHead>
                                                    <TableHead>Label</TableHead>
                                                </>
                                            ) : (
                                                <>
                                                    <TableHead>Nama</TableHead>
                                                    <TableHead>NIK</TableHead>
                                                    <TableHead>Jiwa</TableHead>
                                                </>
                                            )}
                                            <TableHead>Koordinat</TableHead>
                                            <TableHead>Foto</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedResult.rows.slice(0, 50).map((row, index) => (
                                            <PreviewRow key={`${row.nama}-${index}`} row={row} isKomunal={isKomunal} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {progressLabel && (
                        <p className="mr-auto text-sm text-muted-foreground">{progressLabel}</p>
                    )}
                    <Button
                        onClick={handleImport}
                        disabled={!parsedResult || validRows.length === 0 || parsing || importing || !importProfile}
                    >
                        {importing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengimport...
                            </>
                        ) : (
                            importButtonLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PreviewRow({ row, isKomunal }: { row: ParsedPenerimaRow; isKomunal: boolean }) {
    return (
        <TableRow>
            <TableCell>{row.no ?? '-'}</TableCell>
            {isKomunal ? (
                <>
                    <TableCell>{row.unitIndex ?? '-'}</TableCell>
                    <TableCell>{row.nama || '-'}</TableCell>
                </>
            ) : (
                <>
                    <TableCell>
                        <div className="font-medium">{row.nama || '-'}</div>
                        {row.alamat && (
                            <div className="text-xs text-muted-foreground">{row.alamat}</div>
                        )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.nik || '-'}</TableCell>
                    <TableCell>{row.jumlah_jiwa}</TableCell>
                </>
            )}
            <TableCell className="max-w-[140px] truncate text-xs">{row.koordinat || '-'}</TableCell>
            <TableCell>
                {row.fotoSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {FOTO_PROGRESS_LEVELS.map((level) => {
                            const slot = row.fotoSlots.find((item) => item.level === level);
                            if (!slot?.namaFile) {
                                return null;
                            }
                            return (
                                <Badge
                                    key={level}
                                    variant={slot.imageFile ? 'default' : 'outline'}
                                    className="text-[10px]"
                                >
                                    {level}
                                </Badge>
                            );
                        })}
                    </div>
                ) : (
                    '-'
                )}
            </TableCell>
            <TableCell>
                {row.isValid ? (
                    row.warnings.length > 0 ? (
                        <Badge variant="outline" className="text-amber-700">
                            {row.warnings.length} peringatan
                        </Badge>
                    ) : (
                        <Badge>Siap</Badge>
                    )
                ) : (
                    <Badge variant="destructive">Invalid</Badge>
                )}
            </TableCell>
        </TableRow>
    );
}