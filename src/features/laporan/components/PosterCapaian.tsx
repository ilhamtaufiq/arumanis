import { forwardRef, type CSSProperties } from 'react'
import type { CapaianBidang } from '../api/capaian-bidang'
import {
    kartuPoster,
    POSTER_HEIGHT,
    POSTER_LAYOUT,
    POSTER_WIDTH,
    tanggalIndonesia,
    type PosterBidang,
} from '../lib/poster-capaian'

type PosterCapaianProps = {
    bidang: PosterBidang
    tahun: string
    data: CapaianBidang
    tanggal: Date
}

const FONT = '"Inter", "Google Sans", "Open Sans", system-ui, sans-serif'

const posisi = (r: { x: number; y: number; w: number; h: number }): CSSProperties => ({
    position: 'absolute',
    left: r.x,
    top: r.y,
    width: r.w,
    height: r.h,
})

/**
 * Poster capaian satu bidang pada ukuran asli 1536×2048. Gambar templat tidak memuat teks atau angka,
 * semua isi digambar di sini dari data, sehingga selalu sama dengan data terbaru.
 */
export const PosterCapaian = forwardRef<HTMLDivElement, PosterCapaianProps>(function PosterCapaian(
    { bidang, tahun, data, tanggal },
    ref,
) {
    const layout = POSTER_LAYOUT[bidang]
    const kartu = kartuPoster(data)

    return (
        <div
            ref={ref}
            style={{
                position: 'relative',
                width: POSTER_WIDTH,
                height: POSTER_HEIGHT,
                overflow: 'hidden',
                fontFamily: FONT,
                color: '#1b1b1b',
                background: '#fff',
            }}
        >
            <img
                src={layout.gambar}
                alt=''
                width={POSTER_WIDTH}
                height={POSTER_HEIGHT}
                style={{ position: 'absolute', inset: 0, width: POSTER_WIDTH, height: POSTER_HEIGHT }}
            />

            <div
                style={{
                    ...posisi(layout.areaJudul),
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 6,
                }}
            >
                <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 4, color: layout.warnaBilah }}>
                    CAPAIAN TAHUN ANGGARAN {tahun}
                </div>
                <div style={{ fontSize: 124, fontWeight: 800, lineHeight: 1.02 }}>{layout.judul}</div>
                <div style={{ fontSize: 44, fontWeight: 600, color: '#4b4b4b' }}>Kabupaten Cianjur</div>
            </div>

            {kartu.map((k, i) => {
                const { kartu: kotak, bilah } = layout.kartu[i]
                const isi = (bilah.w * k.persen) / 100
                return (
                    <div key={k.label}>
                        <div
                            style={{
                                position: 'absolute',
                                left: bilah.x,
                                top: kotak.y + 16,
                                width: bilah.w,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                gap: 24,
                            }}
                        >
                            <span style={{ fontSize: 32, fontWeight: 600, color: '#5a5a5a' }}>{k.label}</span>
                            <span style={{ fontSize: 27, fontWeight: 500, color: '#6b6b6b', textAlign: 'right' }}>
                                {k.keterangan}
                            </span>
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                left: bilah.x,
                                top: kotak.y + 54,
                                width: bilah.w,
                                fontSize: 74,
                                fontWeight: 800,
                                lineHeight: 1.1,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {k.nilai}
                        </div>
                        <div
                            style={{
                                ...posisi(bilah),
                                borderRadius: bilah.h,
                                background: layout.warnaJalur,
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width: isi > 0 ? Math.max(isi, bilah.h) : 0,
                                    height: '100%',
                                    borderRadius: bilah.h,
                                    background: layout.warnaBilah,
                                }}
                            />
                        </div>
                    </div>
                )
            })}

            <div
                style={{
                    ...posisi(layout.areaFooter),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: 30,
                    fontWeight: 600,
                    color: '#4b4b4b',
                }}
            >
                Sumber: Arumanis · Diperbarui {tanggalIndonesia(tanggal)}
            </div>
        </div>
    )
})
