# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TrackMyCareer is a single-user personal job application tracker. No authentication or login is required.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3, Java 21, Maven |
| ORM | Spring Data JPA + Hibernate |
| Database | PostgreSQL |
| Migrations | Flyway |
| AI | Spring AI + OpenAI (`gpt-4o-mini`) |
| HTML scraping | Jsoup |
| Frontend | React + Vite, TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| HTTP Client | Native fetch (no Axios) |

## Project Structure

```
TrackMyCareer/
├── server/           # Spring Boot Maven project
│   └── .env          # local secrets (not committed); loaded manually — see Environment section
├── frontend/         # React + Vite + TypeScript app
└── UI Designs/       # Static HTML mockups for each page/screen
```

## Environment Setup

The backend reads secrets from environment variables. Create `server/.env`:

```
OPENAI_API_KEY=sk-proj-example-not-a-real-key
```

Spring Boot does **not** load `.env` files automatically. Before running the server, export the variable in your shell:

```bash
export $(cat server/.env | xargs) && cd server && mvn spring-boot:run
```

Or configure your IDE run configuration to load `server/.env` as environment variables.

## Backend Commands

```bash
cd server
mvn spring-boot:run          # start dev server (port 8080)
mvn test                     # run all tests
mvn test -Dtest=ClassName    # run a single test class
mvn package                  # build JAR
```

Flyway migrations live in `server/src/main/resources/db/migration/` and follow the naming convention `V<version>__<description>.sql` (e.g. `V1__create_company_table.sql`). Flyway runs automatically on startup.

## Frontend Commands

```bash
cd frontend
bun install                  # install dependencies
bun run dev                  # start dev server (port 5173)
bun run build                # production build
bun run lint                 # lint
```

## Architecture

### Backend
Standard Spring Boot layered architecture: `Controller → Service → Repository`.

- `controller/` — REST controllers: `JobController`, `CompanyController`, `DashboardController`, `InterviewController`, `HelloController`
- `service/` — business logic; `AutofillService` handles AI-powered job detail extraction and cover letter generation
- `repository/` — Spring Data JPA repositories; custom JPQL queries for search, status counts, and date-range lookups
- `model/` — JPA entities
- `dto/` — request/response DTOs (never expose entities directly); `DashboardSummaryResponse` aggregates status counts, upcoming deadlines, and upcoming interviews in one call
- `exception/` — `GlobalExceptionHandler` (`@RestControllerAdvice`) for consistent error responses

CORS is configured to allow requests from `http://localhost:5173` in dev.

#### API Routes
| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Status counts, upcoming deadlines (3 days), upcoming interviews (7 days) |
| GET | `/api/jobs` | Paginated jobs; query params: `page`, `size`, `search`, `status`, `sortBy`, `sortDir`, `companyId`, `archived` |
| GET | `/api/jobs/status/count` | Status counts map |
| GET | `/api/jobs/archived/count` | Count of archived jobs (returns `{ count: N }`) |
| GET | `/api/jobs/by-url?url=` | Look up a job by its saved `job_url` field |
| POST | `/api/jobs/autofill` | Fetch a URL with Jsoup, extract job details via OpenAI, return prefill data |
| POST | `/api/jobs/cover-letter` | Generate a cover letter draft via OpenAI from job title, company, and description |
| GET | `/api/jobs/{id}` | Get a single job with interviews and notes |
| POST | `/api/jobs` | Create a job |
| PUT | `/api/jobs/{id}` | Update a job |
| PATCH | `/api/jobs/{id}/archive` | Archive or unarchive a job; body: `{ "archived": true \| false }` |
| DELETE | `/api/jobs/{id}` | Delete a job |
| GET/POST | `/api/companies` | List / create companies |
| GET/PUT/DELETE | `/api/companies/{id}` | Get / update / delete a company |
| GET/POST | `/api/interviews` | List (optionally filter by `?jobId=`) / create interviews |
| GET/PUT/DELETE | `/api/interviews/{id}` | Get / update / delete an interview |

#### AI Features (`AutofillService`)

**`POST /api/jobs/autofill`** body: `{ "url": "https://..." }`

1. Jsoup fetches the URL and extracts up to 8000 chars of body text.
2. Spring AI `ChatClient` sends the text to `gpt-4o-mini` and maps the response directly to `AutofillResponse` via `.entity(AutofillResponse.class)`.
3. Returns: `jobTitle`, `companyName`, `jobDescription`, `salaryRange`, `jobSource`.

**`POST /api/jobs/cover-letter`** body: `{ "jobTitle": "...", "companyName": "...", "jobDescription": "..." }`

1. Spring AI `ChatClient` prompts `gpt-4o-mini` to write 3–4 body paragraphs (no salutation or address block).
2. Returns: `{ "coverLetter": "..." }`.

Both endpoints return `503` if `OPENAI_API_KEY` is not set.

### Error Handling
All errors return a consistent JSON shape:
```json
{ "status": 404, "error": "Not Found", "message": "Company not found" }
```
- `ResponseStatusException` — status and message extracted dynamically via `ex.getStatusCode()` and `ex.getReason()`
- `MethodArgumentNotValidException` — 400 with all failing field messages joined by `;`
- Unhandled `Exception` — 500 with a safe generic message

