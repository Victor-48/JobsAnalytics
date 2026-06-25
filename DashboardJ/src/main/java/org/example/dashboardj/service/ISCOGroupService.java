package org.example.dashboardj.service;

import org.example.dashboardj.dto.ISCOGroupDTO;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ISCOGroupService {
    Page<ISCOGroupDTO> getAllISCOGroups(Pageable pageable);
    ISCOGroupDTO getISCOGroupByUri(String uri);
}
