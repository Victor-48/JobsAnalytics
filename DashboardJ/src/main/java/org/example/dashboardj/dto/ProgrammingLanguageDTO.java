package org.example.dashboardj.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgrammingLanguageDTO {
    private String name;
    private Integer jobCount;
    private Double popularityScore;
}
