# TrackMyCareer

> Built by [Iftekhar Hossain](https://www.linkedin.com/in/hossain-md-iftekhar/)

TrackMyCareer is an open-source, single-user job application tracker. It gives you one reliable place to manage your entire job search — companies, job listings, deadlines, cover letters, interview rounds, and notes — with no login required.

Built as a full-stack application with a React frontend, a Spring Boot REST API, PostgreSQL persistence, and optional OpenAI-powered helpers for job autofill and cover letter drafting.

---

## Features

### Dashboard

- Status summary cards for every pipeline stage: Wishlist, Applied, Interview, Offer, and Rejected.
- Upcoming deadlines due within the next 3 days.
- Upcoming interviews scheduled within the next 7 days.
- Direct links from each dashboard item to the related job detail page.

### Job Application Tracking

- Create, view, edit, and delete job applications.
- Track job title, company, status, description, cover letter, applied date, deadline, job URL, source, salary range, and creation timestamp.
- Five pipeline statuses: **Wishlist**, **Applied**, **Interview**, **Offer**, **Rejected**.
- Update status directly from the job detail page via a visual pipeline stepper.
- Archive and unarchive jobs to keep your active list focused.
- Active/Archived tab navigation on the All Jobs page.
- Paginated job list (10 per page), searchable by job title or company name.
- Filter by status or by company.
- Sort by deadline or entry date, ascending or descending.
- Deadline urgency labels: Today, Tomorrow, overdue, or in N days.
- Job detail tabs for Overview, Description, Cover Letter, Interviews, and Notes.
- Inline per-job notes with timestamps.

### AI-Assisted Entry

- Paste a job posting URL to autofill job details — Jsoup fetches the page, OpenAI extracts job title, company name, description, salary range, and source.
- Dashboard "Paste URL" shortcut opens the autofill flow directly.
- Generate a cover letter draft from the job title, company name, and description.
- AI endpoints return a clear `503` when `OPENAI_API_KEY` is not configured.

### Rich-Text Description Editing

- Markdown toolbar on the Description field (New Application and Edit Job pages).
- Buttons: **Bold**, *Italic*, Underline, H1, H2, Bullet list.
- Toolbar buttons wrap selected text or insert markers at the cursor.
- Inline formats toggle off if the selection is already wrapped.
- "Markdown supported" hint below the field.

### Company Management

- Create, view, edit, and delete companies.
- Store company name and free-text notes.
- Reusable Add Company modal — available from both the Companies page and the New Application form.
- Search and A–Z / Z–A sort on the Companies page.
- Click a company card to view jobs filtered to that company.
- Deterministic color avatars for quick visual scanning.

### Interview Tracking

- Create, view, edit, and delete interview rounds.
- Link each interview to a tracked job application.
- Store round name, interview date, notes, and job/company context.
- Quick round-name presets: Phone Screen, Technical, System Design, Hiring Manager, Portfolio, Onsite/Final.
- Paste a job URL when scheduling an interview to auto-match an existing tracked job.
- Interviews list grouped by date with Upcoming, Past, and All tabs.
- Up-next callout for the closest scheduled interview.
- Interview detail page with inline notes editing — add or update notes without leaving the page.

### Notes

- Per-job timestamped notes stored in the database, returned newest-first on the job detail page.
- Inline notes composer on the Job Detail page (note: API persistence is a pending TODO in `JobDetail.tsx`).
- Interview notes are fully persisted via the interview create/update API.
- Inline add/edit for interview notes directly on the Interview Detail page.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui-style components |
| Backend | Spring Boot 3.5, Java 21, Maven |
| Persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL |
| Migrations | Flyway |
| AI | Spring AI + OpenAI (`gpt-4o-mini`) |
| Scraping | Jsoup |
| HTTP Client | Native `fetch` (no Axios) |

---

## Project Structure

```
TrackMyCareer/
├── frontend/                          # React + Vite frontend
│   └── src/
│       ├── api/                       # API client modules (one file per resource)
│       ├── components/                # Shared UI components
│       └── pages/                     # Route-level page components
├── server/                            # Spring Boot backend
│   └── src/main/java/.../
│       ├── controller/                # REST controllers
│       ├── service/                   # Business logic
│       ├── repository/                # JPA repositories
│       ├── model/                     # JPA entities
│       ├── dto/                       # Request/response DTOs
│       └── resources/db/migration/    # Flyway SQL migrations
├── UI Designs/                        # Static HTML screen mockups
├── TrackMyCareer.postman_collection.json
└── CLAUDE.md                          # AI assistant guidance
```

---

## Getting Started

### Prerequisites

- Java 21
- Maven (or use the included `./mvnw` wrapper)
- PostgreSQL
- [Bun](https://bun.sh) (or npm/yarn if you adapt the commands)
- Optional: OpenAI API key for AI features

### 1. Clone the Repository

```bash
git clone https://github.com/learnwithiftekhar/TrackMyCareer.git
cd TrackMyCareer
```

### 2. Create the PostgreSQL Database

```sql
CREATE DATABASE track_my_career;
```

The default backend config expects:

```yaml
url: jdbc:postgresql://localhost:5432/track_my_career
username: postgres
password: "1234"
```

Adjust these in `server/src/main/resources/application.yml` for your environment.

### 3. Configure Environment Variables (optional)

Create `server/.env` to enable AI features:

```bash
OPENAI_API_KEY=sk-your-key-here
```

Spring Boot does not load `.env` files automatically. Export before starting the server:

```bash
export $(cat server/.env | xargs)
```

### 4. Start the Backend

```bash
cd server
./mvnw spring-boot:run
```

The API runs on `http://localhost:8080`. Flyway migrations run automatically on startup.

### 5. Start the Frontend

```bash
cd frontend
bun install
bun run dev
```

The app runs on `http://localhost:5173`.

---

## Commands

### Backend

```bash
cd server
./mvnw spring-boot:run      # start dev server (port 8080)
./mvnw test                 # run tests
./mvnw package              # build JAR
```

### Frontend

```bash
cd frontend
bun run dev                 # start dev server (port 5173)
bun run build               # production build
bun run lint                # lint
```

---

## API Reference

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Status counts, upcoming deadlines (3 days), upcoming interviews (7 days) |

### Jobs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | Paginated job list |
| `GET` | `/api/jobs/{id}` | Single job with interviews and notes |
| `POST` | `/api/jobs` | Create a job |
| `PUT` | `/api/jobs/{id}` | Update a job |
| `PATCH` | `/api/jobs/{id}/archive` | Archive or unarchive a job |
| `DELETE` | `/api/jobs/{id}` | Delete a job |
| `GET` | `/api/jobs/status/count` | Job counts by status |
| `GET` | `/api/jobs/archived/count` | Count of archived jobs |
| `GET` | `/api/jobs/by-url?url=` | Look up a job by its saved URL |
| `POST` | `/api/jobs/autofill` | AI-extract job details from a posting URL |
| `POST` | `/api/jobs/cover-letter` | AI-generate a cover letter draft |

`GET /api/jobs` query parameters:

| Parameter | Default | Description |
|---|---|---|
| `page` | `0` | Zero-based page number |
| `size` | `10` | Page size |
| `search` | — | Search by job title or company name |
| `status` | — | Filter by application status |
| `sortBy` | `deadline` | `deadline` or `createdAt` |
| `sortDir` | `asc` | `asc` or `desc` |
| `companyId` | — | Filter by company |
| `archived` | `false` | `true` to fetch archived jobs |

### Companies

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/companies` | List companies |
| `GET` | `/api/companies/{id}` | Get a company |
| `POST` | `/api/companies` | Create a company |
| `PUT` | `/api/companies/{id}` | Update a company |
| `DELETE` | `/api/companies/{id}` | Delete a company |

### Interviews

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/interviews` | List interviews (filter with `?jobId=`) |
| `GET` | `/api/interviews/{id}` | Get an interview |
| `POST` | `/api/interviews` | Create an interview |
| `PUT` | `/api/interviews/{id}` | Update an interview |
| `DELETE` | `/api/interviews/{id}` | Delete an interview |

### Error Response Format

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Job not found"
}
```

Validation errors return `400` with field messages joined in the `message` field.

---

## Data Model

### Company

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT | PK |
| `company_name` | VARCHAR(255) | Required |
| `about` | TEXT | Optional |

### Job

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT | PK |
| `job_title` | VARCHAR(255) | Required |
| `job_description` | TEXT | Optional |
| `cover_letter` | TEXT | Optional |
| `applied_status` | VARCHAR(50) | `Wishlist` / `Applied` / `Interview` / `Offer` / `Rejected` |
| `applied_date` | DATE | Optional |
| `deadline` | DATE | Optional |
| `job_url` | VARCHAR(2048) | Optional |
| `job_source` | VARCHAR(100) | Optional |
| `salary_range` | VARCHAR(100) | Optional |
| `archived` | BOOLEAN | Default `false` |
| `created_at` | TIMESTAMP | Set on insert |
| `company_id` | BIGINT | FK → Company |

### Interview

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT | PK |
| `round_name` | VARCHAR(100) | Required |
| `interview_date` | DATE | Optional |
| `notes` | TEXT | Optional |
| `job_id` | BIGINT | FK → Job |

### Note

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT | PK |
| `note` | TEXT | Required |
| `created_at` | TIMESTAMP | Set on insert |
| `job_id` | BIGINT | FK → Job |

---

## Known Limitations / Good First Issues

- Job notes composed on the frontend are not yet persisted to the API (`JobDetail.tsx` has a `TODO`).
- Frontend API base URLs are hardcoded to `http://localhost:8080/api`.
- Automated test coverage is minimal.
- No license file is included yet.

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change — consult `UI Designs/` before touching page layouts.
4. Keep backend API calls in the Controller → Service → Repository structure; use DTOs, not entities.
5. Keep frontend HTTP calls inside `frontend/src/api/`.
6. Add a Flyway migration for any schema change.
7. Open a pull request with a short description and screenshots for UI changes.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
