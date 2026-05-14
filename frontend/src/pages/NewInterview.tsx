import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type RoundType = 'Recruiter screen' | 'Technical' | 'System Design' | 'Portfolio' | 'Hiring manager' | 'Onsite / Final';
type Format = 'Video' | 'Phone' | 'Onsite';

const ROUND_TYPES: { value: RoundType; dot: string }[] = [
  { value: 'Recruiter screen', dot: 'bg-muted-foreground' },
  { value: 'Technical',        dot: 'bg-applied' },
  { value: 'System Design',    dot: 'bg-[#6f3bcc]' },
  { value: 'Portfolio',        dot: 'bg-intv' },
  { value: 'Hiring manager',   dot: 'bg-rej' },
  { value: 'Onsite / Final',   dot: 'bg-offer' },
];

const STAGE_OPTIONS = ['Round 1 of 2', 'Round 1 of 3', 'Round 1 of 4', 'Round 2 of 3', 'Round 2 of 4', 'Round 3 of 4', 'Final round'];

const TIMEZONES = [
  { label: 'America / Los_Angeles', offset: 'UTC−07:00' },
  { label: 'America / New_York',    offset: 'UTC−04:00' },
  { label: 'America / Chicago',     offset: 'UTC−05:00' },
  { label: 'Europe / London',       offset: 'UTC+01:00' },
  { label: 'Asia / Kolkata',        offset: 'UTC+05:30' },
];

interface Interviewer {
  id: number;
  name: string;
  role: string;
  color: string;
  initials: string;
}

interface FormState {
  roundType: RoundType | '';
  title: string;
  stage: string;
  date: string;
  time: string;
  duration: string;
  timezone: string;
  format: Format;
  meetingLink: string;
  notes: string;
  reminder24h: boolean;
  reminder1h: boolean;
  reminder10m: boolean;
  addToCalendar: boolean;
}

