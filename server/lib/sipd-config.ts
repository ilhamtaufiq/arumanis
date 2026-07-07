export const SIPD_PRODUCTION_URL = 'https://sipd-lite.cianjur.space'
export const SIPD_LOCAL_URL = 'http://127.0.0.1:8000'

export function resolveSipdBaseUrl(options?: {
  configuredUrl?: string
  isProduction?: boolean
}): string {
  const configured = options?.configuredUrl?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  const isProduction = options?.isProduction ?? false
  return (isProduction ? SIPD_PRODUCTION_URL : SIPD_LOCAL_URL).replace(/\/$/, '')
}