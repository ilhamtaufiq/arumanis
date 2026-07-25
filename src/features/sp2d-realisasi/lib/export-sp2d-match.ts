import * as XLSX from 'xlsx'
import type { Sp2dMatchedRow } from '../types'
import { aggregateByPekerjaan } from './match-sp2d'
import { SP2D_KATEGORI_LABEL, SP2D_KATEGORI_SHORT } from './normalize'

function dateStamp() {
    return new Date().toISOString().split('T')[0]
}

export function exportSp2dMatchExcel(rows: Sp2dMatchedRow[], fileName?: string) {
    const detail = rows.map((r, i) => ({
        No: i + 1,
        File: r.fileName,
        'No SP2D File': r.no,
        'Tanggal Pencairan': r.tanggalPencairan,
        'Nomor SP2D': r.nomorSp2d,
        'Nama Penerima (SP2D)': r.namaPenerima,
        'Hint Penyedia': r.penyediaHint,
        'Hint Paket': r.paketHint,
        Keterangan: r.keterangan,
        'Sumber Dana': r.sumberDana ?? '',
        'Persen Ket.': r.persenPembayaran ?? '',
        Kategori: SP2D_KATEGORI_LABEL[r.kategori],
        Bruto: r.bruto,
        Potongan: r.potongan,
        Neto: r.neto,
        Status: r.status,
        'Penyedia Match': r.matchedPenyedia?.label ?? '',
        'Skor Penyedia': r.matchedPenyedia?.score ?? '',
        'Pekerjaan Match': r.matchedPekerjaan?.label ?? '',
        'Skor Paket': r.matchedPekerjaan?.score ?? '',
        'Kontrak ID': r.matchedKontrakId ?? '',
        'Nilai Kontrak': r.nilaiKontrak ?? '',
        '% vs Kontrak': r.realisasiTerhadapKontrak ?? '',
    }))

    const byPaket = aggregateByPekerjaan(rows).map((item, i) => ({
        No: i + 1,
        'Pekerjaan ID': item.pekerjaanId,
        'Nama Paket': item.namaPaket,
        Kategori: item.kategoriLabel,
        'Kategori Kode': item.kategori,
        Penyedia: item.penyediaLabel ?? '',
        'Sub Kegiatan': item.subKegiatanLabel ?? '',
        'Jumlah SP2D': item.count,
        'Match Penuh': item.fullMatchCount,
        'Total Bruto': item.totalBruto,
        'Total Neto': item.totalNeto,
        'Nilai Kontrak': item.nilaiKontrak ?? '',
        '% SP2D vs Kontrak': item.sp2dPercentOfKontrak ?? '',
        'Siap Pencairan TA': item.canApply ? 'Ya' : 'Tidak (tanpa kontrak)',
    }))

    const countPersen = (p: number) =>
        rows.filter((r) => !r.isNonPekerjaan && r.persenPembayaran === p).length
    const brutoPersen = (p: number) =>
        rows
            .filter((r) => !r.isNonPekerjaan && r.persenPembayaran === p)
            .reduce((s, r) => s + r.bruto, 0)

    // Sheet ringkas: 30/65/95/100 (rekap) + SILPA terpisah
    const byKat = [
        {
            Kategori: 'UM 30%',
            Keterangan: 'Masuk rekap',
            'Jumlah Baris':
                countPersen(30) +
                rows.filter((r) => !r.isNonPekerjaan && r.kategori === 'uang_muka' && r.persenPembayaran !== 30)
                    .length,
            'Total Bruto':
                brutoPersen(30) +
                rows
                    .filter((r) => !r.isNonPekerjaan && r.kategori === 'uang_muka' && r.persenPembayaran !== 30)
                    .reduce((s, r) => s + r.bruto, 0),
        },
        { Kategori: 'Termin 65%', Keterangan: 'Masuk rekap', 'Jumlah Baris': countPersen(65), 'Total Bruto': brutoPersen(65) },
        { Kategori: 'Termin 95%', Keterangan: 'Masuk rekap', 'Jumlah Baris': countPersen(95), 'Total Bruto': brutoPersen(95) },
        { Kategori: 'Termin 100%', Keterangan: 'Masuk rekap', 'Jumlah Baris': countPersen(100), 'Total Bruto': brutoPersen(100) },
        {
            Kategori: SP2D_KATEGORI_SHORT.silpa_pemeliharaan,
            Keterangan: 'Tidak masuk rekap ter-match',
            'Jumlah Baris': rows.filter((r) => !r.isNonPekerjaan && r.kategori === 'silpa_pemeliharaan').length,
            'Total Bruto': rows
                .filter((r) => !r.isNonPekerjaan && r.kategori === 'silpa_pemeliharaan')
                .reduce((s, r) => s + r.bruto, 0),
        },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detail), 'Detail SP2D')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byPaket), 'Rekap per Paket')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(byKat), 'Ringkas Kategori')
    XLSX.writeFile(wb, fileName ?? `Realisasi_SP2D_Match_${dateStamp()}.xlsx`)
}
