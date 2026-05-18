import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ShieldAlert, ArrowLeft, Home, RefreshCw, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Grainient from '@/components/ui/Grainient'
import { useAuthStore } from '@/stores/auth-stores'
import { getCurrentUser } from '@/features/auth/api'
import { toast } from 'sonner'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
})

function UnauthorizedPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { auth } = useAuthStore()
  const navigate = useNavigate()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await getCurrentUser() as any
      let userData = response
      if (response && response.data) userData = response.data
      if (userData && userData.user) userData = userData.user

      auth.setUser(userData)
      
      // Check if roles changed (no longer only 'user')
      if (!(userData.roles.includes('user') && userData.roles.length === 1)) {
        toast.success('Izin berhasil diperbarui! Mengalihkan ke Dashboard...')
        navigate({ to: '/dashboard' })
      } else {
        toast.info('Izin Anda masih terbatas pada role User.')
      }
    } catch (error) {
      toast.error('Gagal memperbarui izin.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = () => {
    auth.reset()
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      <Grainient
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        color1="#FF4D4D"
        color2="#A10000"
        color3="#4D0000"
      />
      
      <div className="relative z-10 max-w-md w-full px-6 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
          Akses Terbatas
        </h1>
        
        <p className="text-slate-400 mb-10 leading-relaxed">
          Mohon maaf, akun Anda ({auth.user?.email}) saat ini hanya memiliki akses sebagai <strong>User</strong>. 
          Silakan hubungi Administrator untuk meningkatkan hak akses Anda agar dapat masuk ke Dashboard.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full bg-white text-black hover:bg-slate-200 gap-2 font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Memperbarui...' : 'Muat Ulang Izin'}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/">
              <Button variant="outline" className="w-full border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white gap-2">
                <Home className="w-4 h-4" />
                Landing Page
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full border-slate-800 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-slate-300 gap-2 mt-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-900">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">
            Sistem Keamanan Arumanis
          </p>
        </div>
      </div>
    </div>
  )
}
