package org.example.dashboardj.entity;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Node("SkillGroup")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillGroup {
    
    @Id
    private String conceptUri;

    private String name;
}
