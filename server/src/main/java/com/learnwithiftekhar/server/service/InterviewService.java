package com.learnwithiftekhar.server.service;

import com.learnwithiftekhar.server.dto.InterviewRequest;
import com.learnwithiftekhar.server.dto.InterviewResponse;
import com.learnwithiftekhar.server.model.Interview;
import com.learnwithiftekhar.server.model.Job;
import com.learnwithiftekhar.server.repository.InterviewRepository;
import com.learnwithiftekhar.server.repository.JobRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobRepository jobRepository;

    public InterviewService(InterviewRepository interviewRepository, JobRepository jobRepository) {
        this.interviewRepository = interviewRepository;
        this.jobRepository = jobRepository;
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getAllInterviews() {
        return interviewRepository.findAllWithDetails().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByJob(Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }
        return interviewRepository.findByJobId(jobId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public InterviewResponse getInterview(Long id) {
        return toResponse(findById(id));
    }

    public InterviewResponse createInterview(InterviewRequest request) {
        Job job = findJobById(request.getJobId());
        Interview interview = new Interview();
        applyRequest(interview, request, job);
        return toResponse(interviewRepository.save(interview));
    }

    public InterviewResponse updateInterview(Long id, InterviewRequest request) {
        Interview interview = findById(id);
        Job job = findJobById(request.getJobId());
        applyRequest(interview, request, job);
        return toResponse(interviewRepository.save(interview));
    }

    public void deleteInterview(Long id) {
        if (!interviewRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found");
        }
        interviewRepository.deleteById(id);
    }

    private Interview findById(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview not found"));
    }

    private Job findJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found"));
    }

    private void applyRequest(Interview interview, InterviewRequest request, Job job) {
        interview.setRoundName(request.getRoundName());
        interview.setInterviewDate(request.getInterviewDate());
        interview.setNotes(request.getNotes());
        interview.setJob(job);
    }

    private InterviewResponse toResponse(Interview interview) {
        InterviewResponse response = new InterviewResponse();
        response.setId(interview.getId());
        response.setRoundName(interview.getRoundName());
        response.setInterviewDate(interview.getInterviewDate());
        response.setNotes(interview.getNotes());
        response.setJobId(interview.getJob().getId());
        response.setJobTitle(interview.getJob().getJobTitle());
        response.setCompanyId(interview.getJob().getCompany().getId());
        response.setCompanyName(interview.getJob().getCompany().getCompanyName());
        return response;
    }
}
