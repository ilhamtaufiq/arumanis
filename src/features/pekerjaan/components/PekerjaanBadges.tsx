import type { Pekerjaan } from '../types';

interface PekerjaanBadgesProps {
    item: Pekerjaan;
}

/**
 * Baris badge status satu pekerjaan (Arumanis, Konsultan, Dibatalkan, Belum berkontrak).
 * Dirender sebagai fragment supaya bisa ditanam di flex container tabel maupun kartu mobile.
 */
export function PekerjaanBadges({ item }: PekerjaanBadgesProps) {
    const hasKontrak =
        item.has_kontrak ?? (item.kontrak?.length ?? item.kontrak_count ?? 0) > 0;

    return (
        <>
            {(item.sipd_links_count ?? 0) > 0 ? (
                <span
                    className="rounded border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300"
                    title={`Ditautkan ke ${item.sipd_links_count} baris rincian SIPD`}
                >
                    Arumanis
                </span>
            ) : null}
            {item.is_konsultan ? (
                <span className="rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    Konsultan
                </span>
            ) : null}
            {item.status === 'canceled' ? (
                <span className="rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                    Dibatalkan
                </span>
            ) : null}
            {!hasKontrak && item.status !== 'canceled' ? (
                <span className="rounded border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    Belum berkontrak
                </span>
            ) : null}
        </>
    );
}
