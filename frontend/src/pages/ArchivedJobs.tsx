import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getJobs, archiveJob, type Job } from '@/api/jobs';

type SortField = 'deadline' | 'createdAt';
type SortDir = 'asc' | 'desc';

const SWATCH: Record<string, string> = {
  Wishlist:  'bg-wish',
  Applied:   'bg-applied',
  Interview: 'bg-intv',
  Offer:     'bg-offer',
  Rejected:  'bg-rej',
};

const CELL = 'flex min-w-0 items-center px-4 py-[14px]';
const GRID_COLS = 'minmax(260px,1.4fr) minmax(160px,1fr) 120px 110px 130px 120px 130px 110px 44px';

const AVATAR_PALETTE = [
  { bg: '#635bff', color: '#fff' },
  { bg: '#0d0d0d', color: '#fff' },
  { bg: '#6f3bcc', color: '#fff' },
  { bg: '#fef2ee', color: '#dc4a26' },
  { bg: '#eef9f1', color: '#1e7a4a' },
  { bg: '#f5f3ee', color: '#c96442' },
  { bg: '#fff7e6', color: '#b88416' },
];

function avatarStyle(companyId: number) {
  return AVATAR_PALETTE[companyId % AVATAR_PALETTE.length];
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return parseLocalDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCreatedAt(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-[9px] py-[3px] text-[12px] font-medium leading-[1.4] text-secondary-foreground">
      <span className={cn('size-[6px] shrink-0 rounded-full', SWATCH[status] ?? 'bg-muted')} />
      {status}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="contents">
          {Array.from({ length: 9 }).map((_, j) => (
            <div key={j} className={cn(CELL, 'border-b border-border')}>
              <div className="h-4 w-full animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

const SORT_LABELS: Record<SortField, string> = {
  deadline: 'Deadline',
  createdAt: 'Entry Date',
};

export default function ArchivedJobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [toasts, setToasts] = useState<{ id: number; type: 'success' | 'error'; message: string }[]>([]);
  const toastCounter = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    getJobs({ page, size: 10, search: debouncedSearch || undefined, sortBy, sortDir, archived: true })
      .then((data) => {
        setJobs(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, sortBy, sortDir]);

  useEffect(() => {
    if (openMenuId === null) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

  function showToast(type: 'success' | 'error', message: string) {
    const tid = ++toastCounter.current;
    setToasts(prev => [...prev, { id: tid, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== tid)), 4000);
  }

  async function handleRestore(job: Job) {
    setOpenMenuId(null);
    try {
      await archiveJob(job.id, false);
      setJobs(prev => prev.filter(j => j.id !== job.id));
      setTotalElements(n => n - 1);
      showToast('success', `"${job.jobTitle}" restored to active.`);
    } catch {
      showToast('error', 'Failed to restore. Please try again.');
    }
  }

  function handleSort(field: SortField) {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir(field === 'createdAt' ? 'desc' : 'asc'); }
    setPage(0);
  }

  const firstItem = page * 10 + 1;
  const lastItem = Math.min(page * 10 + jobs.length, totalElements);

  function pageNumbers(): (number | '…')[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
    if (page < 3) return [0, 1, 2, 3, '…', totalPages - 1];
    if (page >= totalPages - 3) return [0, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
    return [0, '…', page - 1, page, page + 1, '…', totalPages - 1];
  }

  return (
    <>
    <main className="mx-auto max-w-[1180px] px-8 py-11 pb-20">

      {/* Page header */}
      <section className="mb-7 flex items-end justify-between gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[13px] text-muted-foreground">
            <Link to="/jobs" className="text-muted-foreground no-underline transition-colors hover:text-secondary-foreground">
              All Jobs
            </Link>
            <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4l4 4-4 4" />
            </svg>
            <span className="text-secondary-foreground">Archived</span>
          </div>
          <h1 className="mb-1 text-[30px] font-semibold leading-none tracking-[-0.02em] text-foreground">
            Archived Jobs
          </h1>
          <p className="text-[14px] text-muted-foreground">
            <strong className="font-medium text-secondary-foreground">{totalElements}</strong> archived applications
            &nbsp;·&nbsp;Sorted by {SORT_LABELS[sortBy]}, {sortDir === 'asc' ? 'oldest first' : 'newest first'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSort(sortBy)} className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h10M5 8h6M7 12h2" />
            </svg>
            Sort: {SORT_LABELS[sortBy]} {sortDir === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </section>

      {/* Search */}
      <section className="mb-4">
        <div className="relative min-w-[280px] max-w-[420px]">
          <svg className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13.5 13.5" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title or company…"
            className="h-[38px] w-full rounded-[10px] border border-[#ddd7c7] bg-card pl-9 pr-4 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[#4f46e5] focus:ring-[3px] focus:ring-[#4f46e5]/10"
          />
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
        <div className="grid" style={{ gridTemplateColumns: GRID_COLS }}>

          {/* Header */}
          {(['Role', 'Company', 'Status', 'Applied', 'Deadline', 'Source', 'Salary', 'Entry Date', ''] as const).map((label, i) => {
            const field: SortField | null = label === 'Deadline' ? 'deadline' : label === 'Entry Date' ? 'createdAt' : null;
            const isActive = field !== null && sortBy === field;
            return (
              <div
                key={i}
                onClick={field ? () => handleSort(field) : undefined}
                className={cn(
                  CELL, 'border-b border-border bg-secondary text-[11.5px] font-medium uppercase tracking-[0.06em]',
                  field ? 'cursor-pointer select-none gap-[5px] hover:text-foreground' : 'text-muted-foreground',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
                {isActive && (
                  <span className="font-mono text-[#4f46e5] normal-case tracking-normal">
                    {sortDir === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            );
          })}

          {/* Rows */}
          {loading ? (
            <SkeletonRows />
          ) : jobs.length === 0 ? (
            <div className="col-span-9 py-16 text-center text-[14px] text-muted-foreground">
              No archived jobs found.
            </div>
          ) : (
            jobs.map((job) => {
              const av = avatarStyle(job.companyId);
              const letter = job.companyName.charAt(0).toUpperCase();

              return (
                <div key={job.id} className="contents">

                  {/* Role */}
                  <div className={cn(CELL, 'gap-3 border-b border-border opacity-75')}>
                    <div
                      className="grid size-[34px] shrink-0 place-items-center rounded-[9px] border text-[13px] font-semibold tracking-[-0.01em]"
                      style={{ background: av.bg, color: av.color, borderColor: av.bg }}
                    >
                      {letter}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="block truncate text-[14px] font-medium leading-[1.3] text-foreground no-underline hover:text-[#4f46e5]"
                      >
                        {job.jobTitle}
                      </Link>
                    </div>
                  </div>

                  <div className={cn(CELL, 'border-b border-border opacity-75')}>
                    <span className="truncate text-[13.5px] text-secondary-foreground">{job.companyName}</span>
                  </div>

                  <div className={cn(CELL, 'border-b border-border opacity-75')}>
                    <StatusBadge status={job.appliedStatus} />
                  </div>

                  <div className={cn(CELL, 'border-b border-border font-mono text-[12.5px] tracking-[-0.01em] opacity-75', job.appliedDate ? 'text-secondary-foreground' : 'text-muted-foreground')}>
                    {formatDate(job.appliedDate)}
                  </div>

                  <div className={cn(CELL, 'border-b border-border opacity-75')}>
                    <span className="text-[12.5px] text-muted-foreground">{formatDate(job.deadline)}</span>
                  </div>

                  <div className={cn(CELL, 'border-b border-border opacity-75')}>
                    {job.jobSource ? (
                      <span className="rounded-[6px] border border-border bg-background px-2 py-[2px] text-[11.5px] text-muted-foreground">
                        {job.jobSource}
                      </span>
                    ) : (
                      <span className="text-[12.5px] text-muted-foreground">—</span>
                    )}
                  </div>

                  <div className={cn(CELL, 'border-b border-border font-mono text-[12.5px] tracking-[-0.01em] opacity-75', job.salaryRange ? 'text-secondary-foreground' : 'text-muted-foreground')}>
                    {job.salaryRange ?? '—'}
                  </div>

                  <div className={cn(CELL, 'border-b border-border font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground opacity-75')}>
                    {formatCreatedAt(job.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className={cn(CELL, 'relative justify-center border-b border-border')}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                      className="inline-flex cursor-pointer rounded-[6px] p-[6px] text-[#b3afa3] transition-colors hover:bg-background hover:text-secondary-foreground"
                    >
                      <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="3" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="13" cy="8" r="1.3" />
                      </svg>
                    </button>
                    {openMenuId === job.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full z-20 mt-1 min-w-[148px] overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_4px_16px_rgba(0,0,0,.10)]"
                      >
                        <button
                          onClick={() => { setOpenMenuId(null); navigate(`/jobs/${job.id}`); }}
                          className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-secondary-foreground hover:bg-secondary"
                        >
                          <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1.5 8s2.5-5 6.5-5 6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5z" />
                            <circle cx="8" cy="8" r="1.75" />
                          </svg>
                          View detail
                        </button>
                        <div className="mx-3 h-px bg-border" />
                        <button
                          onClick={() => handleRestore(job)}
                          className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-[#1a6637] hover:bg-[#eefbf3]"
                        >
                          <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 12V4M5 7l3-3 3 3" />
                          </svg>
                          Restore
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="mt-[18px] flex items-center justify-between text-[13px] text-muted-foreground">
          <div>
            Showing{' '}
            <span className="font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground">{firstItem}–{lastItem}</span>
            {' '}of{' '}
            <span className="font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground">{totalElements}</span>
          </div>
          <div className="flex items-center gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg border border-transparent px-2 font-mono text-[12.5px] disabled:cursor-not-allowed disabled:text-[#b3afa3] enabled:cursor-pointer enabled:text-secondary-foreground enabled:hover:border-[#ddd7c7] enabled:hover:bg-card">
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
            </button>
            {pageNumbers().map((p, i) =>
              p === '…' ? (
                <span key={`e-${i}`} className="px-1 text-[#b3afa3]">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('inline-flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-lg border px-2 font-mono text-[12.5px] transition-[background-color,border-color]',
                    p === page ? 'border-foreground bg-foreground text-background' : 'border-transparent text-secondary-foreground hover:border-[#ddd7c7] hover:bg-card')}>
                  {p + 1}
                </button>
              )
            )}
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg border border-transparent px-2 font-mono text-[12.5px] disabled:cursor-not-allowed disabled:text-[#b3afa3] enabled:cursor-pointer enabled:text-secondary-foreground enabled:hover:border-[#ddd7c7] enabled:hover:bg-card">
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5" /></svg>
            </button>
          </div>
        </section>
      )}

    </main>

    {/* Toast stack */}
    {toasts.length > 0 && (
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={cn(
            'flex items-center gap-3 rounded-[12px] border px-4 py-3 text-[13.5px] font-medium shadow-lg',
            toast.type === 'success' ? 'border-[#b7e4c7] bg-[#eefbf3] text-[#1a6637]' : 'border-[#f1cfc6] bg-[#fbeae6] text-[#7a2f27]',
          )}>
            {toast.type === 'success' ? (
              <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5L13 4" /></svg>
            ) : (
              <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6" /><path d="M8 5v3.5M8 11h.01" /></svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    )}
    </>
  );
}
