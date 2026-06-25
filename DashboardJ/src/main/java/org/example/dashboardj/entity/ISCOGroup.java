package org.example.dashboardj.entity;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Node("ISCOGroup")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ISCOGroup {
    
    @Id
    private String conceptUri;

    private String name;
}
