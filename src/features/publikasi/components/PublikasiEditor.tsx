import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Selection } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import { FileText, Instagram, Share2, Video, Youtube } from 'lucide-react'
import { toast } from 'sonner'

import { Button as UiButton } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/tiptap-ui-primitive/button'
import { Spacer } from '@/components/tiptap-ui-primitive/spacer'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar'
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu'
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button'
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu'
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button'
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button'
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from '@/components/tiptap-ui/color-highlight-popover'
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from '@/components/tiptap-ui/link-popover'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button'
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button'
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon'
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon'
import { LinkIcon } from '@/components/tiptap-icons/link-icon'
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension'
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useWindowSize } from '@/hooks/use-window-size'
import { useCursorVisibility } from '@/hooks/use-cursor-visibility'
import { uploadPublikasiVideo } from '../api'
import { captureVideoThumbnail } from '../lib/video-thumbnail'
import { normalizeYoutubeEmbedUrl } from '../lib/publication-media'
import {
  applyMarkdownImport,
  type MarkdownImportMetadata,
} from '../lib/markdown-import'
import { PUBLICATION_EDITOR_CLASSES } from '../lib/publication-content-classes'
import { Iframe, VideoBlock } from './publikasi-editor-extensions'

import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/image-node/image-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'
import './publikasi-editor.scss'

type EditorViewMode = 'rich' | 'markdown'

export interface PublikasiEditorProps {
  content: string
  onChange: (content: string) => void
  onImportMetadata?: (metadata: MarkdownImportMetadata) => void
}

function syncHtmlChange(editor: NonNullable<ReturnType<typeof useEditor>>, onChange: (html: string) => void) {
  onChange(editor.getHTML())
}

function MainToolbarContent({
  editor,
  isMobile,
  viewMode,
  onToggleViewMode,
  onImportMarkdown,
  onHighlighterClick,
  onLinkClick,
  onPickVideo,
  onAddYoutube,
  onAddInstagram,
  uploadProgress,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>
  isMobile: boolean
  viewMode: EditorViewMode
  onToggleViewMode: () => void
  onImportMarkdown: () => void
  onHighlighterClick: () => void
  onLinkClick: () => void
  onPickVideo: () => void
  onAddYoutube: () => void
  onAddInstagram: () => void
  uploadProgress: number | null
}) {
  return (
    <>
      <ToolbarGroup>
        <Button
          data-style="ghost"
          data-active-state={viewMode === 'markdown' ? 'on' : 'off'}
          onClick={onToggleViewMode}
          aria-label={viewMode === 'markdown' ? 'Mode visual' : 'Mode markdown'}
        >
          <FileText className="tiptap-button-icon" />
        </Button>
        <Button data-style="ghost" onClick={onImportMarkdown} aria-label="Impor markdown">
          <span className="text-[10px] font-bold uppercase tracking-wider">.md</span>
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3]} portal={isMobile} />
        <ListDropdownMenu
          types={['bulletList', 'orderedList', 'taskList']}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Gambar" />
        <Button data-style="ghost" onClick={onPickVideo} aria-label="Unggah video">
          <Video className="tiptap-button-icon" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UiButton variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Share2 className="h-4 w-4" />
            </UiButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl">
            <DropdownMenuItem onClick={onAddYoutube} className="gap-2">
              <Youtube className="h-4 w-4 text-red-500" />
              YouTube
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddInstagram} className="gap-2">
              <Instagram className="h-4 w-4 text-pink-500" />
              Instagram
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ToolbarGroup>

      <Spacer />

      {uploadProgress !== null && (
        <ToolbarGroup>
          <span className="text-[10px] font-bold text-slate-400 pr-2">{uploadProgress}%</span>
        </ToolbarGroup>
      )}
    </>
  )
}

