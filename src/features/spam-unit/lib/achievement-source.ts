import type { SpamAchievement } from '../types'

/** Catatan backend untuk rekam hasil akumulasi paket (sebelum kolom `sumber` ada). */
export const INTEGRASI_ACHIEVEMENT_CATATAN = 'Akumulasi dari paket pekerjaan tertaut'

/**
 * Rekam achievement hasil integrasi paket tertaut. Rekam manual & integrasi pada
 * tahun yang sama disimpan sebagai baris terpisah; total tahun = jumlah keduanya.
 */
export function isIntegrasiAchievement(achievement: Pick<SpamAchievement, 'sumber' | 'catatan'>): boolean {
    return achievement.sumber === 'integrasi' || achievement.catatan === INTEGRASI_ACHIEVEMENT_CATATAN
}

export function findManualAchievement(
    list: SpamAchievement[] | undefined,
    tahun: string,
): SpamAchievement | undefined {
    return (list ?? []).find((a) => String(a.tahun) === String(tahun) && !isIntegrasiAchievement(a))
}

/** Jumlahkan semua rekam (manual + integrasi) pada satu tahun. */
export function sumAchievementsForTahun(list: SpamAchievement[] | undefined, tahun: string) {
    return (list ?? [])
        .filter((a) => String(a.tahun) === String(tahun))
        .reduce(
            (acc, a) => ({
                sr: acc.sr + (a.jumlah_sr ?? 0),
                kk: acc.kk + (a.jumlah_kk ?? 0),
                jiwa: acc.jiwa + (a.jumlah_jiwa ?? 0),
                bjpKk: acc.bjpKk + (a.jumlah_bjp_kk ?? 0),
                bjpJiwa: acc.bjpJiwa + (a.jumlah_bjp_jiwa ?? 0),
            }),
            { sr: 0, kk: 0, jiwa: 0, bjpKk: 0, bjpJiwa: 0 },
        )
}

/**
 * Capaian tahun terbaru per unit: tahun paling baru yang ada, dengan semua rekam pada tahun itu dijumlahkan
 * (manual + integrasi). Aturan sama dengan kartu Capaian, supaya angka di tabel master dan capaian cocok.
 */
export function capaianTahunTerbaru(list: SpamAchievement[] | undefined) {
    const tahun = (list ?? [])
        .map((a) => String(a.tahun))
        .sort((a, b) => b.localeCompare(a))[0]
    if (!tahun) return { tahun: null as string | null, sr: 0 }
    return { tahun, sr: sumAchievementsForTahun(list, tahun).sr }
}
