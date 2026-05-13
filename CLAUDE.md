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
| Frontend | React + Vite, TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| HTTP Client | Native fetch (no Axios) |

## Project Structure

```
TrackMyCareer/
├── backend/          # Spring Boot Maven project
└── frontend/         # React + Vite + TypeScript app
```

## Backend Commands

```bash
cd backend
mvn spring-boot:run          # start dev server (port 8080)
mvn test                     # run all tests
mvn test -Dtest=ClassName    # run a single test class
mvn package                  # build JAR
```

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

CORS is configured to allow requests from `http://localhost:5173` in dev.

### Frontend
- `src/pages/` — top-level route pages (Dashboard, AllJobs)
- `src/components/` — reusable UI components
- `src/api/` — all fetch calls to the backend, one file per resource

The frontend calls the backend at `http://localhost:8080/api`.

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
