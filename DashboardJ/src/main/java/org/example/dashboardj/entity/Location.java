package org.example.dashboardj.entity;

import lombok.*;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("Location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Location {
    @Id
    private String name;

    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
}
