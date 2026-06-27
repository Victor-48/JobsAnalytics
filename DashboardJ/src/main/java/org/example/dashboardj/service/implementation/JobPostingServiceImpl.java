package org.example.dashboardj.service.implementation;

import lombok.RequiredArgsConstructor;
import org.example.dashboardj.dto.*;
import org.example.dashboardj.entity.JobPosting;
import org.example.dashboardj.entity.Sector;
import org.example.dashboardj.entity.Occupation;
import org.example.dashboardj.entity.Skill;
import org.example.dashboardj.repository.JobPostingRepository;
import org.example.dashboardj.repository.SectorRepository;
import org.example.dashboardj.repository.OccupationRepository;
import org.example.dashboardj.repository.SkillRepository;
import org.example.dashboardj.repository.LocationRepository;
import org.example.dashboardj.service.JobPostingService;
import org.example.dashboardj.entity.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class JobPostingServiceImpl implements JobPostingService {

    private final JobPostingRepository jobRepo;
    private final SectorRepository sectorRepo;
    private final OccupationRepository occupationRepo;
    private final SkillRepository skillRepo;
    private final Neo4jClient neo4jClient;
    private final LocationRepository locationRepo;

    @Value("${locationiq.api.key:}")
    private String locationIqApiKey;

    private JobPostingDTO mapToDTO(JobPosting job) {
        JobPostingDTO dto = new JobPostingDTO();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        dto.setLocation(job.getLocation());
        dto.setPostedDate(job.getPostedDate() != null ? job.getPostedDate().toString() : null);
        dto.setSalary(job.getSalary());
        dto.setCurrency(job.getCurrency());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setRemoteFlexibility(job.getRemoteFlexibility());
        dto.setEmploymentType(job.getEmploymentType());

        if (job.getSector() != null) {
            dto.setSector(new SectorDTO(job.getSector().getConceptUri(), job.getSector().getName()));
            dto.setSectorUri(job.getSector().getConceptUri());
        }
        
        if (job.getOccupation() != null) {
            String occUri = job.getOccupation().getConceptUri();
            OccupationDetailDTO occDetail = occupationRepo.findById(occUri).map(occ -> {
                List<SectorDTO> sectors = null;
                if (occ.getSectors() != null) {
                    sectors = occ.getSectors().stream()
                            .map(s -> new SectorDTO(s.getConceptUri(), s.getName()))
                            .collect(Collectors.toList());
                }
                ISCOGroupDTO iscoGroup = null;
                if (occ.getIscoGroup() != null) {
                    iscoGroup = new ISCOGroupDTO(occ.getIscoGroup().getConceptUri(), occ.getIscoGroup().getName());
                }
                List<SkillSummaryDTO> occSkills = new ArrayList<>();
                if (occ.getSkills() != null) {
                    occSkills = occ.getSkills().stream()
                            .map(rel -> new SkillSummaryDTO(rel.getSkill().getName(), rel.getSkill().getConceptUri(), rel.getSkill().getDynamicLabels()))
                            .collect(Collectors.toList());
                }
                return new OccupationDetailDTO(occUri, occ.getName(), sectors, iscoGroup, occSkills);
            }).orElseGet(() -> new OccupationDetailDTO(occUri, job.getOccupation().getName(), null, null, new ArrayList<>()));
            
            dto.setOccupation(occDetail);
            dto.setOccupationUri(occUri);
        }

        if (job.getRequiredSkills() != null && !job.getRequiredSkills().isEmpty()) {
            List<String> skillUris = job.getRequiredSkills().stream()
                .map(org.example.dashboardj.entity.Skill::getConceptUri)
                .collect(Collectors.toList());
            List<org.example.dashboardj.entity.Skill> fullSkills = skillRepo.findAllById(skillUris);
            List<SkillSummaryDTO> skills = fullSkills.stream()
                .map(s -> new SkillSummaryDTO(s.getName(), s.getConceptUri(), s.getDynamicLabels()))
                .collect(Collectors.toList());
            dto.setRequiredSkills(skills);
            dto.setRequiredSkillUris(skillUris);
        } else {
            dto.setRequiredSkills(new ArrayList<>());
            dto.setRequiredSkillUris(new ArrayList<>());
        }

        return dto;
    }

    private JobPosting mapToEntity(JobPostingDTO dto) {
        LocalDate date = null;
        if (dto.getPostedDate() != null && !dto.getPostedDate().isEmpty()) {
            try {
                date = LocalDate.parse(dto.getPostedDate().split("T")[0]);
            } catch (Exception e) {}
        }
        
        JobPosting job = JobPosting.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .company(dto.getCompany())
                .location(dto.getLocation())
                .postedDate(date)
                .salary(dto.getSalary())
                .currency(dto.getCurrency())
                .experienceLevel(dto.getExperienceLevel())
                .remoteFlexibility(dto.getRemoteFlexibility())
                .employmentType(dto.getEmploymentType())
                .requiredSkills(new ArrayList<>())
                .build();

        if (dto.getSectorUri() != null && !dto.getSectorUri().isEmpty()) {
            sectorRepo.findById(dto.getSectorUri()).ifPresent(job::setSector);
        }
        
        if (dto.getOccupationUri() != null && !dto.getOccupationUri().isEmpty()) {
            occupationRepo.findById(dto.getOccupationUri()).ifPresent(occ -> {
                occ.setSectors(null);
                occ.setIscoGroup(null);
                occ.setSkills(null);
                job.setOccupation(occ);
            });
        }

        if (dto.getRequiredSkillUris() != null && !dto.getRequiredSkillUris().isEmpty()) {
            Iterable<Skill> skills = skillRepo.findAllById(dto.getRequiredSkillUris());
            skills.forEach(skill -> {
                skill.setBroaderGroup(null);
                skill.setRelatedSkills(null);
                job.getRequiredSkills().add(skill);
            });
        }

        if (dto.getLocation() != null && !dto.getLocation().isEmpty() && !dto.getLocation().equalsIgnoreCase("Remote")) {
            job.setLocationNode(resolveLocation(dto.getLocation()));
        }

        return job;
    }

    private Location resolveLocation(String rawLocation) {
        return locationRepo.findById(rawLocation).orElseGet(() -> {
            Location newLoc = new Location();
            newLoc.setName(rawLocation);
            if (locationIqApiKey != null && !locationIqApiKey.isEmpty()) {
                try {
                    RestTemplate restTemplate = new RestTemplate();
                    String url = "https://us1.locationiq.com/v1/search.php?key=" + locationIqApiKey + "&q=" + java.net.URLEncoder.encode(rawLocation, "UTF-8") + "&format=json";
                    ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
                        Map<String, Object> firstResult = (Map<String, Object>) response.getBody().get(0);
                        newLoc.setLatitude(Double.parseDouble(firstResult.get("lat").toString()));
                        newLoc.setLongitude(Double.parseDouble(firstResult.get("lon").toString()));
                        
                        // Extract display_name for city/country fallback or if it's there
                        String displayName = (String) firstResult.get("display_name");
                        if (displayName != null) {
                            String[] parts = displayName.split(",");
                            if (parts.length > 0) newLoc.setCity(parts[0].trim());
                            if (parts.length > 1) newLoc.setCountry(parts[parts.length - 1].trim());
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Failed to geocode location: " + rawLocation + " - " + e.getMessage());
                }
            } else {
                newLoc.setCity(rawLocation);
                newLoc.setCountry("Unknown");
            }
            return locationRepo.save(newLoc);
        });
    }

    private List<JobPostingDTO> fetchAllJobsAsDTO() {
        String query = """
        MATCH (j:JobPosting)
        OPTIONAL MATCH (j)-[:BELONGS_TO_SECTOR]->(s:Sector)
        OPTIONAL MATCH (j)-[:IS_OCCUPATION]->(o:Occupation)
        OPTIONAL MATCH (j)-[:REQUIRES_SKILL]->(k:Skill)
        RETURN j.id as id, j.title as title, j.company as company,
               j.location as location, j.postedDate as postedDate,
               j.salary as salary, j.currency as currency,
               j.experienceLevel as experienceLevel, j.remoteFlexibility as remoteFlexibility,
               j.employmentType as employmentType,
               s.conceptUri as sectorUri, s.name as sectorName,
               o.conceptUri as occUri, o.name as occName,
               collect(properties(k)) as skills
        """;
        return neo4jClient.query(query).fetch().all().stream()
                .map(row -> {
                    JobPostingDTO dto = new JobPostingDTO();
                    Object id = row.get("id");
                    dto.setId(id != null ? id.toString() : null);
                    dto.setTitle((String) row.get("title"));
                    dto.setCompany((String) row.get("company"));
                    dto.setLocation((String) row.get("location"));
                    Object date = row.get("postedDate");
                    dto.setPostedDate(date != null ? date.toString() : null);
                    Object salary = row.get("salary");
                    dto.setSalary(salary != null ? ((Number) salary).doubleValue() : null);
                    dto.setCurrency((String) row.get("currency"));
                    dto.setExperienceLevel((String) row.get("experienceLevel"));
                    dto.setRemoteFlexibility((String) row.get("remoteFlexibility"));
                    dto.setEmploymentType((String) row.get("employmentType"));
                    
                    String sectorUri = (String) row.get("sectorUri");
                    if (sectorUri != null) {
                        dto.setSectorUri(sectorUri);
                        dto.setSector(new SectorDTO(sectorUri, (String) row.get("sectorName")));
                    }

                    String occUri = (String) row.get("occUri");
                    if (occUri != null) {
                        dto.setOccupationUri(occUri);
                        dto.setOccupation(new OccupationDetailDTO(occUri, (String) row.get("occName"), null, null, new ArrayList<>()));
                    }

                    @SuppressWarnings("unchecked")
                    List<Object> skillsRaw = (List<Object>) row.get("skills");
                    List<SkillSummaryDTO> skills = new ArrayList<>();
                    if (skillsRaw != null) {
                        for (Object obj : skillsRaw) {
                            if (obj instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> map = (Map<String, Object>) obj;
                                if (map.get("conceptUri") != null) {
                                    String skillName = map.containsKey("preferredLabel") ? (String) map.get("preferredLabel") : (String) map.get("name");
                                    skills.add(new SkillSummaryDTO(skillName, (String) map.get("conceptUri"), null));
                                }
                            }
                        }
                    }
                    dto.setRequiredSkills(skills);
                    dto.setRequiredSkillUris(skills.stream().map(SkillSummaryDTO::getUri).collect(Collectors.toList()));

                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<JobPostingDTO> getAllJobs(Pageable pageable, String remoteFlexibility, String industry) {
        List<JobPostingDTO> allJobs = fetchAllJobsAsDTO();

        Stream<JobPostingDTO> stream = allJobs.stream();

        if (remoteFlexibility != null && !remoteFlexibility.isEmpty()) {
            stream = stream.filter(j -> remoteFlexibility.equalsIgnoreCase(j.getRemoteFlexibility()));
        }
        if (industry != null && !industry.isEmpty()) {
            stream = stream.filter(j -> {
                if (j.getSector() != null) {
                    return industry.equalsIgnoreCase(j.getSector().getName()) || industry.equalsIgnoreCase(j.getSector().getConceptUri());
                }
                return false;
            });
        }

        List<JobPostingDTO> filteredDtos = stream.collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredDtos.size());
        
        List<JobPostingDTO> pageContent = start > filteredDtos.size() ? Collections.emptyList() : filteredDtos.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filteredDtos.size());
    }
    
    @Override
    public List<JobPostingDTO> getAllJobs() {
        return fetchAllJobsAsDTO();
    }

    @Override
    public JobPostingDTO getJobById(String id) {
        return jobRepo.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    @Override
    @Transactional
    public JobPostingDTO createJob(JobPostingDTO dto) {
        JobPosting job = mapToEntity(dto);
        JobPosting savedJob = jobRepo.save(job);
        return mapToDTO(savedJob);
    }
    
    @Override
    @Transactional
    public JobPostingDTO updateJob(String id, JobPostingDTO dto) {
        JobPosting existingJob = jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id " + id));
        
        JobPosting newJobData = mapToEntity(dto);
        
        existingJob.setTitle(newJobData.getTitle());
        existingJob.setCompany(newJobData.getCompany());
        existingJob.setLocation(newJobData.getLocation());
        existingJob.setSalary(newJobData.getSalary());
        existingJob.setCurrency(newJobData.getCurrency());
        existingJob.setExperienceLevel(newJobData.getExperienceLevel());
        existingJob.setRemoteFlexibility(newJobData.getRemoteFlexibility());
        existingJob.setEmploymentType(newJobData.getEmploymentType());
        
        existingJob.setSector(newJobData.getSector());
        existingJob.setOccupation(newJobData.getOccupation());
        existingJob.setRequiredSkills(newJobData.getRequiredSkills());
        
        JobPosting savedJob = jobRepo.save(existingJob);
        return mapToDTO(savedJob);
    }

    @Override
    @Transactional
    public List<JobPostingDTO> createJobs(List<JobPostingDTO> dtos) {
        List<JobPosting> entitiesToSave = dtos.stream()
                .map(this::mapToEntity)
                .collect(Collectors.toList());
        
        List<JobPosting> savedEntities = jobRepo.saveAll(entitiesToSave);
        return savedEntities.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteJob(String id) {
        jobRepo.deleteById(id);
    }

    @Override
    public Object debugQuery(String query) {
        return neo4jClient.query(query).fetch().all();
    }

    @Override
    public List<JobPostingDTO> searchByTitle(String title) {
        return jobRepo.findByTitleContainingIgnoreCase(title).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<JobPostingDTO> searchByTitle(String title, Pageable pageable) {
        return jobRepo.findByTitleContainingIgnoreCase(title, pageable).map(this::mapToDTO);
    }
    @Override
    @Cacheable(value = "analyticsCache", key = "#root.methodName")
    public Map<String, Double> getAverageSalaryByIndustry() {
        return neo4jClient.query("MATCH (j:JobPosting)-[:BELONGS_TO_SECTOR]->(s:Sector) " +
               "WHERE j.salary IS NOT NULL " +
               "RETURN s.naceName as name, avg(j.salary) as value")
            .fetch().all().stream()
            .collect(Collectors.toMap(
                m -> (String) m.get("name"),
                m -> ((Number) m.get("value")).doubleValue()
            ));
    }

    @Override
    @Cacheable(value = "analyticsCache", key = "#root.methodName")
    public Map<String, Long> getSalaryDistributionByExperience() {
        return neo4jClient.query("MATCH (j:JobPosting) " +
               "WHERE j.experienceLevel IS NOT NULL " +
               "RETURN j.experienceLevel as name, count(j) as count")
            .fetch().all().stream()
            .collect(Collectors.toMap(
                m -> (String) m.get("name"),
                m -> ((Number) m.get("count")).longValue()
            ));
    }

    @Override
    @Cacheable(value = "analyticsCache", key = "#root.methodName")
    public Map<String, Double> getRemoteVsOnsiteStats() {
        return neo4jClient.query("MATCH (j:JobPosting) " +
               "WHERE j.remoteFlexibility IS NOT NULL AND j.salary IS NOT NULL " +
               "RETURN j.remoteFlexibility as name, avg(j.salary) as value")
            .fetch().all().stream()
            .collect(Collectors.toMap(
                m -> (String) m.get("name"),
                m -> ((Number) m.get("value")).doubleValue()
            ));
    }

    @Override
    @Cacheable(value = "analyticsCache", key = "#root.methodName")
    public Map<String, Long> getEmploymentTypeDistribution() {
        return neo4jClient.query("MATCH (j:JobPosting) " +
               "WHERE j.employmentType IS NOT NULL " +
               "RETURN j.employmentType as name, count(j) as count")
            .fetch().all().stream()
            .collect(Collectors.toMap(
                m -> (String) m.get("name"),
                m -> ((Number) m.get("count")).longValue()
            ));
    }

    @Override
    @Cacheable(value = "analyticsCache", key = "#root.methodName")
    public Map<String, Long> getJobPostingsOverTime() {
        return neo4jClient.query("MATCH (j:JobPosting) WHERE j.postedDate IS NOT NULL " +
               "RETURN substring(toString(j.postedDate), 0, 10) as name, count(j) as count")
            .fetch().all().stream()
            .collect(Collectors.toMap(
                m -> (String) m.get("name"),
                m -> ((Number) m.get("count")).longValue(),
                (v1, v2) -> v1,
                TreeMap::new
            ));
    }

    @Override
    @Cacheable(value = "analyticsCache", key = "'subsectors:' + #naceCode")
    public Map<String, Long> getSubSectorsByNaceCode(String naceCode) {
        return neo4jClient.query("MATCH (j:JobPosting)-[:BELONGS_TO_SECTOR]->(s:Sector {naceCode: $naceCode}) " +
               "WHERE j.title IS NOT NULL " +
               "RETURN j.title as name, count(j) as count")
            .bind(naceCode).to("naceCode")
            .fetch().all().stream()
            .collect(Collectors.toMap(
                m -> (String) m.get("name"),
                m -> ((Number) m.get("count")).longValue()
            ));
    }
    
    @Override
    @Cacheable(value = "analyticsCache", key = "#root.methodName")
    public Object getJobLocations() {
        return neo4jClient.query("MATCH (j:JobPosting)-[:LOCATED_IN]->(l:Location) " +
               "RETURN l.name as name, l.city as city, l.country as country, l.latitude as lat, l.longitude as lng, count(j) as count")
            .fetch().all().stream()
            .map(row -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", row.get("name"));
                map.put("city", row.get("city"));
                map.put("country", row.get("country"));
                map.put("lat", row.get("lat"));
                map.put("lng", row.get("lng"));
                map.put("count", ((Number) row.get("count")).longValue());
                return map;
            })
            .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "analyticsCache", key = "'jobTitles:' + #skill1 + ':' + #skill2")
    public Map<String, Long> getJobTitlesBySkills(String skill1, String skill2) {
        return neo4jClient.query("MATCH (s1:Skill {preferredLabel: $skill1})<-[:REQUIRES_SKILL]-(j:JobPosting)-[:REQUIRES_SKILL]->(s2:Skill {preferredLabel: $skill2}) " +
               "RETURN j.title as name, count(j) as count " +
               "ORDER BY count DESC")
            .bind(skill1).to("skill1")
            .bind(skill2).to("skill2")
            .fetch().all().stream()
            .collect(Collectors.toMap(
                m -> (String) m.get("name"),
                m -> ((Number) m.get("count")).longValue()
            ));
    }

    private String formatTrend(long current, long previous) {
        if (previous == 0) {
            if (current > 0) return "+100% (New)";
            return "0%";
        }
        double change = ((double)(current - previous) / previous) * 100;
        if (change > 0) return String.format("+%.1f%%", change);
        if (change < 0) return String.format("%.1f%%", change);
        return "0%";
    }

    @Override
    @Cacheable(value = "analyticsCache", key = "#root.methodName")
    public List<EmergingTechDTO> getEmergingTechIndex() {
        Collection<Map<String, Object>> results = neo4jClient.query(
            "MATCH (j:JobPosting)-[:REQUIRES_SKILL]->(s:Skill) " +
            "WHERE j.postedDate >= date() - duration('P30D') " +
            "OPTIONAL MATCH (j)-[:BELONGS_TO_SECTOR]->(sec:Sector) " +
            "WITH s, count(DISTINCT j) as currentCount, count(DISTINCT sec) as industrySpread " +
            "OPTIONAL MATCH (j2:JobPosting)-[:REQUIRES_SKILL]->(s) " +
            "WHERE j2.postedDate >= date() - duration('P60D') AND j2.postedDate < date() - duration('P30D') " +
            "WITH s, currentCount, industrySpread, count(j2) as previousCount " +
            "WITH s, currentCount, industrySpread, previousCount, " +
            "     CASE WHEN previousCount = 0 THEN 100.0 ELSE ((currentCount - previousCount) * 100.0 / previousCount) END as growth " +
            "WHERE currentCount >= 2 " +
            "WITH s, currentCount, industrySpread, growth, " +
            "     (CASE WHEN currentCount > 20 THEN 20.0 ELSE currentCount END) + " +
            "     (CASE WHEN growth > 50 THEN 50.0 ELSE growth END) + " +
            "     (CASE WHEN industrySpread * 5 > 30 THEN 30.0 ELSE industrySpread * 5 END) as etiScore " +
            "ORDER BY etiScore DESC LIMIT 10 " +
            "RETURN s.preferredLabel as skill, etiScore, currentCount, growth, industrySpread"
        ).fetch().all();

        return results.stream().map(row -> new EmergingTechDTO(
            (String) row.get("skill"),
            ((Number) row.get("etiScore")).doubleValue(),
            ((Number) row.get("currentCount")).longValue(),
            ((Number) row.get("growth")).doubleValue(),
            ((Number) row.get("industrySpread")).longValue()
        )).collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "analyticsCache", key = "#root.methodName")
    public List<KeyIndicatorDTO> getKeyIndicators() {
        // Total Jobs with Trend
        Collection<Map<String, Object>> totalJobsList = neo4jClient.query(
            "MATCH (j:JobPosting) WHERE j.postedDate >= date() - duration('P30D') WITH count(j) as currentCount " +
            "OPTIONAL MATCH (j2:JobPosting) WHERE j2.postedDate >= date() - duration('P60D') AND j2.postedDate < date() - duration('P30D') WITH currentCount, count(j2) as previousCount " +
            "RETURN currentCount, previousCount"
        ).fetch().all();
        
        long totalJobs = jobRepo.count(); // Still show total active jobs globally
        String totalJobsTrend = "0%";
        if (!totalJobsList.isEmpty()) {
            Map<String, Object> res = totalJobsList.iterator().next();
            long current = ((Number) res.getOrDefault("currentCount", 0)).longValue();
            long previous = ((Number) res.getOrDefault("previousCount", 0)).longValue();
            totalJobsTrend = formatTrend(current, previous) + " this month";
        }
        KeyIndicatorDTO totalJobsIndicator = new KeyIndicatorDTO("Total Active Jobs", String.format("%,d", totalJobs), totalJobsTrend);

        // Trending Skill
        Collection<Map<String, Object>> topSkillList = neo4jClient.query(
            "MATCH (j:JobPosting)-[:REQUIRES_SKILL]->(s:Skill) " +
            "WHERE j.postedDate >= date() - duration('P30D') " +
            "WITH s, count(j) as currentCount " +
            "OPTIONAL MATCH (j2:JobPosting)-[:REQUIRES_SKILL]->(s) " +
            "WHERE j2.postedDate >= date() - duration('P60D') AND j2.postedDate < date() - duration('P30D') " +
            "WITH s, currentCount, count(j2) as previousCount " +
            "WITH s, currentCount, previousCount, " +
            "     CASE WHEN previousCount = 0 THEN 100.0 ELSE ((currentCount - previousCount) * 100.0 / previousCount) END as growth " +
            "ORDER BY growth DESC, currentCount DESC LIMIT 1 " +
            "RETURN s.preferredLabel as name, currentCount, previousCount, growth"
        ).fetch().all();
        
        KeyIndicatorDTO topSkillIndicator;
        if (topSkillList.isEmpty()) {
            topSkillIndicator = new KeyIndicatorDTO("Trending Skill", "N/A", "Insufficient data");
        } else {
            Map<String, Object> res = topSkillList.iterator().next();
            long currentCount = ((Number) res.get("currentCount")).longValue();
            long previousCount = ((Number) res.get("previousCount")).longValue();
            topSkillIndicator = new KeyIndicatorDTO("Trending Skill", (String) res.get("name"), formatTrend(currentCount, previousCount) + " this month");
        }

        // Trending Role
        Collection<Map<String, Object>> topRoleList = neo4jClient.query(
            "MATCH (j:JobPosting) WHERE j.title IS NOT NULL AND j.postedDate >= date() - duration('P30D') " +
            "WITH j.title as title, count(j) as currentCount " +
            "OPTIONAL MATCH (j2:JobPosting) WHERE j2.title = title AND j2.postedDate >= date() - duration('P60D') AND j2.postedDate < date() - duration('P30D') " +
            "WITH title, currentCount, count(j2) as previousCount " +
            "WITH title, currentCount, previousCount, " +
            "     CASE WHEN previousCount = 0 THEN 100.0 ELSE ((currentCount - previousCount) * 100.0 / previousCount) END as growth " +
            "ORDER BY growth DESC, currentCount DESC LIMIT 1 " +
            "RETURN title as name, currentCount, previousCount, growth"
        ).fetch().all();
        
        KeyIndicatorDTO topDemandedRoleIndicator;
        if (topRoleList.isEmpty()) {
            topDemandedRoleIndicator = new KeyIndicatorDTO("Emerging Role", "N/A", "Insufficient data");
        } else {
            Map<String, Object> res = topRoleList.iterator().next();
            long currentCount = ((Number) res.get("currentCount")).longValue();
            long previousCount = ((Number) res.get("previousCount")).longValue();
            topDemandedRoleIndicator = new KeyIndicatorDTO("Emerging Role", (String) res.get("name"), formatTrend(currentCount, previousCount) + " this month");
        }

        // Trending Industry
        Collection<Map<String, Object>> topIndustryList = neo4jClient.query(
            "MATCH (j:JobPosting)-[:BELONGS_TO_SECTOR]->(s:Sector) " +
            "WHERE j.postedDate >= date() - duration('P30D') " +
            "WITH s, count(j) as currentCount " +
            "OPTIONAL MATCH (j2:JobPosting)-[:BELONGS_TO_SECTOR]->(s) " +
            "WHERE j2.postedDate >= date() - duration('P60D') AND j2.postedDate < date() - duration('P30D') " +
            "WITH s, currentCount, count(j2) as previousCount " +
            "WITH s, currentCount, previousCount, " +
            "     CASE WHEN previousCount = 0 THEN 100.0 ELSE ((currentCount - previousCount) * 100.0 / previousCount) END as growth " +
            "ORDER BY growth DESC, currentCount DESC LIMIT 1 " +
            "RETURN s.naceName as name, currentCount, previousCount, growth"
        ).fetch().all();
        
        KeyIndicatorDTO topIndustryIndicator;
        if (topIndustryList.isEmpty()) {
            topIndustryIndicator = new KeyIndicatorDTO("Hot Industry", "N/A", "Insufficient data");
        } else {
            Map<String, Object> res = topIndustryList.iterator().next();
            long currentCount = ((Number) res.get("currentCount")).longValue();
            long previousCount = ((Number) res.get("previousCount")).longValue();
            topIndustryIndicator = new KeyIndicatorDTO("Hot Industry", (String) res.get("name"), formatTrend(currentCount, previousCount) + " this month");
        }

        // Add Salary
        Double avgSalary = neo4jClient.query("MATCH (j:JobPosting) WHERE j.salary IS NOT NULL RETURN avg(j.salary)")
                .fetch().one().map(m -> {
                    Object val = m.values().iterator().next();
                    return val == null ? 0.0 : ((Number) val).doubleValue();
                }).orElse(0.0);
        KeyIndicatorDTO avgSalaryIndicator = new KeyIndicatorDTO("Average Salary", String.format("$%,.0f", avgSalary), "+5% from last year");

        return Arrays.asList(totalJobsIndicator, topSkillIndicator, topDemandedRoleIndicator, topIndustryIndicator, avgSalaryIndicator);
    }

    @Override
    @Transactional
    public void generateTestData() {
        // Fetch 1 Sector, 1 Occupation, and 3 Skills to create realistic test data
        Sector sector = sectorRepo.findAll(org.springframework.data.domain.PageRequest.of(0, 1)).stream().findFirst().orElse(null);
        Occupation occupation = occupationRepo.findAll(org.springframework.data.domain.PageRequest.of(0, 1)).stream().findFirst().orElse(null);
        List<String> skills = skillRepo.findAll(org.springframework.data.domain.PageRequest.of(0, 3)).getContent().stream().map(Skill::getConceptUri).collect(Collectors.toList());

        JobPostingDTO job1 = JobPostingDTO.builder()
            .title("Senior Java Developer")
            .company("TechNova")
            .location("Remote")
            .postedDate("2026-06-25T10:00:00Z")
            .salary(120000.0)
            .currency("USD")
            .experienceLevel("Senior")
            .remoteFlexibility("Remote")
            .employmentType("Full-time")
            .sectorUri(sector != null ? sector.getConceptUri() : null)
            .occupationUri(occupation != null ? occupation.getConceptUri() : null)
            .requiredSkillUris(skills)
            .build();

        JobPostingDTO job2 = JobPostingDTO.builder()
            .title("Data Scientist")
            .company("Analytics Corp")
            .location("New York")
            .postedDate("2026-06-24T10:00:00Z")
            .salary(110000.0)
            .currency("USD")
            .experienceLevel("Mid")
            .remoteFlexibility("Hybrid")
            .employmentType("Full-time")
            .sectorUri(sector != null ? sector.getConceptUri() : null)
            .occupationUri(occupation != null ? occupation.getConceptUri() : null)
            .requiredSkillUris(skills)
            .build();

        createJob(job1);
        createJob(job2);
    }
}