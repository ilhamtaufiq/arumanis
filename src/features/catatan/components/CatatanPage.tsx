import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, StickyNote, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useAuthStore } from '@/stores/auth-stores'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { SearchInput } from '@/components/shared/SearchInput'
import { CATATAN_KEY, createCatatan, deleteCatatan, getCatatan, updateCatatan, type Catatan } from '../api'

const tanggalFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function labelSumber(sumber: string) {
    return sumber === 'whatsapp' ? 'WhatsApp' : 'Aplikasi'
}

/** Catatan pribadi user. Dibuat dari aplikasi atau dari perintah "@arumanis catat" di WhatsApp. */
export function CatatanPage() {
    const queryClient = useQueryClient()
    const { auth } = useAuthStore()
    const isAdmin = auth.user?.roles?.some((role) => role === 'admin') ?? false
    const [q, setQ] = useState('')
    const [page, setPage] = useState(1)
    const [semua, setSemua] = useState(false)
    const [baru, setBaru] = useState('')
    const [editId, setEditId] = useState<number | null>(null)
    const [editIsi, setEditIsi] = useState('')

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: [...CATATAN_KEY, q, page, semua],
        queryFn: () => getCatatan({ q: q || undefined, page, semua: isAdmin && semua }),
    })

    const muatUlang = () => queryClient.invalidateQueries({ queryKey: CATATAN_KEY })

    const simpan = useMutation({
        mutationFn: (isi: string) => createCatatan(isi),
        onSuccess: () => {
            setBaru('')
            toast.success('Catatan disimpan')
            void muatUlang()
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menyimpan catatan')),
    })

    const ubah = useMutation({
        mutationFn: ({ id, isi }: { id: number; isi: string }) => updateCatatan(id, isi),
        onSuccess: () => {
            setEditId(null)
            toast.success('Catatan diubah')
            void muatUlang()
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal mengubah catatan')),
    })

    const hapus = useMutation({
        mutationFn: (id: number) => deleteCatatan(id),
        onSuccess: () => {
            toast.success('Catatan dihapus')
            void muatUlang()
        },
        onError: (err) => toast.error(getApiErrorMessage(err, 'Gagal menghapus catatan')),
    })

    const daftar: Catatan[] = data?.catatan.data ?? []
    const lastPage = data?.catatan.last_page ?? 1

    const mulaiUbah = (c: Catatan) => {
        setEditId(c.id)
        setEditIsi(c.isi)
    }

    return (
        <div className='mx-auto flex w-full max-w-3xl flex-col gap-4'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
                <div>
                    <h1 className='flex items-center gap-2 text-xl font-bold tracking-tight'>
                        <StickyNote className='h-5 w-5' aria-hidden />
                        Catatan
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Catatan pribadi Anda. Bisa juga dibuat dari WhatsApp dengan membalas pesan lalu mention @arumanis catat.
                    </p>
                </div>
                {isAdmin && (
                    <Button variant={semua ? 'default' : 'outline'} size='sm' onClick={() => { setSemua((v) => !v); setPage(1) }}>
                        {semua ? 'Catatan saya' : 'Tampilkan semua'}
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className='text-base'>Catatan baru</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                    <Textarea
                        value={baru}
                        onChange={(e) => setBaru(e.target.value)}
                        placeholder='Tulis catatan...'
                        rows={3}
                        maxLength={10000}
                    />
                    <div className='flex justify-end'>
                        <Button disabled={!baru.trim() || simpan.isPending} onClick={() => simpan.mutate(baru)}>
                            {simpan.isPending ? <Loader2 className='animate-spin' /> : <Plus />}
                            Simpan
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <SearchInput
                defaultValue={q}
                onSearch={(v) => { setQ(v); setPage(1) }}
                placeholder='Cari catatan...'
                className='w-full'
            />

            {isLoading ? (
                <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Loader2 className='h-4 w-4 animate-spin' /> Memuat catatan...
                </p>
            ) : isError ? (
                <div className='space-y-2'>
                    <p className='text-sm text-destructive'>Catatan tidak bisa dimuat.</p>
                    <Button variant='outline' size='sm' onClick={() => void refetch()}>Coba lagi</Button>
                </div>
            ) : daftar.length === 0 ? (
                <p className='rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground'>
                    {q ? 'Tidak ada catatan yang cocok.' : 'Belum ada catatan.'}
                </p>
            ) : (
                <ul className='space-y-3'>
                    {daftar.map((c) => (
                        <li key={c.id}>
                            <Card>
                                <CardContent className='space-y-2 p-4'>
                                    <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                                        <Badge variant='secondary'>{labelSumber(c.sumber)}</Badge>
                                        {semua && c.user_nama && <span>{c.user_nama}</span>}
                                        {c.created_at && <span>{tanggalFormatter.format(new Date(c.created_at))}</span>}
                                    </div>

                                    {editId === c.id ? (
                                        <div className='space-y-2'>
                                            <Textarea value={editIsi} onChange={(e) => setEditIsi(e.target.value)} rows={4} maxLength={10000} />
                                            <div className='flex justify-end gap-2'>
                                                <Button variant='ghost' size='sm' onClick={() => setEditId(null)}>
                                                    <X /> Batal
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    disabled={!editIsi.trim() || ubah.isPending}
                                                    onClick={() => ubah.mutate({ id: c.id, isi: editIsi })}
                                                >
                                                    Simpan perubahan
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className='whitespace-pre-wrap text-sm'>{c.isi}</p>
                                            {c.lampiran && c.lampiran.length > 0 && (
                                                <div className='flex flex-wrap gap-2'>
                                                    {c.lampiran.map((l) =>
                                                        l.mime_type.startsWith('image/') ? (
                                                            <a key={l.url} href={l.url} target='_blank' rel='noreferrer'>
                                                                <img
                                                                    src={l.thumb || l.url}
                                                                    alt='Lampiran catatan'
                                                                    loading='lazy'
                                                                    className='h-24 w-24 rounded-md border object-cover'
                                                                />
                                                            </a>
                                                        ) : (
                                                            <a
                                                                key={l.url}
                                                                href={l.url}
                                                                target='_blank'
                                                                rel='noreferrer'
                                                                className='rounded-md border px-3 py-2 text-sm underline'
                                                            >
                                                                Buka berkas
                                                            </a>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                            <div className='flex justify-end gap-2'>
                                                <Button variant='ghost' size='sm' onClick={() => mulaiUbah(c)}>
                                                    <Pencil /> Ubah
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='text-destructive'
                                                    disabled={hapus.isPending}
                                                    onClick={() => {
                                                        if (window.confirm('Hapus catatan ini?')) hapus.mutate(c.id)
                                                    }}
                                                >
                                                    <Trash2 /> Hapus
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}

            {lastPage > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <Button variant='outline' size='sm' disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
                    <span className='text-sm text-muted-foreground'>{page} / {lastPage}</span>
                    <Button variant='outline' size='sm' disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>Berikutnya</Button>
                </div>
            )}
        </div>
    )
}

export default CatatanPage
