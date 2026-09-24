"use client"

import * as React from "react"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TiptapImage from "@tiptap/extension-image"
import { Placeholder } from "@tiptap/extensions"
import {
  BoldIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  UnderlineIcon,
  Undo2Icon,
  UnlinkIcon,
} from "lucide-react"

import { ImagePickerDialog } from "@/components/images/image-picker-dialog"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

function useForceUpdateOnTransaction(editor: Editor | null) {
  const [, setTick] = React.useState(0)
  React.useEffect(() => {
    if (!editor) return
    const rerender = () => setTick((t) => t + 1)
    editor.on("transaction", rerender)
    editor.on("selectionUpdate", rerender)
    return () => {
      editor.off("transaction", rerender)
      editor.off("selectionUpdate", rerender)
    }
  }, [editor])
}

function LinkPopover({ editor }: { editor: Editor }) {
  const [url, setUrl] = React.useState("")
  const [open, setOpen] = React.useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setUrl(editor.getAttributes("link").href ?? "")
      }}
    >
      <PopoverTrigger asChild>
        <Toggle size="sm" pressed={editor.isActive("link")} aria-label="Enlace">
          <LinkIcon />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (url) {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
            } else {
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
            }
            setOpen(false)
          }}
        >
          <Input
            autoFocus
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="submit" size="sm">
            Aplicar
          </Button>
          {editor.isActive("link") ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                editor.chain().focus().unsetLink().run()
                setOpen(false)
              }}
            >
              <UnlinkIcon />
            </Button>
          ) : null}
        </form>
      </PopoverContent>
    </Popover>
  )
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TiptapImage.configure({ HTMLAttributes: { class: "rounded-lg border border-border" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Escribe el contenido de tu post…" }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose-content min-h-[320px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })

  useForceUpdateOnTransaction(editor)

  if (!editor) return null

  const headingValue = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : "paragraph"

  return (
    <div className={cn("overflow-hidden rounded-lg border border-input", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/40 p-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2Icon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2Icon />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToggleGroup
          type="single"
          size="sm"
          value={headingValue}
          onValueChange={(value) => {
            if (value === "h2") editor.chain().focus().setNode("heading", { level: 2 }).run()
            else if (value === "h3") editor.chain().focus().setNode("heading", { level: 3 }).run()
            else editor.chain().focus().setParagraph().run()
          }}
        >
          <ToggleGroupItem value="paragraph" aria-label="Párrafo" className="px-2.5 text-xs font-medium">
            Texto
          </ToggleGroupItem>
          <ToggleGroupItem value="h2" aria-label="Título 2" className="px-2.5 text-xs font-medium">
            H2
          </ToggleGroupItem>
          <ToggleGroupItem value="h3" aria-label="Título 3" className="px-2.5 text-xs font-medium">
            H3
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Negrita"
        >
          <BoldIcon />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Cursiva"
        >
          <ItalicIcon />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Subrayado"
        >
          <UnderlineIcon />
        </Toggle>

        <LinkPopover editor={editor} />

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Lista"
        >
          <ListIcon />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Lista numerada"
        >
          <ListOrderedIcon />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Cita"
        >
          <QuoteIcon />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ImagePickerDialog
          trigger={
            <Toggle size="sm" pressed={false} aria-label="Insertar imagen">
              <ImageIcon />
            </Toggle>
          }
          onSelect={(image) => editor.chain().focus().setImage({ src: image.url, alt: image.alt }).run()}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
