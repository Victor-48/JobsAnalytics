package org.example.dashboardj.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostingDTO {
    private String id;
    private String title;
    private String company;
    private String location;
    private String description;
    private Double latitude;
    private Double longitude;
    private String city;
    private String country;
    private String postedDate;

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