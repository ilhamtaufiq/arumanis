import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getInstagramComments,
  getInstagramEvents,
  getInstagramGallery,
  getInstagramInbox,
  getInstagramMedia,
  getInstagramStatus,
  getInstagramThread,
  probeInstagramIntegration,
  replyInstagramThread,
  syncInstagramMedia,
} from '../api'

export const instagramKeys = {
  all: ['instagram'] as const,
  status: () => [...instagramKeys.all, 'status'] as const,
  gallery: (limit: number) => [...instagramKeys.all, 'gallery', limit] as const,
  probe: () => [...instagramKeys.all, 'probe'] as const,
  media: () => [...instagramKeys.all, 'media'] as const,
  inbox: () => [...instagramKeys.all, 'inbox'] as const,
  thread: (id: string) => [...instagramKeys.all, 'thread', id] as const,
  comments: () => [...instagramKeys.all, 'comments'] as const,
  events: () => [...instagramKeys.all, 'events'] as const,
}

export function useInstagramStatus() {
  return useQuery({
    queryKey: instagramKeys.status(),
    queryFn: getInstagramStatus,
    staleTime: 30_000,
  })
}

export function useInstagramGallery(limit = 12) {
  return useQuery({
    queryKey: instagramKeys.gallery(limit),
    queryFn: () => getInstagramGallery(limit),
    staleTime: 60_000,
  })
}

export function useInstagramProbe(enabled = true) {
  return useQuery({
    queryKey: instagramKeys.probe(),
    queryFn: probeInstagramIntegration,
    enabled,
    staleTime: 15_000,
  })
}

export function useInstagramMedia(enabled = true) {
  return useQuery({
    queryKey: instagramKeys.media(),
    queryFn: getInstagramMedia,
    enabled,
    staleTime: 30_000,
  })
}

export function useInstagramInbox(enabled = true) {
  return useQuery({
    queryKey: instagramKeys.inbox(),
    queryFn: getInstagramInbox,
    enabled,
    refetchInterval: 30_000,
  })
}

export function useInstagramThread(threadId: string | null) {
  return useQuery({
    queryKey: instagramKeys.thread(threadId || ''),
    queryFn: () => getInstagramThread(threadId!),
    enabled: Boolean(threadId),
  })
}

export function useInstagramComments(enabled = true) {
  return useQuery({
    queryKey: instagramKeys.comments(),
    queryFn: getInstagramComments,
    enabled,
    refetchInterval: 45_000,
  })
}

export function useInstagramEvents(enabled = true) {
  return useQuery({
    queryKey: instagramKeys.events(),
    queryFn: () => getInstagramEvents(40),
    enabled,
    staleTime: 15_000,
  })
}

export function useSyncInstagramMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: syncInstagramMedia,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: instagramKeys.all }),
      ])
    },
  })
}

export function useReplyInstagramThread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      threadId,
      text,
      humanAgent,
    }: {
      threadId: string
      text: string
      humanAgent?: boolean
    }) => replyInstagramThread(threadId, { text, humanAgent }),
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: instagramKeys.inbox() }),
        qc.invalidateQueries({ queryKey: instagramKeys.thread(vars.threadId) }),
      ])
    },
  })
}
