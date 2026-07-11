import type { Foto } from '../types'

/** URL ringkas untuk grid/list (thumb bila ada). */
export function getFotoThumbUrl(foto: Pick<Foto, 'foto_url' | 'foto_thumb_url'> | null | undefined): string {
    if (!foto) return ''
    return foto.foto_thumb_url || foto.foto_url || ''
}

/** URL penuh untuk lightbox / unduhan / print. */
export function getFotoFullUrl(foto: Pick<Foto, 'foto_url' | 'foto_thumb_url'> | null | undefined): string {
    if (!foto) return ''
    return foto.foto_url || foto.foto_thumb_url || ''
}
