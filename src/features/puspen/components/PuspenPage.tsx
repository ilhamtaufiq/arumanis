import { CheckSquare, PenTool } from 'lucide-react'

import { PuspenPdfSignTool } from './PuspenPdfSignTool'
import { PuspenMasterLayout } from './PuspenMasterLayout'

export default function PuspenPage() {
    return (
        <PuspenMasterLayout
            eyebrow={(
                <span className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Ruang Kerja
                </span>
            )}
            title="PUSPEN ARUMANIS"
            description="Ruang kerja mandiri buat ngerjain PDF digital. Sign file, simpan ulang, dan kelola alurnya buat bantu SOP pekerjaan di Arumanis."
            aside={(
                <>
                    <div className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] shadow-[3px_3px_0_0_#111111]">
                        <CheckSquare className="h-4 w-4" />
                        Alur
                    </div>

                    <div className="space-y-3">
                        {[
                            'Pilih PDF dari server atau upload file baru',
                            'Upload gambar tanda tangan digital',
                            'Klik halaman buat naro TTD',
                            'Simpan hasil PDF ke server atau download langsung',
                        ].map((item, index) => (
                            <div
                                key={item}
                                className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[3px_3px_0_0_#111111]"
                            >
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                    Step {index + 1}
                                </div>
                                <div className="mt-1 text-sm font-bold leading-6">
                                    {item}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#FB8500] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em]">Catatan</div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Ini ruang kerja khusus Puspen, jadi gak ikut sidebar atau layout dashboard utama.
                        </p>
                    </div>
                </>
            )}
        >
            <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[6px_6px_0_0_#111111]">
                <div
                    className="border-[3px] border-[#111111] bg-[#FFFFFF] p-3 shadow-[3px_3px_0_0_#111111]"
                    style={{
                        backgroundImage: `
                            linear-gradient(90deg, rgba(17,17,17,0.08) 1px, transparent 1px),
                            linear-gradient(rgba(17,17,17,0.08) 1px, transparent 1px)
                        `,
                        backgroundSize: '18px 18px',
                    }}
                >
                    <PuspenPdfSignTool />
                </div>
            </div>
        </PuspenMasterLayout>
    )
}
