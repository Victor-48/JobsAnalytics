package org.example.dashboardj.service.implementation;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.JobPostingDTO;
import org.example.dashboardj.entity.JobPosting;
import org.example.dashboardj.entity.ProgrammingLanguage;
import org.example.dashboardj.repository.JobPostingRepository;
import org.example.dashboardj.repository.ProgrammingLanguageRepository;
import org.example.dashboardj.service.JobPostingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPostingServiceImpl implements JobPostingService {

    private final JobPostingRepository jobRepo;
    private final ProgrammingLanguageRepository langRepo;

    private JobPostingDTO mapToDTO(JobPosting job) {
        return JobPostingDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .postedDate(job.getPostedDate())
                .salary(job.getSalary())
                .currency(job.getCurrency())
                .experienceLevel(job.getExperienceLevel())
                .industry(job.getIndustry())
                .naceCode(job.getNaceCode())
                .remoteFlexibility(job.getRemoteFlexibility())
                .employmentType(job.getEmploymentType())
                .requiredLanguages(
                        job.getRequiredLanguages() == null ? null :
                                job.getRequiredLanguages().stream()
                                        .map(ProgrammingLanguage::getName)
                                        .collect(Collectors.toList())
                )
                .build();
    }

    private JobPosting mapToEntity(JobPostingDTO dto, List<ProgrammingLanguage> languages) {
        return JobPosting.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .company(dto.getCompany())
                .location(dto.getLocation())
                .postedDate(dto.getPostedDate())
                .salary(dto.getSalary())
                .currency(dto.getCurrency())
                .experienceLevel(dto.getExperienceLevel())
                .industry(dto.getIndustry())
                .naceCode(dto.getNaceCode())
                .remoteFlexibility(dto.getRemoteFlexibility())
                .employmentType(dto.getEmploymentType())
                .requiredLanguages(languages)
                .build();
    }

    @Override
    public List<JobPostingDTO> getAllJobs() {
        return jobRepo.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public JobPostingDTO getJobById(Long id) {
        return jobRepo.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    @Override
    @Transactional
    public JobPostingDTO createJob(JobPostingDTO dto) {
        dto.setId(null);
        List<ProgrammingLanguage> languages = getOrCreateLanguages(dto.getRequiredLanguages());
        
        // Increment job count for each language
        languages.forEach(lang -> {
            lang.setJobCount(lang.getJobCount() + 1);
            langRepo.save(lang);
        });

        JobPosting job = mapToEntity(dto, languages);
        return mapToDTO(jobRepo.save(job));
    }
    
    @Override
    @Transactional
    public JobPostingDTO updateJob(Long id, JobPostingDTO dto) {
        JobPosting existingJob = jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id " + id));
        
        // Decrement job count for old languages
        if (existingJob.getRequiredLanguages() != null) {
            existingJob.getRequiredLanguages().forEach(lang -> {
                lang.setJobCount(Math.max(0, lang.getJobCount() - 1));
                langRepo.save(lang);
            });
        }

        List<ProgrammingLanguage> newLanguages = getOrCreateLanguages(dto.getRequiredLanguages());
        
        // Increment job count for new languages
        newLanguages.forEach(lang -> {
            lang.setJobCount(lang.getJobCount() + 1);
            langRepo.save(lang);
        });
        
        existingJob.setTitle(dto.getTitle());
        existingJob.setCompany(dto.getCompany());
        existingJob.setLocation(dto.getLocation());
        existingJob.setPostedDate(dto.getPostedDate());
        existingJob.setSalary(dto.getSalary());
        existingJob.setCurrency(dto.getCurrency());
        existingJob.setExperienceLevel(dto.getExperienceLevel());
        existingJob.setIndustry(dto.getIndustry());
        existingJob.setNaceCode(dto.getNaceCode());
        existingJob.setRemoteFlexibility(dto.getRemoteFlexibility());
        existingJob.setEmploymentType(dto.getEmploymentType());
        existingJob.setRequiredLanguages(newLanguages);
        
        return mapToDTO(jobRepo.save(existingJob));
    }

    @Override
    @Transactional
    public List<JobPostingDTO> createJobs(List<JobPostingDTO> dtos) {
        List<JobPosting> entitiesToSave = dtos.stream()
                .peek(dto -> dto.setId(null))
                .map(dto -> {
                    List<ProgrammingLanguage> languages = getOrCreateLanguages(dto.getRequiredLanguages());
                    languages.forEach(lang -> {
                        lang.setJobCount(lang.getJobCount() + 1);
                        langRepo.save(lang);
                    });
                    return mapToEntity(dto, languages);
                })
                .collect(Collectors.toList());
        
        List<JobPosting> savedEntities = jobRepo.saveAll(entitiesToSave);
        
        return savedEntities.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteJob(Long id) {
        jobRepo.findById(id).ifPresent(job -> {
            if (job.getRequiredLanguages() != null) {
                job.getRequiredLanguages().forEach(lang -> {
                    lang.setJobCount(Math.max(0, lang.getJobCount() - 1));
                    langRepo.save(lang);
                });
            }
            jobRepo.deleteById(id);
        });
    }

    private List<ProgrammingLanguage> getOrCreateLanguages(List<String> languageNames) {
        if (languageNames == null) return new ArrayList<>();
        return languageNames.stream()
            .map(name -> langRepo.findByName(name)
                .orElseGet(() -> langRepo.save(ProgrammingLanguage.builder().name(name).jobCount(0).popularityScore(0.0).build())))
            .collect(Collectors.toList());
    }

    @Override
    public List<JobPostingDTO> searchByTitle(String title) {
        return jobRepo.findByTitleContainingIgnoreCase(title).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<JobPostingDTO> searchByTitle(String title, Pageable pageable) {
        Page<JobPosting> pagedResult = jobRepo.findByTitleContainingIgnoreCase(title, pageable);
        List<JobPostingDTO> dtos = pagedResult.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return new org.springframework.data.domain.PageImpl<>(dtos, pageable, pagedResult.getTotalElements());
    }

    @Override
    public Page<JobPostingDTO> getAllJobs(Pageable pageable, String remoteFlexibility, String industry) {
        List<JobPosting> allJobs = jobRepo.findAll();
        
        List<JobPostingDTO> filteredJobs = allJobs.stream()
            .filter(j -> remoteFlexibility == null || remoteFlexibility.isEmpty() || remoteFlexibility.equalsIgnoreCase(j.getRemoteFlexibility()))
            .filter(j -> industry == null || industry.isEmpty() || industry.equalsIgnoreCase(j.getNaceCode()) || industry.equalsIgnoreCase(j.getIndustry()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredJobs.size());
        
        List<JobPostingDTO> pageContent;
        if (start > filteredJobs.size()) {
            pageContent = new ArrayList<>();
        } else {
            pageContent = filteredJobs.subList(start, end);
        }

        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filteredJobs.size());
    }

    @Override
    public Map<String, Double> getAverageSalaryByIndustry() {
        return jobRepo.findAll().stream()
                // Use NACE Code for grouping if available, fallback to industry
                .filter(job -> (job.getNaceCode() != null || job.getIndustry() != null) && job.getSalary() != null)
                .collect(Collectors.groupingBy(
                        job -> job.getNaceCode() != null ? job.getNaceCode() : job.getIndustry(),
                        Collectors.averagingDouble(JobPosting::getSalary)
                ));
    }

    @Override
    public Map<String, Long> getSalaryDistributionByExperience() {
        return jobRepo.findAll().stream()
                .filter(job -> job.getExperienceLevel() != null)
                .collect(Collectors.groupingBy(
                        JobPosting::getExperienceLevel,
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Double> getRemoteVsOnsiteStats() {
        return jobRepo.findAll().stream()
                .filter(job -> job.getRemoteFlexibility() != null && job.getSalary() != null)
                .collect(Collectors.groupingBy(
                        JobPosting::getRemoteFlexibility,
                        Collectors.averagingDouble(JobPosting::getSalary)
                ));
    }

    @Override
    public Map<String, Long> getEmploymentTypeDistribution() {
        return jobRepo.findAll().stream()
                .filter(job -> job.getEmploymentType() != null)
                .collect(Collectors.groupingBy(
                        JobPosting::getEmploymentType,
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Long> getJobPostingsOverTime() {
        // Group by just the YYYY-MM-DD part of the postedDate
        return jobRepo.findAll().stream()
                .filter(job -> job.getPostedDate() != null)
                .collect(Collectors.groupingBy(
                        job -> job.getPostedDate().split("T")[0],
                        TreeMap::new, // Keep sorted by date
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Long> getSubSectorsByNaceCode(String naceCode) {
        return jobRepo.findAll().stream()
                .filter(job -> naceCode.equals(job.getNaceCode()))
                .collect(Collectors.groupingBy(
                        JobPosting::getTitle, // We use the job title as the sub-sector proxy
                        Collectors.counting()
                ));
    }
    
    @Override
    public Map<String, Long> getJobLocations() {
        return jobRepo.findAll().stream()
                .filter(job -> job.getLocation() != null && !job.getLocation().isEmpty())
                .collect(Collectors.groupingBy(
                        JobPosting::getLocation,
                        Collectors.counting()
                ));
    }
}