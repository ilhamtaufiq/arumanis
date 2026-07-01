import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportClientError } from '@/lib/client-error-reporting'
import {
    getReloadAttemptCount,
    handleStaleAppError,
    isAssetLoadError,
    MAX_AUTO_RELOAD_ATTEMPTS,
} from '@/lib/app-cache'
import { AppUpdateOverlay } from '@/components/app-update-overlay'
import { ServerErrorPage } from '@/components/errors/error-page'

type ErrorBoundaryProps = {
    children: ReactNode
}

type ErrorBoundaryState = {
    hasError: boolean
    isStaleAssetError: boolean
    reloadFailed: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
        isStaleAssetError: false,
        reloadFailed: false,
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        if (isAssetLoadError(error)) {
            return {
                hasError: true,
                isStaleAssetError: true,
                reloadFailed: false,
            }
        }

        return {
            hasError: true,
            isStaleAssetError: false,
            reloadFailed: false,
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (isAssetLoadError(error)) {
            void handleStaleAppError(error).then((started) => {
                if (!started) {
                    this.setState({ reloadFailed: true })
                }
            })
            return
        }

        reportClientError('react', error, {
            componentStack: errorInfo.componentStack ?? undefined,
        })
    }

    render() {
        if (this.state.hasError) {
            if (this.state.isStaleAssetError) {
                if (this.state.reloadFailed || getReloadAttemptCount() >= MAX_AUTO_RELOAD_ATTEMPTS) {
                    return <ServerErrorPage showReload />
                }

                return <AppUpdateOverlay forceVisible />
            }

            return <ServerErrorPage />
        }

        return this.props.children
    }
}