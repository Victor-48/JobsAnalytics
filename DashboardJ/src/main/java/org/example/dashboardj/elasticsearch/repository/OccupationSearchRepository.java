package org.example.dashboardj.elasticsearch.repository;

import org.example.dashboardj.elasticsearch.entity.SearchOccupation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OccupationSearchRepository extends ElasticsearchRepository<SearchOccupation, String> {
    Page<SearchOccupation> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
