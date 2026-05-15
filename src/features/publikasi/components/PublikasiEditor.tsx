import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect } from 'react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import CharacterCount from '@tiptap/extension-character-count'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import FloatingMenuExtension from '@tiptap/extension-floating-menu'
import { 
    Bold, Italic, Underline as UnderlineIcon, 
    List, ListOrdered, Quote, 
    Link as LinkIcon, Undo, Redo, Image as ImageIcon,
    Type, Code, Instagram, Youtube, Share2
} from 'lucide-react'
import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string }) => ReturnType
    }
  }
}

const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allow: {
        default: 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share',
      },
      class: {
        default: 'w-full rounded-xl border shadow-lg my-8 block mx-auto bg-slate-50 dark:bg-slate-900 overflow-hidden',
      },
      height: {
        default: '450',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'iframe-wrapper' }, ['iframe', mergeAttributes(HTMLAttributes, { 
      allowfullscreen: 'true',
      loading: 'lazy'
    })]]
  },

  addCommands() {
    return {
      setIframe: (options: { src: string }) => ({ tr, dispatch }: any) => {
        const { selection } = tr
        const node = this.type.create(options)

        if (dispatch) {
          tr.replaceRangeWith(selection.from, selection.to, node)
        }

        return true
      },
    }
  },
})
import { Button } from '@/components/ui/button'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface PublikasiEditorProps {
    content: string
    onChange: (content: string) => void
}

