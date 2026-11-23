import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, LogOut, Settings } from 'lucide-react'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useAuthStore } from '@/stores/auth-stores'

function namaPeran(r: unknown): string {
    return typeof r === 'string' ? r : ((r as { name?: string }).name ?? '')
}

/** Profil ringkas untuk ponsel: data akun, pintasan ke profil lengkap, dan keluar. */
export function ProfilScreen() {
    const user = useAuthStore((s) => s.auth.user)
    const [keluarBuka, setKeluarBuka] = useState(false)
    const inisial = (user?.name ?? 'A').trim().charAt(0).toUpperCase()
    const peran = (user?.roles ?? []).map(namaPeran).filter(Boolean)

    return (
        <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-8 pt-6">
            <section className="flex flex-col items-center gap-3 rounded-2xl border bg-background p-6 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-primary/15 text-2xl font-bold text-primary">{inisial}</span>
                <div className="flex flex-col gap-1">
                    <h1 className="text-lg font-bold">{user?.name ?? 'Pengguna'}</h1>
                    {user?.email ? <p className="text-sm text-muted-foreground">{user.email}</p> : null}
                </div>
                {peran.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                        {peran.map((p) => (
                            <span key={p} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">{p}</span>
                        ))}
                    </div>
                ) : null}
            </section>

            <section aria-label="Pengaturan" className="overflow-hidden rounded-2xl border bg-background">
                <Link to={'/profile' as never} className="flex items-center gap-3 px-4 py-4 text-sm font-medium">
                    <Settings className="h-5 w-5 text-muted-foreground" aria-hidden />
                    <span className="flex-1">Profil lengkap & pengaturan</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
            </section>

            <section aria-label="Keluar" className="overflow-hidden rounded-2xl border bg-background">
                <button type="button" onClick={() => setKeluarBuka(true)} className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-medium text-red-600">
                    <LogOut className="h-5 w-5" aria-hidden />
                    Keluar dari akun
                </button>
            </section>

            <SignOutDialog open={keluarBuka} onOpenChange={setKeluarBuka} />
        </main>
    )
}
