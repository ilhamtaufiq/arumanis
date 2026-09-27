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
