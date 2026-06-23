import type { ComponentType } from 'react'
import { Award, FileSignature, FileUp, Share2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

import { getSettingValue, useAppSettings, useUpdateAppSettings } from '@/features/settings/api'
import { useAuthStore } from '@/stores/auth-stores'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../lib/tokens'
import { PuspenHubHero } from './hub/PuspenHubHero'
import { PuspenHubShell } from './hub/PuspenHubShell'
import { PuspenHubStatusBar } from './hub/PuspenHubStatusBar'
import { PuspenMissionPanel } from './hub/PuspenMissionPanel'
import { PuspenToolSlotCard, type PuspenToolSlot } from './hub/PuspenToolSlotCard'
import { PuspenWorkflowMap } from './hub/PuspenWorkflowMap'

const toolIcons: Record<string, ComponentType<{ className?: string }>> = {
    [PUSPEN_TOOLS.organizePdf.href]: FileUp,
    [PUSPEN_TOOLS.signPdf.href]: FileSignature,
    [PUSPEN_TOOLS.progressFisik.href]: TrendingUp,
    [PUSPEN_TOOLS.mediaSharing.href]: Share2,
    [PUSPEN_TOOLS.pengawasKpi.href]: Award,
}

const toolTags: Record<string, string> = {
    [PUSPEN_TOOLS.organizePdf.href]: 'Archive',
    [PUSPEN_TOOLS.signPdf.href]: 'Sign',
    [PUSPEN_TOOLS.progressFisik.href]: 'Track',
    [PUSPEN_TOOLS.mediaSharing.href]: 'Share',
    [PUSPEN_TOOLS.pengawasKpi.href]: 'KPI',
}

const toolDescriptions: Record<string, string> = {
    [PUSPEN_TOOLS.organizePdf.href]:
        'Simpan file PDF ke server, atur arsip yang sudah ada, lalu pakai lagi tanpa upload ulang.',
    [PUSPEN_TOOLS.signPdf.href]:
        'Upload PDF, pilih tanda tangan, klik halaman — tanda tangan digital langsung menempel.',
    [PUSPEN_TOOLS.progressFisik.href]:
        'Input rencana dan realisasi progress fisik per paket kontrak. Deviasi dihitung otomatis.',
    [PUSPEN_TOOLS.mediaSharing.href]:
        'Rakit caption, preview media, link, hashtag — bagikan ke kanal sosial atau salin teks.',
    [PUSPEN_TOOLS.pengawasKpi.href]:
        'Hall of Fame: peringkat pengawas berdasarkan input di Output, Penerima, Foto dan Progress Fisik untuk pekerjaan yang diawasi.',
}

const baseTools = Object.values(PUSPEN_TOOLS).map((tool) => ({
    slot: tool.slot,
    title: tool.title,
    description: toolDescriptions[tool.href],
    href: tool.href,
    accent: tool.accent,
    icon: toolIcons[tool.href],
    status: 'Ready',
    tag: toolTags[tool.href],
}))

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

    const tools: PuspenToolSlot[] = baseTools.map((tool) => {
        if (tool.href !== PUSPEN_TOOLS.progressFisik.href) return tool

        return {
            ...tool,
            publicAccess: progressPublic,
            canTogglePublic: isAdmin,
            onTogglePublic: handleToggleProgressPublic,
            isTogglingPublic: updateSettings.isPending,
        }
    })

    return (
        <PuspenHubShell>
            <PuspenHubStatusBar playerName={auth.user?.name} activeTools={tools.length} />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <PuspenHubHero activeTools={tools.length} />

                <div className="grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
                    <div className="space-y-6">
                        <section>
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <div className={`${puspenLabel} text-[#111111]/60`}>Tool Select</div>
                                    <h2 className="text-xl font-black uppercase tracking-[0.08em] sm:text-2xl">
                                        Pilih Alat Kerja
                                    </h2>
                                </div>
                                <span className={`bg-[#FFF7E8] px-3 py-1.5 ${puspenBorder} ${puspenShadowMd} ${puspenLabel}`}>
                                    {tools.length} Slot Tersedia
                                </span>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                {tools.map((tool) => (
                                    <PuspenToolSlotCard key={tool.slot} tool={tool} />
                                ))}
                            </div>
                        </section>

                        <PuspenWorkflowMap />
                    </div>

                    <PuspenMissionPanel isAdmin={isAdmin} progressPublic={progressPublic} />
                </div>
            </div>
        </PuspenHubShell>
    )
}