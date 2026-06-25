package org.example.dashboardj.repository;

import org.example.dashboardj.entity.Sector;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SectorRepository extends Neo4jRepository<Sector, String> {
}
