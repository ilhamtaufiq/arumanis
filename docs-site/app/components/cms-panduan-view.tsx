import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import type { CmsPanduanPage } from '@/lib/panduan-api';

/**
 * Lightweight markdown renderer for CMS pages (no remark dependency).
 * Supports headings, paragraphs, lists, code, links, bold/italic, tables (basic).
 */
function renderMarkdown(md: string): string {
  // Escape HTML then apply a minimal markdown subset via marked-like transforms
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = escaped.split('\n');
  const out: string[] = [];
  let inCode = false;
  let inUl = false;
  let inOl = false;
  let inTable = false;

  const closeLists = () => {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      out.push('</ol>');
      inOl = false;
    }
  };

  const closeTable = () => {
    if (inTable) {
      out.push('</tbody></table>');
      inTable = false;
    }
  };

  const inline = (text: string) =>
    text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-fd-primary underline">$1</a>',
      );

  for (const raw of lines) {
    const line = raw;

    if (line.startsWith('```')) {
      closeLists();
      closeTable();
      if (inCode) {
        out.push('</code></pre>');
        inCode = false;
      } else {
        out.push('<pre class="overflow-x-auto rounded-lg bg-fd-muted p-3 text-sm"><code>');
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      out.push(`${line}\n`);
      continue;
    }

    if (/^\|(.+)\|$/.test(line)) {
      closeLists();
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      if (/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(line.replace(/\|/g, '|'))) {
        // separator row — skip
        continue;
      }
      if (!inTable) {
        out.push(
          '<table class="w-full text-sm my-4 border-collapse"><thead></thead><tbody>',
        );
        inTable = true;
        out.push(
          `<tr>${cells.map((c) => `<th class="border border-fd-border px-2 py-1 text-left">${inline(c)}</th>`).join('')}</tr>`,
        );
        continue;
      }
      out.push(
        `<tr>${cells.map((c) => `<td class="border border-fd-border px-2 py-1">${inline(c)}</td>`).join('')}</tr>`,
      );
      continue;
    } else {
      closeTable();
    }

    const h = /^(#{1,4})\s+(.+)$/.exec(line);
    if (h) {
      closeLists();
      const level = h[1].length;
      out.push(`<h${level} class="font-semibold mt-6 mb-2">${inline(h[2])}</h${level}>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (inOl) {
        out.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        out.push('<ul class="list-disc ps-5 my-2 space-y-1">');
        inUl = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        out.push('<ol class="list-decimal ps-5 my-2 space-y-1">');
        inOl = true;
      }
      out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }

    closeLists();

    if (line.trim() === '') {
      continue;
    }

    out.push(`<p class="my-2 leading-relaxed">${inline(line)}</p>`);
  }

  closeLists();
  closeTable();
  if (inCode) out.push('</code></pre>');

  return out.join('\n');
}

export function CmsPanduanView({ page }: { page: CmsPanduanPage }) {
  const html = renderMarkdown(page.body || '');

  return (
    <DocsPage>
      <title>{page.title}</title>
      {page.description ? <meta name="description" content={page.description} /> : null}
      <DocsTitle>{page.title}</DocsTitle>
      {page.description ? <DocsDescription>{page.description}</DocsDescription> : null}
      <p className="text-xs text-fd-muted-foreground -mt-4 mb-4">
        Konten dinamis (CMS)
        {page.updated_at
          ? ` · diperbarui ${new Date(page.updated_at).toLocaleString('id-ID')}`
          : ''}
      </p>
      <DocsBody>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          // CMS markdown rendered to constrained HTML subset
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </DocsBody>
    </DocsPage>
  );
}
