import { Link } from '@tanstack/react-router'
import type { ComponentType } from 'react'
import { ArrowRight, FileSignature, FileUp, Lock, Share2, TrendingUp, Unlock, Wrench } from 'lucide-react'
import { toast } from 'sonner'

import { getSettingValue, useAppSettings, useUpdateAppSettings } from '@/features/settings/api'
import { useAuthStore } from '@/stores/auth-stores'
import { PuspenMasterLayout } from './PuspenMasterLayout'

type ToolCard = {
    title: string
    description: string
    href: string
    accent: string
    icon: ComponentType<{ className?: string }>
    status: string
    publicAccess?: boolean
    canTogglePublic?: boolean
    onTogglePublic?: () => void
    isTogglingPublic?: boolean
}

const tools: ToolCard[] = [
    {
        title: 'Kelola PDF',
        description: 'Simpan file PDF ke server, atur file yang sudah ada, lalu pakai lagi tanpa upload ulang.',
        href: '/puspen/organize-pdf',
        accent: 'bg-[#8ECAE6]',
        icon: FileUp,
        status: 'Siap',
    },
    {
        title: 'TTD PDF Digital',
        description: 'Upload PDF, upload gambar tanda tangan, lalu klik halaman buat naro tanda tangan digital.',
        href: '/puspen/sign-pdf',
        accent: 'bg-[#FFB703]',
        icon: FileSignature,
        status: 'Siap',
    },
    {
        title: 'Estimasi Progress Fisik',
        description: 'Input rencana dan realisasi progress fisik per paket kontrak, dengan deviasi otomatis.',
        href: '/puspen/progress-fisik',
        accent: 'bg-[#2ECC71]',
        icon: TrendingUp,
        status: 'Siap',
    },
    {
        title: 'Media Sharing',
        description: 'Rakit caption, preview media, link, hashtag, lalu bagikan ke kanal sosial atau salin teks.',
        href: '/puspen/media-sharing',
        accent: 'bg-[#FB8500]',
        icon: Share2,
        status: 'Siap',
    },
]

function ToolCard({ tool }: { tool: ToolCard }) {
    const Icon = tool.icon
    const PublicIcon = tool.publicAccess ? Unlock : Lock

    return (
        <article className="overflow-hidden border-[3px] border-[#111111] bg-[#FFFFFF] shadow-[6px_6px_0_0_#111111] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
            <div className={`border-b-[3px] border-[#111111] px-4 py-3 ${tool.accent}`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-black uppercase tracking-[0.24em]">
                            {tool.status}
                        </div>
                        {tool.publicAccess !== undefined ? (
                            <div className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#FFF7E8] px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] shadow-[2px_2px_0_0_#111111]">
                                <PublicIcon className="h-3 w-3" />
                                {tool.publicAccess ? 'Publik' : 'Terkunci'}
                            </div>
                        ) : null}
                    </div>
                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-2 shadow-[3px_3px_0_0_#111111]">
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                        {tool.title}
                    </h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#111111]/75">
                        {tool.description}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to={tool.href}
                        className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                        Buka Alat
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                    {tool.canTogglePublic ? (
                        <button
                            type="button"
                            onClick={tool.onTogglePublic}
                            disabled={tool.isTogglingPublic}
                            className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#8ECAE6] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {tool.publicAccess ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            {tool.publicAccess ? 'Lock' : 'Unlock'}
                        </button>
                    ) : null}
                </div>
            </div>
        </article>
    )
}

export function PuspenHomePage() {
    const { auth } = useAuthStore()
    const isAdmin = auth.user?.roles.includes('admin') ?? false
    const settingsQuery = useAppSettings()
    const updateSettings = useUpdateAppSettings()
    const progressPublic = getSettingValue(settingsQuery.data?.data, 'puspen_progress_fisik_public') === '1'

    const handleToggleProgressPublic = () => {
        updateSettings.mutate(
            { puspen_progress_fisik_public: progressPublic ? '0' : '1' },
            {
                onSuccess: () => {
                    toast.success(progressPublic ? 'Progress fisik publik dikunci' : 'Progress fisik publik dibuka')
                },
                onError: () => {
                    toast.error('Gagal mengubah akses publik progress fisik')
                },
            }
        )
    }

    const visibleTools = tools.map((tool) => {
        if (tool.href !== '/puspen/progress-fisik') return tool

        return {
            ...tool,
            publicAccess: progressPublic,
            canTogglePublic: isAdmin,
            onTogglePublic: handleToggleProgressPublic,
            isTogglingPublic: updateSettings.isPending,
        }
    })

    return (
        <PuspenMasterLayout
            eyebrow={(
                <span className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Puspen Arumanis
                </span>
            )}
            title="PUSPEN ARUMANIS"
            description="Command center untuk workflow Arumanis. Berisi alat kerja buat mempermudah SOP pekerjaan, biar alurnya lebih cepet, rapi, dan gak ribet."
            aside={(
                <>
                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]/60">
                            Panel Info
                        </div>
                        <div className="mt-2 text-2xl font-black uppercase tracking-[0.04em]">
                            Empat alat aktif
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Alat Puspen aktif untuk PDF, tanda tangan digital, estimasi progress fisik, dan media sharing.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            'Kelola PDF buat simpan file ke server dan pakai lagi kapan aja',
                            'TTD PDF Digital buat tanda tangan dokumen tanpa ribet',
                            'Estimasi progress fisik mengambil nama paket pekerjaan dari Kontrak',
                            'Media Sharing buat nyiapin caption, link, hashtag, dan preview materi',
                            'Hasilnya bisa diunduh atau langsung disimpan ke server',
                            'Puspen berdiri sendiri tanpa sidebar shell utama',
                        ].map((item, index) => (
                            <div
                                key={item}
                                className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[3px_3px_0_0_#111111]"
                            >
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                    Catatan {index + 1}
                                </div>
                                <div className="mt-1 text-sm font-bold leading-6">
                                    {item}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleTools.map((tool) => (
                    <ToolCard key={tool.title} tool={tool} />
                ))}
            </div>
        </PuspenMasterLayout>
    )
}
