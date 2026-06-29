package org.example.dashboardj.controller;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.JobPostingDTO;
import org.example.dashboardj.dto.KeyIndicatorDTO;
import org.example.dashboardj.dto.EmergingTechDTO;
import org.example.dashboardj.service.JobPostingService;
import org.example.dashboardj.service.implementation.AdzunaIntegrationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobPostingController {

    private final JobPostingService service;
    private final AdzunaIntegrationService adzunaIntegrationService;

    @GetMapping
    public ResponseEntity<Page<JobPostingDTO>> getAllJobs(
            @RequestParam(required = false) String remoteFlexibility,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        return ResponseEntity.ok(service.getAllJobs(PageRequest.of(page, size), remoteFlexibility, industry, country, city));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostingDTO> getJobById(@PathVariable String id) {
        return ResponseEntity.ok(service.getJobById(id));
    }

    // Creates a single job
    @PostMapping
    public ResponseEntity<JobPostingDTO> createJob(@Valid @RequestBody JobPostingDTO dto) {
        return ResponseEntity.ok(service.createJob(dto));
    }

    // Updates an existing job
    @PutMapping("/{id}")
    @PreAuthorize("@jobSecurityService.isJobOwner(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<JobPostingDTO> updateJob(@PathVariable String id, @Valid @RequestBody JobPostingDTO dto) {
        return ResponseEntity.ok(service.updateJob(id, dto));
    }

    // Creates multiple jobs in bulk
    @PostMapping("/bulk")
    public ResponseEntity<List<JobPostingDTO>> createJobsInBulk(@RequestBody List<@Valid JobPostingDTO> dtos) {
        return ResponseEntity.ok(service.createJobs(dtos));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@jobSecurityService.isJobOwner(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        service.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<JobPostingDTO>> searchByTitle(
            @RequestParam("query") String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.searchByTitle(title, PageRequest.of(page, size)));
    }

    // Analytics Endpoints

    @GetMapping("/debug")
    public ResponseEntity<Object> debugCypher(@RequestParam String query) {
        return ResponseEntity.ok(service.debugQuery(query));
    }

    @GetMapping("/stats/key-indicators")
    public ResponseEntity<List<KeyIndicatorDTO>> getKeyIndicators() {
        return ResponseEntity.ok(service.getKeyIndicators());
    }

    @GetMapping("/stats/emerging-tech-index")
    public ResponseEntity<List<EmergingTechDTO>> getEmergingTechIndex() {
        return ResponseEntity.ok(service.getEmergingTechIndex());
    }

    @GetMapping("/stats/salary-by-industry")
    public ResponseEntity<Map<String, Double>> getAverageSalaryByIndustry() {
        return ResponseEntity.ok(service.getAverageSalaryByIndustry());
    }

    @GetMapping("/stats/salary-by-experience")
    public ResponseEntity<Map<String, Long>> getSalaryDistributionByExperience() {
        return ResponseEntity.ok(service.getSalaryDistributionByExperience());
    }

    @GetMapping("/stats/remote-vs-onsite")
    public ResponseEntity<Map<String, Double>> getRemoteVsOnsiteStats() {
        return ResponseEntity.ok(service.getRemoteVsOnsiteStats());
    }

    @GetMapping("/stats/employment-type")
    public ResponseEntity<Map<String, Long>> getEmploymentTypeDistribution() {
        return ResponseEntity.ok(service.getEmploymentTypeDistribution());
    }

    @GetMapping("/stats/sub-sectors/{naceCode}")
    public ResponseEntity<Map<String, Long>> getSubSectorsByNaceCode(@PathVariable String naceCode) {
        return ResponseEntity.ok(service.getSubSectorsByNaceCode(naceCode));
    }

    @GetMapping("/by-skills")
    public ResponseEntity<Map<String, Long>> getJobTitlesBySkills(
            @RequestParam String skill1,
            @RequestParam String skill2) {
        return ResponseEntity.ok(service.getJobTitlesBySkills(skill1, skill2));
    }

    // New Time-Series Endpoint
    @GetMapping("/stats/postings-over-time")
    public ResponseEntity<Map<String, Long>> getJobPostingsOverTime() {
        return ResponseEntity.ok(service.getJobPostingsOverTime());
    }

    @GetMapping("/stats/role-cannibalization")
    public ResponseEntity<List<Map<String, Object>>> getRoleCannibalizationStats() {
        return ResponseEntity.ok(service.getRoleCannibalizationStats());
    }

    // Geospatial Endpoint
    @GetMapping("/stats/locations")
    public ResponseEntity<Object> getJobLocations() {
        return ResponseEntity.ok(service.getJobLocations());
    }

    @PostMapping("/generate-test-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> generateTestData() {
        service.generateTestData();
        return ResponseEntity.ok("Test jobs generated.");
    }

    @GetMapping("/sync-adzuna")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> syncAdzunaJobs(@RequestParam(defaultValue = "10") int limit) {
        int count = adzunaIntegrationService.syncJobs(limit);
        return ResponseEntity.ok("Successfully synced " + count + " jobs from Adzuna.");
    }
}