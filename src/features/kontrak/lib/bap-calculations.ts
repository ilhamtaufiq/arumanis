import type { KontrakBapExportParams } from '../types';

export type BapFormPrefill = {
    jaminanUangMuka?: { nomor: string; tanggal: string } | null;
    uangMuka?: { tanggal: string; nilai: number | null; nomor?: string | null } | null;
};

export type BapFormState = {
    persen_bap: number;
    potongan_lima_persen: number;
    potongan_uang_muka: number;
    total_potongan: number;
    tgl_bap: string;
    nomor_bap: string;
    include_jaminan_uang_muka: boolean;
    nomor_jaminan_uang_muka: string;
    tgl_jaminan_uang_muka: string;
    include_pembayaran_uang_muka: boolean;
    tgl_pembayaran_uang_muka: string;
    nominal_pembayaran_uang_muka: number;
    nomor_pembayaran_uang_muka: string;
};

export function createDefaultBapForm(prefill?: BapFormPrefill): BapFormState {
    return {
        persen_bap: 100,
        potongan_lima_persen: 0,
        potongan_uang_muka: 0,
        total_potongan: 0,
        tgl_bap: new Date().toISOString().split('T')[0],
        nomor_bap: '',
        include_jaminan_uang_muka: false,
        nomor_jaminan_uang_muka: prefill?.jaminanUangMuka?.nomor ?? '',
        tgl_jaminan_uang_muka: prefill?.jaminanUangMuka?.tanggal ?? '',
        include_pembayaran_uang_muka: false,
        tgl_pembayaran_uang_muka: prefill?.uangMuka?.tanggal ?? '',
        nominal_pembayaran_uang_muka: prefill?.uangMuka?.nilai ?? 0,
        nomor_pembayaran_uang_muka: prefill?.uangMuka?.nomor ?? '',
    };
}

export type BapCalculation = {
    fisik_persen: number;
    dpp: number;
    ppn_persen: number;
    fisik_persen_total_potongan: number;
    total_bap: number;
    kontrak_persen: number;
};

export function calculateBapTotals(persen: number, nilaiKontrak: number, totalPotongan: number): BapCalculation {
    const fisik_persen = Math.round((persen / 111) * nilaiKontrak);
    const dpp = Math.round((11 / 12) * fisik_persen);
    const ppn_persen = Math.round(dpp * 0.12);
    const total_potongan = Math.round(Number(totalPotongan));
    const fisik_persen_total_potongan = fisik_persen + total_potongan;
    const total_bap = fisik_persen_total_potongan + ppn_persen;
    const kontrak_persen = Math.round((persen / 100) * nilaiKontrak);

    return {
        fisik_persen,
        dpp,
        ppn_persen,
        fisik_persen_total_potongan,
        total_bap,
        kontrak_persen,
    };
}

export function formatIndoDateFull(dateStr: string) {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];

    return `${days[date.getDay()]}, Tanggal ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatIndoDateSimple(dateStr: string) {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr);
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];

    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

type BuildBapPayloadInput = {
    form: BapFormState;
    nilaiKontrakEfektif: number;
    nomorBastp: string;
    tglBastp: string;
    addendum: {
        nomor: string;
        tanggal: string;
        nilai_kontrak_sesudah: number;
    } | null;
    jaminanUangMuka: { nomor: string; tanggal: string } | null;
    uangMuka: { nomor: string; tanggal: string; nilai: number | null } | null;
};

export function buildBapExportPayload(input: BuildBapPayloadInput): KontrakBapExportParams {
    const totals = calculateBapTotals(
        input.form.persen_bap,
        input.nilaiKontrakEfektif,
        input.form.total_potongan,
    );

    const addendumNomor = input.addendum?.nomor ?? '-';
    const addendumTanggal = input.addendum?.tanggal ?? '-';
    const nilaiKontrakAddendum = input.addendum?.nilai_kontrak_sesudah ?? input.nilaiKontrakEfektif;
    const jaminan = input.form.include_jaminan_uang_muka ? input.jaminanUangMuka : null;
    const uangMuka = input.form.include_pembayaran_uang_muka ? input.uangMuka : null;

    return {
        persen_bap: input.form.persen_bap,
        potongan_lima_persen: input.form.potongan_lima_persen,
        potongan_uang_muka: input.form.potongan_uang_muka,
        total_potongan: input.form.total_potongan,
        nomor_bap: input.form.nomor_bap,
        tgl_bap: formatIndoDateFull(input.form.tgl_bap),
        nomor_bastp: input.nomorBastp?.trim() || '-',
        tgl_bastp: formatIndoDateSimple(input.tglBastp),
        nomor_spk_addendum: addendumNomor,
        tgl_spk_addendum: addendumTanggal !== '-' ? formatIndoDateSimple(addendumTanggal) : '-',
        nilai_kontrak_addendum: nilaiKontrakAddendum,
        nomor_jaminan_uang_muka: jaminan?.nomor?.trim() || '-',
        tgl_jaminan_uang_muka: jaminan?.tanggal
            ? formatIndoDateSimple(jaminan.tanggal)
            : '-',
        nomor_uang_muka: uangMuka?.nomor?.trim() || '-',
        tgl_uang_muka: uangMuka?.tanggal ? formatIndoDateSimple(uangMuka.tanggal) : '-',
        nominal_uang_muka: uangMuka?.nilai ?? undefined,
        ...totals,
        nilai_kontrak: totals.kontrak_persen,
    };
}