package org.example.dashboardj.service.implementation;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.*;
import org.example.dashboardj.entity.JobPosting;
import org.example.dashboardj.entity.ProgrammingLanguage;
import org.example.dashboardj.repository.JobPostingRepository;
import org.example.dashboardj.repository.ProgrammingLanguageRepository;
import org.example.dashboardj.service.JobPostingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class JobPostingServiceImpl implements JobPostingService {

    private final JobPostingRepository jobRepo;
    private final ProgrammingLanguageRepository langRepo;

    private JobPostingDTO mapToDTO(JobPosting job) {
        return new JobPostingDTO() {
            @Override public String getId() { return job.getId(); }
            @Override public String getTitle() { return job.getTitle(); }
            @Override public String getCompany() { return job.getCompany(); }
            @Override public String getLocation() { return job.getLocation(); }
            @Override public String getPostedDate() { return job.getPostedDate() != null ? job.getPostedDate().toString() : null; }
            @Override public Double getSalary() { return job.getSalary(); }
            @Override public String getCurrency() { return job.getCurrency(); }
            @Override public String getExperienceLevel() { return job.getExperienceLevel(); }
            @Override public String getIndustry() { return job.getIndustry(); }
            @Override public String getNaceCode() { return job.getNaceCode(); }
            @Override public String getRemoteFlexibility() { return job.getRemoteFlexibility(); }
            @Override public String getEmploymentType() { return job.getEmploymentType(); }
            @Override public List<String> getRequiredLanguages() {
                return job.getRequiredLanguages() == null ? new ArrayList<>() :
                        job.getRequiredLanguages().stream().map(ProgrammingLanguage::getName).collect(Collectors.toList());
            }
        };
    }

    private JobPosting mapToEntity(JobPostingDTO dto, List<ProgrammingLanguage> languages) {
        LocalDate date = null;
        if (dto.getPostedDate() != null && !dto.getPostedDate().isEmpty()) {
            try {
                date = LocalDate.parse(dto.getPostedDate().split("T")[0]);
            } catch (Exception e) {
                // Log error or handle as needed
            }
        }
        
        return JobPosting.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .company(dto.getCompany())
                .location(dto.getLocation())
                .postedDate(date)
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
    public Page<JobPostingDTO> getAllJobs(Pageable pageable, String remoteFlexibility, String industry) {
        List<JobPostingDTO> allJobs = jobRepo.findAllWithLanguages().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        Stream<JobPostingDTO> stream = allJobs.stream();

        if (remoteFlexibility != null && !remoteFlexibility.isEmpty()) {
            stream = stream.filter(j -> remoteFlexibility.equalsIgnoreCase(j.getRemoteFlexibility()));
        }
        if (industry != null && !industry.isEmpty()) {
            stream = stream.filter(j -> industry.equalsIgnoreCase(j.getIndustry()) || industry.equalsIgnoreCase(j.getNaceCode()));
        }

        List<JobPostingDTO> filteredDtos = stream.collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredDtos.size());
        
        List<JobPostingDTO> pageContent = start > filteredDtos.size() ? Collections.emptyList() : filteredDtos.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filteredDtos.size());
    }
    
    @Override
    public List<JobPostingDTO> getAllJobs() {
        return jobRepo.findAllWithLanguages().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public JobPostingDTO getJobById(String id) {
        return jobRepo.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    @Override
    @Transactional
    public JobPostingDTO createJob(JobPostingDTO dto) {
        List<ProgrammingLanguage> languages = getOrCreateLanguages(dto.getRequiredLanguages());
        
        languages.forEach(lang -> {
            lang.setJobCount(lang.getJobCount() + 1);
            langRepo.save(lang);
        });

        JobPosting job = mapToEntity(dto, languages);
        JobPosting savedJob = jobRepo.save(job);
        
        return mapToDTO(savedJob);
    }
    
    @Override
    @Transactional
    public JobPostingDTO updateJob(String id, JobPostingDTO dto) {
        JobPosting existingJob = jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id " + id));
        
        if (existingJob.getRequiredLanguages() != null) {
            existingJob.getRequiredLanguages().forEach(lang -> {
                lang.setJobCount(Math.max(0, lang.getJobCount() - 1));
                langRepo.save(lang);
            });
        }

        List<ProgrammingLanguage> newLanguages = getOrCreateLanguages(dto.getRequiredLanguages());
        
        newLanguages.forEach(lang -> {
            lang.setJobCount(lang.getJobCount() + 1);
            langRepo.save(lang);
        });
        
        existingJob.setTitle(dto.getTitle());
        existingJob.setCompany(dto.getCompany());
        // ... set other fields from dto ...
        existingJob.setRequiredLanguages(newLanguages);
        
        JobPosting savedJob = jobRepo.save(existingJob);
        return mapToDTO(savedJob);
    }

    @Override
    @Transactional
    public List<JobPostingDTO> createJobs(List<JobPostingDTO> dtos) {
        List<JobPosting> entitiesToSave = dtos.stream()
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
        
        return savedEntities.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteJob(String id) {
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
        if (languageNames == null || languageNames.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<ProgrammingLanguage> existingLangs = langRepo.findAllByNameIn(languageNames);
        Map<String, ProgrammingLanguage> existingLangsMap = existingLangs.stream()
            .collect(Collectors.toMap(ProgrammingLanguage::getName, lang -> lang));

        List<ProgrammingLanguage> result = new ArrayList<>();
        for (String name : languageNames) {
            ProgrammingLanguage lang = existingLangsMap.get(name);
            if (lang == null) {
                lang = langRepo.save(ProgrammingLanguage.builder().name(name).jobCount(0).popularityScore(0.0).build());
            }
            result.add(lang);
        }
        return result;
    }

    @Override
    public List<JobPostingDTO> searchByTitle(String title) {
        return jobRepo.findByTitleContainingIgnoreCase(title).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<JobPostingDTO> searchByTitle(String title, Pageable pageable) {
        return jobRepo.findByTitleContainingIgnoreCase(title, pageable).map(this::mapToDTO);
    }

    // ... other analytics methods remain the same ...
    @Override
    public Map<String, Double> getAverageSalaryByIndustry() {
        return jobRepo.getAverageSalaryByIndustry().stream()
            .collect(Collectors.toMap(AverageSalaryDTO::getName, AverageSalaryDTO::getValue));
    }

    @Override
    public Map<String, Long> getSalaryDistributionByExperience() {
        return jobRepo.getSalaryDistributionByExperience().stream()
            .collect(Collectors.toMap(CountResultDTO::getName, CountResultDTO::getCount));
    }

    @Override
    public Map<String, Double> getRemoteVsOnsiteStats() {
        return jobRepo.getRemoteVsOnsiteStats().stream()
            .collect(Collectors.toMap(AverageSalaryDTO::getName, AverageSalaryDTO::getValue));
    }

    @Override
    public Map<String, Long> getEmploymentTypeDistribution() {
        return jobRepo.getEmploymentTypeDistribution().stream()
            .collect(Collectors.toMap(CountResultDTO::getName, CountResultDTO::getCount));
    }

    @Override
    public Map<String, Long> getJobPostingsOverTime() {
        return jobRepo.getJobPostingsOverTime().stream()
            .collect(Collectors.toMap(CountResultDTO::getName, CountResultDTO::getCount, (v1, v2) -> v1, TreeMap::new));
    }

    @Override
    public Map<String, Long> getSubSectorsByNaceCode(String naceCode) {
        return jobRepo.getSubSectorsByNaceCode(naceCode).stream()
            .collect(Collectors.toMap(CountResultDTO::getName, CountResultDTO::getCount));
    }
    
    @Override
    public Map<String, Long> getJobLocations() {
        return jobRepo.getJobLocations().stream()
            .collect(Collectors.toMap(CountResultDTO::getName, CountResultDTO::getCount));
    }

    @Override
    public Map<String, Long> getJobTitlesBySkills(String skill1, String skill2) {
        return jobRepo.findJobTitlesBySkills(skill1, skill2).stream()
            .collect(Collectors.toMap(CountResultDTO::getName, CountResultDTO::getCount));
    }

    @Override
    public List<KeyIndicatorDTO> getKeyIndicators() {
        long totalJobs = jobRepo.count();
        KeyIndicatorDTO totalJobsIndicator = new KeyIndicatorDTO("Total Active Jobs", String.format("%,d", totalJobs), "From live data");

        LocalDate currentPeriodEnd = LocalDate.now();
        LocalDate currentPeriodStart = currentPeriodEnd.minusDays(30);
        LocalDate previousPeriodStart = currentPeriodEnd.minusDays(60);

        Optional<SkillGrowthDTO> fastestGrowingSkillOpt = langRepo.findFastestGrowingSkill(
            currentPeriodEnd, 
            currentPeriodStart, 
            previousPeriodStart
        );

        KeyIndicatorDTO fastestGrowingSkillIndicator = fastestGrowingSkillOpt
            .map(skill -> new KeyIndicatorDTO(
                "Fastest Growing Skill", 
                skill.getSkillName(), 
                String.format("%+.2f%% MoM", skill.getGrowthPercentage())
            ))
            .orElseGet(() -> {
                List<ProgrammingLanguage> topSkills = langRepo.findTop5ByOrderByJobCountDesc();
                if (topSkills.isEmpty()) {
                    return new KeyIndicatorDTO("Fastest Growing Skill", "N/A", "Insufficient data");
                } else {
                    return new KeyIndicatorDTO("Top Skill (by volume)", topSkills.get(0).getName(), String.format("%,d jobs", topSkills.get(0).getJobCount()));
                }
            });


        List<CountResultDTO> topRoleList = jobRepo.findTopRole();
        KeyIndicatorDTO topDemandedRoleIndicator;
        if (topRoleList.isEmpty()) {
            topDemandedRoleIndicator = new KeyIndicatorDTO("Top Demanded Role", "N/A", "");
        } else {
            CountResultDTO topRoleResult = topRoleList.get(0);
            topDemandedRoleIndicator = new KeyIndicatorDTO("Top Demanded Role", topRoleResult.getName(), String.format("%,d mentions", topRoleResult.getCount()));
        }

        List<CountResultDTO> topIndustryList = jobRepo.findTopIndustry();
        KeyIndicatorDTO topIndustryIndicator;
        if (topIndustryList.isEmpty()) {
            topIndustryIndicator = new KeyIndicatorDTO("Top Industry", "N/A", "");
        } else {
            CountResultDTO topIndustryResult = topIndustryList.get(0);
            topIndustryIndicator = new KeyIndicatorDTO("Top Industry", topIndustryResult.getName(), String.format("%,d jobs", topIndustryResult.getCount()));
        }

        return Arrays.asList(totalJobsIndicator, fastestGrowingSkillIndicator, topDemandedRoleIndicator, topIndustryIndicator);
    }
}