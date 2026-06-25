package org.example.dashboardj.service;

import org.example.dashboardj.dto.SkillGroupDTO;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SkillGroupService {
    Page<SkillGroupDTO> getAllSkillGroups(Pageable pageable);
    SkillGroupDTO getSkillGroupByUri(String uri);
}
