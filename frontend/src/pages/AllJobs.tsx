import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getJobs, getStatusCounts, getArchivedCount, deleteJob, type Job, type StatusCounts } from '@/api/jobs';

type DeadlineUrgency = 'urgent' | 'soon' | 'normal';
type SortField = 'deadline' | 'createdAt';
type SortDir = 'asc' | 'desc';

const SWATCH: Record<string, string> = {
  Wishlist:  'bg-wish',
  Applied:   'bg-applied',
  Interview: 'bg-intv',
  Offer:     'bg-offer',
  Rejected:  'bg-rej',
};

const FILTERS = [
  { key: 'All' },
  { key: 'Wishlist',  swatch: 'bg-wish' },
  { key: 'Applied',   swatch: 'bg-applied' },
  { key: 'Interview', swatch: 'bg-intv' },
  { key: 'Offer',     swatch: 'bg-offer' },
  { key: 'Rejected',  swatch: 'bg-rej' },
];

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
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCreatedAt(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function deadlineUrgency(deadline: string | null): DeadlineUrgency {
  if (!deadline) return 'normal';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((parseLocalDate(deadline).getTime() - today.getTime()) / 86_400_000);
  if (days <= 1) return 'urgent';
  if (days <= 3) return 'soon';
  return 'normal';
}

function deadlineWhen(deadline: string | null): string {
  if (!deadline) return '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((parseLocalDate(deadline).getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-[9px] py-[3px] text-[12px] font-medium leading-[1.4] text-secondary-foreground">
      <span className={cn('size-[6px] shrink-0 rounded-full', SWATCH[status] ?? 'bg-muted')} />
      {status}
    </span>
  );
}

function DeadlineBadge({ date, urgency }: { date: string; urgency: DeadlineUrgency }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-[9px] py-[3px] text-[12px] font-medium leading-[1.4]',
      urgency === 'urgent' && 'border-[#f1cfc6] bg-[#fbeae6] text-[#94352a]',
      urgency === 'soon'   && 'border-[#f6e0cf] bg-[#fef3ec] text-[#8a4a1c]',
      urgency === 'normal' && 'border-border bg-secondary text-secondary-foreground',
    )}>
      {date}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
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

