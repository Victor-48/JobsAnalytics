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
    List<CountResultDTO> findTopSkills();

    @Query("MATCH (s1:Skill)<-[:REQUIRES_SKILL]-(j:JobPosting)-[:REQUIRES_SKILL]->(s2:Skill) " +
           "WHERE elementId(s1) < elementId(s2) " +
           "RETURN s1.name as source, s2.name as target, count(j) as value " +
           "ORDER BY value DESC LIMIT 50")
    List<org.example.dashboardj.dto.GraphLinkDTO> getSkillCoOccurrence();

    @Query("MATCH (s1:Skill)<-[:REQUIRES_SKILL]-(j:JobPosting)-[:REQUIRES_SKILL]->(s2:Skill) " +
           "WHERE elementId(s1) < elementId(s2) " +
           "RETURN s1.name as source, s2.name as target, count(j) as value, 5.0 as growth " +
           "ORDER BY value DESC LIMIT 50")
    List<org.example.dashboardj.dto.GraphLinkTrendDTO> getSkillCoOccurrenceTrends();
}
