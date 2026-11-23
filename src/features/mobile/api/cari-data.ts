import { getDesa } from '@/features/desa/api/desa'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { getSpamUnits } from '@/features/spam-unit/api'

export type HasilData = { id: number; judul: string; sub: string }

export type HasilCariData = {
    pekerjaan: HasilData[]
    unit: HasilData[]
    desa: HasilData[]
}

const BATAS = 5

/**
 * Cari paket, unit SPAM, dan desa lewat endpoint yang sudah ada. Setiap endpoint tetap memeriksa izin
 * pengguna sendiri, jadi hasil selalu sesuai akses yang dimiliki.
 */
export async function cariData(kata: string): Promise<HasilCariData> {
    const [pek, unit, desa] = await Promise.all([
        getPekerjaan({ search: kata, per_page: BATAS, status: 'active' }),
        getSpamUnits({ search: kata, per_page: BATAS }),
        getDesa({ search: kata }),
    ])

    return {
        pekerjaan: (pek.data ?? []).slice(0, BATAS).map((p) => ({
            id: p.id,
            judul: p.nama_paket ?? `Paket #${p.id}`,
            sub: 'Paket pekerjaan',
        })),
        unit: (unit.data ?? []).slice(0, BATAS).map((u) => ({
            id: u.id,
            judul: u.name ?? `Unit #${u.id}`,
            sub: u.desa?.n_desa ?? 'Unit SPAM',
        })),
        desa: (desa.data ?? []).slice(0, BATAS).map((d) => ({
            id: d.id,
            judul: d.nama_desa ?? d.n_desa ?? `Desa #${d.id}`,
            sub: 'Desa',
        })),
    }
}
