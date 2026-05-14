const BASE = 'http://localhost:8080/api/companies';

export interface Company {
  id: number;
  companyName: string;
  about: string | null;
}

export async function getCompanies(): Promise<Company[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
}

export async function createCompany(data: { companyName: string; about?: string }): Promise<Company> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create company');
  return res.json();
}

export async function deleteCompany(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete company');
}
