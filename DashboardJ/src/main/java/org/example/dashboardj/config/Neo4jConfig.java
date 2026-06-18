package org.example.dashboardj.config;

import org.example.dashboardj.converter.reading.StringToLocalDateConverter;
import org.example.dashboardj.converter.writing.LocalDateToStringConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.core.convert.Neo4jConversions;

import java.util.Set;

@Configuration
public class Neo4jConfig {

    @Bean
    public Neo4jConversions neo4jConversions() {
        return new Neo4jConversions(Set.of(new LocalDateToStringConverter(), new StringToLocalDateConverter()));
    }
}