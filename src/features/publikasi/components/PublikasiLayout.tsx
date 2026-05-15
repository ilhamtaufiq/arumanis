import type { ReactNode } from 'react'
import { PublikasiHeader } from './PublikasiHeader'
import { useAppSettingsValues } from '@/hooks/use-app-settings'

interface PublikasiLayoutProps {
  children: ReactNode
}

export function PublikasiLayout({ children }: PublikasiLayoutProps) {
  const { appName, appDescription } = useAppSettingsValues()
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-primary/10 selection:text-primary">
      <PublikasiHeader />
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        {children}
      </main>
      
      {/* Footer minimalis */}
      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-slate-100 dark:border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
                <h4 className="text-xl font-bold italic tracking-tight">{appName || 'Arumanis'} <span className="text-primary">Publikasi</span></h4>
                <p className="text-slate-400 text-sm max-w-sm">{appDescription || 'Membangun transparansi melalui informasi pembangunan infrastruktur yang akurat dan terpercaya.'}</p>
            </div>
            <div className="flex justify-end gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
                <a href="#" className="hover:text-primary transition-colors">Hubungi Kami</a>
            </div>
        </div>
      </footer>
    </div>
  )
}
