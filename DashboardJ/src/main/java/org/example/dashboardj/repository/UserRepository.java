package org.example.dashboardj.repository;

import org.example.dashboardj.entity.User;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.neo4j.repository.query.Query;

@Repository
public interface UserRepository extends Neo4jRepository<User, String> {
    @Query("MATCH (u:User) WHERE u.email = $email RETURN u")
    Optional<User> findByEmail(String email);
    
    @Query("MATCH (u:User) WHERE u.email = $email RETURN count(u) > 0")
    boolean existsByEmail(String email);
}