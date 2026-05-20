const BASE = 'http://localhost:8080/api/jobs';

export interface Job {
  id: number;
  jobTitle: string;
  companyId: number;
  companyName: string;
  appliedStatus: string;
  jobDescription: string | null;
  coverLetter: string | null;
  appliedDate: string | null;
  deadline: string | null;
  jobUrl: string | null;
  jobSource: string | null;
  salaryRange: string | null;
  createdAt: string;
}

export interface InterviewSummary {
  id: number;
  roundName: string;
  interviewDate: string | null;
  notes: string | null;
}

export interface NoteSummary {
  id: number;
  note: string;
  createdAt: string;
}

export interface JobDetail extends Job {
  companyAbout: string | null;
  interviews: InterviewSummary[];
  notes: NoteSummary[];
}

export interface JobPage {
  content: Job[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type StatusCounts = Record<string, number>;

export async function getJobs(params: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  companyId?: number;
}): Promise<JobPage> {
  const url = new URL(BASE);
  if (params.page != null) url.searchParams.set('page', String(params.page));
  if (params.size != null) url.searchParams.set('size', String(params.size));
  if (params.search) url.searchParams.set('search', params.search);
  if (params.status) url.searchParams.set('status', params.status);
  if (params.sortBy) url.searchParams.set('sortBy', params.sortBy);
  if (params.sortDir) url.searchParams.set('sortDir', params.sortDir);
  if (params.companyId != null) url.searchParams.set('companyId', String(params.companyId));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function getStatusCounts(): Promise<StatusCounts> {
  const res = await fetch(`${BASE}/status/count`);
  if (!res.ok) throw new Error('Failed to fetch status counts');
  return res.json();
}

export interface JobCreateRequest {
  jobTitle: string;
  companyId: number;
  appliedStatus: string;
  jobDescription?: string;
  coverLetter?: string;
  appliedDate?: string;
  deadline?: string;
  jobUrl?: string;
  jobSource?: string;
  salaryRange?: string;
}

export async function getJob(id: number): Promise<JobDetail> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}

export async function createJob(data: JobCreateRequest): Promise<Job> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export interface AutofillResult {
  jobTitle: string | null;
  companyName: string | null;
  jobDescription: string | null;
  salaryRange: string | null;
  jobSource: string | null;
}

export async function autofillFromUrl(url: string): Promise<AutofillResult> {
  const res = await fetch(`${BASE}/autofill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? 'Failed to autofill');
  }
  return res.json();
}

export async function getJobByUrl(url: string): Promise<Job> {
  const endpoint = new URL(`${BASE}/by-url`);
  endpoint.searchParams.set('url', url);
  const res = await fetch(endpoint.toString());
  if (!res.ok) throw new Error('No job found for this URL');
  return res.json();
}

export async function generateCoverLetter(params: {
  jobTitle: string;
  companyName?: string;
  jobDescription?: string;
}): Promise<string> {
  const res = await fetch(`${BASE}/cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? 'Failed to generate cover letter');
  }
  const data = await res.json();
  return data.coverLetter as string;
}

export async function updateJob(id: number, data: JobCreateRequest): Promise<Job> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}
