import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getJob, type JobDetail as JobDetailData, type NoteSummary } from '@/api/jobs';

type Status = 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
type Tab = 'Overview' | 'Description' | 'Cover letter' | 'Interviews' | 'Notes';

const STATUSES: Status[] = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];
const STATUS_IDX: Record<Status, number> = { Wishlist: 0, Applied: 1, Interview: 2, Offer: 3, Rejected: 4 };
const SWATCH: Record<Status, string> = {
  Wishlist: 'bg-wish', Applied: 'bg-applied', Interview: 'bg-intv', Offer: 'bg-offer', Rejected: 'bg-rej',
};
const TABS: Tab[] = ['Overview', 'Description', 'Cover letter', 'Interviews', 'Notes'];

/* ── Helpers ── */

function stepState(idx: number, currentIdx: number): 'done' | 'current' | 'pending' {
  if (idx < currentIdx) return 'done';
  if (idx === currentIdx) return 'current';
  return 'pending';
}

function deadlineInfo(iso: string) {
  const diff = Math.round((Date.parse(iso) - Date.now()) / 86400000);
  let label: string;
  if (diff === 0) label = 'Today';
  else if (diff === 1) label = 'Tomorrow';
  else if (diff === -1) label = 'Yesterday';
  else if (diff > 0) label = `In ${diff} days`;
  else label = `${Math.abs(diff)} days ago`;
  return { label, urgent: diff >= 0 && diff <= 1, soon: diff >= 2 && diff <= 3 };
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${String(d).padStart(2, '0')}, ${y}`;
}

function fmtShortDate(iso: string) {
  const [, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${d}`;
}

