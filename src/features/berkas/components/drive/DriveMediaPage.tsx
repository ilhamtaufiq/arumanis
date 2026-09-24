import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Camera } from 'lucide-react'
import { SearchInput } from '@/components/shared/SearchInput'
import { deleteBerkas, getBerkasList } from '../../api'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useDebounce } from '@/hooks/use-debounce'
import { usePaperlessSyncedIds } from '../../hooks/usePaperless'
import { ProgressRekapPagination } from '@/features/progress/components/ProgressRekapPagination'
import { toMediaItem } from './drive-media-adapter'
import { DriveMediaCardItem } from './DriveMediaCardItem'

type DriveMediaPageProps = {
    page?: number
    search?: string
    onPageChange: (page: number) => void
    onSearchChange: (search: string) => void
}

const MEDIA_KEY = ['berkas', 'drive-media-page'] as const

/** Halaman khusus Dokumen & Foto: semua berkas Spatie + cari + pagination. */
export function DriveMediaPage({ page = 1, search = '', onPageChange, onSearchChange }: DriveMediaPageProps) {
    const { tahunAnggaran } = useAppSettingsValues()
    const queryClient = useQueryClient()
    const debouncedSearch = useDebounce(search, 400)

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: [...MEDIA_KEY, tahunAnggaran, page, debouncedSearch],
        queryFn: () => getBerkasList({ tahun: tahunAnggaran, page, search: debouncedSearch || undefined }),
        staleTime: 60_000,
    })

    const deleteMutation = useMutation({
        mutationFn: deleteBerkas,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
            toast.success('Dokumen berhasil dihapus')
        },
        onError: () => toast.error('Gagal menghapus dokumen'),
    })

    const items = data?.data ?? []
    const total = data?.meta?.total ?? items.length
    const lastPage = data?.meta?.last_page ?? 1
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
        <>
            <BannerNotification />
            <Header fixed />

            <Main fluid className='w-full max-w-none px-3 pb-8 pt-4 sm:px-5'>
                <div className='flex w-full min-w-0 flex-col gap-4'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div>
                            <Button variant='ghost' size='sm' asChild className='mb-1 -ml-2 text-muted-foreground'>
                                <Link to='/berkas'>
                                    <ArrowLeft />
                                    Drive Saya
                                </Link>
                            </Button>
                            <h1 className='text-xl font-bold tracking-tight'>Dokumen & Foto</h1>
                            <p className='text-sm text-muted-foreground'>
                                {total > 0 ? `${total} berkas` : 'Arsip Spatie Media Library'} · TA {tahunAnggaran}
                            </p>
                        </div>
                        <SearchInput
                            defaultValue={search}
                            onSearch={onSearchChange}
                            placeholder='Cari dokumen...'
                            className='w-full sm:w-64'
                        />
                    </div>

                    {isLoading ? (
                        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                            {Array.from({ length: 8 }).map((_, i) => (
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
                    ) : isError ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant='icon'>
                                    <Camera />
                                </EmptyMedia>
                                <EmptyTitle>Gagal memuat dokumen</EmptyTitle>
                                <EmptyDescription>
                                    Periksa koneksi lalu{' '}
                                    <button type='button' className='underline' onClick={() => void refetch()}>
                                        coba lagi
                                    </button>
                                    .
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : items.length > 0 ? (
                        <>
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
                            {lastPage > 1 ? (
                                <div className='flex justify-center'>
                                    <ProgressRekapPagination
                                        currentPage={page}
                                        totalPages={lastPage}
                                        onChange={onPageChange}
                                    />
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
                                <EmptyDescription>
                                    {debouncedSearch
                                        ? `Tidak ada hasil untuk "${debouncedSearch}".`
                                        : 'Dokumen dan foto pekerjaan akan muncul di sini.'}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}
                </div>
            </Main>
        </>
    )
}
