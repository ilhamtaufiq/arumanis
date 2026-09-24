import MediaCard, { type MediaItem } from '../MediaCard'
import { useSyncMediaToPaperless } from '../../hooks/usePaperless'

type DriveMediaCardItemProps = {
    item: MediaItem
    mediaId: number | null
    paperlessSynced: boolean
    onDelete: () => void
}

/** Kartu media Spatie + aksi sinkron Paperless-ngx (status via batch induk, tanpa N+1). */
export function DriveMediaCardItem({ item, mediaId, paperlessSynced, onDelete }: DriveMediaCardItemProps) {
    const syncMutation = useSyncMediaToPaperless()

    return (
        <MediaCard
            item={item}
            prefetchPdf={false}
            onDelete={onDelete}
            onSyncToPaperless={mediaId ? () => syncMutation.mutate(mediaId) : undefined}
            syncPending={syncMutation.isPending}
            paperlessSynced={paperlessSynced || null}
        />
    )
}
