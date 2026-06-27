package org.example.dashboardj.elasticsearch.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dashboardj.elasticsearch.entity.SearchOccupation;
import org.example.dashboardj.elasticsearch.entity.SearchSkill;
import org.example.dashboardj.elasticsearch.repository.OccupationSearchRepository;
import org.example.dashboardj.elasticsearch.repository.SkillSearchRepository;
import org.example.dashboardj.entity.Occupation;
import org.example.dashboardj.entity.Skill;
import org.example.dashboardj.repository.OccupationRepository;
import org.example.dashboardj.repository.SkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchSyncService {

    private final SkillRepository skillRepository;
    private final OccupationRepository occupationRepository;
    private final SkillSearchRepository skillSearchRepository;
    private final OccupationSearchRepository occupationSearchRepository;

    public void syncSkillsToElasticsearch() {
        log.info("Starting Skill synchronization to Elasticsearch...");
        skillSearchRepository.deleteAll();
        
        int page = 0;
        int size = 500;
        Page<Skill> skillPage;
        
        do {
            skillPage = skillRepository.findAllBasic(PageRequest.of(page, size));
            List<SearchSkill> searchSkills = skillPage.getContent().stream()
                    .map(s -> new SearchSkill(s.getConceptUri(), s.getName(), s.getSkillType()))
                    .collect(Collectors.toList());
            
            skillSearchRepository.saveAll(searchSkills);
            log.info("Synced page {} of {}", page + 1, skillPage.getTotalPages());
            page++;
        } while (skillPage.hasNext());
        
        log.info("Skill synchronization complete!");
    }

    public void syncOccupationsToElasticsearch() {
        log.info("Starting Occupation synchronization to Elasticsearch...");
        occupationSearchRepository.deleteAll();
        
        int page = 0;
        int size = 500;
        Page<Occupation> occupationPage;
        
        do {
            occupationPage = occupationRepository.findAllBasic(PageRequest.of(page, size));
            List<SearchOccupation> searchOccupations = occupationPage.getContent().stream()
                    .map(o -> new SearchOccupation(o.getConceptUri(), o.getName()))
                    .collect(Collectors.toList());
            
            occupationSearchRepository.saveAll(searchOccupations);
            log.info("Synced page {} of {}", page + 1, occupationPage.getTotalPages());
            page++;
        } while (occupationPage.hasNext());
        
        log.info("Occupation synchronization complete!");
    }
}
