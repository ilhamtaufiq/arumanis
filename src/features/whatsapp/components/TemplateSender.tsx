import { useMemo, useState } from 'react'
import { Send, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { sendMessage } from '../api'
import { applyTemplate, WHATSAPP_TEMPLATES } from '../lib/templates'

const DEFAULT_VARS: Record<string, string> = {
    nama: '',
    paket: '',
    batas: '',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    deviasi: '',
    rencana: '',
    realisasi: '',
    subjek: '',
    prioritas: 'high',
    status: 'open',
    deskripsi: '',
    tgl_selesai: '',
    spk: '',
    issue: 'foto / koordinat',
}

export default function TemplateSender() {
    const [templateId, setTemplateId] = useState(WHATSAPP_TEMPLATES[0].id)
    const [phone, setPhone] = useState('')
    const [vars, setVars] = useState(DEFAULT_VARS)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const template = useMemo(
        () => WHATSAPP_TEMPLATES.find((t) => t.id === templateId) ?? WHATSAPP_TEMPLATES[0],
        [templateId],
    )

    const handleFill = () => {
        setMessage(applyTemplate(template.body, vars))
        toast.success('Template diisi')
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        const text = message.trim() || applyTemplate(template.body, vars)
        if (!phone.trim() || !text.trim()) {
            toast.error('Isi nomor dan pesan')
            return
        }
        setSending(true)
        try {
            await sendMessage({ to: phone, message: text })
            toast.success('Pesan template terkirim')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal kirim')
        } finally {
            setSending(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Template Notifikasi
                </CardTitle>
                <CardDescription>
                    Isi variabel, pratinjau, lalu kirim via bridge Baileys (admin).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSend} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Template</Label>
                            <Select
                                value={templateId}
                                onValueChange={(v) => setTemplateId(v as typeof templateId)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {WHATSAPP_TEMPLATES.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wa-phone">Nomor HP</Label>
                            <Input
                                id="wa-phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0812... atau 62812..."
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.keys(DEFAULT_VARS).map((key) => (
                            <div key={key} className="space-y-1">
                                <Label className="font-mono text-[11px]">{`{{${key}}}`}</Label>
                                <Input
                                    value={vars[key] ?? ''}
                                    onChange={(e) =>
                                        setVars((prev) => ({ ...prev, [key]: e.target.value }))
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={handleFill}>
                            Isi pratinjau
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Pesan</Label>
                        <Textarea
                            rows={8}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Klik Isi pratinjau atau ketik manual..."
                        />
                    </div>

                    <Button type="submit" disabled={sending} className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        {sending ? 'Mengirim...' : 'Kirim WhatsApp'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
