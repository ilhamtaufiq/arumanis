import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPublikasi, deletePublikasi, type PublikasiPost } from '../api'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    Plus, 
    Edit, 
    Trash2, 
    ExternalLink, 
    Search,
    MoreHorizontal,
    FileText,
    CheckCircle2,
    Clock
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export function PublikasiManagement() {
    const [searchTerm, setSearchTerm] = useState('')
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['publikasi'],
        queryFn: () => getPublikasi()
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePublikasi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['publikasi'] })
            toast.success('Publikasi berhasil dihapus')
        },
        onError: () => {
            toast.error('Gagal menghapus publikasi')
        }
    })

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus publikasi ini?')) {
            deleteMutation.mutate(id)
        }
    }

    const posts = data?.data || []
    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>
            <Header />
            <Main>
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Manajemen Publikasi</h1>
                            <p className="text-muted-foreground text-sm">
                                Kelola artikel, berita, dan pengumuman untuk portal publik.
                            </p>
                        </div>
                        <Link to="/manajemen-publikasi/create">
                            <Button className="rounded-full gap-2">
                                <Plus className="h-4 w-4" />
                                Buat Publikasi Baru
                            </Button>
                        </Link>
                    </div>

                    <Card className="border-none shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-muted/20">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari publikasi..." 
                                    className="pl-9 bg-background rounded-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[400px]">Judul & Kategori</TableHead>
                                    <TableHead>Penulis</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5}><div className="h-12 w-full animate-pulse bg-muted rounded" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredPosts.length > 0 ? (
                                    filteredPosts.map((post: PublikasiPost) => (
                                        <TableRow key={post.id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                                                        {post.cover_image ? (
                                                            <img src={post.cover_image} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold truncate">{post.title}</span>
                                                        <span className="text-xs text-muted-foreground">{post.category || 'Tanpa Kategori'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{post.user.name}</span>
                                            </TableCell>
                                            <TableCell>
                                                {post.is_published ? (
                                                    <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Terbit
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="gap-1 text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        Draft
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground">
                                                    {post.published_at 
                                                        ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: idLocale })
                                                        : format(new Date(post.created_at), 'dd MMM yyyy', { locale: idLocale })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link to="/manajemen-publikasi/$id/edit" params={{ id: post.id.toString() }} className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Artikel
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to="/publikasi/$slug" params={{ slug: post.slug }} className="cursor-pointer">
                                                                <ExternalLink className="mr-2 h-4 w-4" /> Lihat Publik
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive cursor-pointer"
                                                            onClick={() => handleDelete(post.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            Tidak ada publikasi ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </Main>
        </>
    )
}

function Card({ children, className, ...props }: any) {
    return (
        <div className={`bg-card text-card-foreground rounded-xl border ${className}`} {...props}>
            {children}
        </div>
    )
}
