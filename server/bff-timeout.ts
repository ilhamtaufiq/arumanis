export const BFF_UPSTREAM_TIMEOUT_MS = 60_000
export const BFF_LONG_RUNNING_TIMEOUT_MS = 180_000
/** Restore upload / job APIs — not full multi-GB zip GET streams. */
export const BFF_FILE_TRANSFER_TIMEOUT_MS = 900_000

/**
 * Paths that stream large binary bodies (zip / pdf / attachments).
 * Used for timeout + Accept-Encoding identity + force-stream relay.
 */
export function isLargeFileTransferPath(targetPath: string, method = 'GET'): boolean {
  if (method !== 'GET' && method !== 'HEAD') return false

  return (
    /^app-settings\/backups\/.+\.zip$/i.test(targetPath) ||
    /^pekerjaan\/\d+\/download-all-berkas$/i.test(targetPath) ||
    /^berkas\/\d+\/export-pdf$/i.test(targetPath) ||
    /^tool-pdfs\/.+\/download/i.test(targetPath) ||
    /\/download(?:-zip)?$/i.test(targetPath) ||
    /\.zip$/i.test(targetPath)
  )
}

/**
 * Upstream abort timeout for BFF proxy.
 * Returns null = no AbortSignal (needed for multi-GB / long zip downloads;
 * a hard cap still aborts mid-stream on slow links).
 *
 * Important: AbortSignal.timeout applies to the whole upstream fetch including
 * body streaming. If it fires after status 200 was already relayed, the browser
 * sees `net::ERR_FAILED 200 (OK)` / TypeError: Failed to fetch.
 */
export function bffUpstreamTimeoutMs(targetPath: string, method = 'GET'): number | null {
  if (/^procurement\/spse\/(kontrak\/push|sync|packages\/)/.test(targetPath)) {
    return BFF_LONG_RUNNING_TIMEOUT_MS
  }

  // Stream backup archives without time cap — 3GB+ files can take >15 minutes.
  if (
    (method === 'GET' || method === 'HEAD') &&
    /^app-settings\/backups\/.+\.zip$/i.test(targetPath)
  ) {
    return null
  }

  // Server-side restore of multi-GB zips (extract + SQL + media) can run for hours.
  if (method === 'POST' && /^app-settings\/backups\/restore$/i.test(targetPath)) {
    return null
  }

  // create (returns 202 quickly) / list / jobs still need a bound
  if (/^app-settings\/backups(?:\/|$)/.test(targetPath)) {
    return BFF_FILE_TRANSFER_TIMEOUT_MS
  }

  // Pekerjaan "download all berkas" streams zip (build + body can exceed 60s).
  if (
    (method === 'GET' || method === 'HEAD') &&
    /^pekerjaan\/\d+\/download-all-berkas$/i.test(targetPath)
  ) {
    return null
  }

  // Single-file PDF export / other attachment downloads can exceed 60s.
  if (isLargeFileTransferPath(targetPath, method)) {
    return BFF_FILE_TRANSFER_TIMEOUT_MS
  }

  return BFF_UPSTREAM_TIMEOUT_MS
}
