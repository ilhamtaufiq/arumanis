import MediaCard, { type MediaItem } from '../MediaCard'

type DriveMediaCardItemProps = {
    item: MediaItem
    onDelete: () => void
}

/** Kartu media Spatie dengan aksi hapus. */
export function DriveMediaCardItem({ item, onDelete }: DriveMediaCardItemProps) {
    return <MediaCard item={item} prefetchPdf={false} onDelete={onDelete} />
}
