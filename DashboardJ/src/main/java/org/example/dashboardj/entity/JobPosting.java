package org.example.dashboardj.entity;

import lombok.*;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import org.springframework.data.neo4j.core.support.UUIDStringGenerator;

import java.time.LocalDate;
import java.util.List;

@Node("JobPosting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "requiredLanguages") // Exclude relationship field from toString
public class JobPosting {
    @Id
    @GeneratedValue(UUIDStringGenerator.class)
    private String id;

    private String title;
    private String company;
    private String location;

    private LocalDate postedDate;

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