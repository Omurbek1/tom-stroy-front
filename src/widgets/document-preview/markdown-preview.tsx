'use client';

import { Fragment, ReactNode, useMemo } from 'react';

interface Props {
  /** Markdown-lite source. Tokens supported: `# h1`, `## h2`, `### h3`,
   *  `- bullet` / `• bullet`, blank line = paragraph break, `---` = `<hr>`. */
  content: string;
  /** Values to substitute into `{{placeholder}}` tokens. Unresolved tokens
   *  are highlighted so the user notices missing data. */
  values?: Record<string, string | number | null | undefined>;
}

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

/**
 * Splits a single text line into React nodes, replacing `{{var}}` tokens
 * either with their resolved value or with a muted highlight that warns the
 * user about unfilled placeholders in the preview.
 */
function renderInline(
  line: string,
  values: Record<string, string | number | null | undefined>,
): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((m = PLACEHOLDER_RE.exec(line)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(line.slice(lastIndex, m.index));
    }
    const key = m[1];
    const v = values[key];
    if (v === undefined || v === null || v === '') {
      nodes.push(
        <span
          key={`ph-${m.index}-${key}`}
          style={{ color: '#fa8c16', fontWeight: 500 }}
          title="Не заполнено"
        >
          {`{{${key}}}`}
        </span>,
      );
    } else {
      nodes.push(<Fragment key={`v-${m.index}-${key}`}>{String(v)}</Fragment>);
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }
  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

interface Block {
  kind: 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'hr';
  lines: string[];
}

function tokenize(content: string): Block[] {
  const blocks: Block[] = [];
  const rawLines = content.replace(/\r\n/g, '\n').split('\n');
  let paragraph: string[] = [];
  let bullets: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'p', lines: paragraph });
      paragraph = [];
    }
  };
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ kind: 'ul', lines: bullets });
      bullets = [];
    }
  };

  for (const raw of rawLines) {
    const line = raw.trimEnd();
    if (line.trim() === '') {
      flushParagraph();
      flushBullets();
      continue;
    }
    if (/^---+\s*$/.test(line)) {
      flushParagraph();
      flushBullets();
      blocks.push({ kind: 'hr', lines: [] });
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph();
      flushBullets();
      blocks.push({ kind: 'h3', lines: [line.slice(4)] });
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      flushBullets();
      blocks.push({ kind: 'h2', lines: [line.slice(3)] });
      continue;
    }
    if (line.startsWith('# ')) {
      flushParagraph();
      flushBullets();
      blocks.push({ kind: 'h1', lines: [line.slice(2)] });
      continue;
    }
    const bullet = /^(?:-|•)\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      bullets.push(bullet[1]);
      continue;
    }
    flushBullets();
    paragraph.push(line);
  }
  flushParagraph();
  flushBullets();
  return blocks;
}

export function MarkdownPreview({ content, values = {} }: Props) {
  const blocks = useMemo(() => tokenize(content ?? ''), [content]);

  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'h1':
            return <h1 key={i}>{renderInline(block.lines[0], values)}</h1>;
          case 'h2':
            return <h2 key={i}>{renderInline(block.lines[0], values)}</h2>;
          case 'h3':
            return <h3 key={i}>{renderInline(block.lines[0], values)}</h3>;
          case 'hr':
            return <hr key={i} />;
          case 'ul':
            return (
              <ul key={i}>
                {block.lines.map((l, j) => (
                  <li key={j}>{renderInline(l, values)}</li>
                ))}
              </ul>
            );
          case 'p':
          default:
            return (
              <p key={i}>
                {block.lines.map((l, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {renderInline(l, values)}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </>
  );
}
