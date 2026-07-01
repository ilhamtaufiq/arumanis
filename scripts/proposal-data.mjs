import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(__dirname, '..')
export const DATA_PATH = path.join(ROOT, 'docs', 'proposal-live-data.json')
export const SCREENSHOTS_DIR = path.join(ROOT, 'docs', 'screenshots')
export const IMG_WIDTH = 520

const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8').replace(/^\uFEFF/, ''))

export const data = raw
export const spam = raw.spam
export const san = raw.sanitasi
export const dash = raw.dashboard
export const pengawas = raw.pengawas
export const scope = raw.dataScope ?? {}
export const achYears = raw.achievementPerTahun ?? []
export const pekerjaanYears = raw.pekerjaanPerTahun ?? []

export const fetched = new Date(raw.fetchedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})

export const fmtNum = (n) => new Intl.NumberFormat('id-ID').format(Math.round(Number(n) || 0))
export const fmtPct = (n) => `${Number(n).toFixed(2).replace('.', ',')}%`
export const fmtMilyar = (n) => {
    const v = Number(n) / 1_000_000_000
    return `Rp ${v.toFixed(2).replace('.', ',')} miliar`
}

export const achNarrative = achYears
    .map(
        (r) =>
            `tahun ${r.tahun} (${fmtNum(r.records)} record capaian, ${fmtNum(r.units)} unit, ${fmtNum(r.kk)} KK / ${fmtNum(r.jiwa)} jiwa)`,
    )
    .join('; ')

export const pekerjaanAktif = pekerjaanYears.filter((r) => r.pekerjaan > 0)
export const pekerjaanNarrative = pekerjaanAktif
    .map(
        (r) =>
            `${r.tahun}: ${fmtNum(r.pekerjaan)} pekerjaan, ${fmtNum(r.kontrak)} kontrak, pagu ${fmtMilyar(r.paguPekerjaan)}`,
    )
    .join('; ')

export const earliestYear = scope.earliestAchievementYear ?? achYears[0]?.tahun ?? '2017'
export const syncStart = scope.syncStartYear ?? 2017
export const SPM = 'Standar Pelayanan Minimum (SPM)'

export const anggaranAirMinum = Number(spam.capaian_nilai_kontrak) || 0
export const anggaranSanitasi = Number(san.total_investasi) || 0
export const anggaranPekerjaan = Number(dash.totalPaguPekerjaan) || 0
export const anggaranKontrak = Number(dash.totalNilaiKontrak) || 0
export const anggaranPengawasan = Number(pengawas.total_pagu) || 0

export const disclaimerSinkronisasi =
    'Catatan: data bersumber dari Arumanis dan masih dalam tahap sinkronisasi; dapat terdapat ketidaksesuaian, duplikasi, atau kesalahan. Angka bersifat progresif, bukan pernyataan final.'

export const gapAirMinumKk = Math.max(0, Number(spam.total_target) - Number(spam.capaian_kk))
export const gapSanitasiKk = Math.max(0, Number(san.target_kk) - Number(san.total_pemanfaat_kk))

export const SCREENSHOTS = [
    {
        file: 'dashboard.png',
        caption:
            'Gambar 1. Dashboard monitoring pekerjaan konstruksi air minum dan sanitasi (arumanis.cianjur.space).',
    },
    {
        file: 'capaian-air-minum.png',
        caption: 'Gambar 2. Peta capaian Standar Pelayanan Minimum (SPM) air minum per desa.',
    },
    {
        file: 'capaian-sanitasi.png',
        caption: 'Gambar 3. Peta capaian SPM sanitasi dan air limbah per desa.',
    },
    {
        file: 'pengawas.png',
        caption: 'Gambar 4. Panel Pengawasan terintegrasi untuk input progress dan dokumentasi lapangan.',
    },
    {
        file: 'sign-in.png',
        caption: 'Gambar 5. Akses terintegrasi (SSO) ke Arumanis dan Panel Pengawasan dengan satu akun.',
    },
]