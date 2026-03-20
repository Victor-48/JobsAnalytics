package org.example.dashboardj.repository;

import org.example.dashboardj.entity.JobPosting;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobPostingRepository extends Neo4jRepository<JobPosting, Long> {

    List<JobPosting> findByTitleContainingIgnoreCase(String title);

    List<JobPosting> findByCompanyContainingIgnoreCase(String company);
}
