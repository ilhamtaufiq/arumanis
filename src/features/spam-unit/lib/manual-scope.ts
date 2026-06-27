export function getManualCapTahun() {
    return String(new Date().getFullYear() - 1)
}

export function getManualScopeLabel(tahun?: string) {
    return tahun ? `Tahun ${tahun}` : `s/d tahun ${getManualCapTahun()}`
}

export function getManualCompareLabel(tahun?: string) {
    return tahun ? `Capaian Unit (${tahun})` : `Capaian Unit (s/d ${getManualCapTahun()})`
}

export function getPotensiCompareLabel() {
    return 'Potensi Pekerjaan AM'
}