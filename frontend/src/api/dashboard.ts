import type { Job } from './jobs';

const BASE = 'http://localhost:8080/api/dashboard';

export interface UpcomingInterview {
  id: number;
  roundName: string;
  interviewDate: string;
  jobId: number;
  jobTitle: string;
  companyId: number;
  companyName: string;
}

export interface DashboardSummary {
  statusCounts: Record<string, number>;
  upcomingDeadlines: Job[];
  upcomingInterviews: UpcomingInterview[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${BASE}/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}
