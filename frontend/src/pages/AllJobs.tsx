import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Status = 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
type DeadlineUrgency = 'urgent' | 'soon' | 'normal';

interface Job {
  id: number;
  title: string;
  location: string;
  company: string;
  avatar: { bg: string; color: string; border?: string; letter: string };
  status: Status;
  appliedDate: string | null;
  deadline: string;
  deadlineWhen: string;
  deadlineUrgency: DeadlineUrgency;
  source: string;
  salary: string;
}

const SWATCH: Record<Status, string> = {
  Wishlist:  'bg-wish',
  Applied:   'bg-applied',
  Interview: 'bg-intv',
  Offer:     'bg-offer',
  Rejected:  'bg-rej',
};

const JOBS: Job[] = [
  { id: 1,  title: 'Senior Software Engineer',  location: 'Remote · US',            company: 'Stripe',    avatar: { bg: '#635bff', color: '#fff', letter: 'S' },                       status: 'Applied',   appliedDate: 'May 02', deadline: 'May 15', deadlineWhen: 'Tomorrow',    deadlineUrgency: 'urgent', source: 'LinkedIn',     salary: '$210–260k' },
  { id: 2,  title: 'Senior Frontend Engineer',   location: 'Remote · Worldwide',     company: 'Linear',    avatar: { bg: '#0d0d0d', color: '#fff', letter: 'L' },                       status: 'Wishlist',  appliedDate: null,     deadline: 'May 16', deadlineWhen: 'In 2 days',   deadlineUrgency: 'soon',   source: 'Company site', salary: '$180–220k' },
  { id: 3,  title: 'Product Designer, Platform', location: 'San Francisco · Hybrid', company: 'Figma',     avatar: { bg: '#fef2ee', color: '#dc4a26', border: '#fbd9cc', letter: 'F' }, status: 'Applied',   appliedDate: 'Apr 28', deadline: 'May 17', deadlineWhen: 'In 3 days',   deadlineUrgency: 'soon',   source: 'Referral',     salary: '$170–210k' },
  { id: 4,  title: 'Staff Engineer, Edge',       location: 'Remote · US',            company: 'Vercel',    avatar: { bg: '#0d0d0d', color: '#fff', letter: 'V' },                       status: 'Interview', appliedDate: 'Apr 22', deadline: 'May 20', deadlineWhen: 'In 6 days',   deadlineUrgency: 'normal', source: 'LinkedIn',     salary: '$240–300k' },
  { id: 5,  title: 'Product Engineer',           location: 'San Francisco',          company: 'Anthropic', avatar: { bg: '#f5f3ee', color: '#c96442', border: '#ece6d8', letter: 'A' }, status: 'Interview', appliedDate: 'Apr 15', deadline: 'May 22', deadlineWhen: 'In 8 days',   deadlineUrgency: 'normal', source: 'Referral',     salary: '$220–280k' },
  { id: 6,  title: 'Senior Product Designer',    location: 'New York · Hybrid',      company: 'Notion',    avatar: { bg: '#fff', color: '#1a1a1a', border: '#e5e5e5', letter: 'N' },    status: 'Interview', appliedDate: 'Apr 18', deadline: 'May 24', deadlineWhen: 'In 10 days',  deadlineUrgency: 'normal', source: 'LinkedIn',     salary: '$190–230k' },
  { id: 7,  title: 'Backend Engineer, Payments', location: 'New York',               company: 'Ramp',      avatar: { bg: '#eef9f1', color: '#1e7a4a', border: '#cfead8', letter: 'R' }, status: 'Applied',   appliedDate: 'May 05', deadline: 'May 28', deadlineWhen: 'In 14 days',  deadlineUrgency: 'normal', source: 'Indeed',       salary: '$200–250k' },
  { id: 8,  title: 'Senior Fullstack Engineer',  location: 'Remote · US',            company: 'Retool',    avatar: { bg: '#f1eefd', color: '#5b3fcc', border: '#dfd6f7', letter: 'R' }, status: 'Wishlist',  appliedDate: null,     deadline: 'Jun 01',  deadlineWhen: 'In 18 days',  deadlineUrgency: 'normal', source: 'Company site', salary: '$190–240k' },
  { id: 9,  title: 'Solutions Engineer',         location: 'Remote · US',            company: 'Datadog',   avatar: { bg: '#6f3bcc', color: '#fff', letter: 'D' },                       status: 'Rejected',  appliedDate: 'Apr 02', deadline: 'Jun 03',  deadlineWhen: 'In 20 days',  deadlineUrgency: 'normal', source: 'LinkedIn',     salary: '$160–200k' },
  { id: 10, title: 'Senior Designer, Growth',    location: 'San Francisco · Hybrid', company: 'Airtable',  avatar: { bg: '#fff7e6', color: '#b88416', border: '#f0e4c5', letter: 'A' }, status: 'Offer',     appliedDate: 'Mar 28', deadline: 'Jun 05',  deadlineWhen: 'In 22 days',  deadlineUrgency: 'normal', source: 'Referral',     salary: '$180–225k' },
];

