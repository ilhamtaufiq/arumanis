const MEME_SRC = '/maintenance/meme-cat.jpg'

/** Full-screen maintenance wall — copy lives on the meme image itself. */
export function MaintenancePage() {
    return (
        <div className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_10%_20%,#ffd6a5_0,transparent_40%),radial-gradient(circle_at_90%_80%,#a0c4ff_0,transparent_40%),#fff7e8] p-4 text-[#111]">
            <main className="w-full max-w-xl overflow-hidden border-4 border-[#111] bg-white shadow-[8px_8px_0_0_#111]">
                <img
                    src={MEME_SRC}
                    alt="BUKAN ERROR — Admin lagi ngopi sambil nge-debug. Jangan di-refresh dulu. Data aman... semoga."
                    className="block w-full bg-[#ffb703] object-cover"
                    width={800}
                    height={800}
                />
            </main>
        </div>
    )
}
