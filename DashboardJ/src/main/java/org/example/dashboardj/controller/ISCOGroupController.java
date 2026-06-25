package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.ISCOGroupDTO;
import org.example.dashboardj.service.ISCOGroupService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/esco/isco-groups")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ISCOGroupController {

    private final ISCOGroupService service;

    @GetMapping
    public ResponseEntity<Page<ISCOGroupDTO>> getAllISCOGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAllISCOGroups(PageRequest.of(page, size)));
    }

    @GetMapping("/{uri}")
    public ResponseEntity<ISCOGroupDTO> getISCOGroupByUri(@PathVariable String uri) {
        ISCOGroupDTO iscoGroup = service.getISCOGroupByUri(uri);
        return iscoGroup != null ? ResponseEntity.ok(iscoGroup) : ResponseEntity.notFound().build();
    }
}
