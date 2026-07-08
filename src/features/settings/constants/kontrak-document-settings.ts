export type KontrakCaraPembayaran = 'sekaligus' | 'termin' | 'bulan';

export const KONTRAK_CARA_PEMBAYARAN_OPTIONS: Array<{
    value: KontrakCaraPembayaran;
    label: string;
}> = [
    { value: 'sekaligus', label: 'Sekaligus' },
    { value: 'termin', label: 'Termin' },
    { value: 'bulan', label: 'Bulan' },
];

export const DEFAULT_KONTRAK_SKPD = 'Dinas Perumahan dan Kawasan Permukiman';