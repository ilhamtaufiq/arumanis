import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportClientError } from '@/lib/client-error-reporting'
import { hardReloadApp, isChunkLoadError } from '@/lib/app-cache'
import { AppUpdateOverlay } from '@/components/app-update-overlay'
import { ServerErrorPage } from '@/components/errors/error-page'

type ErrorBoundaryProps = {
    children: ReactNode
}

type ErrorBoundaryState = {
    hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (isChunkLoadError(error)) {
            void hardReloadApp()
            return
        }

        reportClientError('react', error, {
            componentStack: errorInfo.componentStack ?? undefined,
        })
    }

    render() {
        if (this.state.hasError) {
            return <ServerErrorPage />
        }

        return this.props.children
    }
}
