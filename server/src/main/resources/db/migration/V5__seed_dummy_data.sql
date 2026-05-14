-- Companies
INSERT INTO company (company_name, about) VALUES
    ('Stripe', 'Global payments infrastructure company building economic infrastructure for the internet.'),
    ('Vercel', 'Frontend cloud platform for deploying and hosting web applications.'),
    ('Linear', 'Project management tool built for modern software teams.'),
    ('Notion', 'All-in-one workspace for notes, docs, databases, and project management.'),
    ('Figma', 'Collaborative design and prototyping tool for product teams.'),
    ('GitHub', 'Developer platform for version control and collaboration, owned by Microsoft.'),
    ('Datadog', 'Cloud monitoring and analytics platform for infrastructure and application performance.'),
    ('PlanetScale', 'Serverless MySQL platform built on Vitess for planet-scale databases.'),
    ('Supabase', 'Open source Firebase alternative built on PostgreSQL.'),
    ('Anthropic', 'AI safety company building reliable, interpretable, and steerable AI systems.');

-- Jobs
INSERT INTO jobs (job_title, job_description, cover_letter, applied_status, applied_date, deadline, job_url, job_source, salary_range, company_id) VALUES
    (
        'Senior Backend Engineer',
        'Build and scale payment processing APIs handling millions of transactions per day. Work with Java, Go, and distributed systems.',
        'I am excited to apply for the Senior Backend Engineer role at Stripe. My experience building high-throughput APIs makes me a strong fit.',
        'Interview',
        '2026-05-01',
        '2026-05-17',
        'https://stripe.com/jobs/1001',
        'LinkedIn',
        '$180,000 – $220,000',
        1
    ),
    (
        'Backend Engineer – Payments',
        'Join Stripe''s payments team to build next-generation checkout experiences and fraud detection systems.',
        'Having worked extensively with payment systems, I am eager to deepen that expertise at Stripe.',
        'Offer',
        '2026-04-15',
        NULL,
        'https://stripe.com/jobs/1002',
        'Referral',
        '$175,000 – $210,000',
        1
    ),
    (
        'Staff Software Engineer',
        'Lead technical direction for Vercel''s edge runtime. Deep expertise in Node.js, Rust, and serverless infrastructure required.',
        NULL,
        'Applied',
        '2026-05-05',
        '2026-05-20',
        'https://vercel.com/jobs/2001',
        'Company Website',
        '$200,000 – $240,000',
        2
    ),
    (
        'Senior Frontend Engineer',
        'Build Vercel''s dashboard and developer experience products using React, TypeScript, and Next.js.',
        'I have been a Vercel user for years and would love to build the tools that developers rely on every day.',
        'Applied',
        '2026-05-10',
        '2026-05-22',
        'https://vercel.com/jobs/2002',
        'LinkedIn',
        '$170,000 – $200,000',
        2
    ),
    (
        'Frontend Engineer',
        'Build the Linear web app using React and TypeScript. Own core product features from design to deployment.',
        'Linear''s focus on speed and developer experience resonates deeply with me. I would love to contribute to the product.',
        'Applied',
        '2026-05-08',
        '2026-05-16',
        'https://linear.app/jobs/3001',
        'Referral',
        '$160,000 – $190,000',
        3
    ),
    (
        'Full Stack Engineer',
        'Work across the Notion stack — React frontend, Node.js backend, and PostgreSQL. Help millions of users organize their work.',
        NULL,
        'Wishlist',
        NULL,
        '2026-05-25',
        'https://notion.so/jobs/4001',
        'Indeed',
        '$150,000 – $180,000',
        4
    ),
    (
        'Senior Software Engineer – Editor',
        'Work on Notion''s block-based editor engine. Deep knowledge of contenteditable, browser APIs, and real-time collaboration required.',
        NULL,
        'Wishlist',
        NULL,
        '2026-05-28',
        'https://notion.so/jobs/4002',
        'Company Website',
        '$160,000 – $195,000',
        4
    ),
    (
        'Platform Engineer',
        'Build developer tooling and CI/CD infrastructure for Figma''s engineering teams. Kubernetes, Terraform, and AWS experience required.',
        NULL,
        'Rejected',
        '2026-04-20',
        NULL,
        'https://figma.com/jobs/5001',
        'LinkedIn',
        '$170,000 – $200,000',
        5
    ),
    (
        'Software Engineer – Multiplayer',
        'Build Figma''s real-time collaboration engine. Experience with WebSockets, CRDTs, and distributed consistency required.',
        NULL,
        'Rejected',
        '2026-04-25',
        NULL,
        'https://figma.com/jobs/5002',
        'Indeed',
        '$165,000 – $195,000',
        5
    ),
    (
        'Senior Engineer – Actions',
        'Build and scale GitHub Actions infrastructure to support millions of CI/CD workflows running every day.',
        'GitHub Actions is a tool I use daily. Contributing to its infrastructure would be incredibly meaningful.',
        'Interview',
        '2026-04-28',
        '2026-05-15',
        'https://github.com/jobs/6001',
        'LinkedIn',
        '$185,000 – $220,000',
        6
    ),
    (
        'Staff Engineer – Copilot',
        'Lead backend development for GitHub Copilot, integrating large language models into developer workflows at scale.',
        NULL,
        'Applied',
        '2026-05-07',
        '2026-05-21',
        'https://github.com/jobs/6002',
        'Referral',
        '$210,000 – $260,000',
        6
    ),
    (
        'Software Engineer – Agent Infrastructure',
        'Build the infrastructure powering AI agents at Anthropic. Work with Python, distributed systems, and LLM APIs.',
        'Working at the frontier of AI safety is a career goal I have held for years. I am thrilled to apply.',
        'Interview',
        '2026-05-03',
        '2026-05-19',
        'https://anthropic.com/jobs/10001',
        'Company Website',
        '$190,000 – $240,000',
        10
    ),
    (
        'Senior Engineer – Claude Products',
        'Build user-facing Claude products including Claude.ai. React, TypeScript, and Python required.',
        NULL,
        'Wishlist',
        NULL,
        '2026-06-01',
        'https://anthropic.com/jobs/10002',
        'LinkedIn',
        '$185,000 – $230,000',
        10
    ),
    (
        'Backend Engineer – Observability',
        'Build Datadog''s core metrics ingestion pipeline processing trillions of data points per day. Java and Go experience preferred.',
        NULL,
        'Applied',
        '2026-05-06',
        '2026-05-23',
        'https://datadog.com/jobs/7001',
        'LinkedIn',
        '$165,000 – $200,000',
        7
    ),
    (
        'Senior Engineer – APM',
        'Work on Datadog''s Application Performance Monitoring product. Deep knowledge of distributed tracing and OpenTelemetry preferred.',
        'Observability is a domain I am passionate about. I have implemented distributed tracing systems at previous companies.',
        'Rejected',
        '2026-04-10',
        NULL,
        'https://datadog.com/jobs/7002',
        'Company Website',
        '$175,000 – $205,000',
        7
    ),
    (
        'Database Engineer',
        'Build PlanetScale''s serverless MySQL platform on top of Vitess. Go and distributed systems expertise required.',
        NULL,
        'Wishlist',
        NULL,
        '2026-05-30',
        'https://planetscale.com/jobs/8001',
        'Indeed',
        '$170,000 – $210,000',
        8
    ),
    (
        'Senior Engineer – Query Engine',
        'Improve query planning and execution performance for PlanetScale''s MySQL-compatible serverless database.',
        NULL,
        'Applied',
        '2026-05-11',
        '2026-05-24',
        'https://planetscale.com/jobs/8002',
        'LinkedIn',
        '$175,000 – $215,000',
        8
    ),
    (
        'Backend Engineer – Realtime',
        'Build Supabase''s real-time subscriptions engine built on PostgreSQL logical replication and Elixir.',
        'Supabase''s open-source approach to backend-as-a-service is something I deeply admire.',
        'Applied',
        '2026-05-09',
        '2026-05-18',
        'https://supabase.com/jobs/9001',
        'Company Website',
        '$145,000 – $175,000',
        9
    ),
    (
        'Senior Engineer – Storage',
        'Work on Supabase Storage, an S3-compatible object storage service built on PostgreSQL metadata and Go.',
        NULL,
        'Wishlist',
        NULL,
        '2026-06-05',
        'https://supabase.com/jobs/9002',
        'LinkedIn',
        '$150,000 – $180,000',
        9
    ),
    (
        'Full Stack Engineer – Dashboard',
        'Build Supabase''s web dashboard using Next.js, TypeScript, and Tailwind. Own the developer experience for thousands of teams.',
        NULL,
        'Rejected',
        '2026-04-18',
        NULL,
        'https://supabase.com/jobs/9003',
        'Referral',
        '$140,000 – $170,000',
        9
    );

