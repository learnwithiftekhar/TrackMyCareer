package com.learnwithiftekhar.server.service;

import com.learnwithiftekhar.server.dto.JobRequest;
import com.learnwithiftekhar.server.dto.JobResponse;
import com.learnwithiftekhar.server.model.Company;
import com.learnwithiftekhar.server.model.Job;
import com.learnwithiftekhar.server.repository.CompanyRepository;
import com.learnwithiftekhar.server.repository.JobRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    public JobService(JobRepository jobRepository, CompanyRepository companyRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public Page<JobResponse> getJobs(int page, int size, String search) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "deadline"));
        String searchParam = (search == null || search.isBlank()) ? "%" : "%" + search.trim() + "%";
        return jobRepository.searchJobs(searchParam, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public JobResponse getJob(Long id) {
        return toResponse(findById(id));
    }

    public JobResponse createJob(JobRequest request) {
        Company company = findCompany(request.getCompanyId());
        Job job = new Job();
        applyRequest(job, request, company);
        return toResponse(jobRepository.save(job));
    }

    public JobResponse updateJob(Long id, JobRequest request) {
        Job job = findById(id);
        Company company = findCompany(request.getCompanyId());
        applyRequest(job, request, company);
        return toResponse(jobRepository.save(job));
    }

    public void deleteJob(Long id) {
        if (!jobRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }
        jobRepository.deleteById(id);
    }

    private Job findById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
    }

    private Company findCompany(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
    }

    private void applyRequest(Job job, JobRequest request, Company company) {
        job.setJobTitle(request.getJobTitle());
        job.setCompany(company);
        job.setAppliedStatus(request.getAppliedStatus());
        job.setJobDescription(request.getJobDescription());
        job.setCoverLetter(request.getCoverLetter());
        job.setAppliedDate(request.getAppliedDate());
        job.setDeadline(request.getDeadline());
        job.setJobUrl(request.getJobUrl());
        job.setJobSource(request.getJobSource());
        job.setSalaryRange(request.getSalaryRange());
    }

    private JobResponse toResponse(Job job) {
        JobResponse response = new JobResponse();
        response.setId(job.getId());
        response.setJobTitle(job.getJobTitle());
        response.setCompanyId(job.getCompany().getId());
        response.setCompanyName(job.getCompany().getCompanyName());
        response.setAppliedStatus(job.getAppliedStatus().name());
        response.setJobDescription(job.getJobDescription());
        response.setCoverLetter(job.getCoverLetter());
        response.setAppliedDate(job.getAppliedDate());
        response.setDeadline(job.getDeadline());
        response.setJobUrl(job.getJobUrl());
        response.setJobSource(job.getJobSource());
        response.setSalaryRange(job.getSalaryRange());
        return response;
    }
}
