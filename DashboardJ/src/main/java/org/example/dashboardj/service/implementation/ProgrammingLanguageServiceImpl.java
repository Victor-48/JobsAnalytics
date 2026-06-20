package org.example.dashboardj.service.implementation;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.*;
import org.example.dashboardj.entity.ProgrammingLanguage;
import org.example.dashboardj.repository.ProgrammingLanguageRepository;
import org.example.dashboardj.service.ProgrammingLanguageService;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
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
    public GraphDataDTO getSkillCoOccurrenceGraph(LocalDate startDate, LocalDate endDate) {
        String baseQuery = "MATCH (l1:ProgrammingLanguage)<-[:REQUIRES]-(j:JobPosting)-[:REQUIRES]->(l2:ProgrammingLanguage) ";
        String dateFilter = "WHERE j.postedDate >= $startDate AND j.postedDate <= $endDate ";
        String remainderQuery = "WITH l1, l2, j WHERE l1.name < l2.name RETURN l1.name as source, l2.name as target, count(j) as value ORDER BY value DESC LIMIT 50";

        String finalQuery;
        Neo4jClient.RunnableSpec querySpec;

        if (startDate != null && endDate != null) {
            finalQuery = baseQuery + dateFilter + remainderQuery;
            querySpec = neo4jClient.query(finalQuery).bind(startDate).to("startDate").bind(endDate).to("endDate");
        } else {
            finalQuery = baseQuery + remainderQuery;
            querySpec = neo4jClient.query(finalQuery);
        }

        Collection<Map<String, Object>> results = querySpec.fetch().all();

        List<GraphLinkDTO> links = new ArrayList<>();
        Set<String> nodeIds = new HashSet<>();

        for (Map<String, Object> row : results) {
            String source = (String) row.get("source");
            String target = (String) row.get("target");
            Long value = (Long) row.get("value");

            if (source != null && target != null && value != null) {
                links.add(new GraphLinkDTO(source, target, value));
                nodeIds.add(source);
                nodeIds.add(target);
            }
        }

        if (nodeIds.isEmpty()) {
            return new GraphDataDTO(new ArrayList<>(), new ArrayList<>());
        }

        List<SkillJobCountDTO> jobCounts = repository.findJobCountsByNames(nodeIds);
        Map<String, Integer> jobCountMap = jobCounts.stream()
            .collect(Collectors.toMap(
                SkillJobCountDTO::getName,
                SkillJobCountDTO::getJobCount,
                (existing, replacement) -> existing
            ));

        List<GraphNodeDTO> nodes = nodeIds.stream()
            .map(id -> {
                int jobCount = jobCountMap.getOrDefault(id, 1);
                return new GraphNodeDTO(id, jobCount, "default");
            })
            .collect(Collectors.toList());

        return new GraphDataDTO(nodes, links);
    }

    @Override
    public GraphDataDTO getSkillCoOccurrenceTrendsGraph(LocalDate referenceDate) {
        LocalDate currentPeriodEnd = referenceDate;
        LocalDate currentPeriodStart = referenceDate.minusDays(90);
        LocalDate previousPeriodStart = referenceDate.minusDays(180);

        List<GraphLinkTrendDTO> trendLinks = repository.findCoOccurrenceTrends(
            currentPeriodEnd, 
            currentPeriodStart, 
            previousPeriodStart
        );
        
        List<GraphLinkDTO> links = trendLinks.stream()
            .map(trend -> new GraphLinkDTO(trend.getSource(), trend.getTarget(), trend.getValue(), trend.getGrowth()))
            .collect(Collectors.toList());

        Set<String> nodeIds = new HashSet<>();
        links.forEach(link -> {
            nodeIds.add(link.getSource());
            nodeIds.add(link.getTarget());
        });

        if (nodeIds.isEmpty()) {
            return new GraphDataDTO(new ArrayList<>(), new ArrayList<>());
        }

        List<SkillJobCountDTO> jobCounts = repository.findJobCountsByNames(nodeIds);
        Map<String, Integer> jobCountMap = jobCounts.stream()
            .collect(Collectors.toMap(
                SkillJobCountDTO::getName,
                SkillJobCountDTO::getJobCount,
                (existing, replacement) -> existing
            ));

        List<GraphNodeDTO> nodes = nodeIds.stream()
            .map(id -> {
                int jobCount = jobCountMap.getOrDefault(id, 1);
                return new GraphNodeDTO(id, jobCount, "default");
            })
            .collect(Collectors.toList());

        return new GraphDataDTO(nodes, links);
    }
}