package com.learnwithiftekhar.server.controller;

import com.learnwithiftekhar.server.dto.AutofillRequest;
import com.learnwithiftekhar.server.dto.AutofillResponse;
import com.learnwithiftekhar.server.dto.CoverLetterRequest;
import com.learnwithiftekhar.server.dto.CoverLetterResponse;
import com.learnwithiftekhar.server.dto.JobRequest;
import com.learnwithiftekhar.server.dto.JobResponse;
import com.learnwithiftekhar.server.service.AutofillService;
import com.learnwithiftekhar.server.service.JobService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final AutofillService autofillService;

    public JobController(JobService jobService, AutofillService autofillService) {
        this.jobService = jobService;
        this.autofillService = autofillService;
    }

    @GetMapping
    public Page<JobResponse> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "deadline") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "false") boolean archived) {
        return jobService.getJobs(page, size, search, status, sortBy, sortDir, companyId, archived);
    }

    @GetMapping("/status/count")
    public Map<String, Long> getStatusCounts() {
        return jobService.getStatusCounts();
    }

    @GetMapping("/archived/count")
    public Map<String, Long> getArchivedCount() {
        return Map.of("count", jobService.getArchivedCount());
    }

    @PostMapping("/autofill")
    public AutofillResponse autofillJob(@Valid @RequestBody AutofillRequest request) {
        return autofillService.autofill(request.getUrl());
    }

    @PostMapping("/cover-letter")
    public CoverLetterResponse generateCoverLetter(@Valid @RequestBody CoverLetterRequest request) {
        return autofillService.generateCoverLetter(request);
    }

    @GetMapping("/by-url")
    public JobResponse getJobByUrl(@RequestParam String url) {
        return jobService.getJobByUrl(url);
    }

    @GetMapping("/{id}")
    public JobResponse getJob(@PathVariable Long id) {
        return jobService.getJob(id);
    }

    @PostMapping
    public JobResponse createJob(@Valid @RequestBody JobRequest request) {
        return jobService.createJob(request);
    }

    @PutMapping("/{id}")
    public JobResponse updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest request) {
        return jobService.updateJob(id, request);
    }

    @PatchMapping("/{id}/archive")
    public JobResponse archiveJob(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean archived = Boolean.TRUE.equals(body.get("archived"));
        return jobService.archiveJob(id, archived);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
