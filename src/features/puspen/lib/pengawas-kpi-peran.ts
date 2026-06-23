export const PENGAWAS_KPI_PERAN_ALL = '' as const

export type PengawasKpiPeranFilter = typeof PENGAWAS_KPI_PERAN_ALL | 'pengawas' | 'konsultan_pengawas'

export const PENGAWAS_KPI_PERAN_OPTIONS: ReadonlyArray<{
    value: PengawasKpiPeranFilter
    label: string
}> = [
    { value: PENGAWAS_KPI_PERAN_ALL, label: 'Semua Peran' },
    { value: 'pengawas', label: 'Pengawas' },
    { value: 'konsultan_pengawas', label: 'Konsultan Pengawas' },
]

export const PENGAWAS_KPI_ROLE_LABELS: Record<string, string> = {
    pengawas: 'Pengawas',
    konsultan_pengawas: 'Konsultan Pengawas',
}

export function formatPengawasKpiRoles(roles: string[] | undefined): string {
    if (!roles?.length) return ''
    return roles.map((role) => PENGAWAS_KPI_ROLE_LABELS[role] ?? role).join(', ')
}