import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ExecutiveDashboardData } from '../types'
import { formatCurrency, formatNumber } from '@/features/dashboard/lib/format'

export type TrafficTone = 'green' | 'yellow' | 'red' | 'neutral'

export type TrafficKpi = {
    label: string
    value: string
    detail: string
    tone: TrafficTone
}

export type PekerjaanStatusRecap = {
    aktif: number
    batal: number
    berkontrak: number
    belumBerkontrak: number
    /** Paket aktif non-konsultan */
    fisik: number
    /** Paket aktif konsultan */
    konsultan: number
    fisikBerkontrak: number
    fisikBelumBerkontrak: number
    paguAktif: number
    paguFisik: number
    paguKonsultan: number
    total: number
}

export type PekerjaanRecapOptions = {
    /**
     * Jika true, metrik “operasional” (aktif/berkontrak/belum/pagu) memakai subset fisik saja.
     * Kartu rekap fisik/konsultan tetap menampilkan angka penuh.
     */
    excludeKonsultan?: boolean
}

/** Rekap paket: aktif/batal/berkontrak/fisik/konsultan (metrik utama API exclude canceled). */
export function getPekerjaanStatusRecap(
    data: ExecutiveDashboardData,
    options: PekerjaanRecapOptions = {},
): PekerjaanStatusRecap {
    const d = data.dashboard
    const excludeKonsultan = Boolean(options.excludeKonsultan)

    const aktifAll = Number(d.pekerjaanAktif ?? d.totalPekerjaan ?? 0)
    const batal = Number(d.pekerjaanBatal ?? 0)
    const berkontrakAll = Number(d.pekerjaanBerkontrak ?? 0)
    const belumBerkontrakAll = Number(
        d.pekerjaanBelumBerkontrak ?? Math.max(0, aktifAll - berkontrakAll),
    )

    const fisik = Number(
        d.pekerjaanFisik ?? Math.max(0, aktifAll - Number(d.pekerjaanKonsultan ?? 0)),
    )
    const konsultan = Number(d.pekerjaanKonsultan ?? Math.max(0, aktifAll - fisik))
    const fisikBerkontrak = Number(d.pekerjaanFisikBerkontrak ?? 0)
    const fisikBelumBerkontrak = Number(
        d.pekerjaanFisikBelumBerkontrak ?? Math.max(0, fisik - fisikBerkontrak),
    )

    const paguAktifAll = Number(d.totalPaguPekerjaan ?? 0)
    const paguFisik = Number(
        d.totalPaguPekerjaanFisik ??
            Math.max(0, paguAktifAll - Number(d.totalPaguPekerjaanKonsultan ?? 0)),
    )
    const paguKonsultan = Number(d.totalPaguPekerjaanKonsultan ?? Math.max(0, paguAktifAll - paguFisik))

    const aktif = excludeKonsultan ? fisik : aktifAll
    const berkontrak = excludeKonsultan ? fisikBerkontrak : berkontrakAll
    const belumBerkontrak = excludeKonsultan ? fisikBelumBerkontrak : belumBerkontrakAll
    const paguAktif = excludeKonsultan ? paguFisik : paguAktifAll

    return {
        aktif,
        batal,
        berkontrak,
        belumBerkontrak,
        fisik,
        konsultan,
        fisikBerkontrak,
        fisikBelumBerkontrak,
        paguAktif,
        paguFisik,
        paguKonsultan,
        total: aktifAll + batal,
    }
}

function spamCoverage(data: ExecutiveDashboardData): number {
    const spam = data.spam
    const ringkasan = spam.ringkasan?.spm?.coverage_percentage
    if (ringkasan != null && Number.isFinite(Number(ringkasan))) {
        return Number(ringkasan)
    }
    return Number(spam.coverage_percentage ?? 0)
}

function spamTargetKk(data: ExecutiveDashboardData): number {
    return Number(data.spam.ringkasan?.spm?.target_kk ?? data.spam.total_target ?? 0)
}

function spamJpKk(data: ExecutiveDashboardData): number {
    const fromRing = data.spam.ringkasan?.spm?.jp_kk
    if (fromRing != null) return Number(fromRing)
    return Number(data.spam.total_kk ?? data.spam.capaian_kk ?? 0)
}

function spamBjpKk(data: ExecutiveDashboardData): number {
    const fromRing = data.spam.ringkasan?.spm?.total_bjp_kk
    if (fromRing != null) return Number(fromRing)
    return Number(data.spam.total_bjp_kk ?? 0)
}

