import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
          return window.location.reload();
        }
        reject(error);
      });
  });
}