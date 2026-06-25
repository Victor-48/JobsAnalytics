package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.SkillSummaryDTO;
import org.example.dashboardj.service.SkillService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.dashboardj.dto.CountResultDTO;
import java.util.List;

@RestController
@RequestMapping("/api/esco/skills")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SkillController {

    private final SkillService service;

    @GetMapping
    public ResponseEntity<Page<SkillSummaryDTO>> getAllSkills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAllSkills(PageRequest.of(page, size)));
    }

    @GetMapping("/{uri}")
    public ResponseEntity<SkillSummaryDTO> getSkillByUri(@PathVariable String uri) {
        SkillSummaryDTO skill = service.getSkillByUri(uri);
        return skill != null ? ResponseEntity.ok(skill) : ResponseEntity.notFound().build();
    }

    @GetMapping("/top")
    public ResponseEntity<List<CountResultDTO>> getTopSkills() {
        return ResponseEntity.ok(service.getTopSkills());
    }

    @GetMapping("/co-occurrence")
    public ResponseEntity<org.example.dashboardj.dto.GraphDataDTO> getSkillCoOccurrence(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(service.getSkillCoOccurrence());
    }

    @GetMapping("/co-occurrence-trends")
    public ResponseEntity<org.example.dashboardj.dto.GraphDataDTO> getSkillCoOccurrenceTrends(
            @RequestParam(required = false) String referenceDate) {
        return ResponseEntity.ok(service.getSkillCoOccurrenceTrends());
    }
}
