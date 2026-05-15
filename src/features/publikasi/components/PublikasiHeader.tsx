import { Link, useSearch } from '@tanstack/react-router'
import { Newspaper } from 'lucide-react'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { cn } from '@/lib/utils'

export function PublikasiHeader() {
  const { logoUrl, appName } = useAppSettingsValues()
  const finalLogo = logoUrl || '/arumanis.svg'
  const search = useSearch({ strict: false }) as any
  const activeCategory = search?.category as string | undefined

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <Link 
          to="/publikasi" 
          className="flex items-center gap-3 group"
        >
          {logoUrl ? (
            <img 
              src={finalLogo} 
              alt={appName || 'Logo'} 
              className="h-10 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
              <Newspaper className="h-5 w-5" />
            </div>
          )}
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-bold tracking-tight uppercase">{appName || 'ARUMANIS'}</span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Publikasi</span>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-10">
              {['Berita', 'Galeri', 'Informasi Publik', 'Dokumentasi'].map((item) => (
                  <Link 
                      key={item}
                      to="/publikasi" 
                      search={{ category: item }}
                      className={cn(
                        "text-[11px] uppercase tracking-[0.2em] font-bold transition-colors",
                        activeCategory === item ? "text-primary" : "text-slate-400 hover:text-primary"
                      )}
                  >
                      {item}
                  </Link>
              ))}
          </nav>

          <div className="flex items-center pl-8 border-l border-slate-100 dark:border-slate-900">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
