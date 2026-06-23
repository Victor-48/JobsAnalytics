package org.example.dashboardj.config;

import lombok.extern.slf4j.Slf4j;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Config;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@Slf4j
public class GraphConfig {

    @Value("${graph.uri}")
    private String uri;

    @Value("${graph.username}")
    private String username;

    @Value("${graph.password:}")
    private String password;

    @Bean
    public Driver driver() {
        Config config = Config.builder()
                .withMaxConnectionLifetime(30, TimeUnit.MINUTES)
                .withMaxConnectionPoolSize(50)
                .withConnectionAcquisitionTimeout(2, TimeUnit.MINUTES)
                .build();

        Driver driver;

        if (password == null || password.isBlank()) {
            log.info("Initializing Neo4j driver without authentication (URI: {})", uri);
            driver = GraphDatabase.driver(uri,config);
        } else {
            log.info("Initializing Neo4j driver with authentication (URI: {}, User: {})", uri, username);
            driver = GraphDatabase.driver(uri, AuthTokens.basic(username, password), config);
        }

        return driver;
    }
}
