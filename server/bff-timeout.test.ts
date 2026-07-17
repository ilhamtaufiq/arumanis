import { describe, expect, it } from 'bun:test'
import {
  BFF_FILE_TRANSFER_TIMEOUT_MS,
  BFF_LONG_RUNNING_TIMEOUT_MS,
  BFF_UPSTREAM_TIMEOUT_MS,
  bffUpstreamTimeoutMs,
  isLargeFileTransferPath,
} from './bff-timeout.ts'

describe('bffUpstreamTimeoutMs', () => {
  it('uses default 60s for normal API GETs', () => {
    expect(bffUpstreamTimeoutMs('pekerjaan/682', 'GET')).toBe(BFF_UPSTREAM_TIMEOUT_MS)
    expect(bffUpstreamTimeoutMs('berkas/1', 'GET')).toBe(BFF_UPSTREAM_TIMEOUT_MS)
  })

  it('disables timeout for download-all-berkas (zip build + stream)', () => {
    expect(bffUpstreamTimeoutMs('pekerjaan/682/download-all-berkas', 'GET')).toBeNull()
    expect(bffUpstreamTimeoutMs('pekerjaan/682/download-all-berkas', 'HEAD')).toBeNull()
  })

  it('extends timeout for single-file export-pdf', () => {
    expect(bffUpstreamTimeoutMs('berkas/99/export-pdf', 'GET')).toBe(BFF_FILE_TRANSFER_TIMEOUT_MS)
  })

  it('disables timeout for large backup zip streams', () => {
    expect(bffUpstreamTimeoutMs('app-settings/backups/arumanis_full.zip', 'GET')).toBeNull()
  })

  it('keeps long-running SPSE sync bound', () => {
    expect(bffUpstreamTimeoutMs('procurement/spse/sync', 'POST')).toBe(BFF_LONG_RUNNING_TIMEOUT_MS)
  })

  it('flags large-file transfer paths', () => {
    expect(isLargeFileTransferPath('pekerjaan/682/download-all-berkas')).toBe(true)
    expect(isLargeFileTransferPath('berkas/1/export-pdf')).toBe(true)
    expect(isLargeFileTransferPath('app-settings/backups/x.zip')).toBe(true)
    expect(isLargeFileTransferPath('pekerjaan/682')).toBe(false)
  })
})
