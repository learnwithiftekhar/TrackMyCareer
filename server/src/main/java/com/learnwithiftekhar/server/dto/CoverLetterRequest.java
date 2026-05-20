package com.learnwithiftekhar.server.dto;

import jakarta.validation.constraints.NotBlank;

public class CoverLetterRequest {

    @NotBlank
    private String jobTitle;

    private String companyName;
    private String jobDescription;

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
}
