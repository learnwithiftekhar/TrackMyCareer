package com.learnwithiftekhar.server.repository;

import com.learnwithiftekhar.server.model.AppliedStatus;
import com.learnwithiftekhar.server.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    Optional<Job> findByJobUrl(String jobUrl);

    @Query("SELECT j FROM Job j JOIN j.company c " +
           "WHERE j.archived = :archived AND (LOWER(j.jobTitle) LIKE LOWER(:search) OR LOWER(c.companyName) LIKE LOWER(:search))")
    Page<Job> searchJobs(@Param("search") String search, @Param("archived") boolean archived, Pageable pageable);

    @Query("SELECT j FROM Job j JOIN j.company c " +
           "WHERE j.archived = :archived AND (LOWER(j.jobTitle) LIKE LOWER(:search) OR LOWER(c.companyName) LIKE LOWER(:search)) " +
           "AND j.appliedStatus = :status")
    Page<Job> searchJobsByStatus(@Param("search") String search, @Param("status") AppliedStatus status, @Param("archived") boolean archived, Pageable pageable);

    @Query("SELECT j FROM Job j JOIN j.company c " +
           "WHERE j.archived = :archived AND (LOWER(j.jobTitle) LIKE LOWER(:search) OR LOWER(c.companyName) LIKE LOWER(:search)) " +
           "AND c.id = :companyId")
    Page<Job> searchJobsByCompany(@Param("search") String search, @Param("companyId") Long companyId, @Param("archived") boolean archived, Pageable pageable);

    @Query("SELECT j FROM Job j JOIN j.company c " +
           "WHERE j.archived = :archived AND (LOWER(j.jobTitle) LIKE LOWER(:search) OR LOWER(c.companyName) LIKE LOWER(:search)) " +
           "AND j.appliedStatus = :status AND c.id = :companyId")
    Page<Job> searchJobsByStatusAndCompany(@Param("search") String search, @Param("status") AppliedStatus status, @Param("companyId") Long companyId, @Param("archived") boolean archived, Pageable pageable);

    @Query("SELECT j.appliedStatus, COUNT(j) FROM Job j WHERE j.archived = false GROUP BY j.appliedStatus")
    List<Object[]> countByStatus();

    @Query("SELECT COUNT(j) FROM Job j WHERE j.archived = true")
    long countArchived();

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.archived = false AND j.deadline BETWEEN :start AND :end ORDER BY j.deadline ASC")
    List<Job> findUpcomingDeadlines(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
