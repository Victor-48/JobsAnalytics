package org.example.dashboardj.repository;

import org.example.dashboardj.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends Neo4jRepository<JobPosting, Long> {

    Page<JobPosting> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    List<JobPosting> findByCompanyContainingIgnoreCase(String company);
    
    @Query("MATCH (j:JobPosting) WHERE toLower(j.industry) CONTAINS toLower($industry) RETURN j")
    List<JobPosting> findJobsByIndustrySafe(@Param("industry") String industry);
}