function initials(name: string) {
  return name.trim().split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ['#635bff', '#0d0d0d', '#2f8a5c', '#b8854a', '#4f46e5', '#9c8d6d'];
function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function NewInterview() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    roundType: '',
    title: '',
    stage: '',
    date: '',
    time: '',
    duration: '60 min',
    timezone: 'America / Los_Angeles',
    format: 'Video',
    meetingLink: '',
    notes: '',
    reminder24h: true,
    reminder1h: true,
    reminder10m: false,
    addToCalendar: true,
  });

  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [interviewerInput, setInterviewerInput] = useState('');
  const [errors, setErrors] = useState<{ roundType?: string; title?: string; date?: string }>({});

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function addInterviewer(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && interviewerInput.trim()) {
      e.preventDefault();
      const name = interviewerInput.trim();
      setInterviewers((prev) => [
        ...prev,
        { id: Date.now(), name, role: '', color: avatarColor(name), initials: initials(name) },
      ]);
      setInterviewerInput('');
    }
  }

  function removeInterviewer(id: number) {
    setInterviewers((prev) => prev.filter((i) => i.id !== id));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.roundType) e.roundType = 'Round type is required';
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.date) e.date = 'Date is required';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    navigate('/interviews');
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
          Log an upcoming round so you can prep, track outcomes, and keep your pipeline accurate.
        </p>
      </section>

      {/* Linked application banner */}
      <section className="relative mb-7 grid items-center gap-3.5 overflow-hidden rounded-[14px] border border-border bg-card p-[16px_20px] shadow-[0_1px_0_rgba(31,29,26,.02),0_1px_2px_rgba(31,29,26,.03)]" style={{ gridTemplateColumns: '44px 1fr auto' }}>
        <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-intv" />
        <div className="grid size-11 place-items-center rounded-[11px] bg-[#635bff] text-[18px] font-semibold leading-none tracking-[-0.02em] text-white">
          S
        </div>
        <div>
          <div className="mb-1 text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            For application
          </div>
          <div className="mb-0.5 text-[15px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
            Senior Software Engineer, Platform
          </div>
          <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <span className="font-medium text-secondary-foreground">Stripe</span>
            <span className="text-muted-foreground/40">·</span>
            <span>Applied May 02</span>
            <span className="text-muted-foreground/40">·</span>
            <span>2 rounds completed</span>
          </div>
        </div>
        <button
          type="button"
          className="cursor-pointer rounded-[8px] border border-[#ddd7c7] bg-transparent px-3 py-1.5 text-[12.5px] font-medium text-secondary-foreground transition-colors hover:bg-[#fbfaf6]"
        >
          Change
        </button>
      </section>

      {/* ── ROUND ── */}
      <Section title="Round" aside={<>Required fields marked <span className="text-indigo">*</span></>}>
        <FieldCard>

          {/* Type */}
          <Field label={<>Type <ReqStar /></>} alignTop error={errors.roundType}>
            <div className="flex flex-wrap gap-1.5">
              {ROUND_TYPES.map(({ value, dot }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setField('roundType', value)}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-[6px] text-[12.5px] font-medium font-[inherit] transition-colors',
                    form.roundType === value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-[#ddd7c7] bg-card text-secondary-foreground hover:bg-[#fbfaf6]',
                  )}
                >
                  <span className={cn('size-1.5 shrink-0 rounded-full', dot,
                    form.roundType === value && 'shadow-[0_0_0_1.5px_rgba(255,255,255,0.25)]'
                  )} />
                  {value}
                </button>
              ))}
            </div>
          </Field>

          {/* Title */}
          <Field label={<>Title <ReqStar /></>} error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g. Technical Round 2 — System Design"
              className={fieldInputCls(!!errors.title)}
            />
          </Field>

          {/* Stage */}
          <Field label={<>Stage <OptLabel /></>}>
            <div className="relative max-w-[280px]">
              <select
                value={form.stage}
                onChange={(e) => setField('stage', e.target.value)}
                className={cn(fieldInputCls(), 'appearance-none pr-8', !form.stage && 'text-muted-foreground/50')}
              >
                <option value="" disabled>Select stage…</option>
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </div>
          </Field>

        </FieldCard>
      </Section>

      {/* ── WHEN ── */}
      <Section title="When">
        <FieldCard>

          {/* Date & time */}
          <Field label={<>Date &amp; time <ReqStar /></>} alignTop error={errors.date}>
            <div>
              <div className="grid items-center gap-2" style={{ gridTemplateColumns: '1fr 1fr 110px' }}>
                {/* Date */}
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="12" height="11" rx="1.5" />
                      <path d="M2 6.5h12M5.5 2v2M10.5 2v2" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setField('date', e.target.value)}
                    className={cn(fieldInputCls(!!errors.date), 'pl-9 font-mono text-[13px]')}
                  />
                </div>
                {/* Time */}
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="8" r="6" />
                      <path d="M8 5v3.2L10 10" />
                    </svg>
                  </span>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setField('time', e.target.value)}
                    className={cn(fieldInputCls(), 'pl-9 font-mono text-[13px]')}
                  />
                </div>
                {/* Duration */}
                <div className="relative">
                  <select
                    value={form.duration}
                    onChange={(e) => setField('duration', e.target.value)}
                    className={cn(fieldInputCls(), 'appearance-none pr-8')}
                  >
                    {['30 min', '45 min', '60 min', '90 min', '120 min'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </div>
              </div>
              {form.date && form.time && (
                <div className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe7d7] bg-[#e8f4ec] px-2 py-0.5 text-[11.5px] text-[#2f8a5c]">
                    <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8.5l3 3 7-7" />
                    </svg>
                    No conflict with other interviews
                  </span>
                </div>
              )}
            </div>
          </Field>

          {/* Timezone */}
          <Field label="Timezone">
            <div className="relative max-w-[320px]">
              <select
                value={form.timezone}
                onChange={(e) => setField('timezone', e.target.value)}
                className={cn(fieldInputCls(), 'appearance-none pr-8')}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.label} value={tz.label}>{tz.label} — {tz.offset}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </div>
          </Field>

        </FieldCard>
      </Section>

      {/* ── FORMAT ── */}
      <Section title="Format">
        <FieldCard>

          {/* Format segmented */}
          <Field label="Format">
            <div className="flex gap-1 rounded-[10px] border border-border bg-background p-[3px]">
              {(['Video', 'Phone', 'Onsite'] as Format[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setField('format', f)}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border px-3 py-[6px] text-[12.5px] font-medium transition-colors',
                    form.format === f
                      ? 'border-[#ddd7c7] bg-card text-foreground shadow-[0_1px_0_rgba(31,29,26,.04)]'
                      : 'border-transparent bg-transparent text-muted-foreground hover:text-secondary-foreground',
                  )}
                >
                  {f === 'Video' && (
                    <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="9" height="8" rx="1.5" />
                      <path d="M11 7l3-2v6l-3-2z" />
                    </svg>
                  )}
                  {f === 'Phone' && (
                    <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3.5a1.5 1.5 0 0 1 1.5-1.5h1.7a1 1 0 0 1 .98.8l.45 2.25a1 1 0 0 1-.27.96L6.3 7.07a8 8 0 0 0 2.63 2.63l1.06-1.06a1 1 0 0 1 .96-.27l2.25.45a1 1 0 0 1 .8.98v1.7a1.5 1.5 0 0 1-1.5 1.5C7.5 13 3 8.5 3 3.5z" />
                    </svg>
                  )}
                  {f === 'Onsite' && (
                    <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 14s-5-4.5-5-8a5 5 0 0 1 10 0c0 3.5-5 8-5 8z" />
                      <circle cx="8" cy="6.2" r="1.8" />
                    </svg>
                  )}
                  {f}
                </button>
              ))}
            </div>
          </Field>

          {/* Meeting link */}
          <Field label={form.format === 'Onsite' ? <>Location <OptLabel /></> : <>Meeting link <OptLabel /></>}>
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                {form.format === 'Onsite' ? (
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 14s-5-4.5-5-8a5 5 0 0 1 10 0c0 3.5-5 8-5 8z" />
                    <circle cx="8" cy="6.2" r="1.8" />
                  </svg>
                ) : (
                  <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 9l2-2a2.5 2.5 0 0 1 3.5 3.5l-2 2a2.5 2.5 0 0 1-3.5 0" />
                    <path d="M9 7l-2 2a2.5 2.5 0 0 1-3.5-3.5l2-2a2.5 2.5 0 0 1 3.5 0" />
                  </svg>
                )}
              </span>
              <input
                type={form.format === 'Onsite' ? 'text' : 'url'}
                value={form.meetingLink}
                onChange={(e) => setField('meetingLink', e.target.value)}
                placeholder={form.format === 'Onsite' ? '123 Main St, San Francisco, CA…' : 'https://meet.google.com/…'}
                className={cn(fieldInputCls(), 'pl-9')}
              />
            </div>
          </Field>

        </FieldCard>
      </Section>

      {/* ── PEOPLE ── */}
      <Section title="People">
        <FieldCard>

          <Field label={<>Interviewers <OptLabel /></>} alignTop>
            <div>
              <div
                className={cn(
                  'flex flex-wrap gap-1.5 rounded-[8px] border border-transparent p-[6px_8px] transition-colors',
                  'hover:bg-[#fbfaf6] focus-within:border-indigo focus-within:bg-white focus-within:ring-[3px] focus-within:ring-indigo/10',
                )}
              >
                {interviewers.map((iv) => (
                  <span
                    key={iv.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[#fbfaf6] px-1 py-[3px] text-[13px] text-foreground"
                  >
                    <span
                      className="grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
                      style={{ background: iv.color }}
                    >
                      {iv.initials}
                    </span>
                    <span className="mr-1">{iv.name}</span>
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() => removeInterviewer(iv.id)}
                      className="grid size-[18px] cursor-pointer place-items-center rounded-full border-none bg-[rgba(31,29,26,0.06)] text-muted-foreground transition-colors hover:bg-[rgba(31,29,26,0.12)] hover:text-secondary-foreground"
                    >
                      <svg className="size-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                        <path d="M4 4l8 8M12 4l-8 8" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={interviewerInput}
                  onChange={(e) => setInterviewerInput(e.target.value)}
                  onKeyDown={addInterviewer}
                  placeholder={interviewers.length === 0 ? 'Add interviewer… (press Enter)' : 'Add another…'}
                  className="min-w-[140px] flex-1 border-none bg-transparent px-1.5 py-1 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="6" r="2.5" />
                  <path d="M3 13c.8-2 2.7-3 5-3s4.2 1 5 3" />
                </svg>
                Type a name and press Enter to add.
              </div>
            </div>
          </Field>

        </FieldCard>
      </Section>

      {/* ── PREP ── */}
      <Section title="Prep" aside="Visible on the application's interview page">
        <FieldCard>

          {/* Notes */}
          <Field label={<>Notes <OptLabel /></>} alignTop>
            <div>
              <textarea
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Topics likely to be covered, questions to prepare, what to ask the panel…"
                rows={5}
                className={textareaCls}
              />
              <div className="mt-1.5 flex items-center justify-between text-[12px] text-muted-foreground">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[12px] font-medium text-indigo transition-colors hover:underline"
                >
                  <svg className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2l1.5 4L14 7.5l-4.5 1.5L8 13l-1.5-4L2 7.5 6.5 6z" />
                  </svg>
                  Suggest prep topics from job description
                </button>
                <span className="font-mono text-muted-foreground/60">{form.notes.length} / 5000</span>
              </div>
            </div>
          </Field>

          {/* Reminder */}
          <Field label="Reminder">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-secondary-foreground">
                <input
                  type="checkbox"
                  checked={form.reminder24h}
                  onChange={(e) => setField('reminder24h', e.target.checked)}
                  className="size-4 accent-indigo"
                />
                24h before
              </label>
              <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-secondary-foreground">
                <input
                  type="checkbox"
                  checked={form.reminder1h}
                  onChange={(e) => setField('reminder1h', e.target.checked)}
                  className="size-4 accent-indigo"
                />
                1h before
              </label>
              <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-secondary-foreground">
                <input
                  type="checkbox"
                  checked={form.reminder10m}
                  onChange={(e) => setField('reminder10m', e.target.checked)}
                  className="size-4 accent-indigo"
                />
                10 min before
              </label>
              <span className="ml-1.5 text-[12px] text-muted-foreground">via email + push</span>
            </div>
          </Field>

          {/* Calendar */}
          <Field label="Calendar">
            <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-secondary-foreground">
              <input
                type="checkbox"
                checked={form.addToCalendar}
                onChange={(e) => setField('addToCalendar', e.target.checked)}
                className="size-4 accent-indigo"
              />
              Add to Google Calendar
              <span className="text-[12px] font-normal text-muted-foreground">— linked as andrew@example.com</span>
            </label>
          </Field>

        </FieldCard>
      </Section>

      {/* Sticky footer */}
      <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-3 rounded-[12px] border border-[#ddd7c7] bg-card px-[18px] py-3 shadow-[0_4px_16px_-8px_rgba(31,29,26,.16),0_1px_2px_rgba(31,29,26,.04)]">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-offer" />
          Draft saved a moment ago
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/interviews')}
            className="cursor-pointer rounded-[9px] border border-transparent px-2.5 py-2 text-[13.5px] text-muted-foreground transition-colors hover:bg-background hover:text-secondary-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-[9px] border border-[#ddd7c7] bg-transparent px-3.5 py-2 text-[13.5px] font-medium text-secondary-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] bg-foreground px-3.5 py-2 text-[13.5px] font-medium text-background transition-colors hover:bg-[#2d2a26]"
          >
            Schedule interview
            <span className="rounded-[4px] bg-white/[0.12] px-[5px] py-px font-mono text-[11px] opacity-70">⌘↵</span>
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
