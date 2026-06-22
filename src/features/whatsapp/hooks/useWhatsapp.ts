import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { connectSession, getSessionStatus, logoutSession, sendBulkMessages, sendMessage } from '../api'
import type { SendBulkRequest, SendMessageRequest } from '../types'

export const whatsappKeys = {
    all: ['whatsapp'] as const,
    status: () => [...whatsappKeys.all, 'status'] as const,
}

export function useWhatsappStatus(refetchInterval = 3000) {
    return useQuery({
        queryKey: whatsappKeys.status(),
        queryFn: getSessionStatus,
        refetchInterval,
    })
}

export function useConnectWhatsapp() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: connectSession,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: whatsappKeys.all }),
    })
}

export function useLogoutWhatsapp() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: logoutSession,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: whatsappKeys.all }),
    })
}

export function useSendWhatsappMessage() {
    return useMutation({
        mutationFn: (data: SendMessageRequest) => sendMessage(data),
    })
}

export function useSendWhatsappBulk() {
    return useMutation({
        mutationFn: (data: SendBulkRequest) => sendBulkMessages(data),
    })
}