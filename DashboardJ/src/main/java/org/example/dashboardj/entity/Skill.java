package org.example.dashboardj.entity;

import org.springframework.data.neo4j.core.schema.DynamicLabels;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Node("Skill")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Skill {
    
    @Id
    private String conceptUri;

    @org.springframework.data.neo4j.core.schema.Property("preferredLabel")
    private String name;

    private String skillType;

    @DynamicLabels
    private Set<String> dynamicLabels;

    @Relationship(type = "BROADER_SKILL", direction = Relationship.Direction.OUTGOING)
    private SkillGroup broaderGroup;

    @Relationship(type = "RELATED_TO_SKILL", direction = Relationship.Direction.OUTGOING)
    private List<Skill> relatedSkills;

}
