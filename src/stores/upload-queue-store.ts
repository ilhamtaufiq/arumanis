import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface QueuedUpload {
    id: string;
    pekerjaanId: number;
    komponenId: number | null;
    penerimaId: number | null;
    keterangan: string;
    koordinat: string;
    timestamp: number;
    fileName: string;
    fileBlob: Blob;
    status: 'pending' | 'uploading' | 'error';
    errorMessage?: string;
}

interface UploadQueueState {
    queue: QueuedUpload[];
    addToQueue: (upload: Omit<QueuedUpload, 'id' | 'timestamp' | 'status'>) => void;
    removeFromQueue: (id: string) => void;
    updateStatus: (id: string, status: QueuedUpload['status'], error?: string) => void;
    clearQueue: () => void;
}

/**
 * Custom Storage for Zustand to handle Blobs via IndexedDB
 * Standard localStorage cannot store large Blobs.
 */
const idbStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const request = indexedDB.open('ArumanisOffline', 1);
            request.onupgradeneeded = () => {
                request.result.createObjectStore('uploads');
            };
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction('uploads', 'readonly');
                const store = transaction.objectStore('uploads');
                const getRequest = store.get(name);
                getRequest.onsuccess = () => {
                    resolve(JSON.stringify(getRequest.result));
                };
                getRequest.onerror = () => resolve(null);
            };
            request.onerror = () => resolve(null);
        });
    },
    setItem: async (name: string, value: string): Promise<void> => {
        return new Promise((resolve) => {
            const data = JSON.parse(value);
            const request = indexedDB.open('ArumanisOffline', 1);
            request.onupgradeneeded = () => {
                request.result.createObjectStore('uploads');
            };
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction('uploads', 'readwrite');
                const store = transaction.objectStore('uploads');
                store.put(data, name);
                transaction.oncomplete = () => resolve();
            };
        });
    },
    removeItem: async (name: string): Promise<void> => {
        return new Promise((resolve) => {
            const request = indexedDB.open('ArumanisOffline', 1);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction('uploads', 'readwrite');
                const store = transaction.objectStore('uploads');
                store.delete(name);
                transaction.oncomplete = () => resolve();
            };
        });
    }
};

export const useUploadQueue = create<UploadQueueState>()(
    persist(
        (set) => ({
            queue: [],
            addToQueue: (upload) => set((state) => ({
                queue: [
                    ...state.queue,
                    {
                        ...upload,
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                        status: 'pending'
                    }
                ]
            })),
            removeFromQueue: (id) => set((state) => ({
                queue: state.queue.filter(q => q.id !== id)
            })),
            updateStatus: (id, status, error) => set((state) => ({
                queue: state.queue.map(q => q.id === id ? { ...q, status, errorMessage: error } : q)
            })),
            clearQueue: () => set({ queue: [] }),
        }),
        {
            name: 'upload-queue-storage',
            storage: createJSONStorage(() => (idbStorage as any)),
        }
    )
);