const STATUS_COUNTS: Record<string, number> = {
  All: 52, Wishlist: 12, Applied: 24, Interview: 6, Offer: 2, Rejected: 8,
};

const FILTERS: { key: string; swatch?: string }[] = [
  { key: 'All' },
  { key: 'Wishlist',  swatch: 'bg-wish' },
  { key: 'Applied',   swatch: 'bg-applied' },
  { key: 'Interview', swatch: 'bg-intv' },
  { key: 'Offer',     swatch: 'bg-offer' },
  { key: 'Rejected',  swatch: 'bg-rej' },
];

// Shared cell base: matches .th, .td { padding: 14px 16px; display: flex; align-items: center; min-width: 0; }
const CELL = 'flex min-w-0 items-center px-4 py-[14px]';

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-[9px] py-[3px] text-[12px] font-medium leading-[1.4] text-secondary-foreground">
      <span className={cn('size-[6px] shrink-0 rounded-full', SWATCH[status])} />
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

const GRID_COLS = 'minmax(260px,1.4fr) minmax(160px,1fr) 120px 110px 130px 120px 130px 44px';

export default function AllJobs() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = JOBS.filter((j) => {
    const matchesStatus = activeFilter === 'All' || j.status === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="mx-auto max-w-[1180px] px-8 py-11 pb-20">

      {/* Page header */}
      <section className="mb-7 flex items-end justify-between gap-6">
        <div>
          <h1 className="mb-1 text-[30px] font-semibold leading-none tracking-[-0.02em] text-foreground">
            All Jobs
          </h1>
          <p className="text-[14px] text-muted-foreground">
            <strong className="font-medium text-secondary-foreground">52</strong> applications tracked
            &nbsp;·&nbsp;Sorted by deadline, soonest first
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h10M5 8h6M7 12h2" />
            </svg>
            Sort: Deadline ↑
          </Button>
          <Button variant="outline" className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h10M3 8h10M3 12h6" /><circle cx="13" cy="12" r="1.25" fill="currentColor" />
            </svg>
            Columns
          </Button>
          <Button variant="outline" className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v8M5 8l3 3 3-3M3 13h10" />
            </svg>
            Export
          </Button>
        </div>
      </section>

      {/* Toolbar */}
      <section className="mb-3.5 flex flex-wrap items-center gap-2.5">
        {/* Search */}
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

        {/* Divider */}
        <div className="mx-1 h-[22px] w-px bg-[#ddd7c7]" />

        {/* Status filters */}
        {FILTERS.map(({ key, swatch }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[13px] font-medium transition-colors',
                isActive
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-[#ddd7c7] bg-card text-secondary-foreground hover:bg-secondary',
              )}
            >
              {swatch && (
                <span className={cn(
                  'size-[7px] shrink-0 rounded-full',
                  swatch,
                  isActive && 'shadow-[0_0_0_2px_rgba(255,255,255,.15)]',
                )} />
              )}
              {key}
              <span className={cn(
                'ml-0.5 rounded-[6px] px-1.5 py-px font-mono text-[11.5px]',
                isActive ? 'bg-white/10 text-white/80' : 'bg-background text-muted-foreground',
              )}>
                {STATUS_COUNTS[key]}
              </span>
            </button>
          );
        })}
      </section>

      {/* Table card */}
      <section
        className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]"
      >
        <div className="grid" style={{ gridTemplateColumns: GRID_COLS }}>

          {/* ── Header ── */}
          {/* Role */}
          <div className={cn(CELL, 'border-b border-border bg-secondary text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground')}>
            Role
          </div>
          {/* Company */}
          <div className={cn(CELL, 'border-b border-border bg-secondary text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground')}>
            Company
          </div>
          {/* Status */}
          <div className={cn(CELL, 'border-b border-border bg-secondary text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground')}>
            Status
          </div>
          {/* Applied */}
          <div className={cn(CELL, 'border-b border-border bg-secondary text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground')}>
            Applied
          </div>
          {/* Deadline — sorted */}
          <div className={cn(CELL, 'gap-[5px] cursor-pointer border-b border-border bg-secondary text-[11.5px] font-medium uppercase tracking-[0.06em] text-foreground hover:text-secondary-foreground')}>
            Deadline
            <span className="font-mono text-[#4f46e5] normal-case tracking-normal">↑</span>
          </div>
          {/* Source */}
          <div className={cn(CELL, 'border-b border-border bg-secondary text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground')}>
            Source
          </div>
          {/* Salary */}
          <div className={cn(CELL, 'border-b border-border bg-secondary text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground')}>
            Salary
          </div>
          {/* Actions (empty) */}
          <div className={cn(CELL, 'border-b border-border bg-secondary')} />

          {/* ── Rows ── */}
          {filtered.map((job) => (
            <div key={job.id} className="contents job-row">

              {/* Role */}
              <div className={cn(CELL, 'gap-3 border-b border-border')}>
                <div
                  className="grid size-[34px] shrink-0 place-items-center rounded-[9px] border text-[13px] font-semibold tracking-[-0.01em]"
                  style={{ background: job.avatar.bg, color: job.avatar.color, borderColor: job.avatar.border ?? job.avatar.bg }}
                >
                  {job.avatar.letter}
                </div>
                <div className="min-w-0">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="block truncate text-[14px] font-medium leading-[1.3] text-foreground no-underline hover:text-indigo"
                  >
                    {job.title}
                  </Link>
                  <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{job.location}</div>
                </div>
              </div>

              {/* Company */}
              <div className={cn(CELL, 'border-b border-border')}>
                <span className="truncate text-[13.5px] text-secondary-foreground">{job.company}</span>
              </div>

              {/* Status */}
              <div className={cn(CELL, 'border-b border-border')}>
                <StatusBadge status={job.status} />
              </div>

              {/* Applied */}
              <div className={cn(
                CELL,
                'border-b border-border font-mono text-[12.5px] tracking-[-0.01em]',
                job.appliedDate ? 'text-secondary-foreground' : 'text-muted-foreground',
              )}>
                {job.appliedDate ?? '—'}
              </div>

              {/* Deadline */}
              <div className={cn(CELL, 'border-b border-border')}>
                <div className="flex flex-col items-start gap-0.5">
                  <DeadlineBadge date={job.deadline} urgency={job.deadlineUrgency} />
                  <span className="text-[11px] text-muted-foreground">{job.deadlineWhen}</span>
                </div>
              </div>

              {/* Source */}
              <div className={cn(CELL, 'border-b border-border')}>
                <span className="rounded-[6px] border border-border bg-background px-2 py-[2px] text-[11.5px] text-muted-foreground">
                  {job.source}
                </span>
              </div>

              {/* Salary */}
              <div className={cn(CELL, 'border-b border-border font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground')}>
                {job.salary}
              </div>

              {/* Actions */}
              <div className={cn(CELL, 'justify-center border-b border-border')}>
                <button className="inline-flex cursor-pointer rounded-[6px] p-[6px] text-[#b3afa3] transition-colors hover:bg-background hover:text-secondary-foreground">
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="3" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="13" cy="8" r="1.3" />
                  </svg>
                </button>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* Pagination */}
      <section className="mt-[18px] flex items-center justify-between text-[13px] text-muted-foreground">
        <div>
          Showing{' '}
          <span className="font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground">1–10</span>
          {' '}of{' '}
          <span className="font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground">52</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled
            className="inline-flex h-8 min-w-[32px] cursor-not-allowed items-center justify-center rounded-lg border border-transparent px-2 font-mono text-[12.5px] text-[#b3afa3]"
          >
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>

          {[1, 2, 3, 4].map((p) => (
            <button
              key={p}
              className={cn(
                'inline-flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-lg border px-2 font-mono text-[12.5px] transition-[background-color,border-color]',
                p === 1
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-transparent text-secondary-foreground hover:border-[#ddd7c7] hover:bg-card',
              )}
            >
              {p}
            </button>
          ))}

          <span className="px-1 text-[#b3afa3]">…</span>

          <button className="inline-flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-lg border border-transparent px-2 font-mono text-[12.5px] text-secondary-foreground transition-[background-color,border-color] hover:border-[#ddd7c7] hover:bg-card">
            6
          </button>

          <button className="inline-flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-lg border border-transparent px-2 font-mono text-[12.5px] text-secondary-foreground transition-[background-color,border-color] hover:border-[#ddd7c7] hover:bg-card">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </div>
      </section>

    </main>
  );
}
