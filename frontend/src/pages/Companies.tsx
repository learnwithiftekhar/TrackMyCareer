import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCompanies, createCompany, deleteCompany, type Company } from '@/api/companies';

// Deterministic avatar palette keyed by id % 7
const AVATARS = [
  { bg: '#635bff', color: '#fff' },
  { bg: '#0d0d0d', color: '#fff' },
  { bg: '#6f3bcc', color: '#fff' },
  { bg: '#fef2ee', color: '#dc4a26' },
  { bg: '#eef9f1', color: '#1e7a4a' },
  { bg: '#f5f3ee', color: '#c96442' },
  { bg: '#fff7e6', color: '#b88416' },
];

function avatarStyle(id: number) {
  return AVATARS[id % AVATARS.length];
}

// ── Add Company Modal ────────────────────────────────────────────────────────

interface AddModalProps {
  onClose: () => void;
  onSave: (company: Company) => void;
}

function AddCompanyModal({ onClose, onSave }: AddModalProps) {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [name, about]); // eslint-disable-line react-hooks/exhaustive-deps

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
        aria-labelledby="modal-title"
        className="relative z-10 flex w-[540px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-48px)] flex-col overflow-hidden rounded-2xl border border-[#ddd7c7] bg-card shadow-[0_24px_64px_-16px_rgba(31,29,26,.30),0_8px_24px_-8px_rgba(31,29,26,.16)]"
      >
        {/* Head */}
        <header className="flex items-start justify-between gap-3 px-6 pt-[22px] pb-1.5">
          <div>
            <h2 id="modal-title" className="text-[18px] font-semibold tracking-[-0.01em] text-foreground">
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

// ── Company Card ─────────────────────────────────────────────────────────────

interface CompanyCardProps {
  company: Company;
  onDelete: (id: number) => void;
  onNavigate: (id: number, name: string) => void;
}

