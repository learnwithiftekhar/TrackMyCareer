package com.learnwithiftekhar.server.service;

import com.learnwithiftekhar.server.dto.JobRequest;
import com.learnwithiftekhar.server.dto.JobResponse;
import com.learnwithiftekhar.server.model.AppliedStatus;
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

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    public JobService(JobRepository jobRepository, CompanyRepository companyRepository) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
    }

    private static final java.util.Set<String> ALLOWED_SORT_FIELDS = java.util.Set.of("deadline", "createdAt");

    @Transactional(readOnly = true)
    public Page<JobResponse> getJobs(int page, int size, String search, String status, String sortBy, String sortDir, Long companyId) {
        String field = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "deadline";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, field));
        String searchParam = (search == null || search.isBlank()) ? "%" : "%" + search.trim() + "%";
        boolean hasStatus = status != null && !status.isBlank();
        boolean hasCompany = companyId != null;
        if (hasStatus) {
            try {
                AppliedStatus appliedStatus = AppliedStatus.valueOf(status);
                if (hasCompany) {
                    return jobRepository.searchJobsByStatusAndCompany(searchParam, appliedStatus, companyId, pageable).map(this::toResponse);
                }
                return jobRepository.searchJobsByStatus(searchParam, appliedStatus, pageable).map(this::toResponse);
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
            }
        }
        if (hasCompany) {
            return jobRepository.searchJobsByCompany(searchParam, companyId, pageable).map(this::toResponse);
        }
        return jobRepository.searchJobs(searchParam, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getStatusCounts() {
        Map<String, Long> counts = Arrays.stream(AppliedStatus.values())
                .collect(Collectors.toMap(Enum::name, s -> 0L, (a, b) -> a, LinkedHashMap::new));
        jobRepository.countByStatus()
                .forEach(row -> counts.put(((AppliedStatus) row[0]).name(), (Long) row[1]));
        return counts;
    }

    @Transactional(readOnly = true)
    public JobResponse getJob(Long id) {
        Job job = findById(id);
        JobResponse response = toResponse(job);
        response.setCompanyAbout(job.getCompany().getAbout());
        response.setInterviews(job.getInterviews().stream()
                .sorted(java.util.Comparator.comparing(
                        i -> i.getInterviewDate() == null ? java.time.LocalDate.MAX : i.getInterviewDate()))
                .map(i -> {
                    JobResponse.InterviewSummary s = new JobResponse.InterviewSummary();
                    s.setId(i.getId());
                    s.setRoundName(i.getRoundName());
                    s.setInterviewDate(i.getInterviewDate());
                    s.setNotes(i.getNotes());
                    return s;
                }).toList());
        response.setNotes(job.getNotes().stream()
                .sorted(java.util.Comparator.comparing(
                        (com.learnwithiftekhar.server.model.Note n) -> n.getCreatedAt()).reversed())
                .map(n -> {
                    JobResponse.NoteSummary s = new JobResponse.NoteSummary();
                    s.setId(n.getId());
                    s.setNote(n.getNote());
                    s.setCreatedAt(n.getCreatedAt());
                    return s;
                }).toList());
        return response;
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

    @Transactional(readOnly = true)
    public JobResponse getJobByUrl(String url) {
        Job job = jobRepository.findByJobUrl(url)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No job found for this URL"));
        return toResponse(job);
    }

    public JobResponse archiveJob(Long id, boolean archived) {
        Job job = findById(id);
        job.setArchived(archived);
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
        response.setCreatedAt(job.getCreatedAt());
        response.setArchived(job.isArchived());
        return response;
    }
}
