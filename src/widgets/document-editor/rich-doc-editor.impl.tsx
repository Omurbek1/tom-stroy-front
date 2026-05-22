'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Button, Dropdown, Space, Tooltip } from 'antd';
import {
  AlignLeftOutlined,
  BoldOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PicCenterOutlined,
  RedoOutlined,
  TableOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';

import { htmlToMarkdown, markdownToHtml } from './markdown-html';
import './rich-doc-editor.css';

interface Props {
  /** Document content in markdown-lite (the storage format). */
  value: string;
  /** Called on every keystroke with the new markdown-lite string. */
  onChange: (next: string) => void;
  placeholder?: string;
  /** Disables editing — useful for read-only / archived docs. */
  disabled?: boolean;
}

/**
 * Word-like document editor. Internally TipTap operates on HTML; on every
 * change we convert back to markdown-lite for storage so the existing
 * pdfkit renderer keeps working.
 *
 * The toolbar is intentionally minimal — only commands a non-technical
 * user (бухгалтер / прораб) actually clicks on a daily basis. Power-user
 * shortcuts (⌘B / ⌘I / ⌘K) are inherited from StarterKit.
 */
export function RichDocEditorImpl({
  value,
  onChange,
  placeholder = 'Начните писать или вставьте текст…',
  disabled,
}: Props) {
  const lastEmittedRef = useRef<string>('');
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Strip out hard breaks — paragraphs are how we model line breaks.
        // Headings 1-3 are kept; deeper are unused in business docs.
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto', 'tel'],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: markdownToHtml(value),
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const md = htmlToMarkdown(html);
      // Skip the echo when external `value` was just applied below.
      if (md === lastEmittedRef.current) return;
      lastEmittedRef.current = md;
      onChange(md);
    },
  });

  // Sync external `value` changes (e.g. undo to last saved server state).
  // We compare in markdown-lite so cosmetic HTML differences don't churn.
  useEffect(() => {
    if (!editor) return;
    const currentMd = htmlToMarkdown(editor.getHTML());
    if (currentMd === value) return;
    lastEmittedRef.current = value;
    editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
  }, [value, editor]);

  if (!editor) {
    return <div className="rde-shell rde-shell--loading" />;
  }

  return (
    <div className="rde-shell" data-disabled={disabled ? 'true' : 'false'}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="rde-content" />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const headingItems = useMemo(
    () => ({
      items: [
        {
          key: 'p',
          label: 'Обычный текст',
          onClick: () => editor.chain().focus().setParagraph().run(),
        },
        {
          key: 'h1',
          label: 'Заголовок 1',
          onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          key: 'h2',
          label: 'Заголовок 2',
          onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          key: 'h3',
          label: 'Заголовок 3',
          onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
      ],
    }),
    [editor],
  );

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs);

  const onAddLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL ссылки', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const onInsertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="rde-toolbar" role="toolbar" aria-label="Форматирование">
      <Dropdown menu={headingItems} placement="bottomLeft">
        <Button size="small" icon={<AlignLeftOutlined />}>
          {editor.isActive('heading', { level: 1 })
            ? 'H1'
            : editor.isActive('heading', { level: 2 })
              ? 'H2'
              : editor.isActive('heading', { level: 3 })
                ? 'H3'
                : 'Стиль'}
        </Button>
      </Dropdown>

      <Space.Compact size="small">
        <Tooltip title="Жирный (⌘B)">
          <Button
            type={isActive('bold') ? 'primary' : 'default'}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
        </Tooltip>
        <Tooltip title="Курсив (⌘I)">
          <Button
            type={isActive('italic') ? 'primary' : 'default'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
        </Tooltip>
      </Space.Compact>

      <Space.Compact size="small">
        <Tooltip title="Маркированный список">
          <Button
            type={isActive('bulletList') ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
        </Tooltip>
        <Tooltip title="Нумерованный список">
          <Button
            type={isActive('orderedList') ? 'primary' : 'default'}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
        </Tooltip>
        <Tooltip title="Цитата">
          <Button
            type={isActive('blockquote') ? 'primary' : 'default'}
            icon={<PicCenterOutlined />}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
        </Tooltip>
      </Space.Compact>

      <Space.Compact size="small">
        <Tooltip title="Ссылка (⌘K)">
          <Button
            type={isActive('link') ? 'primary' : 'default'}
            icon={<LinkOutlined />}
            onClick={onAddLink}
          />
        </Tooltip>
        <Tooltip title="Вставить таблицу">
          <Button icon={<TableOutlined />} onClick={onInsertTable} />
        </Tooltip>
      </Space.Compact>

      <div className="rde-toolbar__spacer" />

      <Space.Compact size="small">
        <Tooltip title="Отменить (⌘Z)">
          <Button
            icon={<UndoOutlined />}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
        </Tooltip>
        <Tooltip title="Повторить (⌘⇧Z)">
          <Button
            icon={<RedoOutlined />}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />
        </Tooltip>
      </Space.Compact>
    </div>
  );
}
