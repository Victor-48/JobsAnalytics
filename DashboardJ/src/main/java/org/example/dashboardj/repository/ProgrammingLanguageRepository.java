package org.example.dashboardj.repository;

import org.example.dashboardj.entity.ProgrammingLanguage;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgrammingLanguageRepository extends Neo4jRepository<ProgrammingLanguage, Long> {

    // Find by name (case-insensitive)
    Optional<ProgrammingLanguage> findByName(String name);

    @Query("MATCH (j:JobPosting)-[:REQUIRES]->(l:ProgrammingLanguage) " +
           "WITH l, count(j) as computedJobCount " +
           "RETURN id(l) as id, l.name as name, computedJobCount as jobCount, 0.0 as popularityScore " +
           "ORDER BY jobCount DESC LIMIT 5")
    List<ProgrammingLanguage> findTop5ByOrderByJobCountDesc();

    List<ProgrammingLanguage> findByNameContainingIgnoreCase(String name);
}