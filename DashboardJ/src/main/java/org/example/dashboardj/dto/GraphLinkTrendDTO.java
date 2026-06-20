package org.example.dashboardj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphLinkTrendDTO {
    private String source;
    private String target;
    private Long value; // Current period co-occurrence count
    private Double growth; // Growth percentage
}