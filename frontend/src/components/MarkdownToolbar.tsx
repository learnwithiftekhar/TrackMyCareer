import React from 'react';

type Action = 'bold' | 'italic' | 'underline' | 'h1' | 'h2' | 'bullet';

function applyInlineWrap(
  value: string,
  start: number,
  end: number,
  open: string,
  close: string,
): { newValue: string; newStart: number; newEnd: number } {
  const selected = value.slice(start, end);

  // Toggle off if selection is already wrapped
  if (
    selected.length >= open.length + close.length &&
    selected.startsWith(open) &&
    selected.endsWith(close)
  ) {
    const inner = selected.slice(open.length, selected.length - close.length);
    return { newValue: value.slice(0, start) + inner + value.slice(end), newStart: start, newEnd: start + inner.length };
  }

  const newValue = value.slice(0, start) + open + selected + close + value.slice(end);
  if (selected.length > 0) {
    return { newValue, newStart: start + open.length, newEnd: end + open.length };
  }
  // No selection: place cursor between markers
  return { newValue, newStart: start + open.length, newEnd: start + open.length };
}

function applyLinePrefix(
  value: string,
  start: number,
  end: number,
  prefix: string,
): { newValue: string; newStart: number; newEnd: number } {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const trailingNewline = value.indexOf('\n', end > 0 ? end - 1 : 0);
  const lineEnd = trailingNewline === -1 ? value.length : trailingNewline;

  const lines = value.slice(lineStart, lineEnd).split('\n');
  const allPrefixed = lines.every(l => l.startsWith(prefix));
  const newLines = allPrefixed ? lines.map(l => l.slice(prefix.length)) : lines.map(l => prefix + l);

  const newRegion = newLines.join('\n');
  const newValue = value.slice(0, lineStart) + newRegion + value.slice(lineEnd);
  const delta = newRegion.length - (lineEnd - lineStart);

  return {
    newValue,
    newStart: Math.max(lineStart, start + (allPrefixed ? -prefix.length : prefix.length)),
    newEnd: end + delta,
  };
}

function applyAction(
  value: string,
  start: number,
  end: number,
  action: Action,
): { newValue: string; newStart: number; newEnd: number } {
  switch (action) {
    case 'bold':      return applyInlineWrap(value, start, end, '**', '**');
    case 'italic':    return applyInlineWrap(value, start, end, '*', '*');
    case 'underline': return applyInlineWrap(value, start, end, '<u>', '</u>');
    case 'h1':        return applyLinePrefix(value, start, end, '# ');
    case 'h2':        return applyLinePrefix(value, start, end, '## ');
    case 'bullet':    return applyLinePrefix(value, start, end, '- ');
  }
}

interface BtnProps {
  onClick: () => void;
  label?: string;
  style?: React.CSSProperties;
  title?: string;
  children?: React.ReactNode;
}

function Btn({ onClick, label, style, title, children }: BtnProps) {
  return (
    <button
      type="button"
      title={title}
      style={style}
      // onMouseDown + preventDefault keeps textarea focused and preserves selection
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className="inline-flex cursor-pointer items-center rounded-[5px] border border-transparent px-[7px] py-1 font-mono text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-secondary-foreground"
    >
      {label ?? children}
    </button>
  );
}

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
}

export function MarkdownToolbar({ textareaRef, onChange }: MarkdownToolbarProps) {
  function handle(action: Action) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value, selectionStart: start, selectionEnd: end } = ta;
    const { newValue, newStart, newEnd } = applyAction(value, start, end, action);
    onChange(newValue);
    // Restore selection after React re-renders the controlled textarea value
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  }

  return (
    <div className="flex gap-0.5 rounded-t-[8px] border border-b-0 border-border bg-[#fbfaf6] p-[6px_8px]">
      <Btn onClick={() => handle('bold')} label="B" style={{ fontWeight: 700 }} title="Bold (**text**)" />
      <Btn onClick={() => handle('italic')} label="I" style={{ fontStyle: 'italic' }} title="Italic (*text*)" />
      <Btn onClick={() => handle('underline')} label="U" style={{ textDecoration: 'underline' }} title="Underline (<u>text</u>)" />
      <div className="mx-1 h-4 w-px self-center bg-[#ddd7c7]" />
      <Btn onClick={() => handle('h1')} label="H1" title="Heading 1 (# )" />
      <Btn onClick={() => handle('h2')} label="H2" title="Heading 2 (## )" />
      <div className="mx-1 h-4 w-px self-center bg-[#ddd7c7]" />
      <Btn onClick={() => handle('bullet')} title="Bullet list (- )">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="4" cy="5" r=".5" fill="currentColor" />
          <circle cx="4" cy="8" r=".5" fill="currentColor" />
          <circle cx="4" cy="11" r=".5" fill="currentColor" />
          <path d="M7 5h7M7 8h7M7 11h7" />
        </svg>
      </Btn>
    </div>
  );
}
