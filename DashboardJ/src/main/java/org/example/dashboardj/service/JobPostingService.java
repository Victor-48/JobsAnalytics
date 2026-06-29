package org.example.dashboardj.service;

import org.example.dashboardj.dto.EmergingTechDTO;
import org.example.dashboardj.dto.JobPostingDTO;
import org.example.dashboardj.dto.KeyIndicatorDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface JobPostingService {
    Page<JobPostingDTO> getAllJobs(Pageable pageable, String remoteFlexibility, String industry, String country, String city);
    List<JobPostingDTO> getAllJobs();
    JobPostingDTO getJobById(String id);
    JobPostingDTO createJob(JobPostingDTO dto);
    JobPostingDTO updateJob(String id, JobPostingDTO dto);
    List<JobPostingDTO> createJobs(List<JobPostingDTO> dtos); // Bulk insert method
    void deleteJob(String id);
    Object debugQuery(String query);
    Page<JobPostingDTO> searchByTitle(String title, Pageable pageable);
    List<JobPostingDTO> searchByTitle(String title);
    
    Map<String, Double> getAverageSalaryByIndustry();
    Map<String, Long> getSalaryDistributionByExperience();
    Map<String, Double> getRemoteVsOnsiteStats();
    Map<String, Long> getEmploymentTypeDistribution();
    Map<String, Long> getSubSectorsByNaceCode(String naceCode);
    Object getJobLocations();
    Map<String, Long> getJobTitlesBySkills(String skill1, String skill2);
    
    // Time Series
    Map<String, Long> getJobPostingsOverTime();
    
    List<Map<String, Object>> getRoleCannibalizationStats();

    List<KeyIndicatorDTO> getKeyIndicators();
    List<EmergingTechDTO> getEmergingTechIndex();
    
    void generateTestData();
}