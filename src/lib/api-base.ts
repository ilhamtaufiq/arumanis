/**
 * Base URL API. Dibaca saat build dari VITE_API_BASE_URL (build-time).
 * Kosong berarti /api pada origin yang sama, dan trailing slash dibuang.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
