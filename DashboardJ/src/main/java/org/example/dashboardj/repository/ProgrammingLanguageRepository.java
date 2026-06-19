package org.example.dashboardj.repository;

import org.example.dashboardj.dto.SkillGrowthDTO;
import org.example.dashboardj.dto.SkillJobCountDTO;
import org.example.dashboardj.entity.ProgrammingLanguage;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgrammingLanguageRepository extends Neo4jRepository<ProgrammingLanguage, String> {

    Optional<ProgrammingLanguage> findByName(String name);

    List<ProgrammingLanguage> findAllByNameIn(Collection<String> names);

    @Query("MATCH (l:ProgrammingLanguage) WHERE l.name IN $names RETURN l.name as name, l.jobCount as jobCount")
    List<SkillJobCountDTO> findJobCountsByNames(@Param("names") Collection<String> names);

    @Query("MATCH (j:JobPosting)-[:REQUIRES]->(l:ProgrammingLanguage) " +
           "WITH l, count(j) as computedJobCount " +
           "RETURN l.name as name, computedJobCount as jobCount, l.popularityScore as popularityScore " +
           "ORDER BY jobCount DESC LIMIT 5")
    List<ProgrammingLanguage> findTop5ByOrderByJobCountDesc();

    List<ProgrammingLanguage> findByNameContainingIgnoreCase(String name);

    @Query("MATCH (l:ProgrammingLanguage)<-[:REQUIRES]-(j:JobPosting) " +
           "WHERE j.postedDate >= $previousPeriodStart AND j.postedDate < $currentPeriodEnd " +
           "WITH l, " +
           "     sum(CASE WHEN j.postedDate >= $currentPeriodStart THEN 1 ELSE 0 END) as currentCount, " +
           "     sum(CASE WHEN j.postedDate < $currentPeriodStart THEN 1 ELSE 0 END) as previousCount " +
           "WHERE previousCount > 0 " +
           "WITH l, currentCount, previousCount, " +
           "     (toFloat(currentCount - previousCount) / previousCount) * 100.0 as growth " +
           "RETURN l.name as skillName, growth as growthPercentage " +
           "ORDER BY growth DESC LIMIT 1")
    Optional<SkillGrowthDTO> findFastestGrowingSkill(
        @Param("currentPeriodEnd") LocalDate currentPeriodEnd,
        @Param("currentPeriodStart") LocalDate currentPeriodStart,
        @Param("previousPeriodStart") LocalDate previousPeriodStart
    );
}