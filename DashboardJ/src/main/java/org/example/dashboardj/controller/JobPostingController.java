package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.JobPostingDTO;
import org.example.dashboardj.service.JobPostingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobPostingController {

    private final JobPostingService service;

    @GetMapping
    public ResponseEntity<List<JobPostingDTO>> getAllJobs() {
        return ResponseEntity.ok(service.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostingDTO> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getJobById(id));
    }

    @PostMapping
    public ResponseEntity<JobPostingDTO> createJob(@RequestBody JobPostingDTO dto) {
        return ResponseEntity.ok(service.createJob(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        service.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobPostingDTO>> searchByTitle(@RequestParam String title) {
        return ResponseEntity.ok(service.searchByTitle(title));
    }
}