function fmtNoteTime(iso: string): { dateStr: string; ago: string } {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = d.getHours() % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  const dateStr = `${months[d.getMonth()]} ${d.getDate()}, ${h}:${min} ${ampm}`;
  const diffDays = Math.round((Date.now() - d.getTime()) / 86400000);
  let ago: string;
  if (diffDays === 0) ago = 'Today';
  else if (diffDays === 1) ago = 'Yesterday';
  else if (diffDays < 7) ago = `${diffDays} days ago`;
  else ago = `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
  return { dateStr, ago };
}

function interviewState(dateIso: string | null, isNext: boolean): 'done' | 'next' | 'upcoming' {
  if (!dateIso) return 'upcoming';
  const diff = Math.round((Date.parse(dateIso) - Date.now()) / 86400000);
  if (diff < 0) return 'done';
  if (isNext) return 'next';
  return 'upcoming';
}

function companyInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

const AVATAR_COLORS = [
  { bg: '#635bff', color: '#fff' },
  { bg: '#0ea5e9', color: '#fff' },
  { bg: '#10b981', color: '#fff' },
  { bg: '#f59e0b', color: '#fff' },
  { bg: '#ef4444', color: '#fff' },
  { bg: '#8b5cf6', color: '#fff' },
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ── Sub-components ── */

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-[3px] text-[12.5px] font-medium leading-[1.4] text-secondary-foreground">
      <span className={cn('size-1.5 shrink-0 rounded-full', SWATCH[status])} />
      {status}
    </span>
  );
}

function DeadlineBadge({ iso }: { iso: string }) {
  const { label, urgent, soon } = deadlineInfo(iso);
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-[3px] text-[12.5px] font-medium leading-[1.4]',
      urgent && 'border-[#f1cfc6] bg-[#fbeae6] text-[#94352a]',
      soon   && 'border-[#f6e0cf] bg-[#fef3ec] text-[#8a4a1c]',
      !urgent && !soon && 'border-border bg-secondary text-secondary-foreground',
    )}>
      {label}
    </span>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <article className={cn(
      'overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]',
      className,
    )}>
      {children}
    </article>
  );
}

function CardHead({ title, count, action }: { title: string; count?: number; action?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between px-[22px] pb-3.5 pt-[18px]">
      <h2 className="m-0 flex items-center gap-2.5 text-[14.5px] font-semibold tracking-[-0.005em] text-foreground">
        {title}
        {count !== undefined && (
          <span className="rounded-[6px] border border-border bg-background px-1.5 py-px font-mono text-[11.5px] font-normal text-muted-foreground">
            {count}
          </span>
        )}
      </h2>
      {action}
    </header>
  );
}

function CardLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1 rounded-[6px] px-2 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
    </button>
  );
}

function DetailRow({
  icon, label, children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-4 px-[18px] py-[11px]" style={{ gridTemplateColumns: '90px 1fr' }}>
      <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
        <span className="shrink-0 text-[#b3afa3]">{icon}</span>
        {label}
      </div>
      <div className="min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}

/* ── Page ── */

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [noteText, setNoteText] = useState('');
  const [localNotes, setLocalNotes] = useState<NoteSummary[]>([]);
  const [notesReady, setNotesReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJob(Number(id))
      .then((data) => {
        const normalized = {
          ...data,
          interviews: data.interviews ?? [],
          notes: data.notes ?? [],
        };
        setJob(normalized);
        setLocalNotes(normalized.notes);
        setNotesReady(true);
      })
      .catch(() => setError('Failed to load job.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-[1180px] px-8 py-7">
        <div className="text-[14px] text-muted-foreground">Loading…</div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="mx-auto max-w-[1180px] px-8 py-7">
        <div className="text-[14px] text-[#94352a]">{error ?? 'Job not found.'}</div>
      </main>
    );
  }

  const status = job.appliedStatus as Status;
  const currentIdx = STATUS_IDX[status] ?? 0;
  const dl = job.deadline ? deadlineInfo(job.deadline) : null;
  const avatar = avatarColor(job.companyName);

  // Determine which interview is "next" — first one that hasn't happened yet
  const firstUpcomingIdx = job.interviews.findIndex(
    (iv) => iv.interviewDate && Math.round((Date.parse(iv.interviewDate) - Date.now()) / 86400000) >= 0,
  );

  function submitNote() {
    if (!noteText.trim()) return;
    const optimistic: NoteSummary = {
      id: Date.now(),
      note: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    setLocalNotes((prev) => [optimistic, ...prev]);
    setNoteText('');
    // TODO: persist to API
  }

  const show = (tab: Tab) => activeTab === 'Overview' || activeTab === tab;

  return (
    <main className="mx-auto max-w-[1180px] px-8 py-7 pb-20">

      {/* Breadcrumb */}
      <nav className="mb-5.5 flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link to="/jobs" className="text-muted-foreground no-underline transition-colors hover:text-secondary-foreground">
          All Jobs
        </Link>
        <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4l4 4-4 4" />
        </svg>
        <span className="text-muted-foreground">{job.companyName}</span>
        <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4l4 4-4 4" />
        </svg>
        <span className="text-secondary-foreground">{job.jobTitle}</span>
      </nav>

      {/* Header */}
      <section className="mb-7 flex items-start gap-5">
        <div
          className="grid size-14 shrink-0 place-items-center rounded-[12px] text-[22px] font-semibold tracking-[-0.02em]"
          style={{ background: avatar.bg, color: avatar.color }}
        >
          {companyInitial(job.companyName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
            <span className="text-secondary-foreground">{job.companyName}</span>
          </div>
          <h1 className="mb-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
            {job.jobTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            {job.appliedDate && (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="12" height="11" rx="1.5" />
                  <path d="M2 6.5h12M5.5 2v2M10.5 2v2" />
                </svg>
                Applied {fmtShortDate(job.appliedDate)}
              </span>
            )}
            {job.deadline && dl && (
              <>
                <span className="size-[3px] rounded-full bg-[#b3afa3]" />
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                  <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="6" />
                    <path d="M8 5v3.2L10 10" />
                  </svg>
                  Deadline{' '}
                  <strong className={cn('font-medium', dl.urgent && 'text-[#94352a]', dl.soon && 'text-[#8a4a1c]')}>
                    {dl.label}
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] border border-[#ddd7c7] bg-transparent px-3.5 py-2 text-[13.5px] font-medium text-secondary-foreground transition-colors hover:bg-card hover:text-foreground">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 13h2.5L13 5.5 10.5 3 3 10.5z" />
            </svg>
            Edit
          </button>
          <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] border border-[#ddd7c7] bg-transparent px-3.5 py-2 text-[13.5px] font-medium text-secondary-foreground transition-colors hover:bg-card hover:text-foreground">
            Change status
          </button>
          <button className="inline-flex size-8.5 cursor-pointer items-center justify-center rounded-[9px] border border-[#ddd7c7] text-secondary-foreground transition-colors hover:bg-card hover:text-foreground">
            <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="8" r="1.3" />
              <circle cx="8" cy="8" r="1.3" />
              <circle cx="13" cy="8" r="1.3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Status stepper */}
      <section className="mb-6 flex items-center gap-2.5 rounded-[14px] border border-border bg-card px-[22px] py-[18px] shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
        <span className="mr-2 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          Pipeline
        </span>
        <div className="grid flex-1 grid-cols-5">
          {STATUSES.map((s, idx) => {
            const state = stepState(idx, currentIdx);
            const prevState = idx > 0 ? stepState(idx - 1, currentIdx) : null;
            const connectorDark = prevState === 'done' || prevState === 'current';
            return (
              <div key={s} className="relative flex flex-col items-center gap-2 px-1.5">
                {idx > 0 && (
                  <div
                    className={cn('absolute top-[7px] h-px', connectorDark ? 'bg-foreground' : 'bg-[#ddd7c7]')}
                    style={{ left: '-50%', right: '50%' }}
                  />
                )}
                <div className={cn(
                  'relative z-10 size-3.5 rounded-full',
                  state === 'done'    && 'border border-foreground bg-foreground',
                  state === 'current' && 'border border-foreground bg-card shadow-[0_0_0_4px_rgba(31,29,26,.08)]',
                  state === 'pending' && 'border border-[#ddd7c7] bg-background',
                )}>
                  {state === 'current' && (
                    <div className="absolute inset-[3px] rounded-full bg-foreground" />
                  )}
                </div>
                <span className={cn(
                  'text-[12.5px] font-medium',
                  (state === 'done' || state === 'current') ? 'text-foreground' : 'text-muted-foreground',
                )}>
                  {s}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tabs */}
      <div className="mb-5.5 flex gap-0.5 border-b border-border px-0.5">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              '-mb-px cursor-pointer border-b-2 border-transparent bg-transparent px-3.5 py-2.5 text-[13.5px] font-medium transition-colors',
              activeTab === tab
                ? 'border-foreground text-foreground'
                : 'text-muted-foreground hover:text-secondary-foreground',
            )}
          >
            {tab}
            {tab === 'Interviews' && (
              <span className="ml-1 font-mono text-[11px] text-muted-foreground">{job.interviews.length}</span>
            )}
            {tab === 'Notes' && notesReady && (
              <span className="ml-1 font-mono text-[11px] text-muted-foreground">{localNotes.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-[1fr_340px] items-start gap-6">

        {/* Main column */}
        <div className="flex flex-col gap-5">

          {/* Job description */}
          {show('Description') && (
            <Card>
              <CardHead title="Job description" action={<CardLink>Edit</CardLink>} />
              <div className="px-[22px] pb-[22px] pt-1">
                {job.jobDescription ? (
                  <div className="whitespace-pre-wrap text-[14px] leading-[1.65] text-secondary-foreground">
                    {job.jobDescription}
                  </div>
                ) : (
                  <div className="text-[13.5px] text-muted-foreground italic">No description added yet.</div>
                )}
              </div>
            </Card>
          )}

          {/* Cover letter */}
          {show('Cover letter') && (
            <Card>
              <CardHead title="Cover letter" action={<CardLink>Edit</CardLink>} />
              <div className="px-[22px] pb-[22px] pt-1">
                {job.coverLetter ? (
                  <div className="whitespace-pre-wrap text-[14px] leading-[1.65] text-secondary-foreground">
                    {job.coverLetter}
                  </div>
                ) : (
                  <div className="text-[13.5px] text-muted-foreground italic">No cover letter added yet.</div>
                )}
              </div>
            </Card>
          )}

          {/* Interviews */}
          {show('Interviews') && (
            <Card>
              <CardHead title="Interviews" count={job.interviews.length} action={<CardLink>+ Add round</CardLink>} />
              <div className="px-[22px] pb-[22px] pt-0">
                {job.interviews.length === 0 ? (
                  <div className="py-4 text-[13.5px] text-muted-foreground italic">No interviews scheduled yet.</div>
                ) : (
                  job.interviews.map((iv, i) => {
                    const isNextUpcoming = i === firstUpcomingIdx;
                    const state = interviewState(iv.interviewDate, isNextUpcoming);
                    return (
                      <div
                        key={iv.id}
                        className={cn(
                          'grid grid-cols-[28px_1fr_auto] items-start gap-3.5 py-3.5',
                          i < job.interviews.length - 1 && 'border-b border-border',
                        )}
                      >
                        <div className={cn(
                          'grid size-7 place-items-center rounded-[8px] border font-mono text-[11px] font-medium',
                          state === 'done'     && 'border-foreground bg-foreground text-background',
                          state === 'next'     && 'border-[1.5px] border-foreground bg-card text-foreground',
                          state === 'upcoming' && 'border-border bg-secondary text-secondary-foreground',
                        )}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="mb-[3px] flex items-center gap-2 text-[14px] font-medium text-foreground">
                            {iv.roundName}
                            {state === 'next' && (
                              <span className="rounded-full border border-[#f3e4c2] bg-[#fdf5e9] px-2 py-[2px] text-[11px] font-medium text-[#6e4a13]">
                                Next up
                              </span>
                            )}
                          </div>
                          {iv.notes && (
                            <div className="text-[13px] leading-[1.55] text-muted-foreground">{iv.notes}</div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          {iv.interviewDate && (
                            <div className="font-mono text-[12.5px] tracking-[-0.01em] text-secondary-foreground">
                              {fmtShortDate(iv.interviewDate)}
                            </div>
                          )}
                          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                            {state === 'done' ? 'Done' : state === 'next' ? 'Upcoming' : 'Scheduled'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <button
                  type="button"
                  className="mt-3.5 flex w-full cursor-pointer items-center gap-2 rounded-[9px] border border-dashed border-[#ddd7c7] px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:border-indigo hover:bg-secondary hover:text-indigo"
                >
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                  Add another round
                </button>
              </div>
            </Card>
          )}

          {/* Notes */}
          {show('Notes') && (
            <Card>
              <CardHead title="Notes" count={localNotes.length} />
              <div className="px-[22px] pb-[22px] pt-0">
                {localNotes.map((note, i) => {
                  const { dateStr, ago } = fmtNoteTime(note.createdAt);
                  return (
                    <div
                      key={note.id}
                      className={cn(
                        'grid grid-cols-[32px_1fr] gap-3.5 py-3.5',
                        i < localNotes.length - 1 && 'border-b border-border',
                      )}
                    >
                      <div className="ml-3 mt-2 size-2 rounded-full bg-[#b3afa3]" />
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                          <span>{dateStr}</span>
                          <span className="text-[#b3afa3]">·</span>
                          <span>{ago}</span>
                        </div>
                        <div className="text-[13.5px] leading-[1.55] text-secondary-foreground">{note.note}</div>
                      </div>
                    </div>
                  );
                })}

                {/* Compose */}
                <div className="mt-1.5 flex items-start gap-3 border-t border-border pt-3.5">
                  <div className="ml-3 mt-2 size-2 shrink-0 rounded-full bg-indigo" />
                  <div className="flex-1">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note about this application…"
                      rows={3}
                      className="w-full resize-none rounded-[10px] border border-border bg-secondary px-3.5 py-2.5 text-[13.5px] leading-[1.55] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-indigo focus:bg-card focus:ring-[3px] focus:ring-indigo/8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitNote();
                      }}
                    />
                    {noteText.trim() && (
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={submitNote}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[8px] bg-foreground px-3 py-1.5 text-[12.5px] font-medium text-background transition-colors hover:bg-[#2d2a26]"
                        >
                          Add note
                          <span className="font-mono text-[10px] opacity-60">⌘↵</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5">

          {/* Application details */}
          <Card>
            <CardHead title="Application" />
            <div className="pb-3">

              <DetailRow
                icon={
                  <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="6" />
                    <path d="M5.5 8.5l1.8 1.8 3.2-4" />
                  </svg>
                }
                label="Status"
              >
                <StatusBadge status={status} />
              </DetailRow>

              {job.appliedDate && (
                <DetailRow
                  icon={
                    <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="12" height="11" rx="1.5" />
                      <path d="M2 6.5h12M5.5 2v2M10.5 2v2" />
                    </svg>
                  }
                  label="Applied"
                >
                  <span className="font-mono text-[12.5px] tracking-[-0.01em] text-foreground">
                    {fmtDate(job.appliedDate)}
                  </span>
                </DetailRow>
              )}

              {job.deadline && dl && (
                <DetailRow
                  icon={
                    <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="8" r="6" />
                      <path d="M8 5v3.2L10 10" />
                    </svg>
                  }
                  label="Deadline"
                >
                  <div className="flex flex-col items-start gap-[3px]">
                    <DeadlineBadge iso={job.deadline} />
                    <span className="text-[11.5px] text-muted-foreground">{fmtDate(job.deadline)}</span>
                  </div>
                </DetailRow>
              )}

              {job.jobUrl && (
                <DetailRow
                  icon={
                    <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 9l2-2a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0" />
                      <path d="M9 7l-2 2a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0" />
                    </svg>
                  }
                  label="Job URL"
                >
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 truncate text-[13px] text-indigo no-underline hover:underline"
                  >
                    <span className="truncate">{job.jobUrl.replace('https://', '').replace(/\/.*/, '/…')}</span>
                    <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h7v7M13 3L6 10M9 13H3V7" />
                    </svg>
                  </a>
                </DetailRow>
              )}

              {job.jobSource && (
                <DetailRow
                  icon={
                    <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 5h12M2 8h12M2 11h8" />
                    </svg>
                  }
                  label="Source"
                >
                  <span className="text-[13px] text-foreground">{job.jobSource}</span>
                </DetailRow>
              )}

              {job.salaryRange && (
                <DetailRow
                  icon={
                    <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 2v12M5 5h4.5a1.5 1.5 0 0 1 0 3H6.5a1.5 1.5 0 0 0 0 3H11" />
                    </svg>
                  }
                  label="Salary"
                >
                  <span className="font-mono text-[12.5px] tracking-[-0.01em] text-foreground">{job.salaryRange}</span>
                </DetailRow>
              )}

            </div>
          </Card>

          {/* Company card */}
          <Card>
            <div className="flex items-center gap-3 px-[22px] pb-3 pt-[18px]">
              <div
                className="grid size-9 shrink-0 place-items-center rounded-[9px] text-[14px] font-semibold"
                style={{ background: avatar.bg, color: avatar.color }}
              >
                {companyInitial(job.companyName)}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-foreground">{job.companyName}</div>
              </div>
            </div>
            {job.companyAbout && (
              <div className="px-[22px] pb-[18px] text-[13px] leading-[1.6] text-secondary-foreground">
                {job.companyAbout}
              </div>
            )}
            <div className="px-[22px] pb-4">
              <Link
                to={`/companies`}
                className="inline-flex cursor-pointer items-center gap-1 rounded-[6px] px-0 py-1 text-[12.5px] text-muted-foreground no-underline transition-colors hover:text-secondary-foreground"
              >
                View all jobs at {job.companyName} →
              </Link>
            </div>
          </Card>

          {/* Archive */}
          <Card>
            <div className="flex items-center justify-between gap-3 px-[22px] py-4">
              <div>
                <div className="text-[13px] font-medium text-foreground">Archive this application</div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">Hide from main views without deleting.</div>
              </div>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center rounded-[9px] border border-[#ddd7c7] bg-transparent px-2.5 py-1.5 text-[12.5px] font-medium text-secondary-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                Archive
              </button>
            </div>
          </Card>

        </aside>
      </div>
    </main>
  );
}
