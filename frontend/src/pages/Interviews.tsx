import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type RoundType = 'Recruiter screen' | 'Technical' | 'System Design' | 'Portfolio' | 'Hiring manager' | 'Onsite';
type ViewTab = 'Upcoming' | 'Past' | 'All';

interface Interviewer {
  initials: string;
  color: string;
}

interface Interview {
  id: number;
  title: string;
  time: string;
  duration: string;
  company: string;
  role: string;
  avatar: { bg: string; color: string; border?: string; letter: string };
  roundType: RoundType;
  interviewers: Interviewer[];
  isPast: boolean;
  statusTag?: { label: string; variant: 'next' | 'done' | 'decision' };
}

interface DayGroup {
  label: string;
  date: string;
  rel: string;
  isToday?: boolean;
  interviews: Interview[];
  isPastSection?: boolean;
}

const ROUND_DOT: Record<RoundType, string> = {
  'Recruiter screen': 'bg-muted-foreground',
  'Technical':        'bg-applied',
  'System Design':    'bg-[#6f3bcc]',
  'Portfolio':        'bg-intv',
  'Hiring manager':   'bg-rej',
  'Onsite':           'bg-offer',
};

const UPCOMING_GROUPS: DayGroup[] = [
  {
    label: 'Today', date: 'Thu, May 14', rel: '1 interview', isToday: true,
    interviews: [
      {
        id: 1,
        title: 'Phone Screen',
        time: '3:00 PM', duration: '45 min',
        company: 'Vercel', role: 'Staff Engineer, Edge',
        avatar: { bg: '#0d0d0d', color: '#fff', letter: 'V' },
        roundType: 'Recruiter screen',
        interviewers: [{ initials: 'JK', color: '#7a6cff' }],
        isPast: false,
        statusTag: { label: 'Today', variant: 'next' },
      },
    ],
  },
  {
    label: 'Tomorrow', date: 'Fri, May 15', rel: '2 interviews',
    interviews: [
      {
        id: 2,
        title: 'Technical Round 2 — System Design',
        time: '10:00 AM', duration: '60 min',
        company: 'Stripe', role: 'Senior Software Engineer, Platform',
        avatar: { bg: '#635bff', color: '#fff', letter: 'S' },
        roundType: 'System Design',
        interviewers: [{ initials: 'PM', color: '#635bff' }, { initials: 'DR', color: '#0d0d0d' }],
        isPast: false,
      },
      {
        id: 3,
        title: 'Portfolio Review',
        time: '2:30 PM', duration: '30 min',
        company: 'Figma', role: 'Product Designer, Platform',
        avatar: { bg: '#fef2ee', color: '#dc4a26', border: '#fbd9cc', letter: 'F' },
        roundType: 'Portfolio',
        interviewers: [{ initials: 'LT', color: '#dc4a26' }],
        isPast: false,
      },
    ],
  },
  {
    label: 'Mon, May 18', date: 'Final round · all-day', rel: 'In 4 days',
    interviews: [
      {
        id: 4,
        title: 'Final Round — Onsite (Virtual)',
        time: '11:00 AM', duration: '4 sessions · 4h',
        company: 'Anthropic', role: 'Product Engineer',
        avatar: { bg: '#f5f3ee', color: '#c96442', border: '#ece6d8', letter: 'A' },
        roundType: 'Onsite',
        interviewers: [
          { initials: 'RS', color: '#c96442' },
          { initials: 'EW', color: '#635bff' },
          { initials: '+2', color: '#0d0d0d' },
        ],
        isPast: false,
        statusTag: { label: 'Decision round', variant: 'decision' },
      },
    ],
  },
  {
    label: 'Next week', date: 'May 20–24', rel: '2 interviews',
    interviews: [
      {
        id: 5,
        title: 'Hiring Manager Round',
        time: '9:30 AM', duration: 'Wed · 45 min',
        company: 'Notion', role: 'Senior Product Designer',
        avatar: { bg: '#fff', color: '#1a1a1a', border: '#e5e5e5', letter: 'N' },
        roundType: 'Hiring manager',
        interviewers: [{ initials: 'AC', color: '#1a1a1a' }],
        isPast: false,
      },
      {
        id: 6,
        title: 'Technical Round 3 — Domain Deep Dive',
        time: '1:00 PM', duration: 'Fri · 60 min',
        company: 'Stripe', role: 'Senior Software Engineer, Platform',
        avatar: { bg: '#635bff', color: '#fff', letter: 'S' },
        roundType: 'Technical',
        interviewers: [{ initials: 'KJ', color: '#635bff' }, { initials: 'MN', color: '#0d0d0d' }],
        isPast: false,
      },
    ],
  },
];

