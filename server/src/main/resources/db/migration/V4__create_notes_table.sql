CREATE TABLE notes (
    id         BIGSERIAL    PRIMARY KEY,
    note       TEXT         NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    job_id     BIGINT       NOT NULL REFERENCES jobs(id)
);
