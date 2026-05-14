package com.learnwithiftekhar.server.dto;

public class CompanyResponse {

    private Long id;
    private String companyName;
    private String about;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }
}
