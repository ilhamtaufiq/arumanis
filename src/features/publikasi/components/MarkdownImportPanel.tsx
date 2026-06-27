import { useRef, useState } from 'react'
import { FileUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { applyMarkdownImport } from '../lib/markdown-import'

type MarkdownImportPanelProps = {
  onApply: (result: ReturnType<typeof applyMarkdownImport>) => void
}

export function MarkdownImportPanel({ onApply }: MarkdownImportPanelProps) {
  const [markdown, setMarkdown] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setMarkdown(text)
    event.target.value = ''
  }

  const handleApply = () => {
    if (!markdown.trim()) return
    onApply(applyMarkdownImport(markdown))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,text/markdown"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="h-4 w-4 mr-2" />
          Upload File .md
        </Button>
        <Button
          type="button"
          className="rounded-full"
          onClick={handleApply}
          disabled={!markdown.trim()}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Terapkan ke Editor
        </Button>
      </div>

      <Textarea
        value={markdown}
        onChange={(event) => setMarkdown(event.target.value)}
        placeholder={`Tempel atau tulis markdown di sini...\n\nContoh:\n---\ntitle: Judul Artikel\ncategory: Berita\n---\n\n# Judul Artikel\n\nParagraf pembuka...`}
        className="min-h-[500px] rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono text-sm leading-relaxed resize-y"
      />

      <p className="text-xs text-slate-400">
        Mendukung front matter YAML (title, category, cover_image) dan format GitHub Flavored Markdown.
      </p>
    </div>
  )
}