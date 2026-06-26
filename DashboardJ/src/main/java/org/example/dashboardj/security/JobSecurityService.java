package org.example.dashboardj.security;

import org.example.dashboardj.entity.JobPosting;
import org.example.dashboardj.repository.JobPostingRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("jobSecurityService")
public class JobSecurityService {

    private final JobPostingRepository jobPostingRepository;

    public JobSecurityService(JobPostingRepository jobPostingRepository) {
        this.jobPostingRepository = jobPostingRepository;
    }

    public boolean isJobOwner(Authentication authentication, String jobId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Optional<JobPosting> jobPostingOpt = jobPostingRepository.findById(jobId);
        if (jobPostingOpt.isEmpty()) {
            return false;
        }

        JobPosting jobPosting = jobPostingOpt.get();
        String currentUsername = authentication.getName();
        
        return currentUsername.equals(jobPosting.getCreatedByUserId());
    }
}
