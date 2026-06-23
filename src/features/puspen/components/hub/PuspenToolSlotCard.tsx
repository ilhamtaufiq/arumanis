import { Link } from '@tanstack/react-router'
import type { ComponentType } from 'react'
import { ArrowRight, Lock, Unlock } from 'lucide-react'
import { PUSPEN_UI } from '../../lib/tool-meta'
import { puspenBorder, puspenLabel, puspenPressable, puspenShadowLg, puspenShadowMd } from '../../lib/tokens'

export type PuspenToolSlot = {
    slot: string
    title: string
    description: string
    href: string
    accent: string
    icon: ComponentType<{ className?: string }>
    status: string
    tag: string
    publicAccess?: boolean
    canTogglePublic?: boolean
    onTogglePublic?: () => void
    isTogglingPublic?: boolean
}

export function PuspenToolSlotCard({ tool }: { tool: PuspenToolSlot }) {
    const Icon = tool.icon
    const PublicIcon = tool.publicAccess ? Unlock : Lock

    return (
        <article
            className={`group relative overflow-hidden bg-[#FFFFFF] ${puspenBorder} ${puspenShadowLg} ${puspenPressable}`}
        >
            <div className={`absolute left-0 top-0 z-10 bg-[#1A1A2E] px-3 py-2 text-[#FFB703] ${puspenBorder} border-l-0 border-t-0 ${puspenShadowMd}`}>
                <span className="text-lg font-black tracking-[0.2em]">{tool.slot}</span>
            </div>

            <div className={`border-b-[3px] border-[#111111] px-4 pb-3 pt-14 ${tool.accent}`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`bg-[#FFF7E8] px-2 py-1 text-[#111111] ${puspenBorder} ${puspenShadowMd} ${puspenLabel}`}>
                                {tool.status}
                            </span>
                            <span className={`bg-[#1A1A2E] px-2 py-1 text-[#FFF7E8] ${puspenBorder} ${puspenShadowMd} ${puspenLabel}`}>
                                {tool.tag}
                            </span>
                            {tool.publicAccess !== undefined ? (
                                <span className={`inline-flex items-center gap-1 bg-[#FFF7E8] px-2 py-1 ${puspenBorder} ${puspenShadowMd} ${puspenLabel}`}>
                                    <PublicIcon className="h-3 w-3" aria-hidden />
                                    {tool.publicAccess ? PUSPEN_UI.public : PUSPEN_UI.locked}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <div className={`bg-[#FFF7E8] p-2.5 ${puspenBorder} ${puspenShadowMd} transition group-hover:bg-[#FFB703]`}>
                        <Icon className="h-6 w-6 text-[#111111]" aria-hidden />
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#111111] sm:text-2xl">{tool.title}</h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#111111]/75">{tool.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to={tool.href}
                        className={`inline-flex items-center gap-2 bg-[#FFB703] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#111111] ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                    >
                        {PUSPEN_UI.start}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>

                    {tool.canTogglePublic ? (
                        <button
                            type="button"
                            onClick={tool.onTogglePublic}
                            disabled={tool.isTogglingPublic}
                            className={`inline-flex items-center gap-2 bg-[#8ECAE6] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#111111] ${puspenBorder} ${puspenShadowMd} ${puspenPressable} disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                            {tool.publicAccess ? <Lock className="h-4 w-4" aria-hidden /> : <Unlock className="h-4 w-4" aria-hidden />}
                            {tool.publicAccess ? PUSPEN_UI.lock : PUSPEN_UI.unlock}
                        </button>
                    ) : null}
                </div>
            </div>
        </article>
    )
}