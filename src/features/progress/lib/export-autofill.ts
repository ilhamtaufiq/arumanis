/**
 * Autofill data Pengaturan Export Laporan dari:
 * - DPA: pengaturan aplikasi (kontrak_nomor_dpa / kontrak_tanggal_dpa)
 * - Mengetahui: PPTK sub kegiatan (fallback PPTK pengaturan)
 * - Diperiksa: pengawas paket
 * - Penyedia: data penyedia kontrak
 */

import type { AppSetting } from '@/features/settings/api'
import { getSettingValue } from '@/features/settings/api'
import type { ProgressReportData } from '../types'
import type { DpaData, SignatureData } from '../types/signature'
import { defaultDpaData, defaultSignatureData } from '../types/signature'

export const EXPORT_SETTINGS_STORAGE_KEY = 'buat-laporan-export-settings-v1'

export type ExportSettingsPersisted = {
    /** Override manual user (di-merge di atas autofill, hanya field yang diisi) */
    signatureOverrides?: Partial<SignatureData>
    dpaOverrides?: Partial<DpaData>
    updatedAt?: string
}

export function loadExportSettingsOverrides(): ExportSettingsPersisted {
    try {
        const raw = localStorage.getItem(EXPORT_SETTINGS_STORAGE_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw) as ExportSettingsPersisted
        return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
        return {}
    }
}

export function saveExportSettingsOverrides(data: ExportSettingsPersisted): void {
    try {
        localStorage.setItem(
            EXPORT_SETTINGS_STORAGE_KEY,
            JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
        )
    } catch {
        // ignore quota
    }
}

function trimOrEmpty(value: unknown): string {
    return String(value ?? '').trim()
}

/** Format tanggal laporan default (id-ID long) */
export function formatLaporanTanggal(date = new Date()): string {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

/**
 * Bangun SignatureData + DpaData dari report + app settings.
 * Override localStorage opsional (hanya menimpa field non-kosong di override).
 */
export function buildExportAutofill(
    report: ProgressReportData | null | undefined,
    settings: AppSetting[] | undefined,
    overrides?: ExportSettingsPersisted,
): { signatureData: SignatureData; dpaData: DpaData; sources: Record<string, string> } {
    const settingsPptkNama = getSettingValue(settings, 'kontrak_nama_pptk')
    const settingsPptkNip = getSettingValue(settings, 'kontrak_nip_pptk')
    const settingsSkpd = getSettingValue(settings, 'kontrak_skpd')
    const settingsNomorDpa = getSettingValue(settings, 'kontrak_nomor_dpa')
    const settingsTanggalDpa = getSettingValue(settings, 'kontrak_tanggal_dpa')

    const kegiatanPptkNama = trimOrEmpty(report?.kegiatan?.nama_pptk)
    const kegiatanPptkNip = trimOrEmpty(report?.kegiatan?.nip_pptk)

    const pptkNama = kegiatanPptkNama || settingsPptkNama
    const pptkNip = kegiatanPptkNip || settingsPptkNip
    const pptkSource = kegiatanPptkNama
        ? 'PPTK sub kegiatan'
        : settingsPptkNama
          ? 'Pengaturan (fallback PPTK)'
          : '—'

    const pengawas = report?.pengawas
    const penyedia = report?.penyedia

    const lokasiDesaKec =
        report?.pekerjaan.desa_nama && report?.pekerjaan.kecamatan_nama
            ? `${report.pekerjaan.desa_nama}, ${report.pekerjaan.kecamatan_nama}`
            : report?.pekerjaan.lokasi || 'Cianjur'

    const signatureData: SignatureData = {
        ...defaultSignatureData,
        // Mengetahui = PPTK
        namaMengetahui: pptkNama || defaultSignatureData.namaMengetahui,
        nipMengetahui: pptkNip || defaultSignatureData.nipMengetahui,
        jabatanMengetahui: 'Pejabat Pelaksana Teknis Kegiatan',
        instansiMengetahui:
            settingsSkpd || defaultSignatureData.instansiMengetahui,
        // Diperiksa = Pengawas
        namaDiperiksa: trimOrEmpty(pengawas?.nama) || defaultSignatureData.namaDiperiksa,
        nipDiperiksa: trimOrEmpty(pengawas?.nip) || defaultSignatureData.nipDiperiksa,
        jabatanDiperiksa:
            trimOrEmpty(pengawas?.jabatan) || defaultSignatureData.jabatanDiperiksa,
        // Penyedia
        namaPerusahaan: trimOrEmpty(penyedia?.nama) || defaultSignatureData.namaPerusahaan,
        namaDirektur: trimOrEmpty(penyedia?.direktur) || defaultSignatureData.namaDirektur,
        lokasi: lokasiDesaKec.split(',')[0]?.trim() || defaultSignatureData.lokasi,
        tanggal: formatLaporanTanggal(),
    }

    const dpaData: DpaData = {
        nomorDpa: settingsNomorDpa || defaultDpaData.nomorDpa,
        tanggalDpa: settingsTanggalDpa || defaultDpaData.tanggalDpa,
    }

    // Merge user overrides (non-empty only)
    const sigOver = overrides?.signatureOverrides ?? {}
    for (const [key, value] of Object.entries(sigOver) as [keyof SignatureData, string][]) {
        if (trimOrEmpty(value)) {
            signatureData[key] = String(value)
        }
    }
    const dpaOver = overrides?.dpaOverrides ?? {}
    for (const [key, value] of Object.entries(dpaOver) as [keyof DpaData, string][]) {
        if (trimOrEmpty(value)) {
            dpaData[key] = String(value)
        }
    }

    return {
        signatureData,
        dpaData,
        sources: {
            dpa: settingsNomorDpa || settingsTanggalDpa ? 'Pengaturan aplikasi' : '—',
            mengetahui: pptkSource,
            diperiksa: pengawas?.nama ? 'Pengawas paket' : '—',
            penyedia: penyedia?.nama ? 'Penyedia kontrak' : '—',
        },
    }
}

export function sanitizeExportFilePart(value: string): string {
    return (
        value
            .replace(/[^\w\s\-À-ÿ]+/gi, '')
            .trim()
            .replace(/\s+/g, '_')
            .slice(0, 48) || 'progress'
    )
}

export function buildLaporanFileName(
    paketName: string,
    weekLabel: string,
    ext: 'pdf' | 'xlsx',
    date = new Date(),
): string {
    const d = date.toISOString().slice(0, 10)
    return `Laporan_Mingguan_${sanitizeExportFilePart(paketName)}_${sanitizeExportFilePart(weekLabel)}_${d}.${ext}`
}