function CompanyCard({ company, onDelete, onNavigate }: CompanyCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { bg, color } = avatarStyle(company.id);
  const letter = company.companyName.charAt(0).toUpperCase();

  return (
    <div
      onClick={() => onNavigate(company.id, company.companyName)}
      className="relative flex min-h-[192px] cursor-pointer flex-col rounded-[14px] border border-border bg-card p-[18px_20px_16px] shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)] transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-[#ddd7c7]"
    >
      {/* Top row */}
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Avatar */}
          <div
            className="grid size-10 shrink-0 place-items-center rounded-[10px] text-[16px] font-semibold tracking-[-0.02em]"
            style={{ background: bg, color }}
          >
            {letter}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold leading-[1.25] tracking-[-0.005em] text-foreground">
              {company.companyName}
            </div>
            {company.about && (
              <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                {company.about}
              </div>
            )}
          </div>
        </div>

        {/* Action menu */}
        <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="grid size-6 place-items-center rounded-md text-muted-foreground/60 transition-colors hover:bg-background hover:text-muted-foreground"
          >
            <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="8" r="1.3" />
              <circle cx="8" cy="8" r="1.3" />
              <circle cx="13" cy="8" r="1.3" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 z-20 min-w-[130px] overflow-hidden rounded-[10px] border border-border bg-card shadow-lg">
                <button
                  onClick={() => { setMenuOpen(false); onDelete(company.id); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-destructive transition-colors hover:bg-destructive/5"
                >
                  <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 4h10M6 4V2.5h4V4M5.5 4v8a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V4" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-border pt-3 text-[12px] text-muted-foreground">
        {company.about ? (
          <p className="line-clamp-2 leading-[1.5]">{company.about}</p>
        ) : (
          <span className="italic text-muted-foreground/50">No notes yet</span>
        )}
      </div>
    </div>
  );
}

// ── Add Card (empty slot) ────────────────────────────────────────────────────

function AddCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex min-h-[192px] flex-col items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[#ddd7c7] bg-transparent p-[18px] text-center text-muted-foreground transition-[border-color,background,color] duration-150 hover:border-indigo hover:bg-indigo/[0.03] hover:text-indigo"
    >
      <div className="grid size-8 place-items-center rounded-[9px] border border-[#ddd7c7] bg-card text-secondary-foreground transition-[border-color,color,background] group-hover:border-indigo group-hover:bg-white group-hover:text-indigo">
        <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M8 3v10M3 8h10" />
        </svg>
      </div>
      <div>
        <div className="text-[13.5px] font-medium">Add a company</div>
        <div className="text-[12px] text-muted-foreground/60">Track it before applying</div>
      </div>
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  function handleSave(company: Company) {
    setCompanies(prev => [...prev, company]);
    setShowModal(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this company?')) return;
    await deleteCompany(id);
    setCompanies(prev => prev.filter(c => c.id !== id));
  }

  function handleNavigate(id: number, name: string) {
    navigate(`/jobs?companyId=${id}&companyName=${encodeURIComponent(name)}`);
  }

  const filtered = companies.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <main className="mx-auto max-w-295 px-8 py-11 pb-20">

        {/* Page header */}
        <section className="mb-7 flex items-end justify-between gap-6">
          <div>
            <h1 className="m-0 mb-1 text-[30px] font-semibold tracking-[-0.02em]">Companies</h1>
            <p className="m-0 text-[14px] text-muted-foreground">
              <strong className="font-medium text-secondary-foreground">{companies.length}</strong>{' '}
              {companies.length === 1 ? 'company' : 'companies'} tracked
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-[7px] rounded-[9px] border-[#ddd7c7] text-[13.5px]"
            >
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v8M5 8l3 3 3-3M3 13h10" />
              </svg>
              Export
            </Button>
            <Button onClick={() => setShowModal(true)} className="gap-[7px] rounded-[9px] text-[13.5px]">
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Add company
            </Button>
          </div>
        </section>

        {/* Summary band */}
        <section className="mb-7 grid grid-cols-4 overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
          {[
            { label: 'Tracked',       val: String(companies.length).padStart(2, '0'), sub: 'Total companies' },
            { label: 'Active pipeline', val: '—',  sub: 'Companies with open apps' },
            { label: 'In interview',  val: '—',  sub: 'Across open roles' },
            { label: 'Avg response',  val: '—',  sub: 'First reply after applying' },
          ].map((cell, i, arr) => (
            <div
              key={cell.label}
              className={cn('px-5.5 pt-4.5 pb-5', i < arr.length - 1 && 'border-r border-border')}
            >
              <div className="mb-2.5 text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                {cell.label}
              </div>
              <div className="font-mono text-[24px] font-medium leading-none tracking-[-0.03em] text-foreground">
                {cell.val}
              </div>
              <div className="mt-1.5 text-[12px] text-muted-foreground">{cell.sub}</div>
            </div>
          ))}
        </section>

        {/* Toolbar */}
        <section className="mb-6 flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-70 max-w-105 flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50"
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L13.5 13.5" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies…"
              className="h-9.5 w-full rounded-[10px] border border-[#ddd7c7] bg-card py-[9px] pl-9 pr-3.5 text-[13.5px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/50 focus:border-indigo focus:ring-[3px] focus:ring-indigo/10"
            />
          </div>

          <div className="h-5.5 w-px bg-[#ddd7c7]" />

          {/* Sort button */}
          <button className="inline-flex items-center gap-1.75 rounded-[10px] border border-[#ddd7c7] bg-card px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5l3-3 3 3M6 2v12M13 11l-3 3-3-3M10 14V2" />
            </svg>
            A–Z
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
        </section>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-h-[192px] animate-pulse rounded-[14px] border border-border bg-card" />
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-3 gap-4">
            {filtered.map(company => (
              <CompanyCard key={company.id} company={company} onDelete={handleDelete} onNavigate={handleNavigate} />
            ))}
            <AddCard onClick={() => setShowModal(true)} />
          </section>
        )}

        {/* Empty state */}
        {!loading && companies.length === 0 && (
          <p className="mt-8 text-center text-[14px] text-muted-foreground">
            No companies yet. Add one to get started.
          </p>
        )}

        {/* No results for search */}
        {!loading && companies.length > 0 && filtered.length === 0 && (
          <p className="mt-8 text-center text-[14px] text-muted-foreground">
            No companies match "{search}".
          </p>
        )}

      </main>

      {showModal && (
        <AddCompanyModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </>
  );
}
