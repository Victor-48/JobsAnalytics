package org.example.dashboardj.entity;

import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@RelationshipProperties
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OccupationSkillRelationship {

    @RelationshipId
    private Long id;

    private String relationType; // "essential" or "optional"

    @TargetNode
    private Skill skill;

}
