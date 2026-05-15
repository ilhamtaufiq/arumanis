import { useQuery } from '@tanstack/react-query'
import { PublikasiCard } from './PublikasiCard'
import { getPublikasi, type PublikasiPost } from '../api'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from '@tanstack/react-router'
import { Newspaper, ArrowRight, Lock } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-stores'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useSearch } from '@tanstack/react-router'

export function PublikasiList() {
    const { auth } = useAuthStore()
    const { logoUrl } = useAppSettingsValues()
    const { category: selectedCategory } = useSearch({ from: '/publikasi' })
    
    
    const { data, isLoading } = useQuery({
        queryKey: ['publikasi'],
        queryFn: () => getPublikasi()
    })

    // Filter posts: hide drafts in public view
    // Guests also hide internal posts
    const allPosts = data?.data || []
    let posts = allPosts.filter(post => post.is_published)
    
    if (!auth.user) {
        posts = posts.filter(post => !post.is_internal)
    }
    
    // Apply category filter
    if (selectedCategory) {
        posts = posts.filter(post => post.category === selectedCategory)
    }
    
    const featuredPost = posts.length > 0 ? posts[0] : null
    const regularPosts = posts.length > 1 ? posts.slice(1) : []

    return (
        <section className="space-y-24 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col gap-10 border-l-2 border-primary/20 pl-8 py-2">
                <div className="max-w-3xl space-y-4">
                    <h2 className="text-5xl font-bold tracking-tight">
                        Arumanis <span className="italic text-primary font-medium">Publikasi</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-light">
                        Publikasi Bidang Air Minum dan Sanitasi Kabupaten Cianjur
                    </p>
                    
                    {selectedCategory && (
                        <div className="flex items-center gap-3 pt-4">
                            <span className="h-px w-8 bg-primary"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Kategori: {selectedCategory}</span>
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <div className="space-y-6">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-5">
                                <Skeleton className="aspect-video w-full rounded-lg" />
                                <div className="space-y-3">
                                    <Skeleton className="h-3 w-1/4" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : posts.length > 0 ? (
                <div className="space-y-24">
                    {/* Featured Post */}
                    {featuredPost && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group cursor-pointer">
                            <Link 
                                to="/publikasi/$slug" 
                                params={{ slug: featuredPost.slug }}
                                className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800"
                            >
                                <img 
                                    src={featuredPost.cover_image || logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop'} 
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                />
                                <div className="absolute top-6 left-6 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full shadow-2xl shadow-primary/40 border border-white/10">
                                    Artikel Utama
                                </div>
                            </Link>
                            <div className="flex flex-col space-y-6">
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                                    <span>{featuredPost.category || 'Visi'}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                    <span>{featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft'}</span>
                                    {featuredPost.user?.jabatan && (
                                        <>
                                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                            <span className="text-primary">{featuredPost.user.jabatan}</span>
                                        </>
                                    )}
                                    {!featuredPost.is_published && (
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded text-[9px] font-bold">DRAFT</span>
                                    )}
                                    {featuredPost.is_internal && (
                                        <>
                                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                            <div className="flex items-center gap-1.5 text-primary">
                                                <Lock className="h-3 w-3" />
                                                <span>Internal</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <Link 
                                    to="/publikasi/$slug" 
                                    params={{ slug: featuredPost.slug }}
                                >
                                    <h3 className="text-4xl font-bold leading-[1.1] group-hover:text-primary transition-colors duration-300">
                                        {featuredPost.title}
                                    </h3>
                                </Link>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-light line-clamp-3">
                                    {featuredPost.content.replace(/<[^>]*>?/gm, '').substring(0, 200)}...
                                </p>
                                <Link 
                                    to="/publikasi/$slug" 
                                    params={{ slug: featuredPost.slug }}
                                    className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase hover:gap-4 transition-all"
                                >
                                    Baca Selengkapnya
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Regular Posts Grid */}
                    {regularPosts.length > 0 && (
                        <div className="space-y-12">
                            <div className="flex items-center gap-4">
                                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Update Terbaru</h4>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-20">
                                {regularPosts.map((post: PublikasiPost) => (
                                    <PublikasiCard key={post.id} {...post} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 border-2 border-dashed rounded-3xl border-slate-100 dark:border-slate-800">
                    <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-800">
                        <Newspaper className="h-10 w-10" />
                    </div>
                    <div className="space-y-2 max-w-sm">
                        <h3 className="text-xl font-bold">Belum ada publikasi</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Arumanis Publikasi sedang dalam persiapan. Segera hadir dengan berita-berita menarik seputar pembangunan daerah.</p>
                    </div>
                </div>
            )}

            {data?.meta && data.meta.last_page > 1 && (
                <div className="flex justify-center pt-20 border-t">
                    <button className="text-[12px] uppercase tracking-[0.3em] font-bold text-slate-400 hover:text-primary transition-colors py-4 px-8">
                        Lihat Arsip
                    </button>
                </div>
            )}
        </section>
    )
}
