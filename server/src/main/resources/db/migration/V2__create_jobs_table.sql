CREATE TABLE jobs (
    id              BIGSERIAL     PRIMARY KEY,
    job_title       VARCHAR(255)  NOT NULL,
    job_description TEXT,
    cover_letter    TEXT,
    applied_status  VARCHAR(50)   NOT NULL,
    applied_date    DATE,
    deadline        DATE,
    job_url         VARCHAR(2048),
    job_source      VARCHAR(100),
    salary_range    VARCHAR(100),
    company_id      BIGINT        NOT NULL REFERENCES company(id)
);
