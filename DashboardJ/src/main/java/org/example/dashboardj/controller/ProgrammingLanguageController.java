package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.GraphDataDTO;
import org.example.dashboardj.dto.ProgrammingLanguageDTO;
import org.example.dashboardj.service.ProgrammingLanguageService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/languages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProgrammingLanguageController {

    private final ProgrammingLanguageService service;

    @GetMapping
    public ResponseEntity<List<ProgrammingLanguageDTO>> getAllLanguages() {
        return ResponseEntity.ok(service.getAllLanguages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgrammingLanguageDTO> getLanguageById(@PathVariable String id) {
        return ResponseEntity.ok(service.getLanguageById(id));
    }

    @PostMapping
    public ResponseEntity<ProgrammingLanguageDTO> createLanguage(@RequestBody ProgrammingLanguageDTO dto) {
        return ResponseEntity.ok(service.createLanguage(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgrammingLanguageDTO> updateLanguage(@PathVariable String id,
                                                                 @RequestBody ProgrammingLanguageDTO dto) {
        return ResponseEntity.ok(service.updateLanguage(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLanguage(@PathVariable String id) {
        service.deleteLanguage(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/top")
    public ResponseEntity<List<ProgrammingLanguageDTO>> getTopLanguages() {
        return ResponseEntity.ok(service.getTopLanguages());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProgrammingLanguageDTO>> searchLanguages(@RequestParam String name) {
        return ResponseEntity.ok(service.searchLanguages(name));
    }

    @GetMapping("/co-occurrence")
    public ResponseEntity<GraphDataDTO> getLanguageCoOccurrenceGraph(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(service.getSkillCoOccurrenceGraph(startDate, endDate));
    }

    @GetMapping("/co-occurrence-trends")
    public ResponseEntity<GraphDataDTO> getSkillCoOccurrenceTrendsGraph(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate referenceDate) {
        // Use today's date if no reference date is provided
        LocalDate refDate = referenceDate != null ? referenceDate : LocalDate.now();
        return ResponseEntity.ok(service.getSkillCoOccurrenceTrendsGraph(refDate));
    }
}