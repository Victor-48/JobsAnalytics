package org.example.dashboardj.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostingDTO {
    private String id;
    
    @NotBlank(message = "Title is mandatory")
    private String title;
    
    @NotBlank(message = "Company is mandatory")
    private String company;
    
    @NotBlank(message = "Location is mandatory")
    private String location;
    private String description;
    private Double latitude;
    private Double longitude;
    private String city;
    private String country;
    private String postedDate;
    private String url;

    private Double salary;
    private String currency;
    private String experienceLevel;
    private String remoteFlexibility;
    private String employmentType;

    // ESCO-NACE Input fields (for creating/updating)
    private String sectorUri;
    private String occupationUri;
    private List<String> requiredSkillUris;

    // ESCO-NACE Output objects (for reading)
    private SectorDTO sector;
    private OccupationDetailDTO occupation;
    private List<SkillSummaryDTO> requiredSkills;
}