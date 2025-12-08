import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { HyperFormula } from 'hyperformula';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { getProgressReport, createProgressItem, deleteProgressItem, storeWeeklyProgress } from '@/features/progress/api/progress';
import type { ProgressReportResponse } from '@/features/progress/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Register all Handsontable modules
registerAllModules();

// Temporary ID prefix for new unsaved rows
const NEW_ROW_PREFIX = 'new_';

interface ProgressTabContentProps {
    pekerjaanId: number;
}

interface NewRowData {
    tempId: string;
    nama_item: string;
    rincian_item: string;
    satuan: string;
    harga_satuan: number;
    bobot: number;
    target_volume: number;
    weeklyData: { [week: number]: { rencana: number; realisasi: number | null } };
}

export default function ProgressTabContent({ pekerjaanId }: ProgressTabContentProps) {
    const [report, setReport] = useState<ProgressReportResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [weekCount, setWeekCount] = useState(4);
    const [submitting, setSubmitting] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [newRows, setNewRows] = useState<NewRowData[]>([]);
    const hotRef = useRef<any>(null);

    // Create HyperFormula instance
    const hyperformulaInstance = useMemo(() => {
        return HyperFormula.buildEmpty({
            licenseKey: 'gpl-v3',
        });
    }, []);

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getProgressReport(pekerjaanId);
            setReport(data.data);
            if (data.data.max_minggu > 0) {
                setWeekCount(Math.max(data.data.max_minggu, 4));
            }
            setHasChanges(false);
            setNewRows([]); // Clear new rows after fetch
        } catch (error) {
            console.error('Failed to fetch progress report:', error);
            toast.error('Gagal memuat laporan progress');
        } finally {
            setLoading(false);
        }
    }, [pekerjaanId]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Add new row handler
    const handleAddNewRow = useCallback(() => {
        const newRow: NewRowData = {
            tempId: `${NEW_ROW_PREFIX}${Date.now()}`,
            nama_item: '',
            rincian_item: '',
            satuan: '',
            harga_satuan: 0,
            bobot: 0,
            target_volume: 0,
            weeklyData: {}
        };
        setNewRows(prev => [...prev, newRow]);
        setHasChanges(true);
    }, []);

    // Remove new row handler
    const handleRemoveNewRow = useCallback((tempId: string) => {
        setNewRows(prev => prev.filter(r => r.tempId !== tempId));
        setHasChanges(true);
    }, []);

    // Build data for Handsontable
    const { tableData, colHeaders, columns, rowMeta } = useMemo(() => {
        // Build column headers - add Target Volume column
        const headers = ['No.', 'Item Pekerjaan', 'Rincian Item', 'Satuan', 'Harga Satuan', 'Bobot (%)', 'Target Vol'];
        for (let w = 1; w <= weekCount; w++) {
            headers.push(`M${w} Renc`);
            headers.push(`M${w} Real`);
        }
        headers.push('Total Akum', '% Progress', 'Weighted %');

        // Build column definitions - note: readOnly will be overridden by cells callback for new rows
        const cols: any[] = [
            { data: 0, type: 'numeric', readOnly: true, className: 'htCenter' },  // No
            { data: 1, type: 'text' },           // Item Pekerjaan
            { data: 2, type: 'text' },           // Rincian
            { data: 3, type: 'text' },           // Satuan
            { data: 4, type: 'numeric', numericFormat: { pattern: '0,0' } },  // Harga
            { data: 5, type: 'numeric', className: 'htCenter' },   // Bobot
            { data: 6, type: 'numeric', className: 'htCenter' },   // Target Volume
        ];

        // Weekly rencana/realisasi columns (editable)
        for (let w = 1; w <= weekCount; w++) {
            cols.push({ data: 7 + (w - 1) * 2, type: 'numeric', className: 'htCenter' });     // Rencana
            cols.push({ data: 8 + (w - 1) * 2, type: 'numeric', className: 'htCenter bg-blue-50' }); // Realisasi
        }

        const baseFormulaCol = 7 + weekCount * 2;
        cols.push({ data: baseFormulaCol, type: 'numeric', readOnly: true, className: 'htCenter font-bold bg-green-50' });     // Total Akum
        cols.push({ data: baseFormulaCol + 1, type: 'numeric', numericFormat: { pattern: '0.00' }, readOnly: true, className: 'htCenter' }); // % Progress
        cols.push({ data: baseFormulaCol + 2, type: 'numeric', numericFormat: { pattern: '0.00' }, readOnly: true, className: 'htCenter font-bold text-primary' }); // Weighted %

        // Build data rows
        const data: (string | number | null)[][] = [];
        const meta: { type: 'existing' | 'new' | 'totals'; id?: number; tempId?: string }[] = [];

        // Existing items from report
        if (report) {
            report.items.forEach((item, index) => {
                meta.push({ type: 'existing', id: item.id });

                const row: (string | number | null)[] = [
                    index + 1,
                    item.nama_item,
                    item.rincian_item,
                    item.satuan,
                    item.harga_satuan,
                    item.bobot,
                    item.target_volume,
                ];

                // Weekly data
                let totalReal = 0;
                for (let w = 1; w <= weekCount; w++) {
                    const weekly = item.weekly_progress.find(wp => wp.minggu === w);
                    const rencana = weekly?.rencana ?? 0;
                    const realisasi = weekly?.realisasi ?? 0;
                    row.push(rencana);
                    row.push(realisasi);
                    totalReal += realisasi;
                }

                // Calculated fields
                const progressPercent = item.target_volume > 0 ? (totalReal / item.target_volume) * 100 : 0;
                const weightedProgress = (progressPercent * item.bobot) / 100;

                row.push(totalReal);
                row.push(Math.round(progressPercent * 100) / 100);
                row.push(Math.round(weightedProgress * 100) / 100);

                data.push(row);
            });
        }

        // New unsaved rows
        newRows.forEach((newRow, index) => {
            const rowNum = (report?.items.length ?? 0) + index + 1;
            meta.push({ type: 'new', tempId: newRow.tempId });

            const row: (string | number | null)[] = [
                rowNum,
                newRow.nama_item,
                newRow.rincian_item,
                newRow.satuan,
                newRow.harga_satuan || null,
                newRow.bobot || null,
                newRow.target_volume || null,
            ];

            // Weekly data for new row
            let totalReal = 0;
            for (let w = 1; w <= weekCount; w++) {
                const weekly = newRow.weeklyData[w];
                const rencana = weekly?.rencana ?? 0;
                const realisasi = weekly?.realisasi ?? null;
                row.push(rencana);
                row.push(realisasi);
                if (realisasi !== null) totalReal += realisasi;
            }

            // Calculated fields
            const targetVol = newRow.target_volume || 0;
            const progressPercent = targetVol > 0 ? (totalReal / targetVol) * 100 : 0;
            const weightedProgress = (progressPercent * (newRow.bobot || 0)) / 100;

            row.push(totalReal);
            row.push(Math.round(progressPercent * 100) / 100);
            row.push(Math.round(weightedProgress * 100) / 100);

            data.push(row);
        });

        // Add totals row
        if (data.length > 0 && report) {
            meta.push({ type: 'totals' });

            const totalsRow: (string | number | null)[] = [
                '',
                'TOTAL',
                '',
                '',
                `RAB: ${new Intl.NumberFormat('id-ID').format(report.pekerjaan.pagu)}`,
                report.totals.total_bobot,
                '', // Target Volume total (empty)
            ];

            // Weekly totals
            for (let w = 1; w <= weekCount; w++) {
                let totalRenc = 0;
                let totalReal = 0;
                report.items.forEach(item => {
                    const weekly = item.weekly_progress.find(wp => wp.minggu === w);
                    totalRenc += weekly?.rencana ?? 0;
                    totalReal += weekly?.realisasi ?? 0;
                });
                totalsRow.push(totalRenc);
                totalsRow.push(totalReal);
            }

            totalsRow.push(report.totals.total_accumulated_real);
            totalsRow.push('-');
            totalsRow.push(Math.round(report.totals.total_weighted_progress * 100) / 100);

            data.push(totalsRow);
        }

        return {
            tableData: data,
            colHeaders: headers,
            columns: cols,
            rowMeta: meta
        };
    }, [report, weekCount, newRows]);

    const handleAfterChange = useCallback((changes: any, source: string) => {
        if (source === 'loadData' || !changes) return;

        // Update newRows state when new row cells are edited
        changes.forEach(([row, col, _oldValue, newValue]: [number, number, any, any]) => {
            const meta = rowMeta[row];
            if (meta?.type === 'new' && meta.tempId) {
                setNewRows(prev => prev.map(r => {
                    if (r.tempId !== meta.tempId) return r;

                    // Update the appropriate field based on column
                    const updated = { ...r };
                    if (col === 1) updated.nama_item = newValue || '';
                    else if (col === 2) updated.rincian_item = newValue || '';
                    else if (col === 3) updated.satuan = newValue || '';
                    else if (col === 4) updated.harga_satuan = parseFloat(newValue) || 0;
                    else if (col === 5) updated.bobot = parseFloat(newValue) || 0;
                    else if (col === 6) updated.target_volume = parseFloat(newValue) || 0;
                    else {
                        // Weekly columns
                        const weeklyColStart = 7;
                        const weeklyColIndex = col - weeklyColStart;
                        if (weeklyColIndex >= 0 && weeklyColIndex < weekCount * 2) {
                            const week = Math.floor(weeklyColIndex / 2) + 1;
                            const isRencana = weeklyColIndex % 2 === 0;
                            if (!updated.weeklyData[week]) {
                                updated.weeklyData[week] = { rencana: 0, realisasi: null };
                            }
                            if (isRencana) {
                                updated.weeklyData[week].rencana = parseFloat(newValue) || 0;
                            } else {
                                updated.weeklyData[week].realisasi = newValue !== null && newValue !== ''
                                    ? parseFloat(newValue)
                                    : null;
                            }
                        }
                    }
                    return updated;
                }));
            }
        });

        setHasChanges(true);
    }, [rowMeta, weekCount]);

    const handleSaveAll = async () => {
        if (!hotRef.current) return;

        const hot = hotRef.current.hotInstance;
        if (!hot) return;

        try {
            setSubmitting(true);

            // Get current data from Handsontable
            const currentData = hot.getData();

            // First, save new items
            for (const newRow of newRows) {
                if (!newRow.nama_item || !newRow.satuan) {
                    toast.error('Nama Item dan Satuan harus diisi untuk item baru');
                    setSubmitting(false);
                    return;
                }

                await createProgressItem({
                    pekerjaan_id: pekerjaanId,
                    nama_item: newRow.nama_item,
                    rincian_item: newRow.rincian_item || undefined,
                    satuan: newRow.satuan,
                    harga_satuan: newRow.harga_satuan || 0,
                    bobot: newRow.bobot || 0,
                    target_volume: newRow.target_volume || 0
                });
            }

            // Save changes for existing items
            if (report) {
                for (let rowIndex = 0; rowIndex < report.items.length; rowIndex++) {
                    const item = report.items[rowIndex];
                    const row = currentData[rowIndex];

                    for (let w = 1; w <= weekCount; w++) {
                        const rencanaColIndex = 7 + (w - 1) * 2;
                        const realisasiColIndex = 8 + (w - 1) * 2;

                        const rencana = parseFloat(row[rencanaColIndex]) || 0;
                        const realisasi = row[realisasiColIndex] !== null && row[realisasiColIndex] !== ''
                            ? parseFloat(row[realisasiColIndex])
                            : null;

                        await storeWeeklyProgress({
                            progress_item_id: item.id,
                            minggu: w,
                            rencana,
                            realisasi
                        });
                    }
                }
            }

            toast.success('Semua perubahan berhasil disimpan');
            setHasChanges(false);
            fetchReport();
        } catch (error) {
            console.error('Failed to save changes:', error);
            toast.error('Gagal menyimpan perubahan');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete item handler - exposed for context menu
    const handleDeleteItem = useCallback(async (itemId: number) => {
        if (!confirm('Yakin ingin menghapus item ini?')) return;
        try {
            await deleteProgressItem(itemId);
            toast.success('Item berhasil dihapus');
            fetchReport();
        } catch (error) {
            console.error('Failed to delete item:', error);
            toast.error('Gagal menghapus item');
        }
    }, [fetchReport]);

    // Custom context menu with add/delete options
    const contextMenuItems = useMemo(() => {
        return {
            items: {
                'add_row': {
                    name: 'Tambah Baris Baru',
                    callback: function () {
                        handleAddNewRow();
                    }
                },
                'delete_item': {
                    name: 'Hapus Item',
                    callback: function (_key: string, selection: any) {
                        const row = selection[0]?.start?.row;
                        if (row !== undefined && row < rowMeta.length) {
                            const meta = rowMeta[row];
                            if (meta?.type === 'existing' && meta.id) {
                                handleDeleteItem(meta.id);
                            } else if (meta?.type === 'new' && meta.tempId) {
                                handleRemoveNewRow(meta.tempId);
                            }
                        }
                    },
                    disabled: function () {
                        const selected = hotRef.current?.hotInstance?.getSelected();
                        if (!selected || !selected[0]) return true;
                        const row = selected[0][0];
                        // Disable for totals row
                        return rowMeta[row]?.type === 'totals';
                    }
                },
                'separator': { name: '---------' },
                'copy': { name: 'Copy' },
                'cut': { name: 'Cut' }
            }
        };
    }, [rowMeta, handleDeleteItem, handleAddNewRow, handleRemoveNewRow]);

    // Cells callback to control editability
    const getCellProperties = useCallback((row: number, col: number) => {
        const cellProperties: any = {};
        const meta = rowMeta[row];

        // Style and protect the totals row
        if (meta?.type === 'totals') {
            cellProperties.readOnly = true;
            cellProperties.className = 'font-bold bg-muted';
            return cellProperties;
        }

        // For existing items, make item detail columns (1-6) read-only
        if (meta?.type === 'existing') {
            if (col >= 1 && col <= 6) {
                cellProperties.readOnly = true;
            }
            // Calculated columns are always read-only
            const baseFormulaCol = 7 + weekCount * 2;
            if (col >= baseFormulaCol) {
                cellProperties.readOnly = true;
            }
        }

        // For new rows, highlight editable cells
        if (meta?.type === 'new') {
            if (col >= 1 && col <= 6) {
                cellProperties.className = 'bg-yellow-50';
            }
            // Calculated columns are always read-only
            const baseFormulaCol = 7 + weekCount * 2;
            if (col >= baseFormulaCol) {
                cellProperties.readOnly = true;
            }
        }

        // No. column is always read-only
        if (col === 0) {
            cellProperties.readOnly = true;
        }

        return cellProperties;
    }, [rowMeta, weekCount]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const hasItems = (report && report.items.length > 0) || newRows.length > 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Laporan Progress Mingguan</CardTitle>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="weekCount">Minggu:</Label>
                        <Input
                            id="weekCount"
                            type="number"
                            min={1}
                            max={52}
                            value={weekCount}
                            onChange={(e) => setWeekCount(parseInt(e.target.value) || 4)}
                            className="w-16"
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchReport}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleAddNewRow}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Item
                    </Button>
                    {hasChanges && (
                        <Button onClick={handleSaveAll} disabled={submitting}>
                            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Simpan
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {hasItems ? (
                    <div className="overflow-hidden">
                        <HotTable
                            ref={hotRef}
                            data={tableData}
                            colHeaders={colHeaders}
                            columns={columns}
                            rowHeaders={false}
                            width="100%"
                            height="auto"
                            licenseKey="non-commercial-and-evaluation"
                            stretchH="all"
                            autoWrapRow={true}
                            manualColumnResize={true}
                            contextMenu={contextMenuItems}
                            afterChange={handleAfterChange}
                            formulas={{
                                engine: hyperformulaInstance,
                            }}
                            cells={getCellProperties}
                            className="htCenter"
                        />
                        <p className="text-xs text-muted-foreground mt-3">
                            💡 Baris baru berwarna kuning dapat diedit. Isi data item lalu klik "Simpan". Klik kanan untuk menu konteks.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Belum ada item progress.</p>
                        <p className="text-sm">Klik "Tambah Item" untuk menambahkan item pekerjaan.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
