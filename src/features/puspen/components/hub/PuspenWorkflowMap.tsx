import { Award, FileSearch, FileSignature, FileUp, Share2, TrendingUp } from 'lucide-react'
import { PUSPEN_TOOLS, PUSPEN_UI } from '../../lib/tool-meta'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../../lib/tokens'

const steps = [
    { label: PUSPEN_TOOLS.organizePdf.workflowLabel, icon: FileUp, color: 'bg-[#8ECAE6]' },
    { label: PUSPEN_TOOLS.signPdf.workflowLabel, icon: FileSignature, color: 'bg-[#FFB703]' },
    { label: PUSPEN_TOOLS.progressFisik.workflowLabel, icon: TrendingUp, color: 'bg-[#2ECC71]' },
    { label: PUSPEN_TOOLS.mediaSharing.workflowLabel, icon: Share2, color: 'bg-[#FB8500]' },
    { label: PUSPEN_TOOLS.pengawasKpi.workflowLabel, icon: Award, color: 'bg-[#7C3AED]' },
    { label: PUSPEN_TOOLS.pekerjaanReview.workflowLabel, icon: FileSearch, color: 'bg-[#E63946]' },
]

export function PuspenWorkflowMap() {
    return (
        <section className={`bg-[#FFFFFF] p-5 sm:p-6 ${puspenBorder} shadow-[6px_6px_0_0_#111111]`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <div className={`${puspenLabel} text-[#111111]/60`}>{PUSPEN_UI.workflowMap}</div>
                    <h2 className="text-lg font-black uppercase tracking-[0.08em] text-[#111111] sm:text-xl">{PUSPEN_UI.workflowTitle}</h2>
                </div>
                <span className={`bg-[#1A1A2E] px-3 py-1.5 text-[#FFB703] ${puspenBorder} ${puspenShadowMd} ${puspenLabel}`}>
                    {PUSPEN_UI.workflowRoute}
                </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    return (
                        <div
                            key={step.label}
                            className={`flex items-center gap-3 ${step.color} p-3 ${puspenBorder} ${puspenShadowMd}`}
                        >
                            <div className={`bg-[#FFF7E8] p-2 ${puspenBorder} ${puspenShadowMd}`}>
                                <Icon className="h-4 w-4 text-[#111111]" aria-hidden />
                            </div>
                            <div>
                                <div className={`${puspenLabel} text-[#111111]/55`}>Langkah {index + 1}</div>
                                <div className="text-sm font-black uppercase tracking-[0.1em] text-[#111111]">{step.label}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <p className="mt-4 text-sm font-bold leading-6 text-[#111111]/70">
                Dokumen masuk lewat PDF → ditandatangani → progress dilaporkan → materi dibagikan → statistik pengawas → review paket pekerjaan. Tiap langkah bisa dijalankan mandiri.
            </p>
        </section>
    )
}