export function PublikasiEditor({ content, onChange }: PublikasiEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-4 cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder: 'Tulis cerita Anda di sini...',
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl border shadow-lg max-w-full h-auto my-8 mx-auto block hover:ring-2 hover:ring-primary transition-all',
                },
            }),
            Dropcursor.configure({
                color: 'hsl(var(--primary))',
                width: 2,
            }),
            CharacterCount,
            BubbleMenuExtension,
            FloatingMenuExtension,
            Iframe,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[500px] py-8 px-4',
            },
            handlePaste: (_, event) => {
                const items = Array.from(event.clipboardData?.items || [])
                const imageItem = items.find((item) => item.type.startsWith('image'))

                if (imageItem && editor) {
                    const file = imageItem.getAsFile()
                    if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                            const result = e.target?.result as string
                            if (result) {
                                editor.chain().focus().setImage({ src: result }).run()
                            }
                        }
                        reader.readAsDataURL(file)
                        toast.success('Gambar berhasil ditempel dari clipboard')
                        return true
                    }
                }

                // Handle Social Media Paste
                const text = event.clipboardData?.getData('text/plain')
                if (text && (text.includes('youtube.com') || text.includes('youtu.be') || text.includes('instagram.com'))) {
                    if (text.includes('youtube.com') || text.includes('youtu.be')) {
                        const videoId = text.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sanday\?v=))([\w-]{11})/)?.[1]
                        if (videoId && editor) {
                            (editor.chain().focus() as any).setIframe({ 
                                src: `https://www.youtube.com/embed/${videoId}`,
                                height: '450'
                            }).run()
                            toast.success('Video YouTube berhasil di-embed')
                            return true
                        }
                    } else if (text.includes('instagram.com')) {
                        let embedUrl = text.split('?')[0].replace(/\/$/, '')
                        if (!embedUrl.endsWith('/embed')) {
                            embedUrl += '/embed'
                        }
                        if (editor) {
                            (editor.chain().focus() as any).setIframe({ 
                                src: embedUrl,
                                height: '600'
                            }).run()
                            toast.success('Konten Instagram berhasil di-embed')
                            return true
                        }
                    }
                }

                return false
            },
            handleDrop: (_, event) => {
                const items = Array.from(event.dataTransfer?.files || [])
                const imageFile = items.find((file) => file.type.startsWith('image'))

                if (imageFile && editor) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        const result = e.target?.result as string
                        if (result) {
                            editor.chain().focus().setImage({ src: result }).run()
                        }
                    }
                    reader.readAsDataURL(imageFile)
                    toast.success('Gambar berhasil dilepaskan ke editor')
                    return true
                }
                return false
            },
        },
    })

    // Sync content from props to editor
    useEffect(() => {
        if (editor && content && !editor.isFocused && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    const toggleLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    const addImage = () => {
        const url = window.prompt('URL Gambar')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const addYoutube = () => {
        const url = window.prompt('URL YouTube (Contoh: https://www.youtube.com/watch?v=...)')
        if (url) {
            const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sanday\?v=))([\w-]{11})/)?.[1]
            if (videoId) {
                (editor.chain().focus() as any).setIframe({ 
                    src: `https://www.youtube.com/embed/${videoId}`,
                    height: '450'
                }).run()
            } else {
                toast.error('URL YouTube tidak valid')
            }
        }
    }

    const addInstagram = () => {
        const url = window.prompt('URL Instagram (Post/Reel)')
        if (url) {
            let embedUrl = url
            if (!url.includes('/embed')) {
                embedUrl = url.split('?')[0].replace(/\/$/, '') + '/embed'
            }
            (editor.chain().focus() as any).setIframe({ 
                src: embedUrl,
                height: '600'
            }).run()
        }
    }

    return (
        <div className="relative border rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm transition-all focus-within:shadow-md border-slate-200 dark:border-slate-800">
            {/* Main Toolbar */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200 dark:border-slate-800">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 px-3 font-semibold text-xs">
                            <Type className="h-4 w-4" />
                            {editor.isActive('heading', { level: 1 }) ? 'Heading 1' : 
                             editor.isActive('heading', { level: 2 }) ? 'Heading 2' : 
                             editor.isActive('heading', { level: 3 }) ? 'Heading 3' : 'Paragraf'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 rounded-xl">
                        <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                            Teks Normal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="text-xl font-bold">
                            Heading 1
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="text-lg font-bold">
                            Heading 2
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="font-bold">
                            Heading 3
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <div className="flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'bg-slate-100 dark:bg-slate-800 text-primary' : ''}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'bg-slate-100 dark:bg-slate-800 text-primary' : ''}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={editor.isActive('underline') ? 'bg-slate-100 dark:bg-slate-800 text-primary' : ''}
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={editor.isActive('code') ? 'bg-slate-100 dark:bg-slate-800 text-primary' : ''}
                    >
                        <Code className="h-4 w-4" />
                    </Button>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <div className="flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'bg-slate-100 dark:bg-slate-800 text-primary' : ''}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'bg-slate-100 dark:bg-slate-800 text-primary' : ''}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editor.isActive('blockquote') ? 'bg-slate-100 dark:bg-slate-800 text-primary' : ''}
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                <div className="flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLink}
                        className={editor.isActive('link') ? 'bg-slate-100 dark:bg-slate-800 text-primary' : ''}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={addImage}
                        className="hover:text-primary"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:text-primary">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="rounded-xl">
                            <DropdownMenuItem onClick={addYoutube} className="gap-2">
                                <Youtube className="h-4 w-4 text-red-500" />
                                YouTube Video
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={addInstagram} className="gap-2">
                                <Instagram className="h-4 w-4 text-pink-500" />
                                Instagram Post/Reel
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-0.5 pr-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Bubble Menu for quick formatting */}
            {editor && (
                <BubbleMenu 
                    editor={editor} 
                    className="flex items-center gap-0.5 p-1 rounded-full border bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`h-8 w-8 rounded-full ${editor.isActive('bold') ? 'text-primary bg-primary/10' : ''}`}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`h-8 w-8 rounded-full ${editor.isActive('italic') ? 'text-primary bg-primary/10' : ''}`}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLink}
                        className={`h-8 w-8 rounded-full ${editor.isActive('link') ? 'text-primary bg-primary/10' : ''}`}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                </BubbleMenu>
            )}

            <div className="bg-slate-50/30 dark:bg-slate-900/10 min-h-[600px] cursor-text" onClick={() => editor.chain().focus().run()}>
                <div className="max-w-3xl mx-auto">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Bottom bar for info */}
            <div className="flex items-center justify-between px-4 py-2 border-t bg-slate-50 dark:bg-slate-900 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                <div className="flex items-center gap-4">
                    <span>{editor.storage.characterCount?.characters() || 0} Karakter</span>
                    <span>{editor.storage.characterCount?.words() || 0} Kata</span>
                </div>
                <div>Arumanis Editor v2.0</div>
            </div>
        </div>
    )
}