function MobileToolbarContent({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link'
  onBack: () => void
}) {
  return (
    <>
      <ToolbarGroup>
        <Button data-style="ghost" onClick={onBack}>
          <ArrowLeftIcon className="tiptap-button-icon" />
          {type === 'highlighter' ? (
            <HighlighterIcon className="tiptap-button-icon" />
          ) : (
            <LinkIcon className="tiptap-button-icon" />
          )}
        </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <LinkContent />}
    </>
  )
}

export function PublikasiEditor({ content, onChange, onImportMetadata }: PublikasiEditorProps) {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [viewMode, setViewMode] = useState<EditorViewMode>('rich')
  const [markdownValue, setMarkdownValue] = useState('')
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>('main')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const markdownFileRef = useRef<HTMLInputElement>(null)
  const maxVideoSize = 100 * 1024 * 1024
  const supportedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime']

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Superscript,
      Subscript,
      Underline,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class:
            'rounded-xl border shadow-lg max-w-full h-auto my-8 mx-auto block hover:ring-2 hover:ring-primary transition-all',
        },
      }),
      Placeholder.configure({
        placeholder: 'Tulis cerita Anda di sini...',
      }),
      Dropcursor.configure({
        color: 'hsl(var(--primary))',
        width: 2,
      }),
      CharacterCount,
      Selection,
      Markdown.configure({
        markedOptions: {
          gfm: true,
          breaks: true,
        },
      }),
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 5,
        upload: handleImageUpload,
        onError: (error) => toast.error(error.message),
      }),
      Iframe,
      VideoBlock,
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => {
      syncHtmlChange(currentEditor, onChange)
    },
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: PUBLICATION_EDITOR_CLASSES,
        'aria-label': 'Konten publikasi',
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain')
        if (!text) return false

        if (text.includes('youtube.com') || text.includes('youtu.be')) {
          const videoId = text.match(
            /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sanday\?v=))([\w-]{11})/
          )?.[1]
          if (videoId) {
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.iframe.create({
                  src: normalizeYoutubeEmbedUrl(`https://www.youtube.com/embed/${videoId}`),
                  height: '450',
                })
              )
            )
            toast.success('Video YouTube berhasil di-embed')
            return true
          }
        }

        if (text.includes('instagram.com')) {
          let embedUrl = text.split('?')[0].replace(/\/$/, '')
          if (!embedUrl.endsWith('/embed')) embedUrl += '/embed'
          view.dispatch(
            view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.iframe.create({
                src: embedUrl,
                height: '600',
              })
            )
          )
          toast.success('Konten Instagram berhasil di-embed')
          return true
        }

        return false
      },
      handleDrop: (_view, event) => {
        const videoFile = Array.from(event.dataTransfer?.files || []).find((file) =>
          file.type.startsWith('video')
        )
        if (videoFile) {
          event.preventDefault()
          void uploadVideo(videoFile)
          return true
        }
        return false
      },
    },
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!editor || editor.isFocused) return
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main')
    }
  }, [isMobile, mobileView])

  if (!editor) return null

  const validateVideo = (file: File) => {
    if (!supportedVideoTypes.includes(file.type)) {
      toast.error('Format video belum didukung. Gunakan MP4, WEBM, atau MOV.')
      return false
    }
    if (file.size > maxVideoSize) {
      toast.error('Ukuran video maksimal 100 MB.')
      return false
    }
    return true
  }

  const uploadVideo = async (file: File) => {
    if (!validateVideo(file)) return
    try {
      setUploadProgress(0)
      const poster = await captureVideoThumbnail(file)
      const response = await uploadPublikasiVideo(file, setUploadProgress, poster)
      editor
        .chain()
        .focus()
        .setVideo({
          src: response.url,
          poster: response.poster_url ?? undefined,
        })
        .run()
      syncHtmlChange(editor, onChange)
      toast.success(
        response.poster_url ? 'Video dan thumbnail berhasil diunggah' : 'Video berhasil diunggah',
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal mengunggah video'
      toast.error(message)
    } finally {
      setUploadProgress(null)
    }
  }

  const pickVideo = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/mp4,video/webm,video/quicktime'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) await uploadVideo(file)
    }
    input.click()
  }

  const addYoutube = () => {
    const url = window.prompt('URL YouTube')
    if (!url) return
    const videoId = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sanday\?v=))([\w-]{11})/
    )?.[1]
    if (!videoId) {
      toast.error('URL YouTube tidak valid')
      return
    }
    editor
      .chain()
      .focus()
      .setIframe({
        src: normalizeYoutubeEmbedUrl(`https://www.youtube.com/embed/${videoId}`),
        height: '450',
      })
      .run()
    syncHtmlChange(editor, onChange)
  }

  const addInstagram = () => {
    const url = window.prompt('URL Instagram (Post/Reel)')
    if (!url) return
    let embedUrl = url
    if (!url.includes('/embed')) {
      embedUrl = `${url.split('?')[0].replace(/\/$/, '')}/embed`
    }
    editor.chain().focus().setIframe({ src: embedUrl, height: '600' }).run()
    syncHtmlChange(editor, onChange)
  }

  const toggleViewMode = () => {
    if (viewMode === 'rich') {
      setMarkdownValue(editor.getMarkdown())
      setViewMode('markdown')
      return
    }

    editor.commands.setContent(markdownValue, {
      contentType: 'markdown',
      emitUpdate: true,
    })
    syncHtmlChange(editor, onChange)
    setViewMode('rich')
  }

  const handleMarkdownChange = (value: string) => {
    setMarkdownValue(value)
    editor.commands.setContent(value, {
      contentType: 'markdown',
      emitUpdate: true,
    })
    syncHtmlChange(editor, onChange)
  }

  const importMarkdownFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const raw = await file.text()
    const result = applyMarkdownImport(raw)

    editor.commands.setContent(result.markdown, {
      contentType: 'markdown',
      emitUpdate: true,
    })
    syncHtmlChange(editor, onChange)
    setMarkdownValue(editor.getMarkdown())
    onImportMetadata?.(result.metadata)

    if (viewMode === 'rich') {
      setViewMode('markdown')
    }

    toast.success('Markdown berhasil diimpor ke editor TipTap')
    event.target.value = ''
  }

  return (
    <div className="publikasi-editor-wrapper">
      <input
        ref={markdownFileRef}
        type="file"
        accept=".md,.markdown,text/markdown"
        className="hidden"
        onChange={importMarkdownFile}
      />

      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === 'main' ? (
            <MainToolbarContent
              editor={editor}
              isMobile={isMobile}
              viewMode={viewMode}
              onToggleViewMode={toggleViewMode}
              onImportMarkdown={() => markdownFileRef.current?.click()}
              onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
              onPickVideo={pickVideo}
              onAddYoutube={addYoutube}
              onAddInstagram={addInstagram}
              uploadProgress={uploadProgress}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>

        {viewMode === 'rich' ? (
          <div className="publikasi-editor-content bg-slate-50/30 dark:bg-slate-900/10 min-h-[600px] cursor-text">
            <EditorContent editor={editor} role="presentation" />
          </div>
        ) : (
          <Textarea
            value={markdownValue}
            onChange={(event) => handleMarkdownChange(event.target.value)}
            className="publikasi-editor-markdown min-h-[600px] resize-y rounded-none border-0 shadow-none focus-visible:ring-0"
            placeholder="Tulis markdown di sini. Gunakan tombol mode visual untuk kembali ke editor rich text."
          />
        )}
      </EditorContext.Provider>

      <div className="flex items-center justify-between px-4 py-2 border-t bg-slate-50 dark:bg-slate-900 text-[10px] uppercase tracking-widest font-bold text-slate-400">
        <div className="flex items-center gap-4">
          <span>{editor.storage.characterCount?.characters() || 0} Karakter</span>
          <span>{editor.storage.characterCount?.words() || 0} Kata</span>
        </div>
        <div>{viewMode === 'markdown' ? 'TipTap Markdown' : 'TipTap Visual'}</div>
      </div>
    </div>
  )
}