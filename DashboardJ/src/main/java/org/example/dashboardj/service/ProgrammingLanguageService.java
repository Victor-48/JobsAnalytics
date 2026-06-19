package org.example.dashboardj.service;

import org.example.dashboardj.dto.GraphDataDTO;
import org.example.dashboardj.dto.ProgrammingLanguageDTO;

import java.time.LocalDate;
import java.util.List;

public interface ProgrammingLanguageService {

    List<ProgrammingLanguageDTO> getAllLanguages();

    ProgrammingLanguageDTO getLanguageById(String id);

    ProgrammingLanguageDTO createLanguage(ProgrammingLanguageDTO dto);

    ProgrammingLanguageDTO updateLanguage(String id, ProgrammingLanguageDTO dto);

    void deleteLanguage(String id);

    List<ProgrammingLanguageDTO> getTopLanguages();

    List<ProgrammingLanguageDTO> searchLanguages(String name);

    GraphDataDTO getSkillCoOccurrenceGraph(LocalDate startDate, LocalDate endDate);
}