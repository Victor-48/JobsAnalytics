package org.example.dashboardj.repository;

import org.example.dashboardj.entity.JobPosting;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.neo4j.DataNeo4jTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.Neo4jContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@DataNeo4jTest
public class JobPostingRepositoryTest {

    @Container
    static Neo4jContainer<?> neo4jContainer = new Neo4jContainer<>("neo4j:5.12")
            .withoutAuthentication();

    @DynamicPropertySource
    static void neo4jProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.neo4j.uri", neo4jContainer::getBoltUrl);
        registry.add("spring.neo4j.authentication.username", () -> "neo4j");
        registry.add("spring.neo4j.authentication.password", () -> "");
    }

    @BeforeAll
    static void startNeo4j() {
        neo4jContainer.start();
    }

    @AfterAll
    static void stopNeo4j() {
        neo4jContainer.stop();
    }

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Test
    void shouldSaveAndFindJobPosting() {
        JobPosting job = new JobPosting();
        job.setTitle("Test Engineer");
        job.setCompany("TestCorp");

        JobPosting savedJob = jobPostingRepository.save(job);

        Optional<JobPosting> retrievedJob = jobPostingRepository.findById(savedJob.getId());

        assertThat(retrievedJob).isPresent();
        assertThat(retrievedJob.get().getTitle()).isEqualTo("Test Engineer");
    }
}
