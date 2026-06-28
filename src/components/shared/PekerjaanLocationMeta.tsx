import { MapPin } from 'lucide-react'

type PekerjaanLocationMetaProps = {
    kecamatan?: string | null
    desa?: string | null
    className?: string
}

export function PekerjaanLocationMeta({
    kecamatan,
    desa,
    className = 'text-[10px] text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1',
}: PekerjaanLocationMetaProps) {
    return (
        <div className={className}>
            <MapPin className="h-3 w-3" />
            {kecamatan || '-'} • {desa || '-'}
        </div>
    )
}