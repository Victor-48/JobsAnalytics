package org.example.dashboardj.service.implementation;

import org.example.dashboardj.dto.ISCOGroupDTO;
import org.example.dashboardj.entity.ISCOGroup;
import org.example.dashboardj.repository.ISCOGroupRepository;
import org.example.dashboardj.service.ISCOGroupService;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;

@Service
public class ISCOGroupServiceImpl implements ISCOGroupService {

    private final ISCOGroupRepository iscoGroupRepository;

    public ISCOGroupServiceImpl(ISCOGroupRepository iscoGroupRepository) {
        this.iscoGroupRepository = iscoGroupRepository;
    }

    @Override
    public Page<ISCOGroupDTO> getAllISCOGroups(Pageable pageable) {
        return iscoGroupRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public ISCOGroupDTO getISCOGroupByUri(String uri) {
        return iscoGroupRepository.findById(uri)
                .map(this::mapToDTO)
                .orElse(null);
    }

    private ISCOGroupDTO mapToDTO(ISCOGroup iscoGroup) {
        return new ISCOGroupDTO(iscoGroup.getConceptUri(), iscoGroup.getName());
    }
}
