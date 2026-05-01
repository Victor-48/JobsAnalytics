package org.example.dashboardj.repository;

import org.example.dashboardj.entity.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends Neo4jRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}