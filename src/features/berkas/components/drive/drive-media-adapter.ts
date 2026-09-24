import type { MediaItem } from '../MediaCard'
import type { Berkas } from '../../types'

function isImageUrl(url: string): boolean {
    return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(url.split('?')[0])
}

function stem(path: string): string {
    const base = path.split('?')[0].split('/').pop() ?? path
    const dot = base.lastIndexOf('.')
    return dot > 0 ? base.slice(0, dot) : base
}

function extensionOf(path: string): string {
    const base = path.split('?')[0].split('/').pop() ?? ''
    const dot = base.lastIndexOf('.')
    return dot > 0 ? base.slice(dot + 1).toLowerCase() : ''
}

/** Nama tampil: original_name (tanpa UUID) + ekstensi; fallback aman untuk upload lama. */
export function displayDriveName(berkas: Berkas): string {
    const base = berkas.original_name?.trim() || stem(berkas.file_name || berkas.berkas_url) || `Dokumen #${berkas.id}`
    const ext = extensionOf(berkas.file_name || berkas.berkas_url)
    if (ext && !base.toLowerCase().endsWith(`.${ext}`)) return `${base}.${ext}`
    return base
}

/** Adaptasi Berkas API ke MediaItem kartu (nama asli + pekerjaan + tanggal). */
export function toMediaItem(berkas: Berkas): MediaItem {
    return {
        id: berkas.id,
        source: 'pekerjaan',
        type: isImageUrl(berkas.berkas_url) ? 'image' : 'document',
        name: displayDriveName(berkas),
        url: berkas.berkas_url,
        media_id: berkas.media_id,
        pekerjaan_id: berkas.pekerjaan_id,
        pekerjaan_name: berkas.pekerjaan?.nama_paket,
        created_at: berkas.created_at,
        jenis_dokumen: berkas.jenis_dokumen,
        can_manage: true,
    }
}
