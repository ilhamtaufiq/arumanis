import { useAuthStore } from '@/stores/auth-stores'

const BFF_ME = '/bff/auth/me'
/** How long a successful /me response is reused for navigations and preloads. */
const SESSION_CACHE_MS = 30_000

export type SessionUser = {
  id: number
  name: string
  email: string
  roles: string[] | Array<{ name: string }>
  permissions?: string[] | Array<{ name: string }>
  avatar?: string | null
  gender?: string | null
}

export type SessionPayload = {
  user: SessionUser | null
  isImpersonating?: boolean
  impersonator?: {
    user: SessionUser | null
    token?: string
  } | null
}

let cachedSession: { payload: SessionPayload | null; at: number } | null = null
let inflightSession: Promise<SessionPayload | null> | null = null

export function invalidateSessionCache(): void {
  cachedSession = null
  inflightSession = null
}

function sessionUserId(user: SessionUser | null | undefined): number | null {
  return user?.id ?? null
}

function isSameSession(
  current: {
    user: { id: number } | null
    isSessionActive: boolean
    isImpersonating: boolean
    impersonator: { user: { id: number } | null } | null
  },
  next: SessionPayload,
): boolean {
  const nextUserId = sessionUserId(next.user)
  const nextImpersonatorId = sessionUserId(next.impersonator?.user ?? null)
  const currentImpersonatorId = current.impersonator?.user?.id ?? null

  return (
    Boolean(current.isSessionActive) === Boolean(next.user) &&
    (current.user?.id ?? null) === nextUserId &&
    Boolean(current.isImpersonating) === Boolean(next.isImpersonating) &&
    currentImpersonatorId === nextImpersonatorId
  )
}

function applySessionToStore(session: SessionPayload | null): void {
  const auth = useAuthStore.getState().auth

  if (!session?.user) {
    if (auth.isSessionActive || auth.user) {
      auth.reset()
    }
    return
  }

  if (
    isSameSession(
      {
        user: auth.user,
        isSessionActive: auth.isSessionActive,
        isImpersonating: auth.isImpersonating,
        impersonator: auth.impersonator,
      },
      session,
    )
  ) {
    return
  }

  auth.hydrateFromSession({
    user: session.user,
    isImpersonating: session.isImpersonating,
    impersonator: session.impersonator,
  })
}

async function requestSession(): Promise<SessionPayload | null> {
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

export async function fetchSession(options?: { force?: boolean }): Promise<SessionPayload | null> {
  const force = options?.force === true

  if (!force && cachedSession && Date.now() - cachedSession.at < SESSION_CACHE_MS) {
    return cachedSession.payload
  }

  // Deduplicate concurrent /me calls (preload + beforeLoad + effects).
  if (inflightSession) {
    return inflightSession
  }

  inflightSession = (async () => {
    const payload = await requestSession()
    cachedSession = { payload, at: Date.now() }
    applySessionToStore(payload)
    return payload
  })()

  try {
    return await inflightSession
  } finally {
    inflightSession = null
  }
}

export async function hasActiveSession(): Promise<boolean> {
  const session = await fetchSession()
  return Boolean(session?.user)
}
