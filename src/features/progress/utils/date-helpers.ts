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
 * Get week date range based on SPMK date and week number
 */
export const getWeekDateRange = (spmkDate: string, weekNumber: number): { start: Date; end: Date } => {
    const start = new Date(spmkDate);
    start.setDate(start.getDate() + (weekNumber - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
};

/**
 * Calculate report date based on week number from SPMK
 */
export const getReportDate = (tglSpmk: string | null | undefined, weekCount: number): Date => {
    if (!tglSpmk) return new Date();
    const spmkDate = new Date(tglSpmk);
    const reportDate = new Date(spmkDate);
    reportDate.setDate(spmkDate.getDate() + (weekCount * 7));
    return reportDate;
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
