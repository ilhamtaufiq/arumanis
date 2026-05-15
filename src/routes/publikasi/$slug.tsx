import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getPublikasiDetail, type PublikasiPost } from '@/features/publikasi/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShieldAlert, Lock } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-stores'

export const Route = createFileRoute('/publikasi/$slug')({
  component: PublikasiDetailView,
})

function PublikasiDetailView() {
  const { slug } = Route.useParams()
  const { auth } = useAuthStore()
  
  const { data, isLoading } = useQuery({
    queryKey: ['publikasi', slug],
    queryFn: () => getPublikasiDetail(slug)
  })

  const post = data as PublikasiPost

  // Check if post is internal and user is not logged in
  if (post && post.is_internal && !auth.user) {
    return (
        <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center text-primary relative">
                    <ShieldAlert className="h-12 w-12" />
                    <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-950 p-1 rounded-full">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Postingan Khusus Internal</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Maaf, artikel ini hanya dapat diakses oleh personil terverifikasi. 
                    Silakan login untuk membaca konten lengkap.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/sign-in">
                    <Button className="rounded-full px-8 h-12 shadow-lg shadow-primary/20">Login Sekarang</Button>
                </Link>
                <Link to="/publikasi">
                    <Button variant="ghost" className="rounded-full px-8 h-12">Kembali ke Publikasi</Button>
                </Link>
            </div>
        </div>
    )
  }

  if (isLoading) {
    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8">
            <div className="flex justify-center"><Skeleton className="h-4 w-32" /></div>
            <Skeleton className="h-12 w-full" />
            <div className="flex justify-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-10 w-32" /></div>
            <Skeleton className="aspect-video w-full rounded-sm" />
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    )
  }

  if (!post) {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <h2 className="text-2xl font-bold">Publikasi tidak ditemukan</h2>
            <Link to="/publikasi" className="text-primary flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Publikasi
            </Link>
        </div>
    )
  }

  const date = post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Draft';

  return (
    <article className="max-w-2xl mx-auto animate-in fade-in duration-1000">
        <div className="space-y-8 mb-16 text-center">
            <div className="flex justify-center items-center gap-4 text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400">
                <span>{post.category || 'Tanpa Kategori'}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                <span>{date}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.15]">
                {post.title}
            </h1>
            <div className="flex items-center justify-center gap-3 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold overflow-hidden">
                    {post.user.avatar ? (
                        <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
                    ) : (
                        post.user.name.charAt(0)
                    )}
                </div>
                <div className="text-left">
                    <p className="text-[12px] font-bold uppercase tracking-wider">{post.user.jabatan || 'Penulis'}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Tim Publikasi</p>
                </div>
            </div>
        </div>

        {post.cover_image && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-16 shadow-2xl bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <img 
                    src={post.cover_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                />
            </div>
        )}

        <div 
            className="prose prose-slate dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight 
                prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg
                prose-blockquote:border-primary/20 prose-blockquote:italic prose-blockquote:text-xl prose-blockquote:font-light
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-24 pt-12 border-t flex flex-col items-center gap-10">
            <Link 
                to="/publikasi" 
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-black text-primary hover:tracking-[0.4em] transition-all duration-500"
            >
                Lihat Arsip Publikasi
            </Link>
        </div>
    </article>
  )
}
