import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getPublikasiDetail, type PublikasiPost } from '@/features/publikasi/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/manajemen-publikasi/$slug')({
  component: PublikasiDetailView,
})

function PublikasiDetailView() {
  const { slug } = Route.useParams()
  
  const { data, isLoading } = useQuery({
    queryKey: ['publikasi', slug],
    queryFn: () => getPublikasiDetail(slug)
  })

  const post = data as PublikasiPost

  if (isLoading) {
    return (
        <>
            <Header />
            <Main>
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
            </Main>
        </>
    )
  }

  if (!post) {
    return (
        <>
            <Header />
            <Main>
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <h2 className="text-2xl font-bold">Publikasi tidak ditemukan</h2>
                    <Link to="/manajemen-publikasi" className="text-primary flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Manajemen
                    </Link>
                </div>
            </Main>
        </>
    )
  }

  const date = post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Draft';

  return (
    <>
        <Header />
        <Main>
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
                            <p className="text-[12px] font-bold uppercase tracking-wider">{post.user.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Penulis</p>
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
                        to="/manajemen-publikasi" 
                        className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-black text-primary hover:tracking-[0.4em] transition-all duration-500"
                    >
                        Kembali ke Manajemen
                    </Link>
                </div>
            </article>
        </Main>
    </>
  )
}
