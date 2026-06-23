import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Grainient from '@/components/ui/Grainient'
import { hardReloadApp } from '@/lib/app-cache'

type ErrorPageAction = {
    label: string
    onClick?: () => void
    to?: string
    variant?: 'default' | 'outline' | 'ghost'
    icon?: LucideIcon
}

type ErrorPageProps = {
    code: string
    title: string
    description: string
    tone?: 'neutral' | 'warning' | 'danger'
    actions?: ErrorPageAction[]
    showReload?: boolean
}

const toneColors = {
    neutral: { color1: '#4F46E5', color2: '#312E81', color3: '#1E1B4B' },
    warning: { color1: '#F59E0B', color2: '#B45309', color3: '#78350F' },
    danger: { color1: '#FF4D4D', color2: '#A10000', color3: '#4D0000' },
}

export function ErrorPage({
    code,
    title,
    description,
    tone = 'neutral',
    actions = [],
    showReload = false,
}: ErrorPageProps) {
    const palette = toneColors[tone]

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
            <Grainient
                className="fixed inset-0 z-0 opacity-40 pointer-events-none"
                color1={palette.color1}
                color2={palette.color2}
                color3={palette.color3}
            />

            <div className="relative z-10 max-w-lg w-full px-6 text-center">
                <div className="mb-6 text-[72px] font-black leading-none tracking-tight text-white/10">
                    {code}
                </div>

                <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
                    {title}
                </h1>

                <p className="text-slate-400 mb-10 leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-col gap-3">
                    {actions.map((action) => {
                        const Icon = action.icon

                        if (action.to) {
                            return (
                                <Button
                                    key={action.label}
                                    asChild
                                    variant={action.variant || 'default'}
                                    className="w-full gap-2"
                                >
                                    <Link to={action.to}>
                                        {Icon ? <Icon className="h-4 w-4" /> : null}
                                        {action.label}
                                    </Link>
                                </Button>
                            )
                        }

                        return (
                            <Button
                                key={action.label}
                                variant={action.variant || 'default'}
                                className="w-full gap-2"
                                onClick={action.onClick}
                            >
                                {Icon ? <Icon className="h-4 w-4" /> : null}
                                {action.label}
                            </Button>
                        )
                    })}

                    {showReload ? (
                        <Button
                            variant="outline"
                            className="w-full border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white gap-2"
                            onClick={() => void hardReloadApp()}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Bersihkan cache & muat ulang
                        </Button>
                    ) : null}

                    <Button
                        variant="ghost"
                        className="text-slate-500 hover:text-slate-300 gap-2 mt-2"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-900">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">
                        Arumanis
                    </p>
                </div>
            </div>
        </div>
    )
}

export function NotFoundPage() {
    return (
        <ErrorPage
            code="404"
            title="Halaman tidak ditemukan"
            description="Alamat yang Anda buka tidak ada atau sudah dipindahkan. Periksa URL atau kembali ke halaman utama."
            tone="neutral"
            actions={[
                { label: 'Ke beranda', to: '/dashboard', icon: Home, variant: 'default' },
            ]}
        />
    )
}

export function ForbiddenPage() {
    return (
        <ErrorPage
            code="403"
            title="Akses ditolak"
            description="Anda tidak memiliki izin untuk membuka halaman ini. Hubungi administrator jika Anda yakin ini sebuah kesalahan."
            tone="warning"
            actions={[
                { label: 'Ke dashboard', to: '/dashboard', icon: Home, variant: 'default' },
                { label: 'Ke beranda', to: '/', icon: Home, variant: 'outline' },
            ]}
        />
    )
}

export function ServerErrorPage() {
    return (
        <ErrorPage
            code="500"
            title="Terjadi kesalahan"
            description="Aplikasi mengalami gangguan sementara. Coba muat ulang halaman atau kembali beberapa saat lagi."
            tone="danger"
            showReload
            actions={[
                { label: 'Ke dashboard', to: '/dashboard', icon: Home, variant: 'default' },
            ]}
        />
    )
}