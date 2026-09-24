import { useQuery } from '@tanstack/react-query'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import { getDashboardStats } from '../api/dashboard'

/** Hook bersama halaman ringkasan v2 (cache query sama dengan dashboard utama). */
export function useV2Stats() {
    const { tahunAnggaran } = useAppSettingsValues()
    const { auth } = useAuthStore()
    const canViewStats = auth.user?.roles?.some((role) => role === 'admin' || role === 'manager') ?? false

    const query = useQuery({
        queryKey: ['dashboard-stats', tahunAnggaran],
        queryFn: () => getDashboardStats(tahunAnggaran),
        enabled: canViewStats,
        staleTime: 60_000,
    })

    const { data: stats, ...rest } = query;

    return { tahunAnggaran, userName: auth.user?.name, canViewStats, stats, ...rest }
}
