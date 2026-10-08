import { buildExternalAppCallbackUrl } from '@/lib/post-login-redirect'
import { getGisAppBaseUrl } from '@/lib/gis-app'
import { getPengawasAppBaseUrl } from '@/lib/pengawas-app'

export async function createHandoffCode(): Promise<string> {
  const response = await fetch('/api/auth/handoff', {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.code) {
    throw new Error(payload?.message || 'Gagal membuat sesi handoff')
  }

  return payload.code as string
}

export const createPengawasHandoffCode = createHandoffCode

export function buildPengawasHandoffUrl(code: string, targetPath?: string): string {
  const baseUrl = getPengawasAppBaseUrl()
  const url = `${baseUrl}/login?code=${encodeURIComponent(code)}`
  // Teruskan deep link (mis. /pengawasan/pekerjaan/5) supaya sesi habis di
  // tengah halaman tidak mendarat di dashboard. Sisi pengawas mengupas
  // prefix base-nya sendiri (resolveLoginRedirectTarget).
  return targetPath ? `${url}&redirect=${encodeURIComponent(targetPath)}` : url
}

export function buildGisHandoffUrl(code: string): string {
  const baseUrl = getGisAppBaseUrl()
  return `${baseUrl}/login?code=${encodeURIComponent(code)}`
}

export async function redirectToPengawasWithHandoff(targetPath?: string): Promise<void> {
  const code = await createHandoffCode()
  window.location.replace(buildPengawasHandoffUrl(code, targetPath))
}

export async function redirectToGisWithHandoff(): Promise<void> {
  const code = await createHandoffCode()
  window.location.replace(buildGisHandoffUrl(code))
}

export async function redirectToExternalAppWithHandoff(redirectUrl: string): Promise<void> {
  const code = await createHandoffCode()
  window.location.replace(buildExternalAppCallbackUrl(redirectUrl, code))
}