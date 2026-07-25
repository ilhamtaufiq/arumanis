const MONTH_ID: Record<string, number> = {
    januari: 1,
    jan: 1,
    februari: 2,
    feb: 2,
    maret: 3,
    mar: 3,
    april: 4,
    apr: 4,
    mei: 5,
    juni: 6,
    jun: 6,
    juli: 7,
    jul: 7,
    agustus: 8,
    agu: 8,
    ags: 8,
    september: 9,
    sep: 9,
    sept: 9,
    oktober: 10,
    okt: 10,
    november: 11,
    nov: 11,
    desember: 12,
    des: 12,
}

function pad2(n: number) {
    return String(n).padStart(2, '0')
}

/**
 * Parse tanggal SP2D export: "1 Juni 2026", "01/06/2026", "2026-06-01".
 * Returns YYYY-MM-DD or null.
 */
export function parseSp2dDate(value: string | null | undefined): string | null {
    const raw = String(value ?? '').trim()
    if (!raw) return null

    // ISO
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        return raw.slice(0, 10)
    }

    // dd/mm/yyyy or dd-mm-yyyy
    const slash = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)
    if (slash) {
        const d = Number(slash[1])
        const m = Number(slash[2])
        const y = Number(slash[3])
        if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2000) {
            return `${y}-${pad2(m)}-${pad2(d)}`
        }
    }

    // "1 Juni 2026" / "01 Juni 2026"
    const id = raw.match(/^(\d{1,2})\s+([A-Za-z.]+)\s+(\d{4})$/)
    if (id) {
        const d = Number(id[1])
        const monthKey = id[2]!.toLowerCase().replace(/\./g, '')
        const m = MONTH_ID[monthKey]
        const y = Number(id[3])
        if (m && d >= 1 && d <= 31 && y >= 2000) {
            return `${y}-${pad2(m)}-${pad2(d)}`
        }
    }

    // Excel serial sometimes leaked as number string
    const serial = Number(raw)
    if (Number.isFinite(serial) && serial > 40000 && serial < 60000) {
        // Excel epoch 1899-12-30
        const epoch = Date.UTC(1899, 11, 30)
        const ms = epoch + serial * 86400000
        const dt = new Date(ms)
        if (!Number.isNaN(dt.getTime())) {
            return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`
        }
    }

    return null
}
