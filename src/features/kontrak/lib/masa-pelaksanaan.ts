/** Tanggal ISO (YYYY-MM-DD) ke tanggal lokal tengah malam. `null` bila format tidak valid. */
function parseIso(iso: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    if (!m) return null;
    const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const sama = date.getFullYear() === Number(m[1]) && date.getMonth() === Number(m[2]) - 1 && date.getDate() === Number(m[3]);
    return sama ? date : null;
}

function toIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Target selesai = tanggal SPMK + masa pelaksanaan (hari kalender). Kosong bila salah satu tidak valid. */
export function hitungTargetSelesai(spmk: string, hari: number): string {
    const awal = parseIso(spmk);
    if (!awal || !Number.isInteger(hari) || hari < 0) return '';
    const hasil = new Date(awal.getFullYear(), awal.getMonth(), awal.getDate() + hari);
    return toIso(hasil);
}

/** Masa pelaksanaan (hari kalender) dari SPMK dan target selesai. `null` bila tidak bisa dihitung. */
export function hitungMasaPelaksanaan(spmk: string, selesai: string): number | null {
    const awal = parseIso(spmk);
    const akhir = parseIso(selesai);
    if (!awal || !akhir) return null;
    const selisih = Math.round((akhir.getTime() - awal.getTime()) / 86_400_000);
    return selisih < 0 ? null : selisih;
}
