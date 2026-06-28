import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import type { ParsePenerimaExcelResult, ParsedFotoSlot, ParsedPenerimaRow } from '../types/daftar-penerima-import';
import type { PenerimaImportProfile } from './penerima-import-profile';
import { getPenerimaImportProfile } from './penerima-import-profile';
import type { Output } from '@/features/output/types';
import {
    FOTO_FILE_COLUMN_ALIASES,
    FOTO_PROGRESS_LEVELS,
    type FotoProgressLevel,
} from './foto-progress-levels';

async function readBlobBuffer(blob: Blob): Promise<ArrayBuffer> {
    if (typeof blob.arrayBuffer === 'function') {
        try {
            return await blob.arrayBuffer();
        } catch {
            // Continue to FileReader fallback below.
        }
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error ?? new Error('Gagal membaca file'));
        reader.readAsArrayBuffer(blob);
    });
}

type RowInput = {
    no?: string | number;
    nama?: string;
    nik?: string;
    alamat?: string;
    jumlah_jiwa?: string | number;
    latitude?: string | number;
    longitude?: string | number;
    unit_index?: string | number;
    label?: string;
    fotoByLevel: Partial<Record<FotoProgressLevel, string>>;
};

const BASE_HEADER_ALIASES: Record<string, keyof Omit<RowInput, 'fotoByLevel'>> = {
    no: 'no',
    nama: 'nama',
    'nama penerima': 'nama',
    label: 'label',
    nik: 'nik',
    alamat: 'alamat',
    jumlah_jiwa: 'jumlah_jiwa',
    'jumlah jiwa': 'jumlah_jiwa',
    'banyak jiwa': 'jumlah_jiwa',
    latitude: 'latitude',
    lat: 'latitude',
    longitude: 'longitude',
    long: 'longitude',
    lng: 'longitude',
    unit_index: 'unit_index',
    'unit index': 'unit_index',
    unit: 'unit_index',
};

function normalizeHeader(value: unknown): string {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function normalizeNik(raw: string): string {
    return raw.replace(/\D/g, '').slice(0, 16);
}

function parseNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
}

function buildKoordinat(latitude: number | null, longitude: number | null): string {
    if (latitude === null || longitude === null) {
        return '';
    }
    return `${latitude}, ${longitude}`;
}

function readProfileFromInfoSheet(sheet: XLSX.WorkSheet | undefined): PenerimaImportProfile | null {
    if (!sheet) {
        return null;
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    const info = rows[0];
    if (!info) {
        return null;
    }

    const komponenId = parseNumber(info.komponen_id);
    const type = String(info.tipe_import ?? '').toLowerCase();
    if (!komponenId || (type !== 'unit' && type !== 'komunal')) {
        return null;
    }

    return {
        komponenId,
        komponen: String(info.komponen ?? ''),
        satuan: String(info.satuan ?? ''),
        volume: parseNumber(info.volume) ?? 0,
        type,
        targetRows: parseNumber(info.target_baris) ?? Math.max(1, Math.round(parseNumber(info.volume) ?? 1)),
    };
}

function mapHeaderToField(header: string): { kind: 'base'; field: keyof Omit<RowInput, 'fotoByLevel'> } | { kind: 'foto'; level: FotoProgressLevel } | null {
    const normalized = normalizeHeader(header);
    const baseField = BASE_HEADER_ALIASES[normalized];
    if (baseField) {
        return { kind: 'base', field: baseField };
    }

    const fotoAlias = FOTO_FILE_COLUMN_ALIASES[normalized];
    if (fotoAlias === 'legacy') {
        return { kind: 'foto', level: '0%' };
    }
    if (fotoAlias) {
        return { kind: 'foto', level: fotoAlias };
    }

    return null;
}

function mapSheetRows(sheet: XLSX.WorkSheet, profile: PenerimaImportProfile | null): RowInput[] {
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
        raw: false,
    });

    if (rawRows.length === 0) {
        return [];
    }

    const baseFields = new Set<keyof Omit<RowInput, 'fotoByLevel'>>();
    const fotoFields = new Map<string, FotoProgressLevel>();

    Object.keys(rawRows[0]).forEach((header) => {
        const mapped = mapHeaderToField(header);
        if (!mapped) {
            return;
        }
        if (mapped.kind === 'base') {
            baseFields.add(mapped.field);
            return;
        }
        fotoFields.set(header, mapped.level);
    });

    const requiredField = profile?.type === 'komunal' ? 'unit_index' : 'nama';
    if (!baseFields.has(requiredField)) {
        throw new Error(`Kolom "${requiredField}" tidak ditemukan. Gunakan template Excel komponen yang sesuai.`);
    }

    return rawRows
        .map((rawRow) => {
            const mapped: RowInput = { fotoByLevel: {} };
            Object.entries(rawRow).forEach(([header, value]) => {
                if (value === '' || value === null || value === undefined) {
                    return;
                }

                const fieldMapping = mapHeaderToField(header);
                if (!fieldMapping) {
                    return;
                }

                if (fieldMapping.kind === 'base') {
                    mapped[fieldMapping.field] = value as never;
                    return;
                }

                const trimmed = String(value).trim();
                if (trimmed) {
                    mapped.fotoByLevel[fieldMapping.level] = trimmed;
                }
            });
            return mapped;
        })
        .filter((row) => Object.keys(row.fotoByLevel).length > 0 || Object.keys(row).some((key) => key !== 'fotoByLevel'));
}

