import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Camera, ChevronLeft, ChevronRight, FileUp, FolderOpen } from 'lucide-react'
import { deleteBerkas, getBerkasList } from '../../api'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import type { MediaItem } from '../MediaCard'
import { useSyncAllMediaToPaperless } from '../../hooks/usePaperless'
import { DriveMediaCardItem } from './DriveMediaCardItem'
import type { Berkas } from '../../types'

const DRIVE_MEDIA_KEY = ['berkas', 'drive-latest'] as const

function isImageUrl(url: string): boolean {
    return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(url.split('?')[0])
}

function stem(path: string): string {
    const base = path.split('?')[0].split('/').pop() ?? path
    const dot = base.lastIndexOf('.')
    return dot > 0 ? base.slice(0, dot) : base
}

function extensionOf(path: string): string {
    const base = path.split('?')[0].split('/').pop() ?? ''
    const dot = base.lastIndexOf('.')
    return dot > 0 ? base.slice(dot + 1).toLowerCase() : ''
}

/** Nama tampil: original_name (tanpa UUID) + ekstensi; fallback aman untuk upload lama. */
function displayName(berkas: Berkas): string {
    const base = berkas.original_name?.trim() || stem(berkas.file_name || berkas.berkas_url) || `Dokumen #${berkas.id}`
    const ext = extensionOf(berkas.file_name || berkas.berkas_url)
    if (ext && !base.toLowerCase().endsWith(`.${ext}`)) return `${base}.${ext}`
    return base
}

function toMediaItem(berkas: Berkas): MediaItem {
    return {
        id: berkas.id,
        source: 'pekerjaan',
        type: isImageUrl(berkas.berkas_url) ? 'image' : 'document',
        name: displayName(berkas),
        url: berkas.berkas_url,
        media_id: berkas.media_id,
        pekerjaan_id: berkas.pekerjaan_id,
        pekerjaan_name: berkas.pekerjaan?.nama_paket,
        created_at: berkas.created_at,
        jenis_dokumen: berkas.jenis_dokumen,
        can_manage: true,
    }
}

/** Dokumen & foto terbaru dari Spatie Media Library (read + hapus + lihat semua). */
export function DriveMediaSection() {
    const { tahunAnggaran } = useAppSettingsValues()
    const queryClient = useQueryClient()
    const [allOpen, setAllOpen] = useState(false)
    const [allPage, setAllPage] = useState(1)
    const syncAllMutation = useSyncAllMediaToPaperless()

    const { data, isLoading } = useQuery({
        queryKey: [...DRIVE_MEDIA_KEY, tahunAnggaran],
        queryFn: () => getBerkasList({ tahun: tahunAnggaran, page: 1 }),
        staleTime: 60_000,
    })

    const { data: allData, isLoading: allLoading } = useQuery({
        queryKey: [...DRIVE_MEDIA_KEY, 'all', tahunAnggaran, allPage],
        queryFn: () => getBerkasList({ tahun: tahunAnggaran, page: allPage }),
        enabled: allOpen,
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
    const total = data?.meta?.total ?? items.length
    const allItems = allData?.data ?? []
    const lastPage = allData?.meta?.last_page ?? 1

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
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                            setAllPage(1)
                            setAllOpen(true)
                        }}
                    >
                        <FolderOpen />
                        Lihat semua
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

            <Dialog open={allOpen} onOpenChange={setAllOpen}>
                <DialogContent className='max-h-[min(92dvh,860px)] overflow-y-auto sm:max-w-4xl'>
                    <DialogHeader>
                        <DialogTitle>Semua Dokumen & Foto</DialogTitle>
                        <DialogDescription>
                            {total > 0 ? `${total} berkas · TA ${tahunAnggaran}` : `TA ${tahunAnggaran}`}
                        </DialogDescription>
                    </DialogHeader>
                    {allLoading ? (
                        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i}>
                                    <CardContent>
                                        <Skeleton className='h-36 w-full rounded-lg' />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : allItems.length > 0 ? (
                        <>
                            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                                {allItems.map((berkas) => (
                                    <DriveMediaCardItem
                                        key={berkas.id}
                                        item={toMediaItem(berkas)}
                                        mediaId={berkas.media_id ?? null}
                                        onDelete={() => handleDelete(berkas.id)}
                                    />
                                ))}
                            </div>
                            {lastPage > 1 ? (
                                <div className='flex items-center justify-between pt-2'>
                                    <p className='text-sm text-muted-foreground tabular-nums'>
                                        Halaman {allPage} dari {lastPage}
                                    </p>
                                    <div className='flex gap-1'>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            disabled={allPage <= 1}
                                            onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                                        >
                                            <ChevronLeft />
                                            Prev
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            disabled={allPage >= lastPage}
                                            onClick={() => setAllPage((p) => Math.min(lastPage, p + 1))}
                                        >
                                            Next
                                            <ChevronRight />
                                        </Button>
                                    </div>
                                </div>
                            ) : null}
                        </>
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
                </DialogContent>
            </Dialog>
        </section>
    )
}
