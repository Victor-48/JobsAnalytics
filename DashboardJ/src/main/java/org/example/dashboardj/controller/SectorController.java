package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.SectorDTO;
import org.example.dashboardj.service.SectorService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/esco/sectors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SectorController {

    private final SectorService service;

    @GetMapping
    public ResponseEntity<Page<SectorDTO>> getAllSectors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAllSectors(PageRequest.of(page, size)));
    }

    @GetMapping("/{uri}")
    public ResponseEntity<SectorDTO> getSectorByUri(@PathVariable String uri) {
        SectorDTO sector = service.getSectorByUri(uri);
        return sector != null ? ResponseEntity.ok(sector) : ResponseEntity.notFound().build();
    }
}
