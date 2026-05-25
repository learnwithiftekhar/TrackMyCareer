import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getDashboardSummary, type DashboardSummary } from '@/api/dashboard';
import { autofillFromUrl, type Job } from '@/api/jobs';

const TODAY = new Date();
const DATE_LABEL = TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const MONTH_LABEL = TODAY.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

type SwatchKey = 'wish' | 'applied' | 'intv' | 'offer' | 'rej';

const SWATCH_COLOR: Record<SwatchKey, string> = {
  wish:    'bg-wish',
  applied: 'bg-applied',
  intv:    'bg-intv',
  offer:   'bg-offer',
  rej:     'bg-rej',
};

const STATUS_SWATCH: Record<string, SwatchKey> = {
  Wishlist:  'wish',
  Applied:   'applied',
  Interview: 'intv',
  Offer:     'offer',
  Rejected:  'rej',
};

const STAT_CONFIG: { label: string; key: string; swatch: SwatchKey }[] = [
  { label: 'Wishlist',  key: 'Wishlist',  swatch: 'wish' },
  { label: 'Applied',   key: 'Applied',   swatch: 'applied' },
  { label: 'Interview', key: 'Interview', swatch: 'intv' },
  { label: 'Offer',     key: 'Offer',     swatch: 'offer' },
  { label: 'Rejected',  key: 'Rejected',  swatch: 'rej' },
];

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

function formatDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function deadlineWhen(deadline: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((parseLocalDate(deadline).getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)}d overdue`;
}

function interviewWhen(interviewDate: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((parseLocalDate(interviewDate).getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  const d = parseLocalDate(interviewDate);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function CompanyAvatar({ companyId, companyName }: { companyId: number; companyName: string }) {
  const { bg, color } = avatarStyle(companyId);
  return (
    <div
      className="grid size-[38px] shrink-0 place-items-center rounded-[9px] border text-[14px] font-semibold tracking-[-0.01em]"
      style={{ background: bg, color, borderColor: bg }}
    >
      {companyName.charAt(0).toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const swatch = STATUS_SWATCH[status] ?? 'applied';
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full border border-border bg-secondary px-2 py-px text-[11.5px] font-medium text-secondary-foreground">
      <span className={cn('size-[5px] shrink-0 rounded-full', SWATCH_COLOR[swatch])} />
      {status}
    </span>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-border bg-card p-[20px_22px_22px]">
      <div className="mb-4 h-3 w-20 animate-pulse rounded bg-secondary" />
      <div className="h-9 w-12 animate-pulse rounded bg-secondary" />
      <div className="mt-2.5 h-3 w-24 animate-pulse rounded bg-secondary" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const [autofilling, setAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showUrlModal) setTimeout(() => urlInputRef.current?.focus(), 50);
    else { setPasteUrl(''); setAutofillError(null); }
  }, [showUrlModal]);

  async function handleAutofill() {
    const url = pasteUrl.trim();
    if (!url) return;
    setAutofilling(true);
    setAutofillError(null);
    try {
      const result = await autofillFromUrl(url);
      setShowUrlModal(false);
      navigate('/jobs/new', { state: { autofill: result, url } });
    } catch {
      setAutofillError('Could not extract job details. Check the URL and try again.');
    } finally {
      setAutofilling(false);
    }
  }

  const totalApps = summary
    ? Object.values(summary.statusCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <>
    <main className="mx-auto max-w-[1180px] px-8 py-[44px] pb-20">

      {/* Page header */}
      <section className="mb-9 flex items-end justify-between gap-6">
        <div>
          <h1 className="mb-1 text-[30px] font-semibold leading-none tracking-[-0.02em] text-foreground">
            Dashboard
          </h1>
          <p className="flex items-center gap-0 text-[14px] text-muted-foreground">
            {DATE_LABEL}
            <span className="mx-2 inline-block size-[3px] rounded-full bg-muted-foreground/40" />
            {loading ? '—' : totalApps} active applications
            <span className="mx-2 inline-block size-[3px] rounded-full bg-muted-foreground/40" />
            {loading ? '—' : summary?.upcomingDeadlines.length ?? 0} deadlines this week
          </p>
        </div>
        <Button variant="outline" className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
          <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
            <path d="M2.5 6.5h11M6 2.5v2M10 2.5v2" />
          </svg>
          {MONTH_LABEL}
        </Button>
      </section>

      {/* Stats row */}
      <section className="mb-10 grid grid-cols-5 gap-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : STAT_CONFIG.map((s) => (
            <div
              key={s.label}
              className="rounded-[14px] border border-border bg-card p-[20px_22px_22px] shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)] transition-colors hover:border-[#ddd7c7]"
            >
              <div className="mb-4 flex items-center gap-2 text-[12.5px] font-medium tracking-[0.005em] text-secondary-foreground">
                <span className={cn('size-[7px] shrink-0 rounded-full', SWATCH_COLOR[s.swatch])} />
                {s.label}
              </div>
              <div className="font-mono text-[34px] font-medium leading-none tracking-[-0.03em] text-foreground">
                {pad(summary?.statusCounts[s.key] ?? 0)}
              </div>
              <div className="mt-2.5 text-[12px] text-muted-foreground">
                applications
              </div>
            </div>
          ))
        }
      </section>

      {/* Two-column grid */}
      <section className="grid grid-cols-2 gap-5">

        {/* Upcoming deadlines */}
        <article className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
          <header className="flex items-center justify-between px-[22px] pb-3 pt-5">
            <div>
              <h2 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.005em] text-foreground">
                <svg className="size-3.5 text-secondary-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3.2L10 10" />
                </svg>
                Upcoming deadlines
              </h2>
              <p className="mt-1 text-[12.5px] text-muted-foreground">Closing in the next 3 days</p>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              View all →
            </Link>
          </header>

          <div className="px-2 pb-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5 rounded-[10px] px-3.5 py-3.5">
                  <div className="size-[38px] animate-pulse rounded-[9px] bg-secondary" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-10 animate-pulse rounded bg-secondary" />
                  </div>
                </div>
              ))
            ) : summary?.upcomingDeadlines.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">No deadlines in the next 3 days.</p>
            ) : (
              (summary?.upcomingDeadlines ?? []).map((job: Job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5 rounded-[10px] px-3.5 py-3.5 no-underline transition-colors hover:bg-secondary [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border"
                >
                  <CompanyAvatar companyId={job.companyId} companyName={job.companyName} />
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium leading-snug text-foreground">{job.jobTitle}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[12.5px] text-muted-foreground">
                      {job.companyName}
                      <span className="text-muted-foreground/40">·</span>
                      <StatusBadge status={job.appliedStatus} />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground">
                      {job.deadline ? deadlineWhen(job.deadline) : '—'}
                    </span>
                    <span className="text-[11.5px] text-muted-foreground">
                      {job.deadline ? formatDate(job.deadline) : ''}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <footer className="flex items-center justify-between border-t border-border px-[22px] py-3 text-[12px] text-muted-foreground">
            <span>Showing {summary?.upcomingDeadlines.length ?? 0} of {summary?.upcomingDeadlines.length ?? 0}</span>
            <span>Sorted by deadline</span>
          </footer>
        </article>

        {/* Upcoming interviews */}
        <article className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
          <header className="flex items-center justify-between px-[22px] pb-3 pt-5">
            <div>
              <h2 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.005em] text-foreground">
                <svg className="size-3.5 text-secondary-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="12" height="11" rx="1.5" />
                  <path d="M2 6.5h12M5.5 2v2M10.5 2v2" />
                </svg>
                Upcoming interviews
              </h2>
              <p className="mt-1 text-[12.5px] text-muted-foreground">Next 7 days</p>
            </div>
            <Link to="/interviews" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              View all →
            </Link>
          </header>

          <div className="px-2 pb-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5 rounded-[10px] px-3.5 py-3.5">
                  <div className="size-[38px] animate-pulse rounded-[9px] bg-secondary" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
                    <div className="h-3 w-10 animate-pulse rounded bg-secondary" />
                  </div>
                </div>
              ))
            ) : summary?.upcomingInterviews.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">No interviews in the next 7 days.</p>
            ) : (
              (summary?.upcomingInterviews ?? []).map((iv) => (
                <Link
                  key={iv.id}
                  to={`/jobs/${iv.jobId}`}
                  className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5 rounded-[10px] px-3.5 py-3.5 no-underline transition-colors hover:bg-secondary [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border"
                >
                  <CompanyAvatar companyId={iv.companyId} companyName={iv.companyName} />
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium leading-snug text-foreground">
                      {iv.roundName} — {iv.companyName}
                    </div>
                    <div className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{iv.jobTitle}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground">
                      {iv.interviewDate ? interviewWhen(iv.interviewDate) : '—'}
                    </span>
                    <span className="text-[11.5px] text-muted-foreground">
                      {iv.interviewDate ? formatDate(iv.interviewDate) : ''}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <footer className="flex items-center justify-between border-t border-border px-[22px] py-3 text-[12px] text-muted-foreground">
            <span>Showing {summary?.upcomingInterviews.length ?? 0}</span>
            <span>Sorted by date</span>
          </footer>
        </article>

      </section>

      {/* Quick add */}
      <section className="mt-6 grid grid-cols-[1fr_auto] items-center gap-5 rounded-[14px] border border-border bg-card px-[22px] py-5 shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
        <div className="flex items-center gap-3.5">
          <div className="grid size-[38px] shrink-0 place-items-center rounded-[10px] bg-accent text-accent-foreground">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-[14.5px] font-semibold text-foreground">Track a new opportunity</h3>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              Paste a job URL or fill in the details manually. Takes about 20 seconds.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowUrlModal(true)} className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 9l2-2a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0" />
              <path d="M9 7l-2 2a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0" />
            </svg>
            Paste URL
          </Button>
          <Link to="/jobs/new">
            <Button className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
              New application
            </Button>
          </Link>
        </div>
      </section>

    </main>

    {/* Paste URL modal */}
    {showUrlModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={() => setShowUrlModal(false)}>
        <div className="mx-4 w-full max-w-[480px] overflow-hidden rounded-[16px] border border-border bg-card shadow-[0_20px_60px_-12px_rgba(0,0,0,.25)]" onClick={e => e.stopPropagation()}>
          <div className="px-6 pt-6 pb-4">
            <h2 className="mb-1 text-[17px] font-semibold tracking-[-0.01em] text-foreground">Paste a job URL</h2>
            <p className="text-[13px] text-muted-foreground">
              We'll extract the title, company, description, and salary automatically.
            </p>
          </div>
          <div className="px-6 pb-2">
            <input
              ref={urlInputRef}
              type="url"
              value={pasteUrl}
              onChange={e => { setPasteUrl(e.target.value); setAutofillError(null); }}
              onKeyDown={e => e.key === 'Enter' && !autofilling && handleAutofill()}
              placeholder="https://linkedin.com/jobs/view/…"
              className="h-[42px] w-full rounded-[10px] border border-[#ddd7c7] bg-background px-3.5 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[#4f46e5] focus:ring-[3px] focus:ring-[#4f46e5]/10"
            />
            {autofillError && (
              <p className="mt-2 text-[12.5px] text-[#94352a]">{autofillError}</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <button onClick={() => setShowUrlModal(false)} className="inline-flex cursor-pointer items-center rounded-[9px] border border-[#ddd7c7] bg-transparent px-4 py-2 text-[13.5px] font-medium text-secondary-foreground transition-colors hover:bg-secondary">
              Cancel
            </button>
            <button
              onClick={handleAutofill}
              disabled={!pasteUrl.trim() || autofilling}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] bg-foreground px-4 py-2 text-[13.5px] font-medium text-background transition-colors hover:bg-[#2d2a26] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {autofilling ? (
                <>
                  <svg className="size-3.5 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a6 6 0 1 0 6 6" strokeLinecap="round" /></svg>
                  Extracting…
                </>
              ) : (
                <>
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 9l2-2a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0" />
                    <path d="M9 7l-2 2a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0" />
                  </svg>
                  Autofill &amp; open form
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
