import { getPengawasAppBaseUrl } from '@/lib/pengawas-app'

export async function createPengawasHandoffCode(): Promise<string> {
  const response = await fetch('/bff/auth/handoff', {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.code) {
    throw new Error(payload?.message || 'Gagal membuat sesi handoff pengawas')
  }

  return payload.code as string
}

export function buildPengawasHandoffUrl(code: string): string {
  const baseUrl = getPengawasAppBaseUrl()
  return `${baseUrl}/login?code=${encodeURIComponent(code)}`
}

export async function redirectToPengawasWithHandoff(): Promise<void> {
  const code = await createPengawasHandoffCode()
  window.location.replace(buildPengawasHandoffUrl(code))
}