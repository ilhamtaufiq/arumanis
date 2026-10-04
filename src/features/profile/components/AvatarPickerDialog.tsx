import { useEffect, useRef, useState } from 'react'
import { Check, ImagePlus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
    AVATAR_PRESETS,
    findAvatarPreset,
    normalizeAvatarPresetGender,
    type AvatarPreset,
    type AvatarPresetGender,
} from '@/lib/user-avatar'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

type AvatarPickerDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Nilai kolom `avatar` saat ini (path preset / URL lain). */
    currentAvatar: string | null
    /** URL foto hasil upload (prioritas di atas `avatar`). */
    uploadedAvatar: string | null
    gender: string | null
    busy: boolean
    onSelectPreset: (preset: AvatarPreset) => Promise<void>
    onUpload: (file: File) => Promise<void>
    onRemoveUpload: () => Promise<void>
    onReset: () => Promise<void>
}

export function AvatarPickerDialog({
    open,
    onOpenChange,
    currentAvatar,
    uploadedAvatar,
    gender,
    busy,
    onSelectPreset,
    onUpload,
    onRemoveUpload,
    onReset,
}: AvatarPickerDialogProps) {
    const activePreset = uploadedAvatar ? null : findAvatarPreset(currentAvatar)
    const [tab, setTab] = useState<'preset' | 'upload'>('preset')
    const [presetGender, setPresetGender] = useState<AvatarPresetGender>('male')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Reset state setiap dialog dibuka.
    useEffect(() => {
        if (!open) return
        setTab(uploadedAvatar ? 'upload' : 'preset')
        setPresetGender(activePreset?.gender ?? normalizeAvatarPresetGender(gender) ?? 'male')
        setSelectedId(activePreset?.id ?? null)
        setFile(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null)
            return
        }
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [file])

    const presets = AVATAR_PRESETS.filter((p) => p.gender === presetGender)
    const selectedPreset = AVATAR_PRESETS.find((p) => p.id === selectedId) ?? null

    const pickFile = (next: File | null | undefined) => {
        if (!next) return
        if (!ACCEPTED_TYPES.includes(next.type)) {
            toast.error('File harus berupa gambar (JPG/PNG/WEBP/GIF)')
            return
        }
        if (next.size > MAX_UPLOAD_BYTES) {
            toast.error('Ukuran file maksimal 5 MB')
            return
        }
        setFile(next)
    }

    const run = async (action: () => Promise<void>) => {
        try {
            await action()
            onOpenChange(false)
        } catch {
            // toast ditangani pemanggil
        }
    }

    const canApplyPreset = Boolean(selectedPreset) && selectedPreset?.id !== activePreset?.id

    return (
        <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Ubah avatar</DialogTitle>
                    <DialogDescription>
                        Pilih salah satu avatar 3D atau unggah foto Anda sendiri.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={tab} onValueChange={(v) => setTab(v as 'preset' | 'upload')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preset">Pilih avatar</TabsTrigger>
                        <TabsTrigger value="upload">Unggah foto</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preset" className="space-y-4 pt-2">
                        <div className="inline-flex rounded-lg border bg-muted/40 p-1 text-sm">
                            {(
                                [
                                    ['male', 'Pria'],
                                    ['female', 'Wanita'],
                                ] as const
                            ).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setPresetGender(value)}
                                    className={cn(
                                        'rounded-md px-4 py-1.5 font-medium transition-colors',
                                        presetGender === value
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6" role="radiogroup" aria-label="Avatar">
                            {presets.map((p) => {
                                const selected = p.id === selectedId
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={selected}
                                        aria-label={p.label}
                                        title={p.label}
                                        onClick={() => setSelectedId(p.id)}
                                        className={cn(
                                            'group relative aspect-square rounded-full p-1 outline-none transition',
                                            'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                            selected ? 'ring-2 ring-primary' : 'hover:scale-105',
                                        )}
                                    >
                                        <img src={p.url} alt="" className="h-full w-full rounded-full" loading="lazy" />
                                        {selected ? (
                                            <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                                                <Check className="h-3.5 w-3.5" />
                                            </span>
                                        ) : null}
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {selectedPreset ? selectedPreset.label : 'Klik avatar untuk memilih.'}
                            {uploadedAvatar ? ' Memilih avatar akan menggantikan foto yang diunggah.' : ''}
                        </p>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4 pt-2">
                        <input
                            ref={inputRef}
                            type="file"
                            accept={ACCEPTED_TYPES.join(',')}
                            className="hidden"
                            onChange={(e) => {
                                pickFile(e.target.files?.[0])
                                e.target.value = ''
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault()
                                setIsDragging(true)
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault()
                                setIsDragging(false)
                                pickFile(e.dataTransfer.files?.[0])
                            }}
                            className={cn(
                                'flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
                                isDragging ? 'border-primary bg-primary/5' : 'hover:border-primary/60 hover:bg-muted/40',
                            )}
                        >
                            {previewUrl || uploadedAvatar ? (
                                <img
                                    src={previewUrl ?? uploadedAvatar ?? undefined}
                                    alt="Pratinjau avatar"
                                    className="h-28 w-28 rounded-full object-cover shadow"
                                />
                            ) : (
                                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <ImagePlus className="h-7 w-7 text-muted-foreground" />
                                </span>
                            )}
                            <span className="text-sm font-medium">
                                {file ? file.name : 'Klik atau seret gambar ke sini'}
                            </span>
                            <span className="text-xs text-muted-foreground">JPG, PNG, WEBP, atau GIF — maks. 5 MB</span>
                        </button>
                        {uploadedAvatar && !file ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={busy}
                                onClick={() => void run(onRemoveUpload)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus foto yang diunggah
                            </Button>
                        ) : null}
                    </TabsContent>
                </Tabs>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={busy || (!currentAvatar && !uploadedAvatar)}
                        onClick={() => void run(onReset)}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Avatar default
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        {tab === 'preset' ? (
                            <Button
                                type="button"
                                disabled={busy || !canApplyPreset}
                                onClick={() => selectedPreset && void run(() => onSelectPreset(selectedPreset))}
                            >
                                <Check className="mr-2 h-4 w-4" />
                                {busy ? 'Menyimpan...' : 'Gunakan avatar'}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled={busy || !file}
                                onClick={() => file && void run(() => onUpload(file))}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {busy ? 'Mengunggah...' : 'Unggah'}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
