package org.example.dashboardj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillSummaryDTO {
    private String name;
    private String uri;
    private Set<String> theme; // Mapped from dynamicLabels (e.g. Digital, Green)
}
