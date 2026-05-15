import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PublikasiEditor } from '@/features/publikasi/components/PublikasiEditor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select'
import { ArrowLeft, Save, Send, Lock, ShieldCheck } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { createPublikasi } from '@/features/publikasi/api'
import { useQueryClient } from '@tanstack/react-query'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/_authenticated/manajemen-publikasi/create')({
  component: CreatePublikasiPost,
})

function CreatePublikasiPost() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInternal, setIsInternal] = useState(false)

  const handleSubmit = async (publish: boolean) => {
    if (!title || !category || !content) {
        toast.error('Mohon lengkapi semua data artikel')
        return
    }

    setIsSubmitting(true)
    
    try {
        await createPublikasi({
            title,
            category,
            content,
            cover_image: coverImage,
            is_published: publish,
            is_internal: isInternal
        })
        
        await queryClient.invalidateQueries({ queryKey: ['publikasi'] })
        toast.success(publish ? 'Publikasi berhasil diterbitkan!' : 'Draft berhasil disimpan')
        navigate({ to: '/manajemen-publikasi' })
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal menyimpan publikasi')
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <Main>
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <Link 
                    to="/manajemen-publikasi" 
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors group"
                >
                    <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                    Batal
                </Link>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-full px-6"
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Draft
                    </Button>
                    <Button 
                        className="rounded-full px-6"
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Terbitkan
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 pl-1">Judul Artikel</label>
                    <Input 
                        placeholder="Masukkan judul yang menarik..." 
                        className="text-3xl md:text-4xl font-bold h-auto py-4 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent placeholder:text-slate-200 dark:placeholder:text-slate-800"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 pl-1">Kategori</label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
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
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 pl-1">Cover Image URL</label>
                        <Input 
                            placeholder="https://images.unsplash.com/..." 
                            className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900 border-none shadow-sm"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
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

                <div className="pt-8 space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 pl-1">Konten Publikasi</label>
                    <PublikasiEditor 
                        content={content} 
                        onChange={setContent} 
                    />
                </div>
            </div>
        </div>
      </Main>
    </>
  )
}
