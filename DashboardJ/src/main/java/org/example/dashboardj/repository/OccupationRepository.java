package org.example.dashboardj.repository;

import org.example.dashboardj.entity.Occupation;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OccupationRepository extends Neo4jRepository<Occupation, String> {
    @org.springframework.data.neo4j.repository.query.Query(
        value = "MATCH (n:Occupation) RETURN n SKIP $skip LIMIT $limit",
        countQuery = "MATCH (n:Occupation) RETURN count(n)"
    )
    org.springframework.data.domain.Page<Occupation> findAllBasic(org.springframework.data.domain.Pageable pageable);
}
