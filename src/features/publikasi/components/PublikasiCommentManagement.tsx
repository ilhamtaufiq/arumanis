import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
    ExternalLink,
    Loader2,
    MessageSquare,
    Search,
    Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    deletePublikasiComment,
    getAdminPublikasiComments,
    type PublikasiCommentAdmin,
} from '../api/comments'

type PublikasiCommentManagementProps = {
    initialBlogId?: number
}

export function PublikasiCommentManagement({ initialBlogId }: PublikasiCommentManagementProps) {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<'all' | 'active' | 'deleted'>('all')
    const [deleteTarget, setDeleteTarget] = useState<PublikasiCommentAdmin | null>(null)

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['publikasi-comments-admin', page, search, status, initialBlogId],
        queryFn: () =>
            getAdminPublikasiComments({
                page,
                search: search.trim() || undefined,
                status,
                blog_id: initialBlogId,
            }),
    })

    const deleteMutation = useMutation({
        mutationFn: (commentId: number) => deletePublikasiComment(commentId),
        onSuccess: () => {
            toast.success('Komentar dihapus')
            setDeleteTarget(null)
            void queryClient.invalidateQueries({ queryKey: ['publikasi-comments-admin'] })
            void queryClient.invalidateQueries({ queryKey: ['publikasi'] })
        },
        onError: () => toast.error('Gagal menghapus komentar'),
    })

    const comments = data?.data ?? []
    const meta = data?.meta

    return (
        <>
            <Header />
            <Main>
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Komentar Publikasi</h1>
                            <p className="text-sm text-muted-foreground">
                                {initialBlogId
                                    ? 'Menampilkan komentar untuk artikel terpilih.'
                                    : 'Pantau dan moderasi semua komentar lintas artikel.'}
                            </p>
                        </div>
                        <Link to="/manajemen-publikasi">
                            <Button variant="outline" className="rounded-full">
                                Kembali ke Manajemen Publikasi
                            </Button>
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 md:flex-row md:items-center">
                            <div className="relative w-full md:max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari komentar, penulis, atau judul artikel..."
                                    className="rounded-full bg-background pl-9"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value)
                                        setPage(1)
                                    }}
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={(value) => {
                                    setStatus(value as 'all' | 'active' | 'deleted')
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger className="w-full rounded-full md:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="deleted">Dihapus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Penulis</TableHead>
                                    <TableHead className="min-w-[280px]">Komentar</TableHead>
                                    <TableHead>Artikel</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell colSpan={6}>
                                                <div className="h-12 w-full animate-pulse rounded bg-muted" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <p className="text-sm text-destructive">Gagal memuat komentar.</p>
                                            <Button
                                                variant="link"
                                                className="mt-2"
                                                onClick={() => refetch()}
                                            >
                                                Coba lagi
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ) : comments.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <MessageSquare className="mx-auto mb-2 h-5 w-5 opacity-50" />
                                            Belum ada komentar ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    comments.map((comment) => (
                                        <TableRow key={comment.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <UserAvatar
                                                        className="h-8 w-8"
                                                        fallbackClassName="text-xs"
                                                        avatar={comment.user?.avatar}
                                                        gender={comment.user?.gender}
                                                        name={comment.user?.name}
                                                        id={comment.user?.id}
                                                    />
                                                    <span className="text-sm font-medium">
                                                        {comment.is_deleted
                                                            ? '[dihapus]'
                                                            : comment.user?.name ?? 'Pengguna'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                    {comment.is_deleted
                                                        ? 'Komentar ini telah dihapus.'
                                                        : comment.body_preview || comment.body}
                                                </p>
                                                {comment.depth > 0 ? (
                                                    <span className="mt-1 inline-block text-xs text-muted-foreground">
                                                        Balasan level {comment.depth}
                                                    </span>
                                                ) : null}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="line-clamp-2 text-sm font-medium">
                                                        {comment.blog.title}
                                                    </p>
                                                    <Link
                                                        to="/manajemen-publikasi/$id/edit"
                                                        params={{ id: String(comment.blog.id) }}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Buka editor
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {comment.is_deleted ? (
                                                    <Badge variant="outline">Dihapus</Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-green-50 text-green-700"
                                                    >
                                                        Aktif
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(comment.created_at), 'dd MMM yyyy HH:mm', {
                                                        locale: idLocale,
                                                    })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {comment.blog.is_published && !comment.is_deleted ? (
                                                        <Link
                                                            to="/publikasi/$slug"
                                                            params={{ slug: comment.blog.slug }}
                                                            hash={`comment-${comment.id}`}
                                                        >
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    ) : null}
                                                    {comment.can_delete && !comment.is_deleted ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => setDeleteTarget(comment)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {meta && meta.last_page > 1 ? (
                            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                                <span className="text-muted-foreground">
                                    Halaman {meta.current_page} dari {meta.last_page} ({meta.total} komentar)
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1 || isFetching}
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= meta.last_page || isFetching}
                                        onClick={() =>
                                            setPage((current) => Math.min(meta.last_page, current + 1))
                                        }
                                    >
                                        {isFetching ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memuat
                                            </>
                                        ) : (
                                            'Berikutnya'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </Main>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Hapus komentar?"
                desc="Komentar ini akan ditandai sebagai dihapus dan tidak dapat dipulihkan."
                confirmText="Hapus"
                destructive
                isLoading={deleteMutation.isPending}
                handleConfirm={() => {
                    if (deleteTarget) {
                        deleteMutation.mutate(deleteTarget.id)
                    }
                }}
            />
        </>
    )
}