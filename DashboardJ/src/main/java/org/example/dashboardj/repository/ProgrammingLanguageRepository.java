package org.example.dashboardj.repository;

import org.example.dashboardj.entity.ProgrammingLanguage;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgrammingLanguageRepository extends Neo4jRepository<ProgrammingLanguage, Long> {

    List<ProgrammingLanguage> findTop5ByOrderByJobCountDesc();

    List<ProgrammingLanguage> findByNameContainingIgnoreCase(String name);
}

