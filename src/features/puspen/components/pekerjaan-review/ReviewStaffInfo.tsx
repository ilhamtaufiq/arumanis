import { Phone, UserRound } from 'lucide-react'
import type { Pengawas } from '@/features/pengawas/types'
import { resolveUserAvatarUrl } from '@/lib/user-avatar'
import { puspenBorder, puspenLabel, puspenShadowSm } from '../../lib/tokens'

type ReviewStaffInfoProps = {
    role: 'Pengawas' | 'Pendamping'
    person?: Pengawas | null
}

export function ReviewStaffInfo({ role, person }: ReviewStaffInfoProps) {
    if (!person?.nama) {
        return (
            <div className={`flex min-w-[168px] items-center gap-2.5 bg-[#FFF7E8] p-2.5 ${puspenBorder} ${puspenShadowSm}`}>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center bg-[#E5E5E5] ${puspenBorder}`}>
                    <UserRound className="h-5 w-5 text-[#111111]/45" />
                </div>
                <div className="min-w-0">
                    <div className={`${puspenLabel} text-[#111111]/50`}>{role}</div>
                    <div className="text-xs font-bold text-[#111111]/55">Belum ditugaskan</div>
                </div>
            </div>
        )
    }

    return (
        <div className={`flex min-w-[168px] max-w-[220px] items-center gap-2.5 bg-white p-2.5 ${puspenBorder} ${puspenShadowSm}`}>
            <img
                src={resolveUserAvatarUrl({ seed: person.nama, name: person.nama, id: person.id })}
                alt={person.nama}
                className={`h-11 w-11 shrink-0 object-cover ${puspenBorder}`}
            />
            <div className="min-w-0">
                <div className={`${puspenLabel} text-[#111111]/50`}>{role}</div>
                <div className="truncate text-sm font-black uppercase tracking-[0.04em] text-[#111111]" title={person.nama}>
                    {person.nama}
                </div>
                {person.jabatan ? (
                    <div className="truncate text-[10px] font-bold text-[#111111]/65" title={person.jabatan}>
                        {person.jabatan}
                    </div>
                ) : null}
                {person.nip ? (
                    <div className="truncate text-[10px] font-bold text-[#111111]/55">NIP {person.nip}</div>
                ) : null}
                {person.telepon ? (
                    <div className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-bold text-[#111111]/55">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{person.telepon}</span>
                    </div>
                ) : null}
            </div>
        </div>
    )
}