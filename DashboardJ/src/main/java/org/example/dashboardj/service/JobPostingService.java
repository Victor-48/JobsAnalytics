package org.example.dashboardj.service;

import org.example.dashboardj.dto.JobPostingDTO;
import org.example.dashboardj.dto.KeyIndicatorDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface JobPostingService {
    Page<JobPostingDTO> getAllJobs(Pageable pageable, String remoteFlexibility, String industry);
    List<JobPostingDTO> getAllJobs(); // Added back for backwards compatibility
    JobPostingDTO getJobById(String id);
    JobPostingDTO createJob(JobPostingDTO dto);
    JobPostingDTO updateJob(String id, JobPostingDTO dto);
    List<JobPostingDTO> createJobs(List<JobPostingDTO> dtos); // Bulk insert method
    void deleteJob(String id);
    Page<JobPostingDTO> searchByTitle(String title, Pageable pageable);
    List<JobPostingDTO> searchByTitle(String title); // Added back for backwards compatibility
    
    // Analytics methods
    Map<String, Double> getAverageSalaryByIndustry();
    Map<String, Long> getSalaryDistributionByExperience();
    Map<String, Double> getRemoteVsOnsiteStats();
    Map<String, Long> getEmploymentTypeDistribution();
    Map<String, Long> getSubSectorsByNaceCode(String naceCode);
    Map<String, Long> getJobLocations();
    
    // Time Series
    Map<String, Long> getJobPostingsOverTime();
    
    // Key Indicators
    List<KeyIndicatorDTO> getKeyIndicators();
}