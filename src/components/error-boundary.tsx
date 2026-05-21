import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { reportClientError } from '@/lib/client-error-reporting'

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
        reportClientError('react', error, {
            componentStack: errorInfo.componentStack ?? undefined,
        })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
                    <div className="max-w-md space-y-4 text-center">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Terjadi kesalahan</h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Laporan error sudah dikirim agar admin bisa menindaklanjuti.
                            </p>
                        </div>
                        <Button onClick={() => window.location.reload()}>
                            Muat ulang
                        </Button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
