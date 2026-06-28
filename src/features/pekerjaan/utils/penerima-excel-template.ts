import * as XLSX from 'xlsx';
import type { Output } from '@/features/output/types';
import {
    getFotoImportHeaders,
    getKomunalImportHeaders,
    getPenerimaImportProfile,
    getUnitImportHeaders,
    sanitizeSheetName,
    type PenerimaImportProfile,
} from './penerima-import-profile';
import { FOTO_PROGRESS_LEVELS } from './foto-progress-levels';

function buildInfoRows(profile: PenerimaImportProfile) {
    return [
        ['komponen_id', 'komponen', 'satuan', 'volume', 'tipe_import', 'target_baris'],
        [
            profile.komponenId,
            profile.komponen,
            profile.satuan,
            profile.volume,
            profile.type,
            profile.targetRows,
        ],
    ];
}

function buildFotoNamesForRow(rowNo: number): string[] {
    const prefix = String(rowNo).padStart(3, '0');
    return FOTO_PROGRESS_LEVELS.map((level) => `${prefix}_${level.replace('%', '')}.jpg`);
}

function buildUnitSampleRows(profile: PenerimaImportProfile) {
    const examples = [
        [1, 'Arhan', '3203320508910001', 'Kp. Bojong Jati RT 01/02', 4, -7.238694, 107.154107, ...buildFotoNamesForRow(1)],
        [2, 'Samsulhari', '3203190705940003', 'Kp. Bojong Jati RT 02/02', 4, -7.238773, 107.154328, ...buildFotoNamesForRow(2)],
        [3, 'Wisnu', '3203321207790001', 'Kp. Bojong Jati RT 02/02', 3, -7.238889, 107.154502, ...buildFotoNamesForRow(3)],
    ];

    const rows = examples.slice(0, Math.min(3, profile.targetRows));
    for (let index = rows.length; index < profile.targetRows; index += 1) {
        const no = index + 1;
        rows.push([no, '', '', '', 1, '', '', ...buildFotoNamesForRow(no).map(() => '')]);
    }

    return rows;
}

function buildKomunalSampleRows(profile: PenerimaImportProfile) {
    const rows: Array<Array<string | number>> = [];
    for (let index = 0; index < profile.targetRows; index += 1) {
        const unitIndex = index + 1;
        rows.push([
            unitIndex,
            unitIndex,
            profile.targetRows > 1 ? `Unit ${unitIndex}` : 'Output Komunal',
            '',
            '',
            ...buildFotoNamesForRow(unitIndex),
        ]);
    }
    return rows;
}

function buildGuideRows(profile: PenerimaImportProfile): string[][] {
    if (profile.type === 'komunal') {
        return [
            [`TEMPLATE IMPORT KOMUNAL — ${profile.komponen}`],
            [''],
            ['Komponen komunal tidak membutuhkan NIK, alamat, atau jumlah jiwa.'],
            ['Isi koordinat dan foto per unit sesuai volume komponen.'],
            [''],
            ['Kolom wajib:', 'unit_index, latitude, longitude (jika import foto)'],
            ['Kolom opsional:', `no, label, ${getFotoImportHeaders().join(', ')}`],
            ['Foto progress:', '0%, 25%, 50%, 75%, 100% — isi kolom sesuai level yang tersedia di ZIP'],
            [`Target baris/unit: ${profile.targetRows} (${profile.volume} ${profile.satuan})`],
            [''],
            ['1. Jangan ubah sheet Info dan nama kolom di sheet Data.'],
            ['2. unit_index harus unik dari 1 sampai target baris.'],
            ['3. ZIP foto opsional; contoh nama: 001_0.jpg, 001_25.jpg, 001_50.jpg, 001_75.jpg, 001_100.jpg'],
            ['4. Kolom lama nama_file_foto masih diterima sebagai alias foto 0%.'],
        ];
    }

    return [
        [`TEMPLATE IMPORT UNIT — ${profile.komponen}`],
        [''],
        ['Gunakan template ini untuk komponen per-penerima seperti sambungan rumah.'],
        [''],
        ['Kolom wajib:', 'nama, jumlah_jiwa'],
        ['Kolom opsional:', `no, nik, alamat, latitude, longitude, ${getFotoImportHeaders().join(', ')}`],
        ['Foto progress:', '0%, 25%, 50%, 75%, 100% — koordinat baris dipakai untuk semua level'],
        [`Target baris penerima: ${profile.targetRows} (${profile.volume} ${profile.satuan})`],
        [''],
        ['1. Jangan ubah sheet Info dan nama kolom di sheet Data.'],
        ['2. NIK ditulis 16 digit tanpa spasi.'],
        ['3. Isi baris sesuai jumlah unit/volume komponen.'],
        ['4. ZIP foto opsional; contoh: 001_0.jpg, 001_25.jpg, dst.'],
        ['5. Kolom lama nama_file_foto masih diterima sebagai alias foto 0%.'],
    ];
}

function appendDataSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
    headers: string[],
    rows: Array<Array<string | number>>,
) {
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    sheet['!cols'] = headers.map((header) => {
        if (header === 'alamat' || header === 'label') return { wch: 36 };
        if (header === 'nama') return { wch: 24 };
        if (header === 'nik') return { wch: 18 };
        return { wch: 14 };
    });
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
}

function buildWorkbookForProfile(profile: PenerimaImportProfile): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    const infoSheet = XLSX.utils.aoa_to_sheet(buildInfoRows(profile));
    infoSheet['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');

    if (profile.type === 'komunal') {
        appendDataSheet(
            workbook,
            'Data',
            getKomunalImportHeaders(),
            buildKomunalSampleRows(profile),
        );
    } else {
        appendDataSheet(
            workbook,
            'Data',
            getUnitImportHeaders(),
            buildUnitSampleRows(profile),
        );
    }

    const guideSheet = XLSX.utils.aoa_to_sheet(buildGuideRows(profile));
    guideSheet['!cols'] = [{ wch: 90 }];
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'Petunjuk');

    return workbook;
}

export function downloadPenerimaImportTemplate(output: Output): void {
    const profile = getPenerimaImportProfile(output);
    const workbook = buildWorkbookForProfile(profile);
    const slug = sanitizeSheetName(profile.komponen).replace(/\s+/g, '_').toLowerCase();
    XLSX.writeFile(workbook, `template_import_${slug}.xlsx`);
}

export function downloadAllPenerimaImportTemplates(outputs: Output[]): void {
    if (outputs.length === 0) {
        return;
    }

    if (outputs.length === 1) {
        downloadPenerimaImportTemplate(outputs[0]);
        return;
    }

    const workbook = XLSX.utils.book_new();
    const summaryRows = [['komponen_id', 'komponen', 'satuan', 'volume', 'tipe_import', 'target_baris', 'sheet_data']];

    outputs.forEach((output) => {
        const profile = getPenerimaImportProfile(output);
        const dataSheetName = sanitizeSheetName(profile.komponen);
        summaryRows.push([
            profile.komponenId,
            profile.komponen,
            profile.satuan,
            profile.volume,
            profile.type,
            profile.targetRows,
            dataSheetName,
        ]);

        const headers = profile.type === 'komunal'
            ? getKomunalImportHeaders()
            : getUnitImportHeaders();
        const rows = profile.type === 'komunal'
            ? buildKomunalSampleRows(profile)
            : buildUnitSampleRows(profile);

        appendDataSheet(workbook, dataSheetName, headers, rows);
    });

    const indexSheet = XLSX.utils.aoa_to_sheet(summaryRows);
    indexSheet['!cols'] = [{ wch: 12 }, { wch: 28 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(workbook, indexSheet, 'Info');

    const guideSheet = XLSX.utils.aoa_to_sheet([
        ['TEMPLATE IMPORT SEMUA KOMPONEN'],
        [''],
        ['Setiap komponen memiliki sheet data sendiri.'],
        ['Isi sheet sesuai tipe_import di sheet Info:'],
        ['- unit: butuh nama, jumlah_jiwa, opsional nik/alamat/koordinat/foto'],
        ['- komunal: butuh unit_index + koordinat/foto, tanpa nik/alamat/jiwa'],
        [''],
        ['Saat import di aplikasi, pilih komponen yang sama dengan sheet yang diisi.'],
    ]);
    guideSheet['!cols'] = [{ wch: 90 }];
    XLSX.utils.book_append_sheet(workbook, guideSheet, 'Petunjuk');

    XLSX.writeFile(workbook, 'template_import_semua_komponen.xlsx');
}

export { buildWorkbookForProfile };