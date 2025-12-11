import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { HyperFormula } from 'hyperformula';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { getProgressReport, saveProgressReport } from '@/features/progress/api/progress';
import type { ProgressReportResponse } from '@/features/progress/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Save, RefreshCw, FileDown, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Register all Handsontable modules
registerAllModules();

// Helper function to calculate number of weeks between two dates
const calculateWeeksFromDates = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(Math.ceil(diffDays / 7), 1);
};

// Helper function to format date range for week header (e.g., "1-7 Jan")
const formatWeekRange = (startDate: Date, endDate: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = months[startDate.getMonth()];
    const endMonth = months[endDate.getMonth()];

    if (startMonth === endMonth) {
        return `${startDay}-${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth}-${endDay} ${endMonth}`;
};

// Helper function to get week date range
const getWeekDateRange = (spmkDate: string, weekNumber: number): { start: Date; end: Date } => {
    const start = new Date(spmkDate);
    start.setDate(start.getDate() + (weekNumber - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
};

interface ProgressTabContentProps {
    pekerjaanId: number;
}

export default function ProgressTabContent({ pekerjaanId }: ProgressTabContentProps) {
    const [report, setReport] = useState<ProgressReportResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [weekCount, setWeekCount] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
    const [rowsToAdd, setRowsToAdd] = useState(1);
    const [signatureData, setSignatureData] = useState({
        // Kolom Mengetahui
        namaMengetahui: '',
        nipMengetahui: '',
        jabatanMengetahui: 'Pejabat Pelaksana Teknis Kegiatan',
        instansiMengetahui: 'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur',
        // Kolom Diperiksa
        namaDiperiksa: '',
        nipDiperiksa: '',
        jabatanDiperiksa: 'Pengawas Lapangan',
        // Kolom Dibuat oleh
        namaPerusahaan: '',
        namaDirektur: '',
        tanggal: '',
        lokasi: 'Cianjur',
    });
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

            // Auto-calculate weeks from contract dates (tgl_spmk to tgl_selesai)
            if (data.data.kontrak?.tgl_spmk && data.data.kontrak?.tgl_selesai) {
                const calculatedWeeks = calculateWeeksFromDates(
                    data.data.kontrak.tgl_spmk,
                    data.data.kontrak.tgl_selesai
                );
                setWeekCount(Math.max(calculatedWeeks, data.data.max_minggu, 1));
            } else if (data.data.max_minggu > 0) {
                setWeekCount(Math.max(data.data.max_minggu, 1));
            }
            setHasChanges(false);
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
        if (!hotRef.current) return;
        const hot = hotRef.current.hotInstance;

        // Insert new row before the totals row
        const totalRows = hot.countRows();
        const insertIndex = totalRows > 0 ? totalRows - 1 : 0;

        hot.alter('insert_row_above', insertIndex, 1);

        // Initialize the new row with defaults
        // Note: Handsontable will fill with nulls, we can set defaults if needed
        // but for now we let the user fill it in

        setHasChanges(true);
    }, []);

    // Build data for Handsontable
    const { tableData, colHeaders, columns } = useMemo(() => {
        // Build column headers with date ranges if tgl_spmk is available
        const headers = ['No.', 'Item Pekerjaan', 'Rincian Item', 'Satuan', 'Harga Satuan', 'Bobot (%)', 'Target Vol'];
        const tglSpmk = report?.kontrak?.tgl_spmk;

        for (let w = 1; w <= weekCount; w++) {
            if (tglSpmk) {
                // Calculate date range for this week
                const { start, end } = getWeekDateRange(tglSpmk, w);
                const dateRange = formatWeekRange(start, end);
                headers.push(`M${w} Renc\n(${dateRange})`);
                headers.push(`M${w} Real`);
            } else {
                headers.push(`M${w} Renc`);
                headers.push(`M${w} Real`);
            }
        }
        headers.push('Total Akum', '% Progress', 'Bobot %');

        // Build column definitions
        const cols: any[] = [
            { data: 0, type: 'numeric', readOnly: true, className: 'htCenter' },  // No
            { data: 1, type: 'text' },           // Item Pekerjaan
            { data: 2, type: 'text' },           // Rincian
            { data: 3, type: 'text' },           // Satuan
            { data: 4, type: 'numeric', numericFormat: { pattern: '0,0' } },  // Harga
            { data: 5, type: 'numeric', readOnly: true, numericFormat: { pattern: '0.00' }, className: 'htCenter bg-yellow-50 font-semibold' },   // Bobot (auto-calculated)
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
        const meta: { type: 'item' | 'totals'; id?: number }[] = [];

        // Existing items from report
        if (report) {
            // Calculate total RAB first (sum of harga_satuan * target_volume * 1.11 for all items)
            const totalRAB = Math.floor(report.items.reduce((sum, item) => {
                return sum + ((item.harga_satuan || 0) * (item.target_volume || 0) * 1.11);
            }, 0) / 1000) * 1000;

            // If no items exist, create 50 empty rows
            if (report.items.length === 0) {
                for (let i = 0; i < 10; i++) {
                    meta.push({ type: 'item' });
                    const row: (string | number | null)[] = [
                        i + 1,
                        '',
                        '',
                        '',
                        null,
                        0, // Bobot (auto-calculated, starts at 0)
                        null,
                    ];
                    // Weekly data (empty)
                    for (let w = 1; w <= weekCount; w++) {
                        row.push(null); // Rencana
                        row.push(null); // Realisasi
                    }
                    // Calculated fields
                    row.push(0);
                    row.push(0);
                    row.push(0);
                    data.push(row);
                }
                // Add totals row for empty items case
                meta.push({ type: 'totals' });
                const totalsRow: (string | number | null)[] = [
                    '',
                    'TOTAL',
                    '',
                    '',
                    '0',
                    '0.00',
                    '',
                ];
                for (let w = 1; w <= weekCount; w++) {
                    totalsRow.push('0.00');
                    totalsRow.push('0.00');
                }
                totalsRow.push('0.00');
                totalsRow.push('-');
                totalsRow.push(0);
                data.push(totalsRow);
            } else {
                report.items.forEach((item, index) => {
                    meta.push({ type: 'item', id: item.id });

                    // Calculate bobot automatically: (harga_satuan * target_volume * 1.11) / totalRAB * 100
                    const itemRAB = (item.harga_satuan || 0) * (item.target_volume || 0) * 1.11;
                    const calculatedBobot = totalRAB > 0 ? (itemRAB / totalRAB) * 100 : 0;

                    const row: (string | number | null)[] = [
                        index + 1,
                        item.nama_item,
                        item.rincian_item,
                        item.satuan,
                        item.harga_satuan,
                        Math.round(calculatedBobot * 100) / 100, // Auto-calculated bobot
                        item.target_volume,
                    ];

                    // Weekly data
                    let totalReal = 0;
                    const weeklyData = item.weekly_data ?? {};
                    for (let w = 1; w <= weekCount; w++) {
                        const weekly = weeklyData[w];
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
                // Add totals row
                meta.push({ type: 'totals' });

                const totalsRow: (string | number | null)[] = [
                    '',
                    'TOTAL',
                    '',
                    '',
                    `${new Intl.NumberFormat('id-ID').format(totalRAB)}`,
                    '100.00', // Total bobot is always 100%
                    '', // Target Volume total (empty)
                ];

                // Weekly totals
                for (let w = 1; w <= weekCount; w++) {
                    let totalRenc = 0;
                    let totalReal = 0;
                    report.items.forEach(item => {
                        const weeklyData = item.weekly_data ?? {};
                        const weekly = weeklyData[w];
                        totalRenc += weekly?.rencana ?? 0;
                        totalReal += weekly?.realisasi ?? 0;
                    });
                    totalsRow.push(Math.round(totalRenc).toFixed(2));
                    totalsRow.push(Math.round(totalReal).toFixed(2));
                }

                totalsRow.push(Math.round(report.totals.total_accumulated_real || 0).toFixed(2));
                totalsRow.push('-');
                totalsRow.push(Math.round(report.totals.total_weighted_progress).toFixed(2));

                data.push(totalsRow);
            }
        }

        return {
            tableData: data,
            colHeaders: headers,
            columns: cols,
            rowMeta: meta
        };
    }, [report, weekCount]);

    const handleAfterChange = useCallback((changes: any, source: string) => {
        if (source === 'loadData' || source === 'calculation' || !changes) return;
        setHasChanges(true);

        // Real-time calculation for calculated columns
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;

        const totalRows = hot.countRows();
        if (totalRows === 0) return;

        // Column indices
        const hargaSatuanCol = 4;
        const bobotCol = 5;
        const targetVolCol = 6;
        const baseWeeklyCol = 7; // First weekly column
        const baseFormulaCol = 7 + weekCount * 2; // First formula column after weekly data

        // Calculate total RAB from all rows (excluding totals row)
        let totalRAB = 0;
        for (let row = 0; row < totalRows - 1; row++) {
            const harga = parseFloat(hot.getDataAtCell(row, hargaSatuanCol)) || 0;
            const volume = parseFloat(hot.getDataAtCell(row, targetVolCol)) || 0;
            totalRAB += harga * volume * 1.11;
        }
        totalRAB = Math.floor(totalRAB / 1000) * 1000;

        // Recalculate for each item row
        let grandTotalReal = 0;
        let grandTotalWeightedProgress = 0;
        const weeklyTotals: { renc: number; real: number }[] = [];
        for (let w = 0; w < weekCount; w++) {
            weeklyTotals.push({ renc: 0, real: 0 });
        }

        for (let row = 0; row < totalRows - 1; row++) {
            const harga = parseFloat(hot.getDataAtCell(row, hargaSatuanCol)) || 0;
            const targetVol = parseFloat(hot.getDataAtCell(row, targetVolCol)) || 0;

            // Calculate Bobot
            const itemRAB = harga * targetVol * 1.11;
            const bobot = totalRAB > 0 ? (itemRAB / totalRAB) * 100 : 0;
            hot.setDataAtCell(row, bobotCol, Math.round(bobot * 100) / 100, 'calculation');

            // Calculate total realisasi for this row
            let totalReal = 0;
            for (let w = 0; w < weekCount; w++) {
                const rencCol = baseWeeklyCol + w * 2;
                const realCol = baseWeeklyCol + w * 2 + 1;
                const renc = parseFloat(hot.getDataAtCell(row, rencCol)) || 0;
                const real = parseFloat(hot.getDataAtCell(row, realCol)) || 0;
                totalReal += real;
                weeklyTotals[w].renc += renc;
                weeklyTotals[w].real += real;
            }

            // Calculate progress and weighted progress
            const progressPercent = targetVol > 0 ? (totalReal / targetVol) * 100 : 0;
            const weightedProgress = (progressPercent * bobot) / 100;

            // Update calculated columns
            hot.setDataAtCell(row, baseFormulaCol, totalReal, 'calculation');
            hot.setDataAtCell(row, baseFormulaCol + 1, Math.round(progressPercent * 100) / 100, 'calculation');
            hot.setDataAtCell(row, baseFormulaCol + 2, Math.round(weightedProgress * 100) / 100, 'calculation');

            grandTotalReal += totalReal;
            grandTotalWeightedProgress += weightedProgress;
        }

        // Update totals row
        const totalsRowIdx = totalRows - 1;
        hot.setDataAtCell(totalsRowIdx, hargaSatuanCol, new Intl.NumberFormat('id-ID').format(totalRAB), 'calculation');
        hot.setDataAtCell(totalsRowIdx, bobotCol, '100.00', 'calculation');

        // Update weekly totals in totals row
        for (let w = 0; w < weekCount; w++) {
            const rencCol = baseWeeklyCol + w * 2;
            const realCol = baseWeeklyCol + w * 2 + 1;
            hot.setDataAtCell(totalsRowIdx, rencCol, weeklyTotals[w].renc.toFixed(2), 'calculation');
            hot.setDataAtCell(totalsRowIdx, realCol, weeklyTotals[w].real.toFixed(2), 'calculation');
        }

        hot.setDataAtCell(totalsRowIdx, baseFormulaCol, grandTotalReal.toFixed(2), 'calculation');
        hot.setDataAtCell(totalsRowIdx, baseFormulaCol + 2, grandTotalWeightedProgress.toFixed(2), 'calculation');
    }, [weekCount]);

    const handleSaveAll = async () => {
        if (!hotRef.current) return;

        const hot = hotRef.current.hotInstance;
        if (!hot) return;

        try {
            setSubmitting(true);

            // Get current data from Handsontable
            const currentData = hot.getData();
            const itemsToSave: any[] = [];

            // Iterate all rows except the last one (totals)
            // Note: We need to be careful if the user added/removed rows
            // The last row is always totals if we have data, but let's check
            const totalRows = hot.countRows();
            const dataRows = totalRows > 1 ? totalRows - 1 : 0; // Assume last row is totals

            for (let rowIndex = 0; rowIndex < dataRows; rowIndex++) {
                const row = currentData[rowIndex];

                // Skip empty rows (check if name is empty)
                if (!row[1]) continue;

                const item: any = {
                    nama_item: row[1],
                    rincian_item: row[2] || '',
                    satuan: row[3],
                    harga_satuan: parseFloat(row[4]) || 0,
                    bobot: parseFloat(row[5]) || 0,
                    target_volume: parseFloat(row[6]) || 0,
                    weekly_data: {}
                };

                for (let w = 1; w <= weekCount; w++) {
                    const rencanaColIndex = 7 + (w - 1) * 2;
                    const realisasiColIndex = 8 + (w - 1) * 2;

                    const rencana = parseFloat(row[rencanaColIndex]) || 0;
                    const realisasi = row[realisasiColIndex] !== null && row[realisasiColIndex] !== ''
                        ? parseFloat(row[realisasiColIndex])
                        : null;

                    if (rencana > 0 || realisasi !== null) {
                        item.weekly_data[w] = { rencana, realisasi };
                    }
                }

                itemsToSave.push(item);
            }

            await saveProgressReport(pekerjaanId, {
                items: itemsToSave,
                week_count: weekCount
            });

            toast.success('Progress berhasil disimpan');
            setHasChanges(false);
            fetchReport();
        } catch (error) {
            console.error('Failed to save changes:', error);
            toast.error('Gagal menyimpan perubahan');
        } finally {
            setSubmitting(false);
        }
    };

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
                'delete_row': {
                    name: 'Hapus Baris',
                    callback: function (_key: string, selection: any) {
                        const hot = hotRef.current?.hotInstance;
                        const row = selection[0]?.start?.row;
                        const totalRows = hot.countRows();

                        // Prevent deleting totals row
                        if (row !== undefined && row < totalRows - 1) {
                            hot.alter('remove_row', row);
                            setHasChanges(true);
                        }
                    },
                    disabled: function () {
                        const hot = hotRef.current?.hotInstance;
                        const selected = hot?.getSelected();
                        if (!selected || !selected[0]) return true;
                        const row = selected[0][0];
                        const totalRows = hot.countRows();
                        // Disable for totals row (last row)
                        return row >= totalRows - 1;
                    }
                },
                'separator': { name: '---------' },
                'copy': { name: 'Copy' },
                'cut': { name: 'Cut' }
            }
        };
    }, [handleAddNewRow]);

    // Cells callback to control editability
    const getCellProperties = useCallback((_row: number, col: number) => {
        const cellProperties: any = {};

        // No. column is always read-only
        if (col === 0) {
            cellProperties.readOnly = true;
        }

        // Calculated columns are always read-only
        const baseFormulaCol = 7 + weekCount * 2;
        if (col >= baseFormulaCol) {
            cellProperties.readOnly = true;
        }

        return cellProperties;
    }, [weekCount]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Generate PDF function
    const generatePdf = () => {
        if (!report) return;

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();

        // Title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('URAIAN LAPORAN MINGGUAN', pageWidth - 15, 15, { align: 'right' });

        // Header info
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const headerY = 25;
        doc.text('KEGIATAN', 15, headerY);
        doc.text(`: ${report.kegiatan?.nama_kegiatan || '-'}`, 45, headerY);
        doc.text('PEKERJAAN', 15, headerY + 5);
        doc.text(`: ${report.pekerjaan.nama || '-'}`, 45, headerY + 5);
        doc.text('LOKASI', 15, headerY + 10);
        doc.text(`: ${report.pekerjaan.lokasi || '-'}`, 45, headerY + 10);
        doc.text('MINGGU KE', 15, headerY + 15);
        doc.text(`: ${weekCount}`, 45, headerY + 15);
        doc.text('TANGGAL', 15, headerY + 20);
        doc.text(`: ${report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}`, 45, headerY + 20);

        // Build table headers
        const headers: any[][] = [[]];
        const subHeaders: string[] = ['NO', 'URAIAN PEKERJAAN', 'VOLUME SATUAN', 'BOBOT %'];

        // Add week columns
        for (let w = 1; w <= weekCount; w++) {
            if (w === 1) {
                subHeaders.push('VOLUME SATUAN', 'SELESAI %', 'THD.BOBOT KONTRAK %');
            } else {
                subHeaders.push('VOLUME SATUAN', 'SELESAI %', 'THD.BOBOT KONTRAK %');
            }
        }

        // Main header row with merged cells
        headers[0] = [
            { content: 'NO', rowSpan: 2 },
            { content: 'URAIAN PEKERJAAN', rowSpan: 2 },
            { content: 'VOLUME SATUAN', rowSpan: 2 },
            { content: 'BOBOT', rowSpan: 2 },
        ];

        for (let w = 1; w <= weekCount; w++) {
            const label = w === 1 ? 'PRESTASI S/D MINGGU LALU' : (w === weekCount ? 'PRESTASI S/D MINGGU INI' : `PRESTASI MINGGU ${w}`);
            headers[0].push({ content: label, colSpan: 3 });
        }

        // Second header row
        const secondRow = ['VOLUME SATUAN', '%', 'BOBOT', 'VOLUME SATUAN'];
        for (let w = 1; w <= weekCount; w++) {
            secondRow.push('%', 'BOBOT', ' VOLUME SATUAN');
        }
        headers.push(secondRow);

        // Build table body with grouping by nama_item
        const body: any[][] = [];

        // Group items by nama_item
        const groupedItems: { [key: string]: typeof report.items } = {};
        report.items.forEach(item => {
            const groupKey = item.nama_item || 'Lainnya';
            if (!groupedItems[groupKey]) {
                groupedItems[groupKey] = [];
            }
            groupedItems[groupKey].push(item);
        });

        let rowNumber = 1;
        const totalCols = 4 + (weekCount * 3); // NO, URAIAN, VOLUME, BOBOT + weekly columns

        Object.entries(groupedItems).forEach(([groupName, items]) => {
            // Add group header row
            const groupRow: any[] = [
                { content: groupName, colSpan: totalCols, styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'left' } }
            ];
            body.push(groupRow);

            // Add items in this group
            items.forEach((item) => {
                const row: any[] = [
                    rowNumber++,
                    item.rincian_item || '-',
                    `${item.target_volume || 0} ${item.satuan || ''}`,
                    Math.round(item.bobot || 0).toFixed(2),
                ];

                const weeklyData = item.weekly_data ?? {};
                let accumulatedReal = 0;

                for (let w = 1; w <= weekCount; w++) {
                    const weekly = weeklyData[w];
                    const realisasi = weekly?.realisasi ?? 0;
                    accumulatedReal += realisasi;

                    const targetVol = item.target_volume || 0;
                    const selesaiPercent = targetVol > 0 ? (accumulatedReal / targetVol) * 100 : 0;
                    const bobotKontrak = (selesaiPercent * (item.bobot || 0)) / 100;

                    row.push(
                        `${accumulatedReal} ${item.satuan || ''}`,
                        Math.round(selesaiPercent).toFixed(2),
                        Math.round(bobotKontrak).toFixed(2)
                    );
                }

                body.push(row);
            });
        });

        // Add totals row
        const totalRow: any[] = ['', 'TOTAL', '', Math.round(report.totals.total_bobot || 0).toFixed(2)];
        for (let w = 1; w <= weekCount; w++) {
            let weekTotalReal = 0;
            let weekSelesai = 0;
            let weekBobot = 0;
            report.items.forEach(item => {
                const weeklyData = item.weekly_data ?? {};
                let accum = 0;
                for (let i = 1; i <= w; i++) {
                    accum += weeklyData[i]?.realisasi ?? 0;
                }
                const targetVol = item.target_volume || 0;
                const selesai = targetVol > 0 ? (accum / targetVol) * 100 : 0;
                weekTotalReal += accum;
                weekSelesai += selesai;
                weekBobot += (selesai * (item.bobot || 0)) / 100;
            });
            totalRow.push('', '', Math.round(weekBobot).toFixed(2));
        }
        body.push(totalRow);

        // Generate table
        autoTable(doc, {
            head: headers,
            body: body,
            startY: headerY + 28,
            theme: 'grid',
            tableWidth: 'auto',
            margin: { left: 5, right: 5 },
            styles: {
                fontSize: 6,
                cellPadding: 0.8,
                halign: 'center',
                valign: 'middle',
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fontSize: 5,
            },
            bodyStyles: {
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
            },
            columnStyles: {
                0: { cellWidth: 6 },
                1: { cellWidth: 35, halign: 'left' },
                2: { cellWidth: 15 },
                3: { cellWidth: 10 },
            },
        });

        // ============ PAGE 2: REKAPITULASI LAPORAN MINGGUAN ============
        doc.addPage();

        // Title
        doc.setFillColor(128, 0, 128); // Purple background
        doc.rect(15, 10, pageWidth - 30, 8, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('REKAPITULASI LAPORAN MINGGUAN FISIK PEKERJAAN', pageWidth / 2, 15.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // Header info - Left side
        const rekapHeaderY = 25;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');

        // Max width for left column values (to prevent overlap)
        const leftMaxWidth = 80;
        const leftValueX = 45;
        const rightLabelX = 160;
        const rightValueX = 195;

        doc.text('Kegiatan', 15, rekapHeaderY);
        const kegiatanText = doc.splitTextToSize(`: ${report.kegiatan?.nama_kegiatan || '-'}`, leftMaxWidth);
        doc.text(kegiatanText[0] || '-', leftValueX, rekapHeaderY);

        doc.text('Sub Kegiatan', 15, rekapHeaderY + 5);
        const subKegText = doc.splitTextToSize(`: ${report.kegiatan?.nama_sub_kegiatan || '-'}`, leftMaxWidth);
        doc.text(subKegText[0] || '-', leftValueX, rekapHeaderY + 5);

        doc.text('Pekerjaan', 15, rekapHeaderY + 10);
        const pekerjaanText = doc.splitTextToSize(`: ${report.pekerjaan.nama || '-'}`, leftMaxWidth);
        doc.text(pekerjaanText[0] || '-', leftValueX, rekapHeaderY + 10);

        doc.text('Lokasi', 15, rekapHeaderY + 15);
        doc.text(`: ${report.pekerjaan.lokasi || '-'}`, leftValueX, rekapHeaderY + 15);
        doc.text('Tahun Anggaran', 15, rekapHeaderY + 20);
        doc.text(`: ${report.kegiatan?.tahun_anggaran || new Date().getFullYear()}`, leftValueX, rekapHeaderY + 20);
        doc.text('Kontraktor Pelaksana', 15, rekapHeaderY + 25);
        doc.text(`: ${report.penyedia?.nama || '-'}`, leftValueX, rekapHeaderY + 25);
        doc.text('Konsultan Pengawas', 15, rekapHeaderY + 30);
        doc.text(': -', leftValueX, rekapHeaderY + 30);

        // Header info - Right side
        doc.text('No. SPMK', rightLabelX, rekapHeaderY);
        doc.text(`: ${report.kontrak?.spmk || '-'}`, rightValueX, rekapHeaderY);
        doc.text('Tanggal SPMK', rightLabelX, rekapHeaderY + 5);
        doc.text(`: ${report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : '-'}`, rightValueX, rekapHeaderY + 5);
        doc.text('Minggu Ke', rightLabelX, rekapHeaderY + 10);
        doc.text(`: ${weekCount}`, rightValueX, rekapHeaderY + 10);
        doc.text('Mulai Tanggal', rightLabelX, rekapHeaderY + 15);
        doc.text(`: ${report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : '-'}`, rightValueX, rekapHeaderY + 15);
        doc.text('s/d Tanggal', rightLabelX, rekapHeaderY + 20);
        doc.text(`: ${report.kontrak?.tgl_selesai ? new Date(report.kontrak.tgl_selesai).toLocaleDateString('id-ID') : '-'}`, rightValueX, rekapHeaderY + 20);
        doc.text('Waktu Pelaksanaan', rightLabelX, rekapHeaderY + 25);
        doc.text(': - Hari Kalender', rightValueX, rekapHeaderY + 25);
        doc.text('Sisa Waktu', rightLabelX, rekapHeaderY + 30);
        doc.text(': - Hari Kalender', rightValueX, rekapHeaderY + 30);

        // Calculate summary data
        let totalBobotMingguLalu = 0;
        let totalBobotMingguIni = 0;
        let totalBobotSampai = 0;
        let totalRencanaSampai = 0;

        // Rekapitulasi table headers
        const rekapHeaders = [
            ['NO', 'URAIAN PEKERJAAN', 'BOBOT (%)', 'BOBOT MINGGU LALU (%)', 'BOBOT MINGGU INI (%)', 'BOBOT S/D MINGGU INI (%)']
        ];

        // Rekapitulasi table body - grouped by nama_item
        const rekapBody: any[][] = [];
        let rekapRowNum = 1;
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

        Object.entries(groupedItems).forEach(([groupName, items], groupIndex) => {
            // Calculate group totals
            let groupBobot = 0;
            let groupBobotMingguLalu = 0;
            let groupBobotMingguIni = 0;
            let groupBobotSampai = 0;

            items.forEach(item => {
                const weeklyData = item.weekly_data ?? {};
                let accumLalu = 0;
                let accumIni = 0;

                // Calculate up to previous week
                for (let w = 1; w < weekCount; w++) {
                    accumLalu += weeklyData[w]?.realisasi ?? 0;
                }
                // Calculate current week
                accumIni = weeklyData[weekCount]?.realisasi ?? 0;

                const targetVol = item.target_volume || 0;
                const bobot = item.bobot || 0;

                const selesaiLalu = targetVol > 0 ? (accumLalu / targetVol) * 100 : 0;
                const selesaiIni = targetVol > 0 ? (accumIni / targetVol) * 100 : 0;
                const selesaiTotal = targetVol > 0 ? ((accumLalu + accumIni) / targetVol) * 100 : 0;

                groupBobot += bobot;
                groupBobotMingguLalu += (selesaiLalu * bobot) / 100;
                groupBobotMingguIni += (selesaiIni * bobot) / 100;
                groupBobotSampai += (selesaiTotal * bobot) / 100;

                // Add to running totals
                totalBobotMingguLalu += (selesaiLalu * bobot) / 100;
                totalBobotMingguIni += (selesaiIni * bobot) / 100;
                totalBobotSampai += (selesaiTotal * bobot) / 100;
            });

            rekapBody.push([
                romanNumerals[groupIndex] || rekapRowNum,
                groupName,
                Math.round(groupBobot).toFixed(2),
                Math.round(groupBobotMingguLalu).toFixed(2),
                Math.round(groupBobotMingguIni).toFixed(2),
                Math.round(groupBobotSampai).toFixed(2)
            ]);
            rekapRowNum++;
        });

        // Add total row
        rekapBody.push([
            '',
            { content: 'JUMLAH TOTAL', styles: { fontStyle: 'bold' } },
            { content: Math.round(report.totals.total_bobot || 0).toFixed(2), styles: { fontStyle: 'bold' } },
            { content: Math.round(totalBobotMingguLalu).toFixed(2), styles: { fontStyle: 'bold' } },
            { content: Math.round(totalBobotMingguIni).toFixed(2), styles: { fontStyle: 'bold' } },
            { content: Math.round(totalBobotSampai).toFixed(2), styles: { fontStyle: 'bold' } }
        ]);

        // Calculate rencana for comparison (assuming rencana data exists)
        report.items.forEach(item => {
            const weeklyData = item.weekly_data ?? {};
            let rencanaSampai = 0;
            for (let w = 1; w <= weekCount; w++) {
                rencanaSampai += weeklyData[w]?.rencana ?? 0;
            }
            const targetVol = item.target_volume || 0;
            const bobot = item.bobot || 0;
            const rencanaPct = targetVol > 0 ? (rencanaSampai / targetVol) * 100 : 0;
            totalRencanaSampai += (rencanaPct * bobot) / 100;
        });

        const deviasi = totalBobotSampai - totalRencanaSampai;

        // Generate rekapitulasi table
        autoTable(doc, {
            head: rekapHeaders,
            body: rekapBody,
            startY: rekapHeaderY + 38,
            theme: 'grid',
            tableWidth: 'auto',
            margin: { left: 10, right: 10 },
            styles: {
                fontSize: 8,
                cellPadding: 1.5,
                halign: 'center',
                valign: 'middle',
            },
            headStyles: {
                fillColor: [255, 255, 200],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
            },
            bodyStyles: {
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
            },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 'auto', halign: 'left' },
                2: { cellWidth: 25 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
                5: { cellWidth: 35 },
            },
        });

        // Summary metrics at bottom
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('PRESTASI REALISASI SAMPAI DENGAN MINGGU LALU', 15, finalY);
        doc.text(`:  ${Math.round(totalBobotMingguLalu).toFixed(2)}  %`, 130, finalY);
        doc.text('PRESTASI REALISASI MINGGU INI', 15, finalY + 6);
        doc.text(`:  ${Math.round(totalBobotMingguIni).toFixed(2)}  %`, 130, finalY + 6);
        doc.text('PRESTASI REALISASI SAMPAI DENGAN MINGGU INI', 15, finalY + 12);
        doc.text(`:  ${Math.round(totalBobotSampai).toFixed(2)}  %`, 130, finalY + 12);
        doc.text('PRESTASI RENCANA SAMPAI DENGAN MINGGU INI', 15, finalY + 18);
        doc.text(`:  ${Math.round(totalRencanaSampai).toFixed(2)}  %`, 130, finalY + 18);
        doc.text('DEVIASI S/D MINGGU INI', 15, finalY + 24);
        doc.text(`:  ${Math.round(deviasi).toFixed(2)}  %`, 130, finalY + 24);

        // ============ SIGNATURE SECTION ============
        const signatureY = finalY + 40;
        const pageHeight = doc.internal.pageSize.getHeight();

        // Check if there's enough space for signatures, if not add new page
        const signatureStartY = signatureY > pageHeight - 60 ? 30 : signatureY;
        if (signatureY > pageHeight - 60) {
            doc.addPage();
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        // Column positions
        const col1X = 30;  // Mengetahui
        const col2X = 130; // Diperiksa  
        const col3X = 220; // Dibuat oleh

        // Kolom Kiri - Mengetahui
        doc.text('Mengetahui :', col1X, signatureStartY);
        doc.text(signatureData.jabatanMengetahui, col1X, signatureStartY + 5);
        // Split instansi if too long
        const instansiLines = doc.splitTextToSize(signatureData.instansiMengetahui, 60);
        instansiLines.forEach((line: string, idx: number) => {
            doc.text(line, col1X, signatureStartY + 9 + (idx * 4));
        });

        // Signature space and name
        const nameY1 = signatureStartY + 35;
        doc.setFont('helvetica', 'bold');
        if (signatureData.namaMengetahui) {
            doc.text(signatureData.namaMengetahui.toUpperCase(), col1X, nameY1);
            doc.line(col1X - 5, nameY1 + 1, col1X + 55, nameY1 + 1); // Underline
        }
        doc.setFont('helvetica', 'normal');
        if (signatureData.nipMengetahui) {
            doc.text(`NIP. ${signatureData.nipMengetahui}`, col1X, nameY1 + 5);
        }

        // Kolom Tengah - Diperiksa
        doc.text('Diperiksa :', col2X, signatureStartY);
        doc.text(signatureData.jabatanDiperiksa, col2X, signatureStartY + 5);

        // Signature space and name
        doc.setFont('helvetica', 'bold');
        if (signatureData.namaDiperiksa) {
            doc.text(signatureData.namaDiperiksa.toUpperCase(), col2X, nameY1);
            doc.line(col2X - 5, nameY1 + 1, col2X + 55, nameY1 + 1); // Underline
        }
        doc.setFont('helvetica', 'normal');
        if (signatureData.nipDiperiksa) {
            doc.text(`NIP. ${signatureData.nipDiperiksa}`, col2X, nameY1 + 5);
        }

        // Kolom Kanan - Dibuat oleh
        doc.setTextColor(128, 0, 0); // Dark red for location/date
        doc.text(`${signatureData.lokasi},`, col3X, signatureStartY);
        doc.text(signatureData.tanggal, col3X + 30, signatureStartY);
        doc.setTextColor(0, 0, 0);
        doc.text('Dibuat oleh :', col3X, signatureStartY + 5);
        if (signatureData.namaPerusahaan) {
            doc.setFont('helvetica', 'bold');
            doc.text(signatureData.namaPerusahaan, col3X, signatureStartY + 10);
            doc.setFont('helvetica', 'normal');
        }

        // Direktur name
        doc.setFont('helvetica', 'bold');
        if (signatureData.namaDirektur) {
            doc.text(signatureData.namaDirektur.toUpperCase(), col3X, nameY1);
            doc.line(col3X - 5, nameY1 + 1, col3X + 55, nameY1 + 1); // Underline
        }
        doc.setFont('helvetica', 'normal');
        doc.text('Direktur', col3X, nameY1 + 5);

        // ============ PAGE 3: LAPORAN KEMAJUAN PELAKSANAAN PEKERJAAN ============
        doc.addPage();

        // Title on right
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 128); // Dark blue
        doc.text('LAPORAN KEMAJUAN PELAKSANAAN PEKERJAAN', pageWidth - 15, 15, { align: 'right' });
        doc.setTextColor(0, 0, 0);

        // Header box - Left side
        doc.setDrawColor(0, 0, 128);
        doc.setLineWidth(0.3);
        doc.rect(15, 20, 135, 28);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const kemajuanY = 26;
        const p3LeftMaxWidth = 95;

        doc.text('SUB KEGIATAN', 18, kemajuanY);
        const p3KegText = doc.splitTextToSize(`: ${report.kegiatan?.nama_sub_kegiatan || '-'}`, p3LeftMaxWidth);
        doc.text(p3KegText[0] || '-', 45, kemajuanY);

        doc.text('PEKERJAAN', 18, kemajuanY + 8);
        const p3PekText = doc.splitTextToSize(`: ${report.pekerjaan.nama || '-'}`, p3LeftMaxWidth);
        doc.text(p3PekText[0] || '-', 45, kemajuanY + 8);

        doc.text('LOKASI', 18, kemajuanY + 16);
        doc.text(`: ${report.pekerjaan.lokasi || '-'}`, 45, kemajuanY + 16);

        // Header box - Right side
        doc.rect(155, 20, 125, 28);
        doc.text('Nomor', 158, kemajuanY);
        doc.text(`: ${report.kontrak?.spmk || '-'}`, 180, kemajuanY);
        doc.text('Minggu ke', 158, kemajuanY + 8);
        doc.text(`: ${weekCount}`, 180, kemajuanY + 8);
        doc.text('Tanggal', 158, kemajuanY + 16);
        doc.text(`: ${report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}`, 180, kemajuanY + 16);

        // Section: Telah Melaksanakan Pekerjaan
        const sectionY = 55;
        doc.setFont('helvetica', 'bold');
        doc.text('Telah Melaksanakan Pekerjaan Pelaksanaan Untuk :', 15, sectionY);

        doc.setFont('helvetica', 'normal');
        const infoStartY = sectionY + 8;
        const labelX = 20;
        const colonX = 65;
        const valueX = 70;

        doc.text('a.', labelX, infoStartY);
        doc.text('Pekerjaan', labelX + 5, infoStartY);
        doc.text(':', colonX, infoStartY);
        doc.text(report.pekerjaan.nama || '-', valueX, infoStartY);

        doc.text('b.', labelX, infoStartY + 5);
        doc.text('Lokasi', labelX + 5, infoStartY + 5);
        doc.text(':', colonX, infoStartY + 5);
        doc.text(report.pekerjaan.lokasi || '-', valueX, infoStartY + 5);

        doc.text('c.', labelX, infoStartY + 10);
        doc.text('Nomor DPA dan Tanggal', labelX + 5, infoStartY + 10);
        doc.text(':', colonX, infoStartY + 10);
        doc.text('Nomor    : -', valueX, infoStartY + 10);
        doc.text('Tanggal  : -', valueX, infoStartY + 15);

        doc.text('d.', labelX, infoStartY + 22);
        doc.text('Departemen / Lembaga', labelX + 5, infoStartY + 22);
        doc.text(':', colonX, infoStartY + 22);
        doc.text('-', valueX, infoStartY + 22);

        doc.text('e.', labelX, infoStartY + 27);
        doc.text('Kontraktor / Pelaksana', labelX + 5, infoStartY + 27);
        doc.text(':', colonX, infoStartY + 27);
        doc.text(report.penyedia?.nama || '-', valueX, infoStartY + 27);

        doc.text('f.', labelX, infoStartY + 32);
        doc.text('Kontrak Nomor', labelX + 5, infoStartY + 32);
        doc.text(':', colonX, infoStartY + 32);
        doc.text(`Nomor    : ${report.kontrak?.spk || '-'}`, valueX, infoStartY + 32);
        doc.text(`Tanggal  : ${report.kontrak?.tgl_spk ? new Date(report.kontrak.tgl_spk).toLocaleDateString('id-ID') : '-'}`, valueX, infoStartY + 37);

        // Calculate total RAB
        const totalRABValue = Math.floor(report.items.reduce((sum, item) => {
            return sum + ((item.harga_satuan || 0) * (item.target_volume || 0) * 1.11);
        }, 0) / 1000) * 1000;

        doc.text('g.', labelX, infoStartY + 44);
        doc.text('Harga Pelaksanaan', labelX + 5, infoStartY + 44);
        doc.text(':', colonX, infoStartY + 44);
        doc.text(`Rp${new Intl.NumberFormat('id-ID').format(totalRABValue)}`, valueX, infoStartY + 44);

        doc.text('h.', labelX, infoStartY + 49);
        doc.text('Sumber Dana', labelX + 5, infoStartY + 49);
        doc.text(':', colonX, infoStartY + 49);
        doc.text(report.kegiatan?.sumber_dana || 'APBD', valueX, infoStartY + 49);

        doc.text('i.', labelX, infoStartY + 54);
        doc.text('Waktu Pelaksanaan', labelX + 5, infoStartY + 54);
        doc.text(':', colonX, infoStartY + 54);
        doc.text(`Tgl. Mulai    : ${report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : '-'}`, valueX, infoStartY + 54);
        doc.text(`Tgl. Selesai  : ${report.kontrak?.tgl_selesai ? new Date(report.kontrak.tgl_selesai).toLocaleDateString('id-ID') : '-'}`, valueX, infoStartY + 59);

        // Table for detailed items
        const kemajuanTableY = infoStartY + 70;

        // Headers with rowspan/colspan
        const kemajuanHeaders = [
            [
                { content: 'NO', rowSpan: 2 },
                { content: 'URAIAN PEKERJAAN', rowSpan: 2 },
                { content: 'SATUAN VOLUME', rowSpan: 2 },
                { content: 'BOBOT', rowSpan: 2 },
                { content: 'REALISASI PELAKSANAAN', colSpan: 3 }
            ],
            [
                'VOLUME',
                'PROSENTASE (%)',
                'BOBOT HASIL (%)'
            ]
        ];

        // Build table body with grouping
        const kemajuanBody: any[][] = [];
        let kemajuanRowNum = 1;
        let grandTotalBobot = 0;
        let grandTotalBobotHasil = 0;

        Object.entries(groupedItems).forEach(([groupName, items], groupIndex) => {
            // Group header
            kemajuanBody.push([
                { content: romanNumerals[groupIndex] || (groupIndex + 1), styles: { fontStyle: 'bold' } },
                { content: groupName, colSpan: 6, styles: { fontStyle: 'bold', halign: 'left' } }
            ]);

            let subTotalBobot = 0;
            let subTotalBobotHasil = 0;

            items.forEach((item) => {
                const weeklyData = item.weekly_data ?? {};
                let totalRealisasi = 0;
                for (let w = 1; w <= weekCount; w++) {
                    totalRealisasi += weeklyData[w]?.realisasi ?? 0;
                }

                const targetVol = item.target_volume || 0;
                const bobot = item.bobot || 0;
                const prosentase = targetVol > 0 ? (totalRealisasi / targetVol) * 100 : 0;
                const bobotHasil = (prosentase * bobot) / 100;

                subTotalBobot += bobot;
                subTotalBobotHasil += bobotHasil;
                grandTotalBobot += bobot;
                grandTotalBobotHasil += bobotHasil;

                kemajuanBody.push([
                    kemajuanRowNum++,
                    { content: item.rincian_item || '-', styles: { halign: 'left' } },
                    `${item.satuan || ''} ${item.target_volume || 0}`,
                    Math.round(bobot).toFixed(2),
                    `${item.satuan || ''} ${totalRealisasi}`,
                    Math.round(prosentase).toFixed(0),
                    Math.round(bobotHasil).toFixed(2)
                ]);
            });

            // Sub total
            kemajuanBody.push([
                '',
                { content: 'SUB JUMLAH', styles: { fontStyle: 'bold' } },
                '',
                { content: Math.round(subTotalBobot).toFixed(2), styles: { fontStyle: 'bold' } },
                '',
                '',
                { content: Math.round(subTotalBobotHasil).toFixed(2), styles: { fontStyle: 'bold' } }
            ]);
        });

        // Grand total row
        kemajuanBody.push([
            '',
            { content: 'JUMLAH KEMAJUAN FISIK PEKERJAAN', styles: { fontStyle: 'bold', fillColor: [255, 255, 200] } },
            '',
            { content: Math.round(grandTotalBobot).toFixed(2), styles: { fontStyle: 'bold', fillColor: [255, 255, 200] } },
            '',
            '',
            { content: Math.round(grandTotalBobotHasil).toFixed(2), styles: { fontStyle: 'bold', fillColor: [255, 255, 200] } }
        ]);

        // Generate kemajuan table
        autoTable(doc, {
            head: kemajuanHeaders,
            body: kemajuanBody,
            startY: kemajuanTableY,
            theme: 'grid',
            tableWidth: 'auto',
            margin: { left: 10, right: 10 },
            styles: {
                fontSize: 7,
                cellPadding: 1,
                halign: 'center',
                valign: 'middle',
            },
            headStyles: {
                fillColor: [255, 255, 200],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
            },
            bodyStyles: {
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
            },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 'auto', halign: 'left' },
                2: { cellWidth: 25 },
                3: { cellWidth: 20 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 },
                6: { cellWidth: 25 },
            },
        });

        // ============ SIGNATURE SECTION FOR PAGE 3 ============
        const kemajuanFinalY = (doc as any).lastAutoTable.finalY + 15;
        const page3Height = doc.internal.pageSize.getHeight();

        // Check if there's enough space for signatures, if not add new page
        let sigY3 = kemajuanFinalY;
        if (kemajuanFinalY > page3Height - 60) {
            doc.addPage();
            sigY3 = 30;
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        // Column positions for page 3
        const p3col1X = 30;  // Mengetahui
        const p3col2X = 130; // Diperiksa  
        const p3col3X = 220; // Dibuat oleh

        // Kolom Kiri - Mengetahui
        doc.text('Mengetahui :', p3col1X, sigY3);
        doc.text(signatureData.jabatanMengetahui, p3col1X, sigY3 + 5);
        const instansiLines3 = doc.splitTextToSize(signatureData.instansiMengetahui, 60);
        instansiLines3.forEach((line: string, idx: number) => {
            doc.text(line, p3col1X, sigY3 + 9 + (idx * 4));
        });

        const nameY3 = sigY3 + 35;
        doc.setFont('helvetica', 'bold');
        if (signatureData.namaMengetahui) {
            doc.text(signatureData.namaMengetahui.toUpperCase(), p3col1X, nameY3);
            doc.line(p3col1X - 5, nameY3 + 1, p3col1X + 55, nameY3 + 1);
        }
        doc.setFont('helvetica', 'normal');
        if (signatureData.nipMengetahui) {
            doc.text(`NIP. ${signatureData.nipMengetahui}`, p3col1X, nameY3 + 5);
        }

        // Kolom Tengah - Diperiksa
        doc.text('Diperiksa :', p3col2X, sigY3);
        doc.text(signatureData.jabatanDiperiksa, p3col2X, sigY3 + 5);

        doc.setFont('helvetica', 'bold');
        if (signatureData.namaDiperiksa) {
            doc.text(signatureData.namaDiperiksa.toUpperCase(), p3col2X, nameY3);
            doc.line(p3col2X - 5, nameY3 + 1, p3col2X + 55, nameY3 + 1);
        }
        doc.setFont('helvetica', 'normal');
        if (signatureData.nipDiperiksa) {
            doc.text(`NIP. ${signatureData.nipDiperiksa}`, p3col2X, nameY3 + 5);
        }

        // Kolom Kanan - Dibuat oleh
        doc.setTextColor(128, 0, 0);
        doc.text(`${signatureData.lokasi},`, p3col3X, sigY3);
        doc.text(signatureData.tanggal, p3col3X + 30, sigY3);
        doc.setTextColor(0, 0, 0);
        doc.text('Dibuat oleh :', p3col3X, sigY3 + 5);
        if (signatureData.namaPerusahaan) {
            doc.setFont('helvetica', 'bold');
            doc.text(signatureData.namaPerusahaan, p3col3X, sigY3 + 10);
            doc.setFont('helvetica', 'normal');
        }

        doc.setFont('helvetica', 'bold');
        if (signatureData.namaDirektur) {
            doc.text(signatureData.namaDirektur.toUpperCase(), p3col3X, nameY3);
            doc.line(p3col3X - 5, nameY3 + 1, p3col3X + 55, nameY3 + 1);
        }
        doc.setFont('helvetica', 'normal');
        doc.text('Direktur', p3col3X, nameY3 + 5);

        doc.save(`laporan_mingguan_${report.pekerjaan.nama?.replace(/\s+/g, '_') || 'progress'}.pdf`);
        toast.success('PDF berhasil diunduh');
    };

    // Generate Excel function
    const generateExcel = () => {
        if (!report) return;

        const workbook = XLSX.utils.book_new();

        // Calculate total RAB
        const totalRABValue = Math.floor(report.items.reduce((sum, item) => {
            return sum + ((item.harga_satuan || 0) * (item.target_volume || 0) * 1.11);
        }, 0) / 1000) * 1000;

        // Group items by nama_item
        const groupedItems: { [key: string]: typeof report.items } = {};
        report.items.forEach(item => {
            const groupKey = item.nama_item || 'Lainnya';
            if (!groupedItems[groupKey]) {
                groupedItems[groupKey] = [];
            }
            groupedItems[groupKey].push(item);
        });

        // ============ SHEET 1: URAIAN LAPORAN MINGGUAN ============
        const sheet1Data: any[][] = [];

        // Header info
        sheet1Data.push(['URAIAN LAPORAN MINGGUAN']);
        sheet1Data.push([]);
        sheet1Data.push(['KEGIATAN', report.kegiatan?.nama_kegiatan || '-']);
        sheet1Data.push(['PEKERJAAN', report.pekerjaan.nama || '-']);
        sheet1Data.push(['LOKASI', report.pekerjaan.lokasi || '-']);
        sheet1Data.push(['MINGGU KE', weekCount]);
        sheet1Data.push(['TANGGAL', report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')]);
        sheet1Data.push([]);

        // Table headers
        const headers1 = ['NO', 'URAIAN PEKERJAAN', 'VOLUME SATUAN', 'BOBOT %'];
        for (let w = 1; w <= weekCount; w++) {
            headers1.push(`M${w} VOL`, `M${w} %`, `M${w} BOBOT`);
        }
        sheet1Data.push(headers1);

        // Table data
        let rowNumber = 1;
        Object.entries(groupedItems).forEach(([groupName, items]) => {
            // Group header
            sheet1Data.push([groupName]);

            items.forEach((item) => {
                const row: any[] = [
                    rowNumber++,
                    item.rincian_item || '-',
                    `${item.target_volume || 0} ${item.satuan || ''}`,
                    Math.round(item.bobot || 0).toFixed(2),
                ];

                const weeklyData = item.weekly_data ?? {};
                let accumulatedReal = 0;

                for (let w = 1; w <= weekCount; w++) {
                    const weekly = weeklyData[w];
                    const realisasi = weekly?.realisasi ?? 0;
                    accumulatedReal += realisasi;

                    const targetVol = item.target_volume || 0;
                    const selesaiPercent = targetVol > 0 ? (accumulatedReal / targetVol) * 100 : 0;
                    const bobotKontrak = (selesaiPercent * (item.bobot || 0)) / 100;

                    row.push(
                        `${accumulatedReal} ${item.satuan || ''}`,
                        Math.round(selesaiPercent).toFixed(2),
                        Math.round(bobotKontrak).toFixed(2)
                    );
                }

                sheet1Data.push(row);
            });
        });

        // Total row
        const totalRow1: any[] = ['', 'TOTAL', '', Math.round(report.totals.total_bobot || 0).toFixed(2)];
        for (let w = 1; w <= weekCount; w++) {
            let weekBobot = 0;
            report.items.forEach(item => {
                const weeklyData = item.weekly_data ?? {};
                let accum = 0;
                for (let i = 1; i <= w; i++) {
                    accum += weeklyData[i]?.realisasi ?? 0;
                }
                const targetVol = item.target_volume || 0;
                const selesai = targetVol > 0 ? (accum / targetVol) * 100 : 0;
                weekBobot += (selesai * (item.bobot || 0)) / 100;
            });
            totalRow1.push('', '', Math.round(weekBobot).toFixed(2));
        }
        sheet1Data.push(totalRow1);

        const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
        XLSX.utils.book_append_sheet(workbook, ws1, 'Uraian Laporan');

        // ============ SHEET 2: REKAPITULASI ============
        const sheet2Data: any[][] = [];

        sheet2Data.push(['REKAPITULASI LAPORAN MINGGUAN FISIK PEKERJAAN']);
        sheet2Data.push([]);
        // Header Left Side
        sheet2Data.push(['Kegiatan', report.kegiatan?.nama_kegiatan || '-', '', '', 'No. SPMK', report.kontrak?.spmk || '-']);
        sheet2Data.push(['Sub Kegiatan', report.kegiatan?.nama_sub_kegiatan || '-', '', '', 'Tanggal SPMK', report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : '-']);
        sheet2Data.push(['Pekerjaan', report.pekerjaan.nama || '-', '', '', 'Minggu Ke', weekCount]);
        sheet2Data.push(['Lokasi', report.pekerjaan.lokasi || '-', '', '', 'Mulai Tanggal', report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : '-']);
        sheet2Data.push(['Tahun Anggaran', report.kegiatan?.tahun_anggaran || new Date().getFullYear(), '', '', 's/d Tanggal', report.kontrak?.tgl_selesai ? new Date(report.kontrak.tgl_selesai).toLocaleDateString('id-ID') : '-']);
        sheet2Data.push(['Kontraktor Pelaksana', report.penyedia?.nama || '-', '', '', 'Waktu Pelaksanaan', '- Hari Kalender']);
        sheet2Data.push(['Konsultan Pengawas', '-', '', '', 'Sisa Waktu', '- Hari Kalender']);
        sheet2Data.push([]);

        // Headers
        sheet2Data.push(['NO', 'URAIAN PEKERJAAN', 'BOBOT (%)', 'BOBOT MINGGU LALU (%)', 'BOBOT MINGGU INI (%)', 'BOBOT S/D MINGGU INI (%)']);

        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        let totalBobotMingguLalu = 0;
        let totalBobotMingguIni = 0;
        let totalBobotSampai = 0;
        let totalRencanaSampai = 0;

        Object.entries(groupedItems).forEach(([groupName, items], groupIndex) => {
            let groupBobot = 0;
            let groupBobotMingguLalu = 0;
            let groupBobotMingguIni = 0;
            let groupBobotSampai = 0;

            items.forEach(item => {
                const weeklyData = item.weekly_data ?? {};
                let accumLalu = 0;
                let accumIni = 0;

                for (let w = 1; w < weekCount; w++) {
                    accumLalu += weeklyData[w]?.realisasi ?? 0;
                }
                accumIni = weeklyData[weekCount]?.realisasi ?? 0;

                const targetVol = item.target_volume || 0;
                const bobot = item.bobot || 0;

                const selesaiLalu = targetVol > 0 ? (accumLalu / targetVol) * 100 : 0;
                const selesaiIni = targetVol > 0 ? (accumIni / targetVol) * 100 : 0;
                const selesaiTotal = targetVol > 0 ? ((accumLalu + accumIni) / targetVol) * 100 : 0;

                groupBobot += bobot;
                groupBobotMingguLalu += (selesaiLalu * bobot) / 100;
                groupBobotMingguIni += (selesaiIni * bobot) / 100;
                groupBobotSampai += (selesaiTotal * bobot) / 100;

                totalBobotMingguLalu += (selesaiLalu * bobot) / 100;
                totalBobotMingguIni += (selesaiIni * bobot) / 100;
                totalBobotSampai += (selesaiTotal * bobot) / 100;
            });

            sheet2Data.push([
                romanNumerals[groupIndex] || (groupIndex + 1),
                groupName,
                Math.round(groupBobot).toFixed(2),
                Math.round(groupBobotMingguLalu).toFixed(2),
                Math.round(groupBobotMingguIni).toFixed(2),
                Math.round(groupBobotSampai).toFixed(2)
            ]);
        });

        // Total row
        sheet2Data.push([
            '',
            'JUMLAH TOTAL',
            Math.round(report.totals.total_bobot || 0).toFixed(2),
            Math.round(totalBobotMingguLalu).toFixed(2),
            Math.round(totalBobotMingguIni).toFixed(2),
            Math.round(totalBobotSampai).toFixed(2)
        ]);

        // Calculate rencana
        report.items.forEach(item => {
            const weeklyData = item.weekly_data ?? {};
            let rencanaSampai = 0;
            for (let w = 1; w <= weekCount; w++) {
                rencanaSampai += weeklyData[w]?.rencana ?? 0;
            }
            const targetVol = item.target_volume || 0;
            const bobot = item.bobot || 0;
            const rencanaPct = targetVol > 0 ? (rencanaSampai / targetVol) * 100 : 0;
            totalRencanaSampai += (rencanaPct * bobot) / 100;
        });

        const deviasi = totalBobotSampai - totalRencanaSampai;

        sheet2Data.push([]);
        sheet2Data.push(['PRESTASI REALISASI S/D MINGGU LALU', `${Math.round(totalBobotMingguLalu).toFixed(2)} %`]);
        sheet2Data.push(['PRESTASI REALISASI MINGGU INI', `${Math.round(totalBobotMingguIni).toFixed(2)} %`]);
        sheet2Data.push(['PRESTASI REALISASI S/D MINGGU INI', `${Math.round(totalBobotSampai).toFixed(2)} %`]);
        sheet2Data.push(['PRESTASI RENCANA S/D MINGGU INI', `${Math.round(totalRencanaSampai).toFixed(2)} %`]);
        sheet2Data.push(['DEVIASI S/D MINGGU INI', `${Math.round(deviasi).toFixed(2)} %`]);

        const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
        XLSX.utils.book_append_sheet(workbook, ws2, 'Rekapitulasi');

        // ============ SHEET 3: LAPORAN KEMAJUAN ============
        const sheet3Data: any[][] = [];

        sheet3Data.push(['LAPORAN KEMAJUAN PELAKSANAAN PEKERJAAN']);
        sheet3Data.push([]);
        // Header Left & Right Box like PDF
        sheet3Data.push(['KEGIATAN', report.kegiatan?.nama_kegiatan || '-', '', '', 'Nomor', report.kontrak?.spmk || '-']);
        sheet3Data.push(['PEKERJAAN', report.pekerjaan.nama || '-', '', '', 'Minggu ke', weekCount]);
        sheet3Data.push(['LOKASI', report.pekerjaan.lokasi || '-', '', '', 'Tanggal', report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')]);
        sheet3Data.push([]);
        sheet3Data.push(['Telah Melaksanakan Pekerjaan Pelaksanaan Untuk :']);
        sheet3Data.push(['a.', 'Pekerjaan', report.pekerjaan.nama || '-']);
        sheet3Data.push(['b.', 'Lokasi', report.pekerjaan.lokasi || '-']);
        sheet3Data.push(['c.', 'Kontraktor Pelaksana', report.penyedia?.nama || '-']);
        sheet3Data.push(['d.', 'No. dan Tanggal Kontrak', `${report.kontrak?.spk || '-'} / ${report.kontrak?.tgl_spk ? new Date(report.kontrak.tgl_spk).toLocaleDateString('id-ID') : '-'}`]);
        sheet3Data.push(['e.', 'Masa Pelaksanaan', '-']);
        sheet3Data.push(['f.', 'Tanggal', report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : '-']);
        sheet3Data.push(['g.', 'Harga Pelaksanaan', `Rp${new Intl.NumberFormat('id-ID').format(totalRABValue)}`]);
        sheet3Data.push(['h.', 'Sumber Dana', report.kegiatan?.sumber_dana || 'APBD']);
        sheet3Data.push(['i.', 'Waktu Pelaksanaan', `Tgl. Mulai: ${report.kontrak?.tgl_spmk ? new Date(report.kontrak.tgl_spmk).toLocaleDateString('id-ID') : '-'} | Tgl. Selesai: ${report.kontrak?.tgl_selesai ? new Date(report.kontrak.tgl_selesai).toLocaleDateString('id-ID') : '-'}`]);
        sheet3Data.push([]);

        // Headers
        sheet3Data.push(['NO', 'URAIAN PEKERJAAN', 'SATUAN VOLUME', 'BOBOT', 'VOLUME', 'PROSENTASE (%)', 'BOBOT HASIL (%)']);

        let grandTotalBobot = 0;
        let grandTotalBobotHasil = 0;

        Object.entries(groupedItems).forEach(([groupName, items], groupIndex) => {
            // Group header
            sheet3Data.push([romanNumerals[groupIndex] || (groupIndex + 1), groupName]);

            let subTotalBobot = 0;
            let subTotalBobotHasil = 0;
            let kemajuanRowNum = 1;

            items.forEach((item) => {
                const weeklyData = item.weekly_data ?? {};
                let totalRealisasi = 0;
                for (let w = 1; w <= weekCount; w++) {
                    totalRealisasi += weeklyData[w]?.realisasi ?? 0;
                }

                const targetVol = item.target_volume || 0;
                const bobot = item.bobot || 0;
                const prosentase = targetVol > 0 ? (totalRealisasi / targetVol) * 100 : 0;
                const bobotHasil = (prosentase * bobot) / 100;

                subTotalBobot += bobot;
                subTotalBobotHasil += bobotHasil;
                grandTotalBobot += bobot;
                grandTotalBobotHasil += bobotHasil;

                sheet3Data.push([
                    kemajuanRowNum++,
                    item.rincian_item || '-',
                    `${item.satuan || ''} ${item.target_volume || 0}`,
                    Math.round(bobot).toFixed(2),
                    `${item.satuan || ''} ${totalRealisasi}`,
                    Math.round(prosentase).toFixed(0),
                    Math.round(bobotHasil).toFixed(2)
                ]);
            });

            // Sub total
            sheet3Data.push([
                '',
                'SUB JUMLAH',
                '',
                Math.round(subTotalBobot).toFixed(2),
                '',
                '',
                Math.round(subTotalBobotHasil).toFixed(2)
            ]);
        });

        // Grand total
        sheet3Data.push([
            '',
            'JUMLAH KEMAJUAN FISIK PEKERJAAN',
            '',
            Math.round(grandTotalBobot).toFixed(2),
            '',
            '',
            Math.round(grandTotalBobotHasil).toFixed(2)
        ]);

        const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
        XLSX.utils.book_append_sheet(workbook, ws3, 'Laporan Kemajuan');

        // Save file
        XLSX.writeFile(workbook, `laporan_mingguan_${report.pekerjaan.nama?.replace(/\s+/g, '_') || 'progress'}.xlsx`);
        toast.success('Excel berhasil diunduh');
    };

    return (
        <>
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
                                onChange={(e) => setWeekCount(parseInt(e.target.value) || 1)}
                                className="w-16"
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchReport}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={rowsToAdd}
                                onChange={(e) => setRowsToAdd(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-14"
                            />
                            <Button variant="outline" size="sm" onClick={() => {
                                for (let i = 0; i < rowsToAdd; i++) {
                                    handleAddNewRow();
                                }
                            }}>
                                <Plus className="h-4 w-4 mr-1" />
                                Tambah Baris
                            </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSignatureDialogOpen(true)}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={generateExcel}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export Excel
                        </Button>
                        {/* Signature Dialog */}
                        <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto z-[9999]">
                                <DialogHeader>
                                    <DialogTitle>Input Data Tanda Tangan</DialogTitle>
                                    <DialogDescription>
                                        Isi data tanda tangan untuk ditampilkan pada halaman Rekapitulasi Laporan Mingguan Fisik Pekerjaan.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    {/* Kolom Mengetahui */}
                                    <div className="border rounded-lg p-4">
                                        <h4 className="font-semibold mb-3 text-blue-600">Mengetahui</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="namaMengetahui">Nama</Label>
                                                <Input
                                                    id="namaMengetahui"
                                                    placeholder="Contoh: MUGIANTO, S.T."
                                                    value={signatureData.namaMengetahui}
                                                    onChange={(e) => setSignatureData({ ...signatureData, namaMengetahui: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="nipMengetahui">NIP</Label>
                                                <Input
                                                    id="nipMengetahui"
                                                    placeholder="Contoh: 198107312012012018"
                                                    value={signatureData.nipMengetahui}
                                                    onChange={(e) => setSignatureData({ ...signatureData, nipMengetahui: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label htmlFor="jabatanMengetahui">Jabatan</Label>
                                                <Input
                                                    id="jabatanMengetahui"
                                                    value={signatureData.jabatanMengetahui}
                                                    onChange={(e) => setSignatureData({ ...signatureData, jabatanMengetahui: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label htmlFor="instansiMengetahui">Instansi</Label>
                                                <Input
                                                    id="instansiMengetahui"
                                                    value={signatureData.instansiMengetahui}
                                                    onChange={(e) => setSignatureData({ ...signatureData, instansiMengetahui: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kolom Diperiksa */}
                                    <div className="border rounded-lg p-4">
                                        <h4 className="font-semibold mb-3 text-green-600">Diperiksa</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="namaDiperiksa">Nama</Label>
                                                <Input
                                                    id="namaDiperiksa"
                                                    placeholder="Contoh: FITRI ANITA, S.T."
                                                    value={signatureData.namaDiperiksa}
                                                    onChange={(e) => setSignatureData({ ...signatureData, namaDiperiksa: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="nipDiperiksa">NIP</Label>
                                                <Input
                                                    id="nipDiperiksa"
                                                    placeholder="Contoh: 198107312012012018"
                                                    value={signatureData.nipDiperiksa}
                                                    onChange={(e) => setSignatureData({ ...signatureData, nipDiperiksa: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label htmlFor="jabatanDiperiksa">Jabatan</Label>
                                                <Input
                                                    id="jabatanDiperiksa"
                                                    value={signatureData.jabatanDiperiksa}
                                                    onChange={(e) => setSignatureData({ ...signatureData, jabatanDiperiksa: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kolom Dibuat oleh */}
                                    <div className="border rounded-lg p-4">
                                        <h4 className="font-semibold mb-3 text-red-600">Dibuat oleh</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="lokasi">Lokasi</Label>
                                                <Input
                                                    id="lokasi"
                                                    placeholder="Contoh: Cianjur"
                                                    value={signatureData.lokasi}
                                                    onChange={(e) => setSignatureData({ ...signatureData, lokasi: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="tanggal">Tanggal</Label>
                                                <Input
                                                    id="tanggal"
                                                    placeholder="Contoh: 10 Januari 2026"
                                                    value={signatureData.tanggal}
                                                    onChange={(e) => setSignatureData({ ...signatureData, tanggal: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="namaPerusahaan">Nama Perusahaan</Label>
                                                <Input
                                                    id="namaPerusahaan"
                                                    placeholder="Contoh: CV. KARYA INSAN AMANAH"
                                                    value={signatureData.namaPerusahaan}
                                                    onChange={(e) => setSignatureData({ ...signatureData, namaPerusahaan: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="namaDirektur">Nama Direktur</Label>
                                                <Input
                                                    id="namaDirektur"
                                                    placeholder="Contoh: HERLAN FEBRIYANA, SH."
                                                    value={signatureData.namaDirektur}
                                                    onChange={(e) => setSignatureData({ ...signatureData, namaDirektur: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setSignatureDialogOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button onClick={() => {
                                        setSignatureDialogOpen(false);
                                        generatePdf();
                                    }}>
                                        <FileDown className="h-4 w-4 mr-2" />
                                        Export PDF
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/pekerjaan/${pekerjaanId}/progress`, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Buka di Tab Baru
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
                            💡 Edit data langsung di tabel. Klik kanan untuk menambah/menghapus baris. Klik "Simpan" untuk menyimpan semua perubahan.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* S-Curve Chart */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Kurva S - Progress Pekerjaan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={(() => {
                                    if (!report) return [];
                                    const chartData = [];
                                    let cumulativeRencana = 0;
                                    let cumulativeRealisasi = 0;

                                    for (let w = 1; w <= weekCount; w++) {
                                        let weekRencana = 0;
                                        let weekRealisasi = 0;

                                        report.items.forEach(item => {
                                            const weeklyData = item.weekly_data ?? {};
                                            const weekly = weeklyData[w];
                                            const targetVol = item.target_volume || 0;
                                            const bobot = item.bobot || 0;

                                            const rencana = weekly?.rencana ?? 0;
                                            const realisasi = weekly?.realisasi ?? 0;

                                            // Calculate weighted progress
                                            const rencanaPct = targetVol > 0 ? (rencana / targetVol) * 100 : 0;
                                            const realisasiPct = targetVol > 0 ? (realisasi / targetVol) * 100 : 0;

                                            weekRencana += (rencanaPct * bobot) / 100;
                                            weekRealisasi += (realisasiPct * bobot) / 100;
                                        });

                                        cumulativeRencana += weekRencana;
                                        cumulativeRealisasi += weekRealisasi;

                                        chartData.push({
                                            week: `M${w}`,
                                            Rencana: Math.round(cumulativeRencana),
                                            Realisasi: Math.round(cumulativeRealisasi),
                                        });
                                    }
                                    return chartData;
                                })()}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <Tooltip formatter={(value: number) => `${value}%`} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="Rencana"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    name="Rencana Kumulatif"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Realisasi"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    name="Realisasi Kumulatif"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
