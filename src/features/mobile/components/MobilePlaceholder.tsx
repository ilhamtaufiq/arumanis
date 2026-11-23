/** Layar yang belum dibangun. Dipakai sementara agar navigasi bawah tetap lengkap. */
export function MobilePlaceholder({ judul }: { judul: string }) {
    const nama = judul === 'lapangan' ? 'Lapangan' : 'Peta'
    return (
        <main className="mx-auto flex w-full max-w-md flex-col gap-2 px-4 py-10 text-center">
            <h1 className="text-xl font-bold">{nama}</h1>
            <p className="text-sm text-muted-foreground">Layar ini sedang disiapkan.</p>
        </main>
    )
}
