import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PublikasiEditor } from '@/features/publikasi/components/PublikasiEditor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select'
import { ArrowLeft, Save, Send, Loader2, ShieldCheck, Lock } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getPublikasiDetail, updatePublikasi } from '@/features/publikasi/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Switch } from '@/components/ui/switch'

export const Route = createFileRoute('/_authenticated/manajemen-publikasi/$id/edit')({
  component: EditPublikasiPost,
})

function EditPublikasiPost() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: publikasi, isLoading } = useQuery({
    queryKey: ['publikasi', id],
    queryFn: () => getPublikasiDetail(Number(id))
  })

  useEffect(() => {
    if (publikasi) {
        setTitle(publikasi.title)
        setCategory(publikasi.category || '')
        setContent(publikasi.content)
        setCoverImage(publikasi.cover_image || '')
        setIsInternal(publikasi.is_internal || false)
    }
  }, [publikasi])

  const handleSubmit = async (publish: boolean) => {
    if (!title || !category || !content) {
        toast.error('Mohon lengkapi semua data publikasi')
        return
    }

    setIsSubmitting(true)
    
    try {
        await updatePublikasi(Number(id), {
            title,
            category,
            content,
            cover_image: coverImage,
            is_published: publish,
            is_internal: isInternal
        })
        
        await queryClient.invalidateQueries({ queryKey: ['publikasi'] })
        await queryClient.invalidateQueries({ queryKey: ['publikasi', id] })
        toast.success(publish ? 'Publikasi berhasil diperbarui!' : 'Draft berhasil diperbarui')
        navigate({ to: '/manajemen-publikasi' })
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal memperbarui publikasi')
    } finally {
        setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
        <>
            <Header />
            <Main>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Main>
        </>
    )
  }

  return (
    <>
        <Header />
        <Main>
            <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                    <Link 
                        to="/manajemen-publikasi" 
                        className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Publikasi
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            className="rounded-full px-6 gap-2"
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting}
                        >
                            <Save className="h-4 w-4" />
                            Simpan Draft
                        </Button>
                        <Button 
                            className="rounded-full px-6 gap-2"
                            onClick={() => handleSubmit(true)}
                            disabled={isSubmitting}
                        >
                            <Send className="h-4 w-4" />
                            Terbitkan
                        </Button>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Judul Publikasi</Label>
                            <Input 
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Masukkan judul yang menarik..."
                                className="text-3xl font-bold border-none px-0 focus-visible:ring-0 placeholder:text-slate-200 dark:placeholder:text-slate-800 bg-transparent"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Kategori</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger id="category" className="border-none px-0 focus:ring-0 font-medium bg-transparent h-auto py-2">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Berita">Berita</SelectItem>
                                    <SelectItem value="Galeri">Galeri</SelectItem>
                                    <SelectItem value="Informasi Publik">Informasi Publik</SelectItem>
                                    <SelectItem value="Dokumentasi">Dokumentasi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cover_image" className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Cover Image URL</Label>
                            <Input 
                                id="cover_image"
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="border-none px-0 focus-visible:ring-0 font-medium bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 flex items-center justify-between border border-primary/10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="internal-toggle" className="text-base font-bold flex items-center gap-2">
                                    Postingan Internal
                                    {isInternal && <Lock className="h-3 w-3 text-primary" />}
                                </Label>
                                <p className="text-xs text-slate-400">Jika diaktifkan, postingan ini hanya dapat dilihat oleh user yang sudah login.</p>
                            </div>
                        </div>
                        <Switch 
                            id="internal-toggle" 
                            checked={isInternal} 
                            onCheckedChange={setIsInternal} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Konten Publikasi</Label>
                        <PublikasiEditor content={content} onChange={setContent} />
                    </div>
                </div>
            </div>
        </Main>
    </>
  )
}
