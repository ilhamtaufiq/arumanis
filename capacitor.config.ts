import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Aplikasi mobile memuat server (bukan file lokal) supaya cookie sesi BFF tetap berjalan seperti di web.
 * Alamat default https://arumanis.cianjur.space/m (frontend). Bisa diganti lewat CAPACITOR_SERVER_URL.
 */
// Frontend. Backend (apiamis.cianjur.space) dipanggil lewat BFF di origin yang sama, jadi tidak diatur di sini.
const serverUrl = process.env.CAPACITOR_SERVER_URL ?? 'https://arumanis.cianjur.space/m'

const config: CapacitorConfig = {
    appId: 'space.cianjur.arumanis',
    appName: 'Arumanis',
    webDir: 'dist',
    server: serverUrl
        ? { url: serverUrl, cleartext: serverUrl.startsWith('http://') }
        : undefined,
}

export default config
