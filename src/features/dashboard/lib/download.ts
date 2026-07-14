/** Trigger browser download from a Blob. */
export function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}

export function dateStamp() {
    return new Date().toISOString().split('T')[0]
}

export function formatRupiah(value: number | null | undefined) {
    return `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`
}
