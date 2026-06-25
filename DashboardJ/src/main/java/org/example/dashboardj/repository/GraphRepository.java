package org.example.dashboardj.repository;

import org.example.dashboardj.dto.LanguageStatDTO;
import org.example.dashboardj.entity.JobPosting;
import org.neo4j.driver.*;
import org.neo4j.driver.Record;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class GraphRepository {

    private final Driver driver;

    public GraphRepository(Driver driver) {
        this.driver = driver;
    }

    public void saveJob(JobPosting jobPosting) {
        try (Session session = driver.session()) {
            session.executeWrite(tx -> {
                String cypher = """
                    MERGE (c:Company {name: $company})
                    MERGE (j:Job {id: $id})
                    SET j.title = $title,
                        j.postedDate = $postedDate,
                        j.source = $source
                    MERGE (c)-[:POSTED]->(j)
                    WITH j
                    UNWIND $languages AS lang
                        MERGE (l:Language {name: lang})
                        MERGE (j)-[:USES]->(l)
                    """;
                tx.run(cypher, Values.parameters(
                        "id", jobPosting.getId(),
                        "title", jobPosting.getTitle(),
                        "company", jobPosting.getCompany(),
                        "postedDate", jobPosting.getPostedDate() != null ? jobPosting.getPostedDate().toString() : null
                ));
                return null;
            });
        }
    }

    public List<LanguageStatDTO> getTopLanguages(int limit) {
        try (Session session = driver.session()) {
            return session.executeRead(tx -> {
                String q = """
                    MATCH (l:Language)<-[:USES]-(j:Job)
                    RETURN l.name AS language, count(j) AS jobs
                    ORDER BY jobs DESC
                    LIMIT $limit
                    """;
                Result result = tx.run(q, Values.parameters("limit", limit));
                List<LanguageStatDTO> list = new ArrayList<>();
                while (result.hasNext()) {
                    Record r = result.next();
                    list.add(new LanguageStatDTO(r.get("language").asString(), r.get("jobs").asLong()));
                }
                return list;
            });
        }
    }
}

