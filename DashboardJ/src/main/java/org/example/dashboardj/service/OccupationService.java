package org.example.dashboardj.service;

import org.example.dashboardj.dto.OccupationDetailDTO;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OccupationService {
    Page<OccupationDetailDTO> getAllOccupations(Pageable pageable);
    OccupationDetailDTO getOccupationByUri(String uri);
}
