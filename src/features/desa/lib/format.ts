export function formatDesaNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '-'
    }

    return value.toLocaleString('id-ID')
}