/** Teks opsional dari form: spasi dibuang, kosong menjadi null (sesuai kontrak backend). */
export function normalizeOptionalText(value: string | null | undefined): string | null {
    const trimmed = (value ?? '').trim()
    return trimmed === '' ? null : trimmed
}

/** Nilai form dari data user: null menjadi string kosong. */
export function toFormText(value: string | null | undefined): string {
    return value ?? ''
}
