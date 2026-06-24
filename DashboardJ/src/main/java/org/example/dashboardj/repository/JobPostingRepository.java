package org.example.dashboardj.repository;

import org.example.dashboardj.dto.AverageSalaryDTO;
import org.example.dashboardj.dto.CountResultDTO;
import org.example.dashboardj.dto.JobPostingDTO;
import org.example.dashboardj.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface JobPostingRepository extends Neo4jRepository<JobPosting, String> { 

    Page<JobPosting> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    List<JobPosting> findByTitleContainingIgnoreCase(String title);

    List<JobPosting> findByCompanyContainingIgnoreCase(String company);

    @Query("MATCH (j:JobPosting) WHERE toLower(j.industry) CONTAINS toLower($industry) RETURN j")
    List<JobPosting> findJobsByIndustrySafe(@Param("industry") String industry);

    @Query("MATCH (j:JobPosting) WHERE j.industry IS NOT NULL " +
           "RETURN j.industry as name, count(j) as count " +
           "ORDER BY count DESC LIMIT 1")
    List<CountResultDTO> findTopIndustry();

    @Query("MATCH (j:JobPosting) WHERE j.title IS NOT NULL " +
           "RETURN j.title as name, count(j) as count " +
           "ORDER BY count DESC LIMIT 1")
    List<CountResultDTO> findTopRole();

    @Query("MATCH (j:JobPosting) " +
           "WHERE j.industry IS NOT NULL AND j.salary IS NOT NULL " +
           "RETURN j.industry as name, avg(j.salary) as value")
    List<AverageSalaryDTO> getAverageSalaryByIndustry();

    @Query("MATCH (j:JobPosting) " +
           "WHERE j.experienceLevel IS NOT NULL " +
           "RETURN j.experienceLevel as name, count(j) as count")
    List<CountResultDTO> getSalaryDistributionByExperience();

    @Query("MATCH (j:JobPosting) " +
           "WHERE j.remoteFlexibility IS NOT NULL AND j.salary IS NOT NULL " +
           "RETURN j.remoteFlexibility as name, avg(j.salary) as value")
    List<AverageSalaryDTO> getRemoteVsOnsiteStats();

    @Query("MATCH (j:JobPosting) " +
           "WHERE j.employmentType IS NOT NULL " +
           "RETURN j.employmentType as name, count(j) as count")
    List<CountResultDTO> getEmploymentTypeDistribution();

    @Query("MATCH (j:JobPosting) WHERE j.postedDate IS NOT NULL " +
            "RETURN substring(toString(j.postedDate), 0, 10) as name, count(j) as count")
    List<CountResultDTO> getJobPostingsOverTime();

    @Query("MATCH (j:JobPosting) " +
           "WHERE j.naceCode = $naceCode AND j.title IS NOT NULL " +
           "RETURN j.title as name, count(j) as count")
    List<CountResultDTO> getSubSectorsByNaceCode(@Param("naceCode") String naceCode);

    @Query("MATCH (j:JobPosting) " +
           "WHERE j.location IS NOT NULL AND j.location <> '' " +
           "RETURN j.location as name, count(j) as count")
    List<CountResultDTO> getJobLocations();

    @Query("MATCH (s1:ProgrammingLanguage {name: $skill1})<-[:REQUIRES]-(j:JobPosting)-[:REQUIRES]->(s2:ProgrammingLanguage {name: $skill2}) " +
           "RETURN j.title as name, count(j) as count " +
           "ORDER BY count DESC")
    List<CountResultDTO> findJobTitlesBySkills(@Param("skill1") String skill1, @Param("skill2") String skill2);
}