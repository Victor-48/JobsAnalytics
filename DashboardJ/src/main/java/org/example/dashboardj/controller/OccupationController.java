package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.OccupationDetailDTO;
import org.example.dashboardj.service.OccupationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/esco/occupations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OccupationController {

    private final OccupationService service;

    @GetMapping
    public ResponseEntity<Page<OccupationDetailDTO>> getAllOccupations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAllOccupations(PageRequest.of(page, size)));
    }

    @GetMapping("/{uri}")
    public ResponseEntity<OccupationDetailDTO> getOccupationByUri(@PathVariable String uri) {
        OccupationDetailDTO occupation = service.getOccupationByUri(uri);
        return occupation != null ? ResponseEntity.ok(occupation) : ResponseEntity.notFound().build();
    }
}
