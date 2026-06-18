package org.example.dashboardj.entity;

import lombok.*;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node("ProgrammingLanguage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "jobPostings") // Exclude relationship field from toString
public class ProgrammingLanguage {

    @Id
    private String name;

    private Integer jobCount;
    private Double popularityScore;

    @Relationship(type = "REQUIRES", direction = Relationship.Direction.INCOMING)
    private List<JobPosting> jobPostings;
}