export function buildTrafficKpis(
    data: ExecutiveDashboardData,
    options: PekerjaanRecapOptions = {},
): TrafficKpi[] {
    const dq = data.dataQuality
    const recap = getPekerjaanStatusRecap(data, options)
    const totalJobs = Math.max(dq.total_jobs || recap.aktif || data.dashboard.totalPekerjaan || 1, 1)
    const qualityRatio = (dq.no_coordinates + dq.no_photos + dq.no_contracts) / (totalJobs * 3)
    const qualityTone: TrafficTone =
        qualityRatio > 0.35 ? 'red' : qualityRatio > 0.15 ? 'yellow' : 'green'

    const trend = data.analytics.trend
    const last = trend?.[trend.length - 1]
    const gap = last ? last.realisasi - last.rencana : 0
    const progressTone: TrafficTone = !last ? 'neutral' : gap >= 0 ? 'green' : gap > -10 ? 'yellow' : 'red'
    const progressNote = options.excludeKonsultan
        ? ' · tren API masih gabungan (fisik+konsultan)'
        : ''

    const sanitasi = data.sanitasi
    const sanitasiCoverage = sanitasi?.coverage_kk_percentage ?? 0
    const sanitasiTone: TrafficTone =
        sanitasiCoverage >= 80
            ? 'green'
            : sanitasiCoverage >= 50
              ? 'yellow'
              : sanitasiCoverage > 0
                ? 'red'
                : 'neutral'

    const airMinumCoverage = spamCoverage(data)
    const airMinumTone: TrafficTone =
        airMinumCoverage >= 80
            ? 'green'
            : airMinumCoverage >= 50
              ? 'yellow'
              : airMinumCoverage > 0
                ? 'red'
                : 'neutral'

    const kontrakRatio = recap.aktif > 0 ? (recap.berkontrak / recap.aktif) * 100 : 0
    const kontrakTone: TrafficTone =
        kontrakRatio >= 70 ? 'green' : kontrakRatio >= 40 ? 'yellow' : 'red'
    const kontrakScope = options.excludeKonsultan ? 'fisik' : 'aktif'

    return [
        {
            label: 'Progres vs Rencana',
            value: last ? `${gap >= 0 ? '+' : ''}${gap.toFixed(1)} pp` : '—',
            detail: last
                ? `Realisasi ${last.realisasi}% · Rencana ${last.rencana}%${progressNote}`
                : 'Belum ada tren',
            tone: progressTone,
        },
        {
            label: 'Kualitas Data',
            value: `${Math.round((1 - qualityRatio) * 100)}%`,
            detail: `${dq.no_coordinates} no-coord · ${dq.no_photos} no-foto · ${dq.no_contracts} no-kontrak (aktif)`,
            tone: qualityTone,
        },
        {
            label: `Ikat Kontrak (${kontrakScope})`,
            value: `${kontrakRatio.toFixed(0)}%`,
            detail: `${formatNumber(recap.berkontrak)} berkontrak · ${formatNumber(recap.belumBerkontrak)} belum`,
            tone: kontrakTone,
        },
        {
            label: 'SPM Air Minum',
            value: `${airMinumCoverage.toFixed(1)}%`,
            detail: `JP ${formatNumber(spamJpKk(data))} KK · target ${formatNumber(spamTargetKk(data))} KK`,
            tone: airMinumTone,
        },
        {
            label: 'SPM Sanitasi',
            value: `${sanitasiCoverage.toFixed(1)}%`,
            detail: `Pemanfaat ${formatNumber(sanitasi?.total_pemanfaat_kk ?? 0)} KK · target ${formatNumber(sanitasi?.target_kk ?? 0)} KK`,
            tone: sanitasiTone,
        },
    ]
}

export type RiskItem = {
    title: string
    detail: string
    severity: 'high' | 'medium' | 'low'
    href: string
}

