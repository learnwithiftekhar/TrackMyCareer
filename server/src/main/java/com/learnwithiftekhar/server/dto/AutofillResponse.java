package com.learnwithiftekhar.server.dto;

public class AutofillResponse {

    private String jobTitle;
    private String companyName;
    private String jobDescription;
    private String salaryRange;
    private String jobSource;

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public String getJobSource() { return jobSource; }
    public void setJobSource(String jobSource) { this.jobSource = jobSource; }
}
