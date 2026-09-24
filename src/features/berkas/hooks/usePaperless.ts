import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getPaperlessStatus,
    getPaperlessSyncedIds,
    searchPaperlessDocuments,
    syncAllMediaToPaperless,
    syncMediaToPaperless,
} from '../api/paperless'

export const paperlessKeys = {
    all: ['paperless'] as const,
    status: (mediaId: number) => [...paperlessKeys.all, 'status', mediaId] as const,
    synced: (mediaIds: number[]) => [...paperlessKeys.all, 'synced', [...mediaIds].sort((a, b) => a - b)] as const,
    search: (query: string, page: number) => [...paperlessKeys.all, 'search', query, page] as const,
}

/** Antrekan sinkron satu media ke Paperless-ngx. */
export function useSyncMediaToPaperless() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: syncMediaToPaperless,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: paperlessKeys.all })
            toast.success(res.message || 'Sinkron Paperless diantrekan')
        },
        onError: () => toast.error('Gagal mengantrekan sinkron Paperless'),
    })
}

/** Antrekan sinkron massal (admin). */
export function useSyncAllMediaToPaperless() {
    return useMutation({
        mutationFn: syncAllMediaToPaperless,
        onSuccess: (res) => {
            toast.success(res.message || `${res.dispatched_count} berkas diantrekan`)
        },
        onError: () => toast.error('Gagal mengantrekan sinkron massal'),
    })
}

/** Status Paperless satu media (null = belum disinkron). */
export function usePaperlessStatus(mediaId: number | null | undefined, enabled = true) {
    return useQuery({
        queryKey: paperlessKeys.status(mediaId ?? 0),
        queryFn: () => getPaperlessStatus(mediaId as number),
        enabled: enabled && !!mediaId,
        staleTime: 60_000,
        retry: false,
    })
}

/** Status batch: 1 request untuk banyak media (hindari N+1 per kartu). */
export function usePaperlessSyncedIds(mediaIds: number[], enabled = true) {
    // Key query dibandingkan struktural oleh React Query, jadi array inline aman.
    const clean = [...new Set(mediaIds.filter((id) => Number.isFinite(id) && id > 0))].sort((a, b) => a - b)
    return useQuery({
        queryKey: paperlessKeys.synced(clean),
        queryFn: () => getPaperlessSyncedIds(clean),
        enabled: enabled && clean.length > 0,
        staleTime: 60_000,
    })
}

/** Pencarian dokumen Paperless (full-text OCR). */
export function usePaperlessSearch(query: string, page = 1, enabled = true) {
    const term = query.trim()
    return useQuery({
        queryKey: paperlessKeys.search(term, page),
        queryFn: () => searchPaperlessDocuments(term, page),
        enabled: enabled && term.length > 1,
        staleTime: 30_000,
    })
}
