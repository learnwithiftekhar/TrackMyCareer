# TrackMyCareer

TrackMyCareer is an open-source, single-user job application tracker for people who want one reliable place to manage their job hunt. It helps you save job listings, companies, deadlines, cover letters, interview rounds, notes, and application status without needing authentication or a team workflow.

The project is built as a full-stack application with a React frontend, a Spring Boot REST API, PostgreSQL persistence, Flyway migrations, and optional OpenAI-powered helpers for job autofill and cover letter drafting.

## Features

### Dashboard

- Summary cards for every pipeline status: `Wishlist`, `Applied`, `Interview`, `Offer`, and `Rejected`.
- Upcoming application deadlines due within the next 3 days.
- Upcoming interviews scheduled within the next 7 days.
- Quick links from dashboard items to the related job detail pages.
- Loading and empty states for dashboard widgets.

### Job Application Tracking

- Create, view, update, and delete job applications.
- Store job title, company, application status, job description, cover letter, application date, deadline, job URL, job source, salary range, and creation timestamp.
- Track the full application pipeline using the statuses:
  - `Wishlist`
  - `Applied`
  - `Interview`
  - `Offer`
  - `Rejected`
- Change a job's status directly from the job detail page.
- Job detail page with tabs for overview, description, cover letter, interviews, and notes.
- Visual pipeline stepper on the job detail page.
- Deadline urgency labels such as today, tomorrow, overdue, or in a number of days.
- Edit existing applications with prefilled data.
- Paginated all-jobs page with 10 jobs per page by default.
- Search jobs by job title or company name.
- Filter jobs by application status.
- Filter jobs by company from the company page.
- Sort jobs by deadline or entry date in ascending or descending order.
- Look up a saved job by its URL, used when scheduling interviews.

### AI-Assisted Application Entry

- Paste a job posting URL to autofill job details.
- Uses Jsoup to fetch page text from the listing.
- Uses Spring AI with OpenAI to extract:
  - job title
  - company name
  - job description
  - salary range
  - job source
- Generate cover letter body paragraphs from the job title, company name, and job description.
- AI endpoints return a clear service-unavailable response when `OPENAI_API_KEY` is not configured.

### Company Management

- Create, view, update, and delete companies.
- Store company name and notes/about text.
- Reusable add-company modal used from both the Companies page and New Application form.
- Search companies on the Companies page.
- Click a company card to view jobs filtered to that company.
- Deterministic company avatars for visual scanning.

### Interview Tracking

- Create, view, update, and delete interview rounds.
- Link each interview to a tracked job application.
- Store round name, interview date, notes, job, and company context.
- Schedule interviews from a searchable job picker.
- Paste a job URL while scheduling an interview to auto-match an existing tracked job.
- Quick round-name presets such as Phone Screen, Technical, System Design, Hiring Manager, Portfolio, and Onsite / Final.
- Interviews page grouped by date.
- Tabs for Upcoming, Past, and All interviews.
- Search interviews by round name, company name, or job title.
- Up-next interview callout.
- Interview detail page with edit and delete actions.

### Notes

- The data model supports per-job notes with `created_at` timestamps.
- Job detail responses include existing notes, sorted newest first.
- The frontend currently has an optimistic note composer on job detail; persistence for new job notes is marked as a TODO in the code.
- Interview notes are fully persisted as part of interview create/update.

### API and Developer Experience

- REST API organized around jobs, companies, interviews, and dashboard summary data.
- DTO-based responses; JPA entities are not exposed directly.
- Consistent JSON error responses from a global exception handler.
- Bean validation for request payloads.
- CORS configured for local frontend development.
- PostgreSQL schema managed by Flyway migrations.
- Seed migration with sample companies, jobs, interviews, and notes.
- Postman collection included at `TrackMyCareer.postman_collection.json`.
- Static UI mockups included in `UI Designs/`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, TypeScript |
| Routing | React Router |
| Styling | Tailwind CSS v4 |
| UI | shadcn/ui-style components, Base UI, lucide-react |
| Backend | Spring Boot 3.5, Java 21, Maven |
| Persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL |
| Migrations | Flyway |
| AI | Spring AI + OpenAI |
| Scraping | Jsoup |
| API Client | Native `fetch` |

## Project Structure

```text
TrackMyCareer/
|-- frontend/                         # React + Vite frontend
|   |-- src/api/                       # API client modules
|   |-- src/components/                # Shared UI components
|   `-- src/pages/                     # Route-level pages
|-- server/                           # Spring Boot backend
|   |-- src/main/java/.../controller/  # REST controllers
|   |-- src/main/java/.../service/     # Business logic
|   |-- src/main/java/.../repository/  # JPA repositories
|   |-- src/main/java/.../model/       # JPA entities
|   |-- src/main/java/.../dto/         # Request/response DTOs
|   `-- src/main/resources/db/migration/
|-- UI Designs/                       # Static HTML screen mockups
|-- TrackMyCareer.postman_collection.json
|-- project-scope.md
`-- CLAUDE.md
```

## Prerequisites

- Java 21
- Maven, or the included Maven wrapper
- PostgreSQL
- Bun, or another JavaScript package manager if you adapt the commands
- Optional: an OpenAI API key for AI autofill and cover letter generation

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-fork-url>
cd TrackMyCareer
```

### 2. Create the PostgreSQL Database

Create a local PostgreSQL database named `track_my_career`:

```sql
CREATE DATABASE track_my_career;
```

The default backend configuration expects:

```yaml
url: jdbc:postgresql://localhost:5432/track_my_career
username: postgres
password: "1234"
```

