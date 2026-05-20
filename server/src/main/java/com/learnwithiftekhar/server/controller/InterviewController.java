package com.learnwithiftekhar.server.controller;

import com.learnwithiftekhar.server.dto.InterviewRequest;
import com.learnwithiftekhar.server.dto.InterviewResponse;
import com.learnwithiftekhar.server.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping
    public List<InterviewResponse> getInterviewsByJob(@RequestParam Long jobId) {
        return interviewService.getInterviewsByJob(jobId);
    }

    @GetMapping("/{id}")
    public InterviewResponse getInterview(@PathVariable Long id) {
        return interviewService.getInterview(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewResponse createInterview(@Valid @RequestBody InterviewRequest request) {
        return interviewService.createInterview(request);
    }

    @PutMapping("/{id}")
    public InterviewResponse updateInterview(@PathVariable Long id, @Valid @RequestBody InterviewRequest request) {
        return interviewService.updateInterview(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.noContent().build();
    }
}
