/** Nama berkas untuk screenshot dari clipboard: `screenshot-<waktu>.<ekstensi>`, dengan ekstensi dari tipe MIME. */
export function namaScreenshot(berkas: Blob, tipe: string): File {
    const ekstensi = tipe === 'image/jpeg' ? 'jpg' : tipe === 'image/webp' ? 'webp' : 'png'
    const waktu = new Date().toISOString().replace(/[:.]/g, '-')
    return new File([berkas], `screenshot-${waktu}.${ekstensi}`, { type: tipe || 'image/png' })
}

/** Paste di kolom teks tetap teks biasa, jadi event dari elemen seperti itu dilewati. */
export function isPasteDiKolomTeks(event: Event): boolean {
    const target = event.target as HTMLElement | null
    return !!target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
}

/** Gambar pertama dari event paste sebagai berkas, atau null bila clipboard tidak berisi gambar. */
export function gambarDariPaste(event: ClipboardEvent): File | null {
    const items = Array.from(event.clipboardData?.items ?? [])
    const gambar = items.find((item) => item.kind === 'file' && item.type.startsWith('image/'))?.getAsFile()
    return gambar ? namaScreenshot(gambar, gambar.type) : null
}

/**
 * Membaca gambar pertama dari clipboard lewat Clipboard API (butuh izin browser).
 * Mengembalikan null bila tidak ada gambar. Melempar error bila browser menolak atau tidak mendukung.
 */
export async function bacaGambarClipboard(): Promise<File | null> {
    if (!navigator.clipboard?.read) {
        throw new Error('Clipboard API tidak tersedia')
    }
    const items = await navigator.clipboard.read()
    for (const item of items) {
        const tipe = item.types.find((t) => t.startsWith('image/'))
        if (tipe) {
            const blob = await item.getType(tipe)
            return namaScreenshot(blob, tipe)
        }
    }
    return null
}
