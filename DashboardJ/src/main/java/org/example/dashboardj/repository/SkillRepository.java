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
}