export function buildTopRisks(
    data: ExecutiveDashboardData,
    options: PekerjaanRecapOptions = {},
): RiskItem[] {
    const risks: RiskItem[] = []
    const dq = data.dataQuality
    const recap = getPekerjaanStatusRecap(data, options)

    if (recap.batal > 0) {
        risks.push({
            title: `${recap.batal} paket dibatalkan`,
            detail: 'Tidak dihitung di KPI operasional; pastikan alokasi/pagu sudah disesuaikan.',
            severity: recap.batal > 10 ? 'medium' : 'low',
            href: '/pekerjaan?status=canceled',
        })
    }
    if (recap.belumBerkontrak > 0) {
        const scope = options.excludeKonsultan ? 'fisik aktif' : 'aktif'
        risks.push({
            title: `${recap.belumBerkontrak} paket ${scope} belum berkontrak`,
            detail: 'Belum terikat pengadaan / registrasi kontrak.',
            severity: recap.belumBerkontrak > 20 ? 'high' : 'medium',
            href: '/data-quality?issue=no_contracts',
        })
    }
    if (recap.konsultan > 0 && !options.excludeKonsultan) {
        risks.push({
            title: `${recap.konsultan} paket konsultan aktif`,
            detail: 'Biasanya tanpa desa/kecamatan; aktifkan opsi exclude konsultan jika KPI fokus fisik.',
            severity: 'low',
            href: '/pekerjaan',
        })
    }
    if (dq.no_coordinates > 0) {
        risks.push({
            title: `${dq.no_coordinates} pekerjaan tanpa koordinat`,
            detail: 'Menghambat peta, geotag, dan validasi lapangan.',
            severity: dq.no_coordinates > 20 ? 'high' : 'medium',
            href: '/data-quality?issue=no_coordinates',
        })
    }
    if (dq.started_no_photos > 0) {
        risks.push({
            title: `${dq.started_no_photos} berkontrak tanpa foto`,
            detail: 'Dokumentasi progres belum mulai meski kontrak aktif.',
            severity: 'high',
            href: '/data-quality?issue=started_no_photos',
        })
    }
    if (dq.no_photos > 0) {
        risks.push({
            title: `${dq.no_photos} pekerjaan tanpa foto`,
            detail: 'Lengkapi dokumentasi progres fisik.',
            severity: dq.no_photos > 30 ? 'high' : 'medium',
            href: '/data-quality?issue=no_photos',
        })
    }
    if (dq.no_contracts > 0) {
        risks.push({
            title: `${dq.no_contracts} pekerjaan tanpa kontrak`,
            detail: 'Belum terikat pengadaan / registrasi kontrak.',
            severity: 'medium',
            href: '/data-quality?issue=no_contracts',
        })
    }

    const lagging = [...(data.analytics.regions ?? [])]
        .filter((r) => Number(r.value) < 50)
        .sort((a, b) => Number(a.value) - Number(b.value))
        .slice(0, 3)
    for (const region of lagging) {
        risks.push({
            title: `Wilayah lag: ${region.name}`,
            detail: `Rata-rata progres ${Number(region.value).toFixed(1)}%`,
            severity: Number(region.value) < 30 ? 'high' : 'medium',
            href: '/dashboard?tab=analytics',
        })
    }

    return risks.slice(0, 8)
}

