const HOP_BY_HOP_HEADERS = new Set([
  'content-length',
  'content-encoding',
  'transfer-encoding',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'upgrade',
])

const FORWARDED_REQUEST_HEADERS = [
  'accept',
  'accept-encoding',
  'accept-language',
  'authorization',
  'content-type',
  'cookie',
  'origin',
  'range',
  'referer',
  'user-agent',
]

export type OnlyOfficeWsData = {
  upstreamUrl: string
  upstream?: WebSocket
}

export function isOnlyOfficeRequest(pathname: string): boolean {
  return pathname === '/office' || pathname.startsWith('/office/')
}

export function buildOnlyOfficeHttpUrl(requestUrl: URL, baseUrl: string): URL {
  const path = requestUrl.pathname.replace(/^\/office/, '') || '/'
  const relativePath = path.startsWith('/') ? path.slice(1) : path
  const target = new URL(relativePath, `${baseUrl.replace(/\/$/, '')}/`)
  target.search = requestUrl.search
  return target
}

export function buildOnlyOfficeWebSocketUrl(requestUrl: URL, baseUrl: string): string {
  const httpUrl = buildOnlyOfficeHttpUrl(requestUrl, baseUrl)
  return httpUrl.toString().replace(/^https?:/, baseUrl.startsWith('https') ? 'wss:' : 'ws:')
}

export function buildOnlyOfficeProxyHeaders(
  req: Request,
  baseUrl: string,
  forceHttpsForwardedProto: boolean,
): Headers {
  const headers = new Headers()

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = req.headers.get(name)
    if (value) {
      headers.set(name, value)
    }
  }

  try {
    headers.set('Host', new URL(baseUrl).host)
  } catch {
    // ignore invalid base URL
  }

  const requestUrl = new URL(req.url)
  const forwardedProto = forceHttpsForwardedProto
    ? 'https'
    : (req.headers.get('x-forwarded-proto') || requestUrl.protocol.replace(':', ''))
  headers.set('X-Forwarded-Proto', forwardedProto)

  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (forwardedHost) {
    headers.set('X-Forwarded-Host', forwardedHost)
  }

  const forwardedFor = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
  if (forwardedFor) {
    headers.set('X-Forwarded-For', forwardedFor)
  }

  return headers
}

function filterOnlyOfficeResponseHeaders(headers: Headers): Headers {
  const next = new Headers()

  for (const [key, value] of headers.entries()) {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      next.set(key, value)
    }
  }

  next.delete('x-frame-options')
  next.delete('content-security-policy')
  next.delete('content-security-policy-report-only')

  return next
}

export async function proxyOnlyOfficeHttp(
  req: Request,
  baseUrl: string,
  forceHttpsForwardedProto: boolean,
): Promise<Response> {
  const target = buildOnlyOfficeHttpUrl(new URL(req.url), baseUrl)
  const headers = buildOnlyOfficeProxyHeaders(req, baseUrl, forceHttpsForwardedProto)
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer()
  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
  }

  if (body !== undefined) {
    init.body = body
  }

  try {
    const response = await fetch(target, init)
    const responseHeaders = filterOnlyOfficeResponseHeaders(response.headers)

    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: responseHeaders,
    })
  } catch {
    return Response.json({ message: 'ONLYOFFICE Document Server tidak tersedia' }, { status: 502 })
  }
}

export function createOnlyOfficeWebSocketHandlers(): {
  open(ws: { data: OnlyOfficeWsData; send: (data: string | ArrayBuffer | Uint8Array) => void; close: (code?: number, reason?: string) => void })
  message(ws: { data: OnlyOfficeWsData }, message: string | Buffer)
  close(ws: { data: OnlyOfficeWsData })
} {
  return {
    open(ws) {
      const upstream = new WebSocket(ws.data.upstreamUrl)
      ws.data.upstream = upstream

      upstream.onmessage = (event) => {
        ws.send(event.data)
      }

      upstream.onerror = () => {
        ws.close(1011, 'Upstream ONLYOFFICE socket error')
      }

      upstream.onclose = (event) => {
        ws.close(event.code, event.reason)
      }
    },
    message(ws, message) {
      const upstream = ws.data.upstream
      if (upstream?.readyState === WebSocket.OPEN) {
        upstream.send(message)
      }
    },
    close(ws) {
      ws.data.upstream?.close()
    },
  }
}