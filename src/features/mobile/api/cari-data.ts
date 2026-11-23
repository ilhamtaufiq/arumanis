import { getDesa } from '@/features/desa/api/desa'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { getSpamUnits } from '@/features/spam-unit/api'
import { bersihkanJudul } from '../lib/bersihkan-judul'

export type HasilData = {
    id: number
    judul: string
    /** Keterangan kedua: lokasi atau jenis, sudah digabung. */
    sub: string
    /** Status mentah dari server (paket saja), bila ada. */
    status?: string
}

export type HasilCariData = {
    pekerjaan: HasilData[]
    unit: HasilData[]
    desa: HasilData[]
    /** Jumlah total di server (bisa lebih besar dari yang ditampilkan). */
    total: { pekerjaan: number; unit: number; desa: number }
}

const BATAS = 5

function gabung(...bagian: (string | null | undefined)[]): string {
    return bagian.filter((b): b is string => !!b && b.trim() !== '').join(' · ')
}

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
        total: {
            pekerjaan: pek.meta?.total ?? pek.data?.length ?? 0,
            unit: unit.meta?.total ?? unit.data?.length ?? 0,
            desa: desa.meta?.total ?? desa.data?.length ?? 0,
        },
        pekerjaan: (pek.data ?? []).slice(0, BATAS).map((p) => ({
            id: p.id,
            judul: bersihkanJudul(p.nama_paket ?? '') || `Paket #${p.id}`,
            sub: gabung(p.kecamatan?.nama_kecamatan, p.desa?.nama_desa ?? p.desa?.n_desa) || 'Paket pekerjaan',
            status: typeof p.status === 'string' ? p.status : undefined,
        })),
        unit: (unit.data ?? []).slice(0, BATAS).map((u) => ({
            id: u.id,
            judul: bersihkanJudul(u.name ?? '') || `Unit #${u.id}`,
            sub: gabung(u.desa?.n_desa, u.desa?.kecamatan?.nama_kecamatan) || 'Unit SPAM',
        })),
        desa: (desa.data ?? []).slice(0, BATAS).map((d) => ({
            id: d.id,
            judul: bersihkanJudul(d.nama_desa ?? d.n_desa ?? '') || `Desa #${d.id}`,
            sub: gabung(d.kecamatan?.nama_kecamatan ?? d.kecamatan?.n_kec) || 'Desa',
        })),
    }
}
