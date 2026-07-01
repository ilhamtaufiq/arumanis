import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Download, FileUp, Loader2, Search, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
    deleteToolPdf,
    downloadBulkToolPdfs,
    getToolPdfs,
    type ToolPdfItem,
    uploadToolPdf,
} from '../api/tool-pdfs'
import { PuspenToolLayout } from './PuspenToolLayout'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import { useAuthStore } from '@/stores/auth-stores'

function normalizePdfName(fileName: string) {
    return fileName.replace(/\.[^.]+$/, '')
}

function getPdfKindLabel(kind: string) {
    if (kind === 'signed') return 'Hasil TTD'
    if (kind === 'source') return 'Mentah'
    return kind
}

export function PuspenOrganizePdfFilesPage() {
    const { auth } = useAuthStore()
    const tool = PUSPEN_TOOLS.organizePdf
    const [pdfFiles, setPdfFiles] = useState<ToolPdfItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isBulkUploading, setIsBulkUploading] = useState(false)
    const [isDownloadingBulk, setIsDownloadingBulk] = useState(false)
    const [search, setSearch] = useState('')
    const [name, setName] = useState('')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDropActive, setIsDropActive] = useState(false)

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        let active = true

        const load = async () => {
            setIsLoading(true)

            try {
                const items = await getToolPdfs({ kind: 'all' })
                if (active) {
                    setPdfFiles(items)
                }
            } catch (error) {
                console.error('Failed to load tool PDFs:', error)
                toast.error('Gagal memuat file PDF tersimpan')
            } finally {
                if (active) {
                    setIsLoading(false)
                }
            }
        }

        void load()

        return () => {
            active = false
        }
    }, [])

    const filteredPdfFiles = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) {
            return pdfFiles
        }

        return pdfFiles.filter((item) =>
            item.name.toLowerCase().includes(query)
            || (item.originalFilename ?? '').toLowerCase().includes(query)
        )
    }, [pdfFiles, search])

    const selectedCount = selectedIds.length

    const handleUploadFiles = async (files: File[]) => {
        const validFiles = files.filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))

        if (validFiles.length === 0) {
            toast.error('Pilih file PDF yang valid')
            return
        }

        if (validFiles.length === 1) {
            const [file] = validFiles
            setName(normalizePdfName(file.name))
            setIsUploading(true)

            try {
                const saved = await uploadToolPdf(file, normalizePdfName(file.name))
                setPdfFiles((current) => [saved, ...current])
                setName('')
                toast.success('PDF berhasil disimpan ke server')
            } catch (error) {
                console.error('Failed to upload tool PDF:', error)
                toast.error('Gagal menyimpan PDF ke server')
            } finally {
                setIsUploading(false)
            }

            return
        }

        setIsBulkUploading(true)

        try {
            const uploaded: ToolPdfItem[] = []

            for (const file of validFiles) {
                const saved = await uploadToolPdf(file, normalizePdfName(file.name))
                uploaded.push(saved)
            }

            setPdfFiles((current) => [...uploaded, ...current])
            setName('')
            toast.success(`${uploaded.length} PDF berhasil disimpan ke server`)
        } catch (error) {
            console.error('Failed to bulk upload tool PDFs:', error)
            toast.error('Gagal menyimpan beberapa PDF ke server')
        } finally {
            setIsBulkUploading(false)
        }
    }

    const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? [])
        event.target.value = ''
        if (files.length === 0) return
        await handleUploadFiles(files)
    }

    const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDropActive(false)

        const files = Array.from(event.dataTransfer.files ?? [])
        if (files.length === 0) return
        await handleUploadFiles(files)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteToolPdf(id)
            setPdfFiles((current) => current.filter((item) => item.id !== id))
            setSelectedIds((current) => current.filter((itemId) => itemId !== id))
            toast.success('File PDF dihapus')
        } catch (error) {
            console.error('Failed to delete tool PDF:', error)
            toast.error('Gagal menghapus file PDF')
        }
    }

    const toggleSelected = (id: string) => {
        setSelectedIds((current) => (
            current.includes(id)
                ? current.filter((itemId) => itemId !== id)
                : [...current, id]
        ))
    }

    const selectAllFiltered = () => {
        setSelectedIds(filteredPdfFiles.map((item) => item.id))
    }

    const clearSelection = () => {
        setSelectedIds([])
    }

    const downloadBulk = async (ids: string[], fileName: string) => {
        if (ids.length === 0) {
            toast.error('Pilih minimal satu file PDF')
            return
        }

        setIsDownloadingBulk(true)

        try {
            const blob = await downloadBulkToolPdfs(ids)
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            link.click()
            window.setTimeout(() => URL.revokeObjectURL(url), 1000)
            toast.success('Download rame-rame dimulai')
        } catch (error) {
            console.error('Failed to download bulk PDFs:', error)
            toast.error('Gagal download PDF rame-rame')
        } finally {
            setIsDownloadingBulk(false)
        }
    }

    return (
        <PuspenToolLayout
            slot={tool.slot}
            toolName={tool.toolName}
            accent={tool.accent}
            playerName={auth.user?.name}
            eyebrow={(
                <span className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    Gudang File
                </span>
            )}
            title={tool.title}
            description="Gudang PDF buat upload, simpan, pilih ulang, dan download rame-rame. File mentah sama hasil TTD ngumpul rapi di satu tempat."
            aside={(
                <>
                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]/60">
                            HUD
                        </div>
                        <div className="mt-2 text-2xl font-black uppercase tracking-[0.04em]">
                            Simpan, antre, pakai lagi
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            File PDF awal dan hasil tanda tangan yang disimpan ke server tampil di grid ini.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            'Upload PDF sekali, pakai berkali-kali',
                            'Pilih ulang file di Sign PDF tanpa upload ulang',
                            'Kelola file tersimpan dari panel ini',
                        ].map((item, index) => (
                            <div
                                key={item}
                                className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[3px_3px_0_0_#111111]"
                            >
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                    Node {index + 1}
                                </div>
                                <div className="mt-1 text-sm font-bold leading-6">
                                    {item}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        >
            <div className="space-y-5">
                <section className="border-[3px] border-[#111111] bg-[#FFFFFF] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-3 md:max-w-xl">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-[0.2em]">
                                    Nama File
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Otomatis ikut nama file upload"
                                    className="mt-2 block w-full border-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-3 text-sm font-bold outline-none focus:bg-[#8ECAE6]"
                                />
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={() => setIsDropActive(true)}
                                onDragLeave={() => setIsDropActive(false)}
                                onDragOver={(event) => {
                                    event.preventDefault()
                                    setIsDropActive(true)
                                }}
                                onDrop={handleDrop}
                                role="button"
                                tabIndex={0}
                                className={`group cursor-pointer border-[3px] border-dashed border-[#111111] p-5 shadow-[3px_3px_0_0_#111111] transition ${
                                    isDropActive ? 'bg-[#8ECAE6]' : 'bg-[#FFF7E8]'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    multiple
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />

                                <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
                                            <Upload className="h-4 w-4" />
                                            Area Upload Massal
                                        </div>
                                        <p className="mt-2 text-sm font-bold leading-6 text-[#111111]/80">
                                            Tarik beberapa PDF ke area ini, atau klik buat pilih file.
                                            Nama file otomatis ngikut dari file yang di-upload.
                                        </p>
                                    </div>

                                    <div className="border-[3px] border-[#111111] bg-[#FFB703] px-4 py-3 text-sm font-black shadow-[3px_3px_0_0_#111111]">
                                        {isUploading
                                            ? 'Lagi simpan 1 file...'
                                            : isBulkUploading
                                                ? 'Lagi simpan banyak file...'
                                                : 'Drop atau klik buat upload'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 md:w-72">
                            <div className="border-[3px] border-[#111111] bg-[#FFB703] px-4 py-3 text-sm font-black shadow-[3px_3px_0_0_#111111]">
                                {isUploading || isBulkUploading ? 'Lagi proses...' : 'PDF tersimpan di server'}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex w-full items-center justify-center gap-2 border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-3 text-sm font-black shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                <FileUp className="h-4 w-4" />
                                Pilih File
                            </button>
                        </div>
                    </div>
                </section>

                <section className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
                            <Search className="h-4 w-4" />
                            File Tersimpan
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="text-xs font-bold text-[#111111]/70">
                                {isLoading ? 'Lagi muat...' : `${pdfFiles.length} file`}
                            </div>
                            <div className="border-[3px] border-[#111111] bg-[#FFFFFF] px-3 py-2 text-xs font-black shadow-[3px_3px_0_0_#111111]">
                                {selectedCount} dipilih
                            </div>
                            <button
                                type="button"
                                onClick={selectAllFiltered}
                                className="border-[3px] border-[#111111] bg-[#8ECAE6] px-3 py-2 text-xs font-black shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                Pilih hasil filter
                            </button>
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="border-[3px] border-[#111111] bg-[#FFFFFF] px-3 py-2 text-xs font-black shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                Bersihkan
                            </button>
                            <button
                                type="button"
                                onClick={() => void downloadBulk(selectedIds, 'tool-pdfs-selected.zip')}
                                disabled={selectedIds.length === 0 || isDownloadingBulk}
                                className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#2ECC71] px-3 py-2 text-xs font-black shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDownloadingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                Download pilihan
                            </button>
                            <button
                                type="button"
                                onClick={() => void downloadBulk(filteredPdfFiles.map((item) => item.id), 'tool-pdfs-filtered.zip')}
                                disabled={filteredPdfFiles.length === 0 || isDownloadingBulk}
                                className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFB703] px-3 py-2 text-xs font-black shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDownloadingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                Download hasil filter
                            </button>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari nama PDF..."
                        className="mt-4 block w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-3 text-sm font-bold outline-none focus:bg-[#8ECAE6]"
                    />

                    {isLoading ? (
                        <div className="mt-4 flex items-center justify-center border-[3px] border-dashed border-[#111111] bg-[#FFFFFF] py-16">
                            <Loader2 className="h-7 w-7 animate-spin" />
                        </div>
                    ) : filteredPdfFiles.length === 0 ? (
                                <div className="mt-4 border-[3px] border-dashed border-[#111111] bg-[#FFFFFF] p-4 text-sm font-bold text-[#111111]/70">
                            {pdfFiles.length === 0
                                ? 'Belum ada file PDF yang di-upload.'
                                : 'Tidak ada file yang cocok dengan pencarian ini.'}
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-3">
                            {filteredPdfFiles.map((item) => (
                                <article
                                    key={item.id}
                                    className={`border-[3px] border-[#111111] p-4 shadow-[3px_3px_0_0_#111111] ${
                                        selectedIds.includes(item.id) ? 'bg-[#FFB703]' : 'bg-[#FFFFFF]'
                                    }`}
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-start gap-3">
                                            <label className="mt-1 inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border-[3px] border-[#111111] bg-[#FFF7E8] shadow-[3px_3px_0_0_#111111]">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => toggleSelected(item.id)}
                                                    className="h-4 w-4 accent-[#111111]"
                                                />
                                            </label>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-black">{item.name}</h3>
                                                    <span className="border-[3px] border-[#111111] bg-[#8ECAE6] px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                                                        {getPdfKindLabel(item.kind)}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm font-bold text-[#111111]/70">
                                                    {item.originalFilename ?? 'Nama asli tidak tersedia'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    to="/puspen/sign-pdf"
                                                className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFB703] px-4 py-3 text-sm font-black shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px]"
                                                >
                                                Buka TTD PDF
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => void handleDelete(item.id)}
                                                className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#EF233C] px-4 py-3 text-sm font-black text-[#FFFFFF] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px]"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </PuspenToolLayout>
    )
}
