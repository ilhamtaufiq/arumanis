export const SPAM_BASELINE_CAP_TAHUN = '2025'
export const SPAM_ACCUMULATION_START_TAHUN = '2026'

export function getBaselinePolicyLabel() {
    return `Data master unit SPAM s/d ${SPAM_BASELINE_CAP_TAHUN} sebagai acuan dan tidak ditimpa integrasi. Pelacakan pekerjaan & akumulasi capaian mulai ${SPAM_ACCUMULATION_START_TAHUN}.`
}

export function getIntegrasiScopeLabel(tahun?: string) {
    return tahun ? `Tahun ${tahun}` : `Paket AM ${SPAM_ACCUMULATION_START_TAHUN} ke atas`
}

export function getIntegrationMetricColumnLabel(metric: 'SR' | 'KK', tahun?: string) {
    const potensi = tahun
        ? `Potensi AM ${tahun}`
        : `Potensi AM ${SPAM_ACCUMULATION_START_TAHUN}+`
    const acuan = tahun
        ? `Acuan unit ${tahun}`
        : `Acuan unit s/d ${SPAM_BASELINE_CAP_TAHUN}`

    return `${metric} (${acuan} / ${potensi})`
}