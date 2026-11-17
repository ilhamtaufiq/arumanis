/** Tahun paling awal yang bisa dipilih di dropdown tahun SPAM. */
export const TAHUN_OPTIONS_MULAI = 2017

/** Tahun di dropdown dari yang terbaru ke yang terlama: 2026 sampai 2017. */
export const TAHUN_OPTIONS = Array.from({ length: 2026 - TAHUN_OPTIONS_MULAI + 1 }, (_, i) => String(2026 - i))
