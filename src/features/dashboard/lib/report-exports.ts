import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import api from '@/lib/api-client'
import { fetchAllPages } from '@/lib/paginated-fetch'
import { getAnalyticsStats } from '../api/dashboard'
import { getPekerjaan, getDocumentRegister } from '@/features/pekerjaan/api/pekerjaan'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { getPenerimaList } from '@/features/penerima/api'
import { getPengawas } from '@/features/pengawas/api/pengawas'
import { getEvents } from '@/features/calendar/api'
import { exportSpmSanitasi } from '@/features/spm-sanitasi/api'
import { dateStamp, downloadBlob, formatRupiah } from './download'
import type { ReportFormat, ReportId } from './report-catalog'

function assertNonEmpty<T>(rows: T[], label: string): T[] {
    if (!rows.length) {
        throw new Error(`Tidak ada data ${label} untuk diekspor`)
    }
    return rows
}

function writeExcel(
    rows: Record<string, string | number>[],
    sheetName: string,
    filename: string,
    colWidths?: { wch: number }[],
) {
    const worksheet = XLSX.utils.json_to_sheet(rows)
    if (colWidths) worksheet['!cols'] = colWidths
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31))
    XLSX.writeFile(workbook, filename)
}

function primaryKontrak(item: Pekerjaan) {
    return item.kontrak?.[0]
}

async function fetchAllPekerjaan(year: string): Promise<Pekerjaan[]> {
    // per_page=-1 is hard-capped (~80) on API; paginate for full export
    return fetchAllPages((page) => getPekerjaan({ per_page: 100, tahun: year, page }))
}