function buildFotoSlots(
    fotoByLevel: Partial<Record<FotoProgressLevel, string>>,
    imageFiles: Map<string, File>,
    warnings: string[],
    hasKoordinat: boolean,
): ParsedFotoSlot[] {
    return FOTO_PROGRESS_LEVELS.map((level) => {
        const namaFile = String(fotoByLevel[level] ?? '').trim();
        const imageFile = namaFile ? imageFiles.get(namaFile.toLowerCase()) ?? null : null;

        if (namaFile && !hasKoordinat) {
            warnings.push(`Koordinat belum diisi untuk foto ${level}`);
        }
        if (namaFile && !imageFile) {
            warnings.push(`Foto ${level} "${namaFile}" tidak ditemukan di ZIP`);
        }

        const imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : null;

        return {
            level,
            namaFile,
            imageFile,
            imagePreviewUrl,
        };
    }).filter((slot) => slot.namaFile);
}

function buildRow(
    input: RowInput,
    imageFiles: Map<string, File>,
    profile: PenerimaImportProfile | null,
): ParsedPenerimaRow {
    const isKomunal = profile?.type === 'komunal';
    const unitIndex = parseNumber(input.unit_index) ?? parseNumber(input.no) ?? undefined;
    const label = String(input.label ?? '').trim();
    const namaInput = String(input.nama ?? '').trim();
    const nama = isKomunal
        ? (label || namaInput || (unitIndex ? `Unit ${unitIndex}` : ''))
        : namaInput;
    const alamat = isKomunal ? '' : String(input.alamat ?? '').trim();
    const nik = isKomunal ? '' : normalizeNik(String(input.nik ?? ''));
    const jumlah_jiwa = isKomunal ? 1 : Math.max(1, parseNumber(input.jumlah_jiwa) ?? 1);
    const latitude = parseNumber(input.latitude);
    const longitude = parseNumber(input.longitude);
    const koordinat = buildKoordinat(latitude, longitude);
    const warnings: string[] = [];

    if (!nama && !unitIndex) {
        warnings.push(isKomunal ? 'Unit index kosong' : 'Nama kosong');
    }
    if (!isKomunal && nik && nik.length !== 16) {
        warnings.push(`NIK tidak 16 digit (${nik.length})`);
    }

    const fotoSlots = buildFotoSlots(input.fotoByLevel, imageFiles, warnings, !!koordinat);
    const slot0 = fotoSlots.find((slot) => slot.level === '0%');

    return {
        no: parseNumber(input.no) ?? undefined,
        nama,
        alamat,
        jumlah_jiwa,
        nik,
        koordinat,
        namaFileFoto: slot0?.namaFile ?? '',
        unitIndex,
        imageFile: slot0?.imageFile ?? null,
        imagePreviewUrl: slot0?.imagePreviewUrl ?? null,
        fotoSlots,
        warnings,
        isValid: isKomunal ? unitIndex !== undefined : !!nama,
    };
}

async function loadImageFilesFromZip(zipFile: File | null): Promise<Map<string, File>> {
    const imageMap = new Map<string, File>();
    if (!zipFile) {
        return imageMap;
    }

    const zip = await JSZip.loadAsync(await readBlobBuffer(zipFile));
    const imageEntries = Object.entries(zip.files).filter(([, entry]) => {
        if (entry.dir) {
            return false;
        }
        return /\.(jpe?g|png|webp)$/i.test(entry.name);
    });

    for (const [path, entry] of imageEntries) {
        const blob = await entry.async('blob');
        const filename = path.split('/').pop() ?? path;
        const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
        imageMap.set(filename.toLowerCase(), file);
    }

    return imageMap;
}

