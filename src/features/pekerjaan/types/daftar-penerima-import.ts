import type { FotoProgressLevel } from '../utils/foto-progress-levels';
import type { PenerimaImportProfile } from '../utils/penerima-import-profile';

export interface ParsedFotoSlot {
    level: FotoProgressLevel;
    namaFile: string;
    imageFile: File | null;
    imagePreviewUrl: string | null;
}

export interface ParsedPenerimaRow {
    no?: number;
    nama: string;
    alamat: string;
    jumlah_jiwa: number;
    nik: string;
    koordinat: string;
    /** @deprecated Gunakan fotoSlots — alias kolom nama_file_foto (0%) */
    namaFileFoto: string;
    unitIndex?: number;
    /** @deprecated Gunakan fotoSlots — slot 0% */
    imageFile: File | null;
    /** @deprecated Gunakan fotoSlots — slot 0% */
    imagePreviewUrl: string | null;
    fotoSlots: ParsedFotoSlot[];
    warnings: string[];
    isValid: boolean;
}

export interface ParsePenerimaExcelResult {
    rows: ParsedPenerimaRow[];
    profile: PenerimaImportProfile | null;
    totalImages: number;
    warnings: string[];
}

export interface ImportPenerimaProgress {
    phase: 'penerima' | 'foto';
    current: number;
    total: number;
    level?: string;
}

export interface ImportPenerimaResult {
    penerimaCreated: number;
    fotoCreated: number;
    penerimaFailed: number;
    fotoFailed: number;
    errors: string[];
}