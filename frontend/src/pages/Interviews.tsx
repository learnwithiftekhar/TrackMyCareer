import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getInterviews, type Interview } from '@/api/interviews';

type ViewTab = 'Upcoming' | 'Past' | 'All';

interface DayGroup {
  key: string;
  label: string;
  date: string;
  isToday?: boolean;
  isPast?: boolean;
  interviews: Interview[];
}

function toLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(iso: string): string {
  return toLocalDate(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupLabel(iso: string, today: Date): { label: string; isToday: boolean } {
  const d = toLocalDate(iso);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return { label: 'Today', isToday: true };
  if (diff === 1) return { label: 'Tomorrow', isToday: false };
  return { label: formatDate(iso), isToday: false };
}

function companyInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/* Deterministic hue from company name */
function companyColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 42%)`;
}

export default function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ViewTab>('Upcoming');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getInterviews()
      .then(setInterviews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { upcoming, past, noDate } = useMemo(() => {
    const upcoming: Interview[] = [];
    const past: Interview[] = [];
    const noDate: Interview[] = [];
    for (const iv of interviews) {
      if (!iv.interviewDate) { noDate.push(iv); continue; }
      const d = toLocalDate(iv.interviewDate);
      if (d >= today) upcoming.push(iv); else past.push(iv);
    }
    past.sort((a, b) => (b.interviewDate ?? '').localeCompare(a.interviewDate ?? ''));
    return { upcoming, past, noDate };
  }, [interviews, today]);

  const nextUpcoming: Interview | null = upcoming[0] ?? null;

  const groups = useMemo((): DayGroup[] => {
    const pool =
      tab === 'Upcoming' ? [...upcoming, ...noDate] :
      tab === 'Past'     ? past :
                           [...upcoming, ...noDate, ...past];

    const filtered = pool.filter((iv) => {
      const q = search.toLowerCase();
      return !q || iv.roundName.toLowerCase().includes(q) || iv.companyName.toLowerCase().includes(q) || iv.jobTitle.toLowerCase().includes(q);
    });

    const map = new Map<string, DayGroup>();
    for (const iv of filtered) {
      const key = iv.interviewDate ?? '__no_date__';
      if (!map.has(key)) {
        if (!iv.interviewDate) {
          map.set(key, { key, label: 'No date set', date: '', interviews: [] });
        } else {
          const isPast = toLocalDate(iv.interviewDate) < today;
          const { label, isToday } = groupLabel(iv.interviewDate, today);
          map.set(key, { key, label, date: formatDate(iv.interviewDate), isToday, isPast, interviews: [] });
        }
      }
      map.get(key)!.interviews.push(iv);
    }
    return [...map.values()];
  }, [tab, search, upcoming, past, noDate, today]);

  return (
    <main className="mx-auto max-w-[1180px] px-8 py-11 pb-20">

      {/* Page header */}
      <section className="mb-7 flex items-end justify-between gap-6">
        <div>
          <h1 className="mb-1 text-[30px] font-semibold leading-none tracking-[-0.02em] text-foreground">
            Interviews
          </h1>
          <p className="text-[14px] text-muted-foreground">
            <strong className="font-medium text-secondary-foreground">{upcoming.length}</strong> upcoming
            &nbsp;·&nbsp;
            <strong className="font-medium text-secondary-foreground">{past.length}</strong> completed all-time
          </p>
        </div>
        <Link
          to="/interviews/new"
          className="inline-flex cursor-pointer items-center gap-[7px] rounded-[9px] border border-[#ddd7c7] bg-transparent px-[14px] py-2 text-[13.5px] font-medium text-secondary-foreground no-underline transition-colors hover:bg-card hover:text-foreground"
        >
          <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Schedule interview
        </Link>
      </section>

      {/* Up next callout */}
      {nextUpcoming && (
        <section className="relative mb-9 overflow-hidden rounded-[14px] border border-border bg-card p-[22px_24px] shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
          <div className="absolute bottom-0 left-0 top-0 w-0.75 bg-intv" />
          <div className="flex items-center gap-6">
            {/* Date block */}
            <div className="min-w-[110px] border-r border-border pr-6 text-center">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-intv">Up next</div>
              {nextUpcoming.interviewDate ? (
                <div className="font-mono text-[22px] font-medium leading-none tracking-[-0.04em] text-foreground">
                  {formatDate(nextUpcoming.interviewDate)}
                </div>
              ) : (
                <div className="text-[13px] text-muted-foreground">No date set</div>
              )}
            </div>
            {/* Body */}
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2 text-[12.5px] text-muted-foreground">
                <span
                  className="grid size-4 place-items-center rounded-full text-[9px] font-semibold text-white"
                  style={{ background: companyColor(nextUpcoming.companyName) }}
                >
                  {companyInitial(nextUpcoming.companyName)}
                </span>
                <strong className="font-medium text-secondary-foreground">{nextUpcoming.companyName}</strong>
                <span className="text-muted-foreground/40">·</span>
                <span>{nextUpcoming.jobTitle}</span>
              </div>
              <h3 className="text-[18px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground">
                {nextUpcoming.roundName}
              </h3>
              {nextUpcoming.notes && (
                <p className="mt-1 text-[13px] text-muted-foreground line-clamp-1">{nextUpcoming.notes}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Toolbar */}
      <section className="mb-6 flex flex-wrap items-center gap-2.5">
        <div className="flex gap-0.5 rounded-[10px] border border-[#ddd7c7] bg-card p-[3px]">
          {(['Upcoming', 'Past', 'All'] as ViewTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] px-3.5 py-[6px] text-[13px] font-medium transition-colors',
                tab === t ? 'bg-background text-foreground' : 'bg-transparent text-muted-foreground hover:text-secondary-foreground',
              )}
            >
              {t}
              <span className={cn(
                'rounded-[5px] px-[5px] py-px font-mono text-[11px]',
                tab === t ? 'bg-card text-secondary-foreground' : 'bg-background text-muted-foreground',
              )}>
                {t === 'Upcoming' ? upcoming.length + noDate.length : t === 'Past' ? past.length : interviews.length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px] max-w-xs flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13.5 13.5" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search interviews…"
            className="h-[38px] w-full rounded-[10px] border border-[#ddd7c7] bg-card pl-9 pr-4 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-indigo focus:ring-[3px] focus:ring-indigo/10"
          />
        </div>
      </section>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : groups.length === 0 ? (
        <EmptyState query={search} />
      ) : (
        groups.map((group) => <DaySection key={group.key} group={group} />)
      )}

    </main>
  );
}

/* ── Day section ── */

function DaySection({ group }: { group: DayGroup }) {
  return (
    <section className="mb-7">
      <header className="mb-3 flex items-baseline gap-3 px-1">
        <span className={cn(
          'text-[11.5px] font-semibold uppercase tracking-[0.08em]',
          group.isToday ? 'text-intv' : 'text-muted-foreground',
        )}>
          {group.label}
        </span>
        {group.date && group.date !== group.label && (
          <span className="text-[13px] font-medium text-foreground">{group.date}</span>
        )}
        <span className="ml-auto font-mono text-[12px] text-muted-foreground">
          {group.interviews.length} {group.interviews.length === 1 ? 'interview' : 'interviews'}
        </span>
      </header>

      <div className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
        {group.interviews.map((iv) => (
          <InterviewRow key={iv.id} iv={iv} isPast={!!group.isPast} />
        ))}
      </div>
    </section>
  );
}

/* ── Interview row ── */

function InterviewRow({ iv, isPast }: { iv: Interview; isPast: boolean }) {
  const color = companyColor(iv.companyName);
  return (
    <div className={cn(
      'grid cursor-default items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-[#fbfaf6]',
    )} style={{ gridTemplateColumns: '36px 1fr auto' }}>

      {/* Avatar */}
      <div
        className={cn('grid size-9 shrink-0 place-items-center rounded-[9px] text-[13px] font-semibold tracking-[-0.01em] text-white', isPast && 'opacity-60')}
        style={{ background: color }}
      >
        {companyInitial(iv.companyName)}
      </div>

      {/* Main */}
      <div className="min-w-0">
        <div className={cn('mb-1 text-[14.5px] font-medium leading-[1.3]', isPast ? 'text-muted-foreground' : 'text-foreground')}>
          {iv.roundName}
        </div>
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <span className="font-medium text-secondary-foreground">{iv.companyName}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="truncate">{iv.jobTitle}</span>
        </div>
        {iv.notes && (
          <p className="mt-1 text-[12px] text-muted-foreground line-clamp-1">{iv.notes}</p>
        )}
      </div>

      {/* Date */}
      <div className="shrink-0 text-right">
        {iv.interviewDate ? (
          <span className={cn('font-mono text-[13px]', isPast ? 'text-muted-foreground' : 'text-foreground')}>
            {formatDate(iv.interviewDate)}
          </span>
        ) : (
          <span className="rounded-full border border-border bg-secondary px-[9px] py-[3px] text-[11.5px] text-muted-foreground">
            No date
          </span>
        )}
      </div>

    </div>
  );
}

/* ── Loading skeleton ── */

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-[14px] bg-card border border-border" />
      ))}
    </div>
  );
}

/* ── Error state ── */

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-border bg-card py-16 text-center">
      <p className="text-[14px] font-medium text-foreground">Failed to load interviews</p>
      <p className="text-[13px] text-muted-foreground">{message}</p>
    </div>
  );
}

/* ── Empty state ── */

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-border bg-card py-16 text-center">
      <div className="grid size-10 place-items-center rounded-[10px] bg-background text-muted-foreground">
        <svg className="size-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
          <path d="M2.5 6.5h11M6 2v2M10 2v2" />
        </svg>
      </div>
      <div>
        <p className="text-[14px] font-medium text-foreground">
          {query ? `No interviews matching "${query}"` : 'No interviews yet'}
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {query ? 'Try a different search term.' : 'Schedule your first interview to get started.'}
        </p>
      </div>
      {!query && (
        <Link
          to="/interviews/new"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] bg-foreground px-4 py-2 text-[13.5px] font-medium text-background no-underline transition-colors hover:bg-[#2d2a26]"
        >
          <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Schedule interview
        </Link>
      )}
    </div>
  );
}
