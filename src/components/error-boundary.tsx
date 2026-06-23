import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { reportClientError } from '@/lib/client-error-reporting'
import { hardReloadApp } from '@/lib/app-cache'

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
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <Button onClick={() => void hardReloadApp()} className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Bersihkan Cache & Muat Ulang
                            </Button>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Muat ulang biasa
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
