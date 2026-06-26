package org.example.dashboardj.service.implementation;

import org.example.dashboardj.dto.SkillSummaryDTO;
import org.example.dashboardj.entity.Skill;
import org.example.dashboardj.repository.SkillRepository;
import org.example.dashboardj.service.SkillService;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;
import org.example.dashboardj.dto.CountResultDTO;

@Service
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final org.springframework.data.neo4j.core.Neo4jClient neo4jClient;

    public SkillServiceImpl(SkillRepository skillRepository, org.springframework.data.neo4j.core.Neo4jClient neo4jClient) {
        this.skillRepository = skillRepository;
        this.neo4jClient = neo4jClient;
    }

    @Override
    public Page<SkillSummaryDTO> getAllSkills(Pageable pageable) {
        return skillRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public SkillSummaryDTO getSkillByUri(String uri) {
        return skillRepository.findById(uri)
                .map(this::mapToDTO)
                .orElse(null);
    }

    private SkillSummaryDTO mapToDTO(Skill skill) {
        return new SkillSummaryDTO(skill.getName(), skill.getConceptUri(), skill.getDynamicLabels());
    }

    @Override
    public List<java.util.Map<String, Object>> getTopSkills() {
        return new java.util.ArrayList<>(neo4jClient.query("MATCH (s:Skill)<-[:REQUIRES_SKILL]-(j:JobPosting) " +
               "RETURN s.name as name, count(j) as count " +
               "ORDER BY count DESC LIMIT 10")
            .fetch().all());
    }

    @Override
    public org.example.dashboardj.dto.GraphDataDTO getSkillCoOccurrence() {
        List<org.example.dashboardj.dto.GraphLinkDTO> links = skillRepository.getSkillCoOccurrence();
        return buildGraphData(links);
    }

    @Override
    public org.example.dashboardj.dto.GraphDataDTO getSkillCoOccurrenceTrends() {
        List<org.example.dashboardj.dto.GraphLinkTrendDTO> trendLinks = skillRepository.getSkillCoOccurrenceTrends();
        List<org.example.dashboardj.dto.GraphLinkDTO> links = trendLinks.stream()
            .map(t -> new org.example.dashboardj.dto.GraphLinkDTO(t.getSource(), t.getTarget(), t.getValue() != null ? t.getValue() : 0L, t.getGrowth()))
            .collect(Collectors.toList());
        return buildGraphData(links);
    }

    private org.example.dashboardj.dto.GraphDataDTO buildGraphData(List<org.example.dashboardj.dto.GraphLinkDTO> links) {
        java.util.Set<String> nodeNames = new java.util.HashSet<>();
        for (org.example.dashboardj.dto.GraphLinkDTO link : links) {
            nodeNames.add(link.getSource());
            nodeNames.add(link.getTarget());
        }
        List<org.example.dashboardj.dto.GraphNodeDTO> nodes = nodeNames.stream()
            .map(name -> new org.example.dashboardj.dto.GraphNodeDTO(name, 1, "Skill"))
            .collect(Collectors.toList());
        return new org.example.dashboardj.dto.GraphDataDTO(nodes, links);
    }
}
