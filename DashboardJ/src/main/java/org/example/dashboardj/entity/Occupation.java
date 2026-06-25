package org.example.dashboardj.entity;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Node("Occupation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Occupation {
    
    @Id
    private String conceptUri;

    private String name;

    @Relationship(type = "WORKS_IN_SECTOR", direction = Relationship.Direction.OUTGOING)
    private List<Sector> sectors;

    @Relationship(type = "PART_OF_ISCO", direction = Relationship.Direction.OUTGOING)
    private ISCOGroup iscoGroup;

    @Relationship(type = "REQUIRES_SKILL", direction = Relationship.Direction.OUTGOING)
    private List<OccupationSkillRelationship> skills;

}
