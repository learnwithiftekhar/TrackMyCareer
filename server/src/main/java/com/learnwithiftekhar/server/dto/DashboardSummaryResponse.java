package com.learnwithiftekhar.server.dto;

import java.util.List;
import java.util.Map;

public class DashboardSummaryResponse {

    private Map<String, Long> statusCounts;
    private List<JobResponse> upcomingDeadlines;
    private List<UpcomingInterviewResponse> upcomingInterviews;

    public DashboardSummaryResponse(
            Map<String, Long> statusCounts,
            List<JobResponse> upcomingDeadlines,
            List<UpcomingInterviewResponse> upcomingInterviews) {
        this.statusCounts = statusCounts;
        this.upcomingDeadlines = upcomingDeadlines;
        this.upcomingInterviews = upcomingInterviews;
    }

    public Map<String, Long> getStatusCounts() { return statusCounts; }
    public List<JobResponse> getUpcomingDeadlines() { return upcomingDeadlines; }
    public List<UpcomingInterviewResponse> getUpcomingInterviews() { return upcomingInterviews; }
}
