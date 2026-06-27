package org.example.dashboardj.elasticsearch.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.elasticsearch.entity.SearchOccupation;
import org.example.dashboardj.elasticsearch.entity.SearchSkill;
import org.example.dashboardj.elasticsearch.repository.OccupationSearchRepository;
import org.example.dashboardj.elasticsearch.repository.SkillSearchRepository;
import org.example.dashboardj.elasticsearch.service.SearchSyncService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SearchController {

    private final SkillSearchRepository skillSearchRepository;
    private final OccupationSearchRepository occupationSearchRepository;
    private final SearchSyncService searchSyncService;

    @GetMapping("/skills")
    public ResponseEntity<Page<SearchSkill>> searchSkills(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.ok(Page.empty());
        }
        return ResponseEntity.ok(skillSearchRepository.findByNameContainingIgnoreCase(q, PageRequest.of(page, size)));
    }

    @GetMapping("/occupations")
    public ResponseEntity<Page<SearchOccupation>> searchOccupations(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.ok(Page.empty());
        }
        return ResponseEntity.ok(occupationSearchRepository.findByNameContainingIgnoreCase(q, PageRequest.of(page, size)));
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncAll() {
        searchSyncService.syncSkillsToElasticsearch();
        searchSyncService.syncOccupationsToElasticsearch();
        return ResponseEntity.ok("Synchronization completed successfully.");
    }
}
