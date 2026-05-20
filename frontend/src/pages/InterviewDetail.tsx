import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getInterview, deleteInterview, type Interview } from '@/api/interviews';

function companyColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 42%)`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${String(d).padStart(2, '0')}, ${y}`;
}

function relativeDays(iso: string): { label: string; urgent: boolean; past: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return { label: 'Today', urgent: true, past: false };
  if (diff === 1) return { label: 'Tomorrow', urgent: true, past: false };
  if (diff === -1) return { label: 'Yesterday', urgent: false, past: true };
  if (diff > 0) return { label: `In ${diff} days`, urgent: false, past: false };
  return { label: `${Math.abs(diff)} days ago`, urgent: false, past: true };
}

export default function InterviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getInterview(Number(id))
      .then(setInterview)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteInterview(Number(id));
      navigate('/interviews');
    } catch {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-[880px] px-8 py-7">
        <div className="mb-6 h-4 w-40 animate-pulse rounded bg-card" />
        <div className="h-9 w-72 animate-pulse rounded bg-card" />
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-[14px] bg-card border border-border" />)}
        </div>
      </main>
    );
  }

  if (error || !interview) {
    return (
      <main className="mx-auto max-w-[880px] px-8 py-7">
        <p className="text-[14px] text-red-500">{error ?? 'Interview not found.'}</p>
        <Link to="/interviews" className="mt-4 inline-block text-[13px] text-indigo underline">← Back to interviews</Link>
      </main>
    );
  }

  const color = companyColor(interview.companyName);
  const initial = interview.companyName.charAt(0).toUpperCase();

  return (
    <main className="mx-auto max-w-[880px] px-8 py-7 pb-20">

      {/* Breadcrumb */}
      <nav className="mb-[22px] flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link to="/interviews" className="text-muted-foreground no-underline transition-colors hover:text-secondary-foreground">
          Interviews
        </Link>
        <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4l4 4-4 4" />
        </svg>
        <span className="text-secondary-foreground">{interview.roundName}</span>
      </nav>

      {/* Header */}
      <section className="mb-8 flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="grid size-12 shrink-0 place-items-center rounded-[12px] text-[18px] font-semibold text-white"
            style={{ background: color }}
          >
            {initial}
          </div>
          <div>
            <h1 className="mb-1 text-[28px] font-semibold leading-none tracking-[-0.02em] text-foreground">
              {interview.roundName}
            </h1>
            <div className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
              <Link
                to={`/jobs/${interview.jobId}`}
                className="font-medium text-secondary-foreground no-underline transition-colors hover:text-foreground hover:underline"
              >
                {interview.companyName}
              </Link>
              <span className="text-muted-foreground/40">·</span>
              <Link
                to={`/jobs/${interview.jobId}`}
                className="no-underline text-muted-foreground transition-colors hover:text-secondary-foreground hover:underline"
              >
                {interview.jobTitle}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to={`/interviews/${interview.id}/edit`}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] border border-[#ddd7c7] bg-transparent px-[14px] py-2 text-[13.5px] font-medium text-secondary-foreground no-underline transition-colors hover:bg-card hover:text-foreground"
          >
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.5 2.5a2.12 2.12 0 0 1 3 3L5 15H2v-3L11.5 2.5z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] border border-[#f3d0cc] bg-transparent px-[14px] py-2 text-[13.5px] font-medium text-[#b04a3f] transition-colors hover:bg-[#fef2f2]"
          >
            <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5h10M6 5V3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V5M6 8v4M10 8v4M4.5 5l.5 8h6l.5-8" />
            </svg>
            Delete
          </button>
        </div>
      </section>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-[12px] border border-[#f3d0cc] bg-[#fef2f2] px-5 py-4">
          <p className="text-[13.5px] text-[#7c2d2d]">Delete this interview? This cannot be undone.</p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="cursor-pointer rounded-[8px] border border-[#f3d0cc] bg-transparent px-3 py-1.5 text-[13px] font-medium text-[#7c2d2d] transition-colors hover:bg-[#fde8e6]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer rounded-[8px] bg-[#b04a3f] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#8f3a31] disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </div>
      )}

      {/* Details card */}
      <Card>
        <CardHead title="Details" />
        <div className="border-t border-border">
          <Row label="Round">
            <span className="text-[14px] text-foreground">{interview.roundName}</span>
          </Row>
          <Row label="Date">
            {interview.interviewDate ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-[14px] text-foreground">{formatDate(interview.interviewDate)}</span>
                <DateBadge iso={interview.interviewDate} />
              </div>
            ) : (
              <span className="text-[14px] text-muted-foreground">Not set</span>
            )}
          </Row>
          <Row label="Job">
            <Link
              to={`/jobs/${interview.jobId}`}
              className="text-[14px] font-medium text-indigo no-underline hover:underline"
            >
              {interview.jobTitle}
            </Link>
          </Row>
          <Row label="Company">
            <div className="flex items-center gap-2">
              <div
                className="grid size-5 place-items-center rounded-[5px] text-[10px] font-semibold text-white"
                style={{ background: color }}
              >
                {initial}
              </div>
              <span className="text-[14px] text-foreground">{interview.companyName}</span>
            </div>
          </Row>
        </div>
      </Card>

      {/* Notes card */}
      {interview.notes && (
        <Card className="mt-5">
          <CardHead title="Notes" />
          <div className="border-t border-border px-[22px] py-5">
            <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-foreground">{interview.notes}</p>
          </div>
        </Card>
      )}

      {!interview.notes && (
        <Card className="mt-5">
          <CardHead
            title="Notes"
            action={
              <Link
                to={`/interviews/${interview.id}/edit`}
                className="text-[12.5px] font-medium text-indigo no-underline hover:underline"
              >
                Add notes
              </Link>
            }
          />
          <div className="border-t border-border px-[22px] py-8 text-center">
            <p className="text-[13.5px] text-muted-foreground">No notes yet.</p>
          </div>
        </Card>
      )}

    </main>
  );
}

/* ── Sub-components ── */

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

function CardHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between px-[22px] pb-3.5 pt-[18px]">
      <h2 className="m-0 text-[14.5px] font-semibold tracking-[-0.005em] text-foreground">{title}</h2>
      {action}
    </header>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-5 border-b border-border px-[22px] py-[13px] last:border-b-0" style={{ gridTemplateColumns: '120px 1fr' }}>
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function DateBadge({ iso }: { iso: string }) {
  const { label, urgent, past } = relativeDays(iso);
  return (
    <span className={cn(
      'rounded-full border px-[9px] py-[3px] text-[12px] font-medium',
      urgent && 'border-[#f3e4c2] bg-[#fdf5e9] text-intv',
      past && 'border-border bg-secondary text-muted-foreground',
      !urgent && !past && 'border-border bg-secondary text-secondary-foreground',
    )}>
      {label}
    </span>
  );
}
