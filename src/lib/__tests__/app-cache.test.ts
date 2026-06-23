import { afterEach, describe, expect, it, vi } from 'vitest'
import { hasNewBuildAvailable, isChunkLoadError } from '../app-cache'

describe('app-cache', () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('detects chunk load errors', () => {
        expect(isChunkLoadError(new Error('Failed to fetch dynamically imported module'))).toBe(true)
        expect(isChunkLoadError(new Error('Importing a module script failed'))).toBe(true)
        expect(isChunkLoadError(new Error('Something else'))).toBe(false)
    })

    it('detects new builds from remote manifest', () => {
        vi.stubEnv('DEV', false)

        const embedded = { version: '0.4.0', buildId: 'abc123', builtAt: '' }
        const remote = { version: '0.4.0', buildId: 'xyz789', builtAt: '' }

        expect(hasNewBuildAvailable(embedded, remote)).toBe(true)
        expect(hasNewBuildAvailable(embedded, embedded)).toBe(false)
        expect(hasNewBuildAvailable(embedded, { ...remote, buildId: 'dev' })).toBe(false)
    })
})