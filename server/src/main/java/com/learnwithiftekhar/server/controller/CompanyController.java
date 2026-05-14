package com.learnwithiftekhar.server.controller;

import com.learnwithiftekhar.server.dto.CompanyRequest;
import com.learnwithiftekhar.server.dto.CompanyResponse;
import com.learnwithiftekhar.server.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<CompanyResponse> getAllCompanies() {
        return companyService.getAllCompanies();
    }

    @GetMapping("/{id}")
    public CompanyResponse getCompany(@PathVariable Long id) {
        return companyService.getCompany(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyResponse createCompany(@Valid @RequestBody CompanyRequest request) {
        return companyService.createCompany(request);
    }

    @PutMapping("/{id}")
    public CompanyResponse updateCompany(@PathVariable Long id, @Valid @RequestBody CompanyRequest request) {
        return companyService.updateCompany(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