async function exportDaftarPekerjaanPdf(year: string, data: Pekerjaan[]) {
    const doc = new jsPDF('landscape')
    const timestamp = new Date().toLocaleString('id-ID')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DAFTAR PEKERJAAN', 148, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tahun Anggaran: ${year} | Tanggal Cetak: ${timestamp}`, 148, 22, { align: 'center' })

    autoTable(doc, {
        startY: 28,
        head: [['No', 'Nama Paket', 'Sub Kegiatan', 'Kecamatan', 'Desa', 'Pengawas', 'Pagu', 'Progres %']],
        body: data.map((item, index) => [
            String(index + 1),
            item.nama_paket,
            item.kegiatan?.nama_sub_kegiatan || '-',
            item.kecamatan?.nama_kecamatan || '-',
            item.desa?.nama_desa || '-',
            item.pengawas?.nama || '-',
            formatRupiah(item.pagu),
            item.progress_total != null ? `${Number(item.progress_total).toFixed(1)}%` : '-',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 7, cellPadding: 2 },
    })
    doc.save(`Daftar_Pekerjaan_${year}_${dateStamp()}.pdf`)
}

async function exportDaftarPekerjaanExcel(year: string, data: Pekerjaan[]) {
    writeExcel(
        data.map((item, index) => ({
            No: index + 1,
            'Kode Rekening': item.kode_rekening || '-',
            'Nama Paket': item.nama_paket,
            'Sub Kegiatan': item.kegiatan?.nama_sub_kegiatan || '-',
            Kecamatan: item.kecamatan?.nama_kecamatan || '-',
            Desa: item.desa?.nama_desa || '-',
            Pagu: item.pagu,
            Pengawas: item.pengawas?.nama || '-',
            Pendamping: item.pendamping?.nama || '-',
            'Progres Fisik %': item.progress_total ?? '',
            Deviasi: item.deviasi ?? '',
            Tags: item.tags?.map((t) => t.name).join(', ') || '-',
        })),
        'Pekerjaan',
        `Daftar_Pekerjaan_${year}_${dateStamp()}.xlsx`,
        [
            { wch: 5 }, { wch: 18 }, { wch: 48 }, { wch: 36 }, { wch: 18 },
            { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 12 },
            { wch: 10 }, { wch: 24 },
        ],
    )
}

async function exportPekerjaanPerDesa(year: string, data: Pekerjaan[]) {
    const sorted = [...data].sort((a, b) => {
        const kec = (a.kecamatan?.nama_kecamatan || '').localeCompare(b.kecamatan?.nama_kecamatan || '')
        if (kec !== 0) return kec
        return (a.desa?.nama_desa || '').localeCompare(b.desa?.nama_desa || '')
    })
    writeExcel(
        sorted.map((item, index) => ({
            No: index + 1,
            Kecamatan: item.kecamatan?.nama_kecamatan || '-',
            Desa: item.desa?.nama_desa || '-',
            'Nama Paket': item.nama_paket,
            Pengawas: item.pengawas?.nama || '-',
            Pagu: item.pagu,
            'Progres %': item.progress_total ?? '',
            'Jumlah Foto': item.foto_count ?? '',
            'Jumlah Penerima': item.penerima_count ?? '',
        })),
        'Per Desa',
        `Pekerjaan_Per_Desa_${year}_${dateStamp()}.xlsx`,
    )
}

async function exportPaguVsKontrak(year: string, data: Pekerjaan[]) {
    writeExcel(
        data.map((item, index) => {
            const kontrak = primaryKontrak(item)
            const nilai = Number(kontrak?.nilai_kontrak_berjalan ?? kontrak?.nilai_kontrak ?? 0)
            const pagu = Number(item.pagu ?? 0)
            return {
                No: index + 1,
                'Nama Paket': item.nama_paket,
                Kecamatan: item.kecamatan?.nama_kecamatan || '-',
                Desa: item.desa?.nama_desa || '-',
                Pagu: pagu,
                'Nilai Kontrak': nilai,
                'Sisa (Pagu - Kontrak)': pagu - nilai,
                'Rasio Kontrak/Pagu %': pagu > 0 ? Number(((nilai / pagu) * 100).toFixed(1)) : 0,
                Penyedia: kontrak?.penyedia?.nama || '-',
                'No SPK': kontrak?.spk || '-',
            }
        }),
        'Pagu vs Kontrak',
        `Pagu_vs_Kontrak_${year}_${dateStamp()}.xlsx`,
    )
}

async function exportRekapProgres(year: string, format: ReportFormat) {
    const [analytics, pekerjaan] = await Promise.all([
        getAnalyticsStats(year),
        fetchAllPekerjaan(year),
    ])
    const trend = analytics.trend ?? []
    const jobs = assertNonEmpty(pekerjaan, 'pekerjaan')

    if (format === 'excel') {
        const workbook = XLSX.utils.book_new()
        const trendSheet = XLSX.utils.json_to_sheet(
            trend.map((row) => ({
                Minggu: row.week,
                'Rencana %': row.rencana,
                'Realisasi %': row.realisasi,
                'Deviasi (pp)': Number((row.realisasi - row.rencana).toFixed(2)),
            })),
        )
        XLSX.utils.book_append_sheet(workbook, trendSheet, 'Tren Mingguan')

        const jobSheet = XLSX.utils.json_to_sheet(
            jobs.map((item, index) => ({
                No: index + 1,
                'Nama Paket': item.nama_paket,
                Kecamatan: item.kecamatan?.nama_kecamatan || '-',
                Desa: item.desa?.nama_desa || '-',
                'Progres Fisik %': item.progress_total ?? '',
                'Estimasi Fisik %': item.progress_estimasi_fisik ?? '',
                Deviasi: item.deviasi ?? '',
                Pengawas: item.pengawas?.nama || '-',
            })),
        )
        XLSX.utils.book_append_sheet(workbook, jobSheet, 'Per Pekerjaan')
        XLSX.writeFile(workbook, `Rekap_Progres_${year}_${dateStamp()}.xlsx`)
        return
    }

    const doc = new jsPDF('landscape')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('REKAP PROGRES MINGGUAN', 148, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`TA ${year} | ${new Date().toLocaleString('id-ID')}`, 148, 22, { align: 'center' })

    autoTable(doc, {
        startY: 28,
        head: [['Minggu', 'Rencana %', 'Realisasi %', 'Deviasi (pp)']],
        body: trend.map((row) => [
            row.week,
            String(row.rencana),
            String(row.realisasi),
            (row.realisasi - row.rencana).toFixed(1),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8 },
    })

    const afterTrend = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 40
    autoTable(doc, {
        startY: afterTrend + 8,
        head: [['No', 'Nama Paket', 'Kecamatan', 'Progres %', 'Deviasi', 'Pengawas']],
        body: jobs.slice(0, 80).map((item, index) => [
            String(index + 1),
            item.nama_paket,
            item.kecamatan?.nama_kecamatan || '-',
            item.progress_total != null ? Number(item.progress_total).toFixed(1) : '-',
            item.deviasi != null ? String(item.deviasi) : '-',
            item.pengawas?.nama || '-',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 7 },
    })
    doc.save(`Rekap_Progres_${year}_${dateStamp()}.pdf`)
}

async function exportRekapKontrak(year: string) {
    const blob = await api.get<Blob>('/kontrak/export/excel', {
        params: { tahun: year },
        responseType: 'blob',
    })
    downloadBlob(blob, `data_kontrak_${year}_${dateStamp()}.xlsx`)
}

async function exportDraftPekerjaan(year: string) {
    const blob = await api.get<Blob>('/draft-pekerjaan/export/excel', {
        params: { tahun: year },
        responseType: 'blob',
    })
    downloadBlob(blob, `data_draft_pekerjaan_${year}_${dateStamp()}.xlsx`)
}

async function exportRegisterDokumen(year: string) {
    const res = await getDocumentRegister({ tahun: year, per_page: -1 })
    const data = assertNonEmpty(res.data ?? [], 'register dokumen')
    writeExcel(
        data.map((item, index) => {
            const k = primaryKontrak(item)
            return {
                No: index + 1,
                'Nama Paket': item.nama_paket,
                Pagu: item.pagu,
                Penyedia: k?.penyedia?.nama || '-',
                'SPPBJ Nomor': k?.sppbj || '-',
                'SPPBJ Tanggal': k?.tgl_sppbj || '-',
                'SPK Nomor': k?.spk || '-',
                'SPK Tanggal': k?.tgl_spk || '-',
                'SPMK Nomor': k?.spmk || '-',
                'SPMK Tanggal': k?.tgl_spmk || '-',
            }
        }),
        'Register Dokumen',
        `Register_Dokumen_${year}_${dateStamp()}.xlsx`,
    )
}

async function exportPenerima(year: string, format: ReportFormat) {
    const res = await getPenerimaList({ per_page: 5000, tahun: year })
    const data = assertNonEmpty(res.data ?? [], 'penerima manfaat')

    if (format === 'excel') {
        writeExcel(
            data.map((item, index) => ({
                No: index + 1,
                Nama: item.nama,
                NIK: item.nik || '-',
                Alamat: item.alamat || '-',
                'Jumlah Jiwa': item.jumlah_jiwa,
                Komunal: item.is_komunal ? 'Ya' : 'Tidak',
                Pekerjaan: item.pekerjaan?.nama_paket || '-',
            })),
            'Penerima',
            `Penerima_Manfaat_${year}_${dateStamp()}.xlsx`,
        )
        return
    }

    const doc = new jsPDF('landscape')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DAFTAR PENERIMA MANFAAT (BNBA)', 148, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`TA ${year} | ${new Date().toLocaleString('id-ID')}`, 148, 22, { align: 'center' })
    autoTable(doc, {
        startY: 28,
        head: [['No', 'Nama', 'NIK', 'Alamat', 'Jiwa', 'Komunal', 'Pekerjaan']],
        body: data.slice(0, 200).map((item, index) => [
            String(index + 1),
            item.nama,
            item.nik || '-',
            item.alamat || '-',
            String(item.jumlah_jiwa),
            item.is_komunal ? 'Ya' : 'Tidak',
            item.pekerjaan?.nama_paket || '-',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 7 },
    })
    doc.save(`Penerima_Manfaat_${year}_${dateStamp()}.pdf`)
}

async function exportPengawas(format: ReportFormat) {
    const res = await getPengawas()
    const data = assertNonEmpty(res.data ?? [], 'pengawas')

    if (format === 'excel') {
        writeExcel(
            data.map((item, index) => ({
                No: index + 1,
                Nama: item.nama,
                NIP: item.nip || '-',
                Jabatan: item.jabatan || '-',
                Telepon: item.telepon || '-',
                'Jumlah Lokasi': item.jumlah_lokasi,
                'Total Pagu': item.total_pagu,
            })),
            'Pengawas',
            `Daftar_Pengawas_${dateStamp()}.xlsx`,
        )
        return
    }

    const doc = new jsPDF()
    const totalLokasi = data.reduce((sum, p) => sum + p.jumlah_lokasi, 0)
    const totalPagu = data.reduce((sum, p) => sum + p.total_pagu, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('DAFTAR PENGAWAS LAPANGAN', 105, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 105, 28, { align: 'center' })
    doc.text(
        `Total: ${data.length} Pengawas | ${totalLokasi} Lokasi | ${formatRupiah(totalPagu)}`,
        105,
        36,
        { align: 'center' },
    )
    autoTable(doc, {
        startY: 42,
        head: [['No', 'Nama', 'NIP', 'Jabatan', 'Lokasi', 'Total Pagu']],
        body: data.map((item, index) => [
            String(index + 1),
            item.nama,
            item.nip || '-',
            item.jabatan || '-',
            String(item.jumlah_lokasi),
            formatRupiah(item.total_pagu),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
    })
    doc.save(`Daftar_Pengawas_${dateStamp()}.pdf`)
}

async function exportKalender(format: ReportFormat) {
    const events = assertNonEmpty(await getEvents(), 'kalender')

    if (format === 'excel') {
        writeExcel(
            events.map((event, index) => ({
                No: index + 1,
                Judul: event.title,
                Kategori: event.category,
                Mulai: event.start,
                Selesai: event.end,
                Lokasi: event.location || '-',
                Deskripsi: event.description || '-',
            })),
            'Kalender',
            `Kalender_Kegiatan_${dateStamp()}.xlsx`,
        )
        return
    }

    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('KALENDER KEGIATAN', 105, 16, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date().toLocaleString('id-ID'), 105, 23, { align: 'center' })
    autoTable(doc, {
        startY: 28,
        head: [['No', 'Judul', 'Kategori', 'Mulai', 'Selesai', 'Lokasi']],
        body: events.map((event, index) => [
            String(index + 1),
            event.title,
            event.category,
            new Date(event.start).toLocaleString('id-ID'),
            new Date(event.end).toLocaleString('id-ID'),
            event.location || '-',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8 },
    })
    doc.save(`Kalender_Kegiatan_${dateStamp()}.pdf`)
}

export async function runReportExport(
    reportId: ReportId,
    format: ReportFormat,
    year: string,
): Promise<void> {
    switch (reportId) {
        case 'rekap-progres':
            await exportRekapProgres(year, format)
            return
        case 'daftar-pekerjaan': {
            const data = assertNonEmpty(await fetchAllPekerjaan(year), 'pekerjaan')
            if (format === 'pdf') await exportDaftarPekerjaanPdf(year, data)
            else await exportDaftarPekerjaanExcel(year, data)
            return
        }
        case 'pekerjaan-per-desa': {
            const data = assertNonEmpty(await fetchAllPekerjaan(year), 'pekerjaan')
            await exportPekerjaanPerDesa(year, data)
            return
        }
        case 'pagu-vs-kontrak': {
            const data = assertNonEmpty(await fetchAllPekerjaan(year), 'pekerjaan')
            await exportPaguVsKontrak(year, data)
            return
        }
        case 'rekap-kontrak':
            await exportRekapKontrak(year)
            return
        case 'register-dokumen':
            await exportRegisterDokumen(year)
            return
        case 'draft-pekerjaan':
            await exportDraftPekerjaan(year)
            return
        case 'penerima':
            await exportPenerima(year, format)
            return
        case 'pengawas':
            await exportPengawas(format)
            return
        case 'spm-sanitasi':
            await exportSpmSanitasi({ tahun: year })
            return
        case 'kalender':
            await exportKalender(format)
            return
        default: {
            const _exhaustive: never = reportId
            throw new Error(`Laporan tidak dikenali: ${_exhaustive}`)
        }
    }
}
