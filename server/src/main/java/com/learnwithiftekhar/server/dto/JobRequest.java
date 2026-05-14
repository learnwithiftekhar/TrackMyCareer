package com.learnwithiftekhar.server.dto;

import com.learnwithiftekhar.server.model.AppliedStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class JobRequest {

    @NotBlank
    @Size(max = 255)
    private String jobTitle;

    @NotNull
    private Long companyId;

    @NotNull
    private AppliedStatus appliedStatus;

    @Size(max = 5000)
    private String jobDescription;

    @Size(max = 10000)
    private String coverLetter;

    @PastOrPresent
    private LocalDate appliedDate;

    private LocalDate deadline;

    @Size(max = 2048)
    private String jobUrl;

    @Size(max = 100)
    private String jobSource;

    @Size(max = 100)
    private String salaryRange;

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public AppliedStatus getAppliedStatus() { return appliedStatus; }
    public void setAppliedStatus(AppliedStatus appliedStatus) { this.appliedStatus = appliedStatus; }

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
}
