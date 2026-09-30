import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { handleStaleAppError } from "@/lib/app-cache"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wraps dynamic imports with a retry mechanism that reloads the page once
 * if the chunk fails to load (e.g. after a new deployment).
 */
export function lazyImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  name: string
): Promise<{ default: T }> {
  return new Promise((resolve, reject) => {
    const hasRefreshedKey = `retry-lazy-refreshed-${name}`;
    const hasRefreshed = JSON.parse(
      window.sessionStorage.getItem(hasRefreshedKey) || 'false'
    );
    
    importFn()
      .then((component) => {
        window.sessionStorage.setItem(hasRefreshedKey, 'false');
        resolve(component);
      })
      .catch((error) => {
        if (!hasRefreshed) {
          window.sessionStorage.setItem(hasRefreshedKey, 'true');
          void handleStaleAppError(error);
          return;
        }
        reject(error);
      });
  });
}
const EMPTY_ARRAY: readonly never[] = Object.freeze([])

/**
 * Fallback array kosong dengan referensi stabil untuk data query yang belum ada.
 * `data?.data ?? []` membuat array baru tiap render sehingga `useMemo`/`useEffect`
 * yang bergantung padanya selalu dijalankan ulang selama loading.
 * Array hasil fallback bersifat read-only (frozen) — jangan di-mutate.
 */
export function orEmpty<T>(value: T[] | null | undefined): T[] {
  return value ?? (EMPTY_ARRAY as unknown as T[])
}
