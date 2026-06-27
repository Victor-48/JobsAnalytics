package org.example.dashboardj.entity;

import lombok.*;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import org.springframework.data.neo4j.core.support.UUIDStringGenerator;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Node("JobPosting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"requiredSkills", "sector", "occupation", "locationNode"})
public class JobPosting {
    @Id
    @GeneratedValue(UUIDStringGenerator.class)
    private String id;

    private String title;
    private String company;
    private String location;
    private String description;

    @Relationship(type = "LOCATED_IN", direction = Relationship.Direction.OUTGOING)
    private Location locationNode;

    private LocalDate postedDate;

    private Double salary;
    private String currency;
    private String experienceLevel;
    
    @Relationship(type = "BELONGS_TO_SECTOR", direction = Relationship.Direction.OUTGOING)
    private Sector sector;
    private String remoteFlexibility;
    private String employmentType;
    private Integer satisfactionScore;

    @Relationship(type = "REQUIRES_SKILL", direction = Relationship.Direction.OUTGOING)
    private List<Skill> requiredSkills = new ArrayList<>();

    @Relationship(type = "IS_OCCUPATION", direction = Relationship.Direction.OUTGOING)
    private Occupation occupation;

    private String createdByUserId;
}