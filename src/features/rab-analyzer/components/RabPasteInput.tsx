import { ClipboardPaste } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

type RabPasteInputProps = {
    value: string
    onChange: (value: string) => void
    minHeightClassName?: string
}

export function RabPasteInput({
    value,
    onChange,
    minHeightClassName = 'min-h-[220px]',
}: RabPasteInputProps) {
    return (
        <div className="space-y-2">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <ClipboardPaste className="h-3.5 w-3.5" />
                Paste dari Excel
            </p>
            <Textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Salin baris RAB MCK/SPAM JP (No, Uraian, Satuan, Volume, Harga Satuan) dari Excel..."
                className={`font-mono text-xs leading-6 ${minHeightClassName}`}
            />
        </div>
    )
}