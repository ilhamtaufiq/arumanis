import { BookOpen, Shield } from 'lucide-react'
import { PUSPEN_TOOLS, PUSPEN_UI } from '../../lib/tool-meta'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../../lib/tokens'

const missions = [
    {
        id: 'M-01',
        title: PUSPEN_TOOLS.organizePdf.title,
        text: PUSPEN_TOOLS.organizePdf.description,
    },
    {
        id: 'M-02',
        title: PUSPEN_TOOLS.signPdf.title,
        text: PUSPEN_TOOLS.signPdf.description,
    },
    {
        id: 'M-03',
        title: PUSPEN_TOOLS.progressFisik.title,
        text: PUSPEN_TOOLS.progressFisik.description,
    },
    {
        id: 'M-04',
        title: PUSPEN_TOOLS.mediaSharing.title,
        text: PUSPEN_TOOLS.mediaSharing.description,
    },
    {
        id: 'M-05',
        title: PUSPEN_TOOLS.pengawasKpi.title,
        text: PUSPEN_TOOLS.pengawasKpi.description,
    },
]

type PuspenMissionPanelProps = {
    isAdmin: boolean
    progressPublic: boolean
}

export function PuspenMissionPanel({ isAdmin, progressPublic }: PuspenMissionPanelProps) {
    return (
        <aside className="space-y-4">
            <div className={`bg-[#8ECAE6] p-5 ${puspenBorder} shadow-[6px_6px_0_0_#111111]`}>
                <div
                    className="pointer-events-none mb-4 h-2"
                    style={{
                        backgroundImage:
                            'linear-gradient(90deg, #111111 0 33%, transparent 33% 66%, #111111 66% 100%)',
                        backgroundSize: '18px 8px',
                    }}
                />
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#111111]" aria-hidden />
                    <h2 className="text-lg font-black uppercase tracking-[0.1em] text-[#111111]">{PUSPEN_UI.missionLog}</h2>
                </div>
                <p className="mt-2 text-sm font-bold leading-6 text-[#111111]">
                    Puspen berdiri terpisah dari dashboard Arumanis. Semua alat di sini fokus ke eksekusi SOP harian.
                </p>
            </div>

            <div className="space-y-3">
                {missions.map((mission) => (
                    <div key={mission.id} className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                        <div className={`${puspenLabel} text-[#111111]/60`}>{mission.id}</div>
                        <div className="mt-1 text-sm font-black uppercase tracking-[0.08em] text-[#111111]">{mission.title}</div>
                        <p className="mt-2 text-sm font-bold leading-6 text-[#111111]/75">{mission.text}</p>
                    </div>
                ))}
            </div>

            {isAdmin ? (
                <div className={`bg-[#FB8500] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#111111]" aria-hidden />
                        <span className={`${puspenLabel} text-[#111111]`}>{PUSPEN_UI.adminZone}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#111111]">
                        Progress fisik saat ini{' '}
                        <span className="font-black uppercase">{progressPublic ? PUSPEN_UI.public : PUSPEN_UI.locked}</span>.
                        Tombol kunci/buka tersedia di kartu alat Progress Fisik.
                    </p>
                </div>
            ) : null}
        </aside>
    )
}