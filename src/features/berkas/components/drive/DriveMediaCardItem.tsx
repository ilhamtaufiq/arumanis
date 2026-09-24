import MediaCard, { type MediaItem } from '../MediaCard'
import { usePaperlessStatus, useSyncMediaToPaperless } from '../../hooks/usePaperless'

type DriveMediaCardItemProps = {
    item: MediaItem
    mediaId: number | null
    onDelete: () => void
}

/** Kartu media Spatie + status & aksi sinkron Paperless-ngx. */
export function DriveMediaCardItem({ item, mediaId, onDelete }: DriveMediaCardItemProps) {
    const syncMutation = useSyncMediaToPaperless()
    const statusQuery = usePaperlessStatus(mediaId, !!mediaId)

    return (
        <MediaCard
            item={item}
            prefetchPdf={false}
            onDelete={onDelete}
            onSyncToPaperless={
                mediaId
                    ? () =>
                        syncMutation.mutate(mediaId, {
                            onSuccess: () => statusQuery.refetch(),
                        })
                    : undefined
            }
            syncPending={syncMutation.isPending}
            paperlessSynced={statusQuery.data ? true : null}
        />
    )
}
