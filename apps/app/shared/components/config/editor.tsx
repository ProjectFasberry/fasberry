import StarterKit from "@tiptap/starter-kit"
import { TextStyleKit } from "@tiptap/extension-text-style"
import { Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react"
import { useCallback } from "react"
import { tv } from "tailwind-variants"
import { scrollableVariant } from "@/shared/consts/style-variants"

export const editorExtensions = [
  TextStyleKit,
  StarterKit.configure({
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      protocols: ['http', 'https'],
      isAllowedUri: (url, ctx) => {
        try {
          const parsedUrl = url.includes(':')
            ? new URL(url)
            : new URL(`${ctx.defaultProtocol}://${url}`)

          if (!ctx.defaultValidate(parsedUrl.href)) {
            return false
          }

          const disallowedProtocols = ['ftp', 'file', 'mailto']
          const protocol = parsedUrl.protocol.replace(':', '')

          if (disallowedProtocols.includes(protocol)) {
            return false
          }

          const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

          if (!allowedProtocols.includes(protocol)) {
            return false
          }

          const domain = parsedUrl.hostname;

          if (!isHostnameAllowed(domain)) {
            return false;
          }

          return true
        } catch {
          return false
        }
      },
      shouldAutoLink: url => {
        try {
          const parsedUrl = url.includes(':')
            ? new URL(url)
            : new URL(`https://${url}`);

          const domain = parsedUrl.hostname;

          return isHostnameAllowed(domain)
        } catch {
          return false
        }
      },
    }
  }),
]

const controlVariant = tv({
  base: `
    shrink-0 data-[state=active]:bg-neutral-600 [&:not([data-state])]:bg-neutral-800 data-[state=inactive]:bg-neutral-800
    disabled:opacity-60 disabled:pointer-events-none h-8 min-w-8 px-2 py-1 rounded-lg text-nowrap
  `
})

export const EditorMenuBar = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
        isLink: ctx.editor.isActive('link'),
      }
    },
  })

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    try {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message)
      }
    }
  }, [editor])

  return (
    <>
      <div className={scrollableVariant({ className: "flex overflow-x-auto pb-2 items-center w-full gap-1" })}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          data-state={editorState.isBold ? "active" : "inactive"}
          className={controlVariant()}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          data-state={editorState.isItalic ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          data-state={editorState.isStrike ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          S
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          data-state={editorState.isCode ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          C
        </button>
        <button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className={controlVariant()}
        >
          Clear marks
        </button>
        <button
          onClick={() => editor.chain().focus().clearNodes().run()}
          className={controlVariant()}
        >
          Clear nodes
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          data-state={editorState.isParagraph ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          P
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          data-state={editorState.isHeading1 ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          data-state={editorState.isHeading2 ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          data-state={editorState.isHeading3 ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          data-state={editorState.isHeading4 ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          H4
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          data-state={editorState.isHeading5 ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          H5
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          data-state={editorState.isHeading6 ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-state={editorState.isBulletList ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-state={editorState.isOrderedList ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          Ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          data-state={editorState.isCodeBlock ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          Code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          data-state={editorState.isBlockquote ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          Blockquote
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={controlVariant()}
        >
          Horizontal rule
        </button>
        <button
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className={controlVariant()}
        >
          Hard break
        </button>
        <button
          onClick={setLink}
          data-state={editorState.isLink ? 'active' : 'inactive'}
          className={controlVariant()}
        >
          Set link
        </button>
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editorState.isLink}
          className={controlVariant()}
        >
          Unset link
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
          className={controlVariant()}
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
          className={controlVariant()}
        >
          Redo
        </button>
      </div>
    </>
  )
}

const ALLOWED_DOMAINS = [
  'google.com',
  'github.com',
  'stackoverflow.com',
  'wikipedia.org',
  'mozilla.org',
  'npmjs.com',
  'microsoft.com',
  'apple.com',
  'amazon.com',
  'linkedin.com',
  'fasberry.su'
];

const domainPattern = ALLOWED_DOMAINS
  .map(d => d.replace(/\./g, '\\.'))
  .join('|');

function isHostnameAllowed(rawHostname: string) {
  if (!rawHostname || typeof rawHostname !== 'string') return false;

  const hostname = rawHostname.trim().toLowerCase();
  return ALLOWED_HOSTNAME_RE.test(hostname);
}

const ALLOWED_HOSTNAME_RE = new RegExp(
  `^(?:[a-z0-9-]+\\.)*(?:${domainPattern})$`,
  'i'
);


const content = `<h2>Hi there</h2>`

export const EditorTest = () => {
  const editor = useEditor({
    extensions: editorExtensions,
    content
  })

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <EditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
      <button onClick={() => console.log(editor.getJSON())}>
        get JSON
      </button>
    </div>
  )
}