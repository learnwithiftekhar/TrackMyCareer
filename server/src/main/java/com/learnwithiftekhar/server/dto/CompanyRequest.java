package com.learnwithiftekhar.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CompanyRequest {

    @NotBlank
    @Size(max = 255)
    private String companyName;

    private String about;

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }
}
