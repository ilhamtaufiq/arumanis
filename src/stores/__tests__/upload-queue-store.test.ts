import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'
import { useUploadQueue } from '../upload-queue-store'

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
    randomUUID: () => 'test-uuid'
})

// Mock indexedDB for persist middleware
const mockDB = {
    open: vi.fn().mockReturnValue({
        onupgradeneeded: vi.fn(),
        onsuccess: vi.fn(),
        onerror: vi.fn(),
    })
}
vi.stubGlobal('indexedDB', mockDB)

describe('useUploadQueue', () => {
    beforeEach(() => {
        act(() => {
            useUploadQueue.getState().clearQueue()
        })
    })

    it('should add to queue', () => {
        const mockUpload = {
            pekerjaanId: 1,
            komponenId: null,
            penerimaId: null,
            keterangan: 'Test',
            koordinat: '0,0',
            fileName: 'test.jpg',
            fileBlob: new Blob(['test'], { type: 'image/jpeg' })
        }

        act(() => {
            useUploadQueue.getState().addToQueue(mockUpload)
        })

        const state = useUploadQueue.getState()
        expect(state.queue).toHaveLength(1)
        expect(state.queue[0]).toMatchObject({
            ...mockUpload,
            id: 'test-uuid',
            status: 'pending'
        })
    })

    it('should remove from queue', () => {
        const id = 'test-id'
        useUploadQueue.setState({
            queue: [{ id, pekerjaanId: 1 } as any]
        })

        act(() => {
            useUploadQueue.getState().removeFromQueue(id)
        })

        expect(useUploadQueue.getState().queue).toHaveLength(0)
    })

    it('should update status', () => {
        const id = 'test-id'
        useUploadQueue.setState({
            queue: [{ id, status: 'pending' } as any]
        })

        act(() => {
            useUploadQueue.getState().updateStatus(id, 'uploading')
        })

        expect(useUploadQueue.getState().queue[0].status).toBe('uploading')

        act(() => {
            useUploadQueue.getState().updateStatus(id, 'error', 'Failed')
        })

        expect(useUploadQueue.getState().queue[0].status).toBe('error')
        expect(useUploadQueue.getState().queue[0].errorMessage).toBe('Failed')
    })
})
