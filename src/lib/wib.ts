import { isSameDay } from 'date-fns';

// WIB (Asia/Jakarta) tidak mengenal DST, jadi offset tetapnya +07:00.
const WIB_OFFSET_MINUTES = 7 * 60;

/**
 * Memetakan sebuah instant ke Date yang field lokalnya (getHours, format, isSameDay, dst.)
 * sama dengan jam dinding WIB, terlepas dari zona waktu browser.
 * Hanya dipakai untuk perhitungan/tampilan; jangan dikirim langsung ke API.
 */
export function toWib(value: string | number | Date): Date {
    const instant = new Date(value);
    const shiftMinutes = WIB_OFFSET_MINUTES + instant.getTimezoneOffset();
    return new Date(instant.getTime() + shiftMinutes * 60_000);
}

/** Apakah instant ini jatuh pada hari ini menurut WIB. Menerima Date hasil toWib(). */
export function isTodayWib(wibDate: Date): boolean {
    return isSameDay(wibDate, toWib(new Date()));
}
