/// <reference types="vite/client" />

interface ImportMetaEnv {}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string
declare const __APP_BUILD_ID__: string