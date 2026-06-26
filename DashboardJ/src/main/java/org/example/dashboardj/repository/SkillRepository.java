package org.example.dashboardj.repository;

import org.example.dashboardj.dto.CountResultDTO;
import org.example.dashboardj.entity.Skill;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends Neo4jRepository<Skill, String> {
    
    @Query("MATCH (s:Skill)<-[:REQUIRES_SKILL]-(j:JobPosting) " +
           "RETURN s.name as name, count(j) as count " +
           "ORDER BY count DESC LIMIT 10")
    List<java.util.Map<String, Object>> findTopSkills();

    @Query("MATCH (s1:Skill)<-[:REQUIRES_SKILL]-(j:JobPosting)-[:REQUIRES_SKILL]->(s2:Skill) " +
           "WHERE elementId(s1) < elementId(s2) " +
           "RETURN s1.name as source, s2.name as target, count(j) as value " +
           "ORDER BY value DESC LIMIT 50")
    List<org.example.dashboardj.dto.GraphLinkDTO> getSkillCoOccurrence();

    @Query("MATCH (s1:Skill)<-[:REQUIRES_SKILL]-(j:JobPosting)-[:REQUIRES_SKILL]->(s2:Skill) " +
           "WHERE elementId(s1) < elementId(s2) " +
           "WITH s1, s2, count(j) as value, " +
           "sum(case when j.postedDate >= date() - duration('P30D') then 1 else 0 end) as recentCount, " +
           "sum(case when j.postedDate < date() - duration('P30D') AND j.postedDate >= date() - duration('P60D') then 1 else 0 end) as pastCount " +
           "RETURN s1.name as source, s2.name as target, value, " +
           "case when pastCount > 0 then ((toFloat(recentCount) - toFloat(pastCount)) / toFloat(pastCount)) * 100 else 100.0 end as growth " +
           "ORDER BY value DESC LIMIT 50")
    List<org.example.dashboardj.dto.GraphLinkTrendDTO> getSkillCoOccurrenceTrends();
}