Services always use `HttpStatus.NOT_FOUND` (404) for missing entities, never `BAD_REQUEST`.

### Frontend
- `src/pages/` — one file per route: `Dashboard`, `AllJobs`, `ArchivedJobs`, `NewApplication`, `JobDetail`, `EditJob`, `Companies`, `Interviews`, `NewInterview`, `InterviewDetail`, `EditInterview`
- `src/components/` — reusable UI components: `Navbar`, `AddCompanyModal`
- `src/api/` — one file per backend resource (`jobs.ts`, `companies.ts`, `dashboard.ts`, `interviews.ts`); all HTTP calls live here, nowhere else

Routes are defined in `App.tsx` using React Router v6. The frontend calls the backend at `http://localhost:8080/api`.

| Route | Page |
|---|---|
| `/` | `Dashboard` |
| `/jobs` | `AllJobs` |
| `/jobs/new` | `NewApplication` |
| `/jobs/archived` | `ArchivedJobs` |
| `/jobs/:id` | `JobDetail` |
| `/jobs/:id/edit` | `EditJob` |
| `/companies` | `Companies` |
| `/interviews` | `Interviews` |
| `/interviews/new` | `NewInterview` |
| `/interviews/:id` | `InterviewDetail` |
| `/interviews/:id/edit` | `EditInterview` |

#### Frontend API — `jobs.ts` exports
- `getJobs(params)` — paginated job list; params include `page`, `size`, `search`, `status`, `sortBy`, `sortDir`, `companyId`, `archived`
- `getJob(id)` — single job with interviews and notes
- `getJobByUrl(url)` — look up job by its saved URL (used by New Interview autofill)
- `autofillFromUrl(url)` — call `/api/jobs/autofill` to AI-extract job details (used by New Application)
- `generateCoverLetter({ jobTitle, companyName?, jobDescription? })` — call `/api/jobs/cover-letter` to generate a draft (used by New Application)
- `createJob(data)` / `updateJob(id, data)` / `deleteJob(id)`
- `archiveJob(id, archived)` — PATCH archive status
- `getStatusCounts()` — all five status keys always present
- `getArchivedCount()` — returns the count of archived jobs

#### Shared Components
- `AddCompanyModal` (`src/components/AddCompanyModal.tsx`) — modal for creating a new company; used by both `Companies.tsx` (via the page-level "Add company" button) and `NewApplication.tsx` (inline when no matching company is found in the dropdown). Props: `onClose: () => void`, `onSave: (company: Company) => void`. Calls `createCompany` internally and passes the created company to `onSave`.

### UI Designs
Static HTML mockups live in `UI Designs/`. **Always consult the relevant file before building or modifying a page or component** — these are the source of truth for layout, styling, and UX.

| File | Screen |
|---|---|
| `Dashboard.html` | Main dashboard |
| `All Jobs.html` | Paginated job list |
| `Job Detail.html` | Job detail / edit view |
| `New Application.html` | Create new job application |
| `Interviews.html` | Interviews list |
| `New Interview.html` | Create new interview |
| `Companies.html` | Companies list |
| `Add Company Modal.html` | Add company modal |

## Data Model

**COMPANY**
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| company_name | VARCHAR(255) | NOT NULL |
| about | TEXT | nullable |

**JOBS**
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| job_title | VARCHAR(255) | NOT NULL |
| job_description | TEXT | nullable |
| cover_letter | TEXT | nullable |
| applied_status | VARCHAR(50) | NOT NULL, enum: `Wishlist`, `Applied`, `Interview`, `Offer`, `Rejected` |
| applied_date | DATE | nullable |
| deadline | DATE | nullable |
| job_url | VARCHAR(2048) | nullable |
| job_source | VARCHAR(100) | nullable (e.g. LinkedIn, Indeed, Referral) |
| salary_range | VARCHAR(100) | nullable |
| company_id | BIGINT | FK → COMPANY(id), NOT NULL |
| archived | BOOLEAN | NOT NULL, DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW(), not updatable |

**INTERVIEWS**
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| round_name | VARCHAR(100) | NOT NULL (e.g. Phone Screen, Technical, Final) |
| interview_date | DATE | nullable |
| notes | TEXT | nullable |
| job_id | BIGINT | FK → JOBS(id), NOT NULL |

**NOTES**
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| note | TEXT | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, defaults to now |
| job_id | BIGINT | FK → JOBS(id), NOT NULL |

## Key Business Rules

- Dashboard upcoming deadlines = jobs with `deadline` within the next **3 days** (today inclusive)
- Dashboard upcoming interviews = interviews with `interview_date` within the next **7 days** (today inclusive)
- All-jobs page: 10 per page, sorted by deadline (soonest first) by default
- Search on all-jobs page covers job title and company name only (case-insensitive LIKE query in `JobRepository`)
- `AppliedStatus` is a Java enum stored as a string: `Wishlist`, `Applied`, `Interview`, `Offer`, `Rejected`; status counts always include all five keys even if count is zero (pre-seeded in `DashboardService`)
