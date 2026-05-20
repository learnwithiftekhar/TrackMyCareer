import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createCompany, type Company } from '@/api/companies';

interface AddCompanyModalProps {
  onClose: () => void;
  onSave: (company: Company) => void;
}

export function AddCompanyModal({ onClose, onSave }: AddCompanyModalProps) {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<() => void>(() => {});

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    submitRef.current = handleSubmit;
  });

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitRef.current();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function handleSubmit() {
    if (!name.trim()) { setError('Company name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const created = await createCompany({ companyName: name.trim(), about: about.trim() || undefined });
      onSave(created);
    } catch {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-company-modal-title"
        className="relative z-10 flex w-[540px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-48px)] flex-col overflow-hidden rounded-2xl border border-[#ddd7c7] bg-card shadow-[0_24px_64px_-16px_rgba(31,29,26,.30),0_8px_24px_-8px_rgba(31,29,26,.16)]"
      >
        {/* Head */}
        <header className="flex items-start justify-between gap-3 px-6 pt-[22px] pb-1.5">
          <div>
            <h2 id="add-company-modal-title" className="text-[18px] font-semibold tracking-[-0.01em] text-foreground">
              Add company
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Track it now, even if you haven't applied yet.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-[30px] shrink-0 place-items-center rounded-lg border-none bg-transparent text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="overflow-y-auto px-6 pt-[18px] pb-1">
          {/* Company name */}
          <div className="mb-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-secondary-foreground">
              Company name <span className="text-indigo">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Stripe"
              className={cn(
                'w-full rounded-[9px] border bg-card px-3 py-[9px] text-[13.5px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/50',
                error ? 'border-destructive focus:border-destructive focus:ring-[3px] focus:ring-destructive/10' : 'border-[#ddd7c7] focus:border-indigo focus:ring-[3px] focus:ring-indigo/10',
              )}
            />
            {error && <p className="mt-1.5 text-[12px] text-destructive">{error}</p>}
          </div>

          {/* About / Notes */}
          <div className="mb-4">
            <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-secondary-foreground">
              Notes
              <span className="text-[11.5px] font-normal text-muted-foreground/60">optional</span>
            </label>
            <textarea
              value={about}
              onChange={e => setAbout(e.target.value)}
              placeholder="Why this company is interesting, contacts there, anything to remember…"
              rows={3}
              className="w-full resize-y rounded-[9px] border border-[#ddd7c7] bg-card px-3 py-[9px] text-[13.5px] leading-[1.55] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/50 focus:border-indigo focus:ring-[3px] focus:ring-indigo/10"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary px-6 py-4">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="grid size-3.5 place-items-center rounded-[4px] bg-accent text-[9px] font-semibold text-accent-foreground">✓</span>
            You can add applications after saving.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-[9px] border-[#ddd7c7] text-[13.5px]">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={saving} className="rounded-[9px] text-[13.5px]">
              {saving ? 'Saving…' : 'Add company'}
              {!saving && (
                <span className="ml-0.5 rounded-[4px] bg-white/[0.14] px-[5px] py-px font-mono text-[11px] opacity-70">⌘↵</span>
              )}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
