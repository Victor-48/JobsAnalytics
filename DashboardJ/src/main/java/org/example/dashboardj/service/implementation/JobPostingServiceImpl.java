package org.example.dashboardj.service.implementation;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.JobPostingDTO;
import org.example.dashboardj.entity.JobPosting;
import org.example.dashboardj.entity.ProgrammingLanguage;
import org.example.dashboardj.repository.JobPostingRepository;
import org.example.dashboardj.repository.ProgrammingLanguageRepository;
import org.example.dashboardj.service.JobPostingService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPostingServiceImpl implements JobPostingService {

    private final JobPostingRepository jobRepo;
    private final ProgrammingLanguageRepository langRepo;

    private JobPostingDTO mapToDTO(JobPosting job) {
        return JobPostingDTO.builder()
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .postedDate(job.getPostedDate())
                .requiredLanguages(
                        job.getRequiredLanguages() == null ? null :
                                job.getRequiredLanguages().stream()
                                        .map(ProgrammingLanguage::getName)
                                        .collect(Collectors.toList())
                )
                .build();
    }

    private JobPosting mapToEntity(JobPostingDTO dto) {
        List<ProgrammingLanguage> langs = dto.getRequiredLanguages() == null ? List.of() :
                dto.getRequiredLanguages().stream()
                        .map(name -> langRepo.findByNameContainingIgnoreCase(name).stream()
                                .findFirst()
                                .orElse(ProgrammingLanguage.builder().name(name).build()))
                        .collect(Collectors.toList());

        return JobPosting.builder()
                .title(dto.getTitle())
                .company(dto.getCompany())
                .location(dto.getLocation())
                .postedDate(dto.getPostedDate())
                .requiredLanguages(langs)
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
    public JobPostingDTO createJob(JobPostingDTO dto) {
        return mapToDTO(jobRepo.save(mapToEntity(dto)));
    }

    @Override
    public void deleteJob(Long id) {
        jobRepo.deleteById(id);
    }

    @Override
    public List<JobPostingDTO> searchByTitle(String title) {
        return jobRepo.findByTitleContainingIgnoreCase(title).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}
