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
    private long value;     // Strength of the link (co-occurrence count)
    private Double growth;  // Optional growth percentage for trend detection

    // Constructor for backwards compatibility
    public GraphLinkDTO(String source, String target, long value) {
        this.source = source;
        this.target = target;
        this.value = value;
        this.growth = null;
    }
}