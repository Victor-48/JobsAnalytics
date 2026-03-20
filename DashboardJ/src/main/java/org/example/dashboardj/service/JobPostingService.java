package org.example.dashboardj.service;

import org.example.dashboardj.dto.JobPostingDTO;
import java.util.List;

public interface JobPostingService {
    List<JobPostingDTO> getAllJobs();
    JobPostingDTO getJobById(Long id);
    JobPostingDTO createJob(JobPostingDTO dto);
    void deleteJob(Long id);
    List<JobPostingDTO> searchByTitle(String title);
}
