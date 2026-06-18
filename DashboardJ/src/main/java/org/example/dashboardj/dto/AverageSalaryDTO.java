package org.example.dashboardj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AverageSalaryDTO {
    private String name;
    private Double value;
}