export const FOTO_PROGRESS_LEVELS = ['0%', '25%', '50%', '75%', '100%'] as const;

export type FotoProgressLevel = typeof FOTO_PROGRESS_LEVELS[number];

export function isFotoProgressLevel(value: string): value is FotoProgressLevel {
    return (FOTO_PROGRESS_LEVELS as readonly string[]).includes(value);
}

export function getFotoFileColumnName(level: FotoProgressLevel): string {
    return `nama_file_foto_${level.replace('%', '')}`;
}

export function countFilledFotoSlots(
    slots: Array<{ namaFile: string; imageFile: File | null }>,
): number {
    return slots.filter((slot) => slot.imageFile && slot.namaFile).length;
}

export const FOTO_FILE_COLUMN_ALIASES: Record<string, FotoProgressLevel | 'legacy'> = {
    nama_file_foto: 'legacy',
    foto: 'legacy',
    'file foto': 'legacy',
    'nama file foto': 'legacy',
    nama_file_foto_0: '0%',
    foto_0: '0%',
    nama_file_foto_25: '25%',
    foto_25: '25%',
    nama_file_foto_50: '50%',
    foto_50: '50%',
    nama_file_foto_75: '75%',
    foto_75: '75%',
    nama_file_foto_100: '100%',
    foto_100: '100%',
};