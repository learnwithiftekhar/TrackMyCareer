CREATE TABLE interviews (
    id             BIGSERIAL    PRIMARY KEY,
    round_name     VARCHAR(100) NOT NULL,
    interview_date DATE,
    notes          TEXT,
    job_id         BIGINT       NOT NULL REFERENCES jobs(id)
);
