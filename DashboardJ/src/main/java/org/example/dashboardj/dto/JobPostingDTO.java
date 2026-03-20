package org.example.dashboardj.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostingDTO {
    private String title;
    private String company;
    private String location;
    private String postedDate;
    private List<String> requiredLanguages;
}
