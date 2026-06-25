package org.example.dashboardj.service;

import org.example.dashboardj.dto.SectorDTO;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SectorService {
    Page<SectorDTO> getAllSectors(Pageable pageable);
    SectorDTO getSectorByUri(String uri);
}
