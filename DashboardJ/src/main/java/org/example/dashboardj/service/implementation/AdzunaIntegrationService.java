package org.example.dashboardj.service.implementation;

import org.example.dashboardj.dto.JobPostingDTO;
import org.example.dashboardj.service.JobPostingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AdzunaIntegrationService {

    @Value("${adzuna.app.id}")
    private String appId;

    @Value("${adzuna.app.key}")
    private String appKey;

    private final JobPostingService jobPostingService;
    private final RestTemplate restTemplate;
    private final Neo4jClient neo4jClient;

    private List<Map<String, Object>> cachedSkills = null;

    public AdzunaIntegrationService(JobPostingService jobPostingService, Neo4jClient neo4jClient) {
        this.jobPostingService = jobPostingService;
        this.neo4jClient = neo4jClient;
        this.restTemplate = new RestTemplate();
    }

    public int syncJobs(int resultsPerPage) {
        String url = String.format("https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=%s&app_key=%s&results_per_page=%d", appId, appKey, resultsPerPage);

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        if (response == null || !response.containsKey("results")) {
            return 0;
        }

        List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
        int savedCount = 0;

        for (Map<String, Object> jobData : results) {
            JobPostingDTO dto = new JobPostingDTO();

            if (jobData.containsKey("title")) {
                dto.setTitle((String) jobData.get("title"));
            }

            if (jobData.containsKey("description")) {
                dto.setDescription((String) jobData.get("description"));
            }


            if (jobData.containsKey("created")) {
                dto.setPostedDate((String) jobData.get("created"));
            }

            if (jobData.containsKey("company")) {
                Map<String, Object> companyData = (Map<String, Object>) jobData.get("company");
                if (companyData != null && companyData.containsKey("display_name")) {
                    dto.setCompany((String) companyData.get("display_name"));
                }
            }

            if (jobData.containsKey("location")) {
                Map<String, Object> locationData = (Map<String, Object>) jobData.get("location");
                if (locationData != null) {
                    if (locationData.containsKey("display_name")) {
                        dto.setLocation((String) locationData.get("display_name"));
                    }
                    if (locationData.containsKey("area")) {
                        List<String> area = (List<String>) locationData.get("area");
                        if (area.size() > 0) dto.setCountry(area.get(0));
                        if (area.size() > 3) dto.setCity(area.get(3));
                    }
                }
            }

            if (jobData.containsKey("latitude") && jobData.get("latitude") != null) {
                dto.setLatitude(Double.parseDouble(jobData.get("latitude").toString()));
            }
            if (jobData.containsKey("longitude") && jobData.get("longitude") != null) {
                dto.setLongitude(Double.parseDouble(jobData.get("longitude").toString()));
            }

            if (jobData.containsKey("salary_min") && jobData.containsKey("salary_max")) {
                Object minObj = jobData.get("salary_min");
                Object maxObj = jobData.get("salary_max");
                if (minObj != null && maxObj != null) {
                    try {
                        double min = Double.parseDouble(minObj.toString());
                        double max = Double.parseDouble(maxObj.toString());
                        dto.setSalary((min + max) / 2.0);
                        dto.setCurrency("GBP");
                    } catch (NumberFormatException ignored) {}
                }
            }

            // Required Skills
            List<String> requiredSkillUris = new ArrayList<>();
            if (dto.getDescription() != null) {
                if (cachedSkills == null) {
                    cachedSkills = new ArrayList<>(neo4jClient.query("MATCH (s:Skill) RETURN s.conceptUri as uri, s.preferredLabel as label").fetch().all());
                }
                String descLower = dto.getDescription().toLowerCase();
                for (Map<String, Object> skillData : cachedSkills) {
                    String label = (String) skillData.get("label");
                    String uri = (String) skillData.get("uri");
                    if (label != null && label.length() > 2) { // Skip 1-2 letter skills except R and C
                        String regex = ".*(^|\\W)" + Pattern.quote(label.toLowerCase()) + "($|\\W).*";
                        if (descLower.matches(regex)) {
                            requiredSkillUris.add(uri);
                        }
                    } else if ("R".equalsIgnoreCase(label) || "C".equalsIgnoreCase(label)) {
                        String regex = ".*(^|\\W)" + Pattern.quote(label.toLowerCase()) + "($|\\W).*";
                        if (descLower.matches(regex)) {
                            requiredSkillUris.add(uri);
                        }
                    }
                }
            }
            dto.setRequiredSkillUris(requiredSkillUris);
            dto.setRequiredSkills(new ArrayList<>()); // Ignored for output

            // Category -> Sector Mapping
            if (jobData.containsKey("category")) {
                Map<String, Object> categoryData = (Map<String, Object>) jobData.get("category");
                if (categoryData != null && categoryData.containsKey("label")) {
                    String categoryLabel = (String) categoryData.get("label");
                    String uri = "adzuna-nace-" + UUID.randomUUID().toString();
                    String query = "MERGE (s:Sector {naceName: $label}) SET s.naceCode = coalesce(s.naceCode, $uri) RETURN s.naceCode as uri";
                    Optional<Map<String, Object>> result = neo4jClient.query(query)
                            .bind(categoryLabel).to("label")
                            .bind(uri).to("uri")
                            .fetch().first();
                    result.ifPresent(m -> dto.setSectorUri((String) m.get("uri")));
                }
            }

            // Hardcode default values
            dto.setEmploymentType("Full-time");
            dto.setRemoteFlexibility("On-site"); // or default
            dto.setExperienceLevel("Mid Level");
            
            if (jobData.containsKey("redirect_url")) {
                dto.setUrl((String) jobData.get("redirect_url"));
            }

            // Save using existing JobPostingService logic
            try {
                jobPostingService.createJob(dto);
                savedCount++;
            } catch (Exception e) {
                System.err.println("Failed to save job from Adzuna: " + dto.getTitle());
            }
        }
        return savedCount;
    }
}
