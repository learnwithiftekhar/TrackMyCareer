package com.learnwithiftekhar.server.repository;

import com.learnwithiftekhar.server.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    @Query("SELECT i FROM Interview i JOIN FETCH i.job j JOIN FETCH j.company " +
           "WHERE i.interviewDate BETWEEN :start AND :end ORDER BY i.interviewDate ASC")
    List<Interview> findUpcoming(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
