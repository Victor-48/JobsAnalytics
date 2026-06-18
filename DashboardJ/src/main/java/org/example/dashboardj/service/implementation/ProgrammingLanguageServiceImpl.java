package org.example.dashboardj.service.implementation;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.GraphDataDTO;
import org.example.dashboardj.dto.GraphLinkDTO;
import org.example.dashboardj.dto.GraphNodeDTO;
import org.example.dashboardj.dto.ProgrammingLanguageDTO;
import org.example.dashboardj.entity.ProgrammingLanguage;
import org.example.dashboardj.repository.ProgrammingLanguageRepository;
import org.example.dashboardj.service.ProgrammingLanguageService;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgrammingLanguageServiceImpl implements ProgrammingLanguageService {

    private final ProgrammingLanguageRepository repository;
    private final Neo4jClient neo4jClient;

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
    public ProgrammingLanguageDTO getLanguageById(String id) {
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
    public ProgrammingLanguageDTO updateLanguage(String id, ProgrammingLanguageDTO dto) {
        ProgrammingLanguage existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Language not found"));

        existing.setJobCount(dto.getJobCount());
        existing.setPopularityScore(dto.getPopularityScore());

        return mapToDTO(repository.save(existing));
    }

    @Override
    public void deleteLanguage(String id) {
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

    @Override
    public GraphDataDTO getCoOccurrenceGraph() {
        List<GraphLinkDTO> links = repository.getLanguageCoOccurrences();

        Set<String> nodeIds = new HashSet<>();
        for (GraphLinkDTO link : links) {
            nodeIds.add(link.getSource());
            nodeIds.add(link.getTarget());
        }

        List<ProgrammingLanguage> langDetails = repository.findAllByNameIn(nodeIds);
        Map<String, ProgrammingLanguage> langMap = langDetails.stream()
                .collect(Collectors.toMap(ProgrammingLanguage::getName, Function.identity()));

        List<GraphNodeDTO> nodes = nodeIds.stream()
                .map(id -> {
                    ProgrammingLanguage lang = langMap.get(id);
                    Integer jobCount = (lang != null && lang.getJobCount() != null) ? lang.getJobCount() : 1;
                    return new GraphNodeDTO(id, jobCount, "default");
                })
                .collect(Collectors.toList());

        return new GraphDataDTO(nodes, links);
    }
}