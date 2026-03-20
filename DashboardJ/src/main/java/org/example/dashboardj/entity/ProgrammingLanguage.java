package org.example.dashboardj.entity;

import lombok.*;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node("ProgrammingLanguage")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgrammingLanguage {

    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private Integer jobCount;
    private Double popularityScore;

    @Relationship(type = "REQUIRES", direction = Relationship.Direction.INCOMING)
    private List<JobPosting> jobPostings;
}
