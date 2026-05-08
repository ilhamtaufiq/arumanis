import { del, get, set } from 'idb-keyval'
import type {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client'

/**
 * Creates an Indexed DB persister for TanStack Query
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'arumanis-query-cache') {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client)
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey)
    },
    removeClient: async () => {
      await del(idbValidKey)
    },
  } satisfies Persister
}
