import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api-client'
import { ApiError } from '@/lib/api-client.types'
import {
    assignPekerjaan,
    broadcastCompletenessReminders,
    deleteAssignment,
    getAssignments,
    getAvailableUsers,
    getCompletenessGaps,
    type AssignmentRequest,
    type BroadcastReminderRequest,
    type CompletenessGapsParams,
} from '../api/user-pekerjaan'

export const userPekerjaanKeys = {
    all: ['user-pekerjaan'] as const,
    assignments: () => [...userPekerjaanKeys.all, 'assignments'] as const,
    availableUsers: () => [...userPekerjaanKeys.all, 'available-users'] as const,
    pekerjaan: (tahun: string, search: string) =>
        [...userPekerjaanKeys.all, 'pekerjaan', tahun, search] as const,
    completenessGaps: (params: CompletenessGapsParams) =>
        [...userPekerjaanKeys.all, 'completeness-gaps', params] as const,
}

type PekerjaanOption = {
    id: number
    nama_paket: string
    pagu: number
    kecamatan?: { nama: string }
    desa?: { nama: string }
}

export function useAssignments() {
    return useQuery({
        queryKey: userPekerjaanKeys.assignments(),
        queryFn: getAssignments,
    })
}

export function useAvailableUsers() {
    return useQuery({
        queryKey: userPekerjaanKeys.availableUsers(),
        queryFn: getAvailableUsers,
    })
}

export function usePekerjaanForAssignment(tahun: string, search: string) {
    return useQuery({
        queryKey: userPekerjaanKeys.pekerjaan(tahun, search),
        queryFn: async () => {
            const response = await api.get<{ data: PekerjaanOption[] }>('/pekerjaan', {
                params: {
                    per_page: 10,
                    tahun: tahun || undefined,
                    search: search || undefined,
                },
            })
            return response.data
        },
    })
}

export function useAssignPekerjaan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: AssignmentRequest) => assignPekerjaan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userPekerjaanKeys.all })
            toast.success('Pekerjaan berhasil di-assign')
        },
        onError: () => {
            toast.error('Gagal assign pekerjaan')
        },
    })
}

export function useDeleteAssignment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteAssignment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userPekerjaanKeys.all })
            toast.success('Assignment berhasil dihapus')
        },
        onError: () => {
            toast.error('Gagal menghapus assignment')
        },
    })
}

export function useCompletenessGaps(params: CompletenessGapsParams) {
    return useQuery({
        queryKey: userPekerjaanKeys.completenessGaps(params),
        queryFn: () => getCompletenessGaps(params),
    })
}

export function useBroadcastCompletenessReminders() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: BroadcastReminderRequest) => broadcastCompletenessReminders(data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: userPekerjaanKeys.all })

            if (result.message) {
                toast.success(result.message)
                if (result.email_recipients?.length) {
                    toast.message(`Email dikirim ke: ${result.email_recipients.join(', ')}`)
                }
                return
            }

            const parts = [`Notifikasi terkirim ke ${result.recipient_count} pengawas`]
            if (result.send_email && (result.email_sent_count ?? 0) > 0) {
                parts.push(`email ke ${result.email_sent_count} pengawas`)
            }
            toast.success(parts.join(', '))
            if (result.email_recipients?.length) {
                toast.message(`Email dikirim ke: ${result.email_recipients.join(', ')}`)
            }
        },
        onError: (error: unknown) => {
            const message =
                error instanceof ApiError
                    ? error.message
                    : 'Gagal mengirim pengingat kelengkapan'
            toast.error(message)
        },
    })
}