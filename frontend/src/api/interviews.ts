const BASE = 'http://localhost:8080/api/interviews';

export interface Interview {
  id: number;
  roundName: string;
  interviewDate: string | null;
  notes: string | null;
  jobId: number;
  jobTitle: string;
  companyId: number;
  companyName: string;
}

export interface InterviewRequest {
  roundName: string;
  interviewDate?: string | null;
  notes?: string | null;
  jobId: number;
}

export async function getInterviews(jobId?: number): Promise<Interview[]> {
  const url = new URL(BASE);
  if (jobId != null) url.searchParams.set('jobId', String(jobId));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch interviews');
  return res.json();
}

export async function getInterview(id: number): Promise<Interview> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch interview');
  return res.json();
}

export async function createInterview(data: InterviewRequest): Promise<Interview> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create interview');
  return res.json();
}

export async function updateInterview(id: number, data: InterviewRequest): Promise<Interview> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update interview');
  return res.json();
}

export async function deleteInterview(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete interview');
}
