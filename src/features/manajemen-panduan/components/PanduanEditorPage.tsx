import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    createPanduan,
    fetchAdminPanduanById,
    updatePanduan,
} from '../api'
import { PANDUAN_SECTIONS } from '../types'

type Props = {
    id?: number
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

export default function PanduanEditorPage({ id }: Props) {
    const navigate = useNavigate()
    const isNew = id == null
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(true)

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [slugTouched, setSlugTouched] = useState(false)
    const [description, setDescription] = useState('')
    const [section, setSection] = useState('cms')
    const [sortOrder, setSortOrder] = useState(0)
    const [body, setBody] = useState('# Judul\n\nTulis isi panduan di sini…\n')
    const [isPublished, setIsPublished] = useState(true)

    useEffect(() => {
        if (isNew || id == null) return
        let cancelled = false
        ;(async () => {
            setLoading(true)
            try {
                const page = await fetchAdminPanduanById(id)
                if (cancelled) return
                setTitle(page.title)
                setSlug(page.slug)
                setSlugTouched(true)
                setDescription(page.description ?? '')
                setSection(page.section || 'cms')
                setSortOrder(page.sort_order ?? 0)
                setBody(page.body)
                setIsPublished(page.is_published)
            } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Gagal memuat halaman')
                void navigate({ to: '/manajemen-panduan' })
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [id, isNew, navigate])

    const onTitleChange = (value: string) => {
        setTitle(value)
        if (!slugTouched) setSlug(slugify(value))
    }

    const handleSave = async () => {
        if (!title.trim() || !body.trim()) {
            toast.error('Judul dan isi wajib diisi')
            return
        }
        setSaving(true)
        try {
            const payload = {
                title: title.trim(),
                slug: slug.trim() || slugify(title),
                description: description.trim() || null,
                section,
                sort_order: sortOrder,
                body,
                is_published: isPublished,
            }
            if (isNew) {
                const created = await createPanduan(payload)
                toast.success('Halaman dibuat')
                void navigate({ to: '/manajemen-panduan/$id', params: { id: String(created.id) } })
            } else if (id != null) {
                await updatePanduan(id, payload)
                toast.success('Perubahan disimpan')
            }
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal menyimpan')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <PageContainer>
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/manajemen-panduan">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold">
                                {isNew ? 'Halaman panduan baru' : 'Edit panduan'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Markdown · simpan untuk memperbarui konten publik
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview((v) => !v)}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {showPreview ? 'Sembunyikan pratinjau' : 'Pratinjau'}
                        </Button>
                        <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
                            {saving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Simpan
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Metadata</CardTitle>
                            <CardDescription>Judul, slug URL, section, status terbit</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => onTitleChange(e.target.value)}
                                    placeholder="Judul halaman"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlugTouched(true)
                                        setSlug(e.target.value)
                                    }}
                                    placeholder="contoh-halaman"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Publik: <code>/docs/cms/{slug || '…'}</code>
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ringkas untuk daftar / SEO"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Section</Label>
                                    <Select value={section} onValueChange={setSection}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PANDUAN_SECTIONS.map((s) => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sort">Urutan</Label>
                                    <Input
                                        id="sort"
                                        type="number"
                                        min={0}
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <Label htmlFor="published">Terbit</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Nonaktif = draf (tidak tampil publik)
                                    </p>
                                </div>
                                <Switch
                                    id="published"
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:row-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Isi (Markdown)</CardTitle>
                            <CardDescription>
                                Mendukung heading, daftar, tabel, dan tautan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="min-h-[420px] font-mono text-sm"
                                spellCheck={false}
                            />
                        </CardContent>
                    </Card>

                    {showPreview && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Pratinjau</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <article className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                                </article>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PageContainer>
    )
}
