package org.example.dashboardj.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostingDTO {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String postedDate;
    private List<String> requiredLanguages;

    private Double salary;
    private String currency;
    private String experienceLevel;
    private String industry;
    private String naceCode; 
    private String remoteFlexibility;
    private String employmentType;
    private Integer satisfactionScore;
}