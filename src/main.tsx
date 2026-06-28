import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ApiError } from '@/lib/api-client'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-stores'
import { handleServerError } from '@/lib/handle-server-error'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'

import { ErrorBoundary } from '@/components/error-boundary'
import { registerClientErrorReporting } from '@/lib/client-error-reporting'
import {
  clearReloadAttemptState,
  getServedBuildInfoFromDOM,
  handleStaleAppError,
  isAssetLoadError,
  rememberBuildId,
} from '@/lib/app-cache'
import { invalidateSessionCache } from '@/lib/auth-session'
// Generated Routes
import { routeTree } from './routeTree.gen'
// Styles
import './styles/index.css'

registerClientErrorReporting()

if (import.meta.env.PROD) {
  window.addEventListener('unhandledrejection', (event) => {
    if (isAssetLoadError(event.reason)) {
      event.preventDefault()
      void handleStaleAppError(event.reason)
    }
  })

  window.addEventListener('error', (event) => {
    const target = event.target
    let assetUrl = ''

    if (target instanceof HTMLScriptElement) {
      assetUrl = target.src
    } else if (target instanceof HTMLLinkElement && target.rel === 'stylesheet') {
      assetUrl = target.href
    } else {
      return
    }

    if (!assetUrl) {
      return
    }

    try {
      const resolved = new URL(assetUrl, window.location.href)
      if (resolved.origin !== window.location.origin) {
        return
      }
    } catch {
      return
    }

    event.preventDefault()
    void handleStaleAppError(
      new Error(event.message || 'Failed to load application asset'),
    )
  }, true)
}

// Define the router context type
export interface RouterContext {
  queryClient: QueryClient
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient: undefined! } as RouterContext,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 30_000,
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
          const pathname = router.history.location.pathname
          if (pathname === '/sign-in' || pathname.startsWith('/oauth-callback')) {
            invalidateSessionCache()
            useAuthStore.getState().auth.reset()
            return
          }

          toast.error('Session expired!')
          invalidateSessionCache()
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
;(router.options.context as RouterContext).queryClient = queryClient

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
    routerContext: RouterContext
  }
}

const servedBuild = getServedBuildInfoFromDOM()
if (servedBuild?.buildId) {
  rememberBuildId(servedBuild.buildId)
}

clearReloadAttemptState()

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <ErrorBoundary>
                <RouterProvider router={router} />
              </ErrorBoundary>
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
