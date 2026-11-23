import type { NavGroup } from '@/components/layout/type'

export type ModulHasil = {
    judul: string
    grup: string
    url: string
}

type ModulMentah = ModulHasil & { kunci?: string[] }

/** Kata dari kueri, huruf kecil, tanpa kosong. */
export function pecahKueri(kueri: string): string[] {
    return kueri
        .toLowerCase()
        .split(/\s+/)
        .map((k) => k.trim())
        .filter(Boolean)
}

/**
 * Cari modul di menu. Semua kata kueri harus cocok dengan judul modul atau nama grupnya.
 * `navGroups` harus sudah difilter sesuai izin pengguna oleh pemanggil.
 */
export function cariModul(navGroups: NavGroup[], kueri: string, batas = 30): ModulHasil[] {
    const kata = pecahKueri(kueri)
    if (kata.length === 0) return []

    const semua: ModulMentah[] = []
    for (const grup of navGroups) {
        for (const item of grup.items) {
            if (item.items) {
                for (const sub of item.items) {
                    semua.push({ judul: sub.title, grup: `${grup.title} · ${item.title}`, url: sub.url, kunci: sub.keywords })
                }
            } else if (item.url) {
                semua.push({ judul: item.title, grup: grup.title, url: item.url, kunci: item.keywords })
            }
        }
    }

    return semua
        .filter((m) => {
            const teks = `${m.judul} ${m.grup} ${(m.kunci ?? []).join(' ')}`.toLowerCase()
            return kata.every((k) => teks.includes(k))
        })
        .slice(0, batas)
        .map(({ judul, grup, url }) => ({ judul, grup, url }))
}
