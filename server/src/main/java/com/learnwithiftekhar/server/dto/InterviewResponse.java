package com.learnwithiftekhar.server.dto;

import java.time.LocalDate;

public class InterviewResponse {

    private Long id;
    private String roundName;
    private LocalDate interviewDate;
    private String notes;
    private Long jobId;
    private String jobTitle;
    private Long companyId;
    private String companyName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoundName() { return roundName; }
    public void setRoundName(String roundName) { this.roundName = roundName; }

    public LocalDate getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDate interviewDate) { this.interviewDate = interviewDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
}
