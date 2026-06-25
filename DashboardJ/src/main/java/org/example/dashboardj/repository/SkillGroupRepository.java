package org.example.dashboardj.repository;

import org.example.dashboardj.entity.SkillGroup;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillGroupRepository extends Neo4jRepository<SkillGroup, String> {
}
