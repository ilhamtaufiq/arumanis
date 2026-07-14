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

export function buildTrafficKpis(data: ExecutiveDashboardData): TrafficKpi[] {
    const dq = data.dataQuality
    const totalJobs = Math.max(dq.total_jobs || data.dashboard.totalPekerjaan || 1, 1)
    const qualityRatio = (dq.no_coordinates + dq.no_photos + dq.no_contracts) / (totalJobs * 3)
    const qualityTone: TrafficTone =
        qualityRatio > 0.35 ? 'red' : qualityRatio > 0.15 ? 'yellow' : 'green'

    const trend = data.analytics.trend
    const last = trend?.[trend.length - 1]
    const gap = last ? last.realisasi - last.rencana : 0
    const progressTone: TrafficTone = !last ? 'neutral' : gap >= 0 ? 'green' : gap > -10 ? 'yellow' : 'red'

    const sanitasi = data.sanitasi
    const coverage = sanitasi?.coverage_kk_percentage ?? 0
    const sanitasiTone: TrafficTone =
        coverage >= 80 ? 'green' : coverage >= 50 ? 'yellow' : coverage > 0 ? 'red' : 'neutral'

    const kontrakRatio =
        data.dashboard.totalPaguPekerjaan > 0
            ? (data.dashboard.totalNilaiKontrak / data.dashboard.totalPaguPekerjaan) * 100
            : 0
    const kontrakTone: TrafficTone =
        kontrakRatio >= 70 ? 'green' : kontrakRatio >= 40 ? 'yellow' : 'red'

    return [
        {
            label: 'Progres vs Rencana',
            value: last ? `${gap >= 0 ? '+' : ''}${gap.toFixed(1)} pp` : '—',
            detail: last
                ? `Realisasi ${last.realisasi}% · Rencana ${last.rencana}%`
                : 'Belum ada tren',
            tone: progressTone,
        },
        {
            label: 'Kualitas Data',
            value: `${Math.round((1 - qualityRatio) * 100)}%`,
            detail: `${dq.no_coordinates} no-coord · ${dq.no_photos} no-foto · ${dq.no_contracts} no-kontrak`,
            tone: qualityTone,
        },
        {
            label: 'Ikat Kontrak',
            value: `${kontrakRatio.toFixed(0)}%`,
            detail: `${formatCurrency(data.dashboard.totalNilaiKontrak)} / ${formatCurrency(data.dashboard.totalPaguPekerjaan)}`,
            tone: kontrakTone,
        },
        {
            label: 'Cakupan SPM Sanitasi',
            value: `${coverage.toFixed(1)}%`,
            detail: `Target ${formatNumber(sanitasi?.target_kk ?? 0)} KK`,
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

export function buildTopRisks(data: ExecutiveDashboardData): RiskItem[] {
    const risks: RiskItem[] = []
    const dq = data.dataQuality

    if (dq.no_coordinates > 0) {
        risks.push({
            title: `${dq.no_coordinates} pekerjaan tanpa koordinat`,
            detail: 'Menghambat peta, geotag, dan validasi lapangan.',
            severity: dq.no_coordinates > 20 ? 'high' : 'medium',
            href: '/map',
        })
    }
    if (dq.started_no_photos > 0) {
        risks.push({
            title: `${dq.started_no_photos} berkontrak tanpa foto`,
            detail: 'Dokumentasi progres belum mulai meski kontrak aktif.',
            severity: 'high',
            href: '/foto',
        })
    }
    if (dq.no_photos > 0) {
        risks.push({
            title: `${dq.no_photos} pekerjaan tanpa foto`,
            detail: 'Lengkapi dokumentasi progres fisik.',
            severity: dq.no_photos > 30 ? 'high' : 'medium',
            href: '/foto',
        })
    }
    if (dq.no_contracts > 0) {
        risks.push({
            title: `${dq.no_contracts} pekerjaan tanpa kontrak`,
            detail: 'Belum terikat pengadaan / registrasi kontrak.',
            severity: 'medium',
            href: '/kontrak',
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
) {
    const doc = new jsPDF()
    const now = new Date().toLocaleString('id-ID')

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('EXECUTIVE BRIEF — ARUMANIS', 105, 18, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tahun Anggaran ${year} · Dicetak ${now}`, 105, 26, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('1. Status Indikator', 14, 38)
    autoTable(doc, {
        startY: 42,
        head: [['Indikator', 'Nilai', 'Status', 'Keterangan']],
        body: kpis.map((k) => [k.label, k.value, k.tone.toUpperCase(), k.detail]),
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: 255 },
        styles: { fontSize: 9 },
    })

    const afterKpi = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 80

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('2. Ringkasan Operasional', 14, afterKpi + 10)
    autoTable(doc, {
        startY: afterKpi + 14,
        head: [['Metrik', 'Nilai']],
        body: [
            ['Pekerjaan', formatNumber(data.dashboard.totalPekerjaan)],
            ['Kontrak', formatNumber(data.dashboard.totalKontrak)],
            ['Pagu pekerjaan', formatCurrency(data.dashboard.totalPaguPekerjaan)],
            ['Nilai kontrak', formatCurrency(data.dashboard.totalNilaiKontrak)],
            ['Penerima manfaat', `${formatNumber(data.dashboard.totalPenerima)} (${formatNumber(data.dashboard.totalJiwa)} jiwa)`],
            ['Pengawas aktif', formatNumber(data.pengawas.total_pengawas)],
            ['Lokasi dipantau', formatNumber(data.pengawas.total_lokasi)],
            ['Cakupan sanitasi KK', `${(data.sanitasi.coverage_kk_percentage ?? 0).toFixed(1)}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
    })

    const afterOps = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 140

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('3. Risiko Prioritas', 14, afterOps + 10)
    autoTable(doc, {
        startY: afterOps + 14,
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
