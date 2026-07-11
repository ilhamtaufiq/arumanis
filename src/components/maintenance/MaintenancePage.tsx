const MEME_SRC = '/maintenance/meme-cat.jpg'

const MEME_LINES = [
    '☕ Admin lagi ngopi sambil nge-debug (produktif kok).',
    '🧘 Server meditasi. Jangan diganggu, dia sensitif.',
    '🍜 Loading… bohong, ini maintenance.',
    '🙏 Data kamu aman… semoga. (Aamiin bareng-bareng.)',
    '🔧 Kalau masih error setelah ini, ya… kita tembak lagi nanti.',
]

type MaintenancePageProps = {
    /** Show small link to sign-in for bypass admin */
    showSignInLink?: boolean
}

export function MaintenancePage({ showSignInLink = true }: MaintenancePageProps) {
    return (
        <div className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_10%_20%,#ffd6a5_0,transparent_40%),radial-gradient(circle_at_90%_80%,#a0c4ff_0,transparent_40%),#fff7e8] p-4 text-[#111]">
            <main className="w-full max-w-xl overflow-hidden border-4 border-[#111] bg-white shadow-[8px_8px_0_0_#111]">
                <img
                    src={MEME_SRC}
                    alt="BUKAN ERROR — Admin lagi ngopi sambil nge-debug"
                    className="block w-full border-b-4 border-[#111] bg-[#ffb703] object-cover"
                    width={800}
                    height={800}
                />
                <div className="space-y-3 p-5">
                    <span className="inline-block border-[3px] border-[#111] bg-[#ffb703] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]">
                        Status: cuti sejenak
                    </span>
                    <h1 className="text-2xl font-black uppercase tracking-wide">Maintenance Mode</h1>
                    <p className="text-base font-bold leading-snug">
                        Bukan error. Server lagi healing 🧘 — mohon jangan di-refresh 47 kali.
                    </p>
                    <ul className="space-y-2 text-sm font-semibold">
                        {MEME_LINES.map((line) => (
                            <li
                                key={line}
                                className="border-[3px] border-[#111] bg-[#fffef8] px-3 py-2"
                            >
                                {line}
                            </li>
                        ))}
                    </ul>
                    <p className="flex items-center gap-2 text-sm font-bold">
                        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full border-2 border-[#111] bg-[#ff6b6b]" />
                        Sistem offline sementara · coba lagi beberapa menit
                    </p>
                    {showSignInLink ? (
                        <p className="border-t-[3px] border-dashed border-[#111] pt-3 text-xs font-semibold text-[#444]">
                            Admin bypass?{' '}
                            <a href="/sign-in" className="underline underline-offset-2">
                                Masuk di sini
                            </a>
                        </p>
                    ) : null}
                </div>
            </main>
        </div>
    )
}
