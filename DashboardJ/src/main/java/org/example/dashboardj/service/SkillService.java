package org.example.dashboardj.service;

import org.example.dashboardj.dto.SkillSummaryDTO;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.example.dashboardj.dto.CountResultDTO;

public interface SkillService {
    Page<SkillSummaryDTO> getAllSkills(Pageable pageable);
    SkillSummaryDTO getSkillByUri(String uri);
    List<CountResultDTO> getTopSkills();
}
