import type { Foto } from '../types'

/** Konversi URL backend (http://apiamis.test/storage/...) menjadi relatif (/storage/...) agar lewat proxy BFF/Vite. */
export function normalizeStorageUrl(url: string | null | undefined): string {
    if (!url) return ''
    return url.replace(/^https?:\/\/[^/]+\/storage\//, '/storage/')
}

/** URL ringkas untuk grid/list (thumb bila ada). */
export function getFotoThumbUrl(foto: Pick<Foto, 'foto_url' | 'foto_thumb_url'> | null | undefined): string {
    if (!foto) return ''
    return normalizeStorageUrl(foto.foto_thumb_url || foto.foto_url)
}

/** URL penuh untuk lightbox / unduhan / print. */
export function getFotoFullUrl(foto: Pick<Foto, 'foto_url' | 'foto_thumb_url'> | null | undefined): string {
    if (!foto) return ''
    return normalizeStorageUrl(foto.foto_url || foto.foto_thumb_url)
}

/**
 * Dipanggil dari `onError` pada gambar thumbnail. Kalau thumb gagal dimuat (file thumb
 * hilang di server), coba URL penuh satu kali. Mengembalikan `true` bila sudah mencoba
 * URL penuh, dan `false` bila tidak ada lagi yang bisa dicoba.
 */
export function tryFullFotoUrl(
    img: HTMLImageElement,
    foto: Pick<Foto, 'foto_url' | 'foto_thumb_url'> | null | undefined,
): boolean {
    const full = getFotoFullUrl(foto)
    if (!full || img.dataset.fullTried === '1') return false
    img.dataset.fullTried = '1'
    img.src = full
    return true
}
