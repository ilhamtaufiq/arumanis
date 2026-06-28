import { createPenerima } from '@/features/penerima/api';
import { createFoto } from '@/features/foto/api';
import type {
    ImportPenerimaProgress,
    ImportPenerimaResult,
    ParsedPenerimaRow,
} from '../types/daftar-penerima-import';
import type { PenerimaImportProfile } from './penerima-import-profile';
import { countReadyFotoSlots } from './parse-penerima-excel';

interface ImportPenerimaBatchOptions {
    pekerjaanId: number;
    profile: PenerimaImportProfile;
    rows: ParsedPenerimaRow[];
    importFoto: boolean;
    onProgress?: (progress: ImportPenerimaProgress) => void;
}

function getReadyFotoSlots(row: ParsedPenerimaRow) {
    if (!row.koordinat) {
        return [];
    }
    return row.fotoSlots.filter((slot) => slot.imageFile);
}

async function uploadFotoSlots({
    pekerjaanId,
    profile,
    row,
    penerimaId,
    onProgress,
    progressState,
}: {
    pekerjaanId: number;
    profile: PenerimaImportProfile;
    row: ParsedPenerimaRow;
    penerimaId?: number;
    onProgress?: (progress: ImportPenerimaProgress) => void;
    progressState: { current: number; total: number };
}): Promise<{ created: number; failed: number; errors: string[] }> {
    const readySlots = getReadyFotoSlots(row);
    const result = { created: 0, failed: 0, errors: [] as string[] };

    for (const slot of readySlots) {
        progressState.current += 1;
        onProgress?.({
            phase: 'foto',
            current: progressState.current,
            total: progressState.total,
            level: slot.level,
        });

        try {
            const formData = new FormData();
            formData.append('pekerjaan_id', pekerjaanId.toString());
            formData.append('komponen_id', profile.komponenId.toString());
            formData.append('keterangan', slot.level);
            formData.append('koordinat', row.koordinat);
            formData.append('file', slot.imageFile!);

            if (penerimaId) {
                formData.append('penerima_id', penerimaId.toString());
            }
            if (row.unitIndex) {
                formData.append('unit_index', row.unitIndex.toString());
            }

            await createFoto(formData);
            result.created += 1;
        } catch (fotoError) {
            result.failed += 1;
            const fotoMessage = fotoError instanceof Error ? fotoError.message : 'Gagal upload foto';
            result.errors.push(`${row.nama} (${slot.level}): ${fotoMessage}`);
        }
    }

    const missingSlots = row.fotoSlots.filter((slot) => slot.namaFile && !slot.imageFile);
    if (missingSlots.length > 0) {
        result.failed += missingSlots.length;
        missingSlots.forEach((slot) => {
            result.errors.push(`${row.nama} (${slot.level}): foto "${slot.namaFile}" tidak tersedia`);
        });
    }

    if (row.fotoSlots.some((slot) => slot.namaFile) && !row.koordinat) {
        result.failed += row.fotoSlots.filter((slot) => slot.namaFile).length;
        result.errors.push(`${row.nama}: koordinat tidak tersedia untuk upload foto`);
    }

    return result;
}

export async function importPenerimaBatch({
    pekerjaanId,
    profile,
    rows,
    importFoto,
    onProgress,
}: ImportPenerimaBatchOptions): Promise<ImportPenerimaResult> {
    const validRows = rows.filter((row) => row.isValid);
    const result: ImportPenerimaResult = {
        penerimaCreated: 0,
        fotoCreated: 0,
        penerimaFailed: 0,
        fotoFailed: 0,
        errors: [],
    };

    const fotoProgress = {
        current: 0,
        total: importFoto ? countReadyFotoSlots(validRows) : 0,
    };

    if (profile.type === 'komunal') {
        for (let index = 0; index < validRows.length; index += 1) {
            const row = validRows[index];
            if (!importFoto) {
                continue;
            }

            const fotoResult = await uploadFotoSlots({
                pekerjaanId,
                profile,
                row,
                onProgress,
                progressState: fotoProgress,
            });

            result.fotoCreated += fotoResult.created;
            result.fotoFailed += fotoResult.failed;
            result.errors.push(...fotoResult.errors);
        }

        return result;
    }

    for (let index = 0; index < validRows.length; index += 1) {
        const row = validRows[index];
        onProgress?.({
            phase: 'penerima',
            current: index + 1,
            total: validRows.length,
        });

        try {
            const penerimaResponse = await createPenerima({
                pekerjaan_id: pekerjaanId,
                nama: row.nama,
                jumlah_jiwa: row.jumlah_jiwa,
                nik: row.nik,
                alamat: row.alamat,
                is_komunal: false,
            });

            result.penerimaCreated += 1;
            const penerimaId = penerimaResponse.data.id;

            if (!importFoto) {
                continue;
            }

            const fotoResult = await uploadFotoSlots({
                pekerjaanId,
                profile,
                row,
                penerimaId,
                onProgress,
                progressState: fotoProgress,
            });

            result.fotoCreated += fotoResult.created;
            result.fotoFailed += fotoResult.failed;
            result.errors.push(...fotoResult.errors);
        } catch (error) {
            result.penerimaFailed += 1;
            const message = error instanceof Error ? error.message : 'Gagal menyimpan';
            result.errors.push(`${row.nama}: ${message}`);
        }
    }

    return result;
}