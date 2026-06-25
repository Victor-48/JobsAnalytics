package org.example.dashboardj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OccupationDetailDTO {
    private String conceptUri;
    private String name;
    
    // Flattened simple DTOs to avoid deep nesting
    private List<SectorDTO> sectors;
    private ISCOGroupDTO iscoGroup;
    private List<SkillSummaryDTO> skills; 
}