function resolveDataSheet(
    workbook: XLSX.WorkBook,
    profile: PenerimaImportProfile | null,
    selectedOutput?: Output,
): string {
    if (selectedOutput) {
        const selectedProfile = getPenerimaImportProfile(selectedOutput);
        const matchingSheet = workbook.SheetNames.find(
            (name) => name.toLowerCase() === selectedProfile.komponen.toLowerCase(),
        );
        if (matchingSheet) {
            return matchingSheet;
        }
    }

    const preferredNames = ['data', 'penerima'];
    const matched = workbook.SheetNames.find((name) => preferredNames.includes(name.toLowerCase()));
    if (matched) {
        return matched;
    }

    if (profile) {
        const profileSheet = workbook.SheetNames.find(
            (name) => name.toLowerCase() === profile.komponen.toLowerCase(),
        );
        if (profileSheet) {
            return profileSheet;
        }
    }

    return workbook.SheetNames.find((name) => name.toLowerCase() !== 'info' && name.toLowerCase() !== 'petunjuk')
        ?? workbook.SheetNames[0];
}

function appendVolumeWarnings(
    warnings: string[],
    rows: ParsedPenerimaRow[],
    profile: PenerimaImportProfile | null,
) {
    if (!profile) {
        return;
    }

    const filledRows = rows.filter((row) => row.isValid);
    if (filledRows.length < profile.targetRows) {
        warnings.push(`Baris terisi ${filledRows.length}, target ${profile.targetRows}.`);
    }
    if (filledRows.length > profile.targetRows) {
        warnings.push(`Baris terisi ${filledRows.length} melebihi target ${profile.targetRows}.`);
    }
}

export function revokeParsedRowPreviews(rows: ParsedPenerimaRow[]): void {
    rows.forEach((row) => {
        row.fotoSlots.forEach((slot) => {
            if (slot.imagePreviewUrl) {
                URL.revokeObjectURL(slot.imagePreviewUrl);
            }
        });
    });
}

export function countReadyFotoSlots(rows: ParsedPenerimaRow[]): number {
    return rows.reduce((total, row) => {
        if (!row.koordinat) {
            return total;
        }
        return total + row.fotoSlots.filter((slot) => slot.imageFile).length;
    }, 0);
}

export async function parsePenerimaExcelFile(
    excelFile: File,
    zipFile?: File | null,
    selectedOutput?: Output,
): Promise<ParsePenerimaExcelResult> {
    const workbook = XLSX.read(await readBlobBuffer(excelFile), { type: 'array' });
    const infoProfile = readProfileFromInfoSheet(workbook.Sheets.Info);
    const profile = selectedOutput
        ? getPenerimaImportProfile(selectedOutput)
        : infoProfile;

    if (selectedOutput && infoProfile && infoProfile.komponenId !== selectedOutput.id) {
        throw new Error('Komponen pada file Excel tidak cocok dengan komponen yang dipilih.');
    }

    const sheetName = resolveDataSheet(workbook, profile, selectedOutput);
    if (!sheetName) {
        throw new Error('Sheet Excel tidak ditemukan.');
    }

    const mappedRows = mapSheetRows(workbook.Sheets[sheetName], profile);
    if (mappedRows.length === 0) {
        throw new Error('Tidak ada baris data di Excel.');
    }

    const imageFiles = await loadImageFilesFromZip(zipFile ?? null);
    const rows = mappedRows.map((row) => buildRow(row, imageFiles, profile));
    const warnings: string[] = [];
    const totalImages = countReadyFotoSlots(rows);
    const rowsWithFotoName = rows.reduce(
        (total, row) => total + row.fotoSlots.filter((slot) => slot.namaFile).length,
        0,
    );
    const matchedImages = rows.reduce(
        (total, row) => total + row.fotoSlots.filter((slot) => slot.imageFile).length,
        0,
    );

    appendVolumeWarnings(warnings, rows, profile);

    if (zipFile && rowsWithFotoName > 0 && matchedImages === 0) {
        warnings.push('ZIP foto diunggah, tetapi tidak ada nama file yang cocok dengan kolom foto.');
    } else if (rowsWithFotoName > matchedImages) {
        warnings.push(`${rowsWithFotoName - matchedImages} slot foto memiliki nama file tanpa file di ZIP.`);
    }

    return {
        rows,
        profile,
        totalImages,
        warnings,
    };
}