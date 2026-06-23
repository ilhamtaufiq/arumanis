import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { syncSpamFromPekerjaan } from '../api'
import type { SyncMode } from '../types'
import { spamIntegrationKeys } from './useSpamIntegration'

export function useSpamSync() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            unitSpamId,
            data,
        }: {
            unitSpamId: number
            data: { tahun: string; mode: SyncMode }
        }) => syncSpamFromPekerjaan(unitSpamId, data),
        onSuccess: async (res) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: spamIntegrationKeys.all }),
                queryClient.invalidateQueries({ queryKey: ['spam-units-stats'] }),
                queryClient.invalidateQueries({ queryKey: ['spam-units'] }),
            ])
            await Promise.all([
                queryClient.refetchQueries({ queryKey: spamIntegrationKeys.all }),
                queryClient.refetchQueries({ queryKey: ['spam-units-stats'] }),
                queryClient.refetchQueries({ queryKey: ['spam-units'] }),
            ])
            toast.success(res.message || 'Sinkronisasi dari pekerjaan berhasil')
        },
        onError: (err: { response?: { data?: { message?: string } } }) => {
            toast.error(err.response?.data?.message || 'Gagal sinkronisasi dari pekerjaan')
        },
    })
}