import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SignatureData, DpaData } from '../types/signature';

interface GeneratePdfProps {
    report: any;
    weekCount: number;
    signatureData: SignatureData;
    dpaData: DpaData;
}

export const generatePdf = ({ report, weekCount, signatureData, dpaData }: GeneratePdfProps) => {
    if (!report) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper: Calculate report date based on week number from SPMK
    const getReportDate = () => {
        if (!report.kontrak?.tgl_spmk) return new Date();
        const spmkDate = new Date(report.kontrak.tgl_spmk);
        const reportDate = new Date(spmkDate);
        reportDate.setDate(spmkDate.getDate() + (weekCount * 7));
        return reportDate;
    };

    // Helper: Calculate waktu pelaksanaan in days
    const getWaktuPelaksanaan = () => {
        if (!report.kontrak?.tgl_spmk || !report.kontrak?.tgl_selesai) return 0;
        const start = new Date(report.kontrak.tgl_spmk);
        const end = new Date(report.kontrak.tgl_selesai);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Helper: Calculate remaining days
    const getSisaWaktu = () => {
        if (!report.kontrak?.tgl_selesai) return 0;
        const today = getReportDate();
        const end = new Date(report.kontrak.tgl_selesai);
        const diffTime = end.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    };

    const reportDate = getReportDate();
    const waktuPelaksanaan = getWaktuPelaksanaan();
    const sisaWaktu = getSisaWaktu();

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
    const page1LokasiText = report.pekerjaan.desa_nama && report.pekerjaan.kecamatan_nama
        ? `Desa ${report.pekerjaan.desa_nama} Kecamatan ${report.pekerjaan.kecamatan_nama}`
        : report.pekerjaan.lokasi || '-';
    doc.text(`: ${page1LokasiText}`, 45, headerY + 10);
    doc.text('MINGGU KE', 15, headerY + 15);
    doc.text(`: ${weekCount}`, 45, headerY + 15);
    doc.text('TANGGAL', 15, headerY + 20);
    doc.text(`: ${reportDate.toLocaleDateString('id-ID')}`, 45, headerY + 20);

    // Build table headers - Always 3 week columns
    const headers: any[][] = [[]];

    // Main header row with merged cells
    headers[0] = [
        { content: 'NO', rowSpan: 2 },
        { content: 'URAIAN PEKERJAAN', rowSpan: 2 },
        { content: 'VOLUME SATUAN', rowSpan: 2 },
        { content: 'BOBOT', rowSpan: 2 },
        { content: 'PRESTASI S/D MINGGU LALU', colSpan: 3 },
        { content: 'PRESTASI MINGGU INI', colSpan: 3 },
        { content: 'PRESTASI S/D MINGGU INI', colSpan: 3 },
    ];

    // Second header row - sub headers for each of the 3 week columns
    const secondRow: string[] = [];
    for (let i = 0; i < 3; i++) {
        secondRow.push('VOLUME SATUAN', '%', 'BOBOT');
    }
    headers.push(secondRow);

    // Build table body with grouping by nama_item
    const body: any[][] = [];

    // Group items by nama_item
    const groupedItems: { [key: string]: any[] } = {};
    report.items.forEach((item: any) => {
        const groupKey = item.nama_item || 'Lainnya';
        if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = [];
        }
        groupedItems[groupKey].push(item);
    });

    let rowNumber = 1;
    const totalCols = 4 + 9; // NO, URAIAN, VOLUME, BOBOT + 3 week columns x 3 sub-columns

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
            const targetVol = item.target_volume || 0;
            const bobot = item.bobot || 0;

            // Calculate PRESTASI S/D MINGGU LALU (accumulated up to previous week)
            let accumPrevWeek = 0;
            for (let w = 1; w < weekCount; w++) {
                accumPrevWeek += weeklyData[w]?.realisasi ?? 0;
            }
            const prevPercent = targetVol > 0 ? (accumPrevWeek / targetVol) * 100 : 0;
            const prevBobot = (prevPercent * bobot) / 100;

            row.push(
                `${accumPrevWeek} ${item.satuan || ''}`,
                Math.round(prevPercent).toFixed(2),
                Math.round(prevBobot).toFixed(2)
            );

            // Calculate PRESTASI MINGGU INI (current week only)
            const currentWeekReal = weeklyData[weekCount]?.realisasi ?? 0;
            const currentPercent = targetVol > 0 ? (currentWeekReal / targetVol) * 100 : 0;
            const currentBobot = (currentPercent * bobot) / 100;

            row.push(
                `${currentWeekReal} ${item.satuan || ''}`,
                Math.round(currentPercent).toFixed(2),
                Math.round(currentBobot).toFixed(2)
            );

            // Calculate PRESTASI S/D MINGGU INI (total accumulated)
            const totalAccum = accumPrevWeek + currentWeekReal;
            const totalPercent = targetVol > 0 ? (totalAccum / targetVol) * 100 : 0;
            const totalBobot = (totalPercent * bobot) / 100;

            row.push(
                `${totalAccum} ${item.satuan || ''}`,
                Math.round(totalPercent).toFixed(2),
                Math.round(totalBobot).toFixed(2)
            );

            body.push(row);
        });
    });

    // Add totals row
    const totalRow: any[] = ['', 'TOTAL', '', Math.round(report.totals.total_bobot || 0).toFixed(2)];

    // Calculate totals for MINGGU LALU
    let totalPrevBobot = 0;
    report.items.forEach((item: any) => {
        const weeklyData = item.weekly_data ?? {};
        let accumPrev = 0;
        for (let w = 1; w < weekCount; w++) {
            accumPrev += weeklyData[w]?.realisasi ?? 0;
        }
        const targetVol = item.target_volume || 0;
        const prevPercent = targetVol > 0 ? (accumPrev / targetVol) * 100 : 0;
        totalPrevBobot += (prevPercent * (item.bobot || 0)) / 100;
    });
    totalRow.push('', '', Math.round(totalPrevBobot).toFixed(2));

    // Calculate totals for MINGGU INI
    let totalCurrentBobot = 0;
    report.items.forEach((item: any) => {
        const weeklyData = item.weekly_data ?? {};
        const currentReal = weeklyData[weekCount]?.realisasi ?? 0;
        const targetVol = item.target_volume || 0;
        const currentPercent = targetVol > 0 ? (currentReal / targetVol) * 100 : 0;
        totalCurrentBobot += (currentPercent * (item.bobot || 0)) / 100;
    });
    totalRow.push('', '', Math.round(totalCurrentBobot).toFixed(2));

    // Calculate grand total S/D MINGGU INI
    let page1GrandTotalBobot = 0;
    report.items.forEach((item: any) => {
        const weeklyData = item.weekly_data ?? {};
        let totalAccum = 0;
        for (let w = 1; w <= weekCount; w++) {
            totalAccum += weeklyData[w]?.realisasi ?? 0;
        }
        const targetVol = item.target_volume || 0;
        const totalPercent = targetVol > 0 ? (totalAccum / targetVol) * 100 : 0;
        page1GrandTotalBobot += (totalPercent * (item.bobot || 0)) / 100;
    });
    totalRow.push('', '', Math.round(page1GrandTotalBobot).toFixed(2));

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
    const lineHeight = 4; // Height per line of text

    // Track current Y position for dynamic layout
    let currentY = rekapHeaderY;

    doc.text('Kegiatan', 15, currentY);
    const kegiatanText = doc.splitTextToSize(`: ${report.kegiatan?.nama_kegiatan || '-'}`, leftMaxWidth);
    kegiatanText.forEach((line: string, idx: number) => {
        doc.text(line, leftValueX, currentY + (idx * lineHeight));
    });
    currentY += Math.max(kegiatanText.length * lineHeight, 5);

    doc.text('Sub Kegiatan', 15, currentY);
    const subKegText = doc.splitTextToSize(`: ${report.kegiatan?.nama_sub_kegiatan || '-'}`, leftMaxWidth);
    subKegText.forEach((line: string, idx: number) => {
        doc.text(line, leftValueX, currentY + (idx * lineHeight));
    });
    currentY += Math.max(subKegText.length * lineHeight, 5);

    doc.text('Pekerjaan', 15, currentY);
    const pekerjaanText = doc.splitTextToSize(`: ${report.pekerjaan.nama || '-'}`, leftMaxWidth);
    pekerjaanText.forEach((line: string, idx: number) => {
        doc.text(line, leftValueX, currentY + (idx * lineHeight));
    });
    currentY += Math.max(pekerjaanText.length * lineHeight, 5);

    doc.text('Lokasi', 15, currentY);
    const rekapLokasiText = report.pekerjaan.desa_nama && report.pekerjaan.kecamatan_nama
        ? `Desa ${report.pekerjaan.desa_nama} Kecamatan ${report.pekerjaan.kecamatan_nama}`
        : report.pekerjaan.lokasi || '-';
    doc.text(`: ${rekapLokasiText}`, leftValueX, currentY);
    currentY += 5;

    doc.text('Tahun Anggaran', 15, currentY);
    doc.text(`: ${report.kegiatan?.tahun_anggaran || new Date().getFullYear()}`, leftValueX, currentY);
    currentY += 5;

    doc.text('Kontraktor Pelaksana', 15, currentY);
    doc.text(`: ${report.penyedia?.nama || '-'}`, leftValueX, currentY);
    currentY += 5;

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
    doc.text(`: ${waktuPelaksanaan} Hari Kalender`, rightValueX, rekapHeaderY + 25);
    doc.text('Sisa Waktu', rightLabelX, rekapHeaderY + 30);
    doc.text(`: ${sisaWaktu} Hari Kalender`, rightValueX, rekapHeaderY + 30);

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

    // Calculate rencana for comparison
    report.items.forEach((item: any) => {
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

    // Check if there's enough space for signatures
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
    const instansiLines = doc.splitTextToSize(signatureData.instansiMengetahui, 60);
    instansiLines.forEach((line: string, idx: number) => {
        doc.text(line, col1X, signatureStartY + 9 + (idx * 4));
    });

    const nameY1 = signatureStartY + 35;
    doc.setFont('helvetica', 'bold');
    if (signatureData.namaMengetahui) {
        doc.text(signatureData.namaMengetahui.toUpperCase(), col1X, nameY1);
        doc.line(col1X - 5, nameY1 + 1, col1X + 55, nameY1 + 1);
    }
    doc.setFont('helvetica', 'normal');
    if (signatureData.nipMengetahui) {
        doc.text(`NIP. ${signatureData.nipMengetahui}`, col1X, nameY1 + 5);
    }

    // Kolom Tengah - Diperiksa
    doc.text('Diperiksa :', col2X, signatureStartY);
    doc.text(signatureData.jabatanDiperiksa, col2X, signatureStartY + 5);

    doc.setFont('helvetica', 'bold');
    if (signatureData.namaDiperiksa) {
        doc.text(signatureData.namaDiperiksa.toUpperCase(), col2X, nameY1);
        doc.line(col2X - 5, nameY1 + 1, col2X + 55, nameY1 + 1);
    }
    doc.setFont('helvetica', 'normal');
    if (signatureData.nipDiperiksa) {
        doc.text(`NIP. ${signatureData.nipDiperiksa}`, col2X, nameY1 + 5);
    }

    // Kolom Kanan - Dibuat oleh
    doc.setTextColor(128, 0, 0);
    doc.text(`${signatureData.lokasi},`, col3X, signatureStartY);
    doc.text(signatureData.tanggal, col3X + 30, signatureStartY);
    doc.setTextColor(0, 0, 0);
    doc.text('Dibuat oleh :', col3X, signatureStartY + 5);
    if (signatureData.namaPerusahaan) {
        doc.setFont('helvetica', 'bold');
        doc.text(signatureData.namaPerusahaan, col3X, signatureStartY + 10);
        doc.setFont('helvetica', 'normal');
    }

    doc.setFont('helvetica', 'bold');
    if (signatureData.namaDirektur) {
        doc.text(signatureData.namaDirektur.toUpperCase(), col3X, nameY1);
        doc.line(col3X - 5, nameY1 + 1, col3X + 55, nameY1 + 1);
    }
    doc.setFont('helvetica', 'normal');
    doc.text('Direktur', col3X, nameY1 + 5);

    // ============ PAGE 3: LAPORAN KEMAJUAN PELAKSANAAN PEKERJAAN ============
    doc.addPage();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 128);
    doc.text('LAPORAN KEMAJUAN PELAKSANAAN PEKERJAAN', pageWidth - 15, 15, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    doc.setDrawColor(0, 0, 128);
    doc.setLineWidth(0.3);
    doc.rect(15, 20, 135, 28);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const kemajuanY = 26;
    const p3LeftMaxWidth = 95;
    const p3LineHeight = 3;

    let p3CurrentY = kemajuanY;

    doc.text('SUB KEGIATAN', 18, p3CurrentY);
    const p3KegText = doc.splitTextToSize(`: ${report.kegiatan?.nama_sub_kegiatan || '-'}`, p3LeftMaxWidth);
    p3KegText.forEach((line: string, idx: number) => {
        doc.text(line, 45, p3CurrentY + (idx * p3LineHeight));
    });
    p3CurrentY += Math.max(p3KegText.length * p3LineHeight, 8);

    doc.text('PEKERJAAN', 18, p3CurrentY);
    const p3PekText = doc.splitTextToSize(`: ${report.pekerjaan.nama || '-'}`, p3LeftMaxWidth);
    p3PekText.forEach((line: string, idx: number) => {
        doc.text(line, 45, p3CurrentY + (idx * p3LineHeight));
    });
    p3CurrentY += Math.max(p3PekText.length * p3LineHeight, 8);

    doc.text('LOKASI', 18, p3CurrentY);
    const lokasiText = report.pekerjaan.desa_nama && report.pekerjaan.kecamatan_nama
        ? `Desa ${report.pekerjaan.desa_nama} Kecamatan ${report.pekerjaan.kecamatan_nama}`
        : report.pekerjaan.lokasi || '-';
    const p3LokasiText = doc.splitTextToSize(`: ${lokasiText}`, p3LeftMaxWidth);
    p3LokasiText.forEach((line: string, idx: number) => {
        doc.text(line, 45, p3CurrentY + (idx * p3LineHeight));
    });

    doc.rect(155, 20, 125, 28);
    doc.text('Nomor', 158, kemajuanY);
    doc.text('600/BA.LPP......./2025', 180, kemajuanY);
    doc.text('Minggu ke', 158, kemajuanY + 8);
    doc.text(`: ${weekCount}`, 180, kemajuanY + 8);
    doc.text('Tanggal', 158, kemajuanY + 16);
    doc.text(`: ${reportDate.toLocaleDateString('id-ID')}`, 180, kemajuanY + 16);

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
    doc.text(lokasiText, valueX, infoStartY + 5);

    doc.text('c.', labelX, infoStartY + 10);
    doc.text('Nomor DPA dan Tanggal', labelX + 5, infoStartY + 10);
    doc.text(':', colonX, infoStartY + 10);
    doc.text(`Nomor    : ${dpaData.nomorDpa || '-'}`, valueX, infoStartY + 10);
    doc.text(`Tanggal  : ${dpaData.tanggalDpa ? new Date(dpaData.tanggalDpa).toLocaleDateString('id-ID') : '-'}`, valueX, infoStartY + 15);

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

    const totalRABValue = Math.floor(report.items.reduce((sum: number, item: any) => {
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

    const kemajuanTableY = infoStartY + 70;
    const kemajuanHeaders = [
        [
            { content: 'NO', rowSpan: 2 },
            { content: 'URAIAN PEKERJAAN', rowSpan: 2 },
            { content: 'SATUAN VOLUME', rowSpan: 2 },
            { content: 'BOBOT', rowSpan: 2 },
            { content: 'REALISASI PELAKSANAAN', colSpan: 3 }
        ],
        ['VOLUME', 'PERSENTASE (%)', 'BOBOT HASIL (%)']
    ];

    const kemajuanBody: any[][] = [];
    let kemajuanRowNum = 1;
    let grandTotalBobotHasil = 0;

    Object.entries(groupedItems).forEach(([groupName, items], groupIndex) => {
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
            grandTotalBobotHasil += bobotHasil;

            kemajuanBody.push([
                kemajuanRowNum++,
                { content: item.rincian_item || '-', styles: { halign: 'left' } },
                `${item.satuan || ''} ${item.target_volume || 0}`,
                bobot.toFixed(2),
                `${item.satuan || ''} ${totalRealisasi}`,
                prosentase.toFixed(2),
                bobotHasil.toFixed(2)
            ]);
        });

        kemajuanBody.push([
            '',
            { content: 'SUB JUMLAH', styles: { fontStyle: 'bold' } },
            '',
            { content: subTotalBobot.toFixed(2), styles: { fontStyle: 'bold' } },
            '',
            '',
            { content: subTotalBobotHasil.toFixed(2), styles: { fontStyle: 'bold' } }
        ]);
    });

    kemajuanBody.push([
        '',
        { content: 'JUMLAH KEMAJUAN FISIK PEKERJAAN', styles: { fontStyle: 'bold', fillColor: [255, 255, 200] } },
        '',
        { content: '100.00', styles: { fontStyle: 'bold', fillColor: [255, 255, 200] } },
        '',
        '',
        { content: grandTotalBobotHasil.toFixed(2), styles: { fontStyle: 'bold', fillColor: [255, 255, 200] } }
    ]);

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

    const kemajuanFinalY = (doc as any).lastAutoTable.finalY + 15;
    let sigY3 = kemajuanFinalY;
    if (kemajuanFinalY > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        sigY3 = 30;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const p3col1X = 30;
    const p3col2X = 130;
    const p3col3X = 220;

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

    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob, '_blank');
};
