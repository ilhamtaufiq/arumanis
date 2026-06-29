export type SpmCoverageTier = 'none' | 'low' | 'mid' | 'high'

export function getCoveragePercent(value: number, target: number) {
    if (target <= 0 || value <= 0) return 0
    return Math.min(100, (value / target) * 100)
}

export function getCoverageTier(percent: number): SpmCoverageTier {
    if (percent <= 0) return 'none'
    if (percent < 25) return 'low'
    if (percent < 60) return 'mid'
    return 'high'
}

export function formatCoveragePercent(percent: number) {
    return `${percent.toLocaleString('id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}%`
}

export function getTierModifier(tier: SpmCoverageTier) {
    return `landing-spm-popup--tier-${tier}`
}