const BFF_ME = '/bff/auth/me'

export type SessionUser = {
  id: number
  name: string
  email: string
  roles: string[] | Array<{ name: string }>
  permissions?: string[] | Array<{ name: string }>
  avatar?: string | null
}

export type SessionPayload = {
  user: SessionUser | null
  isImpersonating?: boolean
  impersonator?: {
    user: SessionUser | null
    token?: string
  } | null
}

export async function fetchSession(): Promise<SessionPayload | null> {
  try {
    const response = await fetch(BFF_ME, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    return {
      user: payload?.user ?? null,
      isImpersonating: Boolean(payload?.isImpersonating),
      impersonator: payload?.impersonator ?? null,
    }
  } catch {
    return null
  }
}

export async function hasActiveSession(): Promise<boolean> {
  const session = await fetchSession()
  return Boolean(session?.user)
}