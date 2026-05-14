package com.learnwithiftekhar.server.service;

import com.learnwithiftekhar.server.dto.DashboardSummaryResponse;
import com.learnwithiftekhar.server.dto.JobResponse;
import com.learnwithiftekhar.server.dto.UpcomingInterviewResponse;
import com.learnwithiftekhar.server.model.AppliedStatus;
import com.learnwithiftekhar.server.model.Interview;
import com.learnwithiftekhar.server.model.Job;
import com.learnwithiftekhar.server.repository.InterviewRepository;
import com.learnwithiftekhar.server.repository.JobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final JobRepository jobRepository;
    private final InterviewRepository interviewRepository;

    public DashboardService(JobRepository jobRepository, InterviewRepository interviewRepository) {
        this.jobRepository = jobRepository;
        this.interviewRepository = interviewRepository;
    }

    public DashboardSummaryResponse getSummary() {
        LocalDate today = LocalDate.now();

        Map<String, Long> counts = Arrays.stream(AppliedStatus.values())
                .collect(Collectors.toMap(Enum::name, s -> 0L, (a, b) -> a, LinkedHashMap::new));
        jobRepository.countByStatus()
                .forEach(row -> counts.put(((AppliedStatus) row[0]).name(), (Long) row[1]));

        List<JobResponse> deadlines = jobRepository
                .findUpcomingDeadlines(today, today.plusDays(3))
                .stream().map(this::toJobResponse).toList();

        List<UpcomingInterviewResponse> interviews = interviewRepository
                .findUpcoming(today, today.plusDays(7))
                .stream().map(this::toInterviewResponse).toList();

        return new DashboardSummaryResponse(counts, deadlines, interviews);
    }

    private JobResponse toJobResponse(Job job) {
        JobResponse r = new JobResponse();
        r.setId(job.getId());
        r.setJobTitle(job.getJobTitle());
        r.setCompanyId(job.getCompany().getId());
        r.setCompanyName(job.getCompany().getCompanyName());
        r.setAppliedStatus(job.getAppliedStatus().name());
        r.setAppliedDate(job.getAppliedDate());
        r.setDeadline(job.getDeadline());
        r.setJobUrl(job.getJobUrl());
        r.setJobSource(job.getJobSource());
        r.setSalaryRange(job.getSalaryRange());
        return r;
    }

    private UpcomingInterviewResponse toInterviewResponse(Interview i) {
        UpcomingInterviewResponse r = new UpcomingInterviewResponse();
        r.setId(i.getId());
        r.setRoundName(i.getRoundName());
        r.setInterviewDate(i.getInterviewDate());
        r.setJobId(i.getJob().getId());
        r.setJobTitle(i.getJob().getJobTitle());
        r.setCompanyId(i.getJob().getCompany().getId());
        r.setCompanyName(i.getJob().getCompany().getCompanyName());
        return r;
    }
}
