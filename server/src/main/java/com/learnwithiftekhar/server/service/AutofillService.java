package com.learnwithiftekhar.server.service;

import com.learnwithiftekhar.server.dto.AutofillResponse;
import com.learnwithiftekhar.server.dto.CoverLetterRequest;
import com.learnwithiftekhar.server.dto.CoverLetterResponse;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AutofillService {

    private final ChatClient chatClient;

    @Value("${spring.ai.openai.api-key:}")
    private String apiKey;

    public AutofillService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public AutofillResponse autofill(String url) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OPENAI_API_KEY is not configured");
        }
        String pageText = fetchPageText(url);
        return callAi(url, pageText);
    }

    private String fetchPageText(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (compatible; TrackMyCareer/1.0)")
                    .timeout(12_000)
                    .get();
            String text = doc.body().text();
            return text.length() > 8000 ? text.substring(0, 8000) : text;
        } catch (Exception e) {
            return "";
        }
    }

    public CoverLetterResponse generateCoverLetter(CoverLetterRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OPENAI_API_KEY is not configured");
        }
        String company = request.getCompanyName() != null ? request.getCompanyName() : "the company";
        String description = request.getJobDescription() != null && !request.getJobDescription().isBlank()
                ? request.getJobDescription()
                : "(no description provided)";
        try {
            String draft = chatClient.prompt()
                    .system("You are an expert career coach who writes compelling, concise cover letters. Write in first person. Keep it to 3–4 short paragraphs. Do not include a salutation, date, or address block — just the body paragraphs.")
                    .user("""
                            Write a cover letter draft for the following role.

                            Job title: %s
                            Company: %s

                            Job description:
                            %s
                            """.formatted(request.getJobTitle(), company, description))
                    .call()
                    .content();
            return new CoverLetterResponse(draft);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate cover letter");
        }
    }

    private AutofillResponse callAi(String url, String pageText) {
        try {
            return chatClient.prompt()
                    .system("You are a job data extractor. Extract structured information from job postings accurately.")
                    .user("""
                            Extract job details from the following job posting.

                            Job posting URL: %s

                            Page text:
                            %s

                            Extract jobTitle, companyName, jobDescription, salaryRange (null if not found),
                            and jobSource (the job board or site name such as "LinkedIn", "Greenhouse", "Lever",
                            "Company website", or null if unknown).
                            """.formatted(url, pageText))
                    .call()
                    .entity(AutofillResponse.class);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to extract job details");
        }
    }
}
