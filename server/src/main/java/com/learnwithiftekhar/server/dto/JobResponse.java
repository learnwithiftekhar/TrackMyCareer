package com.learnwithiftekhar.server.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class JobResponse {

    private Long id;
    private String jobTitle;
    private Long companyId;
    private String companyName;
    private String companyAbout;
    private String appliedStatus;
    private String jobDescription;
    private String coverLetter;
    private LocalDate appliedDate;
    private LocalDate deadline;
    private String jobUrl;
    private String jobSource;
    private String salaryRange;
    private LocalDateTime createdAt;
    private List<InterviewSummary> interviews;
    private List<NoteSummary> notes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyAbout() { return companyAbout; }
    public void setCompanyAbout(String companyAbout) { this.companyAbout = companyAbout; }

    public String getAppliedStatus() { return appliedStatus; }
    public void setAppliedStatus(String appliedStatus) { this.appliedStatus = appliedStatus; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) { this.appliedDate = appliedDate; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public String getJobUrl() { return jobUrl; }
    public void setJobUrl(String jobUrl) { this.jobUrl = jobUrl; }

    public String getJobSource() { return jobSource; }
    public void setJobSource(String jobSource) { this.jobSource = jobSource; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<InterviewSummary> getInterviews() { return interviews; }
    public void setInterviews(List<InterviewSummary> interviews) { this.interviews = interviews; }

    public List<NoteSummary> getNotes() { return notes; }
    public void setNotes(List<NoteSummary> notes) { this.notes = notes; }

    public static class InterviewSummary {
        private Long id;
        private String roundName;
        private LocalDate interviewDate;
        private String notes;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getRoundName() { return roundName; }
        public void setRoundName(String roundName) { this.roundName = roundName; }

        public LocalDate getInterviewDate() { return interviewDate; }
        public void setInterviewDate(LocalDate interviewDate) { this.interviewDate = interviewDate; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class NoteSummary {
        private Long id;
        private String note;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
