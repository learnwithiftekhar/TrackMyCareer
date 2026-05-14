import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getCompanies, type Company } from '@/api/companies';
import { createJob } from '@/api/jobs';

type Status = 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

const STATUSES: { value: Status; swatch: string }[] = [
  { value: 'Wishlist',  swatch: 'bg-wish' },
  { value: 'Applied',   swatch: 'bg-applied' },
  { value: 'Interview', swatch: 'bg-intv' },
  { value: 'Offer',     swatch: 'bg-offer' },
  { value: 'Rejected',  swatch: 'bg-rej' },
];

const SOURCES = ['LinkedIn', 'Indeed', 'Company site', 'Referral', 'AngelList', 'Glassdoor', 'Other'];

function avatarLetter(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function avatarBg(letter: string) {
  const palette = ['#635bff', '#0d0d0d', '#2f8a5c', '#b8854a', '#4f46e5', '#9c8d6d', '#b04a3f'];
  const idx = (letter.charCodeAt(0) - 65) % palette.length;
  return palette[Math.max(0, idx)];
}

interface FormState {
  jobTitle: string;
  companyId: number | null;
  companySearch: string;
  jobUrl: string;
  status: Status;
  appliedDate: string;
  deadline: string;
  source: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  coverLetter: string;
}

export default function NewApplication() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    jobTitle: '',
    companyId: null,
    companySearch: '',
    jobUrl: '',
    status: 'Applied',
    appliedDate: '',
    deadline: '',
    source: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    coverLetter: '',
  });
  const [pasteUrl, setPasteUrl] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCompanies().then(setCompanies).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanyDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  const filteredCompanies = form.companySearch
    ? companies.filter((c) => c.companyName.toLowerCase().includes(form.companySearch.toLowerCase()))
    : companies;

  function selectCompany(company: Company) {
    setForm((f) => ({ ...f, companyId: company.id, companySearch: company.companyName }));
    setErrors((e) => ({ ...e, companyId: undefined }));
    setCompanyDropdownOpen(false);
  }

  function validate() {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.jobTitle.trim()) e.jobTitle = 'Job title is required';
    if (!form.companyId)       e.companyId = 'Company is required';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const salaryRange = [form.salaryMin, form.salaryMax].filter(Boolean).join(' - ') || undefined;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const job = await createJob({
        jobTitle: form.jobTitle.trim(),
        companyId: form.companyId!,
        appliedStatus: form.status,
        jobDescription: form.description || undefined,
        coverLetter: form.coverLetter || undefined,
        appliedDate: form.appliedDate || undefined,
        deadline: form.deadline || undefined,
        jobUrl: form.jobUrl || undefined,
        jobSource: form.source || undefined,
        salaryRange,
      });
      navigate(`/jobs/${job.id}`);
    } catch {
      setSubmitError('Failed to save application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const letter = avatarLetter(form.companySearch);
  const bg     = form.companySearch ? avatarBg(letter) : '#b3afa3';

  return (
    <main className="mx-auto max-w-[880px] px-8 py-7 pb-24">

      {/* Breadcrumb */}
      <nav className="mb-[22px] flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link to="/jobs" className="text-muted-foreground no-underline transition-colors hover:text-secondary-foreground">
          All Jobs
        </Link>
        <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4l4 4-4 4" />
        </svg>
        <span className="text-secondary-foreground">New application</span>
      </nav>

      {/* Page header */}
      <section className="mb-7">
        <h1 className="mb-1 text-[30px] font-semibold leading-none tracking-[-0.02em] text-foreground">
          New application
        </h1>
        <p className="text-[14px] text-muted-foreground">Add a job to your tracker. Takes about 20 seconds.</p>
      </section>

      {/* Paste URL card */}
      <section className="mb-8 grid grid-cols-[38px_1fr_auto] items-center gap-4 rounded-[14px] border border-[#d8dafd] bg-gradient-to-b from-[#eef0ff] to-white p-[18px_20px]">
        <div className="grid size-[38px] place-items-center rounded-[10px] border border-[#dadcfa] bg-white text-indigo">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 9l2-2a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0" />
            <path d="M9 7l-2 2a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0" />
          </svg>
        </div>
        <div>
          <h3 className="m-0 text-[14px] font-semibold text-foreground">Paste a job URL to autofill</h3>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">We'll pull the company, role, and description from the listing.</p>
        </div>
        <div />
        <div className="col-span-3 mt-1 flex gap-2">
          <input
            type="text"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder="https://stripe.com/jobs/listing/…"
            className="flex-1 rounded-[10px] border border-[#dadcfa] bg-white px-[14px] py-2.5 font-mono text-[13px] text-foreground outline-none placeholder:font-sans placeholder:text-muted-foreground/50 focus:border-indigo focus:ring-[3px] focus:ring-indigo/10"
          />
          <button className="cursor-pointer rounded-[10px] bg-indigo px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#4338ca]">
            Autofill
          </button>
        </div>
      </section>

      {/* Divider */}
      <div className="mb-6 flex items-center gap-3.5 text-[12px] uppercase tracking-[0.08em] text-muted-foreground before:h-px before:flex-1 before:bg-[#ddd7c7] after:h-px after:flex-1 after:bg-[#ddd7c7]">
        Or fill in manually
      </div>

      {/* ── ROLE ── */}
      <Section title="Role" aside={<>Required fields marked <span className="text-indigo">*</span></>}>
        <FieldCard>

          {/* Job title */}
          <Field label={<>Job title <ReqStar /></>} error={errors.jobTitle}>
            <input
              type="text"
              value={form.jobTitle}
              onChange={(e) => set('jobTitle', e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className={fieldInputCls(!!errors.jobTitle)}
            />
          </Field>

          {/* Company */}
          <Field label={<>Company <ReqStar /></>} error={errors.companyId}>
            <div ref={companyRef} className="relative">
              <div
                className={cn(
                  'flex cursor-text items-center gap-2.5 rounded-[8px] border border-transparent px-1 py-1 pr-3 transition-colors',
                  'hover:bg-[#fbfaf6] focus-within:border-indigo focus-within:bg-white focus-within:ring-[3px] focus-within:ring-indigo/10',
                  errors.companyId && 'border-red-400 ring-[3px] ring-red-400/10',
                )}
              >
                <div
                  className="grid size-[30px] shrink-0 place-items-center rounded-[8px] text-[13px] font-semibold text-white"
                  style={{ background: bg }}
                >
                  {letter}
                </div>
                <input
                  type="text"
                  value={form.companySearch}
                  onChange={(e) => {
                    set('companySearch', e.target.value);
                    setForm((f) => ({ ...f, companyId: null }));
                    setCompanyDropdownOpen(true);
                  }}
                  onFocus={() => setCompanyDropdownOpen(true)}
                  placeholder="Type a company name…"
                  className="flex-1 border-none bg-transparent py-2 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/50"
                />
                <svg className="size-3.5 shrink-0 text-muted-foreground/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </div>
              {companyDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_4px_16px_-8px_rgba(31,29,26,.18)]">
                  {filteredCompanies.length === 0 ? (
                    <div className="px-4 py-3 text-[13px] text-muted-foreground">
                      No companies found.{' '}
                      <Link to="/companies" className="text-indigo underline">Add one first</Link>
                    </div>
                  ) : (
                    <ul className="max-h-48 overflow-y-auto py-1">
                      {filteredCompanies.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onMouseDown={() => selectCompany(c)}
                            className={cn(
                              'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-[13.5px] transition-colors hover:bg-background',
                              form.companyId === c.id && 'text-indigo',
                            )}
                          >
                            <div
                              className="grid size-[22px] shrink-0 place-items-center rounded-[6px] text-[11px] font-semibold text-white"
                              style={{ background: avatarBg(avatarLetter(c.companyName)) }}
                            >
                              {avatarLetter(c.companyName)}
                            </div>
                            {c.companyName}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </Field>

          {/* Job URL */}
          <Field label="Job URL">
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 9l2-2a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0" />
                  <path d="M9 7l-2 2a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0" />
                </svg>
              </span>
              <input
                type="url"
                value={form.jobUrl}
                onChange={(e) => set('jobUrl', e.target.value)}
                placeholder="https://…"
                className={cn(fieldInputCls(), 'pl-9')}
              />
            </div>
          </Field>

        </FieldCard>
      </Section>

      {/* ── TIMELINE ── */}
      <Section title="Timeline">
        <FieldCard>

          {/* Status */}
          <Field label="Status">
            <div className="flex gap-1 rounded-[10px] border border-border bg-background p-[3px]">
              {STATUSES.map(({ value, swatch }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('status', value)}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border px-3 py-[6px] text-[12.5px] font-medium transition-colors',
                    form.status === value
                      ? 'border-[#ddd7c7] bg-card text-foreground shadow-[0_1px_0_rgba(31,29,26,.04)]'
                      : 'border-transparent bg-transparent text-muted-foreground hover:text-secondary-foreground',
                  )}
                >
                  <span className={cn('size-[7px] shrink-0 rounded-full', swatch)} />
                  {value}
                </button>
              ))}
            </div>
          </Field>

          {/* Applied on */}
          <Field label="Applied on">
            <div className="flex items-center gap-3">
              <div className="relative" style={{ maxWidth: 200 }}>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="12" height="11" rx="1.5" />
                    <path d="M2 6.5h12M5.5 2v2M10.5 2v2" />
                  </svg>
                </span>
                <input
                  type="date"
                  value={form.appliedDate}
                  onChange={(e) => set('appliedDate', e.target.value)}
                  className={cn(fieldInputCls(), 'pl-9 font-mono text-[13px]')}
                />
              </div>
              {form.appliedDate && (
                <span className="text-[12.5px] text-muted-foreground">
                  {relativeDate(form.appliedDate)}
                </span>
              )}
            </div>
          </Field>

          {/* Deadline */}
          <Field label={<>Deadline <OptLabel /></>}>
            <div className="flex items-center gap-3">
              <div className="relative" style={{ maxWidth: 200 }}>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="6" />
                    <path d="M8 5v3.2L10 10" />
                  </svg>
                </span>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set('deadline', e.target.value)}
                  className={cn(fieldInputCls(), 'pl-9 font-mono text-[13px]')}
                />
              </div>
              {form.deadline && <DeadlineHint date={form.deadline} />}
            </div>
          </Field>

        </FieldCard>
      </Section>

      {/* ── DETAILS ── */}
      <Section title="Details">
        <FieldCard>

          {/* Source */}
          <Field label="Source">
            <div className="relative max-w-[280px]">
              <select
                value={form.source}
                onChange={(e) => set('source', e.target.value)}
                className={cn(
                  fieldInputCls(),
                  'appearance-none pr-8',
                  !form.source && 'text-muted-foreground/50',
                )}
              >
                <option value="" disabled>Select source…</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </div>
          </Field>

          {/* Salary */}
          <Field label={<>Salary <OptLabel /></>}>
            <div className="grid items-center gap-2" style={{ gridTemplateColumns: '64px 1fr 1fr 56px', maxWidth: 400 }}>
              <div className="flex items-center justify-center gap-1 rounded-[8px] border border-[#ddd7c7] bg-[#fbfaf6] px-2.5 py-2 text-[13px] font-medium text-secondary-foreground">
                USD
                <svg className="size-3 text-muted-foreground/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </div>
              <input
                type="text"
                value={form.salaryMin}
                onChange={(e) => set('salaryMin', e.target.value)}
                placeholder="100,000"
                className={cn(fieldInputCls(), 'text-right font-mono text-[13px]')}
              />
              <input
                type="text"
                value={form.salaryMax}
                onChange={(e) => set('salaryMax', e.target.value)}
                placeholder="150,000"
                className={cn(fieldInputCls(), 'text-right font-mono text-[13px]')}
              />
              <div className="text-center text-[12.5px] text-muted-foreground">/ year</div>
            </div>
          </Field>

        </FieldCard>
      </Section>

      {/* ── CONTENT ── */}
      <Section title="Content" aside="Saved as part of this application">
        <FieldCard>

          {/* Description */}
          <Field label="Description" alignTop>
            <div>
              <div className="flex gap-0.5 rounded-t-[8px] border border-b-0 border-border bg-[#fbfaf6] p-[6px_8px]">
                <EditorBtn label="B" style={{ fontWeight: 700 }} />
                <EditorBtn label="I" style={{ fontStyle: 'italic' }} />
                <EditorBtn label="U" style={{ textDecoration: 'underline' }} />
                <div className="mx-1 h-4 w-px self-center bg-[#ddd7c7]" />
                <EditorBtn label="H1" />
                <EditorBtn label="H2" />
                <div className="mx-1 h-4 w-px self-center bg-[#ddd7c7]" />
                <EditorBtn>
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="4" cy="5" r=".5" fill="currentColor" /><circle cx="4" cy="8" r=".5" fill="currentColor" /><circle cx="4" cy="11" r=".5" fill="currentColor" />
                    <path d="M7 5h7M7 8h7M7 11h7" />
                  </svg>
                </EditorBtn>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Paste or write the job description…"
                rows={8}
                className="w-full resize-y rounded-b-[8px] border border-t-0 border-border bg-transparent px-[14px] py-3 text-[14px] leading-[1.55] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-indigo focus:bg-white focus:ring-[3px] focus:ring-indigo/10"
              />
              <div className="mt-1.5 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Markdown supported</span>
                <span className="font-mono text-muted-foreground/60">{form.description.length} / 5000</span>
              </div>
            </div>
          </Field>

          {/* Cover letter */}
          <Field label={<>Cover letter <OptLabel /></>} alignTop>
            <div>
              <textarea
                value={form.coverLetter}
                onChange={(e) => set('coverLetter', e.target.value)}
                placeholder="Draft your cover letter here. You can copy it into the application later."
                rows={5}
                className={cn(textareaCls)}
              />
              <div className="mt-1.5 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>You can generate a first draft from the job description.</span>
                <button type="button" className="inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-transparent px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-background hover:text-secondary-foreground">
                  <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2l1.5 4L14 7.5l-4.5 1.5L8 13l-1.5-4L2 7.5 6.5 6z" />
                  </svg>
                  Generate draft
                </button>
              </div>
            </div>
          </Field>

        </FieldCard>
      </Section>

      {/* Sticky footer */}
      <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-3 rounded-[12px] border border-[#ddd7c7] bg-card px-[18px] py-3 shadow-[0_4px_16px_-8px_rgba(31,29,26,.16),0_1px_2px_rgba(31,29,26,.04)]">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
          {submitError ? (
            <span className="text-red-500">{submitError}</span>
          ) : (
            <>
              <span className="size-1.5 rounded-full bg-offer" />
              Fill in the details above
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
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
            {submitting ? 'Saving…' : 'Save application'}
            {!submitting && <span className="rounded-[4px] bg-white/[0.12] px-[5px] py-px font-mono text-[11px] opacity-70">⌘↵</span>}
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
    <div className={cn(
      'grid gap-5 border-b border-border px-[22px] py-[14px] last:border-b-0',
      alignTop ? 'items-start' : 'items-center',
    )} style={{ gridTemplateColumns: '140px 1fr' }}>
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

function EditorBtn({ label, style, children }: { label?: string; style?: React.CSSProperties; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      style={style}
      className="inline-flex cursor-pointer items-center rounded-[5px] border border-transparent px-[7px] py-1 font-mono text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-secondary-foreground"
    >
      {label ?? children}
    </button>
  );
}

const fieldInputCls = (hasError = false) =>
  cn(
    'w-full rounded-[8px] border border-transparent bg-transparent px-3 py-2 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50',
    'hover:bg-[#fbfaf6] focus:border-indigo focus:bg-white focus:ring-[3px] focus:ring-indigo/10',
    hasError && 'border-red-400 ring-[3px] ring-red-400/10',
  );

const textareaCls =
  'w-full resize-y rounded-[8px] border border-transparent bg-transparent px-3 py-2.5 text-[14px] leading-[1.55] text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 hover:bg-[#fbfaf6] focus:border-indigo focus:bg-white focus:ring-[3px] focus:ring-indigo/10';

function relativeDate(iso: string) {
  const diff = Math.round((Date.parse(iso) - Date.now()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 0) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}

function DeadlineHint({ date }: { date: string }) {
  const diff = Math.round((Date.parse(date) - Date.now()) / 86400000);
  const label = relativeDate(date);
  const urgent = diff >= 0 && diff <= 1;
  const soon   = diff >= 2 && diff <= 3;
  return (
    <span className={cn(
      'whitespace-nowrap rounded-full border px-[9px] py-0.5 text-[12px] font-medium',
      urgent && 'border-[#f1cfc6] bg-[#fbeae6] text-[#94352a]',
      soon   && 'border-[#f6e0cf] bg-[#fef3ec] text-[#8a4a1c]',
      !urgent && !soon && 'border-border bg-secondary text-secondary-foreground',
    )}>
      {label}
    </span>
  );
}
