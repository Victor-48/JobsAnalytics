package org.example.dashboardj.service.implementation;

import org.example.dashboardj.dto.SkillGroupDTO;
import org.example.dashboardj.entity.SkillGroup;
import org.example.dashboardj.repository.SkillGroupRepository;
import org.example.dashboardj.service.SkillGroupService;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;

@Service
public class SkillGroupServiceImpl implements SkillGroupService {

    private final SkillGroupRepository skillGroupRepository;

    public SkillGroupServiceImpl(SkillGroupRepository skillGroupRepository) {
        this.skillGroupRepository = skillGroupRepository;
    }

    @Override
    public Page<SkillGroupDTO> getAllSkillGroups(Pageable pageable) {
        return skillGroupRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public SkillGroupDTO getSkillGroupByUri(String uri) {
        return skillGroupRepository.findById(uri)
                .map(this::mapToDTO)
                .orElse(null);
    }

    private SkillGroupDTO mapToDTO(SkillGroup skillGroup) {
        return new SkillGroupDTO(skillGroup.getConceptUri(), skillGroup.getName());
    }
}