export default function AllJobs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyIdParam = searchParams.get('companyId');
  const companyNameParam = searchParams.get('companyName');
  const companyIdFilter = companyIdParam ? Number(companyIdParam) : undefined;

  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>('deadline');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [archivedCount, setArchivedCount] = useState<number>(0);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch status counts and archived count once
  useEffect(() => {
    getStatusCounts().then(setStatusCounts).catch(() => {});
    getArchivedCount().then(setArchivedCount).catch(() => {});
  }, []);

  // Reset page when company filter changes
  useEffect(() => {
    setPage(0);
  }, [companyIdFilter]);

  // Fetch jobs on page/filter/search/sort/company change
  useEffect(() => {
    setLoading(true);
    getJobs({
      page,
      size: 10,
      search: debouncedSearch || undefined,
      status: activeFilter === 'All' ? undefined : activeFilter,
      sortBy,
      sortDir,
      companyId: companyIdFilter,
    })
      .then((data) => {
        setJobs(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, activeFilter, sortBy, sortDir, companyIdFilter]);

  function handleFilterChange(filter: string) {
    setActiveFilter(filter);
    setPage(0);
  }

  function clearCompanyFilter() {
    setSearchParams({});
    setPage(0);
  }

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'createdAt' ? 'desc' : 'asc');
    }
    setPage(0);
  }

  const SORT_LABELS: Record<SortField, string> = {
    deadline: 'Deadline',
    createdAt: 'Entry Date',
  };

  // Close kebab menu on outside click
  useEffect(() => {
    if (openMenuId === null) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this job application? This cannot be undone.')) return;
    await deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setTotalElements((n) => n - 1);
    setOpenMenuId(null);
  }

  const totalAll = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  function getCount(key: string): number {
    if (key === 'All') return totalAll;
    return statusCounts[key] ?? 0;
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
    <main className="mx-auto max-w-[1180px] px-8 py-11 pb-20">

      {/* Page header */}
      <section className="mb-7 flex items-end justify-between gap-6">
        <div>
          <h1 className="mb-1 text-[30px] font-semibold leading-none tracking-[-0.02em] text-foreground">
            All Jobs
          </h1>
          <p className="text-[14px] text-muted-foreground">
            <strong className="font-medium text-secondary-foreground">{totalElements}</strong> applications tracked
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

      {/* Toolbar */}
      <section className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[280px] max-w-[420px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60"
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13.5 13.5" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company…"
            className="h-[38px] w-full rounded-[10px] border border-[#ddd7c7] bg-card pl-9 pr-4 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[#4f46e5] focus:ring-[3px] focus:ring-[#4f46e5]/10"
          />
        </div>

        <div className="mx-1 h-[22px] w-px bg-[#ddd7c7]" />

        {FILTERS.map(({ key, swatch }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[13px] font-medium transition-colors',
                isActive
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-[#ddd7c7] bg-card text-secondary-foreground hover:bg-secondary',
              )}
            >
              {swatch && (
                <span className={cn(
                  'size-[7px] shrink-0 rounded-full', swatch,
                  isActive && 'shadow-[0_0_0_2px_rgba(255,255,255,.15)]',
                )} />
              )}
              {key}
              <span className={cn(
                'ml-0.5 rounded-[6px] px-1.5 py-px font-mono text-[11.5px]',
                isActive ? 'bg-white/10 text-white/80' : 'bg-background text-muted-foreground',
              )}>
                {getCount(key)}
              </span>
            </button>
          );
        })}
      </section>

      {/* Company filter banner */}
      {companyIdFilter != null && companyNameParam && (
        <section className="mb-3.5 flex items-center gap-2.5 rounded-[10px] border border-[#ddd7c7] bg-card px-4 py-2.5">
          <svg className="size-3.5 shrink-0 text-muted-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M5 8h6M7 12h2" />
          </svg>
          <span className="text-[13px] text-secondary-foreground">
            Filtered by company: <strong className="font-semibold text-foreground">{companyNameParam}</strong>
          </span>
          <button
            onClick={clearCompanyFilter}
            className="ml-auto inline-flex items-center gap-1 rounded-[7px] border border-[#ddd7c7] bg-background px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:border-[#c0bbb0] hover:text-foreground"
          >
            <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
            Clear filter
          </button>
        </section>
      )}

      {/* Table card */}
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
              No jobs found.
            </div>
          ) : (
            jobs.map((job) => {
              const av = avatarStyle(job.companyId);
              const letter = job.companyName.charAt(0).toUpperCase();
              const urgency = deadlineUrgency(job.deadline);
              const when = deadlineWhen(job.deadline);

              return (
                <div key={job.id} className="contents">

                  {/* Role */}
                  <div className={cn(CELL, 'gap-3 border-b border-border')}>
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

                  {/* Company */}
                  <div className={cn(CELL, 'border-b border-border')}>
                    <span className="truncate text-[13.5px] text-secondary-foreground">{job.companyName}</span>
                  </div>

                  {/* Status */}
                  <div className={cn(CELL, 'border-b border-border')}>
                    <StatusBadge status={job.appliedStatus} />
                  </div>

                  {/* Applied */}
                  <div className={cn(
                    CELL, 'border-b border-border font-mono text-[12.5px] tracking-[-0.01em]',
                    job.appliedDate ? 'text-secondary-foreground' : 'text-muted-foreground',
                  )}>
                    {formatDate(job.appliedDate)}
                  </div>

                  {/* Deadline */}
                  <div className={cn(CELL, 'border-b border-border')}>
                    {job.deadline ? (
                      <div className="flex flex-col items-start gap-0.5">
                        <DeadlineBadge date={formatDate(job.deadline)} urgency={urgency} />
                        {when && <span className="text-[11px] text-muted-foreground">{when}</span>}
                      </div>
                    ) : (
                      <span className="text-[12.5px] text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Source */}
                  <div className={cn(CELL, 'border-b border-border')}>
                    {job.jobSource ? (
                      <span className="rounded-[6px] border border-border bg-background px-2 py-[2px] text-[11.5px] text-muted-foreground">
                        {job.jobSource}
                      </span>
                    ) : (
                      <span className="text-[12.5px] text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Salary */}
                  <div className={cn(
                    CELL, 'border-b border-border font-mono text-[12.5px] tracking-[-0.01em]',
                    job.salaryRange ? 'text-secondary-foreground' : 'text-muted-foreground',
                  )}>
                    {job.salaryRange ?? '—'}
                  </div>

                  {/* Entry Date */}
                  <div className={cn(CELL, 'border-b border-border font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground')}>
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
                          onClick={() => handleDelete(job.id)}
                          className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-red-600 hover:bg-red-50"
                        >
                          <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 4.5h11M6 4.5V3h4v1.5M6.5 11V7M9.5 11V7M3.5 4.5l.75 8.25a.75.75 0 0 0 .75.75h6a.75.75 0 0 0 .75-.75l.75-8.25" />
                          </svg>
                          Delete
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
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg border border-transparent px-2 font-mono text-[12.5px] disabled:cursor-not-allowed disabled:text-[#b3afa3] enabled:cursor-pointer enabled:text-secondary-foreground enabled:hover:border-[#ddd7c7] enabled:hover:bg-card"
            >
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>

            {pageNumbers().map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-[#b3afa3]">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'inline-flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-lg border px-2 font-mono text-[12.5px] transition-[background-color,border-color]',
                    p === page
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-transparent text-secondary-foreground hover:border-[#ddd7c7] hover:bg-card',
                  )}
                >
                  {p + 1}
                </button>
              )
            )}

            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg border border-transparent px-2 font-mono text-[12.5px] disabled:cursor-not-allowed disabled:text-[#b3afa3] enabled:cursor-pointer enabled:text-secondary-foreground enabled:hover:border-[#ddd7c7] enabled:hover:bg-card"
            >
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </div>
        </section>
      )}

      {/* Archived link */}
      {archivedCount > 0 && (
        <div className="mt-6 flex justify-center">
          <Link
            to="/jobs/archived"
            className="inline-flex items-center gap-2 rounded-[9px] border border-[#ddd7c7] bg-card px-4 py-2 text-[13px] text-muted-foreground no-underline transition-colors hover:border-[#c0bbb0] hover:text-secondary-foreground"
          >
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5h12v1.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zM6 8.5v4M10 8.5v4" />
              <path d="M1 5l1.5-2.5h11L15 5" />
            </svg>
            View {archivedCount} archived {archivedCount === 1 ? 'application' : 'applications'}
          </Link>
        </div>
      )}

    </main>
  );
}
