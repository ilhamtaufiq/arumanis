import { attachSpmPekerjaan, createSpmSanitasi } from '../api'
import type {
    SpmDesaIntegration,
    SpmPaketPekerjaan,
    SpmSanitasiFormData,
    SpmSanitasiJenis,
} from '../types'
import { JENIS_LABEL } from './jenis-labels'
import {
    collectMissingJenis,
    collectSuggestedJenis,
    filterOutputsForSpmJenis,
    pickDefaultOutput,
} from './integration-helpers'

export function listPekerjaanForJenis(
    detail: SpmDesaIntegration,
    jenis: SpmSanitasiJenis,
): SpmPaketPekerjaan[] {
    return detail.pekerjaan.filter((pkj) => {
        if (pkj.target_jenis_list?.includes(jenis)) return true
        const outputs = pkj.sanitasi_outputs ?? pkj.mck_outputs ?? []
        return filterOutputsForSpmJenis(outputs, jenis).length > 0
    })
}

export function buildSpmFormFromPekerjaan(
    desaId: number,
    jenis: SpmSanitasiJenis,
    pekerjaanList: SpmPaketPekerjaan[],
): SpmSanitasiFormData {
    const primary = pekerjaanList[0]
    const totalKk = pekerjaanList.reduce((sum, p) => sum + (p.derived?.kk ?? 0), 0)
    const totalJiwa = pekerjaanList.reduce((sum, p) => sum + (p.derived?.jiwa ?? 0), 0)
    const totalBiaya = pekerjaanList.reduce(
        (sum, p) =>
            sum + (p.derived?.pembiayaan_suggested ?? p.derived?.nilai_kontrak ?? 0),
        0,
    )

    const tahunCandidates = pekerjaanList
        .map(
            (p) =>
                p.derived?.tahun_konstruksi_suggested ??
                (p.tahun_anggaran ? Number(p.tahun_anggaran) : null),
        )
        .filter((y): y is number => typeof y === 'number' && y >= 1900 && y <= 2100)

    const nama =
        pekerjaanList.length === 1 && primary?.nama_paket
            ? primary.nama_paket
            : `${JENIS_LABEL[jenis]} — auto dari ${pekerjaanList.length} paket`

    return {
        jenis,
        desa_id: desaId,
        nama_infrastruktur: nama.slice(0, 500),
        skala_pelayanan: 'Permukiman',
        status_keberfungsian: 'Berfungsi',
        kualitas_keberfungsian: 'Baik',
        jumlah_pemanfaat_kk: totalKk > 0 ? totalKk : null,
        jumlah_pemanfaat_jiwa: totalJiwa > 0 ? totalJiwa : null,
        tahun_konstruksi: tahunCandidates.length > 0 ? Math.min(...tahunCandidates) : null,
        pembiayaan_total: totalBiaya > 0 ? totalBiaya : null,
    }
}

export type AutoCreateInfrastrukturResult = {
    created: number
    linked: number
    jenisCreated: SpmSanitasiJenis[]
    errors: string[]
}

async function linkPekerjaanToSpm(
    spmId: number,
    jenis: SpmSanitasiJenis,
    pekerjaanList: SpmPaketPekerjaan[],
    result: AutoCreateInfrastrukturResult,
): Promise<void> {
    for (const pkj of pekerjaanList) {
        // Sudah tertaut ke master ini — lewati
        if (pkj.linked_spm_ids?.includes(spmId)) continue

        const outputs = pkj.sanitasi_outputs ?? pkj.mck_outputs ?? []
        const output = pickDefaultOutput(outputs, jenis)
        try {
            await attachSpmPekerjaan(spmId, {
                pekerjaan_id: pkj.id,
                output_id: output?.id,
            })
            result.linked += 1
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'gagal tautkan'
            result.errors.push(`${JENIS_LABEL[jenis]} → ${pkj.nama_paket}: ${msg}`)
        }
    }
}

/**
 * Lengkapi master infrastruktur SPM dari paket pekerjaan sanitasi di desa,
 * lalu tautkan pekerjaan yang cocok per jenis.
 *
 * - Status no_infrastruktur: buat semua jenis yang disarankan, lalu tautkan.
 * - Status partial: buat hanya jenis yang belum ada; untuk jenis yang sudah ada,
 *   tautkan paket yang belum tertaut ke master sejenis.
 */
export async function autoCreateInfrastrukturFromDesa(
    detail: SpmDesaIntegration,
): Promise<AutoCreateInfrastrukturResult> {
    const jenisList = collectSuggestedJenis(detail)
    const result: AutoCreateInfrastrukturResult = {
        created: 0,
        linked: 0,
        jenisCreated: [],
        errors: [],
    }

    if (jenisList.length === 0) {
        result.errors.push(
            'Tidak ada jenis infrastruktur yang bisa disimpulkan dari output pekerjaan (MCK / tangki septik / IPAL / IPLT).',
        )
        return result
    }

    if (!detail.desa?.id) {
        result.errors.push('Desa tidak valid.')
        return result
    }

    const missingJenis = new Set(collectMissingJenis(detail))

    for (const jenis of jenisList) {
        const pekerjaanList = listPekerjaanForJenis(detail, jenis)
        if (pekerjaanList.length === 0) continue

        const existing = detail.infrastruktur.find((i) => i.jenis === jenis)

        // Jenis sudah ada — tautkan paket yang belum tertaut (kasus partial)
        if (existing) {
            await linkPekerjaanToSpm(existing.id, jenis, pekerjaanList, result)
            continue
        }

        // Hanya buat jenis yang benar-benar belum ada
        if (!missingJenis.has(jenis)) continue

        try {
            const form = buildSpmFormFromPekerjaan(detail.desa.id, jenis, pekerjaanList)
            const created = await createSpmSanitasi(form)
            const spmId = created.data?.id
            if (!spmId) {
                result.errors.push(`${JENIS_LABEL[jenis]}: gagal membuat (ID kosong)`)
                continue
            }

            result.created += 1
            result.jenisCreated.push(jenis)

            await linkPekerjaanToSpm(spmId, jenis, pekerjaanList, result)
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'gagal membuat'
            result.errors.push(`${JENIS_LABEL[jenis]}: ${msg}`)
        }
    }

    if (result.created === 0 && result.linked === 0 && result.errors.length === 0) {
        result.errors.push(
            'Semua jenis infrastruktur sudah ada dan paket pekerjaan sudah tertaut, atau tidak ada paket yang cocok untuk ditautkan.',
        )
    }

    return result
}
