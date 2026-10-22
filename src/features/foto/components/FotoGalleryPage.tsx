import { useState } from 'react'
import { Camera, ImageIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { ImagePreviewModal } from '@/components/shared/ImagePreviewModal'
import { ListPagination } from '@/components/shared/ListPagination'
import { SearchInput } from '@/components/shared/SearchInput'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useDebounce } from '@/hooks/use-debounce'
import { useFotoList } from '../hooks/useFoto'
import { getFotoFullUrl, getFotoThumbUrl, tryFullFotoUrl } from '../lib/foto-url'
import type { Foto } from '../types'

const tanggalFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

/** Galeri foto progres pekerjaan. Dibuka dari `/foto`, menggantikan `/berkas?type=images`. */
export function FotoGalleryPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [preview, setPreview] = useState<Foto | null>(null)
    const debouncedSearch = useDebounce(search, 400)

    const { data, isLoading, isError, refetch } = useFotoList({
        page,
        search: debouncedSearch || undefined,
        tahun: tahunAnggaran,
    })

    const items = data?.data ?? []
    const total = data?.meta?.total ?? items.length
    const lastPage = data?.meta?.last_page ?? 1

    const handleSearch = (value: string) => {
        setSearch(value)
        setPage(1)
    }

    return (
        <>
            <Header fixed />

            <Main fluid className='w-full max-w-none px-3 pb-8 pt-4 sm:px-5'>
                <div className='flex w-full min-w-0 flex-col gap-4'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div>
                            <h1 className='flex items-center gap-2 text-xl font-bold tracking-tight'>
                                <Camera className='h-5 w-5' aria-hidden />
                                Foto
                            </h1>
                            <p className='text-sm text-muted-foreground'>
                                {total > 0 ? `${total} foto` : 'Foto progres pekerjaan'} · TA {tahunAnggaran}
                            </p>
                        </div>
                        <SearchInput
                            defaultValue={search}
                            onSearch={handleSearch}
                            placeholder='Cari foto atau nama paket...'
                            className='w-full sm:w-64'
                        />
                    </div>

                    {isLoading ? (
                        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5'>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <Skeleton key={i} className='aspect-square w-full rounded-lg' />
                            ))}
                        </div>
                    ) : isError ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant='icon'>
                                    <ImageIcon />
                                </EmptyMedia>
                                <EmptyTitle>Gagal memuat foto</EmptyTitle>
                                <EmptyDescription>
                                    Periksa koneksi lalu{' '}
                                    <button type='button' className='underline' onClick={() => void refetch()}>
                                        coba lagi
                                    </button>
                                    .
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : items.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant='icon'>
                                    <ImageIcon />
                                </EmptyMedia>
                                <EmptyTitle>{search ? 'Foto tidak ditemukan' : 'Belum ada foto'}</EmptyTitle>
                                <EmptyDescription>
                                    {search ? 'Coba kata kunci lain.' : `Belum ada foto untuk TA ${tahunAnggaran}.`}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <>
                            <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5'>
                                {items.map((foto) => (
                                    <li key={foto.id}>
                                        <Card className='h-full overflow-hidden'>
                                            <button
                                                type='button'
                                                onClick={() => setPreview(foto)}
                                                className='block w-full bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                                aria-label={`Lihat foto ${foto.pekerjaan?.nama_paket ?? ''}`}
                                            >
                                                <img
                                                    src={getFotoThumbUrl(foto)}
                                                    alt={foto.komponen?.komponen ?? 'Foto progres'}
                                                    loading='lazy'
                                                    onError={(e) => tryFullFotoUrl(e.currentTarget, foto)}
                                                    className='aspect-square w-full object-cover'
                                                />
                                            </button>
                                            <CardContent className='space-y-1.5 p-3'>
                                                <div className='flex flex-wrap items-center gap-1.5'>
                                                    <Badge variant='secondary' className='text-[10px]'>{foto.keterangan}</Badge>
                                                    {foto.created_at && (
                                                        <span className='text-[11px] text-muted-foreground'>
                                                            {tanggalFormatter.format(new Date(foto.created_at))}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className='line-clamp-2 text-xs font-medium leading-snug' title={foto.pekerjaan?.nama_paket}>
                                                    {foto.pekerjaan?.nama_paket ?? 'Tidak ada pekerjaan'}
                                                </p>
                                                {foto.komponen?.komponen && (
                                                    <p className='truncate text-[11px] text-muted-foreground'>{foto.komponen.komponen}</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </li>
                                ))}
                            </ul>

                            {lastPage > 1 && (
                                <ListPagination page={page} totalPages={lastPage} onPageChange={setPage} />
                            )}
                        </>
                    )}
                </div>
            </Main>

            <ImagePreviewModal
                open={preview !== null}
                onOpenChange={(open) => {
                    if (!open) setPreview(null)
                }}
                imageUrl={getFotoFullUrl(preview)}
                title={preview?.pekerjaan?.nama_paket ?? 'Preview Foto'}
                badge={preview?.keterangan}
                coordinate={preview?.koordinat}
            />
        </>
    )
}

export default FotoGalleryPage
