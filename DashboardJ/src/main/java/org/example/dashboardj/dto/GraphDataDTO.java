package org.example.dashboardj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphDataDTO {
    private List<GraphNodeDTO> nodes;
    private List<GraphLinkDTO> links;
}