package com.learnwithiftekhar.server.repository;

import com.learnwithiftekhar.server.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("SELECT j FROM Job j JOIN j.company c " +
           "WHERE LOWER(j.jobTitle) LIKE LOWER(:search) OR LOWER(c.companyName) LIKE LOWER(:search)")
    Page<Job> searchJobs(@Param("search") String search, Pageable pageable);
}
