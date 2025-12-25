/**
 * Excel generator for progress reports
 */
import * as XLSX from 'xlsx';
import type { ProgressReportData } from '@/features/progress/types';
import type { DpaData } from '@/features/progress/types/signature';
import { formatDateSafe } from './date-helpers';

interface ExcelGeneratorParams {
    report: ProgressReportData;
    weekCount: number;
    dpaData: DpaData;
}

/**
 * Generate Excel file for progress report
 */
export function generateExcel({ report, weekCount, dpaData }: ExcelGeneratorParams): void {
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

    const lokasiFormatted = report.pekerjaan.desa_nama && report.pekerjaan.kecamatan_nama
        ? `Desa ${report.pekerjaan.desa_nama} Kecamatan ${report.pekerjaan.kecamatan_nama}`
        : report.pekerjaan.lokasi || '-';

    // ============ SHEET 1: URAIAN LAPORAN MINGGUAN ============
    const sheet1Data: any[][] = [];

    // Header info
    sheet1Data.push(['URAIAN LAPORAN MINGGUAN']);
    sheet1Data.push([]);
    sheet1Data.push(['KEGIATAN', report.kegiatan?.nama_kegiatan || '-']);
    sheet1Data.push(['PEKERJAAN', report.pekerjaan.nama || '-']);
    sheet1Data.push(['LOKASI', lokasiFormatted]);
    sheet1Data.push(['MINGGU KE', weekCount]);
    sheet1Data.push(['TANGGAL', formatDateSafe(report.kontrak?.tgl_spmk, new Date().toLocaleDateString('id-ID'))]);
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
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

    sheet2Data.push(['REKAPITULASI LAPORAN MINGGUAN FISIK PEKERJAAN']);
    sheet2Data.push([]);
    sheet2Data.push(['Kegiatan', report.kegiatan?.nama_kegiatan || '-', '', '', 'No. SPMK', report.kontrak?.spmk || '-']);
    sheet2Data.push(['Sub Kegiatan', report.kegiatan?.nama_sub_kegiatan || '-', '', '', 'Tanggal SPMK', formatDateSafe(report.kontrak?.tgl_spmk)]);
    sheet2Data.push(['Pekerjaan', report.pekerjaan.nama || '-', '', '', 'Minggu Ke', weekCount]);
    sheet2Data.push(['Lokasi', lokasiFormatted, '', '', 'Mulai Tanggal', formatDateSafe(report.kontrak?.tgl_spmk)]);
    sheet2Data.push(['Tahun Anggaran', report.kegiatan?.tahun_anggaran || new Date().getFullYear(), '', '', 's/d Tanggal', formatDateSafe(report.kontrak?.tgl_selesai)]);
    sheet2Data.push(['Kontraktor Pelaksana', report.penyedia?.nama || '-', '', '', 'Waktu Pelaksanaan', '- Hari Kalender']);
    sheet2Data.push(['', '', '', '', 'Sisa Waktu', '- Hari Kalender']);
    sheet2Data.push([]);

    // Headers
    sheet2Data.push(['NO', 'URAIAN PEKERJAAN', 'BOBOT (%)', 'BOBOT MINGGU LALU (%)', 'BOBOT MINGGU INI (%)', 'BOBOT S/D MINGGU INI (%)']);

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
    sheet3Data.push(['KEGIATAN', report.kegiatan?.nama_kegiatan || '-', '', '', 'Nomor', report.kontrak?.spmk || '-']);
    sheet3Data.push(['PEKERJAAN', report.pekerjaan.nama || '-', '', '', 'Minggu ke', weekCount]);
    sheet3Data.push(['LOKASI', lokasiFormatted, '', '', 'Tanggal', formatDateSafe(report.kontrak?.tgl_spmk, new Date().toLocaleDateString('id-ID'))]);
    sheet3Data.push([]);
    sheet3Data.push(['Telah Melaksanakan Pekerjaan Pelaksanaan Untuk :']);
    sheet3Data.push(['a.', 'Pekerjaan', report.pekerjaan.nama || '-']);
    sheet3Data.push(['b.', 'Lokasi', lokasiFormatted]);
    sheet3Data.push(['c.', 'Nomor DPA dan Tanggal', `Nomor: ${dpaData.nomorDpa || '-'} | Tanggal: ${dpaData.tanggalDpa ? new Date(dpaData.tanggalDpa).toLocaleDateString('id-ID') : '-'}`]);
    sheet3Data.push(['d.', 'Departemen / Lembaga', '-']);
    sheet3Data.push(['e.', 'Kontraktor / Pelaksana', report.penyedia?.nama || '-']);
    sheet3Data.push(['f.', 'Kontrak Nomor', `${report.kontrak?.spk || '-'} / ${formatDateSafe(report.kontrak?.tgl_spk)}`]);
    sheet3Data.push(['g.', 'Harga Pelaksanaan', `Rp${new Intl.NumberFormat('id-ID').format(totalRABValue)}`]);
    sheet3Data.push(['h.', 'Sumber Dana', report.kegiatan?.sumber_dana || 'APBD']);
    sheet3Data.push(['i.', 'Waktu Pelaksanaan', `Tgl. Mulai: ${formatDateSafe(report.kontrak?.tgl_spmk)} | Tgl. Selesai: ${formatDateSafe(report.kontrak?.tgl_selesai)}`]);
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
                bobot.toFixed(2),
                `${item.satuan || ''} ${totalRealisasi}`,
                prosentase.toFixed(2),
                bobotHasil.toFixed(2)
            ]);
        });

        // Sub total
        sheet3Data.push([
            '',
            'SUB JUMLAH',
            '',
            subTotalBobot.toFixed(2),
            '',
            '',
            subTotalBobotHasil.toFixed(2)
        ]);
    });

    // Grand total
    sheet3Data.push([
        '',
        'JUMLAH KEMAJUAN FISIK PEKERJAAN',
        '',
        '100.00',
        '',
        '',
        grandTotalBobotHasil.toFixed(2)
    ]);

    const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
    XLSX.utils.book_append_sheet(workbook, ws3, 'Laporan Kemajuan');

    // Save file
    XLSX.writeFile(workbook, `laporan_mingguan_${report.pekerjaan.nama?.replace(/\s+/g, '_') || 'progress'}.xlsx`);
}