export function exportExecutiveBriefPdf(
    year: string,
    data: ExecutiveDashboardData,
    kpis: TrafficKpi[],
    risks: RiskItem[],
    options: PekerjaanRecapOptions = {},
) {
    const doc = new jsPDF()
    const now = new Date().toLocaleString('id-ID')
    const recap = getPekerjaanStatusRecap(data, options)
    const sanitasi = data.sanitasi
    const airCoverage = spamCoverage(data)
    const scopeNote = options.excludeKonsultan
        ? 'Metrik KPI = paket fisik aktif (exclude batal & konsultan).'
        : 'Metrik pekerjaan = paket aktif (exclude dibatalkan), kecuali baris rekap batal.'

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('EXECUTIVE BRIEF — ARUMANIS', 105, 18, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tahun Anggaran ${year} · Dicetak ${now}`, 105, 26, { align: 'center' })
    doc.setFontSize(9)
    doc.setTextColor(100)
    doc.text(scopeNote, 105, 32, { align: 'center' })
    doc.setTextColor(0)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('1. Status Indikator', 14, 42)
    autoTable(doc, {
        startY: 46,
        head: [['Indikator', 'Nilai', 'Status', 'Keterangan']],
        body: kpis.map((k) => [k.label, k.value, k.tone.toUpperCase(), k.detail]),
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: 255 },
        styles: { fontSize: 9 },
    })

    const afterKpi = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 80

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('2. Rekapitulasi Paket Pekerjaan', 14, afterKpi + 10)
    autoTable(doc, {
        startY: afterKpi + 14,
        head: [['Kategori', 'Jumlah', 'Keterangan']],
        body: [
            [
                options.excludeKonsultan ? 'Aktif (fisik)' : 'Aktif',
                formatNumber(recap.aktif),
                options.excludeKonsultan
                    ? 'Paket fisik yang masih ditindaklanjuti'
                    : 'Paket yang masih ditindaklanjuti (bukan batal)',
            ],
            ['Dibatalkan', formatNumber(recap.batal), 'Tidak dihitung di KPI operasional'],
            ['Berkontrak', formatNumber(recap.berkontrak), 'Sudah punya kontrak (scope KPI)'],
            ['Belum berkontrak', formatNumber(recap.belumBerkontrak), 'Tanpa registrasi kontrak (scope KPI)'],
            ['Fisik (aktif)', formatNumber(recap.fisik), 'Non-konsultan'],
            ['Konsultan (aktif)', formatNumber(recap.konsultan), 'Jasa konsultansi / is_konsultan'],
            ['Total (aktif + batal)', formatNumber(recap.total), 'Seluruh paket pada filter TA'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 118, 110], textColor: 255 },
        styles: { fontSize: 9 },
    })

    const afterRecap = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('3. Ringkasan Operasional (paket aktif)', 14, afterRecap + 10)
    autoTable(doc, {
        startY: afterRecap + 14,
        head: [['Metrik', 'Nilai']],
        body: [
            [
                options.excludeKonsultan ? 'Pekerjaan fisik aktif' : 'Pekerjaan aktif',
                formatNumber(recap.aktif),
            ],
            ['Kontrak (pada paket aktif)', formatNumber(data.dashboard.totalKontrak)],
            [
                options.excludeKonsultan ? 'Pagu pekerjaan fisik' : 'Pagu pekerjaan aktif',
                formatCurrency(recap.paguAktif),
            ],
            ['Pagu konsultan (aktif)', formatCurrency(recap.paguKonsultan)],
            ['Nilai kontrak', formatCurrency(data.dashboard.totalNilaiKontrak)],
            [
                'Penerima manfaat',
                `${formatNumber(data.dashboard.totalPenerima)} (${formatNumber(data.dashboard.totalJiwa)} jiwa)`,
            ],
            ['Pengawas aktif', formatNumber(data.pengawas.total_pengawas)],
            ['Lokasi dipantau', formatNumber(data.pengawas.total_lokasi)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
    })

    const afterOps = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 160

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('4. Capaian SPM Air Minum & Sanitasi', 14, afterOps + 10)
    autoTable(doc, {
        startY: afterOps + 14,
        head: [['SPM', 'Cakupan', 'Detail']],
        body: [
            [
                'Air Minum',
                `${airCoverage.toFixed(1)}%`,
                `JP ${formatNumber(spamJpKk(data))} KK · BJP ${formatNumber(spamBjpKk(data))} KK · target ${formatNumber(spamTargetKk(data))} KK · unit ${formatNumber(data.spam.total_units ?? 0)}`,
            ],
            [
                'Sanitasi',
                `${(sanitasi?.coverage_kk_percentage ?? 0).toFixed(1)}%`,
                `Pemanfaat ${formatNumber(sanitasi?.total_pemanfaat_kk ?? 0)} KK / ${formatNumber(sanitasi?.total_pemanfaat_jiwa ?? 0)} jiwa · target ${formatNumber(sanitasi?.target_kk ?? 0)} KK · unit ${formatNumber(sanitasi?.total_count ?? 0)} (${formatNumber(sanitasi?.berfungsi_count ?? 0)} berfungsi)`,
            ],
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 9 },
    })

    const afterSpm = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 200

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('5. Risiko Prioritas', 14, afterSpm + 10)
    autoTable(doc, {
        startY: afterSpm + 14,
        head: [['Severity', 'Risiko', 'Detail']],
        body:
            risks.length > 0
                ? risks.map((r) => [r.severity.toUpperCase(), r.title, r.detail])
                : [['—', 'Tidak ada risiko terdeteksi', '—']],
        theme: 'grid',
        headStyles: { fillColor: [185, 28, 28], textColor: 255 },
        styles: { fontSize: 9 },
    })

    doc.save(`Executive_Brief_${year}_${new Date().toISOString().split('T')[0]}.pdf`)
}
