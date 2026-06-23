import { Award, BookOpen, Shield } from 'lucide-react'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../../lib/tokens'

const missions = [
    {
        id: 'M-01',
        title: 'Arsip PDF',
        text: 'Simpan file ke server supaya bisa dipakai ulang tanpa upload berulang.',
    },
    {
        id: 'M-02',
        title: 'Tanda Tangan',
        text: 'Tempel tanda tangan digital langsung di halaman PDF yang dibutuhkan.',
    },
    {
        id: 'M-03',
        title: 'Progress Fisik',
        text: 'Input rencana & realisasi per kontrak — deviasi dihitung otomatis.',
    },
    {
        id: 'M-04',
        title: 'Media Share',
        text: 'Rakit caption, preview, dan link share untuk publikasi lapangan.',
    },
    {
        id: 'M-05',
        title: 'KPI Pengawas',
        text: 'Hall of fame user role pengawas berdasarkan input di Output, Penerima, Foto, Progress Fisik pada pekerjaan yang di-assign.',
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
                    <BookOpen className="h-5 w-5" />
                    <h2 className="text-lg font-black uppercase tracking-[0.1em]">Mission Log</h2>
                </div>
                <p className="mt-2 text-sm font-bold leading-6">
                    Puspen berdiri terpisah dari dashboard Arumanis. Semua alat di sini fokus ke eksekusi SOP harian.
                </p>
            </div>

            <div className="space-y-3">
                {missions.map((mission) => (
                    <div key={mission.id} className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                        <div className={`${puspenLabel} text-[#111111]/60`}>{mission.id}</div>
                        <div className="mt-1 text-sm font-black uppercase tracking-[0.08em]">{mission.title}</div>
                        <p className="mt-2 text-sm font-bold leading-6 text-[#111111]/75">{mission.text}</p>
                    </div>
                ))}
            </div>

            {isAdmin ? (
                <div className={`bg-[#FB8500] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span className={puspenLabel}>Admin Zone</span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-6">
                        Progress fisik saat ini{' '}
                        <span className="font-black uppercase">{progressPublic ? 'PUBLIK' : 'TERKUNCI'}</span>.
                        Toggle unlock/lock ada di kartu alat Progress Fisik.
                    </p>
                </div>
            ) : null}
        </aside>
    )
}