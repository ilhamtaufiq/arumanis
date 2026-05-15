import { type PublikasiPost } from '../api'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Lock } from 'lucide-react'
import { useAppSettingsValues } from '@/hooks/use-app-settings'

export function PublikasiCard({ title, slug, content, category, published_at, cover_image, is_internal, is_published, user }: PublikasiPost) {
  const { logoUrl } = useAppSettingsValues()
  const excerpt = content.replace(/<[^>]*>?/gm, '').substring(0, 120)
  
  return (
    <div className="group flex flex-col space-y-6">
      <Link 
        to="/publikasi/$slug" 
        params={{ slug }}
        className="relative aspect-16/10 overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
      >
        <img 
          src={cover_image || logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'} 
          alt={title}
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute bottom-4 left-4">
            <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {category || 'Infrastruktur'}
            </span>
        </div>
      </Link>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          <span>{published_at ? new Date(published_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Draft'}</span>
          {user?.jabatan && (
            <>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span className="text-primary/80">{user.jabatan}</span>
            </>
          )}
          {!is_published && (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-bold">DRAFT</span>
          )}
          {is_internal && (
            <>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <div className="flex items-center gap-1 text-primary">
                <Lock className="h-3 w-3" />
                <span>Internal</span>
              </div>
            </>
          )}
        </div>
        
        <Link to="/publikasi/$slug" params={{ slug }}>
          <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
        </Link>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-light line-clamp-2">
          {excerpt}...
        </p>

        <Link 
            to="/publikasi/$slug" 
            params={{ slug }}
            className="inline-flex items-center gap-2 text-primary font-bold text-[11px] tracking-[0.2em] uppercase hover:gap-3 transition-all"
        >
            Baca Artikel
            <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