const PAST_GROUPS: DayGroup[] = [
  {
    label: 'Recently completed', date: 'Last 7 days', rel: '3 interviews', isPastSection: true,
    interviews: [
      {
        id: 7,
        title: 'Technical Round 1 — Coding',
        time: 'May 10', duration: '60 min',
        company: 'Stripe', role: 'Senior Software Engineer, Platform',
        avatar: { bg: '#635bff', color: '#fff', letter: 'S' },
        roundType: 'Technical',
        interviewers: [{ initials: 'TG', color: '#635bff' }],
        isPast: true,
        statusTag: { label: 'Done', variant: 'done' },
      },
      {
        id: 8,
        title: 'Recruiter Screen',
        time: 'May 08', duration: '45 min',
        company: 'Linear', role: 'Senior Frontend Engineer',
        avatar: { bg: '#0d0d0d', color: '#fff', letter: 'L' },
        roundType: 'Recruiter screen',
        interviewers: [{ initials: 'EM', color: '#0d0d0d' }],
        isPast: true,
        statusTag: { label: 'Done', variant: 'done' },
      },
      {
        id: 9,
        title: 'Recruiter Screen',
        time: 'May 06', duration: '30 min',
        company: 'Stripe', role: 'Senior Software Engineer, Platform',
        avatar: { bg: '#635bff', color: '#fff', letter: 'S' },
        roundType: 'Recruiter screen',
        interviewers: [{ initials: 'SH', color: '#635bff' }],
        isPast: true,
        statusTag: { label: 'Done', variant: 'done' },
      },
    ],
  },
];

const ALL_GROUPS = [...UPCOMING_GROUPS, ...PAST_GROUPS];

