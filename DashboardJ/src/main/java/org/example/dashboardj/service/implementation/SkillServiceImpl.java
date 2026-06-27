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
        return skillRepository.findAllBasic(pageable)
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
               "RETURN s.preferredLabel as name, count(j) as count " +
               "ORDER BY count DESC LIMIT 10")
            .fetch().all());
    }

    @Override
    public org.example.dashboardj.dto.GraphDataDTO getSkillCoOccurrence(String startDate, String endDate) {
        String queryStr = "MATCH (s1:Skill)<-[:REQUIRES_SKILL]-(j:JobPosting)-[:REQUIRES_SKILL]->(s2:Skill) " +
            "WHERE elementId(s1) < elementId(s2) ";
            
        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            queryStr += "AND j.postedDate >= date($startDate) AND j.postedDate <= date($endDate) ";
        }
        
        queryStr += "RETURN s1.preferredLabel as source, s2.preferredLabel as target, count(j) as value " +
            "ORDER BY value DESC LIMIT 50";
            
        var queryObj = neo4jClient.query(queryStr);
        java.util.Collection<java.util.Map<String, Object>> results;
        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            results = queryObj.bind(startDate).to("startDate").bind(endDate).to("endDate").fetch().all();
        } else {
            results = queryObj.fetch().all();
        }
        
        List<org.example.dashboardj.dto.GraphLinkDTO> links = results.stream().map(row -> 
            new org.example.dashboardj.dto.GraphLinkDTO(
                (String) row.get("source"),
                (String) row.get("target"),
                ((Number) row.get("value")).longValue(),
                0.0
            )
        ).collect(Collectors.toList());

        return buildGraphData(links);
    }

    @Override
    public org.example.dashboardj.dto.GraphDataDTO getSkillCoOccurrenceTrends(String referenceDate) {
        String refDateStr = (referenceDate != null && !referenceDate.isEmpty()) ? "date($refDate)" : "date()";
        
        String queryStr = "MATCH (s1:Skill)<-[:REQUIRES_SKILL]-(j:JobPosting)-[:REQUIRES_SKILL]->(s2:Skill) " +
            "WHERE elementId(s1) < elementId(s2) " +
            "WITH s1, s2, count(j) as value, " +
            "sum(case when j.postedDate >= " + refDateStr + " - duration('P30D') AND j.postedDate <= " + refDateStr + " then 1 else 0 end) as recentCount, " +
            "sum(case when j.postedDate < " + refDateStr + " - duration('P30D') AND j.postedDate >= " + refDateStr + " - duration('P60D') then 1 else 0 end) as pastCount " +
            "RETURN s1.preferredLabel as source, s2.preferredLabel as target, value, " +
            "case when pastCount > 0 then ((toFloat(recentCount) - toFloat(pastCount)) / toFloat(pastCount)) * 100 else 100.0 end as growth " +
            "ORDER BY value DESC LIMIT 50";

        var queryObj = neo4jClient.query(queryStr);
        java.util.Collection<java.util.Map<String, Object>> results;
        if (referenceDate != null && !referenceDate.isEmpty()) {
            results = queryObj.bind(referenceDate).to("refDate").fetch().all();
        } else {
            results = queryObj.fetch().all();
        }
        
        List<org.example.dashboardj.dto.GraphLinkDTO> links = results.stream().map(row -> 
            new org.example.dashboardj.dto.GraphLinkDTO(
                (String) row.get("source"),
                (String) row.get("target"),
                ((Number) row.get("value")).longValue(),
                ((Number) row.get("growth")).doubleValue()
            )
        ).collect(Collectors.toList());

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
