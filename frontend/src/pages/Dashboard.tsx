import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const STATS: { label: string; count: number; delta: string; swatch: SwatchKey }[] = [
  { label: 'Wishlist',  count: 12, delta: '+3', swatch: 'wish' },
  { label: 'Applied',   count: 24, delta: '+5', swatch: 'applied' },
  { label: 'Interview', count: 6,  delta: '+2', swatch: 'intv' },
  { label: 'Offer',     count: 2,  delta: '+1', swatch: 'offer' },
  { label: 'Rejected',  count: 8,  delta: '—',  swatch: 'rej' },
];

interface AvatarStyle { bg: string; color: string; border?: string; letter: string }

interface DeadlineRow {
  avatar: AvatarStyle;
  jobTitle: string;
  company: string;
  status: string;
  statusSwatch: SwatchKey;
  when: string;
  date: string;
}

interface InterviewRow {
  avatar: AvatarStyle;
  roundName: string;
  jobTitle: string;
  duration: string;
  when: string;
  time: string;
}

const DEADLINES: DeadlineRow[] = [
  { avatar: { bg: '#635bff', color: '#fff', letter: 'S' }, jobTitle: 'Senior Software Engineer', company: 'Stripe', status: 'Applied', statusSwatch: 'applied', when: 'Tomorrow', date: 'May 15' },
  { avatar: { bg: '#0d0d0d', color: '#fff', letter: 'L' }, jobTitle: 'Senior Frontend Engineer', company: 'Linear', status: 'Wishlist', statusSwatch: 'wish', when: 'In 2 days', date: 'May 16' },
  { avatar: { bg: '#fef2ee', color: '#dc4a26', border: '#fbd9cc', letter: 'F' }, jobTitle: 'Product Designer, Platform', company: 'Figma', status: 'Applied', statusSwatch: 'applied', when: 'In 3 days', date: 'May 17' },
];

const INTERVIEWS: InterviewRow[] = [
  { avatar: { bg: '#635bff', color: '#fff', letter: 'S' }, roundName: 'Technical Round 2 — Stripe', jobTitle: 'Senior Software Engineer', duration: '60 min', when: 'Tomorrow', time: '10:00 AM' },
  { avatar: { bg: '#0d0d0d', color: '#fff', letter: 'V' }, roundName: 'Phone Screen — Vercel', jobTitle: 'Staff Engineer, Edge', duration: '30 min', when: 'Fri, May 16', time: '2:30 PM' },
  { avatar: { bg: '#f5f3ee', color: '#c96442', border: '#ece6d8', letter: 'A' }, roundName: 'Final Round — Anthropic', jobTitle: 'Product Engineer', duration: '4 sessions', when: 'Mon, May 18', time: '11:00 AM' },
  { avatar: { bg: '#fff', color: '#1a1a1a', border: '#e5e5e5', letter: 'N' }, roundName: 'Hiring Manager — Notion', jobTitle: 'Senior Product Designer', duration: '45 min', when: 'Wed, May 20', time: '9:30 AM' },
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function CompanyAvatar({ av }: { av: AvatarStyle }) {
  return (
    <div
      className="grid size-[38px] shrink-0 place-items-center rounded-[9px] border text-[14px] font-semibold tracking-[-0.01em]"
      style={{ background: av.bg, color: av.color, borderColor: av.border ?? av.bg }}
    >
      {av.letter}
    </div>
  );
}

function StatusBadge({ status, swatch }: { status: string; swatch: SwatchKey }) {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full border border-border bg-secondary px-2 py-px text-[11.5px] font-medium text-secondary-foreground">
      <span className={cn('size-[5px] shrink-0 rounded-full', SWATCH_COLOR[swatch])} />
      {status}
    </span>
  );
}

export default function Dashboard() {
  return (
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
            52 active applications
            <span className="mx-2 inline-block size-[3px] rounded-full bg-muted-foreground/40" />
            3 deadlines this week
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
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] border border-border bg-card p-[20px_22px_22px] shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)] transition-colors hover:border-[#ddd7c7]"
          >
            <div className="mb-4 flex items-center gap-2 text-[12.5px] font-medium tracking-[0.005em] text-secondary-foreground">
              <span className={cn('size-[7px] shrink-0 rounded-full', SWATCH_COLOR[s.swatch])} />
              {s.label}
            </div>
            <div className="font-mono text-[34px] font-medium leading-none tracking-[-0.03em] text-foreground">
              {pad(s.count)}
            </div>
            <div className="mt-2.5 text-[12px] text-muted-foreground">
              <strong className="font-medium text-secondary-foreground">{s.delta}</strong> this week
            </div>
          </div>
        ))}
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
            <a href="#" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              View all →
            </a>
          </header>

          <div className="px-2 pb-3">
            {DEADLINES.map((d, i) => (
              <div
                key={i}
                className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5 rounded-[10px] px-3.5 py-3.5 transition-colors hover:bg-secondary [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border"
              >
                <CompanyAvatar av={d.avatar} />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium leading-snug text-foreground">{d.jobTitle}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    {d.company}
                    <span className="text-muted-foreground/40">·</span>
                    <StatusBadge status={d.status} swatch={d.statusSwatch} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground">{d.when}</span>
                  <span className="text-[11.5px] text-muted-foreground">{d.date}</span>
                </div>
              </div>
            ))}
          </div>

          <footer className="flex items-center justify-between border-t border-border px-[22px] py-3 text-[12px] text-muted-foreground">
            <span>Showing {DEADLINES.length} of {DEADLINES.length}</span>
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
            <a href="#" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              View all →
            </a>
          </header>

          <div className="px-2 pb-3">
            {INTERVIEWS.map((iv, i) => (
              <div
                key={i}
                className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5 rounded-[10px] px-3.5 py-3.5 transition-colors hover:bg-secondary [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border"
              >
                <CompanyAvatar av={iv.avatar} />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium leading-snug text-foreground">{iv.roundName}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    {iv.jobTitle}
                    <span className="text-muted-foreground/40">·</span>
                    {iv.duration}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground">{iv.when}</span>
                  <span className="text-[11.5px] text-muted-foreground">{iv.time}</span>
                </div>
              </div>
            ))}
          </div>

          <footer className="flex items-center justify-between border-t border-border px-[22px] py-3 text-[12px] text-muted-foreground">
            <span>Showing {INTERVIEWS.length} of 6</span>
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
          <Button variant="outline" className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 9l2-2a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0" />
              <path d="M9 7l-2 2a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0" />
            </svg>
            Paste URL
          </Button>
          <Button className="gap-[7px] rounded-[9px] px-[14px] text-[13.5px]">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            New application
          </Button>
        </div>
      </section>

    </main>
  );
}
