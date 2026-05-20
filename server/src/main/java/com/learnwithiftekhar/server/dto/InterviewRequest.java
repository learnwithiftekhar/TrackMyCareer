package com.learnwithiftekhar.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class InterviewRequest {

    @NotBlank
    @Size(max = 100)
    private String roundName;

    private LocalDate interviewDate;

    private String notes;

    @NotNull
    private Long jobId;

    public String getRoundName() { return roundName; }
    public void setRoundName(String roundName) { this.roundName = roundName; }

    public LocalDate getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDate interviewDate) { this.interviewDate = interviewDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }
}
