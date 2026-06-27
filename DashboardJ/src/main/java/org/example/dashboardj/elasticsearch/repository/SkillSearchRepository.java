package org.example.dashboardj.elasticsearch.repository;

import org.example.dashboardj.elasticsearch.entity.SearchSkill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillSearchRepository extends ElasticsearchRepository<SearchSkill, String> {
    Page<SearchSkill> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
