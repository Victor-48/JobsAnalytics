package org.example.dashboardj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmergingTechDTO {
    private String skillName;
    private Double etiScore;
    private Long volume;
    private Double growth;
    private Long industrySpread;
}