export default function Interviews() {
  const [tab, setTab] = useState<ViewTab>('Upcoming');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'List' | 'Calendar'>('List');

  const groups = tab === 'Upcoming' ? UPCOMING_GROUPS : tab === 'Past' ? PAST_GROUPS : ALL_GROUPS;

  const filtered = groups.map((g) => ({
    ...g,
    interviews: g.interviews.filter((iv) => {
      const q = search.toLowerCase();
      return !q || iv.title.toLowerCase().includes(q) || iv.company.toLowerCase().includes(q);
    }),
  })).filter((g) => g.interviews.length > 0);

  const upcomingCount = UPCOMING_GROUPS.reduce((n, g) => n + g.interviews.length, 0);
  const pastCount     = PAST_GROUPS.reduce((n, g) => n + g.interviews.length, 0);

  return (
    <main className="mx-auto max-w-[1180px] px-8 py-11 pb-20">

      {/* Page header */}
      <section className="mb-7 flex items-end justify-between gap-6">
        <div>
          <h1 className="mb-1 text-[30px] font-semibold leading-none tracking-[-0.02em] text-foreground">
            Interviews
          </h1>
          <p className="text-[14px] text-muted-foreground">
            <strong className="font-medium text-secondary-foreground">{upcomingCount}</strong> upcoming
            &nbsp;·&nbsp;
            <strong className="font-medium text-secondary-foreground">14</strong> completed all-time
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex cursor-pointer items-center gap-[7px] rounded-[9px] border border-[#ddd7c7] bg-transparent px-[14px] py-2 text-[13.5px] font-medium text-secondary-foreground transition-colors hover:bg-card hover:text-foreground">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8a5 5 0 0 1 8-4M13 8a5 5 0 0 1-8 4M11 3h2v2M5 13H3v-2" />
            </svg>
            Sync calendar
          </button>
          <Link
            to="/interviews/new"
            className="inline-flex cursor-pointer items-center gap-[7px] rounded-[9px] border border-[#ddd7c7] bg-transparent px-[14px] py-2 text-[13.5px] font-medium text-secondary-foreground no-underline transition-colors hover:bg-card hover:text-foreground"
          >
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            Schedule interview
          </Link>
        </div>
      </section>

      {/* Up next callout */}
      <section className="relative mb-9 grid items-center gap-6 overflow-hidden rounded-[14px] border border-border bg-card p-[22px_24px] shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
        <div className="absolute bottom-0 left-0 top-0 w-0.75 bg-intv" />

        {/* Time block */}
        <div className="min-w-[110px] border-r border-border pr-6 text-center">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-intv">
            Up next · in 18 hours
          </div>
          <div className="mb-1 font-mono text-[30px] font-medium leading-none tracking-[-0.04em] text-foreground">
            10:00
          </div>
          <div className="text-[12.5px] text-muted-foreground">Tomorrow · 60 min</div>
        </div>

        {/* Body */}
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2.5 text-[12.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="grid size-4 place-items-center rounded-full bg-[#635bff] text-[9px] font-semibold text-white">S</span>
              <strong className="font-medium text-secondary-foreground">Stripe</strong>
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span>Senior Software Engineer, Platform</span>
            <span className="text-muted-foreground/40">·</span>
            <RoundPill type="System Design" />
          </div>
          <h3 className="mb-2 text-[18px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground">
            Technical Round 2 — System Design
          </h3>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="grid size-5 place-items-center rounded-full bg-[#635bff] text-[10px] font-semibold text-white">PM</span>
            <span>With Priya Menon (Staff) · Google Meet</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex min-w-[140px] flex-col items-stretch gap-2">
          <button className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-[9px] bg-foreground px-[14px] py-2 text-[13.5px] font-medium text-background transition-colors hover:bg-[#2d2a26]">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 9l2-2a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0" />
              <path d="M9 7l-2 2a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0" />
            </svg>
            Join meeting
          </button>
          <button className="inline-flex cursor-pointer items-center justify-center rounded-[9px] border border-[#ddd7c7] bg-transparent px-[14px] py-2 text-[13.5px] font-medium text-secondary-foreground transition-colors hover:bg-card hover:text-foreground">
            View prep
          </button>
        </div>
      </section>

      {/* Toolbar */}
      <section className="mb-6 flex flex-wrap items-center gap-2.5">
        {/* Segment toggle */}
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
                {t === 'Upcoming' ? upcomingCount : t === 'Past' ? pastCount : upcomingCount + pastCount}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
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

        {/* View toggle */}
        <div className="ml-auto flex gap-0.5 rounded-[10px] border border-[#ddd7c7] bg-card p-[3px]">
          {(['List', 'Calendar'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'inline-flex h-7 cursor-pointer items-center gap-[5px] rounded-[7px] px-2.5 text-[12.5px] font-medium transition-colors',
                view === v ? 'bg-background text-foreground' : 'bg-transparent text-muted-foreground hover:text-secondary-foreground',
              )}
            >
              {v === 'List' ? (
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 4h10M3 8h10M3 12h10" />
                </svg>
              ) : (
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
                  <path d="M2.5 6.5h11M6 2v2M10 2v2" />
                </svg>
              )}
              {v}
            </button>
          ))}
        </div>
      </section>

      {/* Day groups */}
      {filtered.length === 0 ? (
        <EmptyState query={search} />
      ) : (
        filtered.map((group) => (
          <DaySection key={group.label} group={group} />
        ))
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
        <span className="text-[13px] font-medium text-foreground">{group.date}</span>
        <span className="ml-auto font-mono text-[12px] text-muted-foreground">{group.rel}</span>
      </header>

      <div className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
        {group.interviews.map((iv) => (
          <InterviewRow key={iv.id} iv={iv} />
        ))}
        {group.isPastSection && (
          <div className="border-t border-border py-3.5 text-center text-[12.5px] text-muted-foreground">
            Showing 3 of 14 completed ·{' '}
            <button className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-medium text-secondary-foreground hover:text-foreground hover:underline">
              See full history →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Interview row ── */

function InterviewRow({ iv }: { iv: Interview }) {
  return (
    <div className={cn(
      'grid cursor-default items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-[#fbfaf6]',
      iv.isPast && '[&_.row-time]:text-muted-foreground [&_.row-title]:text-muted-foreground [&_.row-sub]:text-muted-foreground/60',
    )} style={{ gridTemplateColumns: '86px 36px 1fr auto' }}>

      {/* Time */}
      <div className="row-time flex flex-col gap-0.5">
        <span className={cn(
          'font-mono text-[14px] font-medium leading-none tracking-[-0.02em]',
          iv.isPast ? 'text-muted-foreground' : 'text-foreground',
        )}>
          {iv.time}
        </span>
        <span className="text-[11.5px] text-muted-foreground">{iv.duration}</span>
      </div>

      {/* Avatar */}
      <div
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-[9px] border text-[13px] font-semibold tracking-[-0.01em]',
          iv.isPast && 'opacity-70',
        )}
        style={{
          background: iv.avatar.bg,
          color: iv.avatar.color,
          borderColor: iv.avatar.border ?? iv.avatar.bg,
        }}
      >
        {iv.avatar.letter}
      </div>

      {/* Main */}
      <div className="min-w-0">
        <div className="row-title mb-1 flex items-center gap-2 text-[14.5px] font-medium leading-[1.3] text-foreground">
          {iv.title}
          {iv.statusTag && <StatusTag tag={iv.statusTag} />}
        </div>
        <div className="row-sub flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span
              className="grid size-4 place-items-center rounded-full text-[9px] font-semibold text-white"
              style={{ background: iv.avatar.bg === '#fff' ? iv.avatar.color : iv.avatar.bg }}
            >
              {iv.avatar.letter}
            </span>
            {iv.company}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>{iv.role}</span>
          <span className="text-muted-foreground/40">·</span>
          <RoundPill type={iv.roundType} />
        </div>
      </div>

      {/* Right: interviewer stack + kebab */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="inline-flex">
          {iv.interviewers.map((person, i) => (
            <span
              key={i}
              className="grid size-[22px] place-items-center rounded-full border-2 border-card text-[10px] font-semibold text-white first:ml-0 -ml-1.5"
              style={{ background: person.color }}
            >
              {person.initials}
            </span>
          ))}
        </div>
        <button className="inline-flex cursor-pointer rounded-[6px] p-1.5 text-muted-foreground/60 transition-colors hover:bg-background hover:text-secondary-foreground">
          <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="3" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="13" cy="8" r="1.3" />
          </svg>
        </button>
      </div>

    </div>
  );
}

/* ── Round pill ── */

function RoundPill({ type }: { type: RoundType }) {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full border border-border bg-secondary px-[9px] py-[3px] text-[11.5px] font-medium leading-[1.4] text-secondary-foreground">
      <span className={cn('size-[5px] shrink-0 rounded-full', ROUND_DOT[type])} />
      {type}
    </span>
  );
}

/* ── Status tag ── */

function StatusTag({ tag }: { tag: { label: string; variant: 'next' | 'done' | 'decision' } }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-[9px] py-[3px] text-[11.5px] font-medium leading-[1.4]',
      tag.variant === 'next'     && 'border-[#f3e4c2] bg-[#fdf5e9] text-intv',
      tag.variant === 'done'     && 'border-border bg-secondary text-muted-foreground',
      tag.variant === 'decision' && 'border-[#d6daff] bg-[#eef0ff] text-[#3730a3]',
    )}>
      {tag.label}
    </span>
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
