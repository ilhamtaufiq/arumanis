/**
 * Date helper utilities for progress reports
 */

/**
 * Calculate number of weeks between two dates
 */
export const calculateWeeksFromDates = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(Math.ceil(diffDays / 7), 1);
};

/**
 * Format date range for week header (e.g., "1-7 Jan")
 */
export const formatWeekRange = (startDate: Date, endDate: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = months[startDate.getMonth()];
    const endMonth = months[endDate.getMonth()];

    if (startMonth === endMonth) {
        return `${startDay}-${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth}-${endDay} ${endMonth}`;
};

/**
 * Safely format date (handles null/undefined)
 */
export const formatDateSafe = (dateStr: string | null | undefined, defaultValue: string = '-'): string => {
    if (!dateStr) return defaultValue;
    try {
        return new Date(dateStr).toLocaleDateString('id-ID');
    } catch {
        return defaultValue;
    }
};

/**
 * Get week date range based on SPMK date and week number (1-based).
 * Minggu ke-N = 7 hari: SPMK+(N-1)*7 s/d SPMK+(N-1)*7+6
 */
export const getWeekDateRange = (spmkDate: string, weekNumber: number): { start: Date; end: Date } => {
    const start = new Date(spmkDate);
    // Normalize to local date without time drift
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + (weekNumber - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
};

/** Format satu tanggal id-ID long, mis. "30 Juni 2026" */
export const formatDateIdLong = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Format rentang tanggal laporan, mis. "24 Juni 2026 – 30 Juni 2026"
 */
export const formatWeekDateRangeLong = (start: Date, end: Date): string => {
    return `${formatDateIdLong(start)} – ${formatDateIdLong(end)}`;
};

/**
 * Tanggal mulai efektif untuk hitung minggu:
 * tgl_spmk → tgl_spk → null
 */
export const resolveKontrakStartDate = (
    kontrak?: {
        tgl_spmk?: string | null
        tgl_spk?: string | null
    } | null,
): string | null => {
    const spmk = (kontrak?.tgl_spmk || '').trim()
    if (spmk) return spmk
    const spk = (kontrak?.tgl_spk || '').trim()
    if (spk) return spk
    return null
}

/**
 * Tanggal laporan otomatis = **akhir minggu** yang dilaporkan.
 * - single minggu N: hari ke-7 minggu N (SPMK+(N-1)*7+6)
 * - all s/d minggu M: akhir minggu M
 * Fallback: hari ini (format long) bila tanggal mulai kontrak kosong.
 */
export const getTanggalLaporanOtomatis = (
    tglMulai: string | null | undefined,
    options: { weekNumber: number; throughWeek?: number },
): string => {
    if (!tglMulai) {
        return formatDateIdLong(new Date());
    }
    const fromWeek = Math.max(1, options.weekNumber);
    const toWeek = Math.max(fromWeek, options.throughWeek ?? options.weekNumber);
    const { end } = getWeekDateRange(tglMulai, toWeek);
    return formatDateIdLong(end);
};

/**
 * Calculate report date based on week number from SPMK
 * (akhir minggu ke-N — untuk sisa waktu, dll.)
 */
export const getReportDate = (tglSpmk: string | null | undefined, weekCount: number): Date => {
    if (!tglSpmk) return new Date();
    const { end } = getWeekDateRange(tglSpmk, Math.max(1, weekCount));
    return end;
};

/**
 * Calculate waktu pelaksanaan (execution time) in days
 */
export const getWaktuPelaksanaan = (tglSpmk: string | null | undefined, tglSelesai: string | null | undefined): number => {
    if (!tglSpmk || !tglSelesai) return 0;
    const start = new Date(tglSpmk);
    const end = new Date(tglSelesai);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate remaining days (sisa waktu)
 */
export const getSisaWaktu = (tglSelesai: string | null | undefined, reportDate: Date): number => {
    if (!tglSelesai) return 0;
    const end = new Date(tglSelesai);
    const diffTime = end.getTime() - reportDate.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};
