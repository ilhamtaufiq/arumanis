import type { Output } from '@/features/output/types';
import { FOTO_PROGRESS_LEVELS, getFotoFileColumnName } from './foto-progress-levels';

export type PenerimaImportProfileType = 'unit' | 'komunal';

export interface PenerimaImportProfile {
    komponenId: number;
    komponen: string;
    satuan: string;
    volume: number;
    type: PenerimaImportProfileType;
    targetRows: number;
}

export function getPenerimaImportProfile(output: Output): PenerimaImportProfile {
    const volume = Math.max(1, Math.round(output.volume || 1));
    const isUnitSatuan = output.satuan?.toLowerCase() === 'unit';

    if (output.penerima_is_optional) {
        return {
            komponenId: output.id,
            komponen: output.komponen,
            satuan: output.satuan,
            volume: output.volume,
            type: 'komunal',
            targetRows: isUnitSatuan ? volume : 1,
        };
    }

    return {
        komponenId: output.id,
        komponen: output.komponen,
        satuan: output.satuan,
        volume: output.volume,
        type: 'unit',
        targetRows: isUnitSatuan ? volume : volume,
    };
}

export function getFotoImportHeaders(): string[] {
    return FOTO_PROGRESS_LEVELS.map((level) => getFotoFileColumnName(level));
}

export function getUnitImportHeaders(): string[] {
    return [
        'no',
        'nama',
        'nik',
        'alamat',
        'jumlah_jiwa',
        'latitude',
        'longitude',
        ...getFotoImportHeaders(),
    ];
}

export function getKomunalImportHeaders(): string[] {
    return [
        'no',
        'unit_index',
        'label',
        'latitude',
        'longitude',
        ...getFotoImportHeaders(),
    ];
}

export function sanitizeSheetName(name: string): string {
    const cleaned = name.replace(/[\\/?*[\]:]/g, ' ').trim();
    return cleaned.slice(0, 31) || 'Komponen';
}