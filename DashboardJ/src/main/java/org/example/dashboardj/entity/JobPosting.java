package org.example.dashboardj.entity;

import lombok.*;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node("JobPosting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosting {
    @Id @GeneratedValue
    private Long id;

    private String title;
    private String company;
    private String location;
    private String postedDate;

    private Double salary;
    private String currency;
    private String experienceLevel;
    private String industry; 
    private String naceCode; 
    private String remoteFlexibility;
    private String employmentType;
    private Integer satisfactionScore;

    @Relationship(type = "REQUIRES", direction = Relationship.Direction.OUTGOING)
    private List<ProgrammingLanguage> requiredLanguages;
}