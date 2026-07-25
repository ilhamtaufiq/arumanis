import type { Sp2dPembayaranKategori } from '../lib/normalize'

export type { Sp2dPembayaranKategori }

export type Sp2dParseMeta = {
    periodeLabel: string | null
    sheetName: string
    fileName: string
    rowCount: number
}

export type Sp2dRow = {
    /** 1-based data order within file */
    index: number
    fileName: string
    no: string
    tanggalPembuatan: string
    tanggalPencairan: string
    nomorSp2d: string
    unitSkpd: string
    namaPenerima: string
    keterangan: string
    jenisSp2d: string
    bruto: number
    potongan: number
    neto: number
    /** Company part of Nama Penerima (before /) */
    penyediaHint: string
    /** Person/director part after / */
    direkturHint: string
    /** Package fragment extracted from Keterangan */
    paketHint: string
    /** "Sub Keg. ..." fragment from Keterangan */
    subKegiatanHint: string
    sumberDana: string | null
    /** e.g. 95 or 5 from "sebesar 95%" / "seb.5%" */
    persenPembayaran: number | null
    /**
     * silpa_pemeliharaan = retensi 5% SILPA (TA sebelumnya)
     * uang_muka = pencairan UM 30%
     * termin = termin TA berjalan
     */
    kategori: Sp2dPembayaranKategori
    /** Gaji / bendahara / non-pekerjaan rows */
    isNonPekerjaan: boolean
}

export type Sp2dKegiatanCatalog = {
    id: number
    nama_sub_kegiatan: string
    nama_kegiatan: string
    tahun_anggaran: string
}

export type Sp2dPenyediaCatalog = {
    id: number
    nama: string
    direktur?: string | null
}

export type Sp2dPekerjaanCatalog = {
    id: number
    nama_paket: string
    pagu: number
    status?: string | null
    kegiatan_id: number | null
    penyediaIds: number[]
    kontrak: Array<{
        id: number
        nilai_kontrak: number | null
        penyedia_id: number | null
        penyedia_nama: string | null
    }>
}

export type Sp2dMatchRef = {
    id: number
    label: string
    score: number
}

export type Sp2dMatchStatus = 'matched' | 'partial' | 'unmatched' | 'skipped'

export type Sp2dMatchedRow = Sp2dRow & {
    status: Sp2dMatchStatus
    matchedSubKegiatan: Sp2dMatchRef | null
    matchedPenyedia: Sp2dMatchRef | null
    matchedPekerjaan: Sp2dMatchRef | null
    matchedKontrakId: number | null
    nilaiKontrak: number | null
    /** bruto / nilai_kontrak * 100 when available */
    realisasiTerhadapKontrak: number | null
    candidatesPenyedia: Sp2dMatchRef[]
    candidatesPekerjaan: Sp2dMatchRef[]
}

export type Sp2dSubKegiatanFilterResult = {
    kept: Sp2dRow[]
    droppedCount: number
    /** Rows that had Sub Keg text but no master match */
    unmatchedSubKegCount: number
    /** Rows without Sub Keg fragment */
    noSubKegCount: number
    matchedSubKegiatanLabels: string[]
}

export type Sp2dMatchSummary = {
    total: number
    matched: number
    partial: number
    unmatched: number
    skipped: number
    totalBruto: number
    totalNeto: number
    matchedBruto: number
}