-- Interviews
INSERT INTO interviews (round_name, interview_date, notes, job_id) VALUES
    -- Stripe Senior Backend Engineer (job 1) - Interview stage
    ('Recruiter Screen',    '2026-05-06', 'Went well. Recruiter mentioned strong interest. Next step is technical screen.', 1),
    ('Technical Interview', '2026-05-12', 'Two-hour systems design + coding round. Felt confident on the distributed systems questions.', 1),
    ('Hiring Manager',      '2026-05-19', NULL, 1),
    -- GitHub Actions (job 10) - Interview stage
    ('Recruiter Screen',    '2026-05-02', 'Short 30-minute intro call. Positive tone, fast process promised.', 10),
    ('Technical Screen',    '2026-05-09', 'Live coding in Go. Completed both problems with time to spare.', 10),
    -- Anthropic Agent Infrastructure (job 12) - Interview stage
    ('Recruiter Screen',    '2026-05-07', 'Discussed background and interest in AI safety. Very encouraging.', 12),
    ('System Design',       '2026-05-13', 'Designed a distributed task queue for agent execution. Panel seemed engaged.', 12),
    ('Values Interview',    '2026-05-20', NULL, 12);

-- Notes
INSERT INTO notes (note, created_at, job_id) VALUES
    ('Reach out to referral contact before submitting application.', '2026-05-01 09:00:00', 1),
    ('Prepare system design answers around payment idempotency and retry logic.', '2026-05-10 14:30:00', 1),
    ('Vercel role requires Rust experience — worth brushing up on basics.', '2026-05-05 11:00:00', 3),
    ('Got referred by a former colleague at Linear. Prioritize this one.', '2026-05-08 08:45:00', 5),
    ('Notion seems like a great culture fit. Research their block-based data model before applying.', '2026-05-09 16:00:00', 6),
    ('GitHub Copilot role could be a great intersection of AI and developer tools.', '2026-05-07 10:00:00', 11),
    ('Review Anthropic''s published research papers before the values interview.', '2026-05-13 20:00:00', 12),
    ('Supabase Realtime is built on Elixir — refresh knowledge of GenServer patterns.', '2026-05-09 12:00:00', 18);
