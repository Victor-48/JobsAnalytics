package org.example.dashboardj.service.implementation;

import org.example.dashboardj.dto.ISCOGroupDTO;
import org.example.dashboardj.dto.OccupationDetailDTO;
import org.example.dashboardj.dto.SectorDTO;
import org.example.dashboardj.dto.SkillSummaryDTO;
import org.example.dashboardj.entity.Occupation;
import org.example.dashboardj.entity.OccupationSkillRelationship;
import org.example.dashboardj.entity.Sector;
import org.example.dashboardj.entity.Skill;
import org.example.dashboardj.repository.OccupationRepository;
import org.example.dashboardj.service.OccupationService;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class OccupationServiceImpl implements OccupationService {

    private final OccupationRepository occupationRepository;

    public OccupationServiceImpl(OccupationRepository occupationRepository) {
        this.occupationRepository = occupationRepository;
    }

    @Override
    public Page<OccupationDetailDTO> getAllOccupations(Pageable pageable) {
        return occupationRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public OccupationDetailDTO getOccupationByUri(String uri) {
        return occupationRepository.findById(uri)
                .map(this::mapToDTO)
                .orElse(null);
    }

    private OccupationDetailDTO mapToDTO(Occupation occupation) {
        OccupationDetailDTO dto = new OccupationDetailDTO();
        dto.setConceptUri(occupation.getConceptUri());
        dto.setName(occupation.getName());

        // Map Sectors
        if (occupation.getSectors() != null) {
            List<SectorDTO> sectorDTOs = occupation.getSectors().stream()
                    .map(s -> new SectorDTO(s.getConceptUri(), s.getName()))
                    .collect(Collectors.toList());
            dto.setSectors(sectorDTOs);
        } else {
            dto.setSectors(new ArrayList<>());
        }

        // Map ISCOGroup
        if (occupation.getIscoGroup() != null) {
            dto.setIscoGroup(new ISCOGroupDTO(occupation.getIscoGroup().getConceptUri(), occupation.getIscoGroup().getName()));
        }

        // Map Skills
        if (occupation.getSkills() != null) {
            List<SkillSummaryDTO> skillDTOs = occupation.getSkills().stream()
                    .map(OccupationSkillRelationship::getSkill)
                    .map(s -> new SkillSummaryDTO(s.getName(), s.getConceptUri(), s.getDynamicLabels()))
                    .collect(Collectors.toList());
            dto.setSkills(skillDTOs);
        } else {
            dto.setSkills(new ArrayList<>());
        }

        return dto;
    }
}
