import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Camera, FileUp, FolderOpen } from 'lucide-react'
import { deleteBerkas, getBerkasList } from '../../api'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { usePaperlessSyncedIds, useSyncAllMediaToPaperless } from '../../hooks/usePaperless'
import { toMediaItem } from './drive-media-adapter'
import { DriveMediaCardItem } from './DriveMediaCardItem'

const DRIVE_MEDIA_KEY = ['berkas', 'drive-latest'] as const

/** Dokumen & foto terbaru dari Spatie Media Library (read + hapus + lihat semua). */
export function DriveMediaSection() {
    const { tahunAnggaran } = useAppSettingsValues()
    const queryClient = useQueryClient()
    const syncAllMutation = useSyncAllMediaToPaperless()

    const { data, isLoading } = useQuery({
        queryKey: [...DRIVE_MEDIA_KEY, tahunAnggaran],
        queryFn: () => getBerkasList({ tahun: tahunAnggaran, page: 1 }),
        staleTime: 60_000,
    })

    const deleteMutation = useMutation({
        mutationFn: deleteBerkas,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DRIVE_MEDIA_KEY })
            toast.success('Dokumen berhasil dihapus')
        },
        onError: () => toast.error('Gagal menghapus dokumen'),
    })

    const items = (data?.data ?? []).slice(0, 8)
    const { data: syncedIds } = usePaperlessSyncedIds(
        items.map((b) => b.media_id ?? 0),
        items.length > 0,
    )
    const syncedSet = useMemo(() => new Set(syncedIds ?? []), [syncedIds])

    const handleDelete = (id: number) => {
        if (!confirm(`Hapus dokumen ini?`)) return
        deleteMutation.mutate(id)
    }

    return (
        <section className='flex flex-col gap-2' aria-labelledby='drive-media-heading'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
                <h2 id='drive-media-heading' className='text-lg font-medium'>
                    Dokumen & Foto Terbaru
                </h2>
                <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>Spatie Media Library</span>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={syncAllMutation.isPending}
                        onClick={() => {
                            if (!confirm('Antrekan sinkron SEMUA dokumen ke Paperless-ngx? Proses berjalan di background.')) {
                                return
                            }
                            syncAllMutation.mutate({})
                        }}
                    >
                        <FileUp />
                        {syncAllMutation.isPending ? 'Mengantrekan...' : 'Sync semua'}
                    </Button>
                    <Button variant='outline' size='sm' asChild>
                        <Link to='/berkas/media'>
                            <FolderOpen />
                            Lihat semua
                        </Link>
                    </Button>
                </div>
            </div>
            {isLoading ? (
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent>
                                <Skeleton className='h-36 w-full rounded-lg' />
                            </CardContent>
                            <CardHeader>
                                <Skeleton className='h-4 w-3/4' />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : items.length > 0 ? (
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                    {items.map((berkas) => (
                        <DriveMediaCardItem
                            key={berkas.id}
                            item={toMediaItem(berkas)}
                            mediaId={berkas.media_id ?? null}
                            paperlessSynced={!!berkas.media_id && syncedSet.has(berkas.media_id)}
                            onDelete={() => handleDelete(berkas.id)}
                        />
                    ))}
                </div>
            ) : (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant='icon'>
                            <Camera />
                        </EmptyMedia>
                        <EmptyTitle>Belum ada dokumen</EmptyTitle>
                        <EmptyDescription>Dokumen dan foto pekerjaan akan muncul di sini.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
        </section>
    )
}
