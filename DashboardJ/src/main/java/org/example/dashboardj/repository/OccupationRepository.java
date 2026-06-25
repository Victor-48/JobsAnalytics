package org.example.dashboardj.repository;

import org.example.dashboardj.entity.Occupation;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OccupationRepository extends Neo4jRepository<Occupation, String> {
}
