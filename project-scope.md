# Track My Career

## Problem

I'm actively job hunting, I Search LinkedIn, Indeed, and other job portals. The issue is that I often lose track of the jobs I've applied to: what the job description said, what URL it was listed at, what cover letter I submitted. And sometimes I plan to apply for a job later, but by the time I remember, the deadline has already passed.

## Solution

Develop a personal job tracking portal where I can store job information, company details, application status, apply date, deadline, and everything else I need for my records.

## User

Single-user personal tool. No authentication or login required.

## Features

- A dashboard with summary cards showing: total applied, interviews, offers, rejected, and deadlines coming soon (within 3 days)
- The dashboard also shows jobs with upcoming deadlines (within 3 days) so we never miss an application
- A separate all-jobs page listing all entries, 10 per page by default, sorted by deadline (soonest first)
- Search on the all-jobs page searches across job title and company name only

## Data Model

**JOBS**
- id
- job_title
- job_description
- cover_letter (plain text)
- applied_status (enum: Wishlist, Applied, Interview, Offer, Rejected)
- applied_date
- deadline
- job_url
- job_source (e.g. LinkedIn, Indeed, Referral)
- salary_range
- company_id

**COMPANY**
- id
- company_name
- about

**INTERVIEWS** (one row per interview round)
- id
- interview_date
- round_name (e.g. Phone Screen, Technical, Final)
- notes
- job_id

**NOTES** (multiple notes per job, running log)
- id
- note
- created_at
- job_id
