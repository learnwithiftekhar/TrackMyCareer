package com.learnwithiftekhar.server.service;

import com.learnwithiftekhar.server.dto.CompanyRequest;
import com.learnwithiftekhar.server.dto.CompanyResponse;
import com.learnwithiftekhar.server.model.Company;
import com.learnwithiftekhar.server.repository.CompanyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse getCompany(Long id) {
        return toResponse(findById(id));
    }

    public CompanyResponse createCompany(CompanyRequest request) {
        Company company = new Company();
        applyRequest(company, request);
        return toResponse(companyRepository.save(company));
    }

    public CompanyResponse updateCompany(Long id, CompanyRequest request) {
        Company company = findById(id);
        applyRequest(company, request);
        return toResponse(companyRepository.save(company));
    }

    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found");
        }
        companyRepository.deleteById(id);
    }

    private Company findById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
    }

    private void applyRequest(Company company, CompanyRequest request) {
        company.setCompanyName(request.getCompanyName());
        company.setAbout(request.getAbout());
    }

    private CompanyResponse toResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setId(company.getId());
        response.setCompanyName(company.getCompanyName());
        response.setAbout(company.getAbout());
        return response;
    }
}
