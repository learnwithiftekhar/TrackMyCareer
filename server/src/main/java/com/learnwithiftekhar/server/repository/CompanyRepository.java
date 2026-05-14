package com.learnwithiftekhar.server.repository;

import com.learnwithiftekhar.server.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}
