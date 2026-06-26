package org.example.dashboardj.repository;

import org.example.dashboardj.entity.Location;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends Neo4jRepository<Location, String> {
}
