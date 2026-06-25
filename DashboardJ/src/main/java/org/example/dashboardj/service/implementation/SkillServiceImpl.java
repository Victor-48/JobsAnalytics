package org.example.dashboardj.service.implementation;

import org.example.dashboardj.dto.SkillSummaryDTO;
import org.example.dashboardj.entity.Skill;
import org.example.dashboardj.repository.SkillRepository;
import org.example.dashboardj.service.SkillService;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;
import org.example.dashboardj.dto.CountResultDTO;

@Service
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;

    public SkillServiceImpl(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Override
    public Page<SkillSummaryDTO> getAllSkills(Pageable pageable) {
        return skillRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public SkillSummaryDTO getSkillByUri(String uri) {
        return skillRepository.findById(uri)
                .map(this::mapToDTO)
                .orElse(null);
    }

    private SkillSummaryDTO mapToDTO(Skill skill) {
        return new SkillSummaryDTO(skill.getName(), skill.getConceptUri(), skill.getDynamicLabels());
    }

    @Override
    public List<CountResultDTO> getTopSkills() {
        return skillRepository.findTopSkills();
    }
}