You can change these values in `server/src/main/resources/application.yml` for your local environment.

### 3. Configure Environment Variables

Create `server/.env` if you want to use the AI features:

```bash
OPENAI_API_KEY=sk-your-key-here
```

Spring Boot does not load `.env` files automatically. Export the variable before starting the backend:

```bash
export $(cat server/.env | xargs)
```

The frontend origin can be configured with:

```bash
CORS_ALLOWED_ORIGIN=http://localhost:5173
```

### 4. Start the Backend

```bash
cd server
./mvnw spring-boot:run
```

The API runs on:

```text
http://localhost:8080
```

Flyway runs automatically on startup and applies the migrations in `server/src/main/resources/db/migration/`.

### 5. Start the Frontend

In another terminal:

```bash
cd frontend
bun install
bun run dev
```

The app runs on:

```text
http://localhost:5173
```

## Useful Commands

### Backend

```bash
cd server
./mvnw spring-boot:run
./mvnw test
./mvnw package
```

### Frontend

```bash
cd frontend
bun run dev
bun run build
bun run lint
bun run preview
```

## API Reference

### Dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/dashboard/summary` | Status counts, upcoming deadlines, and upcoming interviews |

### Jobs

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/jobs` | Paginated jobs with optional search, status, sorting, and company filters |
| `GET` | `/api/jobs/{id}` | Get one job, including company info, interviews, and notes |
| `POST` | `/api/jobs` | Create a job application |
| `PUT` | `/api/jobs/{id}` | Update a job application |
| `DELETE` | `/api/jobs/{id}` | Delete a job application |
| `GET` | `/api/jobs/status/count` | Count jobs by application status |
| `GET` | `/api/jobs/by-url?url=` | Find a job by saved job URL |
| `POST` | `/api/jobs/autofill` | Extract job details from a posting URL using AI |
| `POST` | `/api/jobs/cover-letter` | Generate a cover letter draft using AI |

Supported `GET /api/jobs` query parameters:

| Parameter | Default | Description |
| --- | --- | --- |
| `page` | `0` | Zero-based page number |
| `size` | `10` | Page size |
| `search` | none | Searches job title and company name |
| `status` | none | Filters by application status |
| `sortBy` | `deadline` | Supports `deadline` and `createdAt` |
| `sortDir` | `asc` | Supports `asc` and `desc` |
| `companyId` | none | Filters jobs by company |

### Companies

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/companies` | List companies |
| `GET` | `/api/companies/{id}` | Get one company |
| `POST` | `/api/companies` | Create a company |
| `PUT` | `/api/companies/{id}` | Update a company |
| `DELETE` | `/api/companies/{id}` | Delete a company |

### Interviews

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/interviews` | List interviews |
| `GET` | `/api/interviews?jobId={id}` | List interviews for one job |
| `GET` | `/api/interviews/{id}` | Get one interview |
| `POST` | `/api/interviews` | Create an interview |
| `PUT` | `/api/interviews/{id}` | Update an interview |
| `DELETE` | `/api/interviews/{id}` | Delete an interview |

## Data Model

### Company

| Field | Description |
| --- | --- |
| `id` | Primary key |
| `company_name` | Company name |
| `about` | Notes/about text |

### Job

| Field | Description |
| --- | --- |
| `id` | Primary key |
| `job_title` | Role title |
| `job_description` | Full job description |
| `cover_letter` | Saved cover letter text |
| `applied_status` | `Wishlist`, `Applied`, `Interview`, `Offer`, or `Rejected` |
| `applied_date` | Date applied |
| `deadline` | Application deadline |
| `job_url` | Original job posting URL |
| `job_source` | Source such as LinkedIn, Indeed, Referral, or Company site |
| `salary_range` | Free-text salary range |
| `created_at` | Creation timestamp |
| `company_id` | Required company relationship |

### Interview

| Field | Description |
| --- | --- |
| `id` | Primary key |
| `round_name` | Interview round name |
| `interview_date` | Scheduled interview date |
| `notes` | Interview notes |
| `job_id` | Required job relationship |

### Note

| Field | Description |
| --- | --- |
| `id` | Primary key |
| `note` | Note body |
| `created_at` | Creation timestamp |
| `job_id` | Required job relationship |

## Error Response Format

Errors are returned as JSON:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Job not found"
}
```

Validation errors return status `400` with field messages joined in the `message` field.

## Open Source Notes

This project is designed to be friendly for contributors:

- Keep backend changes in the existing Controller -> Service -> Repository structure.
- Keep frontend API calls inside `frontend/src/api/`.
- Use DTOs for API responses instead of exposing JPA entities.
- Add Flyway migrations for database changes.
- Check the static mockups in `UI Designs/` before changing page layouts.
- Keep the single-user/no-auth product assumption unless a larger auth design is introduced.

## Current Limitations and Good First Issues

- Persisting newly added job notes from the frontend is not implemented yet.
- The navbar includes a Notes link, but there is no standalone Notes route yet.
- The All Jobs page shows an Export button, but export behavior is not wired yet.
- Frontend API base URLs are currently hardcoded to `http://localhost:8080/api`.
- Automated test coverage is minimal.
- No license file is currently included. Add one before publishing publicly as an open-source repository.

## Contributing

Contributions are welcome. A good contribution flow is:

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change.
4. Run the relevant backend and frontend checks.
5. Open a pull request with a short description, screenshots for UI changes, and any migration notes.

## License

No license has been added yet. If you intend to publish this as an open-source project, add a `LICENSE` file and update this section.
