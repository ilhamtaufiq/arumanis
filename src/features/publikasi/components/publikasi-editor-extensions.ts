import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string; height?: string }) => ReturnType
    }
    videoBlock: {
      setVideo: (options: { src: string; poster?: string | null }) => ReturnType
    }
  }
}

export const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      frameborder: { default: 0 },
      allow: {
        default: 'encrypted-media; picture-in-picture; web-share; clipboard-write',
      },
      class: {
        default:
          'w-full rounded-xl border shadow-lg my-8 block mx-auto bg-slate-50 dark:bg-slate-900 overflow-hidden',
      },
      height: { default: '450' },
    }
  },

  parseHTML() {
    return [{ tag: 'iframe' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'iframe-wrapper' },
      [
        'iframe',
        mergeAttributes(HTMLAttributes, {
          allowfullscreen: 'true',
        }),
      ],
    ]
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string; height?: string }) =>
        ({ tr, dispatch }) => {
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

export const VideoBlock = Node.create({
  name: 'videoBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      controls: { default: 'true' },
      preload: { default: 'metadata' },
      class: { default: 'publication-video' },
    }
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, {
        controls: 'true',
        preload: 'metadata',
        playsinline: 'true',
      }),
    ]
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string; poster?: string | null }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})