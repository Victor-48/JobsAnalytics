package org.example.dashboardj.service.implementation;

import org.example.dashboardj.dto.SectorDTO;
import org.example.dashboardj.entity.Sector;
import org.example.dashboardj.repository.SectorRepository;
import org.example.dashboardj.service.SectorService;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;

@Service
public class SectorServiceImpl implements SectorService {

    private final SectorRepository sectorRepository;

    public SectorServiceImpl(SectorRepository sectorRepository) {
        this.sectorRepository = sectorRepository;
    }

    @Override
    public Page<SectorDTO> getAllSectors(Pageable pageable) {
        return sectorRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public SectorDTO getSectorByUri(String uri) {
        return sectorRepository.findById(uri)
                .map(this::mapToDTO)
                .orElse(null);
    }

    private SectorDTO mapToDTO(Sector sector) {
        return new SectorDTO(sector.getConceptUri(), sector.getName());
    }
}
