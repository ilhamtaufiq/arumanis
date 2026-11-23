import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Aplikasi mobile memuat server (bukan file lokal) supaya cookie sesi BFF tetap berjalan seperti di web.
 * Alamat diambil dari CAPACITOR_SERVER_URL, mis. https://domain-anda/m. Beranda mobile ada di /m.
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL

const config: CapacitorConfig = {
    appId: 'space.cianjur.arumanis',
    appName: 'Arumanis',
    webDir: 'dist',
    server: serverUrl
        ? { url: serverUrl, cleartext: serverUrl.startsWith('http://') }
        : undefined,
}

export default config
