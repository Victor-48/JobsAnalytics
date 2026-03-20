package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.ProgrammingLanguageDTO;
import org.example.dashboardj.service.ProgrammingLanguageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<ProgrammingLanguageDTO> getLanguageById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getLanguageById(id));
    }

    @PostMapping
    public ResponseEntity<ProgrammingLanguageDTO> createLanguage(@RequestBody ProgrammingLanguageDTO dto) {
        return ResponseEntity.ok(service.createLanguage(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgrammingLanguageDTO> updateLanguage(@PathVariable Long id,
                                                                 @RequestBody ProgrammingLanguageDTO dto) {
        return ResponseEntity.ok(service.updateLanguage(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLanguage(@PathVariable Long id) {
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
}
