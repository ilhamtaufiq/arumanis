import { FOTO_MAX_COUNT, validateFotoSelection } from './jurnal-helpers'
import type { JurnalFoto } from '../types'

export const BUKTI_MAX_COUNT = FOTO_MAX_COUNT

/** Validasi berkas bukti per RHK per bulan: JPG/PNG, maks. 10 MB, maks. 10 foto. */
export function validateBuktiSelection(files: File[], sudahAda: number) {
    return validateFotoSelection(files, sudahAda, {
        maxCount: BUKTI_MAX_COUNT,
        batasLabel: 'per RHK per bulan',
    })
}

export interface BuktiCard {
    no: number
    rhk: string
    foto: JurnalFoto[]
    /** true bila foto ada untuk nomor RHK yang tidak ada di master tahun ini. */
    orphan: boolean
}

/**
 * Satu kartu per RHK master (diurutkan menurut nomor). Foto dari respons yang nomornya
 * tidak ada di master tetap ditampilkan sebagai kartu tersendiri agar tidak hilang.
 */
export function groupBuktiByRhk(
    master: ReadonlyArray<{ no: number; rhk: string }>,
    bukti: ReadonlyArray<{ rhk: number; foto: JurnalFoto[] }>,
): BuktiCard[] {
    const fotoByNo = new Map<number, JurnalFoto[]>()
    for (const item of bukti) {
        fotoByNo.set(item.rhk, [...(fotoByNo.get(item.rhk) ?? []), ...(item.foto ?? [])])
    }

    const cards: BuktiCard[] = master.map((item) => ({
        no: item.no,
        rhk: item.rhk,
        foto: fotoByNo.get(item.no) ?? [],
        orphan: false,
    }))

    const masterNos = new Set(master.map((item) => item.no))
    for (const [no, foto] of fotoByNo) {
        if (!masterNos.has(no)) {
            cards.push({ no, rhk: `RHK ${no} (tidak ada di master tahun ini)`, foto, orphan: true })
        }
    }

    return cards.sort((a, b) => a.no - b.no)
}

export function sisaSlotBukti(jumlahFoto: number): number {
    return Math.max(0, BUKTI_MAX_COUNT - jumlahFoto)
}
