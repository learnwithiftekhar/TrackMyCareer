package com.learnwithiftekhar.server.controller;

import com.learnwithiftekhar.server.dto.JobRequest;
import com.learnwithiftekhar.server.dto.JobResponse;
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

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public Page<JobResponse> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return jobService.getJobs(page, size, search, status);
    }

    @GetMapping("/status/count")
    public Map<String, Long> getStatusCounts() {
        return jobService.getStatusCounts();
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
