package org.example.dashboardj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphLinkDTO {
    private String source; // ID of the source node
    private String target; // ID of the target node
    private Long value;     // Strength of the link (co-occurrence count)
}