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
| Frontend | React + Vite, TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| HTTP Client | Native fetch (no Axios) |

## Project Structure

```
TrackMyCareer/
├── server/           # Spring Boot Maven project
├── frontend/         # React + Vite + TypeScript app
└── UI Designs/       # Static HTML mockups for each page/screen
```

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

- `controller/` — REST controllers, one per resource (Job, Company, Interview, Note)
- `service/` — business logic
- `repository/` — Spring Data JPA repositories
- `model/` — JPA entities
- `dto/` — request/response DTOs (never expose entities directly)
- `exception/` — `GlobalExceptionHandler` (`@RestControllerAdvice`) for consistent error responses

CORS is configured to allow requests from `http://localhost:5173` in dev.

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
- `src/pages/` — top-level route pages (Dashboard, AllJobs)
- `src/components/` — reusable UI components
- `src/api/` — all fetch calls to the backend, one file per resource

The frontend calls the backend at `http://localhost:8080/api`.

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

- Dashboard "coming soon" deadlines = jobs with a deadline within the next **3 days**
- All-jobs page: 10 per page, sorted by deadline (soonest first) by default
- Search on all-jobs page covers job title and company name only
