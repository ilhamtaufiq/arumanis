export function getManualCapTahun() {
    return String(new Date().getFullYear() - 1)
}

export function getManualScopeLabel(tahun?: string) {
    return tahun ? `Tahun ${tahun}` : `s/d tahun ${getManualCapTahun()}`
}

export function getManualCompareLabel(tahun?: string) {
    return tahun ? `Manual (Tahun ${tahun})` : `Manual (s/d tahun ${getManualCapTahun()})`
}