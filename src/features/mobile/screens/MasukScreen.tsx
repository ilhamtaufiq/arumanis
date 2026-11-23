import { UserAuthForm } from '@/features/auth/sign-in/components/user-auth-form'

/** Login mobile: layar penuh, logo besar, Google di atas, lalu email dan kata sandi. Logika masuk sama dengan web. */
export function MasukScreen({ redirect }: { redirect?: string }) {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6" style={{ paddingTop: 'calc(2.5rem + env(safe-area-inset-top))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
            <div className="flex flex-1 flex-col justify-center gap-8">
                <div className="flex flex-col items-center gap-4 text-center">
                    <img src="/logo-arumanis-cianjur-space.png" alt="Arumanis Cianjur Space" className="h-28 w-28 object-contain" />
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-extrabold tracking-tight">Masuk</h1>
                        <p className="text-sm text-muted-foreground">Pantau proyek dan lapangan dari ponsel Anda</p>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <UserAuthForm redirectTo={redirect} />
                </div>
            </div>

            <p className="pt-8 text-center text-xs text-muted-foreground">Arumanis · Air Minum & Sanitasi Cianjur</p>
        </main>
    )
}
