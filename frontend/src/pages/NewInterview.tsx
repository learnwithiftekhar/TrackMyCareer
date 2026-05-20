import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getJobs, getJobByUrl, type Job } from '@/api/jobs';
import { createInterview } from '@/api/interviews';

const QUICK_ROUNDS = ['Phone Screen', 'Technical', 'System Design', 'Hiring Manager', 'Portfolio', 'Onsite / Final'];

interface FormState {
  roundName: string;
  interviewDate: string;
  notes: string;
  jobId: number | null;
  jobSearch: string;
}

function jobLabel(job: Job) {
  return `${job.jobTitle} — ${job.companyName}`;
}

export default function NewInterview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedJobId = searchParams.get('jobId') ? Number(searchParams.get('jobId')) : null;

  const [form, setForm] = useState<FormState>({
    roundName: '',
    interviewDate: '',
    notes: '',
    jobId: preselectedJobId,
    jobSearch: '',
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [jobDropdownPos, setJobDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [urlInput, setUrlInput] = useState('');
  const [urlStatus, setUrlStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [errors, setErrors] = useState<{ roundName?: string; jobId?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getJobs({ size: 200 }).then((page) => {
      setJobs(page.content);
      if (preselectedJobId) {
        const found = page.content.find((j) => j.id === preselectedJobId);
        if (found) set('jobSearch', jobLabel(found));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        inputWrapperRef.current && !inputWrapperRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setJobDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = urlInput.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setUrlStatus('loading');
      getJobByUrl(trimmed)
        .then((job) => {
          if (cancelled) return;
          setForm((f) => ({ ...f, jobId: job.id, jobSearch: jobLabel(job) }));
          setErrors((e) => ({ ...e, jobId: undefined }));
          setJobDropdownOpen(false);
          setUrlStatus('found');
        })
        .catch(() => { if (!cancelled) setUrlStatus('not-found'); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [urlInput]);

  function openDropdown() {
    if (inputWrapperRef.current) {
      const rect = inputWrapperRef.current.getBoundingClientRect();
      setJobDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setJobDropdownOpen(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function selectJob(job: Job) {
    setForm((f) => ({ ...f, jobId: job.id, jobSearch: jobLabel(job) }));
    setErrors((e) => ({ ...e, jobId: undefined }));
    setJobDropdownOpen(false);
  }

  const filteredJobs = form.jobSearch && !form.jobId
    ? jobs.filter((j) => jobLabel(j).toLowerCase().includes(form.jobSearch.toLowerCase()))
    : jobs;

  function validate() {
    const e: typeof errors = {};
    if (!form.roundName.trim()) e.roundName = 'Round name is required';
    if (!form.jobId) e.jobId = 'Job is required';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createInterview({
        roundName: form.roundName.trim(),
        interviewDate: form.interviewDate || null,
        notes: form.notes || null,
        jobId: form.jobId!,
      });
      navigate('/interviews');
    } catch {
      setSubmitError('Failed to schedule interview. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-[880px] px-8 py-7 pb-24">

      {/* Breadcrumb */}
      <nav className="mb-[22px] flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link to="/interviews" className="text-muted-foreground no-underline transition-colors hover:text-secondary-foreground">
          Interviews
        </Link>
        <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4l4 4-4 4" />
        </svg>
        <span className="text-secondary-foreground">Schedule interview</span>
      </nav>

      {/* Page header */}
      <section className="mb-7">
        <h1 className="mb-1 text-[30px] font-semibold leading-none tracking-[-0.02em] text-foreground">
          Schedule interview
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Log an upcoming round so you can track outcomes and keep your pipeline accurate.
        </p>
      </section>

      {/* ── JOB ── */}
      <Section title="Application" aside={<>Required fields marked <span className="text-indigo">*</span></>}>
        <FieldCard>
          <Field label={<>Job <ReqStar /></>} error={errors.jobId}>
            <div ref={inputWrapperRef}>
              <div className={cn(
                'flex cursor-text items-center gap-2.5 rounded-[8px] border border-transparent px-3 py-1 transition-colors',
                'hover:bg-[#fbfaf6] focus-within:border-indigo focus-within:bg-white focus-within:ring-[3px] focus-within:ring-indigo/10',
                errors.jobId && 'border-red-400 ring-[3px] ring-red-400/10',
              )}>
                <input
                  type="text"
                  value={form.jobSearch}
                  onChange={(e) => {
                    set('jobSearch', e.target.value);
                    setForm((f) => ({ ...f, jobId: null }));
                    setUrlInput('');
                    setUrlStatus('idle');
                    openDropdown();
                  }}
                  onFocus={openDropdown}
                  placeholder="Search by job title or company…"
                  className="flex-1 border-none bg-transparent py-1.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/50"
                />
                <svg className="size-3.5 shrink-0 text-muted-foreground/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </div>
            </div>
            {jobDropdownOpen && createPortal(
              <div
                ref={dropdownRef}
                style={{ position: 'fixed', top: jobDropdownPos.top, left: jobDropdownPos.left, width: jobDropdownPos.width, zIndex: 50 }}
                className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_4px_16px_-8px_rgba(31,29,26,.18)]"
              >
                {filteredJobs.length === 0 ? (
                  <div className="px-4 py-3 text-[13px] text-muted-foreground">
                    No jobs found. <Link to="/jobs/new" className="text-indigo underline">Add one first</Link>
                  </div>
                ) : (
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {filteredJobs.map((j) => (
                      <li key={j.id}>
                        <button
                          type="button"
                          onMouseDown={() => selectJob(j)}
                          className={cn(
                            'flex w-full cursor-pointer flex-col px-4 py-2.5 text-left transition-colors hover:bg-background',
                            form.jobId === j.id && 'text-indigo',
                          )}
                        >
                          <span className="text-[13.5px] font-medium text-foreground">{j.jobTitle}</span>
                          <span className="text-[12px] text-muted-foreground">{j.companyName}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>,
              document.body,
            )}
          </Field>
          <Field label={<>Job URL <OptLabel /></>}>
            <div className="flex items-center gap-2.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlStatus('idle'); }}
                placeholder="Paste a job posting URL to auto-select…"
                className={cn(fieldInputCls(), 'flex-1')}
              />
              {urlStatus === 'loading' && (
                <span className="shrink-0 text-[12px] text-muted-foreground">Matching…</span>
              )}
              {urlStatus === 'found' && (
                <span className="flex shrink-0 items-center gap-1 text-[12px] text-emerald-600">
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8l4 4 6-6" />
                  </svg>
                  Job matched
                </span>
              )}
              {urlStatus === 'not-found' && (
                <span className="shrink-0 text-[12px] text-muted-foreground/70">No match found</span>
              )}
            </div>
          </Field>
        </FieldCard>
      </Section>

      {/* ── ROUND ── */}
      <Section title="Round">
        <FieldCard>
          <Field label={<>Round name <ReqStar /></>} alignTop error={errors.roundName}>
            <div>
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {QUICK_ROUNDS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set('roundName', r)}
                    className={cn(
                      'inline-flex cursor-pointer items-center rounded-full border px-3 py-[5px] text-[12.5px] font-medium transition-colors',
                      form.roundName === r
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-[#ddd7c7] bg-card text-secondary-foreground hover:bg-[#fbfaf6]',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={form.roundName}
                onChange={(e) => set('roundName', e.target.value)}
                placeholder="Or type a custom round name…"
                maxLength={100}
                className={fieldInputCls(!!errors.roundName)}
              />
            </div>
          </Field>
        </FieldCard>
      </Section>

      {/* ── WHEN ── */}
      <Section title="When">
        <FieldCard>
          <Field label={<>Date <OptLabel /></>}>
            <div className="relative max-w-[200px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="12" height="11" rx="1.5" />
                  <path d="M2 6.5h12M5.5 2v2M10.5 2v2" />
                </svg>
              </span>
              <input
                type="date"
                value={form.interviewDate}
                onChange={(e) => set('interviewDate', e.target.value)}
                className={cn(fieldInputCls(), 'pl-9 font-mono text-[13px]')}
              />
            </div>
          </Field>
        </FieldCard>
      </Section>

      {/* ── NOTES ── */}
      <Section title="Notes">
        <FieldCard>
          <Field label={<>Notes <OptLabel /></>} alignTop>
            <div>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Topics to prepare, questions to ask, links to study materials…"
                rows={5}
                className={textareaCls}
              />
              <div className="mt-1.5 text-right font-mono text-[12px] text-muted-foreground/60">
                {form.notes.length} / 5000
              </div>
            </div>
          </Field>
        </FieldCard>
      </Section>

      {/* Sticky footer */}
      <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-3 rounded-[12px] border border-[#ddd7c7] bg-card px-[18px] py-3 shadow-[0_4px_16px_-8px_rgba(31,29,26,.16),0_1px_2px_rgba(31,29,26,.04)]">
        <div className="text-[12.5px]">
          {submitError ? (
            <span className="text-red-500">{submitError}</span>
          ) : (
            <span className="text-muted-foreground">Fill in the details above</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/interviews')}
            disabled={submitting}
            className="cursor-pointer rounded-[9px] border border-transparent px-2.5 py-2 text-[13.5px] text-muted-foreground transition-colors hover:bg-background hover:text-secondary-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] bg-foreground px-3.5 py-2 text-[13.5px] font-medium text-background transition-colors hover:bg-[#2d2a26] disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Schedule interview'}
          </button>
        </div>
      </div>

    </main>
  );
}

/* ── Sub-components ── */

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3.5 flex items-baseline justify-between">
        <h2 className="m-0 text-[13px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{title}</h2>
        {aside && <span className="text-[12px] text-muted-foreground/60">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function FieldCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]">
      {children}
    </div>
  );
}

function Field({
  label, children, alignTop = false, error,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  alignTop?: boolean;
  error?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-5 border-b border-border px-[22px] py-[14px] last:border-b-0',
        alignTop ? 'items-start' : 'items-center',
      )}
      style={{ gridTemplateColumns: '140px 1fr' }}
    >
      <div className={cn('text-[13px] font-medium text-secondary-foreground', alignTop && 'pt-2.5')}>
        {label}
        {error && <div className="mt-0.5 text-[11.5px] font-normal text-red-500">{error}</div>}
      </div>
      {children}
    </div>
  );
}

function ReqStar() {
  return <span className="ml-1 text-[12px] text-indigo">*</span>;
}

function OptLabel() {
  return <span className="ml-1 text-[11.5px] font-normal text-muted-foreground/60">optional</span>;
}

const fieldInputCls = (hasError = false) =>
  cn(
    'w-full rounded-[8px] border border-transparent bg-transparent px-3 py-2 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50',
    'hover:bg-[#fbfaf6] focus:border-indigo focus:bg-white focus:ring-[3px] focus:ring-indigo/10',
    hasError && 'border-red-400 ring-[3px] ring-red-400/10',
  );

const textareaCls =
  'w-full resize-y rounded-[8px] border border-transparent bg-transparent px-3 py-2.5 text-[14px] leading-[1.55] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 hover:bg-[#fbfaf6] focus:border-indigo focus:bg-white focus:ring-[3px] focus:ring-indigo/10 min-h-[110px]';
