package org.example.dashboardj.service.implementation;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.ProgrammingLanguageDTO;
import org.example.dashboardj.entity.ProgrammingLanguage;
import org.example.dashboardj.repository.ProgrammingLanguageRepository;
import org.example.dashboardj.service.ProgrammingLanguageService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgrammingLanguageServiceImpl implements ProgrammingLanguageService {

    private final ProgrammingLanguageRepository repository;

    private ProgrammingLanguageDTO mapToDTO(ProgrammingLanguage lang) {
        return ProgrammingLanguageDTO.builder()
                .name(lang.getName())
                .jobCount(lang.getJobCount())
                .popularityScore(lang.getPopularityScore())
                .build();
    }

    private ProgrammingLanguage mapToEntity(ProgrammingLanguageDTO dto) {
        return ProgrammingLanguage.builder()
                .name(dto.getName())
                .jobCount(dto.getJobCount())
                .popularityScore(dto.getPopularityScore())
                .build();
    }

    @Override
    public List<ProgrammingLanguageDTO> getAllLanguages() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProgrammingLanguageDTO getLanguageById(Long id) {
        return repository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Language not found"));
    }

    @Override
    public ProgrammingLanguageDTO createLanguage(ProgrammingLanguageDTO dto) {
        ProgrammingLanguage entity = mapToEntity(dto);
        return mapToDTO(repository.save(entity));
    }

    @Override
    public ProgrammingLanguageDTO updateLanguage(Long id, ProgrammingLanguageDTO dto) {
        ProgrammingLanguage existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Language not found"));

        existing.setName(dto.getName());
        existing.setJobCount(dto.getJobCount());
        existing.setPopularityScore(dto.getPopularityScore());

        return mapToDTO(repository.save(existing));
    }

    @Override
    public void deleteLanguage(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<ProgrammingLanguageDTO> getTopLanguages() {
        return repository.findTop5ByOrderByJobCountDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProgrammingLanguageDTO> searchLanguages(String name) {
        return repository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}

