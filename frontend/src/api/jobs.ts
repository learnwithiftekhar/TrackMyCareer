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
}): Promise<JobPage> {
  const url = new URL(BASE);
  if (params.page != null) url.searchParams.set('page', String(params.page));
  if (params.size != null) url.searchParams.set('size', String(params.size));
  if (params.search) url.searchParams.set('search', params.search);
  if (params.status) url.searchParams.set('status', params.status);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function getStatusCounts(): Promise<StatusCounts> {
  const res = await fetch(`${BASE}/status/count`);
  if (!res.ok) throw new Error('Failed to fetch status counts');
  return res.json();
}
