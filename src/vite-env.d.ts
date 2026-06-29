/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_UMAMI_SCRIPT_URL?: string
    readonly VITE_UMAMI_WEBSITE_ID?: string
    readonly VITE_UMAMI_DOMAINS?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string
declare const __APP_BUILD_ID__: string