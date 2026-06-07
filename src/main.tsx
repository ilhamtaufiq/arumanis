/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ApiError } from '@/lib/api-client'
import {
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createIDBPersister } from '@/lib/persister'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-stores'
import { handleServerError } from '@/lib/handle-server-error'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'
import { registerSW } from 'virtual:pwa-register'
import { setupMutationDefaults } from '@/lib/mutation-setup'
import { ErrorBoundary } from '@/components/error-boundary'
import { registerClientErrorReporting } from '@/lib/client-error-reporting'
// Generated Routes
import { routeTree } from './routeTree.gen'
// Styles
import './styles/index.css'

// Register Service Worker for PWA
const updateSW = registerSW({
  onRegisteredSW(swUrl, r) {
    if (r) {
      // Cek pembaruan setiap 1 jam (dinamis)
      setInterval(async () => {
        if (!(!r.installing && navigator)) return
        if (('connection' in navigator) && !navigator.onLine) return
        const resp = await fetch(swUrl, { cache: 'no-store', headers: { 'cache-control': 'no-cache' }})
        if (resp?.status === 200) await r.update()
      }, 60 * 60 * 1000)
    }
  },
  onNeedRefresh() {
    toast('Aplikasi versi terbaru tersedia!', {
      action: {
        label: 'Perbarui Sekarang',
        onClick: () => updateSW(true)
      },
      duration: 100000,
    })
  },
  onOfflineReady() {
    toast.info('Aplikasi siap digunakan offline')
  },
})

registerClientErrorReporting()

// Define the router context type
export interface RouterContext {
  queryClient: QueryClient
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient: undefined! } as RouterContext,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
         
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof ApiError &&
          [401, 403].includes(error.status)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours for offline persistence
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof ApiError) {
          if (error.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().auth.reset()
          const redirect = `${router.history.location.href}`
          router.navigate({ to: '/sign-in', search: { redirect } })
        }
        if (error.status === 500) {
          toast.error('Internal Server Error!')
        }
        if (error.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

  // Set the queryClient context on the router
  ; (router.options.context as RouterContext).queryClient = queryClient

  // Setup mutation defaults for offline support
  setupMutationDefaults(queryClient)

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
    routerContext: RouterContext
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: createIDBPersister(),
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
        }}
        onSuccess={() => {
          // Resume mutations after restoration
          queryClient.resumePausedMutations()
        }}
      >
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <ErrorBoundary>
                <RouterProvider router={router} />
              </ErrorBoundary>
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </StrictMode>
  )
}
